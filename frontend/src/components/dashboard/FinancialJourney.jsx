import React from 'react';

/**
 * FinancialJourney Component
 * Sleek 1-line glass visual framework:
 * DATA → CURRENT POSITION → FORECAST → RISK → WHAT-IF → ACTION
 */
export default function FinancialJourney() {
  const steps = [
    { label: 'DATA', active: true },
    { label: 'CURRENT POSITION', active: true },
    { label: 'FORECAST', active: true },
    { label: 'RISK', active: true },
    { label: 'WHAT-IF', active: false, badge: 'Phase 2' },
    { label: 'ACTION', active: false, badge: 'Phase 2' },
  ];

  return (
    <div className="py-2.5 px-4 rounded-xl glass-panel flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm">
      <div className="flex items-center space-x-1.5">
        <span className="text-[10px] font-bold text-amber-400 font-mono">FLOW</span>
        <span className="text-slate-600">•</span>
        <span className="text-[11px] text-slate-400 font-medium">
          How VITTANAYA guides decisions:
        </span>
      </div>

      <div className="flex items-center space-x-1.5 sm:space-x-2.5 text-[10px] sm:text-[11px] font-bold tracking-wider overflow-x-auto py-0.5">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex items-center space-x-1.5 whitespace-nowrap">
              <span className={step.active ? 'text-slate-100 font-bold' : 'text-slate-400 font-normal'}>{step.label}</span>
               {step.badge && (
                <span className="text-[8px] font-semibold px-1 py-0.5 rounded bg-slate-800/90 text-slate-400 border border-slate-700/80">
                  {step.badge}
                </span>
              )}
            </div>
            {idx < steps.length - 1 && (
              <span className="text-slate-400 font-normal">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
