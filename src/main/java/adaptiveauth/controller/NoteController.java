package adaptiveauth.controller;

import adaptiveauth.entity.Note;
import adaptiveauth.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
@CrossOrigin
public class NoteController {

    @Autowired
    private NoteService service;

    @PostMapping
    public Note save(@RequestBody Note n){
        return service.save(n);
    }

    @GetMapping
    public List<Note> getAll(){
        return service.getAll();
    }
}