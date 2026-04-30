package adaptiveauth.controller;

import adaptiveauth.entity.BaselineProfile;
import adaptiveauth.repository.BaselineRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/baseline")
@CrossOrigin(origins = "*")
public class BaselineController {

    @Autowired
    private BaselineRepository repository;

    @GetMapping("/{username}")
    public BaselineProfile getBaseline(
            @PathVariable String username
    ){
        return repository.findByUsername(username);
    }
}