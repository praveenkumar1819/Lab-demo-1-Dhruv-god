import React, { useState } from 'react';
import {
  Network,
  Users,
  Cpu,
  Database,
  ArrowDown,
  Info,
  Shield,
  Layers,
  Sparkles,
  UserCheck,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react';

const ARCH_NODES = {
  // People
  l1: {
    title: 'L1 SOC Analyst (Triage)',
    category: 'PEOPLE',
    desc: 'The frontline security defender. Monitors alerts in real time, conducts initial triage, validates false positives, assigns severity, and either closes or escalates to L2.',
    keyTasks: ['Review SIEM alert queue', 'Identify affected user, host, IP', 'Distinguish benign from suspicious', 'Document findings and open incidents/cases']
  },
  l2: {
    title: 'L2 Incident Responder (Deep Dive)',
    category: 'PEOPLE',
    desc: 'Handles escalated alerts requiring in-depth host forensics, malware sandbox analysis, endpoint containment, and threat actor eradication.',
    keyTasks: ['Memory dump analysis', 'Contain infected hosts from network', 'Analyze malware samples', 'Root cause remediation']
  },
  l3: {
    title: 'L3 Threat Hunter / Senior Specialist',
    category: 'PEOPLE',
    desc: 'Proactively hunts for stealthy adversaries that bypass automated detections. Develops advanced Sigma and YARA correlation rules.',
    keyTasks: ['Proactive hypothesis-driven threat hunting', 'Reverse-engineer custom malware', 'Write custom detection logic', 'Emulate adversary TTPs']
  },
  manager: {
    title: 'SOC Manager',
    category: 'PEOPLE',
    desc: 'Oversees day-to-day SOC operations, metrics (MTTD, MTTR), staffing, compliance audits, and executive briefing.',
    keyTasks: ['Manage shift rotations and SLAs', 'Track Mean Time to Detect & Respond', 'Budget and vendor management', 'Executive risk reporting']
  },

  // Technology
  siem: {
    title: 'SIEM (Security Information & Event Management)',
    category: 'TECHNOLOGY',
    desc: 'The central brain of the SOC. Ingests, normalizes, and correlates billions of logs across the enterprise to trigger actionable alerts.',
    keyTasks: ['Log ingestion and parsing', 'Correlation rule evaluation', 'Alert generation and dispatch', 'Historical log search and retention']
  },
  edr: {
    title: 'EDR (Endpoint Detection & Response)',
    category: 'TECHNOLOGY',
    desc: 'Installed on workstations and servers to record process executions, network connections, file modifications, and enable remote host isolation.',
    keyTasks: ['Record process trees and child processes', 'Isolate hosts with one click', 'Detect in-memory injections', 'Live remote shell for analysts']
  },
  network: {
    title: 'Network Monitoring & NTA/NDR',
    category: 'TECHNOLOGY',
    desc: 'Analyzes network traffic, NetFlow, and packet captures to detect beaconing, port scans, and unusual egress data transfers.',
    keyTasks: ['Flow analytics (NetFlow/IPFIX)', 'Snort / Suricata IDS signatures', 'DNS query tunneling detection', 'Deep packet inspection']
  },
  email: {
    title: 'Email Security Gateway',
    category: 'TECHNOLOGY',
    desc: 'Inspects inbound and outbound emails, attachments, and URLs to block phishing, business email compromise (BEC), and spam.',
    keyTasks: ['Attachment detonation sandbox', 'DKIM / SPF / DMARC verification', 'URL link rewriting & click protection', 'Phishing reporting button handling']
  },
  ti: {
    title: 'Threat Intelligence Platform (TIP)',
    category: 'TECHNOLOGY',
    desc: 'Aggregates threat feeds (IP reputations, malicious domains, file hashes, adversary TTPs) to enrich SIEM alerts with context.',
    keyTasks: ['Automated IOC enrichment', 'MITRE ATT&CK mapping', 'Adversary tracking and attribution', 'Feed ingestion and deduplication']
  },

  // Pipeline Flow Nodes
  sources: {
    title: '1. Security Sources',
    category: 'DATA PIPELINE',
    desc: 'All physical and virtual assets generating raw digital breadcrumbs: employee laptops, domain controllers, firewall appliances, cloud workloads, and database clusters.',
    keyTasks: ['Syslog forwarding', 'Windows Event Forwarding (WEF)', 'API audit streams (AWS/Azure/GCP)', 'Endpoint agent telemetries']
  },
  data: {
    title: '2. Security Data (Telemetry)',
    category: 'DATA PIPELINE',
    desc: 'The raw logs and packet streams. Examples include Windows Event ID 4625 (Logon Failure), 4624 (Logon Success), Cisco firewall denies, and web proxy access entries.',
    keyTasks: ['Standardized schema (CEF, ECS)', 'Time synchronization (NTP)', 'Log integrity checking']
  },
  detection: {
    title: '4. Detection Rules Engine',
    category: 'DATA PIPELINE',
    desc: 'Pre-programmed logic comparing real-time logs against threat thresholds (e.g. 5 failed logins within 5 minutes from same IP).',
    keyTasks: ['Threshold logic', 'Behavioral anomaly modeling', 'False positive suppression']
  },
  alert_node: {
    title: '5. Security Alert',
    category: 'DATA PIPELINE',
    desc: 'An automated high-priority notification produced when a detection rule matches. Placed into the L1 analyst triage queue.',
    keyTasks: ['Severity scoring (Low/Medium)', 'Queue prioritization', 'Notification dispatch']
  },
  triage_node: {
    title: '7. Triage & Validation',
    category: 'DATA PIPELINE',
    desc: 'L1 analyst reviews the evidence, identifies the affected user, host, and IP, and evaluates whether the event is expected, benign, or suspicious.',
    keyTasks: ['Verify user context', 'Check IP reputation', 'Inspect related event logs', 'Classify false positives vs true threats']
  },
  case_node: {
    title: '8. Incident / Case Management',
    category: 'DATA PIPELINE',
    desc: 'Documented record of the investigation containing timeline, affected assets, analyst hypotheses, indicators of compromise, and final resolution.',
    keyTasks: ['Chain of custody documentation', 'Post-incident review', 'Escalation to stakeholders']
  }
};

export default function ArchitecturePage() {
  const [selectedNode, setSelectedNode] = useState(null);

  const openNode = (key) => {
    setSelectedNode(ARCH_NODES[key] || null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Network size={24} color="#06b6d4" />
            SOC Architecture & Operational Data Flow
          </h1>
          <p className="page-description">
            Topic 1 Visual Guide — The foundational pillars of a Security Operations Center and the journey of a security event.
          </p>
        </div>
      </div>

      {/* Top Pillars Overview */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Layers size={18} color="#06b6d4" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
            The Four Core Pillars of a SOC
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* 1. PEOPLE */}
          <div style={{ background: '#0b0f19', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontWeight: 700, fontSize: '0.85rem' }}>
              <Users size={16} />
              PEOPLE (The Team)
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0.75rem 0' }}>
              Human intelligence and decision making across tiered roles:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => openNode('l1')}>
                • <strong>L1 Analyst</strong> (Frontline Triage & Monitoring)
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => openNode('l2')}>
                • <strong>L2 Analyst</strong> (Deep Incident Response)
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => openNode('l3')}>
                • <strong>L3 Analyst</strong> (Threat Hunter & Content Dev)
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => openNode('manager')}>
                • <strong>SOC Manager</strong> (Operations & Governance)
              </button>
            </div>
          </div>

          {/* 2. PROCESS */}
          <div style={{ background: '#0b0f19', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
              <CheckCircle size={16} />
              PROCESS (Workflows)
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0.75rem 0' }}>
              Structured repeatable procedures (Standard Operating Procedures - SOPs):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
              <div style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                <strong style={{ color: '#fff' }}>1. Monitor:</strong> Ingest real-time telemetry 24x7.
              </div>
              <div style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                <strong style={{ color: '#fff' }}>2. Detect:</strong> Evaluate rule matches against logs.
              </div>
              <div style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                <strong style={{ color: '#fff' }}>3. Analyze:</strong> Validate identity, evidence, false positives.
              </div>
              <div style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                <strong style={{ color: '#fff' }}>4. Respond:</strong> Contain, isolate, remediate, or escalate.
              </div>
            </div>
          </div>

          {/* 3. TECHNOLOGY */}
          <div style={{ background: '#0b0f19', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontWeight: 700, fontSize: '0.85rem' }}>
              <Cpu size={16} />
              TECHNOLOGY (Tools)
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0.75rem 0' }}>
              Integrated security tooling stack providing visibility & response:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => openNode('siem')}>
                • <strong>SIEM</strong> (Central log aggregation & rules)
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => openNode('edr')}>
                • <strong>EDR</strong> (Endpoint detection & isolation)
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => openNode('network')}>
                • <strong>Network Monitoring</strong> (IDS/IPS & NetFlow)
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => openNode('email')}>
                • <strong>Email Security</strong> (Anti-phishing gateways)
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => openNode('ti')}>
                • <strong>Threat Intelligence</strong> (IOC feeds & enrichment)
              </button>
            </div>
          </div>

          {/* 4. DATA */}
          <div style={{ background: '#0b0f19', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>
              <Database size={16} />
              DATA (Telemetry Sources)
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0.75rem 0' }}>
              The foundational raw telemetry across all business domains:
            </p>
            <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li><strong>Users</strong>: Authentication, MFA, SSO, privilege elevations</li>
              <li><strong>Endpoints</strong>: Laptops, workstations, process executions</li>
              <li><strong>Servers</strong>: Active Directory, database query logs, IIS/Nginx</li>
              <li><strong>Networks</strong>: Firewalls, VPNs, switches, DNS queries</li>
              <li><strong>Applications & Cloud</strong>: SaaS, AWS CloudTrail, Office 365</li>
            </ul>
          </div>
        </div>
      </div>

      {/* End-to-End Data Pipeline Flow Diagram */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#06b6d4" />
              End-to-End SOC Data Pipeline Flow
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Follow the journey from an initial raw user action to a finalized security case. Click any node to read its operational significance.
            </p>
          </div>
        </div>

        {/* Interactive Flow Nodes */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '850px',
          margin: '0 auto'
        }}>
          {[
            { key: 'sources', title: 'Security Sources', sub: 'Users, Endpoints, Workstations, Firewalls, Cloud', color: '#60a5fa' },
            { key: 'data', title: 'Security Data', sub: 'Event ID 4625 (Fail), 4624 (Success), Syslog, NetFlow', color: '#38bdf8' },
            { key: 'siem', title: 'Monitoring / SIEM', sub: 'Centralized Log Ingestion, Parsing, Normalization', color: '#818cf8' },
            { key: 'detection', title: 'Detection Rules Engine', sub: 'RULE 1: >= 5 Failed Logins in 5 Min -> Trigger', color: '#c084fc' },
            { key: 'alert_node', title: 'Security Alert Created', sub: 'Alert ID ALT-002 (Medium Severity) Enqueued', color: '#f59e0b' },
            { key: 'l1', title: 'SOC L1 Analyst Workspace', sub: 'First Responder Picks Up Alert From Queue', color: '#34d399' },
            { key: 'triage_node', title: 'Triage & Evidence Validation', sub: 'Understand Alert -> Check User, Host, IP -> Inspect Events', color: '#06b6d4' },
            { key: 'case_node', title: 'Incident / Case Management', sub: 'Document Findings, IOCs, Notes, and Final Resolution', color: '#f43f5e' }
          ].map((item, idx, arr) => (
            <React.Fragment key={item.key}>
              <div
                onClick={() => openNode(item.key)}
                style={{
                  background: '#0b0f19',
                  border: `1px solid ${item.color}40`,
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = item.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = `${item.color}40`;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: `${item.color}20`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {item.sub}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: item.color, fontSize: '0.75rem', fontWeight: 600 }}>
                  <Info size={14} />
                  Learn More
                </div>
              </div>

              {idx < arr.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <ArrowDown size={18} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Explainer Modal */}
      {selectedNode && (
        <div className="modal-overlay" onClick={() => setSelectedNode(null)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Info size={18} color="#06b6d4" />
                <span>{selectedNode.title}</span>
              </div>
            </div>

            <div className="modal-body">
              <span className="badge badge-sev-low" style={{ marginBottom: '0.5rem' }}>
                {selectedNode.category}
              </span>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {selectedNode.desc}
              </p>

              {selectedNode.keyTasks && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    KEY OPERATIONAL RESPONSIBILITIES:
                  </div>
                  <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {selectedNode.keyTasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedNode(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
