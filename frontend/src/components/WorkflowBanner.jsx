import React from 'react';
import { ChevronRight, Compass } from 'lucide-react';

const STEPS = [
  { id: 'monitor', label: 'Monitor', page: 'events' },
  { id: 'detect', label: 'Detect', page: 'events' },
  { id: 'alert', label: 'Alert', page: 'alerts' },
  { id: 'triage', label: 'Triage', page: 'investigation' },
  { id: 'validate', label: 'Validate', page: 'investigation' },
  { id: 'severity', label: 'Severity', page: 'investigation' },
  { id: 'document', label: 'Document', page: 'cases' },
  { id: 'close_escalate', label: 'Close / Escalate', page: 'incidents' },
];

export default function WorkflowBanner({ currentStep = 'monitor', onStepClick }) {
  return (
    <div className="workflow-stepper">
      <div className="workflow-label">
        <Compass size={14} />
        SOC L1 Workflow
      </div>
      <div className="workflow-steps">
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          return (
            <React.Fragment key={step.id}>
              <div
                className={`wf-step ${isActive ? 'active' : ''}`}
                onClick={() => onStepClick && onStepClick(step.page)}
                style={{ cursor: onStepClick ? 'pointer' : 'default' }}
                title={`Workflow phase: ${step.label}`}
              >
                {step.label}
              </div>
              {idx < STEPS.length - 1 && <span className="wf-arrow">→</span>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
