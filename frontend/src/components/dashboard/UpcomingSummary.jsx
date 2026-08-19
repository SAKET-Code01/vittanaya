import React from 'react';
import { formatINR } from '../../mocks/dashboardMockData';

/**
 * UpcomingSummary Component
 * Displays actionable lists of high-risk customer receivables and critical supplier payables.
 */
export default function UpcomingSummary({ receivables, payables, currentProfile }) {
  const getRiskBadge = (risk) => {
    switch (risk?.toUpperCase()) {
      case 'HIGH':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      case 'MEDIUM':
        return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Receivables: Attention Required */}
      <div className="rounded-xl bg-[#111827]/90 border border-slate-800/90 p-4 sm:p-5 backdrop-blur-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Receivables Watchlist & Delays
                </h4>
                <p className="text-[11px] text-slate-400">
                  {currentProfile?.name ? `${currentProfile.name} • Active Billed Invoices` : 'Customer invoices with projected collection delay'}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {receivables?.length || 0} Open
            </span>
          </div>

          {/* Table / List */}
          <div className="space-y-2.5">
            {receivables?.map((item) => (
              <div
                key={item.invoice_id}
                className="p-3 rounded-lg bg-[#0F172A]/70 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {item.invoice_id}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {item.customer}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${getRiskBadge(
                        item.risk
                      )}`}
                    >
                      {item.risk} RISK
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span>Due: {item.due_date}</span>
                    <span>•</span>
                    <span className="text-amber-300/90 font-medium">
                      Exp Pay: {item.expected_payment_date}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-[10px] text-slate-400 italic">
                      ↳ {item.notes}
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-sm font-bold text-white num-tabular">
                    {formatINR(item.amount)}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Status: {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Invoices scored by payment reliability rating</span>
          <span className="font-semibold text-amber-400 hover:text-amber-300 cursor-pointer">
            Invoices Management →
          </span>
        </div>
      </div>

      {/* 2. Payables: Upcoming Obligations */}
      <div className="rounded-xl bg-[#111827]/90 border border-slate-800/90 p-4 sm:p-5 backdrop-blur-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Critical Payables Schedule
                </h4>
                <p className="text-[11px] text-slate-400">
                  Fixed operational obligations and supplier settlements
                </p>
              </div>
            </div>

            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {payables?.length || 0} Bills
            </span>
          </div>

          {/* Table / List */}
          <div className="space-y-2.5">
            {payables?.map((item) => (
              <div
                key={item.bill_id}
                className="p-3 rounded-lg bg-[#0F172A]/70 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {item.bill_id}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {item.supplier}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${getPriorityBadge(
                        item.priority
                      )}`}
                    >
                      {item.priority} PRIORITY
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span>Due: {item.due_date}</span>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">{item.category}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-sm font-bold text-rose-400 num-tabular">
                    {formatINR(item.amount)}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Status: {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Priority 1 settlements impact liquid runway directly</span>
          <span className="font-semibold text-amber-400 hover:text-amber-300 cursor-pointer">
            Manage Payables →
          </span>
        </div>
      </div>
    </div>
  );
}
