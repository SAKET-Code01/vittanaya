import React from 'react';

/**
 * PaymentFinancialTrackCard Component — 100% Faithful to Reference
 */
export default function PaymentFinancialTrackCard({
  paymentData,
  onNavigate,
  className = '',
}) {
  const moneyIn = paymentData?.moneyIn || '₹ 1,85,000';
  const moneyOut = paymentData?.moneyOut || '₹ 1,22,750';
  const upcomingDue = paymentData?.upcomingDue || '₹ 48,750';

  const recentActivity = [
    { id: 1, date: 'Today', title: 'Freight Collection', amount: '+ ₹ 45,000', isPositive: true },
    { id: 2, date: 'Yesterday', title: 'Fuel Expense', amount: '- ₹ 28,500', isPositive: false },
    { id: 3, date: '15 May 2025', title: 'Driver Payment', amount: '- ₹ 22,250', isPositive: false },
  ];

  const upcomingPayments = [
    { id: 1, date: '20 May 2025', title: 'EMI Payment', amount: '₹ 24,500' },
    { id: 2, date: '22 May 2025', title: 'Permits & Tax', amount: '₹ 12,500' },
    { id: 3, date: '25 May 2025', title: 'Insurance Premium', amount: '₹ 11,750' },
  ];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between ${className}`}>
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-purple-600 text-sm font-bold">✦</span>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              Payment & Financial Track (All Money Flow)
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Overview of money in, out and upcoming dues
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('financial-plan')}
          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <span>Payment Details</span>
          <span className="text-[10px]">▼</span>
        </button>
      </div>

      {/* 2. Top Summary 3 Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3.5">
        
        {/* Money In */}
        <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500">Money In</p>
            <p className="text-sm font-black text-slate-900 leading-tight">{moneyIn}</p>
            <p className="text-[10px] font-medium text-slate-500">This Month</p>
          </div>
        </div>

        {/* Money Out */}
        <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500">Money Out</p>
            <p className="text-sm font-black text-slate-900 leading-tight">{moneyOut}</p>
            <p className="text-[10px] font-medium text-slate-500">This Month</p>
          </div>
        </div>

        {/* Upcoming Due */}
        <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500">Upcoming Due</p>
            <p className="text-sm font-black text-slate-900 leading-tight">{upcomingDue}</p>
            <p className="text-[10px] font-medium text-slate-500">Due in 10 days</p>
          </div>
        </div>

      </div>

      {/* 3. Bottom Two Lists: Recent Activity & Upcoming Payments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-1 pt-2 border-t border-slate-100 text-xs">
        
        {/* Recent Activity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-extrabold text-slate-800 text-[11px]">
              Recent Activity
            </h3>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('financial-plan')}
              className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-1.5">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-medium w-16">{item.date}</span>
                  <span className="font-semibold text-slate-800">{item.title}</span>
                </div>
                <span className={`font-black text-xs ${item.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="space-y-2 sm:border-l sm:border-slate-100 sm:pl-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-extrabold text-slate-800 text-[11px]">
              Upcoming Payments
            </h3>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('financial-plan')}
              className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-1.5">
            {upcomingPayments.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-medium w-20">{item.date}</span>
                  <span className="font-semibold text-slate-800">{item.title}</span>
                </div>
                <span className="font-black text-xs text-slate-900">
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Bottom Link */}
      <div className="pt-3 border-t border-slate-100 flex justify-center">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('financial-plan')}
          className="text-xs font-bold text-indigo-700 hover:text-indigo-800 transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>View Full Payment History & Cash Flow</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
}
