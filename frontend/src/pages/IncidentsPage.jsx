import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  FolderLock,
  ArrowRight,
  Clock,
  RotateCcw,
  CheckCircle,
  Eye
} from 'lucide-react';
import { fetchIncidents, updateIncident } from '../api';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import CreateCaseModal from '../components/CreateCaseModal';

export default function IncidentsPage({ onSelectAlert, onNavigate }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncidentForCase, setSelectedIncidentForCase] = useState(null);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleStatusChange = async (incId, newStatus) => {
    try {
      await updateIncident(incId, { status: newStatus });
      loadIncidents();
    } catch (err) {
      alert('Error updating incident: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <AlertTriangle size={24} color="#f59e0b" />
            Security Incidents Tracker
          </h1>
          <p className="page-description">
            Validated security alerts promoted to confirmed incidents requiring active response.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={loadIncidents}>
          <RotateCcw size={13} /> Refresh Incidents
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Total Incidents: <strong>{incidents.length}</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Statuses: OPEN &bull; INVESTIGATING &bull; RESOLVED
          </div>
        </div>

        <div className="table-responsive">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Affected User</th>
                <th>Affected Host</th>
                <th>Source IP</th>
                <th>Status</th>
                <th>Created Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading incidents...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No security incidents have been declared yet. You can promote any alert into an incident from the Alert Investigation page.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td>
                      <span className="mono-cell" style={{ fontWeight: 700, color: '#fbbf24' }}>
                        {inc.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{inc.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Linked Alert: <a href="#" onClick={(e) => { e.preventDefault(); onSelectAlert(inc.alert_id); }} style={{ color: '#38bdf8' }}>{inc.alert_id}</a>
                      </div>
                    </td>
                    <td>
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td>
                      <span className="mono-cell" style={{ color: '#60a5fa' }}>{inc.affected_user}</span>
                    </td>
                    <td>
                      <span className="mono-cell">{inc.affected_host}</span>
                    </td>
                    <td>
                      <span className="mono-cell">{inc.source_ip}</span>
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        value={inc.status}
                        onChange={(e) => handleStatusChange(inc.id, e.target.value)}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="INVESTIGATING">INVESTIGATING</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </td>
                    <td>
                      <span className="mono-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        {inc.created_at?.replace('T', ' ').slice(0, 19)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectAlert(inc.alert_id)}
                          title="View Linked Alert"
                        >
                          <Eye size={12} />
                          Alert
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedIncidentForCase(inc)}
                          title="Open Case from Incident"
                        >
                          <FolderLock size={12} />
                          Open Case
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Case from Incident Modal */}
      {selectedIncidentForCase && (
        <CreateCaseModal
          incident={selectedIncidentForCase}
          onClose={() => setSelectedIncidentForCase(null)}
          onSuccess={(newCase) => {
            alert('Case ' + newCase.id + ' opened for incident ' + selectedIncidentForCase.id);
            onNavigate('cases');
          }}
        />
      )}
    </div>
  );
}
