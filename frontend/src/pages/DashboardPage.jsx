import React from 'react';
import {
  Database,
  Bell,
  AlertTriangle,
  FolderLock,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import WorkflowBanner from '../components/WorkflowBanner';

export default function DashboardPage({ stats, alerts, onSelectAlert, onNavigate }) {
  const recentAlerts = alerts.slice(0, 6);

  const formatTime = (ts) => {
    if (!ts) return 'N/A';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldCheck size={24} color="#06b6d4" />
            SOC Operations Center (L1)
          </h1>
          <p className="page-description">
            Live operations workspace for Module 4 — Security monitoring, triage, and escalation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('events')}>
            <Database size={13} /> View Events
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('alerts')}>
            <Bell size={13} /> View All Alerts
          </button>
        </div>
      </div>

      {/* SOC L1 Workflow Banner */}
      <WorkflowBanner currentStep="monitor" onStepClick={onNavigate} />

      {/* Summary Cards */}
      <div className="cards-grid">
        <div className="stat-card" onClick={() => onNavigate('events')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span>Total Events</span>
            <Database size={16} color="#60a5fa" />
          </div>
          <div className="stat-value">{stats.total_events ?? 0}</div>
          <div className="stat-sub">Ingested security logs</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('alerts')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span>Open Alerts</span>
            <Bell size={16} color="#f43f5e" />
          </div>
          <div className="stat-value" style={{ color: stats.open_alerts > 0 ? '#fb7185' : '#fff' }}>
            {stats.open_alerts ?? 0}
          </div>
          <div className="stat-sub">Awaiting L1 analyst triage</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Medium Alerts</span>
            <ShieldAlert size={16} color="#f59e0b" />
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {stats.medium_alerts ?? 0}
          </div>
          <div className="stat-sub">Potential compromise / attacks</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Low Alerts</span>
            <ShieldCheck size={16} color="#06b6d4" />
          </div>
          <div className="stat-value" style={{ color: '#38bdf8' }}>
            {stats.low_alerts ?? 0}
          </div>
          <div className="stat-sub">Benign & baseline operations</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('incidents')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span>Open Incidents</span>
            <AlertTriangle size={16} color="#f59e0b" />
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {stats.open_incidents ?? 0}
          </div>
          <div className="stat-sub">Confirmed security incidents</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('cases')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span>Open Cases</span>
            <FolderLock size={16} color="#8b5cf6" />
          </div>
          <div className="stat-value" style={{ color: '#c084fc' }}>
            {stats.open_cases ?? 0}
          </div>
          <div className="stat-sub">Documented investigations</div>
        </div>
      </div>

      {/* Severity Indicator & Distribution bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            CURRENT ALERT SEVERITY DISTRIBUTION
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Module 4 Scope: Low & Medium Tiers Only
          </div>
        </div>

        <div style={{
          display: 'flex',
          height: '10px',
          borderRadius: '5px',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.05)',
          gap: '2px'
        }}>
          <div
            style={{
              width: `${((stats.medium_alerts || 0) / Math.max(1, (stats.medium_alerts || 0) + (stats.low_alerts || 0))) * 100}%`,
              background: '#f59e0b',
              transition: 'width 0.3s'
            }}
            title={`Medium Severity: ${stats.medium_alerts || 0}`}
          />
          <div
            style={{
              width: `${((stats.low_alerts || 0) / Math.max(1, (stats.medium_alerts || 0) + (stats.low_alerts || 0))) * 100}%`,
              background: '#06b6d4',
              transition: 'width 0.3s'
            }}
            title={`Low Severity: ${stats.low_alerts || 0}`}
          />
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Medium:</span>
            <strong style={{ color: '#fff' }}>{stats.medium_alerts || 0}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Low:</span>
            <strong style={{ color: '#fff' }}>{stats.low_alerts || 0}</strong>
          </div>
        </div>
      </div>

      {/* Recent Alerts Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={16} color="#06b6d4" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
              Recent Alerts Ingestion Queue
            </span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('alerts')}>
            View All ({alerts.length})
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Alert</th>
                <th>User</th>
                <th>Host</th>
                <th>Source IP</th>
                <th>Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No alerts in queue. Events are being monitored.
                  </td>
                </tr>
              ) : (
                recentAlerts.map((al) => (
                  <tr key={al.id} style={{ cursor: 'pointer' }} onClick={() => onSelectAlert(al.id)}>
                    <td>
                      <SeverityBadge severity={al.severity} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{al.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{al.id} • {al.event_count} event(s)</div>
                    </td>
                    <td>
                      <span className="mono-cell" style={{ color: '#38bdf8' }}>{al.user}</span>
                    </td>
                    <td>
                      <span className="mono-cell">{al.host}</span>
                    </td>
                    <td>
                      <span className="mono-cell">{al.source_ip}</span>
                    </td>
                    <td>
                      <span className="mono-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        {formatTime(al.timestamp)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={al.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlert(al.id);
                        }}
                      >
                        Triage Alert
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* L1 Learning Tip */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '10px',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '0.5rem', borderRadius: '8px' }}>
          <Sparkles size={20} color="#06b6d4" />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            L1 Analyst Operational Tip — Module 4 Workflow
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            When an alert appears, never jump straight to conclusions. Follow the 5-step triage sequence:
            <strong> 1. Understand what triggered the alert</strong> &rarr;
            <strong> 2. Identify the user identity</strong> &rarr;
            <strong> 3. Identify the affected host</strong> &rarr;
            <strong> 4. Check the source IP & network path</strong> &rarr;
            <strong> 5. Examine raw event evidence</strong> before assigning severity or deciding on escalation!
          </div>
        </div>
      </div>
    </div>
  );
}
