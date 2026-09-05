import React from 'react';

/**
 * Inline KPI Icons
 */
function KpiIcon({ name, size = 18, className = '' }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  };

  switch (name) {
    case 'wallet':
      return (
        <svg {...props}>
          <path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12" />
          <path d="M17 13h4" />
          <circle cx="17" cy="13" r=".7" fill="currentColor" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 3 20 6v5c0 5.2-3.3 8.6-8 10-4.7-1.4-8-4.8-8-10V6l8-3Z" />
          <path d="m8.5 12 2.3 2.3 4.7-5" />
        </svg>
      );
    case 'target':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'rocket':
      return (
        <svg {...props}>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );
    case 'bank':
      return (
        <svg {...props}>
          <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3l9 7H3z" />
        </svg>
      );
    case 'alert-triangle':
      return (
        <svg {...props}>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'compass':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * DashboardKPIGrid Component
 * 
 * Level 2 Metrics Grid:
 * - Row 1: Existing 4 Opportunity Metrics (Own Margin, Subsidy, Max Project Size, Break-even Horizon)
 * - Row 2: NEW 4 Decision Metrics (Business Readiness, Funding Readiness, Business Risk, Local Market Potential)
 * 
 * Identical card styling, typography hierarchy, icon containers, and responsive behavior.
 */
export default function DashboardKPIGrid({
  ownCapital = null,
  subsidyPct = null,
  estimatedProjectCost = null,
  maxSupportableProjectSize = null,
  projectCostLabel = 'Estimated Project Cost',
  projectCostSourceName = 'NABARD benchmark',
  breakevenEstimate = null,
  readinessLabel = null,
  readinessCountContext = null,
  fundingReadinessLabel = null,
  fundingContext = null,
  riskLevel = null,
  riskContext = null,
  marketPotential = null,
  marketContext = null,
  isLoading = false,
}) {
  // First Row: Opportunity Metrics (What does the business opportunity look like?)
  const row1Cards = [
    {
      id: 'kpi-margin-capital',
      label: 'Own Margin Capital',
      value: ownCapital != null && Number(ownCapital) > 0
        ? `₹ ${Number(ownCapital).toLocaleString('en-IN')}`
        : (isLoading ? '...' : 'Not available'),
      context: ownCapital != null && Number(ownCapital) > 0
        ? '100% committed as initial margin'
        : 'Margin capital not recorded',
      icon: 'wallet',
      iconContainer: 'bg-blue-50 text-blue-600 border border-blue-100',
      valueColor: 'text-slate-900',
    },
    {
      id: 'kpi-subsidy-eligibility',
      label: 'Subsidy Eligibility',
      value: subsidyPct != null
        ? `${subsidyPct}% Entitled`
        : (isLoading ? '...' : 'Insufficient data'),
      context: subsidyPct != null
        ? 'Under verified scheme rules'
        : 'Scheme matching pending',
      icon: 'shield',
      iconContainer: 'bg-blue-50 text-blue-600 border border-blue-100',
      valueColor: 'text-blue-700',
    },
    {
      id: 'kpi-project-size',
      label: 'Maximum Supportable Project Size',
      value: maxSupportableProjectSize != null && Number(maxSupportableProjectSize) > 0
        ? (Number(maxSupportableProjectSize) >= 100000
            ? `₹ ${(Number(maxSupportableProjectSize) / 100000).toFixed(2)} Lakh`
            : `₹ ${Number(maxSupportableProjectSize).toLocaleString('en-IN')}`)
        : (ownCapital != null && Number(ownCapital) > 0
            ? (Number(ownCapital) * 10 >= 100000
                ? `₹ ${(Number(ownCapital) * 10 / 100000).toFixed(2)} Lakh`
                : `₹ ${(Number(ownCapital) * 10).toLocaleString('en-IN')}`)
            : (isLoading ? '...' : 'Not available')),
      context: (maxSupportableProjectSize != null && Number(maxSupportableProjectSize) > 0) || (ownCapital != null && Number(ownCapital) > 0)
        ? `Derived from ₹${Number(ownCapital || 0).toLocaleString('en-IN')} own capital (10% margin limit)`
        : 'Requires own capital input',
      icon: 'target',
      iconContainer: 'bg-blue-50 text-blue-600 border border-blue-100',
      valueColor: 'text-slate-900',
    },
    {
      id: 'kpi-breakeven',
      label: 'Break-even Horizon',
      value: breakevenEstimate || (isLoading ? '...' : 'Insufficient data'),
      context: breakevenEstimate ? 'Based on category benchmark' : 'Requires operational projection',
      icon: 'clock',
      iconContainer: 'bg-slate-100 text-slate-700 border border-slate-200',
      valueColor: 'text-slate-900',
    },
  ];

  // Second Row: Decision Metrics (How ready am I to act on it?)
  const row2Cards = [
    {
      id: 'kpi-business-readiness',
      label: 'Business Readiness',
      value: readinessLabel || (isLoading ? '...' : 'Insufficient data'),
      context: readinessCountContext || 'Statutory & launch requirements',
      icon: 'rocket',
      iconContainer: 'bg-blue-50 text-blue-600 border border-blue-100',
      valueColor: 'text-slate-900',
    },
    {
      id: 'kpi-funding-readiness',
      label: 'Funding Readiness',
      value: fundingReadinessLabel || (isLoading ? '...' : 'Insufficient data'),
      context: fundingContext || 'Funding structure identification',
      icon: 'bank',
      iconContainer: 'bg-blue-50 text-blue-600 border border-blue-100',
      valueColor: 'text-blue-700',
    },
    {
      id: 'kpi-business-risk',
      label: 'Business Risk',
      value: riskLevel || (isLoading ? '...' : 'Insufficient data'),
      context: riskContext || 'Multi-dimensional risk analysis',
      icon: 'alert-triangle',
      iconContainer: 'bg-amber-50 text-amber-600 border border-amber-200/80',
      valueColor: 'text-amber-700',
    },
    {
      id: 'kpi-local-market-potential',
      label: 'Local Market Potential',
      value: marketPotential || (isLoading ? '...' : 'Insufficient data'),
      context: marketContext || 'Local catchment demand signal',
      icon: 'compass',
      iconContainer: 'bg-blue-50 text-blue-600 border border-blue-100',
      valueColor: 'text-blue-700',
    },
  ];

  return (
    <div className="space-y-4" aria-label="Venture Metrics Dashboard">
      
      {/* Row 1: Existing 4 KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key Venture Metrics">
        {row1Cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between space-y-3"
          >
            {/* Top Row: Label & Small Icon */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconContainer}`}>
                <KpiIcon name={card.icon} size={16} />
              </div>
            </div>

            {/* Bottom Row: Large Value & Context */}
            <div>
              <div className={`text-2xl font-black tracking-tight ${card.valueColor}`}>
                {card.value}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                {card.context}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Row 2: NEW 4 Decision KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Decision Readiness Metrics">
        {row2Cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between space-y-3"
          >
            {/* Top Row: Label & Small Icon */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconContainer}`}>
                <KpiIcon name={card.icon} size={16} />
              </div>
            </div>

            {/* Bottom Row: Large Value & Context */}
            <div>
              <div className={`text-2xl font-black tracking-tight ${card.valueColor}`}>
                {card.value}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                {card.context}
              </p>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}
