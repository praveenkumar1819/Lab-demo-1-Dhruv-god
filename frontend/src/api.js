// API client for SOC L1 Training Dashboard
const BASE_URL = '/api';

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchEvents(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.user) query.set('user', params.user);
  if (params.host) query.set('host', params.host);
  if (params.event_type) query.set('event_type', params.event_type);
  if (params.result) query.set('result', params.result);

  const res = await fetch(`${BASE_URL}/events?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEventById(id) {
  const res = await fetch(`${BASE_URL}/events/${id}`);
  if (!res.ok) throw new Error('Failed to fetch event');
  return res.json();
}

export async function ingestEvents(events) {
  const res = await fetch(`${BASE_URL}/events/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(events)
  });
  if (!res.ok) throw new Error('Failed to ingest events');
  return res.json();
}

export async function fetchAlerts(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.severity) query.set('severity', params.severity);

  const res = await fetch(`${BASE_URL}/alerts?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchAlertDetail(id) {
  const res = await fetch(`${BASE_URL}/alerts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch alert details');
  return res.json();
}

export async function updateAlert(id, updates) {
  const res = await fetch(`${BASE_URL}/alerts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update alert');
  return res.json();
}

export async function fetchIncidents(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);

  const res = await fetch(`${BASE_URL}/incidents?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchIncidentDetail(id) {
  const res = await fetch(`${BASE_URL}/incidents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch incident');
  return res.json();
}

export async function createIncident(data) {
  const res = await fetch(`${BASE_URL}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create incident');
  return res.json();
}

export async function updateIncident(id, updates) {
  const res = await fetch(`${BASE_URL}/incidents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update incident');
  return res.json();
}

export async function fetchCases(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);

  const res = await fetch(`${BASE_URL}/cases?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export async function fetchCaseDetail(id) {
  const res = await fetch(`${BASE_URL}/cases/${id}`);
  if (!res.ok) throw new Error('Failed to fetch case detail');
  return res.json();
}

export async function createCase(data) {
  const res = await fetch(`${BASE_URL}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create case');
  return res.json();
}

export async function updateCase(id, updates) {
  const res = await fetch(`${BASE_URL}/cases/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update case');
  return res.json();
}

export async function resetEnvironment() {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset environment');
  return res.json();
}

export async function fetchKnowledgeChecks() {
  const res = await fetch(`${BASE_URL}/knowledge-checks`);
  if (!res.ok) throw new Error('Failed to fetch knowledge checks');
  return res.json();
}

export async function fetchLab(labId) {
  const res = await fetch(`${BASE_URL}/labs/${labId}`);
  if (!res.ok) throw new Error(`Failed to fetch ${labId}`);
  return res.json();
}

export async function verifyLab1(submission) {
  const res = await fetch(`${BASE_URL}/labs/1/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission)
  });
  if (!res.ok) throw new Error('Failed to verify Lab 1');
  return res.json();
}

export async function verifyLab2(submission) {
  const res = await fetch(`${BASE_URL}/labs/2/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission)
  });
  if (!res.ok) throw new Error('Failed to verify Lab 2');
  return res.json();
}
