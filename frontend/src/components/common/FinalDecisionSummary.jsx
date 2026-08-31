import React from 'react';
import ConfidenceBadge from './ConfidenceBadge';

/**
 * FinalDecisionSummary Component (Part 18)
 * 
 * Reusable summary card presenting:
 * - Business Feasibility Score
 * - Financial Viability Score
 * - Key Risks Count
 * - Recommended Funding
 * - Top Matching Scheme
 * - Biggest Warning
 * - Next Best Action
 */
export default function FinalDecisionSummary({
  feasibilityScore = '84 / 100',
  financialScore = '76 / 100',
  keyRisksCount = 2,
  recommendedFunding = '₹3.33 Lakh',
  topScheme = 'PMEGP Special Beneficiary Subsidy',
  biggestWarning = 'Maintain strict 15% upfront margin money reserve for bank sanction.',
  nextAction = 'Apply for Beneficiary Subsidy Clearance',
  onAction = null,
  className = '',
}) {
  return (
    <section className={`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5 ${className}`}>
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
              Final Decision Summary
            </h3>
            <ConfidenceBadge status="verified" size="sm" />
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Holistic feasibility and financing synthesis based on verified parameters.
          </p>
        </div>

        <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/80">
          Ready for Review
        </span>
      </div>

      {/* 2. Top Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-center">
          <span className="text-[10px] font-extrabold uppercase text-blue-900 block">Feasibility</span>
          <span className="text-lg font-black text-slate-900 block mt-0.5">{feasibilityScore}</span>
          <span className="text-[10px] font-semibold text-blue-700 block mt-0.5">High Potential</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Financial Viability</span>
          <span className="text-lg font-black text-slate-900 block mt-0.5">{financialScore}</span>
          <span className="text-[10px] font-semibold text-emerald-700 block mt-0.5">Fundable Plan</span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-center">
          <span className="text-[10px] font-extrabold uppercase text-amber-900 block">Key Risks</span>
          <span className="text-lg font-black text-amber-800 block mt-0.5">{keyRisksCount} Areas</span>
          <span className="text-[10px] font-semibold text-amber-700 block mt-0.5">Manageable</span>
        </div>

        <div className="p-3 rounded-2xl bg-blue-50/30 border border-blue-100 text-center">
          <span className="text-[10px] font-extrabold uppercase text-blue-800 block">Rec. Funding</span>
          <span className="text-lg font-black text-blue-700 block mt-0.5">{recommendedFunding}</span>
          <span className="text-[10px] font-semibold text-blue-600 block mt-0.5">Leveraged Facility</span>
        </div>
      </div>

      {/* 3. Top Scheme & Biggest Warning */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
            Top Matching Scheme
          </span>
          <p className="text-xs font-bold text-slate-900 leading-snug">
            {topScheme}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
            Primary Advisory Notice
          </span>
          <p className="text-xs font-medium text-slate-700 leading-snug">
            {biggestWarning}
          </p>
        </div>
      </div>

      {/* 4. Next Best Action Callout */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300">
            Recommended Immediate Milestone
          </span>
          <p className="text-xs sm:text-sm font-bold text-white">
            {nextAction}
          </p>
        </div>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            Execute Action →
          </button>
        )}
      </div>

    </section>
  );
}
