from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timezone
import uuid

from models import (
    SecurityEvent, Alert, AlertUpdate,
    Incident, IncidentCreate, IncidentUpdate,
    Case, CaseCreate, CaseUpdate
)
import database
from sample_data import KNOWLEDGE_CHECKS, LABS_DATA, USER_DIRECTORY, HOST_DIRECTORY, NETWORK_DIRECTORY

app = FastAPI(
    title="SOC L1 Training Platform API",
    description="Educational API simulating SOC Analyst L1 operations for Module 4",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    database.init_db()
    database.seed_initial_data(force=False)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

# ==========================================
# STATS (PAGE 1 - Dashboard Summary Cards)
# ==========================================
@app.get("/api/stats")
def get_dashboard_stats():
    return database.get_stats()

# ==========================================
# EVENTS (PAGE 2 - Raw Security Events)
# ==========================================
@app.get("/api/events", response_model=List[SecurityEvent])
def list_events(
    search: Optional[str] = Query(None, description="Search keyword"),
    user: Optional[str] = Query(None, description="Filter by user"),
    host: Optional[str] = Query(None, description="Filter by host"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    result: Optional[str] = Query(None, description="Filter by result")
):
    return database.get_all_events(
        search=search, user=user, host=host, event_type=event_type, result=result
    )

@app.get("/api/events/{event_id}", response_model=SecurityEvent)
def get_event(event_id: str):
    evt = database.get_event_by_id(event_id)
    if not evt:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
    return evt

@app.post("/api/events/ingest")
def ingest_events(payload: Union[List[Dict[str, Any]], Dict[str, Any]] = Body(...)):
    raw_list = payload if isinstance(payload, list) else [payload]
    result = database.ingest_events_batch(raw_list, clear_existing=False)
    return {
        "status": "success",
        "message": f"Ingested {result['ingested_events_count']} event(s). Generated {result['total_alerts_count']} alert(s).",
        "details": result
    }

# ==========================================
# ALERTS (PAGE 3 & PAGE 4 - Alerts & Triage)
# ==========================================
@app.get("/api/alerts", response_model=List[Alert])
def list_alerts(
    status: Optional[str] = Query(None, description="Filter by status (OPEN, IN_PROGRESS, CLOSED, ESCALATED)"),
    severity: Optional[str] = Query(None, description="Filter by severity (Low, Medium)")
):
    return database.get_alerts(status=status, severity=severity)

@app.get("/api/alerts/{alert_id}")
def get_alert_detail(alert_id: str):
    alert = database.get_alert_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    # Fetch full related events
    related_events = []
    for evt_id in alert.related_event_ids:
        evt = database.get_event_by_id(evt_id)
        if evt:
            related_events.append(evt)

    # Asset context
    user_context = USER_DIRECTORY.get(alert.user, {
        "account_type": alert.account_type or "Standard User",
        "department": alert.department or "General",
        "email": f"{alert.user.lower()}@enterprise.local",
        "risk_profile": "Standard"
    })
    host_context = HOST_DIRECTORY.get(alert.host, {
        "os": alert.host_os or "Windows 11 Enterprise",
        "ip": alert.source_ip,
        "role": "Corporate System",
        "criticality": "Medium"
    })
    net_context = NETWORK_DIRECTORY.get(alert.source_ip, {
        "type": "Internal LAN",
        "zone": "Internal Network",
        "threat_rep": "Neutral"
    })

    return {
        "alert": alert,
        "related_events": related_events,
        "user_context": user_context,
        "host_context": host_context,
        "network_context": net_context
    }

@app.patch("/api/alerts/{alert_id}", response_model=Alert)
def update_alert_triage(alert_id: str, updates: AlertUpdate):
    updated = database.update_alert(alert_id, updates.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return updated

# ==========================================
# INCIDENTS (PAGE 5 - Incident Response)
# ==========================================
@app.get("/api/incidents", response_model=List[Incident])
def list_incidents(status: Optional[str] = Query(None)):
    return database.get_incidents(status=status)

@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    inc = database.get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    linked_alert = database.get_alert_by_id(inc.alert_id)
    return {
        "incident": inc,
        "alert": linked_alert
    }

@app.post("/api/incidents", response_model=Incident)
def create_incident_from_alert(payload: IncidentCreate):
    alert = database.get_alert_by_id(payload.alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Referenced Alert {payload.alert_id} not found")

    existing_incidents = database.get_incidents()
    inc_num = len(existing_incidents) + 1
    inc_id = f"INC-{inc_num:03d}"
    now_iso = datetime.now(timezone.utc).isoformat()

    title = payload.title or f"Incident: {alert.name} ({alert.user} on {alert.host})"
    severity = payload.severity or alert.severity

    new_incident = Incident(
        id=inc_id,
        alert_id=alert.id,
        title=title,
        severity=severity,
        status=payload.status or "OPEN",
        affected_user=alert.user,
        affected_host=alert.host,
        source_ip=alert.source_ip,
        created_at=now_iso,
        updated_at=now_iso,
        description=payload.description or alert.description
    )
    database.create_incident(new_incident)

    # Set alert status to IN_PROGRESS or ESCALATED
    database.update_alert(alert.id, {"status": "IN_PROGRESS"})

    return new_incident

@app.patch("/api/incidents/{incident_id}", response_model=Incident)
def update_incident_status(incident_id: str, updates: IncidentUpdate):
    updated = database.update_incident(incident_id, updates.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return updated

# ==========================================
# CASES (PAGE 6 - Case Management)
# ==========================================
@app.get("/api/cases", response_model=List[Case])
def list_cases(status: Optional[str] = Query(None)):
    return database.get_cases(status=status)

@app.get("/api/cases/{case_id}")
def get_case_detail(case_id: str):
    case = database.get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    linked_incident = database.get_incident_by_id(case.incident_id) if case.incident_id else None
    alert_id = case.alert_id or (linked_incident.alert_id if linked_incident else None)
    linked_alert = database.get_alert_by_id(alert_id) if alert_id else None

    related_events = []
    if linked_alert:
        for evt_id in linked_alert.related_event_ids:
            evt = database.get_event_by_id(evt_id)
            if evt:
                related_events.append(evt)

    return {
        "case": case,
        "incident": linked_incident,
        "alert": linked_alert,
        "related_events": related_events
    }

@app.post("/api/cases", response_model=Case)
def create_case(payload: CaseCreate):
    existing_cases = database.get_cases()
    case_num = len(existing_cases) + 1
    case_id = f"CASE-{case_num:03d}"
    now_iso = datetime.now(timezone.utc).isoformat()

    user = "Unknown"
    host = "Unknown"
    source_ip = "Unknown"
    timeline = []
    iocs = payload.iocs or []

    if payload.alert_id:
        alert = database.get_alert_by_id(payload.alert_id)
        if alert:
            user = alert.user
            host = alert.host
            source_ip = alert.source_ip
            timeline.append({
                "time": alert.timestamp,
                "event": f"Alert triggered: {alert.name}",
                "detail": f"Severity: {alert.severity}, Count: {alert.event_count}"
            })
            if alert.source_ip and alert.source_ip not in iocs:
                iocs.append(f"IP: {alert.source_ip}")

    if payload.incident_id:
        inc = database.get_incident_by_id(payload.incident_id)
        if inc:
            user = inc.affected_user
            host = inc.affected_host
            source_ip = inc.source_ip
            timeline.append({
                "time": inc.created_at,
                "event": f"Incident Created: {inc.id}",
                "detail": inc.title
            })

    timeline.append({
        "time": now_iso,
        "event": "Case Opened by Analyst",
        "detail": f"Analyst assigned: {payload.analyst or 'L1 Analyst'}"
    })

    title = payload.title or f"Case: Investigation of {user} on {host}"

    new_case = Case(
        id=case_id,
        incident_id=payload.incident_id,
        alert_id=payload.alert_id,
        title=title,
        severity=payload.severity or "Medium",
        status="OPEN",
        analyst=payload.analyst or "L1 Analyst",
        notes=payload.notes or "",
        affected_user=user,
        affected_host=host,
        source_ip=source_ip,
        iocs=iocs,
        timeline=timeline,
        final_decision=payload.final_decision,
        created_at=now_iso,
        updated_at=now_iso
    )
    database.create_case(new_case)
    return new_case

@app.patch("/api/cases/{case_id}", response_model=Case)
def update_case_detail(case_id: str, updates: CaseUpdate):
    updated = database.update_case(case_id, updates.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return updated

# ==========================================
# RESET TRAINING ENVIRONMENT
# ==========================================
@app.post("/api/reset")
def reset_training_environment():
    database.seed_initial_data(force=True)
    return {
        "status": "success",
        "message": "Training environment successfully reset to default sample dataset."
    }

# ==========================================
# KNOWLEDGE CHECKS (PAGE 9)
# ==========================================
@app.get("/api/knowledge-checks")
def get_all_knowledge_checks():
    return KNOWLEDGE_CHECKS

# ==========================================
# LABS (PAGE 8)
# ==========================================
@app.get("/api/labs/{lab_id}")
def get_lab_details(lab_id: str):
    if lab_id not in LABS_DATA:
        raise HTTPException(status_code=404, detail="Lab not found")
    lab = LABS_DATA[lab_id]
    # Return without revealing rubric answers directly
    if lab_id == "lab1":
        return {
            "id": lab["id"],
            "title": lab["title"],
            "scenario": lab["scenario"],
            "alert_sample": lab["alert_sample"]
        }
    elif lab_id == "lab2":
        # Scenarios without 'correct' field revealed
        scenarios_blind = []
        for s in lab["scenarios"]:
            scenarios_blind.append({
                "id": s["id"],
                "title": s["title"],
                "description": s["description"]
            })
        return {
            "id": lab["id"],
            "title": lab["title"],
            "instructions": lab["instructions"],
            "scenarios": scenarios_blind
        }

@app.post("/api/labs/1/verify")
def verify_lab1_submission(submission: Dict[str, Any] = Body(...)):
    rubric = LABS_DATA["lab1"]["rubric"]
    results = {}
    score = 0
    total = 7

    # 1. User
    sub_user = str(submission.get("user", "")).strip().lower()
    correct_user = rubric["user"].lower()
    user_match = (sub_user == correct_user)
    if user_match: score += 1
    results["user"] = {
        "correct": user_match,
        "submitted": submission.get("user"),
        "expected": rubric["user"],
        "explanation": "The affected user is Finance01 as documented in the authentication telemetry."
    }

    # 2. Host
    sub_host = str(submission.get("host", "")).strip().lower()
    correct_host = rubric["host"].lower()
    host_match = (sub_host == correct_host)
    if host_match: score += 1
    results["host"] = {
        "correct": host_match,
        "submitted": submission.get("host"),
        "expected": rubric["host"],
        "explanation": "The workstation generating the logon events is FIN-PC-04."
    }

    # 3. Source IP
    sub_ip = str(submission.get("source_ip", "")).strip()
    ip_match = (sub_ip == rubric["source_ip"])
    if ip_match: score += 1
    results["source_ip"] = {
        "correct": ip_match,
        "submitted": submission.get("source_ip"),
        "expected": rubric["source_ip"],
        "explanation": "Source IP address is 10.10.20.15 (Finance workstation IP)."
    }

    # 4. Number of failed attempts
    try:
        sub_count = int(submission.get("failed_count", 0))
    except Exception:
        sub_count = 0
    count_match = (sub_count == rubric["failed_count"])
    if count_match: score += 1
    results["failed_count"] = {
        "correct": count_match,
        "submitted": sub_count,
        "expected": rubric["failed_count"],
        "explanation": "There are exactly 5 failed logon attempts (Event ID 4625: EVT001 through EVT005)."
    }

    # 5. Related evidence
    sub_evidence = str(submission.get("evidence", "")).strip()
    evidence_match = "4625" in sub_evidence or "4624" in sub_evidence or "failed" in sub_evidence.lower()
    if evidence_match: score += 1
    results["evidence"] = {
        "correct": evidence_match,
        "submitted": submission.get("evidence"),
        "expected": "Windows Event IDs 4625 (Failed Logon) and 4624 (Successful Logon)",
        "explanation": "Event 4625 captures failed authentication and Event 4624 captures subsequent successful authentication."
    }

    # 6. Severity
    sub_sev = str(submission.get("severity", "")).strip().capitalize()
    sev_match = (sub_sev == rubric["severity"])
    if sev_match: score += 1
    results["severity"] = {
        "correct": sev_match,
        "submitted": sub_sev,
        "expected": rubric["severity"],
        "explanation": "Multiple failed attempts in rapid succession followed by success warrants Medium severity in Module 4."
    }

    # 7. Final Decision
    sub_decision = str(submission.get("final_decision", "")).strip().lower()
    dec_match = sub_decision in ["suspicious", "needs more investigation"]
    if dec_match: score += 1
    results["final_decision"] = {
        "correct": dec_match,
        "submitted": submission.get("final_decision"),
        "expected": "Suspicious (or Needs More Investigation)",
        "explanation": "Repeated failed attempts followed by a success could indicate successful password brute-forcing or an employee having credential trouble. It requires validation."
    }

    passed = score >= 5
    return {
        "score": score,
        "total": total,
        "passed": passed,
        "feedback": "Outstanding triage work!" if passed else "Review the event logs and retry!",
        "field_results": results
    }

@app.post("/api/labs/2/verify")
def verify_lab2_submission(answers: Dict[str, str] = Body(...)):
    scenarios = LABS_DATA["lab2"]["scenarios"]
    results = {}
    score = 0
    total = len(scenarios)

    for s in scenarios:
        sid = s["id"]
        submitted = str(answers.get(sid, "")).strip().upper()
        correct = s["correct"].upper()
        is_correct = (submitted == correct)
        if is_correct:
            score += 1
        results[sid] = {
            "title": s["title"],
            "submitted": submitted or "Not Answered",
            "correct": correct,
            "is_correct": is_correct,
            "explanation": s["explanation"]
        }

    return {
        "score": score,
        "total": total,
        "passed": score == total,
        "results": results
    }
