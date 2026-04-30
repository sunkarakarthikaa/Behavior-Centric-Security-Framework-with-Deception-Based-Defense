package adaptiveauth.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "patients")
public class Patient {

    @Id
    public String id;
    public String actionNote;

    public String name;
    public int age;
    public String room;
    public String doctor;
    public String operationDate;
    public String dischargeDate;
}