import React from 'react';

/**
 * ExplanationModal Component
 * Provides transparent "Why?" causal breakdowns for key financial metrics and forecast troughs.
 */
export default function ExplanationModal({ isOpen, onClose, explanation }) {
  if (!isOpen || !explanation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close explanation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
              Decision Intelligence
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • Causal Factor Analysis
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {explanation.title}
          </h3>
          <p className="text-xs text-slate-300">
            {explanation.summary}
          </p>
        </div>

        {/* Factors Breakdown */}
        <div className="space-y-2.5 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Key Contributing Drivers
          </h4>
          <div className="space-y-2">
            {explanation.factors?.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
              >
                <div className="space-y-0.5 flex-1">
                  <p className="text-xs font-semibold text-slate-200">
                    {item.factor}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
                <span className="self-start sm:self-auto text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 whitespace-nowrap">
                  {item.impact}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Recommendation */}
        {explanation.recommendation && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start space-x-3">
            <div className="mt-0.5 text-amber-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-amber-300">Strategic Guidance:</span>
              <p className="text-slate-300 leading-relaxed">
                {explanation.recommendation}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
