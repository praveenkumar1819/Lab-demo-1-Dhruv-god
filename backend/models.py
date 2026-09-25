from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SecurityEvent(BaseModel):
    id: str
    timestamp: str
    event_type: str
    event_id: str
    user: str
    host: str
    source_ip: str
    destination_ip: Optional[str] = None
    action: Optional[str] = None
    result: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class Alert(BaseModel):
    id: str
    name: str
    severity: str  # "Low" or "Medium"
    status: str = "OPEN"  # OPEN, IN_PROGRESS, CLOSED, ESCALATED
    timestamp: str
    user: str
    host: str
    source_ip: str
    event_count: int = 1
    related_event_ids: List[str] = []
    description: str
    what_happened: Optional[str] = None
    why_generated: Optional[str] = None
    when_occurred: Optional[str] = None
    account_type: Optional[str] = "Standard Domain User"
    department: Optional[str] = "General"
    host_os: Optional[str] = "Windows 11 Enterprise"
    connection_info: Optional[str] = "Direct Internal Connection"
    failed_attempts: Optional[int] = 0
    decision: Optional[str] = None  # Suspicious, Benign, False Positive, Needs More Investigation
    classification_type: Optional[str] = None  # Expected Activity, Benign Activity, Detection Error
    notes: Optional[str] = ""

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    decision: Optional[str] = None
    classification_type: Optional[str] = None
    notes: Optional[str] = None

class Incident(BaseModel):
    id: str
    alert_id: str
    title: str
    severity: str  # Low, Medium
    status: str = "OPEN"  # OPEN, INVESTIGATING, RESOLVED
    affected_user: str
    affected_host: str
    source_ip: str
    created_at: str
    updated_at: str
    description: Optional[str] = None

class IncidentCreate(BaseModel):
    alert_id: str
    title: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = "OPEN"
    description: Optional[str] = None

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None

class Case(BaseModel):
    id: str
    incident_id: Optional[str] = None
    alert_id: Optional[str] = None
    title: str
    severity: str  # Low, Medium
    status: str = "OPEN"  # OPEN, IN_PROGRESS, CLOSED
    analyst: str = "L1 Analyst"
    notes: str = ""
    affected_user: Optional[str] = None
    affected_host: Optional[str] = None
    source_ip: Optional[str] = None
    iocs: List[str] = []
    timeline: List[Dict[str, Any]] = []
    final_decision: Optional[str] = None
    created_at: str
    updated_at: str

class CaseCreate(BaseModel):
    incident_id: Optional[str] = None
    alert_id: Optional[str] = None
    title: Optional[str] = None
    severity: Optional[str] = "Medium"
    analyst: Optional[str] = "L1 Analyst"
    notes: Optional[str] = ""
    iocs: Optional[List[str]] = []
    final_decision: Optional[str] = None

class CaseUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    analyst: Optional[str] = None
    notes: Optional[str] = None
    iocs: Optional[List[str]] = None
    final_decision: Optional[str] = None
