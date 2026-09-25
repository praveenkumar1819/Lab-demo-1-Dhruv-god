import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Clock,
  User,
  Monitor,
  Network,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  Save,
  Tag,
  History,
  ShieldCheck
} from 'lucide-react';
import { fetchCases, fetchCaseDetail, updateCase } from '../api';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';

export default function CasesPage({ onSelectAlert }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit states for detail
  const [caseNotes, setCaseNotes] = useState('');
  const [caseIocs, setCaseIocs] = useState('');
  const [caseDecision, setCaseDecision] = useState('');
  const [caseStatus, setCaseStatus] = useState('OPEN');
  const [saving, setSaving] = useState(false);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await fetchCases();
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const loadCaseDetail = async (id) => {
    setSelectedCaseId(id);
    setDetailLoading(true);
    try {
      const data = await fetchCaseDetail(id);
      setCaseDetail(data);
      setCaseNotes(data.case.notes || '');
      setCaseIocs((data.case.iocs || []).join('\n'));
      setCaseDecision(data.case.final_decision || '');
      setCaseStatus(data.case.status || 'OPEN');
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveCase = async () => {
    if (!selectedCaseId) return;
    setSaving(true);
    try {
      const iocArray = caseIocs.split('\n').map(s => s.trim()).filter(Boolean);
      await updateCase(selectedCaseId, {
        notes: caseNotes,
        iocs: iocArray,
        final_decision: caseDecision,
        status: caseStatus
      });
      alert('Case updated successfully!');
      loadCases();
      loadCaseDetail(selectedCaseId);
    } catch (err) {
      alert('Error updating case: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // If a case is selected, render the full investigation view
  if (selectedCaseId && caseDetail) {
    const { case: c, incident, alert, related_events } = caseDetail;

    return (
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCaseId(null)}>
            <ArrowLeft size={14} /> Back to All Cases
          </button>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <StatusBadge status={c.status} />
            <SeverityBadge severity={c.severity} />
            <button className="btn btn-primary btn-sm" onClick={handleSaveCase} disabled={saving}>
              <Save size={13} />
              {saving ? 'Saving...' : 'Save Case'}
            </button>
          </div>
        </div>

        {/* Case Header */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>
                DOCUMENTED INVESTIGATION CASE
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                {c.title}
              </h1>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Case ID: <span className="mono-cell" style={{ color: '#c084fc' }}>{c.id}</span> •
                Assigned Analyst: <strong style={{ color: '#fff' }}>{c.analyst}</strong> •
                Incident: <span className="mono-cell">{c.incident_id || 'N/A'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>CASE STATUS</label>
                <select
                  className="form-select"
                  value={caseStatus}
                  onChange={(e) => setCaseStatus(e.target.value)}
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Investigation Sections Grid */}
        <div className="triage-grid">
          {/* Target Entities: User, Host, IP */}
          <div className="triage-section" style={{ gridColumn: 'span 4' }}>
            <div className="section-title">
              <User size={15} /> Affected User
            </div>
            <div className="info-row">
              <span className="info-label">Identity:</span>
              <span className="info-value mono-cell" style={{ color: '#60a5fa' }}>{c.affected_user}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Department:</span>
              <span className="info-value">{alert?.department || 'Finance & Accounting'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Account Type:</span>
              <span className="info-value">{alert?.account_type || 'Domain User'}</span>
            </div>
          </div>

          <div className="triage-section" style={{ gridColumn: 'span 4' }}>
            <div className="section-title">
              <Monitor size={15} /> Affected Host
            </div>
            <div className="info-row">
              <span className="info-label">Hostname:</span>
              <span className="info-value mono-cell">{c.affected_host}</span>
            </div>
            <div className="info-row">
              <span className="info-label">OS Platform:</span>
              <span className="info-value">{alert?.host_os || 'Windows 11 Enterprise'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Function:</span>
              <span className="info-value">Workstation Endpoint</span>
            </div>
          </div>

          <div className="triage-section" style={{ gridColumn: 'span 4' }}>
            <div className="section-title">
              <Network size={15} /> Source IP & Network
            </div>
            <div className="info-row">
              <span className="info-label">Source IP:</span>
              <span className="info-value mono-cell" style={{ color: '#38bdf8' }}>{c.source_ip}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Subnet Zone:</span>
              <span className="info-value">Corporate LAN (VLAN 20)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Direction:</span>
              <span className="info-value">Internal Host-to-Host</span>
            </div>
          </div>

          {/* Linked Alert & Related Events */}
          <div className="triage-section" style={{ gridColumn: 'span 12' }}>
            <div className="section-title">
              <FileText size={15} />
              Linked Security Alert & Evidence ({related_events?.length || 0} Events)
            </div>
            {alert && (
              <div style={{
                background: '#0b0f19',
                padding: '0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                marginBottom: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{alert.name} ({alert.id})</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{alert.description}</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => onSelectAlert(alert.id)}>
                  View Alert Triage
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(related_events || []).map((evt, idx) => (
                <div
                  key={evt.id}
                  style={{
                    background: '#070a12',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span className="mono-cell" style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span>
                    <span className="mono-cell" style={{ color: '#38bdf8' }}>{evt.id}</span>
                    <span className="badge" style={{ fontSize: '0.68rem', background: evt.result === 'failure' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)', color: evt.result === 'failure' ? '#fb7185' : '#34d399' }}>
                      Event ID {evt.event_id}
                    </span>
                    <span>{evt.description}</span>
                  </div>
                  <span className="mono-cell" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {evt.timestamp?.slice(11, 19)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* IOCs (Indicators of Compromise) */}
          <div className="triage-section" style={{ gridColumn: 'span 6' }}>
            <div className="section-title">
              <Tag size={15} />
              Indicators of Compromise (IOCs)
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Document artifacts such as suspicious IPs, hashes, compromised usernames, or hostnames (one per line).
            </p>
            <textarea
              className="form-textarea"
              rows={4}
              value={caseIocs}
              onChange={(e) => setCaseIocs(e.target.value)}
              placeholder="IP: 10.10.20.15&#10;Host: FIN-PC-04&#10;User: Finance01"
            />
          </div>

          {/* Final Decision */}
          <div className="triage-section" style={{ gridColumn: 'span 6' }}>
            <div className="section-title">
              <CheckCircle2 size={15} />
              Final Decision & Determination
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Conclude the investigation after reviewing all logs and communicating with stakeholders.
            </p>
            <select
              className="form-select"
              value={caseDecision}
              onChange={(e) => setCaseDecision(e.target.value)}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <option value="">Select final disposition...</option>
              <option value="False Positive - Expected Activity">False Positive - Expected Activity (Authorized admin/tool)</option>
              <option value="False Positive - Benign Activity">False Positive - Benign Activity (User mistyped password)</option>
              <option value="False Positive - Detection Error">False Positive - Detection Error (Flawed rule query)</option>
              <option value="True Positive - Suspicious Activity Contained">True Positive - Suspicious Activity Contained</option>
              <option value="Escalated to L2 IR Team">Escalated to L2 IR Team</option>
            </select>

            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: '#0b0f19',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)'
            }}>
              <strong>Module 4 Learning Objective:</strong> A case documents why an activity occurred, whether it was malicious or benign, and provides an auditable history of the analyst's decisions.
            </div>
          </div>

          {/* Analyst Notes */}
          <div className="triage-section" style={{ gridColumn: 'span 12' }}>
            <div className="section-title">
              <FileText size={15} />
              Comprehensive Analyst Case Notes
            </div>
            <textarea
              className="form-textarea"
              rows={4}
              value={caseNotes}
              onChange={(e) => setCaseNotes(e.target.value)}
              placeholder="Record detailed timeline notes, containment steps, communications with the user or system administrator, and final closing remarks."
            />
          </div>

          {/* Timeline of Investigation */}
          <div className="triage-section" style={{ gridColumn: 'span 12' }}>
            <div className="section-title">
              <History size={15} />
              Investigation Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {(c.timeline || []).map((tl, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '0.6rem 0.85rem',
                    background: '#0b0f19',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <span className="mono-cell" style={{ fontSize: '0.75rem', color: '#38bdf8', minWidth: '140px' }}>
                    {tl.time?.replace('T', ' ').slice(0, 19)}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.825rem' }}>{tl.event}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tl.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view of all cases
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FolderLock size={24} color="#8b5cf6" />
            Case Management Workspace
          </h1>
          <p className="page-description">
            Documented security investigations containing evidence, IOCs, timelines, and final triage determinations.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={loadCases}>
          <RotateCcw size={13} /> Refresh Cases
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Total Cases: <strong>{cases.length}</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            💡 Click on any case row to inspect full investigation documentation
          </div>
        </div>

        <div className="table-responsive">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Incident</th>
                <th>Analyst</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Updated</th>
                <th>Final Decision</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No investigation cases open yet. Create a case from the Alert Investigation or Incidents page.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr
                    key={c.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => loadCaseDetail(c.id)}
                  >
                    <td>
                      <span className="mono-cell" style={{ fontWeight: 700, color: '#c084fc' }}>
                        {c.id}
                      </span>
                    </td>
                    <td>
                      <span className="mono-cell">{c.incident_id || 'Direct Alert'}</span>
                    </td>
                    <td>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{c.analyst}</span>
                    </td>
                    <td>
                      <SeverityBadge severity={c.severity} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <span className="mono-cell" style={{ fontSize: '0.75rem' }}>
                        {c.created_at?.replace('T', ' ').slice(0, 19)}
                      </span>
                    </td>
                    <td>
                      <span className="mono-cell" style={{ fontSize: '0.75rem' }}>
                        {c.updated_at?.replace('T', ' ').slice(0, 19)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: c.final_decision ? '#34d399' : 'var(--text-muted)' }}>
                        {c.final_decision || 'Pending Decision'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadCaseDetail(c.id);
                        }}
                      >
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
