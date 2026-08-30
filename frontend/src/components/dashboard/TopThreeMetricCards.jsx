import React from 'react';

/**
 * Circular Donut Gauge for Feasibility Score
 */
function CircularProgressDonut({
  value = 78,
  size = 68,
  strokeWidth = 6,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  const strokeDashoffset =
    circumference - (circumference * safeValue) / 100;

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
      aria-label={`Feasibility score ${safeValue} percent`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#16A34A"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      <span className="absolute text-xs font-black text-slate-900">
        {safeValue}%
      </span>
    </div>
  );
}

/**
 * TopThreeMetricCards
 *
 * Cards:
 * 1. Feasibility Score
 * 2. Market Opportunity
 * 3. Risk Level
 */
export default function TopThreeMetricCards({
  metricsData,
  onOpenDetails,
  className = '',
}) {
  const score = metricsData?.score ?? 78;

  const feasibilityStatus =
    metricsData?.feasibilityStatus || 'Good Feasibility';

  const opportunityLevel =
    metricsData?.opportunityLevel || 'High';

  const opportunitySummary =
    metricsData?.opportunitySummary ||
    'Strong demand in local market';

  const riskLevel =
    metricsData?.riskLevel || 'Low';

  const riskSummary =
    metricsData?.riskSummary || 'Stable environment';

  const handleDetails = (type) => {
    if (typeof onOpenDetails === 'function') {
      onOpenDetails(type);
    }
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 ${className}`}
    >
      {/* ========================================================= */}
      {/* CARD 1: FEASIBILITY SCORE */}
      {/* ========================================================= */}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          {/* Left */}
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl flex-shrink-0">
              %
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center space-x-1 text-xs font-bold text-slate-700">
                <span>Feasibility Score</span>

                <span
                  className="text-slate-400 cursor-help"
                  title="Comprehensive feasibility score out of 100"
                >
                  ⓘ
                </span>
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {score}
                </span>

                <span className="text-sm font-semibold text-slate-400">
                  /100
                </span>
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/60">
                  {feasibilityStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <CircularProgressDonut
              value={score}
              size={64}
              strokeWidth={6}
            />

            <button
              type="button"
              onClick={() => handleDetails('feasibility')}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline whitespace-nowrap transition-colors"
              aria-label={`Why is the feasibility score ${score}?`}
            >
              Why {score}? →
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 2: MARKET OPPORTUNITY */}
      {/* ========================================================= */}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          {/* Left */}
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle
                  cx="12"
                  cy="12"
                  r="2"
                  fill="currentColor"
                />
              </svg>
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center space-x-1 text-xs font-bold text-slate-700">
                <span>Market Opportunity</span>

                <span
                  className="text-slate-400 cursor-help"
                  title="Assessment of consumer demand in 10-15km radius"
                >
                  ⓘ
                </span>
              </div>

              <p className="text-2xl font-black text-emerald-700 tracking-tight leading-tight">
                {opportunityLevel}
              </p>

              <p className="text-xs text-slate-500 font-medium leading-tight">
                {opportunitySummary}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                />
              </svg>
            </div>

            <button
              type="button"
              onClick={() => handleDetails('market')}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline whitespace-nowrap transition-colors"
            >
              View Evidence →
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 3: RISK LEVEL */}
      {/* ========================================================= */}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          {/* Left */}
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center space-x-1 text-xs font-bold text-slate-700">
                <span>Risk Level</span>

                <span
                  className="text-slate-400 cursor-help"
                  title="Overall business and credit risk score"
                >
                  ⓘ
                </span>
              </div>

              <p className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {riskLevel}
              </p>

              <p className="text-xs text-slate-500 font-medium leading-tight">
                {riskSummary}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>

            <button
              type="button"
              onClick={() => handleDetails('risk')}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline whitespace-nowrap transition-colors"
            >
              View Risks →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}