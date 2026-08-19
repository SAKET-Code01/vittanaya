import React, { useState } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import { formatINR } from '../../mocks/dashboardMockData';

/**
 * Reusable MetricCard Component
 * Displays key liquidity indicators with smooth count-up numerical animations,
 * hover contextual disclosures, and interactive "Why?" causal triggers.
 */
export default function MetricCard({
  title,
  rawNumericValue, // Number for count-up
  valuePrefix = '₹',
  valueSuffix = '',
  isDays = false,
  subValue,
  badgeText,
  variant = 'neutral',
  icon,
  footnote,
  hoverInsights,
  onOpenWhy,
  whyKey,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const animatedValue = useCountUp(rawNumericValue, 1100);

  // Variant theme definitions
  const variantStyles = {
    primary: {
      border: 'border-amber-500/30 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
      glow: 'shadow-amber-subtle',
      accentBar: 'bg-gradient-to-r from-amber-500 to-amber-300',
    },
    positive: {
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
      glow: 'shadow-emerald-subtle',
      accentBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    },
    warning: {
      border: 'border-orange-500/30 hover:border-orange-500/50',
      iconBg: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
      glow: '',
      accentBar: 'bg-gradient-to-r from-orange-500 to-amber-500',
    },
    danger: {
      border: 'border-rose-500/30 hover:border-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
      glow: '',
      accentBar: 'bg-gradient-to-r from-rose-500 to-red-400',
    },
    info: {
      border: 'border-indigo-500/30 hover:border-indigo-500/50',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      badge: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
      glow: '',
      accentBar: 'bg-gradient-to-r from-indigo-500 to-blue-400',
    },
    neutral: {
      border: 'border-slate-800 hover:border-slate-700',
      iconBg: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
      badge: 'bg-slate-800 text-slate-300 border border-slate-700',
      glow: '',
      accentBar: 'bg-slate-700',
    },
  };

  const currentTheme = variantStyles[variant] || variantStyles.neutral;

  // Format animated value
  const displayFormattedValue = isDays
    ? `${animatedValue} Days`
    : `${valuePrefix}${new Intl.NumberFormat('en-IN').format(animatedValue)}${valueSuffix}`;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-xl bg-[#111827]/90 backdrop-blur-sm border p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 ${currentTheme.border} ${currentTheme.glow}`}
    >
      {/* Top subtle accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${currentTheme.accentBar}`} />

      {/* Header: Title + Icon + Optional Why? button */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="flex items-center space-x-1.5">
            {whyKey && onOpenWhy && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenWhy(whyKey);
                }}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 transition-colors cursor-pointer"
                title="View causal breakdown"
              >
                Why?
              </button>
            )}
            {icon && (
              <div className={`p-1.5 rounded-lg ${currentTheme.iconBg}`}>
                {icon}
              </div>
            )}
          </div>
        </div>

        {/* Value & Badges with Count-Up Animation */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight num-tabular">
              {displayFormattedValue}
            </div>
            {badgeText && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${currentTheme.badge}`}
              >
                {badgeText}
              </span>
            )}
          </div>

          {subValue && (
            <p className="text-xs font-medium text-slate-400 num-tabular">
              {subValue}
            </p>
          )}
        </div>
      </div>

      {/* Contextual Disclosure Panel (Reveals on hover if available) */}
      {hoverInsights && isHovered && (
        <div className="mt-3 pt-2.5 border-t border-slate-800 animate-fadeIn space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Composition Breakdown:
          </p>
          <div className="space-y-1 text-xs">
            {hoverInsights.breakdown?.map((b, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 truncate">{b.label}:</span>
                <span className="font-semibold text-slate-200 num-tabular">
                  {b.amount !== undefined ? formatINR(b.amount) : b.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footnote */}
      {footnote && (!hoverInsights || !isHovered) && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate">{footnote}</span>
        </div>
      )}
    </div>
  );
}
