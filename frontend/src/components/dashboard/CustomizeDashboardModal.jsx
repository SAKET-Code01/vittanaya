import React from 'react';

/**
 * CustomizeDashboardModal Component — LIGHT FINTECH STYLING
 * 
 * Allows users to inspect and restore hidden dashboard cards:
 * - List of all customizable dashboard sections
 * - Visible / Hidden status indicators
 * - One-click "Show / Hide" toggles
 * - "Restore All to Default" reset option
 */
export default function CustomizeDashboardModal({
  isOpen,
  onClose,
  hiddenCards = [],
  onToggleCardVisibility,
  onResetAll,
}) {
  if (!isOpen) return null;

  const ALL_DASHBOARD_CARDS = [
    {
      id: 'kpi-cash',
      label: 'Cash Available',
      category: 'Primary KPI',
      desc: 'Liquid bank balance and verified cash in hand',
    },
    {
      id: 'kpi-receivables',
      label: 'Receivables',
      category: 'Primary KPI',
      desc: 'Expected 30-day customer invoice dues',
    },
    {
      id: 'kpi-payables',
      label: 'Payables',
      category: 'Primary KPI',
      desc: 'Committed 30-day vendor and supplier bills',
    },
    {
      id: 'kpi-runway',
      label: 'Cash Runway',
      category: 'Primary KPI',
      desc: 'Days remaining before reaching minimum safety buffer',
    },
    {
      id: 'chart-forecast',
      label: 'Cash Flow Forecast',
      category: 'Hero Visualization',
      desc: 'Interactive 30D/60D/90D Recharts timeseries projection',
    },
    {
      id: 'panel-health',
      label: 'Financial Health Panel',
      category: 'Pulse & Intelligence',
      desc: 'Financial Health Index (84/100) & Status Signals',
    },
    {
      id: 'feed-attention',
      label: 'Needs Attention',
      category: 'Actionable Alerts',
      desc: 'Live risk flags for delayed collections and cash troughs',
    },
    {
      id: 'sec-summary',
      label: 'Financial Snapshot',
      category: 'Snapshot Extension',
      desc: 'Expected Inflows, Outflows, Liquidity Gap, Net Cash Flow & Lowest Cash Point',
    },
  ];

  const visibleCount = ALL_DASHBOARD_CARDS.length - hiddenCards.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Customize Dashboard Cards
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Manage visible and hidden dashboard cards. Hidden cards are never permanently deleted.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-700 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
              {visibleCount} of {ALL_DASHBOARD_CARDS.length} Visible
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cards Visibility Manager List */}
        <div className="space-y-2.5 max-h-[46vh] overflow-y-auto pr-1">
          {ALL_DASHBOARD_CARDS.map((card) => {
            const isHidden = hiddenCards.includes(card.id);

            return (
              <div
                key={card.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                  isHidden
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${isHidden ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                    <h4 className={`font-bold ${isHidden ? 'text-slate-500' : 'text-slate-900'}`}>
                      {card.label}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {card.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {card.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleCardVisibility(card.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                    isHidden
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isHidden ? 'Show Card' : 'Hide Card'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Actions: Reset All & Close */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onResetAll}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            Reset All to Default (Show All)
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
