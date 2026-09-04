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
  const pulseScore = summary?.health_score ?? (currentProfile?.pulse?.score ?? null);
  const hasScore = pulseScore !== null && pulseScore !== undefined && !isNaN(pulseScore);
  const displayScore = hasScore ? Math.round(Number(pulseScore)) : null;
  const circumference = 2 * Math.PI * 40; // r=40 -> ~251.32
  const strokeDashoffset = hasScore ? circumference - (displayScore / 100) * circumference : circumference;

  // Dynamic indicator derivation from authoritative financial summary
  const delayedPaymentsStatus = (summary?.receivables_overdue && summary.receivables_overdue > 0)
    ? { label: 'High', color: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200/60' }
    : ((summary?.receivables_total || 0) > (summary?.monthly_revenue || 1)
      ? { label: 'Medium', color: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200/60' }
      : { label: 'Low', color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' });

  const runwayMonths = summary?.runway_months ?? (summary?.runway_days != null ? summary.runway_days / 30 : null);
  const cashBufferStatus = runwayMonths != null
    ? (runwayMonths >= 6
      ? { label: 'Healthy', color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' }
      : (runwayMonths >= 3
        ? { label: 'Adequate', color: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200/60' }
        : { label: 'Thin', color: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200/60' }))
    : { label: 'Evaluating', color: 'bg-slate-400', badge: 'bg-slate-50 text-slate-600 border-slate-200/60' };

  const ebitdaMargin = summary?.ebitda_margin;
  const expensePressureStatus = ebitdaMargin != null
    ? (ebitdaMargin >= 20
      ? { label: 'Low', color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' }
      : (ebitdaMargin >= 10
        ? { label: 'Moderate', color: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200/60' }
        : { label: 'Elevated', color: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200/60' }))
    : { label: 'Normal', color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' };

  const healthStatus = summary?.health_status || (hasScore ? (displayScore >= 75 ? 'Healthy' : (displayScore >= 50 ? 'Stable' : 'Needs Attention')) : 'Evaluating...');
  const healthBadge = displayScore >= 75
    ? { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-500' }
    : (displayScore >= 50
      ? { bg: 'bg-blue-50 text-blue-700 border-blue-200/60', dot: 'bg-blue-500' }
      : { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500' });

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
        if (onOpenDetail) onOpenDetail('health-details');
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
        if (onOpenDetail) onOpenDetail('recommendations');
      },
    },
    { separator: true },
    {
      id: 'hide-card',
      label: 'Hide Card',
      danger: true,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ),
      onClick: () => {
        if (onHideCard) onHideCard('panel-health');
      },
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between relative transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-black text-slate-900">
            Financial Health
          </h2>
          <span className="cursor-help text-slate-400 hover:text-slate-600 transition-colors text-xs" title="Authoritative financial health calculation">
            ⓘ
          </span>
        </div>

        {/* 3-Dot Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuId(activeMenuId === 'financial-health' ? null : 'financial-health');
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          <ContextMenu
            menuId="financial-health"
            activeMenuId={activeMenuId}
            setActiveMenuId={setActiveMenuId}
            items={menuItems}
          />
        </div>
      </div>

      {/* Body: Circular Gauge + Indicators */}
      <div className="flex items-center gap-4 my-4">
        
        {/* SVG Circular Meter */}
        <div className="relative flex items-center justify-center flex-shrink-0 w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#F1F5F9"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress Stroke */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={displayScore >= 75 ? "#10B981" : (displayScore >= 50 ? "#3B82F6" : "#F59E0B")}
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
              {displayScore != null ? displayScore : '—'}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
              /100
            </span>
          </div>
        </div>

        {/* Indicators List */}
        <div className="flex-1 space-y-2 text-xs">
          {/* Delayed Payments */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className={`w-2 h-2 rounded-full ${delayedPaymentsStatus.color}`} />
              Delayed Payments
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${delayedPaymentsStatus.badge}`}>
              {delayedPaymentsStatus.label}
            </span>
          </div>

          {/* Cash Buffer */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className={`w-2 h-2 rounded-full ${cashBufferStatus.color}`} />
              Cash Buffer
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${cashBufferStatus.badge}`}>
              {cashBufferStatus.label}
            </span>
          </div>

          {/* Expense Pressure */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className={`w-2 h-2 rounded-full ${expensePressureStatus.color}`} />
              Expense Pressure
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${expensePressureStatus.badge}`}>
              {expensePressureStatus.label}
            </span>
          </div>
        </div>

      </div>

      {/* Footer: Dynamic Health Badge + View Details link */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border ${healthBadge.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${healthBadge.dot}`} />
          {healthStatus}
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
