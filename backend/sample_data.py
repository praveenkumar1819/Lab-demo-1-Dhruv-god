"""
Educational and static reference data for SOC L1 Training:
- Asset / User directory metadata
- Knowledge Checks (Topics 1 to 5)
- Labs (Lab 1: Basic Alert Triage, Lab 2: False Positive Identification)
- Architecture reference data
"""

USER_DIRECTORY = {
    "Finance01": {
        "account_type": "Standard Domain User",
        "department": "Finance & Accounting",
        "email": "finance01@enterprise.local",
        "manager": "FinMgr_Sarah",
        "risk_profile": "High Value Target (Financial Assets)"
    },
    "HRUser01": {
        "account_type": "Standard Domain User",
        "department": "Human Resources",
        "email": "hruser01@enterprise.local",
        "manager": "HRMgr_David",
        "risk_profile": "Medium (Employee PII)"
    },
    "Admin01": {
        "account_type": "Domain Administrator / Privileged",
        "department": "IT Infrastructure & Security",
        "email": "admin01@enterprise.local",
        "manager": "ITDir_Robert",
        "risk_profile": "Tier 0 Privileged Identity"
    },
    "Unknown": {
        "account_type": "Unauthenticated / External",
        "department": "External Origin",
        "email": "N/A",
        "manager": "N/A",
        "risk_profile": "Untrusted"
    }
}

HOST_DIRECTORY = {
    "FIN-PC-04": {
        "os": "Windows 11 Enterprise (Build 22631)",
        "ip": "10.10.20.15",
        "role": "Finance Workstation",
        "location": "HQ - 3rd Floor Finance Dept",
        "criticality": "Medium"
    },
    "HR-PC-02": {
        "os": "Windows 11 Enterprise (Build 22631)",
        "ip": "10.10.20.22",
        "role": "HR Workstation",
        "location": "HQ - 2nd Floor HR Dept",
        "criticality": "Low"
    },
    "DC-01": {
        "os": "Windows Server 2022 Datacenter",
        "ip": "10.10.20.40",
        "role": "Primary Domain Controller / Kerberos KDC",
        "location": "Datacenter Rack 2",
        "criticality": "Critical (Tier 0)"
    },
    "WEB-01": {
        "os": "Ubuntu Linux 24.04 LTS",
        "ip": "10.10.20.60",
        "role": "Public Web Application Server (DMZ)",
        "location": "DMZ Subnet",
        "criticality": "High"
    }
}

NETWORK_DIRECTORY = {
    "10.10.20.15": {"type": "Internal", "zone": "Finance Subnet (VLAN 20)", "threat_rep": "Clean"},
    "10.10.20.22": {"type": "Internal", "zone": "HR Subnet (VLAN 22)", "threat_rep": "Clean"},
    "10.10.20.40": {"type": "Internal", "zone": "Server Infrastructure (VLAN 10)", "threat_rep": "Domain Controller"},
    "10.10.20.50": {"type": "Internal", "zone": "IT Admin Subnet (VLAN 50)", "threat_rep": "Authorized Admin Bastion"},
    "10.10.20.60": {"type": "DMZ", "zone": "DMZ Public Web Farm", "threat_rep": "Server"},
    "203.0.113.50": {"type": "External / Internet", "zone": "Public IPv4", "threat_rep": "Untrusted / Port Scanner"}
}

