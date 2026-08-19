import React from 'react';
import ContextMenu from '../common/ContextMenu';

/**
 * FinancialHealthPanel Component — STRICT REFERENCE 2 IMPLEMENTATION
 * 
 * Features:
 * - Circular SVG Health Meter (84 / 100)
 * - Status Pill (● Stable)
 * - 3 Health Indicators: Delayed Payments (Medium), Cash Buffer (Healthy), Expense Pressure (Low)
 * - Footer: View Details →
 * - Three-dot menu: Explain Score, View Health Details, View Recommendations, Hide Card
 */
export default function FinancialHealthPanel({
  currentProfile,
  summary,
  onExplainScore,
  onOpenDetail,
  onHideCard,
  activeMenuId,
  setActiveMenuId,
}) {
  const pulseScore = summary?.health_score ?? (currentProfile?.pulse?.score || 84);
  const circumference = 2 * Math.PI * 40; // r=40 -> ~251.32
  const strokeDashoffset = circumference - (pulseScore / 100) * circumference;

  const menuItems = [
    {
      id: 'explain-score',
      label: 'Explain Score',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => {
        if (onExplainScore) onExplainScore();
      },
    },
    {
      id: 'health-details',
      label: 'View Health Details',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => {
        if (onExplainScore) onExplainScore();
      },
    },
    {
      id: 'recommendations',
      label: 'View Recommendations',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      onClick: () => {
        if (onExplainScore) onExplainScore();
      },
    },
    { separator: true },
    {
      id: 'hide',
      label: 'Hide Card',
      danger: true,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        </svg>
      ),
      onClick: () => {
        if (onHideCard) onHideCard('panel-health');
      },
    },
  ];

  return (
    <div
      onClick={onExplainScore}
      className="dash-card p-5 sm:p-6 flex flex-col justify-between space-y-4 cursor-pointer hover:border-emerald-200 transition-all"
    >
      {/* Top Header: Title + Info Icon + Three-Dot Menu */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Financial Health
          </h3>
          <span className="text-slate-400 hover:text-slate-600" title="Deterministic Financial Pulse Index">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <ContextMenu
            menuId="menu-panel-health"
            activeMenuId={activeMenuId}
            setActiveMenuId={setActiveMenuId}
            items={menuItems}
          />
        </div>
      </div>

      {/* Center Layout: Donut Meter (left) + Indicators (right) */}
      <div className="flex items-center justify-between gap-4 py-1">
        
        {/* Circular Donut Gauge */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#E2E8F0"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress Stroke */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#10B981"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Score */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 leading-none">
              84
            </span>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
              /100
            </span>
          </div>
        </div>

        {/* Indicators List (Reference 2) */}
        <div className="flex-1 space-y-2 text-xs">
          {/* Delayed Payments */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Delayed Payments
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
              Medium
            </span>
          </div>

          {/* Cash Buffer */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Cash Buffer
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Healthy
            </span>
          </div>

          {/* Expense Pressure */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Expense Pressure
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Low
            </span>
          </div>
        </div>

      </div>

      {/* Footer: Stable Badge + View Details link */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Stable
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onExplainScore) onExplainScore();
          }}
          className="text-slate-700 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View Details</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
}
