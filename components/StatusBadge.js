import React from 'react';
import { Clock, CheckCircle2, CheckCheck, XCircle } from 'lucide-react';

const statusConfig = {
  pending: {
    label: 'Pending Approval',
    className: 'badge-pending',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    className: 'badge-approved',
    icon: CheckCircle2,
  },
  completed: {
    label: 'Completed',
    className: 'badge-completed',
    icon: CheckCheck,
  },
  rejected: {
    label: 'Rejected',
    className: 'badge-rejected',
    icon: XCircle,
  },
};

export default function StatusBadge({ status, showIcon = true, size = 'md' }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'badge-default',
    icon: Clock,
  };

  const Icon = config.icon;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`status-badge ${config.className} badge-${size}`}>
      {showIcon && <Icon size={iconSize} className="badge-icon" />}
      <span className="badge-text">{config.label}</span>
    </span>
  );
}
