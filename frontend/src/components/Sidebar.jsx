import React from 'react';
import {
  LayoutDashboard,
  Database,
  Bell,
  AlertTriangle,
  FolderLock,
  Network,
  FlaskConical,
  GraduationCap
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: Database },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'cases', label: 'Cases', icon: FolderLock },
  { id: 'architecture', label: 'SOC Architecture', icon: Network },
  { id: 'labs', label: 'Labs', icon: FlaskConical },
  { id: 'knowledge-checks', label: 'Knowledge Checks', icon: GraduationCap },
];

export default function Sidebar({ currentPage, onNavigate, stats = {} }) {
  const getBadge = (id) => {
    if (id === 'events' && stats.total_events !== undefined) return stats.total_events;
    if (id === 'alerts' && stats.open_alerts !== undefined) return stats.open_alerts;
    if (id === 'incidents' && stats.open_incidents !== undefined && stats.open_incidents > 0) return stats.open_incidents;
    if (id === 'cases' && stats.open_cases !== undefined && stats.open_cases > 0) return stats.open_cases;
    return null;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          color: '#fff',
          fontSize: '0.9rem'
        }}>
          L1
        </div>
        <div className="brand-title">
          <span>SOC ANALYST</span>
          <span className="brand-subtitle">Module 4 Operations</span>
        </div>
      </div>

      <ul className="nav-menu">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === 'alerts' && currentPage === 'investigation');
          const badge = getBadge(item.id);

          return (
            <li
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {badge !== null && <span className="nav-badge">{badge}</span>}
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          SOC Ops Training Sim
        </div>
        <div>Course: SOC Analyst L1</div>
        <div style={{ color: 'var(--accent-cyan)' }}>Active Session</div>
      </div>
    </aside>
  );
}
