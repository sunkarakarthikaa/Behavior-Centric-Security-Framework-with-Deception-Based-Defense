package adaptiveauth.service;

import adaptiveauth.dto.BehaviorDataDTO;
import adaptiveauth.entity.BaselineProfile;
import adaptiveauth.entity.RiskLog;
import adaptiveauth.repository.BaselineRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BaselineService {

    @Autowired
    private BaselineRepository repo;

    private List<RiskLog> logs = new ArrayList<>();

    // SAVE BASELINE
    public void setBaseline(BehaviorDataDTO data){

        repo.deleteAll();

        BaselineProfile b = new BaselineProfile();

        b.typingSpeed = data.typingSpeed;
        b.keyDelay = data.keyDelay;
        b.keyHoldTime = data.keyHoldTime;
        b.mouseSpeed = data.mouseSpeed;
        b.clickInterval = data.clickInterval;
        b.typingConsistency = data.typingConsistency;

        repo.save(b);
    }

    // GET BASELINE
    public BehaviorDataDTO getBaseline(){

        List<BaselineProfile> list = repo.findAll();

        if(list.isEmpty()) return null;

        BaselineProfile b = list.get(0);

        BehaviorDataDTO dto = new BehaviorDataDTO();

        dto.typingSpeed = b.typingSpeed;
        dto.keyDelay = b.keyDelay;
        dto.keyHoldTime = b.keyHoldTime;
        dto.mouseSpeed = b.mouseSpeed;
        dto.clickInterval = b.clickInterval;
        dto.typingConsistency = b.typingConsistency;

        return dto;
    }

    public boolean isBaselineSet(){
        return !repo.findAll().isEmpty();
    }

    // LOGS
    public void addLog(RiskLog log){
        logs.add(log);
    }

    public List<RiskLog> getLogs(){
        return logs;
    }
}