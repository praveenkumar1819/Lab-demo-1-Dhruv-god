# SOC Analyst L1 Training Dashboard (Module 4 — SOC Operations)

A lightweight, educational web application simulating what an **L1 SOC Analyst** sees and does when security alerts arrive.

> [!IMPORTANT]
> **Educational Training Platform Only**
> - This is **NOT** a full SIEM.
> - This is **NOT** TheHive.
> - This is **NOT** an enterprise SOC platform.
> - It uses **100% free and open-source technologies** (FastAPI, React, Vite, SQLite).
> - It is specifically tailored for **Course Module 4 — SOC Operations**.

---

## 1. Project Purpose & Pedagogical Workflow

The core objective is to teach beginner students the foundational **SOC L1 Operations Workflow**:

```
 MONITOR (Security Event Logs)
    ↓
 DETECT (Rule Matching)
    ↓
 ALERT (Notification Dispatch)
    ↓
 TRIAGE (Identify User, Host, IP, What Happened)
    ↓
 VALIDATE (Distinguish Benign from Malicious)
    ↓
 SEVERITY (Assign Low or Medium)
    ↓
 DOCUMENT (Capture Findings & IOCs in Incidents/Cases)
    ↓
 CLOSE / ESCALATE (Resolve or Hand Off to L2)
```

Learners practice the entire lifecycle on pre-staged security evidence without needing complex commercial SIEM software or cloud services.

---

## 2. Architecture & Tech Stack

### Technology
- **Frontend**: React 18, Vite, Lucide Icons, Pure CSS Design System with Cyber Dark Theme.
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic.
- **Storage**: SQLite (`backend/soc_training.db`) with automatic seeding and reset from `data/events.json`.
- **Zero Paid APIs / Zero Cloud Dependencies**: Runs entirely offline on localhost.

### Folder Structure
```
SOC-dashboard/
├── backend/
│   ├── main.py              # FastAPI endpoints & REST API
│   ├── models.py            # Pydantic models for Event, Alert, Incident, Case
│   ├── database.py          # SQLite database schema & queries
│   ├── rules_engine.py      # Educational rule correlation engine
│   ├── sample_data.py       # Knowledge checks, labs, user/host directory metadata
│   ├── requirements.txt     # Python backend dependencies
│   └── soc_training.db      # Local SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/      # Badges, navigation, modals, workflow banners
│   │   ├── pages/           # The 9 course pages
│   │   ├── api.js           # API service client
│   │   ├── App.jsx          # Top-level routing & global state
│   │   └── index.css        # Cyber dark SOC design system
│   ├── vite.config.js       # Vite proxy config (forwards /api to port 8000)
│   └── package.json
├── data/
│   └── events.json          # Pre-staged initial security logs
├── start-all.bat            # Quick launcher for Windows
├── start-all.ps1            # PowerShell launcher
├── start-backend.bat        # Backend startup script
├── start-frontend.bat       # Frontend startup script
└── README.md                # Comprehensive documentation
```

---

## 3. Requirements

- **Operating System**: Windows 10/11, Linux, or macOS
- **Python**: 3.10+ (Python 3.11 installed via `uv`)
- **Node.js**: v18+ or v20+ (Node.js v20.18.0 & npm included)

---

## 4. Installation

If starting on a fresh machine:

### Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\python.exe -m pip install -r requirements.txt
# On Linux/macOS:
source .venv/bin/activate
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

---

## 5. Backend Startup

To start the FastAPI backend service:

```bash
cd backend
.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend API URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Documentation**: `http://127.0.0.1:8000/docs`

---

## 6. Frontend Startup

To start the Vite dev server:

```bash
cd frontend
npm run dev
```
- **Web Dashboard URL**: `http://127.0.0.1:5173`

> [!TIP]
> **One-Click Startup on Windows**: Double-click `start-all.bat` or run `./start-all.ps1` in PowerShell. This automatically launches both backend and frontend servers in coordinated windows.

---

## 7. Loading Sample Data

The application automatically seeds the database on startup using `data/events.json`.

You can also ingest additional events at any time via the REST API or UI:
- **Through the UI**: Navigate to **Events** -> click **Ingest Events (POST /api/events/ingest)** -> paste JSON.
- **Through curl / HTTP POST**:
```bash
curl -X POST http://127.0.0.1:8000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '[
    {
      "id": "EVT101",
      "timestamp": "2026-09-25T11:00:00+05:30",
      "event_type": "authentication",
      "event_id": "4625",
      "user": "Finance01",
      "host": "FIN-PC-04",
      "source_ip": "10.10.20.15",
      "destination_ip": "10.10.20.40",
      "action": "login",
      "result": "failure",
      "description": "Failed Windows authentication attempt"
    }
  ]'
```

---

## 8. How Alerts Are Generated (Detection Rules)

