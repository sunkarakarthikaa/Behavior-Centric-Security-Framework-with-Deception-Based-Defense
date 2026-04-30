package adaptiveauth.risk;

import adaptiveauth.dto.BehaviorDataDTO;
import org.springframework.stereotype.Component;

@Component
public class RiskCalculator {

    private int getScore(double current, double baseline) {
    // Guard: if baseline is 0, skip this metric
    if (baseline == 0) return 0;
    
    double diff = Math.abs(current - baseline) / baseline * 100;
    if (diff < 20) return 0;
    else if (diff < 40) return 1;
    else return 2;
}

    public int calculateRiskScore(BehaviorDataDTO current, BehaviorDataDTO base) {

        int score = 0;

        score += getScore(current.typingSpeed, base.typingSpeed);
        score += getScore(current.keyDelay, base.keyDelay);
        score += getScore(current.keyHoldTime, base.keyHoldTime);
        score += getScore(current.mouseSpeed, base.mouseSpeed);
        score += getScore(current.clickInterval, base.clickInterval);

        return score;
    }

    public String getRiskLevel(int score) {

        if (score <= 2) return "LOW";
        else if (score <= 6) return "MEDIUM";
        else return "HIGH";
    }
}