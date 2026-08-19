import React from 'react';

/**
 * TopIntro Component
 * Clean, concise universal header with brand eyebrow, main heading, workspace profile status,
 * and Customize Dashboard trigger.
 */
export default function TopIntro({
  currentProfile,
  onOpenRegister,
  onOpenIndustrySwitcher,
  onOpenCustomize,
  hiddenCardsCount = 0,
}) {
  const isUniversal = !currentProfile?.id || currentProfile?.id === 'universal';

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-800/60">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 font-mono">
            VITTANAYA • FINANCIAL INTELLIGENCE
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] font-medium text-slate-400">
            {isUniversal ? 'Universal Decision Support' : currentProfile?.category}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {isUniversal ? 'Understand your financial position.' : `Financial Position • ${currentProfile?.name}`}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          See what’s happening now, what may happen next, and where action may be needed.
        </p>
      </div>

      {/* Demo Profile Badge & Fast Actions */}
      <div className="flex items-center space-x-2 self-start sm:self-auto flex-wrap gap-y-2">
        {/* Customize Dashboard Button */}
        {onOpenCustomize && (
          <button
            type="button"
            onClick={onOpenCustomize}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 transition-all cursor-pointer shadow-sm group"
            title="Customize and restore hidden dashboard cards"
          >
            <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Customize</span>
            {hiddenCardsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {hiddenCardsCount}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onOpenIndustrySwitcher}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 transition-all cursor-pointer shadow-sm group"
          title="Switch demo MSME industry profile"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-slate-400 font-normal">
            {isUniversal ? 'Demo:' : 'Preset:'}
          </span>
          <span className="text-slate-200 group-hover:text-amber-300 truncate max-w-[120px]">
            {currentProfile?.name || 'Universal MSME'}
          </span>
          <span className="text-[10px] text-slate-400">↻</span>
        </button>

        <button
          type="button"
          onClick={onOpenRegister}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 shadow-sm"
        >
          <span>{isUniversal ? 'Onboard MSME' : 'Edit Profile'}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
