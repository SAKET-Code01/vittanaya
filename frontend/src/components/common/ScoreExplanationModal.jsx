import React from 'react';
import ConfidenceBadge from './ConfidenceBadge';

/**
 * ScoreExplanationModal Component
 * 
 * Accessible "Why this score?" modal providing transparent, explainable decision factors:
 * - Overall score & status
 * - Positive drivers
 * - Negative / constraint factors
 * - Model assumptions
 * - Source metadata & calculation engine
 */
export default function ScoreExplanationModal({
  isOpen,
  onClose,
  scoreTitle = 'Viability Index',
  scoreValue = '84 / 100',
  statusLabel = 'HIGH POTENTIAL',
  confidence = 'verified',
  summary = 'The proposed venture demonstrates strong local market opportunity supported by favorable population density and accessible central capital subsidy.',
  positiveDrivers = [
    'Strong hyper-local demand momentum within 10 km catchment',
    'Favorable ratio between consumer population and active commercial suppliers',
    'Eligible for up to 35% capital subsidy under MoSJE beneficiary guidelines',
  ],
  constraintFactors = [
    'Available margin capital requires strict working capital discipline',
    'Moderate local competition requires proactive customer relationship building',
  ],
  assumptions = [
    'Based on 15% upfront margin capital allocation',
    'Assumes standard 10% annual institutional debt rate',
  ],
  source = 'Census 2026 / MoSJE Framework / VITTANAYA Decision Engine v2.4',
  updatedAt = '31 Aug 2026',
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explanation-modal-title"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-900">
        
        {/* Top Bar: Title & Close Button */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 pr-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                Transparent Decision Lineage
              </span>
              <ConfidenceBadge status={confidence} size="sm" />
            </div>
            <h3 id="explanation-modal-title" className="text-lg font-extrabold text-slate-900">
              Why this score? — {scoreTitle}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Score Summary Box */}
        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 block">
              Calculated Score
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {scoreValue}
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-xs">
            {statusLabel}
          </span>
        </div>

        {/* Narrative Summary */}
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {summary}
        </p>

        {/* Positive & Constraint Factors */}
        <div className="space-y-3 pt-1">
          {/* Positive Factors */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span>✓</span>
              <span>Positive Contributing Factors:</span>
            </h4>
            <ul className="space-y-1 text-xs text-slate-600 font-medium pl-2">
              {positiveDrivers.map((driver, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Constraint Factors */}
          <div className="space-y-1.5 pt-1">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <span>⚠</span>
              <span>Areas Needing Operational Attention:</span>
            </h4>
            <ul className="space-y-1 text-xs text-slate-600 font-medium pl-2">
              {constraintFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Model Assumptions & Metadata */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 space-y-1.5">
          <div className="flex items-center justify-between font-semibold">
            <span>Source: {source}</span>
            <span>Synced: {updatedAt}</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Assumptions: {assumptions.join(' • ')}
          </p>
        </div>

        {/* Footer Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
}
