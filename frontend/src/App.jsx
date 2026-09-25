import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';

import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import AlertsPage from './pages/AlertsPage';
import AlertInvestigationPage from './pages/AlertInvestigationPage';
import IncidentsPage from './pages/IncidentsPage';
import CasesPage from './pages/CasesPage';
import ArchitecturePage from './pages/ArchitecturePage';
import LabsPage from './pages/LabsPage';
import KnowledgeChecksPage from './pages/KnowledgeChecksPage';

import { fetchStats, fetchAlerts } from './api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);

  const refreshGlobalData = async () => {
    try {
      const [sData, aData] = await Promise.all([
        fetchStats(),
        fetchAlerts()
      ]);
      setStats(sData);
      setAlerts(aData);
    } catch (err) {
      console.error('Error fetching global telemetry:', err);
    }
  };

  useEffect(() => {
    refreshGlobalData();
    const interval = setInterval(refreshGlobalData, 10000); // 10s polling
    return () => clearInterval(interval);
  }, []);

  const handleSelectAlert = (alertId) => {
    setSelectedAlertId(alertId);
    setCurrentPage('investigation');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app-container">
      {/* Left Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        stats={stats}
      />

      {/* Main Workspace */}
      <div className="main-wrapper">
        <TopNav onResetSuccess={() => {
          refreshGlobalData();
          setCurrentPage('dashboard');
        }} />

        <main style={{ flex: 1 }}>
          {currentPage === 'dashboard' && (
            <DashboardPage
              stats={stats}
              alerts={alerts}
              onSelectAlert={handleSelectAlert}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'events' && (
            <EventsPage />
          )}

          {currentPage === 'alerts' && (
            <AlertsPage onSelectAlert={handleSelectAlert} />
          )}

          {currentPage === 'investigation' && (
            <AlertInvestigationPage
              alertId={selectedAlertId || (alerts[0]?.id || 'ALT-002')}
              onBack={() => setCurrentPage('alerts')}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'incidents' && (
            <IncidentsPage
              onSelectAlert={handleSelectAlert}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'cases' && (
            <CasesPage onSelectAlert={handleSelectAlert} />
          )}

          {currentPage === 'architecture' && (
            <ArchitecturePage />
          )}

          {currentPage === 'labs' && (
            <LabsPage />
          )}

          {currentPage === 'knowledge-checks' && (
            <KnowledgeChecksPage />
          )}
        </main>
      </div>
    </div>
  );
}
