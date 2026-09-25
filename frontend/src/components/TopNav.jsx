import React, { useState } from 'react';
import { Shield, RotateCcw, User, Activity, AlertTriangle } from 'lucide-react';
import { resetEnvironment } from '../api';

export default function TopNav({ onResetSuccess }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetEnvironment();
      setShowConfirm(false);
      if (onResetSuccess) onResetSuccess();
    } catch (err) {
      alert('Error resetting training environment: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="app-title-tag">
            <Shield size={18} color="#06b6d4" />
            <span>SOC L1 Training</span>
          </div>
          <span className="tag-badge tag-training">
            Environment: Training
          </span>
          <span className="tag-badge tag-analyst">
            <User size={12} />
            Analyst: L1 Analyst
          </span>
        </div>

        <div className="top-bar-right">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowConfirm(true)}
            title="Reset training logs to default sample state"
          >
            <RotateCcw size={13} />
            Reset Environment
          </button>
        </div>
      </header>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <AlertTriangle size={18} color="#f59e0b" />
                Reset Training State?
              </div>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                This will clear any newly ingested events, active triage notes, created incidents, and cases, and reload the initial 10 pre-staged security events from <code>data/events.json</code>.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowConfirm(false)}
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                className="btn btn-warning btn-sm"
                onClick={handleReset}
                disabled={resetting}
              >
                {resetting ? 'Resetting...' : 'Yes, Reset Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
