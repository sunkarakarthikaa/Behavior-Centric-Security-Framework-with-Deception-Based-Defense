package adaptiveauth.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "baseline")
public class BaselineProfile {

    @Id
    public String id;

    public double typingSpeed;
    public double keyDelay;
    public double keyHoldTime;
    public double mouseSpeed;
    public double clickInterval;
    public double typingConsistency;
}