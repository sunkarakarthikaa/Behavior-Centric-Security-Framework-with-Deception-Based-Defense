package adaptiveauth.service;

import adaptiveauth.entity.RiskLog;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LogService {

    private List<RiskLog> logs = new ArrayList<>();

    public void addLog(RiskLog log){
        logs.add(log);
    }

    public List<RiskLog> getLogs(){
        return logs;
    }
}