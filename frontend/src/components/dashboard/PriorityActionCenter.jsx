import React from 'react';

/**
 * PriorityActionCenter Component
 * 
 * Level 3 Decision-Making Section:
 * High-priority action center with numbered launch gates, clear urgency indicators,
 * and prominent CTAs guiding the entrepreneur's next operational milestones.
 */
export default function PriorityActionCenter({
  socialCategory = 'General',
  onNavigate,
}) {
  const handleAction = (destination) => {
    if (typeof onNavigate === 'function') {
      onNavigate(destination);
    }
  };

  const gates = [
    {
      stepNum: '01',
      tag: 'Step 1 • Scheme',
      title: 'Apply for Beneficiary Subsidy Clearance',
      desc: `Prepare entitlement certificates under ${socialCategory} category.`,
      ctaLabel: 'View Schemes',
      route: 'scheme',
      isPrimary: true,
    },
    {
      stepNum: '02',
      tag: 'Step 2 • Registration',
      title: 'Udyam Registration & Trade License',
      desc: 'Zero-cost paperless MSME registration via Aadhaar.',
      ctaLabel: 'Checklist',
      route: 'action-plan',
      isPrimary: false,
    },
    {
      stepNum: '03',
      tag: 'Step 3 • Capital',
      title: 'Prepare Bank DPR (Detailed Project Report)',
      desc: 'Export deterministic financial projections for branch review.',
      ctaLabel: 'Draft DPR',
      route: 'financial-plan',
      isPrimary: false,
    },
  ];

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
              <path d="m19 16 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z" />
            </svg>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
            Priority Action Center
          </h2>
        </div>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/80">
          3 Key Launch Gates
        </span>
      </div>

      {/* 3 Action Gate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {gates.map((gate) => (
          <div
            key={gate.stepNum}
            className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 transition-all duration-200 ${
              gate.isPrimary
                ? 'bg-blue-50/40 border-blue-200/70 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[12px] font-black text-white">
                  {gate.stepNum}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    gate.isPrimary
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {gate.tag}
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-900 leading-snug pt-1">
                {gate.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                {gate.desc}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAction(gate.route)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] ${
                gate.isPrimary
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <span>{gate.ctaLabel}</span>
              <span className="text-xs">→</span>
            </button>
          </div>
        ))}
      </div>

    </section>
  );
}
