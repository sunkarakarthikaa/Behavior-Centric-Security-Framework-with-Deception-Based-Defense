package adaptiveauth.service;

import adaptiveauth.entity.Patient;
import adaptiveauth.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    @Autowired
    private PatientRepository repo;

    public List<Patient> getAll() {
        return repo.findAll();
    }

    public void add(Patient p) {
        repo.save(p);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }

    public void update(String id, Patient p) {
        p.id = id;
        repo.save(p);
    }

public void updateAction(String id, String note) {
    Patient p = repo.findById(id).orElse(null);

    if (p != null) {
        p.actionNote = note;
        repo.save(p);
    }
}

public Patient getById(String id){
    return repo.findById(id).orElse(null);
}

}