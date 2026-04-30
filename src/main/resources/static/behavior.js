// ============================================================
// behavior.js — Single source of truth for MedSecure
// Include this on every protected page via <script src="behavior.js">
// ============================================================

// ── State ────────────────────────────────────────────────────
var BH = {
  keyDownTime:   {},
  keyHoldTimes:  [],   // hold durations (ms)
  keyDownTimes:  [],   // timestamps of keydown events
  mouseSpeeds:   [],
  clickTimes:    [],
  lastMouseX:    null,
  lastMouseY:    null,
  lastMouseTime: null,

  baselineMode:  false,
  baselineSnaps: [],   // snapshots collected during recording
};

// ── Event Listeners ──────────────────────────────────────────
document.addEventListener("keydown", function(e) {
  BH.keyDownTime[e.key] = Date.now();
  BH.keyDownTimes.push(Date.now());
});

document.addEventListener("keyup", function(e) {
  var now = Date.now();
  if (BH.keyDownTime[e.key]) {
    BH.keyHoldTimes.push(now - BH.keyDownTime[e.key]);
    delete BH.keyDownTime[e.key];
  }
});

document.addEventListener("mousemove", function(e) {
  var now = Date.now();
  if (BH.lastMouseX !== null && BH.lastMouseTime !== null) {
    var dx = e.clientX - BH.lastMouseX;
    var dy = e.clientY - BH.lastMouseY;
    var dt = now - BH.lastMouseTime;
    if (dt > 0) {
      var speed = Math.sqrt(dx*dx + dy*dy) / dt; // px/ms
      BH.mouseSpeeds.push(speed);
    }
  }
  BH.lastMouseX = e.clientX;
  BH.lastMouseY = e.clientY;
  BH.lastMouseTime = now;
});

document.addEventListener("click", function() {
  BH.clickTimes.push(Date.now());
});

// ── Compute metrics from raw data ────────────────────────────
window.computeMetrics = function() {
  // typingSpeed: keys per second (needs at least 2 keydowns)
  var typingSpeed = 0;
  if (BH.keyDownTimes.length >= 2) {
    var span = (BH.keyDownTimes[BH.keyDownTimes.length-1] - BH.keyDownTimes[0]) / 1000;
    typingSpeed = span > 0 ? BH.keyDownTimes.length / span : 0;
  }

  // keyDelay: avg gap between consecutive keydowns (ms)
  var keyDelay = 200;
  if (BH.keyDownTimes.length >= 2) {
    var gaps = [];
    for (var i = 1; i < BH.keyDownTimes.length; i++) {
      gaps.push(BH.keyDownTimes[i] - BH.keyDownTimes[i-1]);
    }
    keyDelay = gaps.reduce(function(a,b){return a+b;},0) / gaps.length;
  }

  // keyHoldTime: avg hold duration (ms)
  var keyHoldTime = 100;
  if (BH.keyHoldTimes.length > 0) {
    keyHoldTime = BH.keyHoldTimes.reduce(function(a,b){return a+b;},0) / BH.keyHoldTimes.length;
  }

  // mouseSpeed: avg px/ms
  var mouseSpeed = 0;
  if (BH.mouseSpeeds.length > 0) {
    mouseSpeed = BH.mouseSpeeds.reduce(function(a,b){return a+b;},0) / BH.mouseSpeeds.length;
  }

  // clickInterval: avg ms between clicks
  var clickInterval = 1000;
  if (BH.clickTimes.length >= 2) {
    var cGaps = [];
    for (var j = 1; j < BH.clickTimes.length; j++) {
      cGaps.push(BH.clickTimes[j] - BH.clickTimes[j-1]);
    }
    clickInterval = cGaps.reduce(function(a,b){return a+b;},0) / cGaps.length;
  }

  // typingConsistency: std dev of keyDelay gaps (lower = more consistent)
  var typingConsistency = 0;
  if (BH.keyDownTimes.length >= 3) {
    var dGaps = [];
    for (var k = 1; k < BH.keyDownTimes.length; k++) {
      dGaps.push(BH.keyDownTimes[k] - BH.keyDownTimes[k-1]);
    }
    var avg = dGaps.reduce(function(a,b){return a+b;},0) / dGaps.length;
    var variance = dGaps.reduce(function(a,b){return a + Math.pow(b-avg,2);},0) / dGaps.length;
    typingConsistency = Math.sqrt(variance);
  }

  return { typingSpeed, keyDelay, keyHoldTime, mouseSpeed, clickInterval, typingConsistency };
}

