package adaptiveauth.controller;

import adaptiveauth.dto.BehaviorDataDTO;
import adaptiveauth.dto.BehaviorRequestDTO;
import adaptiveauth.risk.RiskCalculator;
import adaptiveauth.entity.RiskLog;
import adaptiveauth.ai.AIService;
import adaptiveauth.service.LogService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/behavior")
@CrossOrigin(origins = "*")
public class BehaviorController {

    @Autowired
    private AIService aiService;

    @Autowired
    private RiskCalculator riskCalculator;

@Autowired
private LogService logService;

    // ✅ Analyze behavior
    @PostMapping("/analyze")
    public String analyze(@RequestBody BehaviorRequestDTO request) {

        BehaviorDataDTO current = request.current;
BehaviorDataDTO baseline = request.baseline;
System.out.println("CURRENT: " + current.typingSpeed + " | " + current.keyDelay + " | " + current.keyHoldTime + " | " + current.mouseSpeed + " | " + current.clickInterval);
    System.out.println("BASELINE: " + baseline.typingSpeed + " | " + baseline.keyDelay + " | " + baseline.keyHoldTime + " | " + baseline.mouseSpeed + " | " + baseline.clickInterval);

double score = riskCalculator.calculateRiskScore(
        current,
        baseline
);

String level = riskCalculator.getRiskLevel(score);

String decision = aiService.decide(score, level);

// ✅ log
RiskLog log = new RiskLog();
log.timestamp = LocalDateTime.now().toString();
log.score = score;
log.level = level;
log.decision = decision;

logService.addLog(log);

return "Score: " + String.format("%.2f", score)
        + " | Level: " + level
        + " | Decision: " + decision;
}

    // ✅ Get logs
    @GetMapping("/logs")
    public List<RiskLog> getLogs() {
        return logService.getLogs();
    }
} 