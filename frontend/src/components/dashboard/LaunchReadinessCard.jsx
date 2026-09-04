import React from 'react';

/**
 * LaunchReadinessCard Component
 * 
 * Level 4 Progress Section:
 * 4-Step milestone tracker with progress percentage and checklist launch CTA.
 */
export default function LaunchReadinessCard({
  readinessScore = null,
  readinessLabel = null,
  requirements = [],
  isLoading = false,
  onNavigate,
  className = '',
}) {
  const handleAction = (destination) => {
    if (typeof onNavigate === 'function') {
      onNavigate(destination);
    }
  };

  // Map backend requirements into displayed 4 milestone steps
  const displaySteps = React.useMemo(() => {
    if (requirements && requirements.length > 0) {
      return requirements.slice(0, 4).map((req, idx) => {
        const isDone = req.status === 'completed' || req.status === 'verified';
        const isCurrent = req.status === 'in_progress' || req.status === 'submitted';
        return {
          id: req.id || idx + 1,
          title: req.name || req.title,
          status: isDone ? 'Verified' : (isCurrent ? 'In Progress' : 'Pending'),
          isDone,
          isCurrent,
          badgeColor: isDone
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
            : isCurrent
              ? 'text-blue-700 bg-blue-50 border-blue-200/60'
              : 'text-slate-500 bg-slate-100 border-slate-200/60',
        };
      });
    }
    return [];
  }, [requirements]);

  const displayLabel = readinessLabel || (readinessScore != null ? `${Math.round(readinessScore)}% Prepared` : (isLoading ? '...' : 'Insufficient data'));

  return (
    <section className={`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5 ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
            Readiness Tracker
          </h2>
        </div>
        <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/80">
          {displayLabel}
        </span>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
            Loading statutory milestones...
          </div>
        ) : displaySteps.length > 0 ? (
          displaySteps.map((step) => (
            <div
              key={step.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${step.isDone
                      ? 'bg-emerald-600 text-white'
                      : step.isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                >
                  {step.isDone ? '✓' : step.id}
                </div>
                <span
                  className={`text-xs truncate ${step.isDone || step.isCurrent
                      ? 'font-bold text-slate-900'
                      : 'font-medium text-slate-600'
                    }`}
                >
                  {step.title}
                </span>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${step.badgeColor}`}
              >
                {step.status}
              </span>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            No requirements resolved for this business stage.
          </div>
        )}
      </div>

      {/* Button CTA */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => handleAction('action-plan')}
          className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all text-center cursor-pointer active:scale-[0.99]"
        >
          Manage Launch Checklist →
        </button>
      </div>

    </section>
  );
}
