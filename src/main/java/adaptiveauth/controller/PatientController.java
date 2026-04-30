package adaptiveauth.controller;

import adaptiveauth.entity.Patient;
import adaptiveauth.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@CrossOrigin
public class PatientController {

    @Autowired
    private PatientService service;

    @GetMapping
    public List<Patient> getAll() {
        return service.getAll();
    }

    @PostMapping
    public void add(@RequestBody Patient p) {
        service.add(p);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable String id, @RequestBody Patient p) {
        service.update(id, p);
    }

    @PutMapping("/action/{id}")
    public void updateAction(@PathVariable String id, @RequestBody Patient updated) {

    Patient p = service.getById(id);

    if (p != null) {
        p.actionNote = updated.actionNote;
        service.add(p);
    }
}

}