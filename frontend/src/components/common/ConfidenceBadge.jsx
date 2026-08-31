import React from 'react';

/**
 * ConfidenceBadge Component
 * 
 * Standardized data trust indicators with icons + text for color-independent accessibility:
 * - 'verified': ✓ Verified (Official Source)
 * - 'estimated': ~ Estimated (Model Calculation / Benchmark)
 * - 'user_provided': ● User Provided (Onboarding Input)
 * - 'limited': ⚠ Limited Confidence (Data Incomplete)
 */
export default function ConfidenceBadge({
  status = 'verified', // 'verified' | 'estimated' | 'user_provided' | 'limited'
  customLabel = null,
  showIcon = true,
  size = 'sm', // 'sm' | 'md'
  className = '',
}) {
  const configs = {
    verified: {
      symbol: '✓',
      label: customLabel || 'Verified',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    },
    estimated: {
      symbol: '~',
      label: customLabel || 'Estimated',
      classes: 'bg-blue-50 text-blue-700 border-blue-200/80',
    },
    user_provided: {
      symbol: '●',
      label: customLabel || 'User Provided',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    limited: {
      symbol: '⚠',
      label: customLabel || 'Limited Confidence',
      classes: 'bg-amber-50 text-amber-800 border-amber-200/80',
    },
  };

  const current = configs[status] || configs.verified;
  const sizeClasses = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border tracking-wide select-none ${sizeClasses} ${current.classes} ${className}`}
      title={`Data Trust Level: ${current.label}`}
    >
      {showIcon && <span className="font-mono text-xs leading-none">{current.symbol}</span>}
      <span>{current.label}</span>
    </span>
  );
}
