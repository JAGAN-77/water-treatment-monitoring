import React from 'react';

const STATUS_STYLES = {
  NORMAL: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30',
  WARNING: 'bg-tertiary-container/20 text-tertiary-container border-tertiary-container/30',
  ALERT: 'bg-error-container/20 text-error border-error/30',
  CRITICAL: 'bg-error/20 text-error border-error/50 font-bold',
  INFO: 'bg-primary/20 text-primary border-primary/30'
};

const StatusBadge = ({ status, text }) => {
  const normalizedStatus = (status || 'NORMAL').toUpperCase();
  const style = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.NORMAL;
  const displayText = text || status;

  return (
    <span className={`px-2 py-1 rounded font-label-sm text-[10px] uppercase border ${style}`}>
      {displayText}
    </span>
  );
};

export default StatusBadge;
