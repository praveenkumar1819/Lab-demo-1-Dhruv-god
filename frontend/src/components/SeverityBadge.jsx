import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export default function SeverityBadge({ severity }) {
  const sev = (severity || 'Low').toLowerCase();
  if (sev === 'medium') {
    return (
      <span className="badge badge-sev-medium">
        <ShieldAlert size={12} />
        MEDIUM
      </span>
    );
  }
  return (
    <span className="badge badge-sev-low">
      <AlertCircle size={12} />
      LOW
    </span>
  );
}
