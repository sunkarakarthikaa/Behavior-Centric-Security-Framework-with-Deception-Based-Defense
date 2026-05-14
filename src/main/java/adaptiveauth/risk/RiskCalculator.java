package adaptiveauth.risk;

import adaptiveauth.dto.BehaviorDataDTO;
import org.springframework.stereotype.Component;

@Component
public class RiskCalculator {

    private double deviation(double current, double baseline){

    if(baseline == 0) return 0;

    double diff =
        Math.abs(current - baseline) / baseline;

    return Math.min(diff, 1.0);
}

    public double calculateRiskScore(
        BehaviorDataDTO current,
        BehaviorDataDTO base
){

    double typingDeviation =
    deviation(current.typingSpeed,
              base.typingSpeed);

    double keyDelayDeviation =
        deviation(current.keyDelay,
                  base.keyDelay);

    double holdDeviation =
        deviation(current.keyHoldTime,
                  base.keyHoldTime);

    double mouseDeviation =
        deviation(current.mouseSpeed,
                  base.mouseSpeed);

    double consistencyDeviation =
        deviation(current.typingConsistency,
                  base.typingConsistency);

    double composite =
            (0.30 * typingDeviation)
          + (0.25 * keyDelayDeviation)
          + (0.20 * holdDeviation)
          + (0.10 * mouseDeviation)
          + (0.15 * consistencyDeviation);

    return composite;
}

public String getRiskLevel(double score){

    if(score >= 0.35){
        return "MEDIUM";
    }

    return "LOW";
}
}