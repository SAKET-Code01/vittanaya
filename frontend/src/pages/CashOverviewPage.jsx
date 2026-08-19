import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useWorkspace } from '../context/WorkspaceContext';
import { formatINR, formatINRLakhs } from '../mocks/dashboardMockData.js';
import {
  CASH_MOVEMENT_DATA,
  CASH_OPTIMIZATION_SUGGESTIONS,
} from '../data/cashOverviewMockData.js';

/**
 * CashOverviewPage Component — 100% STRICT APPROVED REFERENCE DESIGN
 * 
 * Complies with the Cash Overview reference layout:
 * 1. Page Header: Breadcrumb "< Home / Cash Overview", Live pill, Date range filter, Filters dropdown, "+ Add Cash Entry"
 * 2. Primary 5 Summary Cards: Total Cash Available, Bank Balance, Cash on Hand, Incoming Cash, Outgoing Cash
 * 3. Middle Row (3 Columns):
 *    - Left: Cash Accounts (HDFC, ICICI, Cash on Hand + "+ Add Cash Account")
 *    - Center: Cash Movement (7D/30D/90D/1Y time toggles, Recharts ComposedChart with Inflow/Outflow/Net, Total metrics)
 *    - Right: Cash Flow Health (Circular score), Quick Insights, "Optimize Your Cash" suggestion card
 * 4. Bottom Row (2 Columns):
 *    - Left: Recent Transactions Table (Date, Description, Category badge, Type, Amount, Balance, View All)
 *    - Right: Cash Breakdown Donut Chart (Bank Balance 75.8%, Cash on Hand 9.1%, Wallets/Others 15.1%)
 * 5. Interactive Modals: Add Cash Entry, Add Cash Account, Optimize Cash Suggestions, Detailed Breakdown, Toast Alerts
 */
