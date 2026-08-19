import React from 'react';

/**
 * BusinessSnapshot Component
 * Dynamic operational KPI cards tailored to selected business operations.
 * Displays primarily THIS MONTH metrics with contextual trends.
 */
export default function BusinessSnapshot({ currentProfile }) {
  const kpis = currentProfile?.businessKpis || [
    { label: 'Operational Health', value: 'Stable', sub: '38-day runway buffer', trend: 'Healthy', trendType: 'positive' },
    { label: 'Working Capital Ratio', value: '1.48x', sub: 'Liquid assets / dues', trend: '+0.12 MoM', trendType: 'positive' },
    { label: 'Operating Margin', value: '22.6%', sub: 'Net cash generation', trend: '+1.8% MoM', trendType: 'positive' },
    { label: 'Avg Collection Period', value: '34 Days', sub: 'Historical cycle', trend: 'Optimal', trendType: 'positive' },
  ];

  const trendStyles = {
    positive: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  };

  return (
    <div className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-xs" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Business Snapshot • {currentProfile?.category || 'Operational Overview'}
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          This Month Activity
        </span>
      </div>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl glass-card flex flex-col justify-between space-y-2 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                {kpi.label}
              </span>
              {kpi.trend && (
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border whitespace-nowrap ${
                    trendStyles[kpi.trendType] || trendStyles.info
                  }`}
                >
                  {kpi.trend}
                </span>
              )}
            </div>

            <div className="my-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight num-tabular drop-shadow-xs">
                {kpi.value}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 truncate">
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
