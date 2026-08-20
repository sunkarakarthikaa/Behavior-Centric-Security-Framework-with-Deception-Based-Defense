Behavior-Centric Security Framework with Deception-Based Defense

A continuous authentication system for healthcare applications that verifies who's actually typing, not just who logged in. Traditional login checks identity once at the door; this system keeps checking silently in the background using behavioral biometrics — so a stolen session or hijacked credential doesn't automatically mean unauthorized access.

Core idea: Every user has a typing "fingerprint" — typing speed, key delay, keystroke hold time. The system builds a baseline profile per user, then compares live typing behavior against that baseline in real time. Large deviations trigger a risk-based response instead of a blunt logout.

How it works
Frontend telemetry pipeline — captures keystroke timing data (speed, delay, hold time) and samples it every 5 seconds during an active session, sending it to the backend for evaluation.
Risk scoring engine — computes deviation from the user's baseline behavior profile and classifies the current session as LOW / MEDIUM / HIGH risk.
Automated response layer:
LOW risk → session continues normally
MEDIUM risk → step-up authentication via OTP challenge
HIGH risk → silent honeypot redirection — the suspected intruder is routed to a decoy environment without knowing they've been flagged, while the legitimate session/data stays protected

This deception-based response is the key differentiator: instead of alerting an attacker that they've been caught (which just makes them switch tactics), the system quietly isolates them.

Application layer

Built on top of this is a full-stack healthcare dashboard — patient CRUD, clinical notes, and appointment management — implemented as a layered Spring Boot architecture (Controller → Service → Repository), giving the behavioral auth system a realistic, sensitive-data context to protect (healthcare data is a natural fit given HIPAA-style stakes around unauthorized access).

Tech Stack
Backend: Java, Spring Boot (Controller-Service-Repository layering)
Database: MongoDB
Frontend: JavaScript (telemetry capture + dashboard)
Key Engineering Highlights
Real-time behavioral deviation scoring rather than static, one-time authentication
Tiered, automated risk response instead of binary allow/deny
Honeypot-based deception defense — attacker isolation without detection alerting
Realistic domain application (healthcare CRUD + clinical workflows) rather than a toy demo
