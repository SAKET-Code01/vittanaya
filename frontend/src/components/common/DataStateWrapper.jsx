import React from 'react';

/**
 * DataStateWrapper Component
 * 
 * Reusable wrapper providing standard LOADING, EMPTY, ERROR, and SUCCESS states.
 * Eliminates fake zeros (₹0, 0%) caused by uninitialized/loading data.
 */
export default function DataStateWrapper({
  isLoading = false,
  isError = false,
  errorMessage = null,
  isEmpty = false,
  emptyTitle = 'No data available yet',
  emptyMessage = 'Complete the required setup or check back once analysis is generated.',
  onRetry = null,
  retryLabel = 'Retry',
  skeletonRows = 3,
  className = '',
  children,
}) {
  // 1. Loading State (Animated Skeleton)
  if (isLoading) {
    return (
      <div className={`w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 animate-pulse ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded-md w-1/3" />
          <div className="h-6 bg-slate-100 rounded-full w-20" />
        </div>
        <div className="space-y-2.5 pt-2">
          {Array.from({ length: skeletonRows }).map((_, idx) => (
            <div key={idx} className="h-3.5 bg-slate-100 rounded-md" style={{ width: `${85 - idx * 15}%` }} />
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div className={`w-full bg-white rounded-2xl p-6 border border-rose-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-3 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-base border border-rose-200">
          !
        </div>
        <div className="space-y-1 max-w-md">
          <h4 className="text-sm font-extrabold text-slate-900">
            We couldn't load this information
          </h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {errorMessage || 'A connection or server issue occurred. Please check your connection and try again.'}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (isEmpty) {
    return (
      <div className={`w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-2.5 ${className}`}>
        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm font-bold">
          ∅
        </div>
        <div className="space-y-0.5 max-w-sm">
          <h4 className="text-xs font-bold text-slate-900">{emptyTitle}</h4>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // 4. Success State (Render Child Content)
  return <>{children}</>;
}
