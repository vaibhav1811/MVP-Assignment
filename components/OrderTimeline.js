import React from 'react';
import { Clock, CheckCircle2, CheckCheck, XCircle } from 'lucide-react';

export default function OrderTimeline({ status }) {
  const isRejected = status === 'rejected';

  const steps = [
    { key: 'pending', label: 'Placed (Pending)', icon: Clock },
    { key: 'approved', label: 'Admin Approved', icon: CheckCircle2 },
    { key: 'completed', label: 'Fulfilled / Completed', icon: CheckCheck },
  ];

  const getStepState = (stepKey) => {
    if (isRejected) {
      if (stepKey === 'pending') return 'completed';
      return 'disabled';
    }

    if (status === 'completed') return 'completed';
    if (status === 'approved') {
      if (stepKey === 'pending' || stepKey === 'approved') return 'completed';
      return 'upcoming';
    }
    if (status === 'pending') {
      if (stepKey === 'pending') return 'active';
      return 'upcoming';
    }
    return 'upcoming';
  };

  return (
    <div className="order-timeline">
      {isRejected ? (
        <div className="timeline-rejected-banner">
          <XCircle size={18} className="text-rose-400" />
          <span>This order was rejected by an administrator. Stock has been restored.</span>
        </div>
      ) : (
        <div className="timeline-track">
          {steps.map((step, idx) => {
            const state = getStepState(step.key);
            const Icon = step.icon;

            return (
              <div key={step.key} className={`timeline-node node-${state}`}>
                <div className="node-icon-wrapper">
                  <Icon size={16} />
                </div>
                <div className="node-label">{step.label}</div>
                {idx < steps.length - 1 && (
                  <div className={`timeline-connector connector-${state}`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
