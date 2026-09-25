import React from 'react';

export default function StatusBadge({ status }) {
  const st = (status || 'OPEN').toUpperCase();
  let className = 'badge badge-status-open';

  if (st === 'IN_PROGRESS' || st === 'IN PROGRESS') {
    className = 'badge badge-status-in-progress';
  } else if (st === 'CLOSED') {
    className = 'badge badge-status-closed';
  } else if (st === 'ESCALATED') {
    className = 'badge badge-status-escalated';
  } else if (st === 'RESOLVED') {
    className = 'badge badge-status-resolved';
  } else if (st === 'INVESTIGATING') {
    className = 'badge badge-status-investigating';
  }

  return (
    <span className={className}>
      {st.replace('_', ' ')}
    </span>
  );
}
