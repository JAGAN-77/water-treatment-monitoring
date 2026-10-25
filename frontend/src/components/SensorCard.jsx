import React, { useState, useEffect, useId } from 'react';

const STATUS_CONFIG = {
  NORMAL: { colorClass: 'bg-[#10B981]', textClass: 'text-[#10B981]', icon: 'check_circle', stroke: '#10B981' },
  WARNING: { colorClass: 'bg-tertiary-container', textClass: 'text-tertiary-container', icon: 'warning', stroke: '#df7412' },
  ALERT: { colorClass: 'bg-error', textClass: 'text-error', icon: 'error', stroke: '#ffb4ab' },
  CRITICAL: { colorClass: 'bg-error', textClass: 'text-error', icon: 'dangerous', stroke: '#ffb4ab' },
  INFO: { colorClass: 'bg-primary', textClass: 'text-primary', icon: 'info', stroke: '#adc6ff' }
};

/**
 * Computes a smooth, non-clipping SVG path bounded between y=6 and y=26 in a 100x32 viewBox.
 */
function generateSparklinePaths(values) {
  const W = 100;
  const H = 32;
  const topPad = 6;
  const botPad = 6;
  const availH = H - topPad - botPad; // 20 units

  // If no or single value, return a calibrated wave centered at y=16
  if (!values || values.length < 2) {
    const defaultLine = 'M 2,16 C 18,10 32,22 48,16 C 64,10 78,22 98,16';
    const defaultFill = `${defaultLine} L 98,${H - botPad} L 2,${H - botPad} Z`;
    return { linePath: defaultLine, fillPath: defaultFill };
  }

  const numValues = values.map(v => (typeof v === 'number' && !isNaN(v) ? v : 0));
  const min = Math.min(...numValues);
  const max = Math.max(...numValues);
  const range = max - min || 1;

  // Map each value to a safe coordinate (x: 2..98, y: topPad..H-botPad)
  const pts = numValues.map((val, idx) => {
    const x = Number(((idx / (numValues.length - 1)) * 96 + 2).toFixed(1));
    const norm = (val - min) / range;
    const y = Number((H - botPad - norm * availH).toFixed(1));
    return { x, y };
  });

  // Build smooth cubic Bézier curve
  let linePath = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

    const cp1x = Number((p1.x + (p2.x - p0.x) / 4).toFixed(1));
    let cp1y = Number((p1.y + (p2.y - p0.y) / 4).toFixed(1));
    const cp2x = Number((p2.x - (p3.x - p1.x) / 4).toFixed(1));
    let cp2y = Number((p2.y - (p3.y - p1.y) / 4).toFixed(1));

    // Clamp control points strictly within [topPad, H - botPad] to guarantee zero SVG clipping
    cp1y = Math.max(topPad, Math.min(H - botPad, cp1y));
    cp2y = Math.max(topPad, Math.min(H - botPad, cp2y));

    linePath += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  // Create area fill path closing at bottom
  const lastX = pts[pts.length - 1].x;
  const firstX = pts[0].x;
  const fillPath = `${linePath} L ${lastX},${H - 2} L ${firstX},${H - 2} Z`;

  return { linePath, fillPath };
}

const SensorCard = ({ label, value, unit, status = 'NORMAL', isInfo = false, historyData }) => {
  const configKey = isInfo ? 'INFO' : (STATUS_CONFIG[status] ? status : 'NORMAL');
  const config = STATUS_CONFIG[configKey];
  const uniqueId = useId().replace(/:/g, '');

  // Keep a buffer of the last 10-12 sensor readings to display live trend updates
  const [history, setHistory] = useState(() => {
    if (historyData && Array.isArray(historyData) && historyData.length > 0) {
      return historyData;
    }
    const init = value !== undefined && value !== null && !isNaN(Number(value)) ? Number(value) : 50;
    // Provide a smooth, natural wave starting pattern
    return [
      init * 0.985,
      init * 1.012,
      init * 0.992,
      init * 1.018,
      init * 0.982,
      init * 1.008,
      init * 0.995,
      init
    ];
  });

  // When live sensor value updates from socket or polling, push to history
  useEffect(() => {
    if (value !== undefined && value !== null && !isNaN(Number(value))) {
      const num = Number(value);
      setHistory(prev => {
        const next = [...prev, num];
        if (next.length > 12) next.shift();
        return next;
      });
    }
  }, [value]);

  const { linePath, fillPath } = generateSparklinePaths(history);

  const displayValue = typeof value === 'number' 
    ? value.toFixed(2) 
    : (value !== undefined && value !== null ? value : '--');

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-3 relative overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)] flex flex-col justify-between h-[140px] transition-all duration-200">
      {/* Accent Status Left Border */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.colorClass}`}></div>

      {/* Header Row: Label & Status Icon */}
      <div className="pl-1.5 flex justify-between items-start">
        <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
          {label}
        </span>
        <span className={`material-symbols-outlined text-[16px] ${config.textClass}`}>
          {config.icon}
        </span>
      </div>

      {/* Value & Unit Row */}
      <div className="pl-1.5 flex items-baseline gap-2 my-auto">
        <span className="font-display-metrics text-3xl xl:text-4xl font-bold text-on-surface leading-none tracking-tight">
          {displayValue}
        </span>
        <span className="font-label-mono text-xs text-on-surface-variant">
          {unit}
        </span>
      </div>
      
      {/* Sparkline Graph: Fully visible, properly padded, zero clipping */}
      <div className="w-full h-8 pl-1.5 pr-0.5 relative flex items-end">
        <svg 
          className="w-full h-full overflow-visible" 
          viewBox="0 0 100 32" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`spark-grad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={config.stroke} stopOpacity="0.22" />
              <stop offset="100%" stopColor={config.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Subtle area glow */}
          <path 
            d={fillPath} 
            fill={`url(#spark-grad-${uniqueId})`} 
          />
          {/* Main sparkline */}
          <path 
            d={linePath} 
            fill="none" 
            stroke={config.stroke} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
};

export default SensorCard;