# Topic Knowledge Checks
KNOWLEDGE_CHECKS = [
    {
        "topic_id": 1,
        "topic_title": "Topic 1 — SOC Architecture",
        "questions": [
            {
                "id": "q1_1",
                "question": "What are the four core pillars of SOC Architecture?",
                "options": [
                    "People, Process, Technology, Data",
                    "Hardware, Software, Cloud, Licensing",
                    "Firewalls, Antivirus, Passwords, Encryption",
                    "Managers, Developers, Sales, Support"
                ],
                "correct_index": 0,
                "explanation": "A SOC functions through the synergy of People (analysts & engineers), Process (standard operating procedures & triage workflows), Technology (SIEM, EDR, IDS), and Data (telemetry and logs)."
            },
            {
                "id": "q1_2",
                "question": "What is the primary operational role of an L1 SOC Analyst?",
                "options": [
                    "Perform deep forensic memory dumping and malware reverse-engineering",
                    "Initial alert triage, validation, basic evidence gathering, and classification or escalation",
                    "Procure hardware appliances and manage enterprise budgeting",
                    "Write exploit payloads for penetration testing"
                ],
                "correct_index": 1,
                "explanation": "L1 analysts are the first line of defense: they monitor incoming alerts, perform initial triage to understand the alert, identify affected entities, check evidence, and decide whether to close or escalate."
            },
            {
                "id": "q1_3",
                "question": "In the security data pipeline, where does data flow immediately before generating an alert?",
                "options": [
                    "Raw Endpoints -> Incident",
                    "Security Sources -> Data Ingestion/SIEM -> Detection Rules",
                    "Case Management -> User Email",
                    "Firewall Block -> Cold Tape Storage"
                ],
                "correct_index": 1,
                "explanation": "Security sources (endpoints, servers, network) ship telemetry into the SIEM / Data Store, where Detection Rules analyze patterns to generate actionable Alerts."
            }
        ]
    },
    {
        "topic_id": 2,
        "topic_title": "Topic 2 — Alerts & Events",
        "questions": [
            {
                "id": "q2_1",
                "question": "What is the fundamental difference between an Event and an Alert?",
                "options": [
                    "Events are attacks, alerts are harmless logs",
                    "An event is any observed occurrence in a system; an alert is generated when an event matches a specific detection rule or threshold",
                    "Alerts happen in hardware; events happen in software",
                    "There is no difference; they are exact synonyms in a SOC"
                ],
                "correct_index": 1,
                "explanation": "An Event is simply a recorded telemetry record (e.g. 4624 login, DNS lookup). An Alert is created only when detection logic flags an event or series of events as potentially anomalous or noteworthy."
            },
            {
                "id": "q2_2",
                "question": "When does an Alert become an Incident?",
                "options": [
                    "Whenever an analyst gets tired of looking at it",
                    "When triage confirms that the alert represents an actual or high-probability security compromise affecting confidentiality, integrity, or availability",
                    "Only after the company pays ransom",
                    "Every single raw event automatically becomes an incident"
                ],
                "correct_index": 1,
                "explanation": "An alert is a notification of potential anomaly. Once validated by an analyst as genuine malicious or policy-violating activity requiring formal response, it is declared an Incident."
            },
            {
                "id": "q2_3",
                "question": "What is a 'Case' in the SOC workflow?",
                "options": [
                    "A physical computer tower in the server rack",
                    "The formal investigative container holding all documentation, evidence, IOCs, timeline, and analyst notes",
                    "A legal court trial against a hacker",
                    "An expired antivirus license"
                ],
                "correct_index": 1,
                "explanation": "A Case is the investigative and documentary record where the analyst collates all findings, affected entities, timeline of events, indicators of compromise, and final determinations."
            }
        ]
    },
    {
        "topic_id": 3,
        "topic_title": "Topic 3 — Alert Triage",
        "questions": [
            {
                "id": "q3_1",
                "question": "What is the recommended first step when an L1 analyst opens a new security alert?",
                "options": [
                    "Immediately format the hard drive of the target server",
                    "Understand what the alert means, why it triggered, and what detection rule fired",
                    "Delete the alert from the queue to reduce workload",
                    "Email the CEO directly"
                ],
                "correct_index": 1,
                "explanation": "Always start by understanding the alert: read the rule description, the trigger conditions, and determine what behavior is being flagged."
            },
            {
                "id": "q3_2",
                "question": "Which Windows Event ID typically indicates a failed logon attempt?",
                "options": [
                    "Event ID 4624",
                    "Event ID 4625",
                    "Event ID 7045",
                    "Event ID 1102"
                ],
                "correct_index": 1,
                "explanation": "Windows Security Log Event ID 4625 records failed logon attempts, while 4624 records successful logons."
            },
            {
                "id": "q3_3",
                "question": "When identifying the affected user and host during triage, why is context (such as department or role) critical?",
                "options": [
                    "It helps determine if the activity is expected for that role (e.g. IT admin running PowerShell vs an HR user)",
                    "It has no purpose; all users behave identically",
                    "It allows the analyst to blame specific departments",
                    "It changes the color of the monitor"
                ],
                "correct_index": 0,
                "explanation": "Context is everything in SOC triage: an administrator running management tools from an IT jump box is expected, whereas a finance workstation executing suspicious scripts warrants immediate investigation."
            }
        ]
    },
    {
        "topic_id": 4,
        "topic_title": "Topic 4 — False Positives",
        "questions": [
            {
                "id": "q4_1",
                "question": "Which of the following describes an 'Expected Activity' false positive?",
                "options": [
                    "A ransomware worm encrypting payroll files",
                    "An authorized vulnerability scanner generating failed login spikes during an approved audit window",
                    "A compromised domain administrator dumping LSASS hashes",
                    "An attacker installing a backdoor web shell"
                ],
                "correct_index": 1,
                "explanation": "Expected Activity refers to known, authorized business or security operations—such as penetration tests, backup jobs, or vulnerability scanners—that trigger detection rules as designed."
            },
            {
                "id": "q4_2",
                "question": "A user mistypes their password 4 times and successfully enters the correct one on the 5th attempt. How should this be classified?",
                "options": [
                    "Nation-state APT Attack",
                    "Benign Activity (Accidental user error)",
                    "Hardware Malfunction",
                    "Severe Data Breach"
                ],
                "correct_index": 1,
                "explanation": "Benign activity represents normal, non-malicious user behavior (like forgotten passwords or mistyped credentials) that is not an intentional threat."
            },
            {
                "id": "q4_3",
                "question": "What is a 'Detection Error' false positive?",
                "options": [
                    "When the security analyst forgot their coffee",
                    "When a detection rule triggers because its query logic was flawed, overly broad, or poorly tuned",
                    "When an attacker bypasses the firewall",
                    "When the server loses power"
                ],
                "correct_index": 1,
                "explanation": "A Detection Error occurs when incomplete or overly broad rule logic matches normal baseline operations that were never meant to trigger an alarm."
            }
        ]
    },
    {
        "topic_id": 5,
        "topic_title": "Topic 5 — Severity",
        "questions": [
            {
                "id": "q5_1",
                "question": "In this module, why do we use Low and Medium severity instead of immediately jumping to Critical?",
                "options": [
                    "Because L1 analysts never handle real threats",
                    "Because educational triage teaches careful evaluation: single isolated events or expected routines are Low, while repeated failures or suspicious pivots are Medium",
                    "Because software cannot display red colors",
                    "Because high severity requires payment"
                ],
                "correct_index": 1,
                "explanation": "L1 triage emphasizes measured analysis: not all alerts are catastrophic breaches. Low represents benign/low-risk events, while Medium represents repeated failures or unverified anomalies."
            },
            {
                "id": "q5_2",
                "question": "Which of the following scenarios is properly categorized as 'Medium' severity in our L1 model?",
                "options": [
                    "A single normal successful logon from an employee workstation during standard business hours",
                    "Multiple failed logon attempts followed immediately by a successful logon from an anomalous source IP",
                    "A scheduled daily system reboot",
                    "An approved backup script running at midnight"
                ],
                "correct_index": 1,
                "explanation": "Multiple authentication failures followed by a success suggests password guessing or credential stuffing, warranting Medium severity and active validation."
            }
        ]
    }
]