// ── Reset accumulators (after each send window) ──────────────
function resetAccumulators() {
  BH.keyHoldTimes  = [];
  BH.keyDownTimes  = [];
  BH.mouseSpeeds   = [];
  BH.clickTimes    = [];
}

// ── Baseline: Start ──────────────────────────────────────────
function startBaseline() {
  BH.baselineMode  = true;
  BH.baselineSnaps = [];
  resetAccumulators();

  var el = document.getElementById("risk");
  if (el) el.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Recording...';

  alert("Baseline recording started. Type, click, and move your mouse normally for 30 seconds, then click Save Baseline.");
}

// ── Baseline: Stop & Save ────────────────────────────────────
function stopBaseline() {
  if (!BH.baselineMode) {
    alert("Please click Set Baseline first.");
    return;
  }

  // Capture the current window as final snapshot
  var snap = computeMetrics();

  // Need meaningful data — at least 3 keystrokes
  if (BH.keyDownTimes.length < 3 && BH.baselineSnaps.length === 0) {
    alert("Not enough data. Please type more during baseline recording.");
    return;
  }

  BH.baselineSnaps.push(snap);
  BH.baselineMode = false;

  // Average all snapshots into one baseline
  var baseline = averageSnaps(BH.baselineSnaps);
  sessionStorage.setItem("medsecure_baseline", JSON.stringify(baseline));

  resetAccumulators();

  var el = document.getElementById("risk");
  if (el) el.innerHTML = '<i class="fa-solid fa-shield-halved"></i> LOW';

  alert("✅ Baseline saved! Monitoring is now active.");
  console.log("Baseline saved:", baseline);
}

function averageSnaps(snaps) {
  var keys = ["typingSpeed","keyDelay","keyHoldTime","mouseSpeed","clickInterval","typingConsistency"];
  var result = {};
  keys.forEach(function(k) {
    result[k] = snaps.reduce(function(a,b){return a + b[k];},0) / snaps.length;
  });
  return result;
}

// ── Send behavior for risk check ─────────────────────────────
function sendBehavior() {
  // If in baseline recording mode, capture a snapshot every interval
  if (BH.baselineMode) {
    var snap = computeMetrics();
    if (BH.keyDownTimes.length >= 2) {
      BH.baselineSnaps.push(snap);
    }
    resetAccumulators();
    return;
  }

  var baseline = null;
  try {
    baseline = JSON.parse(sessionStorage.getItem("medsecure_baseline"));
  } catch(e) {}

  if (!baseline) {
    console.log("No baseline set yet — skipping risk check.");
    return;
  }

  var current = computeMetrics();

  // FIX: Don't exit if keys < 5. Send whatever we have.
  // If there's truly zero interaction, mouseSpeed and clickInterval
  // will naturally show anomaly vs baseline anyway.
  resetAccumulators();

  var payload = { current: current, baseline: baseline };

  console.log("Sending behavior:", payload);

  fetch("http://localhost:8080/behavior/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(function(res){ return res.text(); })
  .then(function(res){ handleRisk(res); })
  .catch(function(err){ console.error("Behavior send error:", err); });
}

// ── Handle risk response ─────────────────────────────────────
function handleRisk(res) {
  var el = document.getElementById("risk");
  if (!el) return;

  console.log("Risk response:", res);

  if (res.includes("HIGH")) {
    el.className = "risk-high";
    el.innerHTML = '<i class="fa-solid fa-shield-halved"></i> HIGH';
    window.location.href = "fake.html";
  } else if (res.includes("MEDIUM")) {
    el.className = "risk-medium";
    el.innerHTML = '<i class="fa-solid fa-shield-halved"></i> MEDIUM';
    showChallenge();
  } else {
    el.className = "risk-low";
    el.innerHTML = '<i class="fa-solid fa-shield-halved"></i> LOW';
  }
}

// ── Challenge popup ──────────────────────────────────────────
function showChallenge() {
  var ans = prompt("⚠️ Security Check: Enter verification keyword");
  if (ans !== "secure123") {
    alert("Verification failed! Logging out.");
    sessionStorage.removeItem("loggedIn");
    window.location.replace("login.html");
  }
}

// ── Start monitoring loop ────────────────────────────────────
setInterval(sendBehavior, 10000);