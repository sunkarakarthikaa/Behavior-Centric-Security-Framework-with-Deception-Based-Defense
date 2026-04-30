package adaptiveauth.repository;

import adaptiveauth.entity.BaselineProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BaselineRepository
        extends MongoRepository<BaselineProfile, String> {

    BaselineProfile findByUsername(String username);
}