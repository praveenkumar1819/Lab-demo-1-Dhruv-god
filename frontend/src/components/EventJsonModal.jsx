import React, { useState } from 'react';
import { X, Copy, Check, FileJson } from 'lucide-react';

export default function EventJsonModal({ event, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const jsonString = JSON.stringify(event, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FileJson size={18} color="#06b6d4" />
            <span>Raw Event Record: {event.id}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: '#0b0f19', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>EVENT ID</div>
              <div style={{ fontWeight: 600, color: '#38bdf8' }}>{event.event_id || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TYPE / ACTION</div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{event.event_type} ({event.action})</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>RESULT</div>
              <div style={{ fontWeight: 600, color: event.result === 'failure' ? '#fb7185' : '#34d399' }}>
                {event.result?.toUpperCase()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              JSON PAYLOAD
            </span>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>

          <pre className="json-box">{jsonString}</pre>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
