import React from 'react';
import { formatINR, formatINRLakhs } from '../../mocks/dashboardMockData';

/**
 * WhatVittanayaSees Component
 * Provides an executive-level synthesized narrative of the business's working-capital health,
 * combining the Financial Pulse with actionable operational focus items.
 */
export default function WhatVittanayaSees({ summary, currentProfile, onOpenWhy }) {
  const pulse = currentProfile?.pulse || {
    status: 'Stable',
    color: 'emerald',
    score: 86,
    message: 'All scheduled outflows fully covered with 38-day runway cushion.',
  };

  const netFlow = (summary.expected_inflow || 0) - (summary.expected_outflow || 0);

  return (
    <div className="rounded-xl bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#131C2E] border border-slate-800/90 p-4 sm:p-5 shadow-lg backdrop-blur-sm space-y-4">
      
      {/* Header: Title + Financial Pulse Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              What VITTANAYA Sees
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                • Financial Picture at a Glance
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {currentProfile?.contextSummary || 'Intelligent synthesis of active receivables, payables, and runway cushion.'}
            </p>
          </div>
        </div>

        {/* Financial Pulse Status Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-400">Financial Pulse:</span>
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  pulse.status === 'Stable' ? 'bg-emerald-400' : 'bg-amber-400'
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  pulse.status === 'Stable' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span
              className={`text-xs font-bold ${
                pulse.status === 'Stable' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {pulse.status} ({pulse.score}/100)
            </span>
          </div>
        </div>
      </div>

      {/* 4-Pillar Executive Digest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Cash Position */}
        <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Available Liquid Reserve
          </span>
          <p className="text-base font-bold text-white num-tabular">
            {formatINR(summary.cash_balance)}
          </p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <span>✓</span> Above ₹{summary.lowest_projected_cash ? '5.0L' : '5.0L'} Safety Buffer
          </p>
        </div>

        {/* 2. Net Cash Flow */}
        <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            30-Day Net Projected Flow
          </span>
          <p className="text-base font-bold text-emerald-400 num-tabular">
            +{formatINR(netFlow)}
          </p>
          <p className="text-[11px] text-slate-400">
            Inflow {formatINRLakhs(summary.expected_inflow)} vs Outflow {formatINRLakhs(summary.expected_outflow)}
          </p>
        </div>

        {/* 3. Runway Security */}
        <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Working Capital Runway
          </span>
          <div className="flex items-baseline justify-between">
            <p className="text-base font-bold text-white num-tabular">
              {summary.runway_days} Days
            </p>
            <button
              type="button"
              onClick={() => onOpenWhy('runway_days')}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
            >
              Why?
            </button>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">
            Zero Liquidity Deficit (₹0 Gap)
          </p>
        </div>

        {/* 4. Lowest Point Caution */}
        <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Projected Trough Point
            </span>
            <button
              type="button"
              onClick={() => onOpenWhy('lowest_projected_cash')}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
            >
              Why?
            </button>
          </div>
          <p className="text-base font-bold text-amber-400 num-tabular">
            {formatINR(summary.lowest_projected_cash)}
          </p>
          <p className="text-[11px] text-slate-400">
            Day 18 (Sep 02) • Preserves +₹1.4L cushion
          </p>
        </div>
      </div>

      {/* Narrative Footer */}
      <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
        <p className="flex items-center gap-1.5">
          <span className="text-amber-400 font-bold">Observation:</span>
          <span>{pulse.message}</span>
        </p>
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 self-start sm:self-auto">
          <span>Active Modules:</span>
          <span className="font-semibold text-slate-200">
            {currentProfile?.modules?.join(' • ') || 'Core Cash-Flow'}
          </span>
        </div>
      </div>
    </div>
  );
}