The platform includes four educational detection rules in `backend/rules_engine.py`:

| Rule ID | Rule Name | Detection Condition | Resulting Severity | Educational Purpose |
|---|---|---|---|---|
| **RULE 1** | Multiple Failed Logins | Same user + same source IP + $\ge 5$ failed login events within 5 minutes | **Medium** | Teaches brute-force and credential spraying identification |
| **RULE 2** | Successful Login | Isolated successful authentication event (4624) | **Low** | Baseline normal activity |
| **RULE 3** | Suspicious Login | Multiple failed logins immediately followed by a successful login from the same source IP | **Medium** | Teaches potential account compromise following password guessing |
| **RULE 4** | Expected Activity | Events marked with metadata `source_type` (`authorized_admin`, `known_scanner`, `internal_test`) | **Low** | Teaches recognition of scheduled maintenance and authorized administrative operations |

---

## 9. How to Run Lab 1 (Basic Alert Triage)

1. Open the dashboard at `http://127.0.0.1:5173`.
2. Click **Labs** in the left sidebar and select the **Lab 1: Basic Alert Triage** tab.
3. Review the scenario:
   > *"A finance employee account generates multiple failed login events from the same source IP."*
4. Examine the embedded telemetry log table (Event IDs 4625 and 4624).
5. Fill in the 8 triage fields:
   - **What happened?**: Multiple failed logins followed by a successful login.
   - **Affected User**: `Finance01`
   - **Affected Host**: `FIN-PC-04`
   - **Source IP**: `10.10.20.15`
   - **Number of failed attempts**: `5`
   - **Related evidence**: `4625, 4624`
   - **Assigned Severity**: `Medium`
   - **Final Decision**: `Suspicious` (or `Needs More Investigation`)
6. Click **Check Answer**.
7. The system evaluates each answer, gives an overall score, and displays comprehensive explanations without revealing answers upfront.

---

## 10. How to Run Lab 2 (False Positive Identification)

1. In **Labs**, click the **Lab 2: False Positive Identification** tab.
2. Read the 4 classification definitions:
   - **EXPECTED ACTIVITY**: Authorized routine (e.g. Qualys scanner).
   - **BENIGN ACTIVITY**: Harmless human mistype (e.g. employee mistyped password on Monday morning).
   - **DETECTION ERROR**: Flawed SIEM query/regex triggering on benign filenames.
   - **SUSPICIOUS ACTIVITY**: Unverified external attack requiring escalation.
3. For each of the 4 realistic scenarios (Alert A through Alert D), select the corresponding classification card.
4. Click **Submit & Check Classifications**.
5. Read the detailed SOC instructor feedback explaining why each alert belongs to that specific category.

---

## 11. How to Reset the Training Environment

You can reset the environment at any time to repeat exercises from scratch:
- **From the UI**: Click the **Reset Environment** button in the top navigation bar and confirm the dialog.
- **From the API**:
```bash
curl -X POST http://127.0.0.1:8000/api/reset
```
This clears all newly created incidents, cases, and triage edits, and reloads the initial 10 pre-staged events from `data/events.json`.

---

## 12. Application Structure & Pages Summary

1. **SOC Dashboard (`/`)**: High-level telemetry summary cards, severity distribution bar, recent alerts queue, and workflow banner.
2. **Events (`/events`)**: Raw ingested logs with search, user/host/event_type filters, and raw JSON modal viewer.
3. **Alerts (`/alerts`)**: Queue of alerts generated from rules with status tabs and severity filters.
4. **Alert Investigation (`/investigation`)**: **The primary workspace**. Guided 9-section L1 triage interface:
   - *Section 1*: Understand Alert
   - *Section 2*: Identify User
   - *Section 3*: Identify Host
   - *Section 4*: Identify IP
   - *Section 5*: Evidence (expandable related events)
   - *Section 6*: Analyst Decision
   - *Section 7*: Severity (Low vs Medium)
   - *Section 8*: Analyst Notes
   - *Section 9*: Operational Actions ([Create Incident], [Create Case], [Close Alert], [Escalate])
5. **Incidents (`/incidents`)**: Manage declared incidents and transition statuses (OPEN, INVESTIGATING, RESOLVED).
6. **Cases (`/cases`)**: Formal investigative case files containing timelines, IOCs, analyst notes, and final resolutions.
7. **SOC Architecture (`/architecture`)**: Interactive educational diagram of the 4 Pillars (People, Process, Technology, Data) and the End-to-End Event Pipeline.
8. **Labs (`/labs`)**: Interactive grading modules for Lab 1 (Basic Triage) and Lab 2 (False Positive Identification).
9. **Knowledge Checks (`/knowledge-checks`)**: Multiple-choice quizzes covering Topics 1 through 5 with instant feedback and explanations.
