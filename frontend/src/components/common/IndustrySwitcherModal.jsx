import React from 'react';
import { INDUSTRY_PRESETS } from '../../mocks/dashboardMockData';

/**
 * IndustrySwitcherModal Component
 * Allows visitors, judges, and developers to explore VITTANAYA's adaptive multi-industry
 * capability across manufacturing, transport, retail, restaurant, and IT services.
 */
export default function IndustrySwitcherModal({ isOpen, onClose, onSelectPreset, activeId }) {
  if (!isOpen) return null;

  const presets = Object.values(INDUSTRY_PRESETS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close switcher"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
              Multi-Industry Intelligence
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • Universal Financial Core
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Explore Adaptive Industry Workspaces
          </h3>
          <p className="text-xs text-slate-400">
            Select an MSME sector to demonstrate how VITTANAYA adapts operational modules while maintaining the shared cash-flow twin engine.
          </p>
        </div>

        {/* Grid of Industry Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {presets.map((preset) => {
            const isSelected = activeId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {preset.name}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  {preset.category}
                </p>

                {/* Modules Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {preset.modules?.map((mod, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
          <span>All presets utilize deterministic timeseries forecasting</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
