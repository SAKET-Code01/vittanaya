import React from 'react';

/**
 * FundingBlueprintCard Component
 * 
 * Level 4 Financial Section:
 * Visual stack ratio bar and structured capital allocation breakdown for the new venture.
 */
export default function FundingBlueprintCard({
  ownCapital = null,
  subsidyPct = null,
  estimatedProjectCost = null,
  projectCostLabel = 'Estimated Project Cost',
  projectCostSourceName = 'NABARD benchmark',
  estimatedSubsidy = null,
  estimatedBankLoan = null,
  estimatedEmi = null,
  isLoading = false,
  onNavigate,
  className = '',
}) {
  const handleAction = (destination) => {
    if (typeof onNavigate === 'function') {
      onNavigate(destination);
    }
  };

  const cost = Number(estimatedProjectCost) || 0;
  const ownCap = Number(ownCapital) || 0;
  const subAmt = Number(estimatedSubsidy) || 0;
  const loanAmt = Number(estimatedBankLoan) || 0;
  const emiAmt = Number(estimatedEmi) || 0;

  const ownPct = cost > 0 ? Math.min(100, Math.round((ownCap / cost) * 100)) : 0;
  const subPct = Number(subsidyPct) || 0;
  const loanPct = Math.max(0, 100 - ownPct - subPct);

  return (
    <section className={`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5 ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12" />
              <path d="M17 13h4" />
              <circle cx="17" cy="13" r=".7" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
            Funding &amp; Subsidy Blueprint
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full inline-block">
            {cost > 0 ? `${projectCostLabel}: ₹${(cost / 100000).toFixed(2)}L` : (isLoading ? '...' : 'Project Cost Pending')}
          </span>
          {cost > 0 && (
            <span className="block text-[10px] font-semibold text-slate-400 mt-1">
              Source: {projectCostSourceName}
            </span>
          )}
        </div>
      </div>

      {/* Visual Stack Ratio Bar */}
      <div className="space-y-3">
        {cost > 0 ? (
          <>
            <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              <div style={{ width: `${ownPct}%` }} className="bg-blue-600 transition-all duration-500" title={`Own Capital (${ownPct}%)`} />
              <div style={{ width: `${subPct}%` }} className="bg-blue-400 transition-all duration-500" title={`Subsidy (${subPct}%)`} />
              <div style={{ width: `${loanPct}%` }} className="bg-slate-700 transition-all duration-500" title={`Bank Loan (${loanPct}%)`} />
            </div>

            {/* Ratio Labels */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Own Capital ({ownPct}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Subsidy ({subPct}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700 inline-block" /> Bank Loan ({loanPct}%)</span>
            </div>
          </>
        ) : (
          <div className="h-3.5 w-full rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-medium">
            {isLoading ? 'Loading capital structure...' : 'Enter project cost in financial plan to view funding split'}
          </div>
        )}

        {/* 3 Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-center">
            <span className="text-[10px] font-extrabold text-blue-900 uppercase block">Own Capital</span>
            <span className="text-sm sm:text-base font-black text-slate-900 block mt-0.5">
              {ownCap > 0 ? `₹${ownCap.toLocaleString('en-IN')}` : 'Not available'}
            </span>
            <span className="text-[10px] font-semibold text-blue-600 block mt-0.5">
              {ownPct > 0 ? `${ownPct}% Margin Money` : 'Margin capital required'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/30 border border-blue-100 text-center">
            <span className="text-[10px] font-extrabold text-blue-800 uppercase block">Govt Subsidy</span>
            <span className="text-sm sm:text-base font-black text-slate-900 block mt-0.5">
              {subAmt > 0 ? `₹${subAmt.toLocaleString('en-IN')}` : (subPct > 0 ? `${subPct}% eligible` : 'Pending match')}
            </span>
            <span className="text-[10px] font-semibold text-blue-600 block mt-0.5">
              {subPct > 0 ? `${subPct}% Entitlement` : 'Scheme entitlement'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-extrabold text-slate-700 uppercase block">Estimated Loan</span>
            <span className="text-sm sm:text-base font-black text-slate-900 block mt-0.5">
              {loanAmt > 0 ? `₹${loanAmt.toLocaleString('en-IN')}` : 'Pending cost'}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
              {emiAmt > 0 ? `~₹${emiAmt.toLocaleString('en-IN')}/mo EMI` : 'Indicative EMI'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 font-medium">
          Zero upfront fee structure under verified MoSJE frameworks
        </span>
        <button
          type="button"
          onClick={() => handleAction('financial-plan')}
          className="text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Explore Full Capital Plan</span>
          <span>→</span>
        </button>
      </div>

    </section>
  );
}