# Interactive Labs Data
LABS_DATA = {
    "lab1": {
        "id": "lab1",
        "title": "Lab 1 — Basic Alert Triage",
        "scenario": (
            "You are on duty as the L1 SOC Analyst. An alert has fired: 'Multiple Failed Login Attempts'. "
            "Telemetry shows multiple Event ID 4625 occurrences within two minutes for user 'Finance01' on host 'FIN-PC-04' "
            "originating from source IP '10.10.20.15', followed by a successful login Event ID 4624. "
            "Carefully examine the alert details and answer all triage questions."
        ),
        "alert_sample": {
            "id": "ALT-101",
            "name": "Multiple Failed Login Attempts",
            "severity": "Medium",
            "timestamp": "2026-09-25T10:31:20+05:30",
            "user": "Finance01",
            "host": "FIN-PC-04",
            "source_ip": "10.10.20.15",
            "destination_ip": "10.10.20.40",
            "failed_attempts": 5,
            "success_followup": True,
            "events": [
                {"id": "EVT001", "time": "10:30:01", "event_id": "4625", "result": "failure", "desc": "Failed Windows authentication attempt"},
                {"id": "EVT002", "time": "10:30:20", "event_id": "4625", "result": "failure", "desc": "Failed Windows authentication attempt"},
                {"id": "EVT003", "time": "10:30:40", "event_id": "4625", "result": "failure", "desc": "Failed Windows authentication attempt"},
                {"id": "EVT004", "time": "10:31:00", "event_id": "4625", "result": "failure", "desc": "Failed Windows authentication attempt"},
                {"id": "EVT005", "time": "10:31:20", "event_id": "4625", "result": "failure", "desc": "Failed Windows authentication attempt"},
                {"id": "EVT006", "time": "10:31:45", "event_id": "4624", "result": "success", "desc": "Successful Windows authentication after previous failures"}
            ]
        },
        "rubric": {
            "what_happened": "Multiple consecutive failed logins followed by a successful authentication",
            "user": "Finance01",
            "host": "FIN-PC-04",
            "source_ip": "10.10.20.15",
            "failed_count": 5,
            "evidence_event_ids": ["4625", "4624"],
            "severity": "Medium",
            "final_decision": "Suspicious"  # Or "Needs More Investigation"
        }
    },
    "lab2": {
        "id": "lab2",
        "title": "Lab 2 — False Positive Identification",
        "instructions": (
            "Analyze each security scenario below. For each alert, classify whether it is:\n"
            "• EXPECTED ACTIVITY: Authorized system, tool, or admin routine doing its normal job\n"
            "• BENIGN ACTIVITY: Accidental human error, harmless misconfiguration, non-malicious user behavior\n"
            "• DETECTION ERROR: Flawed rule logic or regex bug triggering on completely standard actions\n"
            "• SUSPICIOUS ACTIVITY: Unverified anomalous action requiring incident investigation"
        ),
        "scenarios": [
            {
                "id": "alert_a",
                "title": "Alert A: Rapid failed logins from Qualys Scanner IP (10.10.20.50)",
                "description": "During the pre-announced Tuesday 3 AM vulnerability assessment window, the central Qualys scanner sent 120 authentication tests against DC-01, generating Event 4625 alerts.",
                "correct": "EXPECTED ACTIVITY",
                "explanation": "The source is an authorized, scheduled vulnerability assessment tool operating inside an approved maintenance window. This is Expected Activity."
            },
            {
                "id": "alert_b",
                "title": "Alert B: Multiple failed SSH attempts from unknown public IP 198.51.100.77",
                "description": "An unknown external Internet IP attempted 45 SSH logins with usernames 'root', 'admin', 'test' against external gateway WEB-01.",
                "correct": "SUSPICIOUS ACTIVITY",
                "explanation": "External brute-force / password spraying from an unknown Internet address is definitely suspicious and requires active containment or blocking."
            },
            {
                "id": "alert_c",
                "title": "Alert C: Employee enters mistyped password 3 times then logs in successfully",
                "description": "Finance user Sarah logged into FIN-PC-04 at 8:55 AM on Monday. Three Event 4625 errors occurred with error code 'STATUS_WRONG_PASSWORD', followed immediately by Event 4624 successful logon.",
                "correct": "BENIGN ACTIVITY",
                "explanation": "Users frequently mistype passwords on Monday morning. The subsequent prompt successful login from their own assigned workstation indicates benign user error rather than an attack."
            },
            {
                "id": "alert_d",
                "title": "Alert D: Rule triggers on filename 'passwords_policy.pdf'",
                "description": "A DLP rule configured with regex '.*passwords?.*' triggered an alert when HR sent an enterprise-wide company handbook named 'passwords_policy.pdf'.",
                "correct": "DETECTION ERROR",
                "explanation": "The detection rule was overly broad and lacked context: it flagged a benign policy document due to a naive keyword match. This is a Detection Error (rule tuning required)."
            }
        ]
    }
}
