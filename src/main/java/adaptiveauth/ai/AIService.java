package adaptiveauth.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import okhttp3.*;
import java.io.IOException;

@Service
public class AIService {

    @Value("${openai.api.key}")
    private String apiKey;

    private final OkHttpClient client = new OkHttpClient();

    public String decide(double score, String level) {

    //can be replaced with real ML or OpenAI
    if (level.equals("LOW")) {
        return "ALLOW: Behavior normal";
    }

    if (level.equals("MEDIUM")) {
        return "CHALLENGE: Enter OTP or re-verify";
    }

    return "BLOCK: Redirecting to fake dashboard";
}

}