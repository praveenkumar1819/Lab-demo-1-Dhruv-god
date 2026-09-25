import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  User,
  Monitor,
  Network,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Save,
  HelpCircle,
  FileJson,
  FolderLock,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { fetchAlertDetail, updateAlert } from '../api';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import EventJsonModal from '../components/EventJsonModal';
import CreateIncidentModal from '../components/CreateIncidentModal';
import CreateCaseModal from '../components/CreateCaseModal';

export default function AlertInvestigationPage({ alertId, onBack, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState({});
  const [selectedJsonEvent, setSelectedJsonEvent] = useState(null);

  // Analyst Triage Form State
  const [decision, setDecision] = useState('');
  const [fpCategory, setFpCategory] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);

  const loadAlert = async () => {
    setLoading(true);
    try {
      const res = await fetchAlertDetail(alertId);
      setData(res);
      setDecision(res.alert.decision || '');
      setFpCategory(res.alert.classification_type || '');
      setSeverity(res.alert.severity || 'Medium');
      setNotes(res.alert.notes || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alertId) loadAlert();
  }, [alertId]);

  const toggleEventExpand = (id) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveTriage = async () => {
    setSaving(true);
    try {
      await updateAlert(alertId, {
        decision,
        classification_type: decision === 'False Positive' ? fpCategory : null,
        severity,
        notes
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      loadAlert();
    } catch (err) {
      alert('Error saving triage decision: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAlert = async () => {
    const reason = window.prompt('Enter closure justification / disposition note:');
    if (reason === null) return;
    try {
      await updateAlert(alertId, {
        status: 'CLOSED',
        notes: (notes ? notes + '\n\n' : '') + `[CLOSED by L1 Analyst]: ${reason}`
      });
      loadAlert();
    } catch (err) {
      alert('Error closing alert: ' + err.message);
    }
  };

  const handleEscalateAlert = async () => {
    const reason = window.prompt('Enter reason for escalating to L2 / Incident Response:');
    if (reason === null) return;
    try {
      await updateAlert(alertId, {
        status: 'ESCALATED',
        notes: (notes ? notes + '\n\n' : '') + `[ESCALATED to L2]: ${reason}`
      });
      loadAlert();
    } catch (err) {
      alert('Error escalating alert: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading alert investigation workspace...</p>
      </div>
    );
  }

  if (!data || !data.alert) {
    return (
      <div className="page-container">
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Alerts
        </button>
        <p style={{ color: '#fb7185', marginTop: '1rem' }}>Alert not found.</p>
      </div>
    );
  }

  const { alert, related_events, user_context, host_context, network_context } = data;

  return (
    <div className="page-container">
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Alerts Queue
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatusBadge status={alert.status} />
          <SeverityBadge severity={alert.severity} />
        </div>
      </div>

      {/* Alert Header Box */}
      <div style={{
        background: 'linear-gradient(135deg, #131c33 0%, #172340 100%)',
        border: '1px solid #2a395c',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              L1 ALERT INVESTIGATION WORKSPACE
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
              ALERT: {alert.name}
            </h1>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Alert ID: <span className="mono-cell" style={{ color: '#38bdf8' }}>{alert.id}</span> •
              Triggered: <span className="mono-cell">{alert.timestamp?.replace('T', ' ').slice(0, 19)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-success btn-sm"
              onClick={handleSaveTriage}
              disabled={saving}
            >
              <Save size={13} />
              {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Triage Notes'}
            </button>
          </div>
        </div>

        {/* Quick Identity Ribbons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>USER IDENTITY</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#60a5fa' }} className="mono-cell">
              {alert.user}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user_context.department}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>HOST MACHINE</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }} className="mono-cell">
              {alert.host}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{host_context.os}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>SOURCE IP</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }} className="mono-cell">
              {alert.source_ip}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{network_context.zone}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>FAILED ATTEMPTS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: (alert.failed_attempts || 0) > 0 ? '#fb7185' : '#34d399' }} className="mono-cell">
              {alert.failed_attempts || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Event ID 4625 counts</div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Triage Workspace */}
      <div className="triage-grid">
        {/* SECTION 1 — Understand Alert */}
        <div className="triage-section" style={{ gridColumn: 'span 12' }}>
          <div className="section-title">
            <HelpCircle size={15} />
            SECTION 1 — Understand Alert
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#0b0f19', padding: '0.9rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
                WHAT HAPPENED?
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {alert.what_happened || alert.description}
              </div>
            </div>

            <div style={{ background: '#0b0f19', padding: '0.9rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', marginBottom: '0.25rem' }}>
                WHY WAS THE ALERT GENERATED?
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {alert.why_generated || 'Correlation rule detected anomalous security event patterns in ingested logs.'}
              </div>
            </div>

            <div style={{ background: '#0b0f19', padding: '0.9rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c084fc', marginBottom: '0.25rem' }}>
                WHEN DID IT OCCUR?
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }} className="mono-cell">
                {alert.when_occurred || alert.timestamp}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — Identify User */}
        <div className="triage-section" style={{ gridColumn: 'span 4' }}>
          <div className="section-title">
            <User size={15} />
            SECTION 2 — Identify User
          </div>
          <div className="info-row">
            <span className="info-label">Username:</span>
            <span className="info-value mono-cell" style={{ color: '#60a5fa' }}>{alert.user}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Account Type:</span>
            <span className="info-value">{user_context.account_type}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Department:</span>
            <span className="info-value">{user_context.department}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value mono-cell">{user_context.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Risk Profile:</span>
            <span className="info-value" style={{ color: '#fbbf24' }}>{user_context.risk_profile}</span>
          </div>
        </div>

        {/* SECTION 3 — Identify Host */}
        <div className="triage-section" style={{ gridColumn: 'span 4' }}>
          <div className="section-title">
            <Monitor size={15} />
            SECTION 3 — Identify Host
          </div>
          <div className="info-row">
            <span className="info-label">Hostname:</span>
            <span className="info-value mono-cell">{alert.host}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Host Assigned IP:</span>
            <span className="info-value mono-cell">{host_context.ip}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Operating System:</span>
            <span className="info-value">{host_context.os}</span>
          </div>
          <div className="info-row">
            <span className="info-label">System Role:</span>
            <span className="info-value">{host_context.role}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Criticality:</span>
            <span className="info-value">{host_context.criticality}</span>
          </div>
        </div>

        {/* SECTION 4 — Identify IP */}
        <div className="triage-section" style={{ gridColumn: 'span 4' }}>
          <div className="section-title">
            <Network size={15} />
            SECTION 4 — Identify IP
          </div>
          <div className="info-row">
            <span className="info-label">Source IP:</span>
            <span className="info-value mono-cell" style={{ color: '#38bdf8' }}>{alert.source_ip}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Network Zone:</span>
            <span className="info-value">{network_context.zone}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Destination Host:</span>
            <span className="info-value mono-cell">{alert.host}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Connection Info:</span>
            <span className="info-value">{alert.connection_info || 'Direct Internal LAN'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">IP Reputation:</span>
            <span className="info-value" style={{ color: network_context.threat_rep === 'Clean' ? '#34d399' : '#fbbf24' }}>
              {network_context.threat_rep}
            </span>
          </div>
        </div>

        {/* SECTION 5 — Evidence */}
        <div className="triage-section" style={{ gridColumn: 'span 12' }}>
          <div className="section-title" style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={15} />
              SECTION 5 — Evidence ({related_events.length} Related Log Records)
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'none' }}>
              Click to expand event details
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {related_events.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>
                No correlated raw logs directly linked to this alert.
              </div>
            ) : (
              related_events.map((evt, idx) => {
                const isExpanded = !!expandedEvents[evt.id];
                const isFail = evt.result === 'failure';

                return (
                  <div
                    key={evt.id}
                    style={{
                      background: '#0b0f19',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        padding: '0.65rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent'
                      }}
                      onClick={() => toggleEventExpand(evt.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className="mono-cell" style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                          #{idx + 1}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: isFail ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isFail ? '#fb7185' : '#34d399',
                            fontSize: '0.7rem'
                          }}
                        >
                          {evt.event_id} {isFail ? 'Failed Login' : 'Successful Login'}
                        </span>
                        <span className="mono-cell" style={{ fontSize: '0.75rem' }}>
                          {evt.timestamp?.replace('T', ' ').slice(11, 19)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {evt.description}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJsonEvent(evt);
                          }}
                        >
                          <FileJson size={12} /> JSON
                        </button>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{
                        padding: '0.9rem 1rem',
                        borderTop: '1px solid var(--border-color)',
                        background: '#070a12',
                        fontSize: '0.8rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.75rem'
                      }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Event ID / Source:</span>
                          <div className="mono-cell">{evt.id} • {evt.source}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>User / Host:</span>
                          <div className="mono-cell">{evt.user} on {evt.host}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Source &rarr; Dest IP:</span>
                          <div className="mono-cell">{evt.source_ip} &rarr; {evt.destination_ip}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Action & Result:</span>
                          <div>{evt.action} / <strong style={{ color: isFail ? '#fb7185' : '#34d399' }}>{evt.result}</strong></div>
                        </div>
                        {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Metadata Tags:</span>
                            <pre className="json-box" style={{ margin: '0.25rem 0 0 0', padding: '0.5rem' }}>
                              {JSON.stringify(evt.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 6 — Analyst Decision */}
        <div className="triage-section" style={{ gridColumn: 'span 6' }}>
          <div className="section-title">
            <CheckCircle2 size={15} />
            SECTION 6 — Analyst Decision
          </div>
          <div className="radio-options">
            {[
              { id: 'Suspicious', desc: 'Anomalous activity with high risk or potential breach.' },
              { id: 'Benign', desc: 'Standard user mistake, forgotten password, normal routine.' },
              { id: 'False Positive', desc: 'Expected system test, scanner, or detection error.' },
              { id: 'Needs More Investigation', desc: 'Insufficient data; requires log pivoting or user contact.' }
            ].map(opt => (
              <label
                key={opt.id}
                className={`radio-card ${decision === opt.id ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="decision"
                  value={opt.id}
                  checked={decision === opt.id}
                  onChange={(e) => setDecision(e.target.value)}
                />
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{opt.id}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Sub-classification if False Positive is selected */}
          {decision === 'False Positive' && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: '#0b0f19',
              borderRadius: '6px',
              border: '1px solid var(--accent-blue)'
            }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                FALSE POSITIVE CATEGORY (Topic 4):
              </label>
              <select
                className="form-select"
                style={{ width: '100%', marginTop: '0.35rem' }}
                value={fpCategory}
                onChange={(e) => setFpCategory(e.target.value)}
              >
                <option value="">Select FP Category...</option>
                <option value="Expected Activity">Expected Activity (Authorized admin/scanner routine)</option>
                <option value="Benign Activity">Benign Activity (Accidental user mistype)</option>
                <option value="Detection Error">Detection Error (Overly broad SIEM rule logic)</option>
              </select>
            </div>
          )}
        </div>

        {/* SECTION 7 — Severity */}
        <div className="triage-section" style={{ gridColumn: 'span 6' }}>
          <div className="section-title">
            <AlertCircle size={15} />
            SECTION 7 — Severity Assignment
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Module 4 Policy: Use only <strong>Low</strong> or <strong>Medium</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              ASSIGN SEVERITY LEVEL:
            </label>
            <select
              className="form-select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="Low">Low — Expected/benign activity, normal single login</option>
              <option value="Medium">Medium — Repeated failed logins, unverified anomalies</option>
            </select>
          </div>

          <div style={{
            background: '#0b0f19',
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            marginTop: '0.5rem'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-amber)' }}>
              GUIDELINE:
            </div>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
              <li><strong>Low</strong>: Single login event or authorized admin tool (Expected).</li>
              <li><strong>Medium</strong>: Multiple consecutive 4625 failures or suspicious sequence.</li>
            </ul>
          </div>
        </div>

        {/* SECTION 8 — Analyst Notes */}
        <div className="triage-section" style={{ gridColumn: 'span 12' }}>
          <div className="section-title">
            <FileText size={15} />
            SECTION 8 — Analyst Notes & Documentation
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Record your findings, hypotheses, verification steps taken, and recommendations.
          </p>
          <textarea
            className="form-textarea"
            style={{ minHeight: '100px', fontSize: '0.85rem' }}
            placeholder="[SUMMARY]: Investigated multiple failed login attempts on Finance01 workstation.
[EVIDENCE]: 5 consecutive 4625 events followed by 4624 success from source IP 10.10.20.15.
[DISPOSITION]: Contacted employee Sarah in Finance to verify if password was mistyped."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* SECTION 9 — Action */}
        <div className="triage-section" style={{ gridColumn: 'span 12' }}>
          <div className="section-title">
            <ExternalLink size={15} />
            SECTION 9 — Operational Actions
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Choose the operational action following L1 SOC standard operating procedures:
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowIncidentModal(true)}
            >
              <AlertCircle size={14} />
              Create Incident
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShowCaseModal(true)}
            >
              <FolderLock size={14} color="#8b5cf6" />
              Create Case
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleCloseAlert}
            >
              <CheckCircle2 size={14} color="#10b981" />
              Close Alert
            </button>

            <button
              className="btn btn-warning"
              onClick={handleEscalateAlert}
            >
              <ShieldAlert size={14} />
              Escalate to L2
            </button>
          </div>
        </div>
      </div>

      {/* JSON Modal for raw event */}
      {selectedJsonEvent && (
        <EventJsonModal
          event={selectedJsonEvent}
          onClose={() => setSelectedJsonEvent(null)}
        />
      )}

      {/* Create Incident Modal */}
      {showIncidentModal && (
        <CreateIncidentModal
          alert={alert}
          onClose={() => setShowIncidentModal(false)}
          onSuccess={(inc) => {
            alert('Incident ' + inc.id + ' successfully opened!');
            loadAlert();
            onNavigate('incidents');
          }}
        />
      )}

      {/* Create Case Modal */}
      {showCaseModal && (
        <CreateCaseModal
          alert={alert}
          onClose={() => setShowCaseModal(false)}
          onSuccess={(newCase) => {
            alert('Case ' + newCase.id + ' initialized!');
            loadAlert();
            onNavigate('cases');
          }}
        />
      )}
    </div>
  );
}
