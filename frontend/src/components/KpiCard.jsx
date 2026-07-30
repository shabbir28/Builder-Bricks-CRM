import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const KpiCard = ({
  label,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  iconColor = '#7986cb',
  trend,
  trendLabel = 'vs last month',
  sparkData = [],
  sparkColor = '#5c6bc0',
  delay = 0,
  accentBg,
  accentBorder,
}) => {
  const isUp     = trend && !trend.startsWith('-');
  const isDown   = trend && trend.startsWith('-');
  const hasTrend = !!trend;
  const data = sparkData.map(v => ({ v }));

  const bg     = accentBg     || `rgba(${hexToRgb(sparkColor)},0.06)`;
  const border = accentBorder || `rgba(${hexToRgb(sparkColor)},0.18)`;

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col justify-between overflow-hidden relative"
      style={{
        background: bg,
        borderColor: border,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        minHeight: 160,
      }}
    >
      {/* Subtle glow blob */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120,
        background: `radial-gradient(circle, ${sparkColor}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Top row: label + icon */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest leading-tight">
          {label}
        </span>
        <div
          className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${sparkColor}22`, border: `1px solid ${sparkColor}33` }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      </div>

      {/* Value + trend */}
      <div className="flex items-end gap-2 mb-1">
        <span className="text-2xl font-black text-ink-primary tracking-tight leading-none">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </span>
        {hasTrend && (
          <span
            className="flex items-center gap-0.5 text-[11px] font-bold pb-0.5"
            style={{ color: isUp ? '#34d399' : isDown ? '#f87171' : '#8b8fa8' }}
          >
            {isUp   ? <ArrowUpIcon   className="w-2.5 h-2.5" /> : null}
            {isDown ? <ArrowDownIcon className="w-2.5 h-2.5" /> : null}
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] text-ink-tertiary mb-3">{trendLabel}</p>

      {/* Sparkline */}
      {data.length > 0 && (
        <div className="h-10 -mx-0.5 mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id={`kg-${label.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={sparkColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={sparkColor} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <Tooltip content={() => null} />
              <Area
                type="monotone" dataKey="v"
                stroke={sparkColor} strokeWidth={1.5}
                fill={`url(#kg-${label.replace(/\s/g,'')})`}
                dot={false} activeDot={false}
                isAnimationActive animationDuration={1200} animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

/** Convert hex like #5c6bc0 → "92,107,192" for rgba() */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '92,107,192';
  const r = parseInt(clean.slice(0,2), 16);
  const g = parseInt(clean.slice(2,4), 16);
  const b = parseInt(clean.slice(4,6), 16);
  return `${r},${g},${b}`;
}

export default KpiCard;
