import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  PlusCircle,
  FileJson,
  CheckCircle,
  XCircle,
  Shield,
  RotateCcw
} from 'lucide-react';
import { fetchEvents, ingestEvents } from '../api';
import EventJsonModal from '../components/EventJsonModal';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [hostFilter, setHostFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Ingestion Modal
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [ingestJson, setIngestJson] = useState('');
  const [ingestStatus, setIngestStatus] = useState(null);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchEvents({
        search,
        user: userFilter,
        host: hostFilter,
        event_type: typeFilter
      });
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [userFilter, hostFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEvents();
  };

  // Derive distinct options for filters
  const userOptions = useMemo(() => {
    const set = new Set(events.map(e => e.user).filter(Boolean));
    return Array.from(set);
  }, [events]);

  const hostOptions = useMemo(() => {
    const set = new Set(events.map(e => e.host).filter(Boolean));
    return Array.from(set);
  }, [events]);

  const typeOptions = useMemo(() => {
    const set = new Set(events.map(e => e.event_type).filter(Boolean));
    return Array.from(set);
  }, [events]);

  const handleClearFilters = () => {
    setSearch('');
    setUserFilter('');
    setHostFilter('');
    setTypeFilter('');
    fetchEvents().then(setEvents);
  };

  const handleIngestSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(ingestJson);
      const res = await ingestEvents(parsed);
      setIngestStatus({ success: true, message: res.message });
      setIngestJson('');
      loadEvents();
      setTimeout(() => {
        setShowIngestModal(false);
        setIngestStatus(null);
      }, 1500);
    } catch (err) {
      setIngestStatus({ success: false, message: 'Invalid JSON or ingestion error: ' + err.message });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Database size={24} color="#3b82f6" />
            Raw Security Events Log
          </h1>
          <p className="page-description">
            Ingested security telemetry records. Click any row to inspect complete JSON event schema.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadEvents}
            title="Refresh event stream"
          >
            <RotateCcw size={13} /> Refresh
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowIngestModal(true)}
          >
            <PlusCircle size={13} /> Ingest Events (POST /api/events/ingest)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 250px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '2rem' }}
              placeholder="Search user, host, IP, event ID, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        {/* Filter by User */}
        <select
          className="form-select"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          style={{ minWidth: '140px' }}
        >
          <option value="">All Users</option>
          {userOptions.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        {/* Filter by Host */}
        <select
          className="form-select"
          value={hostFilter}
          onChange={(e) => setHostFilter(e.target.value)}
          style={{ minWidth: '140px' }}
        >
          <option value="">All Hosts</option>
          {hostOptions.map(h => <option key={h} value={h}>{h}</option>)}
        </select>

        {/* Filter by Event Type */}
        <select
          className="form-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="">All Event Types</option>
          {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {(search || userFilter || hostFilter || typeFilter) && (
          <button className="btn btn-secondary btn-sm" onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Events Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Showing <strong>{events.length}</strong> event(s)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            💡 Click on any event row to view full raw JSON payload
          </div>
        </div>

        <div className="table-responsive">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>User</th>
                <th>Host</th>
                <th>Source IP</th>
                <th>Result</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Payload</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading security events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No events match the selected filters.
                  </td>
                </tr>
              ) : (
                events.map((evt) => {
                  const isFail = evt.result?.toLowerCase() === 'failure' || evt.result?.toLowerCase() === 'blocked';
                  return (
                    <tr
                      key={evt.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedEvent(evt)}
                    >
                      <td>
                        <span className="mono-cell" style={{ fontWeight: 600, color: '#38bdf8' }}>
                          {evt.id} ({evt.event_id})
                        </span>
                      </td>
                      <td>
                        <span className="mono-cell">
                          {evt.timestamp?.replace('T', ' ').slice(0, 19)}
                        </span>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                          {evt.event_type}
                        </span>
                      </td>
                      <td>
                        <span className="mono-cell" style={{ color: '#60a5fa' }}>{evt.user}</span>
                      </td>
                      <td>
                        <span className="mono-cell">{evt.host}</span>
                      </td>
                      <td>
                        <span className="mono-cell">{evt.source_ip}</span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: isFail ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isFail ? '#fb7185' : '#34d399',
                            borderColor: isFail ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          {evt.result?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {evt.description}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                          }}
                          title="View JSON"
                        >
                          <FileJson size={13} color="#06b6d4" />
                          JSON
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Viewer Modal */}
      {selectedEvent && (
        <EventJsonModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Ingest Modal */}
      {showIngestModal && (
        <div className="modal-overlay" onClick={() => setShowIngestModal(false)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleIngestSubmit}>
              <div className="modal-header">
                <div className="modal-title">
                  <PlusCircle size={18} color="#06b6d4" />
                  <span>Ingest Custom Security Events</span>
                </div>
              </div>

              <div className="modal-body">
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Submit JSON event data to <code>POST /api/events/ingest</code>. The detection rules engine will evaluate the payload and generate alerts automatically.
                </p>

                <textarea
                  className="form-textarea"
                  style={{ minHeight: '180px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  required
                  placeholder={`[
  {
    "id": "EVT999",
    "timestamp": "${new Date().toISOString()}",
    "event_type": "authentication",
    "event_id": "4625",
    "user": "Finance01",
    "host": "FIN-PC-04",
    "source_ip": "10.10.20.15",
    "destination_ip": "10.10.20.40",
    "action": "login",
    "result": "failure",
    "description": "Custom authentication failure"
  }
]`}
                  value={ingestJson}
                  onChange={(e) => setIngestJson(e.target.value)}
                />

                {ingestStatus && (
                  <div style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    background: ingestStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: ingestStatus.success ? '#34d399' : '#fb7185',
                    border: `1px solid ${ingestStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                  }}>
                    {ingestStatus.message}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowIngestModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Ingest & Run Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
