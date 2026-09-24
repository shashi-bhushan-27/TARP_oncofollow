import React from 'react';
import {
  RoutingPriority, ROUTING_PRIORITY_ACTIONS, ROUTING_PRIORITY_SHORT_LABELS, PATIENT_ROUTING_STATUS
} from '@/types';

const CHIP_CLASSES: Record<RoutingPriority, string> = {
  routine: 'chip-routine',
  soon: 'chip-soon',
  urgent: 'chip-urgent',
  emergency: 'chip-emergency',
};

/** Shape marker so status is never conveyed by colour alone */
export function RoutingMarker({ priority }: { priority: RoutingPriority }) {
  if (priority === 'emergency') {
    return (
      <svg viewBox="0 0 8 8" className="w-2 h-2 flex-shrink-0" aria-hidden="true">
        <path d="M4 0.5 7.5 7.5H0.5Z" fill="currentColor" />
      </svg>
    );
  }
  if (priority === 'urgent') {
    return <span className="w-2 h-2 flex-shrink-0 rounded-sm bg-current" aria-hidden="true" />;
  }
  return <span className="w-1.5 h-1.5 flex-shrink-0 rounded-full bg-current" aria-hidden="true" />;
}

/**
 * Shows which care-team queue a check-in or alert was routed to.
 * - care_team (default): compact queue name, or the full routing action with `full`
 * - patient: what the routing means for the patient, in plain words
 */
export function RoutingChip({ priority, full = false, audience = 'care_team', className = '' }: {
  priority: RoutingPriority;
  full?: boolean;
  audience?: 'care_team' | 'patient';
  className?: string;
}) {
  const label = audience === 'patient'
    ? PATIENT_ROUTING_STATUS[priority]
    : full ? ROUTING_PRIORITY_ACTIONS[priority] : ROUTING_PRIORITY_SHORT_LABELS[priority];
  return (
    <span className={`${CHIP_CLASSES[priority]} ${className}`}>
      <RoutingMarker priority={priority} />
      {label}
    </span>
  );
}
