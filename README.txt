1)Open VS Code → terminal
mvn spring-boot:run
Check : http://localhost:8080/test -> should work 
2)Start MongoDB
Open MongoDB Compass
Connect: mongodb://localhost:27017
You should see DB: medsecure
3)Verify Patients API
Use Postman
Get Patients : 
GET http://localhost:8080/patients
Should return []
Add Patient : 
POST http://localhost:8080/patients
{
  "name": "John",
  "age": 30,
  "room": "ICU",
  "doctor": "Dr. Smith",
  "operationDate": "2026-04-10",
  "dischargeDate": ""
}
Then use GET again to show the data 
U can even see in patients page 
4)Open Frontend 
And test 
5)Test System Behaviour 
Start typing + moving mouse
First few seconds: Initializing…
This is baseline setting 
Then check behaviour and console 
