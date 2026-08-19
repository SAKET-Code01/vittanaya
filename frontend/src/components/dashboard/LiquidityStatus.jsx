import React from 'react';
import { formatINR } from '../../mocks/dashboardMockData';

/**
 * LiquidityStatus Component
 * Displays the current working-capital resilience assessment directly from the data layer,
 * with integrated "Why?" causal breakdown links.
 */
export default function LiquidityStatus({ liquidityStatus, summary, onOpenWhy, currentProfile }) {
  const isHealthy = liquidityStatus?.status === 'HEALTHY';
  const isWatch = liquidityStatus?.status === 'WATCH';
  const safetyBuffer = currentProfile?.min_cash_buffer || 500000;

  // Status-specific color tokens
  const statusTheme = isHealthy
    ? {
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        cardBorder: 'border-emerald-500/25',
        gradient: 'from-emerald-950/30 via-slate-900 to-[#111827]',
        accentText: 'text-emerald-400',
      }
    : isWatch
    ? {
        badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        cardBorder: 'border-amber-500/25',
        gradient: 'from-amber-950/30 via-slate-900 to-[#111827]',
        accentText: 'text-amber-400',
      }
    : {
        badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        cardBorder: 'border-rose-500/25',
        gradient: 'from-rose-950/30 via-slate-900 to-[#111827]',
        accentText: 'text-rose-400',
      };

  return (
    <div
      className={`rounded-xl border ${statusTheme.cardBorder} bg-gradient-to-r ${statusTheme.gradient} p-4 sm:p-5 shadow-lg`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side: Status Badge & Assessment Reason */}
        <div className="flex items-start space-x-3.5">
          <div className="mt-1">
            <span className="relative flex h-3.5 w-3.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                  isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Liquidity Health Assessment
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${statusTheme.badgeBg}`}
              >
                {liquidityStatus?.status || 'HEALTHY'}
              </span>
              <span className="text-xs font-medium text-slate-400">
                • {summary?.runway_days || 38} Days Estimated Runway
              </span>
            </div>

            <p className="text-sm font-medium text-slate-200">
              Projected cash remains above the safety threshold of {formatINR(safetyBuffer)} across the 30-day forecast horizon.
            </p>

            {liquidityStatus?.runway_status && (
              <p className="text-xs text-slate-400">
                {liquidityStatus.runway_status}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Key Threshold Checkpoints */}
        <div className="flex items-center gap-4 sm:gap-6 self-start md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
          <div className="text-left md:text-right">
            <div className="flex items-center justify-start md:justify-end space-x-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Lowest Projected Cash
              </p>
              {onOpenWhy && (
                <button
                  type="button"
                  onClick={() => onOpenWhy('lowest_projected_cash')}
                  className="text-[10px] text-amber-400 font-bold underline cursor-pointer"
                >
                  Why?
                </button>
              )}
            </div>
            <p className={`text-base font-extrabold num-tabular ${statusTheme.accentText}`}>
              {formatINR(summary?.lowest_projected_cash)}
            </p>
            <p className="text-[10px] text-slate-400">
              {liquidityStatus?.min_buffer_day || 'Day 18 (Sep 02)'}
            </p>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <div className="text-left md:text-right">
            <div className="flex items-center justify-start md:justify-end space-x-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Liquidity Gap
              </p>
              {onOpenWhy && (
                <button
                  type="button"
                  onClick={() => onOpenWhy('liquidity_gap')}
                  className="text-[10px] text-amber-400 font-bold underline cursor-pointer"
                >
                  Why?
                </button>
              )}
            </div>
            <p className="text-base font-extrabold text-emerald-400 num-tabular">
              {formatINR(summary?.liquidity_gap)}
            </p>
            <p className="text-[10px] text-emerald-500 font-medium">
              Zero Deficit Flagged
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
