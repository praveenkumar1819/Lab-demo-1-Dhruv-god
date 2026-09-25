import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { createIncident } from '../api';

export default function CreateIncidentModal({ alert, onClose, onSuccess }) {
  const [title, setTitle] = useState(alert ? `Incident: ${alert.name} (${alert.user})` : '');
  const [severity, setSeverity] = useState(alert?.severity || 'Medium');
  const [description, setDescription] = useState(
    alert ? `Initial triage confirms suspicious activity: ${alert.what_happened || alert.description}` : ''
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!alert) return;
    setSubmitting(true);
    try {
      const inc = await createIncident({
        alert_id: alert.id,
        title,
        severity,
        status: 'OPEN',
        description
      });
      if (onSuccess) onSuccess(inc);
      onClose();
    } catch (err) {
      window.alert('Error creating incident: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div className="modal-title">
              <AlertTriangle size={18} color="#f59e0b" />
              <span>Create Security Incident</span>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={14} />
            </button>
          </div>

          <div className="modal-body">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Promoting Alert <strong>{alert?.id}</strong> ({alert?.name}) into a formal Incident.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                INCIDENT TITLE
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  AFFECTED USER
                </label>
                <input className="form-input" disabled value={alert?.user || 'Unknown'} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                INCIDENT SUMMARY / SCOPE
              </label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