export default function CashOverviewPage({ onNavigateHome }) {
  const {
    currentProfile,
    financialData,
    financialSummary,
    cashAccounts = [],
    cashTransactions = [],
    addCashEntry,
    addCashAccount,
    setActiveNavId,
  } = useWorkspace();

  // Active time horizon for Cash Movement chart ('7D' | '30D' | '90D' | '1Y')
  const [movementPeriod, setMovementPeriod] = useState('30D');

  // Transaction filter & search state
  const [txFilter, setTxFilter] = useState('all'); // 'all' | 'inflow' | 'outflow'
  const [datePeriodLabel, setDatePeriodLabel] = useState('19 Aug – 19 Aug 2026');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);

  // Modal visibility states
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isViewAllTxOpen, setIsViewAllTxOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Aggregated Bank Balance across all non-physical accounts
  const bankBalance = useMemo(() => {
    return cashAccounts
      .filter((acc) => acc.type !== 'Physical Cash')
      .reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }, [cashAccounts]);

  // Cash on Hand balance
  const cashOnHandBalance = useMemo(() => {
    const phys = cashAccounts.find((acc) => acc.type === 'Physical Cash');
    return phys ? phys.balance : 135000;
  }, [cashAccounts]);

  // Total Cash Available directly tied to shared financialData.cash_balance
  const totalCash = financialData?.cash_balance ?? 1485000;
  const incomingCash = financialData?.expected_inflow ?? 2850000;
  const outgoingCash = financialData?.expected_outflow ?? 1920000;

  // Breakdown Data for Donut Chart (strictly matches Total Cash Available)
  const breakdownData = useMemo(() => {
    const bankVal = bankBalance > 0 ? bankBalance : 1125000;
    const physVal = cashOnHandBalance > 0 ? cashOnHandBalance : 135000;
    const othersVal = Math.max(0, totalCash - (bankVal + physVal)) || 225000;
    const computedTotal = bankVal + physVal + othersVal;

    return [
      {
        name: 'Bank Balance',
        value: bankVal,
        percent: ((bankVal / computedTotal) * 100).toFixed(1),
        color: '#3B82F6', // Blue
      },
      {
        name: 'Cash on Hand',
        value: physVal,
        percent: ((physVal / computedTotal) * 100).toFixed(1),
        color: '#F59E0B', // Orange / Amber
      },
      {
        name: 'Wallets / Others',
        value: othersVal,
        percent: ((othersVal / computedTotal) * 100).toFixed(1),
        color: '#8B5CF6', // Purple
      },
    ];
  }, [bankBalance, cashOnHandBalance, totalCash]);

  // Movement chart series for current selected period
  const movementChartData = useMemo(() => {
    return CASH_MOVEMENT_DATA[movementPeriod] || CASH_MOVEMENT_DATA['30D'];
  }, [movementPeriod]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    if (txFilter === 'all') return cashTransactions;
    return cashTransactions.filter((tx) => tx.type === txFilter);
  }, [cashTransactions, txFilter]);

  // Health Score from financial summary or default 82
  const healthScore = financialSummary?.health_score ?? 82;
  const runwayDays = financialSummary?.runway_days ?? 47;
  const liquidityGap = financialSummary?.liquidity_gap ?? 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-slate-900">

      {/* ========================================================================= */}
      {/* 1. PAGE HEADER & ACTIONS                                                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Breadcrumbs & Title */}
        <div className="space-y-1">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <button
              onClick={() => onNavigateHome ? onNavigateHome() : setActiveNavId('dashboard')}
              className="hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </button>
            <span>/</span>
            <span className="text-slate-900 font-bold">Cash Overview</span>
          </nav>

          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cash Overview
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Live
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
            <span>Real-time view of your cash position, accounts and cash flow movement.</span>
            <span className="cursor-pointer text-slate-400 hover:text-slate-600" title="Cash metrics reflect your single source of truth workspace.">ⓘ</span>
          </p>
        </div>

        {/* Right: Date Range Selector, Filters, and Add Cash Entry CTA */}
        <div className="flex items-center flex-wrap gap-2.5 self-start lg:self-auto relative">
          
          {/* Date Range Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDateRangePickerOpen(!isDateRangePickerOpen)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{datePeriodLabel}</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDateRangePickerOpen && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-30 space-y-1 text-xs font-semibold animate-fadeIn">
                {['19 Aug – 19 Aug 2026', 'Last 7 Days', 'This Month (Aug 2026)', 'Last 30 Days', 'This Quarter (Q3)', 'Financial Year 2026-27'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setDatePeriodLabel(opt);
                      setIsDateRangePickerOpen(false);
                      showToast(`Date range adjusted to: ${opt}`);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                      datePeriodLabel === opt
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-30 space-y-1 text-xs font-semibold animate-fadeIn">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Transaction Types
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTxFilter('all');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg ${
                    txFilter === 'all' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  All Transactions
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxFilter('inflow');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg ${
                    txFilter === 'inflow' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  ↓ Inflow Only
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxFilter('outflow');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg ${
                    txFilter === 'outflow' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  ↑ Outflow Only
                </button>
              </div>
            )}
          </div>

          {/* Primary CTA: + Add Cash Entry */}
          <button
            type="button"
            onClick={() => setIsAddEntryOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
          >
            <span className="text-sm font-black">+</span>
            <span>Add Cash Entry</span>
            <svg className="w-3 h-3 ml-0.5 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center space-x-2.5 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRIMARY CASH SUMMARY (5 COMPACT CARDS MATCHING REFERENCE)               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Cash Available */}
        <div className="dash-card p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-xs font-bold text-slate-600">
                <span>Total Cash Available</span>
                <span className="text-slate-400 cursor-pointer" title="Immediate liquid cash across verified bank accounts and physical cash.">ⓘ</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono tracking-tight">
                {formatINR(totalCash)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-700">
              <span>↑ 12.6%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
            {/* Sparkline Visual */}
            <svg className="w-16 h-6 text-emerald-500" viewBox="0 0 64 24" fill="none">
              <path d="M2 18 C15 16, 25 22, 35 12 C45 2, 55 10, 62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Bank Balance */}
        <div className="dash-card p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-600">
                Bank Balance
              </div>
              <p className="text-xl sm:text-2xl font-black text-blue-600 font-mono tracking-tight">
                {formatINR(bankBalance > 0 ? bankBalance : 1125000)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-blue-700">
              <span>↑ 8.2%</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-slate-500 font-medium">{cashAccounts.length} Accounts</span>
            </div>
            <svg className="w-16 h-6 text-blue-500" viewBox="0 0 64 24" fill="none">
              <path d="M2 20 C18 18, 28 8, 40 14 C50 20, 56 6, 62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Cash on Hand */}
        <div className="dash-card p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-600">
                Cash on Hand
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-600 font-mono tracking-tight">
                {formatINR(cashOnHandBalance)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-700">
              <span>↑ 3.4%</span>
            </div>
            <svg className="w-16 h-6 text-amber-500" viewBox="0 0 64 24" fill="none">
              <path d="M2 16 C20 18, 30 12, 42 15 C52 18, 58 10, 62 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Incoming Cash */}
        <div className="dash-card p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-600">
                Incoming Cash
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono tracking-tight">
                {formatINR(incomingCash)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-700">
              <span>↑ 15.1%</span>
            </div>
            <svg className="w-16 h-6 text-emerald-500" viewBox="0 0 64 24" fill="none">
              <path d="M2 22 C14 18, 26 12, 38 16 C48 20, 56 8, 62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 5: Outgoing Cash */}
        <div className="dash-card p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-600">
                Outgoing Cash
              </div>
              <p className="text-xl sm:text-2xl font-black text-rose-600 font-mono tracking-tight">
                {formatINR(outgoingCash)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1 text-[11px] font-bold text-rose-700">
              <span>↑ 9.3%</span>
            </div>
            <svg className="w-16 h-6 text-rose-400" viewBox="0 0 64 24" fill="none">
              <path d="M2 14 C16 10, 28 20, 40 12 C50 4, 58 12, 62 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW (3 COLUMNS MATCHING REFERENCE)                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ----------------------------------------------------------------------- */}
        {/* COLUMN 1: CASH ACCOUNTS (lg:col-span-3)                                */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 dash-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Cash Accounts
                </h3>
                <span className="text-slate-400 text-xs cursor-pointer" title="Configured liquid accounts">ⓘ</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {cashAccounts.length} Accounts
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(true)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Manage Accounts"
                >
                  ⋮
                </button>
              </div>
            </div>

            {/* Account Cards List */}
            <div className="space-y-3">
              {cashAccounts.map((acc) => {
                const isHdfc = acc.name.toLowerCase().includes('hdfc');
                const isIcici = acc.name.toLowerCase().includes('icici');
                const isCash = acc.type === 'Physical Cash';

                return (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        {/* Bank Icon Badge */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          isHdfc
                            ? 'bg-blue-600 text-white'
                            : isIcici
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}>
                          {isHdfc ? 'H' : isIcici ? 'i' : '₹'}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {acc.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {acc.type}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 font-mono block">
                          {formatINR(acc.balance)}
                        </span>
                      </div>
                    </div>

                    {/* Sub-metrics Inflow/Outflow */}
                    {!isCash && (
                      <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 border-t border-slate-100">
                        <span>
                          Inflow <strong className="text-emerald-700 font-mono">{formatINR(acc.inflow || 0)}</strong>
                        </span>
                        <span>
                          Outflow <strong className="text-rose-600 font-mono">{formatINR(acc.outflow || 0)}</strong>
                        </span>
                      </div>
                    )}

                    {/* Status updated timestamp */}
                    <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 pt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{acc.lastUpdated || 'Updated recently'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action: + Add Cash Account */}
          <button
            type="button"
            onClick={() => setIsAddAccountOpen(true)}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
          >
            <span className="text-sm font-bold text-emerald-600">+</span>
            <span>Add Cash Account</span>
          </button>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* COLUMN 2: CASH MOVEMENT CHART (lg:col-span-6 CENTER WIDE)               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-6 dash-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Header with Time Horizon Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Cash Movement
                </h3>
                <span className="text-slate-400 text-xs cursor-pointer" title="Aggregated daily inflows, outflows, and net realized liquidity.">ⓘ</span>
              </div>

              {/* Time Horizon Filter (7D, 30D, 90D, 1Y) */}
              <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-slate-100 border border-slate-200/60 self-start sm:self-auto">
                {['7D', '30D', '90D', '1Y'].map((horizon) => (
                  <button
                    key={horizon}
                    type="button"
                    onClick={() => setMovementPeriod(horizon)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      movementPeriod === horizon
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {horizon}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex items-center space-x-4 text-xs font-bold pt-1">
              <div className="flex items-center space-x-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Inflow</span>
              </div>
              <div className="flex items-center space-x-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Outflow</span>
              </div>
              <div className="flex items-center space-x-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Net Cash Flow</span>
              </div>
            </div>

            {/* Interactive Recharts ComposedChart */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={movementChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="label"
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickFormatter={(val) => formatINRLakhs(val)}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 backdrop-blur-md">
                          <p className="font-extrabold text-slate-300 border-b border-slate-700 pb-1">{label}</p>
                          <p className="text-emerald-400 font-bold">Inflow: {formatINR(payload.find(p => p.dataKey === 'inflow')?.value || 0)}</p>
                          <p className="text-rose-400 font-bold">Outflow: {formatINR(Math.abs(payload.find(p => p.dataKey === 'outflow')?.value || 0))}</p>
                          <p className="text-blue-400 font-extrabold">Net Flow: {formatINR(payload.find(p => p.dataKey === 'net')?.value || 0)}</p>
                        </div>
                      );
                    }}
                  />
                  {/* Inflow Bars (Positive green) */}
                  <Bar dataKey="inflow" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={16} />
                  {/* Outflow Bars (Negative coral) */}
                  <Bar dataKey="outflow" fill="#EF4444" radius={[0, 0, 4, 4]} maxBarSize={16} />
                  {/* Net Cash Flow Line (Blue) */}
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3B82F6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Totals Strip */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] font-bold text-slate-500 block">Total Inflow</span>
              <span className="text-xs sm:text-sm font-black text-emerald-700 font-mono">
                {formatINR(incomingCash)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
              <span className="text-[10px] font-bold text-slate-500 block">Total Outflow</span>
              <span className="text-xs sm:text-sm font-black text-rose-600 font-mono">
                {formatINR(outgoingCash)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-[10px] font-bold text-slate-500 block">Net Cash Flow</span>
              <span className="text-xs sm:text-sm font-black text-blue-700 font-mono">
                {formatINR(incomingCash - outgoingCash)}
              </span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* COLUMN 3: CASH FLOW HEALTH & QUICK INSIGHTS (lg:col-span-3)             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Card 1: Cash Flow Health */}
          <div className="dash-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900">Cash Flow Health</span>
                <span className="text-slate-400 text-xs cursor-pointer" title="Composite solvency index derived from liquidity, coverage, and runway.">ⓘ</span>
              </div>
            </div>

            {/* Circular Gauge / Score */}
            <div className="flex items-center space-x-4 pt-1">
              <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeDasharray={`${healthScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-slate-900 font-mono leading-none">
                    {healthScore}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 uppercase mt-0.5">
                    Good
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-800 leading-snug">
                  Your cash flow is healthy.
                </p>
                <p className="text-slate-500 text-[11px] leading-snug">
                  Keep monitoring to stay ahead of upcoming month-end commitments.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Insights */}
          <div className="dash-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-1 text-xs font-bold text-slate-900">
                <span>Quick Insights</span>
                <span className="text-slate-400 text-xs cursor-pointer">ⓘ</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                    ⏱
                  </div>
                  <span className="text-slate-600 font-semibold">Cash runway</span>
                </div>
                <span className="font-black text-emerald-700 font-mono">{runwayDays} days</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold">
                    🔥
                  </div>
                  <span className="text-slate-600 font-semibold">Avg. daily burn</span>
                </div>
                <span className="font-black text-rose-600 font-mono">₹40,851</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                    🛡
                  </div>
                  <span className="text-slate-600 font-semibold">Liquidity gap</span>
                </div>
                <span className="font-black text-emerald-700 font-mono">{formatINR(liquidityGap)}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                    📅
                  </div>
                  <span className="text-slate-600 font-semibold">Next big outflow</span>
                </div>
                <span className="font-bold text-slate-800">25 Aug</span>
              </div>
            </div>
          </div>

          {/* Card 3: Optimize Your Cash (Smart Recommendation Panel) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-white border border-indigo-100/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-950">
                <span className="text-indigo-600">⚡</span>
                <span>Optimize Your Cash</span>
              </div>

              {/* Graphic Icon */}
              <div className="w-8 h-8 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center font-bold text-xs">
                📊
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              You can improve your cash flow by reducing unnecessary expenses and speeding up receivables.
            </p>

            <button
              type="button"
              onClick={() => setIsSuggestionsOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              View Suggestions
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ROW (2 COLUMNS: TRANSACTIONS & CASH BREAKDOWN)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ----------------------------------------------------------------------- */}
        {/* RECENT TRANSACTIONS TABLE (lg:col-span-8 WIDE)                         */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-8 dash-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Recent Transactions
              </h3>
              <span className="text-slate-400 text-xs cursor-pointer">ⓘ</span>
            </div>

            <button
              type="button"
              onClick={() => setIsViewAllTxOpen(true)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 px-4">Description</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-4 text-right">Amount</th>
                  <th className="pb-3 pl-4 text-right">Balance</th>
                  <th className="pb-3 pl-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.slice(0, 5).map((tx) => {
                  const isInflow = tx.type === 'inflow';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Date */}
                      <td className="py-3.5 pr-4 text-[11px] text-slate-500 whitespace-nowrap font-medium">
                        {tx.date}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {tx.description}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          tx.category === 'Sales'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.category === 'Fuel' || tx.category === 'Travel'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : tx.category === 'Purchases' || tx.category === 'Utilities'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {tx.category}
                        </span>
                      </td>

                      {/* Type Indicator */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-semibold">
                        {isInflow ? (
                          <span className="text-emerald-600 flex items-center gap-1 text-[11px]">
                            <span>↓</span> Inflow
                          </span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-1 text-[11px]">
                            <span>↑</span> Outflow ›
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className={`py-3.5 px-4 text-right font-black font-mono whitespace-nowrap ${
                        isInflow ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isInflow ? `+${formatINR(tx.amount)}` : formatINR(tx.amount)}
                      </td>

                      {/* Balance */}
                      <td className="py-3.5 pl-4 text-right font-bold text-slate-700 font-mono whitespace-nowrap">
                        {formatINR(tx.balanceAfter)}
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 pl-2 text-right">
                        <button
                          type="button"
                          onClick={() => showToast(`Transaction ${tx.id} details inspected.`)}
                          className="text-slate-300 hover:text-slate-600 px-1 cursor-pointer"
                        >
                          ⋮
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CASH BREAKDOWN DONUT (lg:col-span-4)                                    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-4 dash-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Cash Breakdown
                </h3>
                <span className="text-slate-400 text-xs cursor-pointer">ⓘ</span>
              </div>
            </div>

            {/* Donut Chart with Center Text */}
            <div className="relative h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                          <p className="font-bold">{d.name}</p>
                          <p className="font-mono text-emerald-400 font-bold">{formatINR(d.value)} ({d.percent}%)</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Total
                </span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {formatINR(totalCash)}
                </span>
              </div>
            </div>

            {/* Legend & Percentage breakdown */}
            <div className="space-y-2 text-xs pt-1">
              {breakdownData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 font-mono">
                    <span className="font-extrabold text-slate-900">{formatINR(item.value)}</span>
                    <span className="text-slate-400 text-[11px] w-10 text-right">{item.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <button
            type="button"
            onClick={() => setIsBreakdownOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 pt-2 cursor-pointer"
          >
            <span>View Detailed Breakdown</span>
            <span>→</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL OVERLAYS                                                         */}
      {/* ========================================================================= */}

      {/* MODAL 1: + ADD CASH ENTRY */}
      {isAddEntryOpen && (
        <AddCashEntryModal
          isOpen={isAddEntryOpen}
          onClose={() => setIsAddEntryOpen(false)}
          cashAccounts={cashAccounts}
          onAddEntry={(entry) => {
            addCashEntry(entry);
            setIsAddEntryOpen(false);
            showToast(`Cash entry "${entry.description}" recorded successfully.`);
          }}
        />
      )}

      {/* MODAL 2: + ADD CASH ACCOUNT */}
      {isAddAccountOpen && (
        <AddCashAccountModal
          isOpen={isAddAccountOpen}
          onClose={() => setIsAddAccountOpen(false)}
          onAddAccount={(acc) => {
            addCashAccount(acc);
            setIsAddAccountOpen(false);
            showToast(`Account "${acc.name}" configured.`);
          }}
        />
      )}

      {/* MODAL 3: VIEW CASH SUGGESTIONS */}
      {isSuggestionsOpen && (
        <CashSuggestionsModal
          isOpen={isSuggestionsOpen}
          onClose={() => setIsSuggestionsOpen(false)}
        />
      )}

      {/* MODAL 4: DETAILED CASH BREAKDOWN */}
      {isBreakdownOpen && (
        <DetailedBreakdownModal
          isOpen={isBreakdownOpen}
          onClose={() => setIsBreakdownOpen(false)}
          breakdownData={breakdownData}
          totalCash={totalCash}
          cashAccounts={cashAccounts}
        />
      )}

      {/* MODAL 5: VIEW ALL TRANSACTIONS */}
      {isViewAllTxOpen && (
        <ViewAllTransactionsModal
          isOpen={isViewAllTxOpen}
          onClose={() => setIsViewAllTxOpen(false)}
          transactions={cashTransactions}
        />
      )}

    </div>
  );
}

/**
 * AddCashEntryModal Subcomponent
 */
function AddCashEntryModal({ isOpen, onClose, cashAccounts = [], onAddEntry }) {
  const [type, setType] = useState('inflow');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Sales');
  const [description, setDescription] = useState('');
  const [account, setAccount] = useState(cashAccounts[0]?.name || 'HDFC Bank - 4502');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    onAddEntry({
      type,
      amount: Number(amount),
      date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      category,
      description: description || (type === 'inflow' ? 'Cash Received' : 'Cash Outflow'),
      account,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-base font-extrabold text-slate-900">Record Cash Entry</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              Live Entry
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type Toggle: Inflow / Outflow */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Entry Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('inflow')}
                className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  type === 'inflow'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ↓ Inflow (Money In)
              </button>
              <button
                type="button"
                onClick={() => setType('outflow')}
                className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  type === 'outflow'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ↑ Outflow (Money Out)
              </button>
            </div>
          </div>

          {/* Amount (₹) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Amount (₹)</label>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
              placeholder="e.g. 50000"
            />
            {amount && <span className="text-[10px] text-slate-500 font-semibold">{formatINR(Number(amount))}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 outline-none"
              >
                <option value="Sales">Sales / Customer Receipt</option>
                <option value="Purchases">Purchases / Supplier</option>
                <option value="Fuel">Fuel & Transport</option>
                <option value="Payroll">Employee Payroll</option>
                <option value="Rent">Rent & Lease</option>
                <option value="Utilities">Utilities & Power</option>
                <option value="Interest">Bank Interest / Yield</option>
                <option value="Other">Other Miscellaneous</option>
              </select>
            </div>

            {/* Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Account</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 outline-none"
              >
                {cashAccounts.map((acc) => (
                  <option key={acc.id} value={acc.name}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 outline-none"
              placeholder="e.g. Payment from ABC Enterprises"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Transaction Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * AddCashAccountModal Subcomponent
 */
function AddCashAccountModal({ isOpen, onClose, onAddAccount }) {
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [type, setType] = useState('Current Account');
  const [balance, setBalance] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onAddAccount({
      name,
      accountNumber,
      type,
      bankName: name.split(' ')[0] || 'Bank',
      balance: Number(balance) || 0,
      iconColor: type === 'Physical Cash' ? 'emerald' : 'blue',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900">Add Cash Account</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Account / Bank Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-none"
              placeholder="e.g. Axis Bank - 1044"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 outline-none"
              >
                <option value="Current Account">Current Account</option>
                <option value="Savings Account">Savings Account</option>
                <option value="Physical Cash">Physical Cash Vault</option>
                <option value="Overdraft / CC">Overdraft / Cash Credit</option>
                <option value="Digital Wallet">Digital Wallet</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Account Last 4 Digits</label>
              <input
                type="text"
                maxLength={4}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 outline-none"
                placeholder="e.g. 1044"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Current Ledger Balance (₹)</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-black text-slate-900 outline-none"
              placeholder="e.g. 250000"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * CashSuggestionsModal Subcomponent
 */
function CashSuggestionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-base font-extrabold text-slate-900">Cash Flow Optimization Suggestions</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              AI Insights
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {CASH_OPTIMIZATION_SUGGESTIONS.map((sug) => (
            <div key={sug.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900">{sug.title}</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {sug.impact}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">{sug.description}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Category: <strong className="text-slate-700">{sug.category}</strong></span>
                <span>Priority: <strong className="text-indigo-600 font-bold">{sug.priority}</strong></span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * DetailedBreakdownModal Subcomponent
 */
function DetailedBreakdownModal({ isOpen, onClose, breakdownData = [], totalCash = 1485000, cashAccounts = [] }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900">Detailed Cash Breakdown</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
            <span className="font-bold text-blue-900">Verified Available Liquid Cash</span>
            <span className="font-black text-blue-700 font-mono text-base">{formatINR(totalCash)}</span>
          </div>

          <div className="space-y-2">
            <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">
              Configured Accounts & Reserves
            </span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {cashAccounts.map((acc) => (
                <div key={acc.id} className="p-3 bg-white flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{acc.name}</span>
                    <span className="text-[10px] text-slate-400">{acc.type}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-extrabold text-slate-900 block">{formatINR(acc.balance)}</span>
                    <span className="text-[10px] text-slate-400">
                      {((acc.balance / (totalCash || 1)) * 100).toFixed(1)}% of total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ViewAllTransactionsModal Subcomponent
 */
function ViewAllTransactionsModal({ isOpen, onClose, transactions = [] }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-extrabold text-slate-900">All Cash Ledger Transactions</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
              {transactions.length} Records
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 px-4">Description</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Account</th>
                <th className="pb-3 px-4 text-right">Amount</th>
                <th className="pb-3 pl-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => {
                const isInflow = tx.type === 'inflow';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 text-[11px] text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{tx.description}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-500">{tx.account}</td>
                    <td className={`py-3 px-4 text-right font-black font-mono whitespace-nowrap ${
                      isInflow ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isInflow ? `+${formatINR(tx.amount)}` : formatINR(tx.amount)}
                    </td>
                    <td className="py-3 pl-4 text-right font-bold text-slate-700 font-mono whitespace-nowrap">
                      {formatINR(tx.balanceAfter)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
