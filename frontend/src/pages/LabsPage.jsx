import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { fetchLab, verifyLab1, verifyLab2 } from '../api';

export default function LabsPage({ selectedLab, onSelectLab }) {
  const [internalTab, setInternalTab] = useState('lab1');
  const activeTab = selectedLab || internalTab;
  const setActiveTab = onSelectLab || setInternalTab;

  // Lab 1 State
  const [lab1Data, setLab1Data] = useState(null);
  const [lab1Form, setLab1Form] = useState({
    what_happened: '',
    user: '',
    host: '',
    source_ip: '',
    failed_count: '',
    evidence: '',
    severity: 'Medium',
    final_decision: 'Suspicious'
  });
  const [lab1Result, setLab1Result] = useState(null);
  const [checking1, setChecking1] = useState(false);

  // Lab 2 State
  const [lab2Data, setLab2Data] = useState(null);
  const [lab2Answers, setLab2Answers] = useState({});
  const [lab2Result, setLab2Result] = useState(null);
  const [checking2, setChecking2] = useState(false);

  useEffect(() => {
    fetchLab('lab1').then(setLab1Data).catch(console.error);
    fetchLab('lab2').then(setLab2Data).catch(console.error);
  }, []);

  // Handle Lab 1 Check
  const handleCheckLab1 = async (e) => {
    e.preventDefault();
    setChecking1(true);
    try {
      const res = await verifyLab1(lab1Form);
      setLab1Result(res);
    } catch (err) {
      alert('Error verifying Lab 1: ' + err.message);
    } finally {
      setChecking1(false);
    }
  };

  const resetLab1 = () => {
    setLab1Form({
      what_happened: '',
      user: '',
      host: '',
      source_ip: '',
      failed_count: '',
      evidence: '',
      severity: 'Medium',
      final_decision: 'Suspicious'
    });
    setLab1Result(null);
  };

  // Handle Lab 2 Check
  const handleCheckLab2 = async (e) => {
    e.preventDefault();
    setChecking2(true);
    try {
      const res = await verifyLab2(lab2Answers);
      setLab2Result(res);
    } catch (err) {
      alert('Error verifying Lab 2: ' + err.message);
    } finally {
      setChecking2(false);
    }
  };

  const resetLab2 = () => {
    setLab2Answers({});
    setLab2Result(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FlaskConical size={24} color="#10b981" />
            Interactive SOC L1 Training Labs
          </h1>
          <p className="page-description">
            Hands-on simulation exercises for Module 4: Alert Triage & False Positive Classification.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'lab1' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('lab1')}
          >
            Lab 1: Basic Alert Triage
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'lab2' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('lab2')}
          >
            Lab 2: False Positive Identification
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LAB 1: BASIC ALERT TRIAGE                                */}
      {/* ======================================================== */}
      {activeTab === 'lab1' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Scenario Banner */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem' }}>
              <Info size={16} />
              SCENARIO OVERVIEW
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.4rem', lineHeight: 1.6 }}>
              {lab1Data?.scenario || 'A finance employee account generates multiple failed login events from the same source IP.'}
            </p>

            {/* Evidence Sample Preview */}
            <div style={{
              background: '#070a12',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.9rem',
              marginTop: '0.75rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                TELEMETRY LOG STREAM (Windows Security Event Log):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                <div>[10:30:01] EVT001 | Event ID 4625 | User: Finance01 | Host: FIN-PC-04 | SrcIP: 10.10.20.15 | Result: failure</div>
                <div>[10:30:20] EVT002 | Event ID 4625 | User: Finance01 | Host: FIN-PC-04 | SrcIP: 10.10.20.15 | Result: failure</div>
                <div>[10:30:40] EVT003 | Event ID 4625 | User: Finance01 | Host: FIN-PC-04 | SrcIP: 10.10.20.15 | Result: failure</div>
                <div>[10:31:00] EVT004 | Event ID 4625 | User: Finance01 | Host: FIN-PC-04 | SrcIP: 10.10.20.15 | Result: failure</div>
                <div>[10:31:20] EVT005 | Event ID 4625 | User: Finance01 | Host: FIN-PC-04 | SrcIP: 10.10.20.15 | Result: failure</div>
                <div style={{ color: '#34d399' }}>[10:31:45] EVT006 | Event ID 4624 | User: Finance01 | Host: FIN-PC-04 | SrcIP: 10.10.20.15 | Result: success</div>
              </div>
            </div>
          </div>

          {/* Interactive Form */}
          <form onSubmit={handleCheckLab1}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                Learner Triage Submission (Answer all 8 items)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {/* 1. What Happened */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    1. What happened?
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Multiple failed logins followed by success"
                    value={lab1Form.what_happened}
                    onChange={(e) => setLab1Form({ ...lab1Form, what_happened: e.target.value })}
                  />
                </div>

                {/* 2. User */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    2. Affected User:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Finance01"
                    required
                    value={lab1Form.user}
                    onChange={(e) => setLab1Form({ ...lab1Form, user: e.target.value })}
                  />
                </div>

                {/* 3. Host */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    3. Affected Host:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. FIN-PC-04"
                    required
                    value={lab1Form.host}
                    onChange={(e) => setLab1Form({ ...lab1Form, host: e.target.value })}
                  />
                </div>

                {/* 4. Source IP */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    4. Source IP:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 10.10.20.15"
                    required
                    value={lab1Form.source_ip}
                    onChange={(e) => setLab1Form({ ...lab1Form, source_ip: e.target.value })}
                  />
                </div>

                {/* 5. Number of failed attempts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    5. Number of Failed Attempts:
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Count of 4625 events"
                    required
                    value={lab1Form.failed_count}
                    onChange={(e) => setLab1Form({ ...lab1Form, failed_count: e.target.value })}
                  />
                </div>

                {/* 6. Related Evidence */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    6. Related Evidence (Event IDs):
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 4625, 4624"
                    required
                    value={lab1Form.evidence}
                    onChange={(e) => setLab1Form({ ...lab1Form, evidence: e.target.value })}
                  />
                </div>

                {/* 7. Severity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    7. Assigned Severity:
                  </label>
                  <select
                    className="form-select"
                    value={lab1Form.severity}
                    onChange={(e) => setLab1Form({ ...lab1Form, severity: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>

                {/* 8. Final Decision */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    8. Final Decision:
                  </label>
                  <select
                    className="form-select"
                    value={lab1Form.final_decision}
                    onChange={(e) => setLab1Form({ ...lab1Form, final_decision: e.target.value })}
                  >
                    <option value="Suspicious">Suspicious</option>
                    <option value="Benign">Benign</option>
                    <option value="False Positive">False Positive</option>
                    <option value="Needs More Investigation">Needs More Investigation</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
                <button type="submit" className="btn btn-primary" disabled={checking1}>
                  <CheckCircle2 size={14} />
                  {checking1 ? 'Checking...' : 'Check Answer'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={resetLab1}>
                  <RotateCcw size={12} /> Reset Lab
                </button>
              </div>
            </div>
          </form>

          {/* Feedback Display */}
          {lab1Result && (
            <div style={{
              background: lab1Result.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
              border: `1px solid ${lab1Result.passed ? '#10b981' : '#f43f5e'}`,
              borderRadius: '10px',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {lab1Result.passed ? (
                    <CheckCircle2 size={22} color="#10b981" />
                  ) : (
                    <XCircle size={22} color="#f43f5e" />
                  )}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                    Score: {lab1Result.score} / {lab1Result.total} — {lab1Result.feedback}
                  </h3>
                </div>
                <span className="badge" style={{ background: lab1Result.passed ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)', color: lab1Result.passed ? '#34d399' : '#fb7185' }}>
                  {lab1Result.passed ? 'PASS' : 'RETRY'}
                </span>
              </div>

              {/* Detailed Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                {Object.entries(lab1Result.field_results || {}).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      background: '#0b0f19',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${val.correct ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        {key.replace('_', ' ')}
                      </span>
                      {val.correct ? (
                        <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>✓ Correct</span>
                      ) : (
                        <span style={{ color: '#f43f5e', fontSize: '0.75rem', fontWeight: 700 }}>✗ Incorrect</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#fff', marginTop: '0.2rem' }}>
                      Submitted: <code>{String(val.submitted || 'Blank')}</code>
                    </div>
                    {!val.correct && (
                      <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.2rem' }}>
                        Expected: {String(val.expected)}
                      </div>
                    )}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      {val.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* LAB 2: FALSE POSITIVE IDENTIFICATION                     */}
      {/* ======================================================== */}
      {activeTab === 'lab2' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Classification definitions */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem'
          }}>
            <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Topic 4 Guide: False Positive Classifications
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ background: '#0b0f19', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#60a5fa' }}>EXPECTED ACTIVITY</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.75rem' }}>
                  Authorized administrator routine, vulnerability scanner, or approved scheduled testing.
                </p>
              </div>
              <div style={{ background: '#0b0f19', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#34d399' }}>BENIGN ACTIVITY</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.75rem' }}>
                  Accidental employee mistyped password, minor user error, not an intentional attack.
                </p>
              </div>
              <div style={{ background: '#0b0f19', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#fbbf24' }}>DETECTION ERROR</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.75rem' }}>
                  Overly broad SIEM rule logic, incomplete regex, or software query bug matching harmless text.
                </p>
              </div>
              <div style={{ background: '#0b0f19', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#f43f5e' }}>SUSPICIOUS ACTIVITY</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.75rem' }}>
                  Unknown external IP brute-force or unauthorized privilege escalation requiring investigation.
                </p>
              </div>
            </div>
          </div>

          {/* Scenarios Form */}
          <form onSubmit={handleCheckLab2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(lab2Data?.scenarios || []).map((sc, idx) => (
                <div
                  key={sc.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className="mono-cell" style={{ color: '#38bdf8', fontWeight: 700 }}>
                      Scenario {idx + 1}
                    </span>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{sc.title}</strong>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {sc.description}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                      'EXPECTED ACTIVITY',
                      'BENIGN ACTIVITY',
                      'DETECTION ERROR',
                      'SUSPICIOUS ACTIVITY'
                    ].map((cat) => (
                      <label
                        key={cat}
                        className={`radio-card ${lab2Answers[sc.id] === cat ? 'selected' : ''}`}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                      >
                        <input
                          type="radio"
                          name={`scenario_${sc.id}`}
                          value={cat}
                          checked={lab2Answers[sc.id] === cat}
                          onChange={() => setLab2Answers({ ...lab2Answers, [sc.id]: cat })}
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>

                  {/* If result available, show feedback for this scenario */}
                  {lab2Result && lab2Result.results?.[sc.id] && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      background: lab2Result.results[sc.id].is_correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                      border: `1px solid ${lab2Result.results[sc.id].is_correct ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem', color: lab2Result.results[sc.id].is_correct ? '#34d399' : '#fb7185' }}>
                        {lab2Result.results[sc.id].is_correct ? '✓ Correct Classification' : `✗ Incorrect — Correct: ${lab2Result.results[sc.id].correct}`}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {lab2Result.results[sc.id].explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button type="submit" className="btn btn-primary" disabled={checking2}>
                  <CheckCircle2 size={14} />
                  {checking2 ? 'Submitting...' : 'Submit & Check Classifications'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={resetLab2}>
                  <RotateCcw size={12} /> Reset Lab 2
                </button>
                {lab2Result && (
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: lab2Result.passed ? '#34d399' : '#fbbf24' }}>
                    Total Score: {lab2Result.score} / {lab2Result.total}
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
