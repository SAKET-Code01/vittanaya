import React from 'react';

/**
 * FinancialSummaryBar Component — STRICT REFERENCE 2 IMPLEMENTATION (Section 11)
 * 
 * Displays the 5 key snapshot metrics in a full-width clean horizontal layout:
 * 1. Expected Inflow (₹9,30,000 | vs last month ↑ 12.4%)
 * 2. Expected Outflow (₹7,20,000 | vs last month ↓ 5.1%)
 * 3. Liquidity Gap (₹0 | No gap expected)
 * 4. Net Cash Flow (₹2,10,000 | vs last month ↑ 8.7%)
 * 5. Lowest Projected Cash (₹6,40,000 | on Day 18 (02 Sep))
 */
import { formatINR } from '../../mocks/dashboardMockData';

export default function FinancialSummaryBar({
  onOpenDetail,
  summary,
}) {
  const inflowVal = summary?.expected_inflow !== undefined ? formatINR(summary.expected_inflow) : '₹9,30,000';
  const outflowVal = summary?.expected_outflow !== undefined ? formatINR(summary.expected_outflow) : '₹7,20,000';
  const gapVal = summary?.liquidity_gap !== undefined ? formatINR(summary.liquidity_gap) : '₹0';
  const netVal = summary?.net_cash_flow !== undefined ? formatINR(summary.net_cash_flow) : '₹2,10,000';
  const lowestVal = summary?.lowest_projected_cash !== undefined ? formatINR(summary.lowest_projected_cash) : '₹6,40,000';

  const metrics = [
    {
      id: 'inflow',
      label: 'Expected Inflow',
      value: inflowVal,
      valueColor: 'text-emerald-600',
      trendText: 'vs last month ↑ 12.4%',
      trendColor: 'text-emerald-600',
      detailType: 'receivables',
    },
    {
      id: 'outflow',
      label: 'Expected Outflow',
      value: outflowVal,
      valueColor: 'text-rose-600',
      trendText: 'vs last month ↓ 5.1%',
      trendColor: 'text-rose-600',
      detailType: 'payables',
    },
    {
      id: 'gap',
      label: 'Liquidity Gap',
      value: gapVal,
      valueColor: 'text-slate-900',
      trendText: summary?.liquidity_gap > 0 ? 'Projected deficit' : 'No gap expected',
      trendColor: summary?.liquidity_gap > 0 ? 'text-rose-600' : 'text-slate-500',
      detailType: 'runway',
    },
    {
      id: 'net',
      label: 'Net Cash Flow',
      value: netVal,
      valueColor: (summary?.net_cash_flow ?? 210000) >= 0 ? 'text-emerald-600' : 'text-rose-600',
      trendText: 'vs last month ↑ 8.7%',
      trendColor: (summary?.net_cash_flow ?? 210000) >= 0 ? 'text-emerald-600' : 'text-rose-600',
      detailType: 'cash-overview',
    },
    {
      id: 'lowest',
      label: 'Lowest Projected Cash',
      value: lowestVal,
      valueColor: 'text-blue-600',
      trendText: 'on Day 18 (02 Sep)',
      trendColor: 'text-slate-500',
      detailType: 'runway',
    },
  ];

  return (
    <div className="dash-card p-5 sm:p-6 space-y-4">
      {/* Header: Title + Info Icon */}
      <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Financial Snapshot
        </h3>
        <span className="text-slate-400 hover:text-slate-600" title="Key consolidated liquidity metrics">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </div>

      {/* 5 Columns Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {metrics.map((m, idx) => (
          <div
            key={m.id}
            onClick={() => {
              if (onOpenDetail && m.detailType) onOpenDetail(m.detailType);
            }}
            className={`flex flex-col justify-between space-y-1 cursor-pointer hover:opacity-80 transition-opacity ${
              idx > 0 ? 'pt-3 md:pt-0 md:pl-5' : ''
            }`}
          >
            <span className="text-xs font-semibold text-slate-500 truncate">
              {m.label}
            </span>

            <div className="text-xl sm:text-2xl font-extrabold num-tabular tracking-tight">
              <span className={m.valueColor}>{m.value}</span>
            </div>

            <p className={`text-xs font-medium ${m.trendColor} truncate`}>
              {m.trendText}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
