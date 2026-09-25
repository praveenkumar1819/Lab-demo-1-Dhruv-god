import React, { useState } from 'react';
import { FolderLock, X } from 'lucide-react';
import { createCase } from '../api';

export default function CreateCaseModal({ alert, incident, onClose, onSuccess }) {
  const defaultTitle = incident
    ? `Case: Investigation of ${incident.id} (${incident.title})`
    : alert
      ? `Case: Investigation of ${alert.user} on ${alert.host}`
      : 'New Security Investigation Case';

  const [title, setTitle] = useState(defaultTitle);
  const [analyst, setAnalyst] = useState('L1 Analyst');
  const [severity, setSeverity] = useState(incident?.severity || alert?.severity || 'Medium');
  const [notes, setNotes] = useState(
    alert?.notes || 'Opened case for structured evidence collection and escalation.'
  );
  const [iocs, setIocs] = useState(
    (alert?.source_ip ? `IP: ${alert.source_ip}` : '')
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const iocList = iocs.split('\n').map(s => s.trim()).filter(Boolean);
      const newCase = await createCase({
        incident_id: incident?.id,
        alert_id: alert?.id,
        title,
        severity,
        analyst,
        notes,
        iocs: iocList,
        final_decision: alert?.decision || 'Under Investigation'
      });
      if (onSuccess) onSuccess(newCase);
      onClose();
    } catch (err) {
      window.alert('Error creating case: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div className="modal-title">
              <FolderLock size={18} color="#8b5cf6" />
              <span>Open Documented Case</span>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={14} />
            </button>
          </div>

          <div className="modal-body">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Initialize a formalized case folder for audit trails, IOC documentation, and escalation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                CASE TITLE
              </label>
              <input
                className="form-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  ASSIGNED ANALYST
                </label>
                <input
                  className="form-input"
                  value={analyst}
                  onChange={(e) => setAnalyst(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  SEVERITY
                </label>
                <select
                  className="form-select"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                INITIAL INDICATORS OF COMPROMISE (IOCs - one per line)
              </label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. IP: 10.10.20.15&#10;Host: FIN-PC-04"
                value={iocs}
                onChange={(e) => setIocs(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                INVESTIGATION NOTES & HYPOTHESIS
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Opening Case...' : 'Open Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
