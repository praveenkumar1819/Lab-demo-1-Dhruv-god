import sqlite3
import json
import os
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from models import SecurityEvent, Alert, Incident, Case
from rules_engine import evaluate_rules

DB_PATH = os.path.join(os.path.dirname(__file__), "soc_training.db")
DEFAULT_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "events.json")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        event_type TEXT,
        event_id TEXT,
        user TEXT,
        host TEXT,
        source_ip TEXT,
        destination_ip TEXT,
        action TEXT,
        result TEXT,
        description TEXT,
        source TEXT,
        metadata TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        name TEXT,
        severity TEXT,
        status TEXT,
        timestamp TEXT,
        user TEXT,
        host TEXT,
        source_ip TEXT,
        event_count INTEGER,
        related_event_ids TEXT,
        description TEXT,
        what_happened TEXT,
        why_generated TEXT,
        when_occurred TEXT,
        account_type TEXT,
        department TEXT,
        host_os TEXT,
        connection_info TEXT,
        failed_attempts INTEGER,
        decision TEXT,
        classification_type TEXT,
        notes TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        alert_id TEXT,
        title TEXT,
        severity TEXT,
        status TEXT,
        affected_user TEXT,
        affected_host TEXT,
        source_ip TEXT,
        created_at TEXT,
        updated_at TEXT,
        description TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        incident_id TEXT,
        alert_id TEXT,
        title TEXT,
        severity TEXT,
        status TEXT,
        analyst TEXT,
        notes TEXT,
        affected_user TEXT,
        affected_host TEXT,
        source_ip TEXT,
        iocs TEXT,
        timeline TEXT,
        final_decision TEXT,
        created_at TEXT,
        updated_at TEXT
    )
    """)

    conn.commit()
    conn.close()

def seed_initial_data(force: bool = False):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM events")
    count = cursor.fetchone()[0]
    conn.close()

    if count == 0 or force:
        if os.path.exists(DEFAULT_DATA_PATH):
            with open(DEFAULT_DATA_PATH, "r", encoding="utf-8") as f:
                events_raw = json.load(f)
                ingest_events_batch(events_raw, clear_existing=force)

def ingest_events_batch(raw_events: List[Dict[str, Any]], clear_existing: bool = False) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()

    if clear_existing:
        cursor.execute("DELETE FROM events")
        cursor.execute("DELETE FROM alerts")
        cursor.execute("DELETE FROM incidents")
        cursor.execute("DELETE FROM cases")
        conn.commit()

    saved_events: List[SecurityEvent] = []
    for item in raw_events:
        evt = SecurityEvent(**item)
        saved_events.append(evt)
        cursor.execute("""
        INSERT OR REPLACE INTO events (
            id, timestamp, event_type, event_id, user, host, source_ip,
            destination_ip, action, result, description, source, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            evt.id, evt.timestamp, evt.event_type, evt.event_id, evt.user, evt.host,
            evt.source_ip, evt.destination_ip, evt.action, evt.result, evt.description,
            evt.source, json.dumps(evt.metadata or {})
        ))
    conn.commit()
    conn.close()

    # Now fetch all events to run detection rules
    all_events = get_all_events()
    generated_alerts = evaluate_rules(all_events)

    conn = get_connection()
    cursor = conn.cursor()
    for alert in generated_alerts:
        cursor.execute("""
        INSERT OR REPLACE INTO alerts (
            id, name, severity, status, timestamp, user, host, source_ip,
            event_count, related_event_ids, description, what_happened,
            why_generated, when_occurred, account_type, department,
            host_os, connection_info, failed_attempts, decision,
            classification_type, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alert.id, alert.name, alert.severity, alert.status, alert.timestamp,
            alert.user, alert.host, alert.source_ip, alert.event_count,
            json.dumps(alert.related_event_ids), alert.description,
            alert.what_happened, alert.why_generated, alert.when_occurred,
            alert.account_type, alert.department, alert.host_os,
            alert.connection_info, alert.failed_attempts, alert.decision,
            alert.classification_type, alert.notes
        ))
    conn.commit()
    conn.close()

    return {
        "ingested_events_count": len(saved_events),
        "total_alerts_count": len(generated_alerts)
    }

def get_all_events(
    search: Optional[str] = None,
    user: Optional[str] = None,
    host: Optional[str] = None,
    event_type: Optional[str] = None,
    result: Optional[str] = None
) -> List[SecurityEvent]:
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM events WHERE 1=1"
    params = []

    if user:
        query += " AND user = ?"
        params.append(user)
    if host:
        query += " AND host = ?"
        params.append(host)
    if event_type:
        query += " AND event_type = ?"
        params.append(event_type)
    if result:
        query += " AND result = ?"
        params.append(result)
    if search:
        s = f"%{search}%"
        query += " AND (id LIKE ? OR user LIKE ? OR host LIKE ? OR source_ip LIKE ? OR description LIKE ? OR event_id LIKE ?)"
        params.extend([s, s, s, s, s, s])

    query += " ORDER BY timestamp ASC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result_list = []
    for r in rows:
        d = dict(r)
        d["metadata"] = json.loads(d["metadata"]) if d["metadata"] else {}
        result_list.append(SecurityEvent(**d))
    return result_list

def get_event_by_id(event_id: str) -> Optional[SecurityEvent]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["metadata"] = json.loads(d["metadata"]) if d["metadata"] else {}
    return SecurityEvent(**d)

def get_alerts(status: Optional[str] = None, severity: Optional[str] = None) -> List[Alert]:
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM alerts WHERE 1=1"
    params = []
    if status and status.upper() != "ALL":
        query += " AND status = ?"
        params.append(status.upper())
    if severity and severity.capitalize() != "All":
        query += " AND severity = ?"
        params.append(severity.capitalize())

    query += " ORDER BY timestamp DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    alerts = []
    for r in rows:
        d = dict(r)
        d["related_event_ids"] = json.loads(d["related_event_ids"]) if d["related_event_ids"] else []
        alerts.append(Alert(**d))
    return alerts

def get_alert_by_id(alert_id: str) -> Optional[Alert]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["related_event_ids"] = json.loads(d["related_event_ids"]) if d["related_event_ids"] else []
    return Alert(**d)

def update_alert(alert_id: str, updates: Dict[str, Any]) -> Optional[Alert]:
    conn = get_connection()
    cursor = conn.cursor()

    allowed = ["status", "severity", "decision", "classification_type", "notes"]
    set_clauses = []
    params = []

    for k in allowed:
        if k in updates and updates[k] is not None:
            set_clauses.append(f"{k} = ?")
            params.append(updates[k])

    if not set_clauses:
        conn.close()
        return get_alert_by_id(alert_id)

    params.append(alert_id)
    cursor.execute(f"UPDATE alerts SET {', '.join(set_clauses)} WHERE id = ?", params)
    conn.commit()
    conn.close()
    return get_alert_by_id(alert_id)

def get_incidents(status: Optional[str] = None) -> List[Incident]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM incidents WHERE 1=1"
    params = []
    if status and status.upper() != "ALL":
        query += " AND status = ?"
        params.append(status.upper())
    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [Incident(**dict(r)) for r in rows]

def get_incident_by_id(inc_id: str) -> Optional[Incident]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents WHERE id = ?", (inc_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return Incident(**dict(row))

def create_incident(inc: Incident) -> Incident:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO incidents (
        id, alert_id, title, severity, status, affected_user,
        affected_host, source_ip, created_at, updated_at, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        inc.id, inc.alert_id, inc.title, inc.severity, inc.status,
        inc.affected_user, inc.affected_host, inc.source_ip,
        inc.created_at, inc.updated_at, inc.description
    ))
    conn.commit()
    conn.close()
    return inc

def update_incident(inc_id: str, updates: Dict[str, Any]) -> Optional[Incident]:
    conn = get_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()

    allowed = ["status", "severity", "description"]
    set_clauses = ["updated_at = ?"]
    params = [now_iso]

    for k in allowed:
        if k in updates and updates[k] is not None:
            set_clauses.append(f"{k} = ?")
            params.append(updates[k])

    params.append(inc_id)
    cursor.execute(f"UPDATE incidents SET {', '.join(set_clauses)} WHERE id = ?", params)
    conn.commit()
    conn.close()
    return get_incident_by_id(inc_id)

def get_cases(status: Optional[str] = None) -> List[Case]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM cases WHERE 1=1"
    params = []
    if status and status.upper() != "ALL":
        query += " AND status = ?"
        params.append(status.upper())
    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    cases = []
    for r in rows:
        d = dict(r)
        d["iocs"] = json.loads(d["iocs"]) if d["iocs"] else []
        d["timeline"] = json.loads(d["timeline"]) if d["timeline"] else []
        cases.append(Case(**d))
    return cases

def get_case_by_id(case_id: str) -> Optional[Case]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["iocs"] = json.loads(d["iocs"]) if d["iocs"] else []
    d["timeline"] = json.loads(d["timeline"]) if d["timeline"] else []
    return Case(**d)

def create_case(c: Case) -> Case:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO cases (
        id, incident_id, alert_id, title, severity, status, analyst,
        notes, affected_user, affected_host, source_ip, iocs,
        timeline, final_decision, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        c.id, c.incident_id, c.alert_id, c.title, c.severity, c.status,
        c.analyst, c.notes, c.affected_user, c.affected_host, c.source_ip,
        json.dumps(c.iocs), json.dumps(c.timeline), c.final_decision,
        c.created_at, c.updated_at
    ))
    conn.commit()
    conn.close()
    return c

def update_case(case_id: str, updates: Dict[str, Any]) -> Optional[Case]:
    conn = get_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()

    allowed = ["status", "severity", "analyst", "notes", "iocs", "final_decision"]
    set_clauses = ["updated_at = ?"]
    params = [now_iso]

    for k in allowed:
        if k in updates and updates[k] is not None:
            if k == "iocs":
                set_clauses.append("iocs = ?")
                params.append(json.dumps(updates[k]))
            else:
                set_clauses.append(f"{k} = ?")
                params.append(updates[k])

    params.append(case_id)
    cursor.execute(f"UPDATE cases SET {', '.join(set_clauses)} WHERE id = ?", params)
    conn.commit()
    conn.close()
    return get_case_by_id(case_id)

def get_stats() -> Dict[str, int]:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM events")
    total_events = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM alerts WHERE status = 'OPEN'")
    open_alerts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM alerts WHERE severity = 'Medium'")
    medium_alerts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM alerts WHERE severity = 'Low'")
    low_alerts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM incidents WHERE status != 'RESOLVED'")
    open_incidents = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM cases WHERE status != 'CLOSED'")
    open_cases = cursor.fetchone()[0]

    conn.close()

    return {
        "total_events": total_events,
        "open_alerts": open_alerts,
        "medium_alerts": medium_alerts,
        "low_alerts": low_alerts,
        "open_incidents": open_incidents,
        "open_cases": open_cases
    }
