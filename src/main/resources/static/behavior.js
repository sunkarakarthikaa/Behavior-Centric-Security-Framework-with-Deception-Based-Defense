var BH = {
  keyDownTime:   {},
  keyHoldTimes:  [],   
  keyDownTimes:  [],   
  mouseSpeeds:   [],
  clickTimes:    [],
  lastMouseX:    null,
  lastMouseY:    null,
  lastMouseTime: null,

  baselineMode:  false,
  baselineSnaps: [],   
challengeActive: false,
mediumCooldownUntil: 0,
mediumCount: 0,
};

// ── Event Listeners ──────────────────────────────────────────!!!!!!!_---------------
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

// ── Compute metrics from raw data ────────────────────────────!!!!!!!!!!!!!!!!!!!!!!!----------------
window.computeMetrics = function() {
  
  var typingSpeed = 0;
  if (BH.keyDownTimes.length >= 2) {
    var span = (BH.keyDownTimes[BH.keyDownTimes.length-1] - BH.keyDownTimes[0]) / 1000;
    typingSpeed = span > 0 ? BH.keyDownTimes.length / span : 0;
  }

 
  var keyDelay = 200;
  if (BH.keyDownTimes.length >= 2) {
    var gaps = [];
    for (var i = 1; i < BH.keyDownTimes.length; i++) {
      gaps.push(BH.keyDownTimes[i] - BH.keyDownTimes[i-1]);
    }
    keyDelay = gaps.reduce(function(a,b){return a+b;},0) / gaps.length;
  }

 
  var keyHoldTime = 100;
  if (BH.keyHoldTimes.length > 0) {
    keyHoldTime = BH.keyHoldTimes.reduce(function(a,b){return a+b;},0) / BH.keyHoldTimes.length;
  }


var mouseSpeed = 0;
  if (BH.mouseSpeeds.length > 0) {
    mouseSpeed = BH.mouseSpeeds.reduce(function(a,b){return a+b;},0) / BH.mouseSpeeds.length;
  }

  var clickInterval = 0;   // ← changed from 1000 to 0 so backend skips it when no clicks
  if (BH.clickTimes.length >= 2) {
    var cGaps = [];
    for (var j = 1; j < BH.clickTimes.length; j++) {
      cGaps.push(BH.clickTimes[j] - BH.clickTimes[j-1]);
    }
    clickInterval = cGaps.reduce(function(a,b){return a+b;},0) / cGaps.length;
  }

  
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


function resetAccumulators() {
  BH.keyHoldTimes  = [];
  BH.keyDownTimes  = [];
  BH.mouseSpeeds   = [];
  BH.clickTimes    = [];
}


function startBaseline() {
  BH.baselineMode  = true;
  BH.baselineSnaps = [];
  resetAccumulators();

  var el = document.getElementById("risk");
  if (el) el.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Recording...';

  alert("Baseline recording started. Type, click, and move your mouse normally for 30 seconds, then click Save Baseline.");
}


function stopBaseline() {
  if (!BH.baselineMode) {
    alert("Please click Set Baseline first.");
    return;
  }

 
  var snap = computeMetrics();

 
  if (BH.keyDownTimes.length < 3 && BH.baselineSnaps.length === 0) {
    alert("Not enough data. Please type more during baseline recording.");
    return;
  }

  BH.baselineSnaps.push(snap);
  BH.baselineMode = false;

  
  var baseline = averageSnaps(BH.baselineSnaps);
  sessionStorage.setItem("medsecure_baseline", JSON.stringify(baseline));
//session storage ------------------------------------!!!!!!!!---------
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


function sendBehavior() {
if (BH.challengeActive) {
  return;
}
  
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
// Skip inactivity windows !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

if (BH.keyDownTimes.length < 2) {
  console.log("Not enough keystrokes — skipping analysis");
  resetAccumulators();
  return;
}

  resetAccumulators();

  var payload = { current: current, baseline: baseline };

  console.log("Sending behavior:", payload);
//fetch api-------------------------------------------!!!!!!!!!!!------------------------
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
  res = res.toUpperCase();
  var el = document.getElementById("risk");
  if (!el) return;

  console.log("Risk response:", res);

  if (res.includes("HIGH")) {

    el.className = "risk-high";

    el.innerHTML =
      '<i class="fa-solid fa-shield-halved"></i> HIGH';

    window.location.href = "fake.html";

    return;
   }
    else if (res.includes("MEDIUM")) {
    
    BH.mediumCount++;
   if (BH.mediumCount >= 3) {

    BH.mediumCount = 0;

    el.className = "risk-high";

    el.innerHTML =
      '<i class="fa-solid fa-shield-halved"></i> HIGH';

    window.location.href = "fake.html";

    return;
}
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

  if (BH.challengeActive) return;

  BH.challengeActive = true;

  var ans = prompt("⚠️ Security Check: Enter verification keyword");

  if (ans) ans = ans.trim().toLowerCase();

  if (ans === "secure123") {
    var el = document.getElementById("risk");
    if (el) {
      el.className = "risk-low";
      el.innerHTML = '<i class="fa-solid fa-shield-halved"></i> LOW';
    }
    resetAccumulators();
    BH.challengeActive = false;
    alert("Verification successful ✔");
  } else {
    BH.challengeActive = false;
    alert("Verification failed! Logging out.");
    sessionStorage.removeItem("loggedIn");
    window.location.replace("login.html");
  }
}
BH.challengeActive = false;


// ── Start monitoring loop ────────────────────────────────────
setInterval(sendBehavior, 10000);