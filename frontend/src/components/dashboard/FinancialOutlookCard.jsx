import React from 'react';

/**
 * FinancialOutlookCard Component — 100% Faithful to Reference
 */
export default function FinancialOutlookCard({
  financialData,
  onNavigate,
  className = '',
}) {
  const projectCost = financialData?.projectCost || '₹ 14.50 L';
  const ownCapital = financialData?.ownCapital || '₹ 2.20 L';
  const ownCapitalPct = financialData?.ownCapitalPct || '(15%)';
  const loanAmount = financialData?.loanAmount || '₹ 12.30 L';
  const outstandingLoan = financialData?.outstandingLoan || '₹ 11.85 L';
  const outstandingLoanPct = financialData?.outstandingLoanPct || '(96% of loan)';
  const emiMonthly = financialData?.emiMonthly || '₹ 24,500';
  const interestRate = financialData?.interestRate || '9.25% p.a.';

  const metrics = [
    {
      id: 'cost',
      label: 'Project Cost',
      value: projectCost,
      sub: null,
      iconBg: 'bg-blue-50 text-blue-700',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
        </svg>
      ),
    },
    {
      id: 'equity',
      label: 'Own Capital',
      value: ownCapital,
      sub: ownCapitalPct,
      iconBg: 'bg-sky-50 text-sky-700',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="3" />
          <circle cx="16" cy="12" r="2" />
        </svg>
      ),
    },
    {
      id: 'loan',
      label: 'Loan Amount',
      value: loanAmount,
      sub: null,
      iconBg: 'bg-indigo-50 text-indigo-700',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5H4.5V21m16.5 0H3" />
        </svg>
      ),
    },
    {
      id: 'outstanding',
      label: 'Outstanding Loan',
      value: outstandingLoan,
      sub: outstandingLoanPct,
      iconBg: 'bg-blue-50 text-blue-700',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" />
          <path d="M9 14.25v6.75M15 14.25v6.75" />
        </svg>
      ),
    },
    {
      id: 'emi',
      label: 'EMI (Monthly)',
      value: emiMonthly,
      sub: null,
      iconBg: 'bg-purple-50 text-purple-700',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: 'interest',
      label: 'Interest Rate',
      value: interestRate,
      sub: null,
      iconBg: 'bg-blue-50 text-blue-700',
      icon: <span className="font-extrabold text-sm">%</span>,
    },
  ];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between ${className}`}>
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
            A. Financial Outlook (Loan & Bank)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Loan and financing position at a glance
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('financial-plan')}
          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <span>Loan Details</span>
          <span className="text-[10px]">▼</span>
        </button>
      </div>

      {/* 2. 6 Financial Metric Columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
        {metrics.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col items-center text-center justify-between space-y-2 hover:bg-slate-50 transition-colors"
          >
            {/* Icon Circle */}
            <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center shadow-2xs`}>
              {item.icon}
            </div>

            {/* Label */}
            <p className="text-[11px] font-semibold text-slate-600 leading-tight">
              {item.label}
            </p>

            {/* Value */}
            <div className="leading-tight">
              <p className="text-sm font-black text-slate-900">
                {item.value}
              </p>
              {item.sub && (
                <p className="text-[10px] font-bold text-slate-500">
                  {item.sub}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom Link */}
      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('financial-plan')}
          className="text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>View Full Loan & Financial Details</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
}
