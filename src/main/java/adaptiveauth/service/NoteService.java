package adaptiveauth.service;

import adaptiveauth.entity.Note;
import adaptiveauth.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    @Autowired
    private NoteRepository repo;

    public Note save(Note n){
        return repo.save(n);
    }

    public List<Note> getAll(){
        return repo.findAll();
    }
}