import React from 'react';

/**
 * ExplainScoreModal Component — LIGHT FINTECH STYLING
 * 
 * Provides transparent, causal explanations for the Financial Pulse score (84/100):
 * - Score Factor weights and contribution meters
 * - Condition status per factor
 * - Actionable financial recommendations
 */
export default function ExplainScoreModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const totalScore = 84;

  const factors = [
    {
      name: 'Cash Buffer Cushion',
      condition: 'Healthy',
      detail: '+₹1.4L cushion safely maintained above the ₹5.0L safety buffer threshold at lowest point.',
      score: 25,
      maxScore: 30,
      status: 'positive',
    },
    {
      name: 'Expense Pressure',
      condition: 'Low',
      detail: 'Expected 30-day cash inflow (₹9.3L) comfortably exceeds scheduled outflows (₹7.2L).',
      score: 22,
      maxScore: 25,
      status: 'positive',
    },
    {
      name: 'Payment Collection Regularity',
      condition: 'Moderate',
      detail: '1 major invoice (INV-101, ₹2.5L) flagged for a historical ~28-day customer collection delay.',
      score: 18,
      maxScore: 25,
      status: 'warning',
    },
    {
      name: 'Upcoming Obligations Coverage',
      condition: 'Stable',
      detail: 'Committed month-end wages and supplier obligations absorbed with 100% bank liquidity.',
      score: 12,
      maxScore: 10,
      status: 'positive',
    },
    {
      name: 'Cash Flow Stability Index',
      condition: 'Strong',
      detail: 'Deterministic twin model projects zero liquidity deficit throughout rolling 90-day window.',
      score: 7,
      maxScore: 10,
      status: 'positive',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 overflow-hidden my-auto">
        
        {/* Header: Title + Score Badge + Close */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Why is your score {totalScore}?
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Deterministic factor breakdown powering your VITTANAYA Financial Health Index.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-black">
              {totalScore} / 100
            </div>

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

        {/* Contributing Factors List */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Contributing Factor Breakdown
          </span>

          <div className="space-y-2.5 max-h-[38vh] overflow-y-auto pr-1">
            {factors.map((factor, idx) => {
              const isPositive = factor.status === 'positive';
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="font-bold text-slate-800">{factor.name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {factor.condition}
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        +{factor.score} pts
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {factor.detail}
                  </p>

                  {/* Visual weight meter bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min((factor.score / factor.maxScore) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actionable Recommendations Strip */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>What you can improve to reach 90+ Score</span>
          </div>
          <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
            <li><strong className="text-slate-800">Incentivize Delayed Collections:</strong> Offer 2% early settlement discount on INV-101 (Acme Global, ₹2.5L).</li>
            <li><strong className="text-slate-800">Maintain Cash Buffer:</strong> Keep minimum ₹5.0L cash buffer reserved for month-end settlements.</li>
            <li><strong className="text-slate-800">Monitor Vendor Concentrations:</strong> Align primary supplier payment milestones with cash inflows.</li>
          </ul>
        </div>

        {/* Footer Close */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Health status updated continuously via digital twin
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
