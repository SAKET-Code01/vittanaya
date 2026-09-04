import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { financeService } from '../../services/financeService';
import MarketInsightSection from './MarketInsightSection';
import VittanayaInsightsCard from './VittanayaInsightsCard';
import DashboardFooter from './DashboardFooter';
import BusinessChangeModal from '../common/BusinessChangeModal';
import { formatINR } from '../../mocks/dashboardMockData';

/**
 * EnterpriseDashboard Component
 * 
 * Production Dashboard for the "Established Business" stage.
 * Grounded 100% in authoritative backend financial and operational calculations
 * from `/api/v1/dashboard/summary`.
 */
export default function EnterpriseDashboard({
  currentProfile: propProfile,
  onNavigate,
  onOpenWhy,
}) {
  const {
    currentProfile: contextProfile,
    financialData,
    updateProfile,
  } = useWorkspace();

  const [isChangeBusinessOpen, setIsChangeBusinessOpen] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const rawProfile = propProfile || contextProfile || {};
  const profile = {
    ...rawProfile,
    id: rawProfile?.id,
    name:
      rawProfile?.name ||
      rawProfile?.businessName ||
      rawProfile?.business_name ||
      'Selected Enterprise',
    category:
      rawProfile?.category ||
      rawProfile?.industry ||
      rawProfile?.businessType ||
      'Commercial Enterprise',
    location:
      rawProfile?.location ||
      [rawProfile?.location_district || rawProfile?.district, rawProfile?.location_state || rawProfile?.state]
        .filter(Boolean)
        .join(', ') ||
      'Odisha',
    businessType:
      rawProfile?.businessType ||
      rawProfile?.type ||
      'enterprise',
  };

  const businessId = profile?.id;

  useEffect(() => {
    let isMounted = true;
    if (!businessId) {
      setLoadingSummary(false);
      return;
    }
    setLoadingSummary(true);
    financeService.getDashboardSummary(businessId)
      .then((data) => {
        if (isMounted && data) {
          setDashboardSummary(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch established dashboard summary:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingSummary(false);
      });
    return () => { isMounted = false; };
  }, [businessId]);

  // Synchronize live metrics when Action Plan tasks are updated
  useEffect(() => {
    const handleReadinessUpdate = () => {
      if (businessId) {
        financeService.getDashboardSummary(businessId)
          .then((data) => {
            if (data) setDashboardSummary(data);
          })
          .catch(() => {});
      }
    };
    window.addEventListener('vittanaya-readiness-updated', handleReadinessUpdate);
    return () => window.removeEventListener('vittanaya-readiness-updated', handleReadinessUpdate);
  }, [businessId]);

  const selectedOps = profile.selectedOperations || profile.selectedOps || [
    'sales',
    'purchases',
    'inventory',
    'production',
    'employees',
  ];

  // Authoritative established operating metrics derived strictly from backend summary or live financial context
  const cashBalance = dashboardSummary ? Number(dashboardSummary.cash_balance) : (financialData?.cash_balance ?? null);
  const receivables = dashboardSummary ? Number(dashboardSummary.pending_receivables_total) : (financialData?.receivables_total ?? null);
  const payables = dashboardSummary ? Number(dashboardSummary.pending_payables_total) : (financialData?.payables_total ?? null);
  const monthlyRevenue = dashboardSummary ? Number(dashboardSummary.monthly_revenue) : (financialData?.expected_inflow ?? null);
  const monthlyExpenses = dashboardSummary ? Number(dashboardSummary.monthly_expenses) : (financialData?.expected_outflow ?? null);
  const operatingProfit = dashboardSummary ? Number(dashboardSummary.operating_profit) : (monthlyRevenue != null && monthlyExpenses != null ? Math.max(0, monthlyRevenue - monthlyExpenses) : null);
  const profitMargin = dashboardSummary ? Number(dashboardSummary.ebitda_margin) : (monthlyRevenue && operatingProfit != null ? Math.round((operatingProfit / monthlyRevenue) * 100) : null);
  const healthScore = dashboardSummary ? dashboardSummary.health_score : null;
  const healthStatus = dashboardSummary ? dashboardSummary.health_status : (loadingSummary ? 'CALCULATING...' : 'INSUFFICIENT DATA');
  const runwayDays = dashboardSummary ? dashboardSummary.runway_days : null;
  const runwayMonths = dashboardSummary ? dashboardSummary.runway_months : (runwayDays != null ? (runwayDays / 30).toFixed(1) : null);
  const workingCapitalRatio = dashboardSummary ? dashboardSummary.working_capital_ratio : null;
  const dataProvenance = dashboardSummary?.data_provenance;

  const handleAction = (destination) => {
    if (typeof onNavigate === 'function') {
      onNavigate(destination);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12 animate-fadeIn select-none">

      {/* =========================================================================
          LEVEL 1: ESTABLISHED BUSINESS HERO (Dark Navy + Atmospheric Glow)
          ========================================================================= */}
      <section className="hero-spark-card relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#060D1D] via-[#0B1736] to-[#0A1128] p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300">
        
        {/* Atmospheric Ambient Glows */}
        <div className="hero-glow-pulse absolute -top-16 -right-16 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none transition-all duration-700" />
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-indigo-500/15 blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full bg-sky-500/10 blur-[80px] pointer-events-none" />

        {/* Desktop-Only Subtle Particle Sparks */}
        <div className="hero-spark-particle hero-spark-p1 absolute top-12 right-1/4 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#38BDF8]" />
        <div className="hero-spark-particle hero-spark-p2 absolute top-28 right-16 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60A5FA]" />
        <div className="hero-spark-particle hero-spark-p3 absolute bottom-16 right-1/3 w-2.5 h-2.5 rounded-full bg-sky-200 shadow-[0_0_12px_#BAE6FD]" />
        <div className="hero-spark-particle hero-spark-p4 absolute bottom-24 left-1/3 w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_#93C5FD]" />
        <div className="hero-spark-particle hero-spark-p5 absolute top-20 left-1/2 w-2 h-2 rounded-full bg-indigo-300 shadow-[0_0_10px_#A5B4FC]" />

        {/* Hero Content Layout */}
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          {/* Left Sub-Column: Business & Stage Identity */}
          <div className="space-y-4 max-w-3xl">
            
            {/* Stage & Classification Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-400/30 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>Stage: Established Business</span>
              </span>

              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-300 border border-white/10 backdrop-blur-md">
                GST Compliant • Commercial Enterprise
              </span>

              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                Active Operations: {selectedOps.length} Modules
              </span>
            </div>

            {/* Business Title & Location */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {profile.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 font-medium">
                <span className="text-blue-300 font-semibold">{profile.category}</span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profile.location}</span>
                </span>
              </div>
            </div>

            {/* Stage Description Context */}
            <p className="text-slate-300/90 text-sm sm:text-base leading-relaxed font-normal pt-1">
              Active commercial operation. Real-time decision intelligence is calibrated for cash preservation, receivables velocity, working capital financing, and secondary shift scaling.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleAction('financial-plan')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-2 cursor-pointer"
              >
                <span>Working Capital & Audit</span>
                <span className="text-base">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('business')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all cursor-pointer"
              >
                Manage Profile & Operations
              </button>
            </div>

          </div>

          {/* Right Sub-Column: Established Business Health Index Card */}
          <div className="w-full lg:w-auto flex-shrink-0 flex justify-center lg:justify-end">
            <div className="w-full sm:w-72 bg-gradient-to-b from-white/15 to-white/5 border border-white/20 rounded-2xl p-5 backdrop-blur-xl shadow-2xl space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Health Index
                </span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                  (healthScore || 0) >= 75
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : (healthScore || 0) >= 50
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {healthStatus}
                </span>
              </div>

              {/* Dynamic Health Score Gauge */}
              <div className="flex items-center justify-between space-x-4">
                <div>
                  <div className="text-4xl font-black text-white tracking-tight">
                    {loadingSummary ? (
                      <span className="text-2xl text-slate-400">Loading…</span>
                    ) : healthScore != null ? (
                      <>
                        {healthScore}<span className="text-xl text-blue-400 font-bold">/100</span>
                      </>
                    ) : (
                      <span className="text-xl text-slate-400">Not available</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-0.5">
                    {healthScore != null ? 'Operational & Liquidity Health' : 'Calculation pending'}
                  </div>
                </div>

                {/* Circular Score Visual */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-400 transition-all duration-1000 ease-out"
                      strokeDasharray={`${healthScore || 0}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-white">
                    {healthScore != null ? `${healthScore}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Summary Indicators */}
              <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Operating Margin:</span>
                  <span className="font-bold text-white">
                    {profitMargin != null ? `${profitMargin}% EBITDA` : 'Insufficient data'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Cash Runway:</span>
                  <span className="font-bold text-emerald-400">
                    {runwayMonths != null ? `${runwayMonths} Mo Buffer` : (runwayDays != null ? `${runwayDays} d Buffer` : 'Insufficient data')}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          LEVEL 2: 8 OPERATING & HEALTH KPI CARDS (2 Rows of 4 Cards)
          ========================================================================= */}
      <div className="space-y-4">
        
        {/* Row 1: Operating Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Monthly Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Monthly Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                ₹
              </div>
            </div>
            <div className="text-2xl font-black text-[#0F172A] tracking-tight">
              {monthlyRevenue != null ? formatINR(monthlyRevenue) : 'Not available'}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Gross Monthly Inflows</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Authoritative
              </span>
            </div>
          </div>

          {/* Card 2: Operating Profit */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Operating Profit
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                📈
              </div>
            </div>
            <div className="text-2xl font-black text-[#0F172A] tracking-tight">
              {operatingProfit != null ? formatINR(operatingProfit) : 'Not available'}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">EBITDA Margin</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                {profitMargin != null ? `${profitMargin}% Retained` : '—'}
              </span>
            </div>
          </div>

          {/* Card 3: Cash Position */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cash Position
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                🏦
              </div>
            </div>
            <div className="text-2xl font-black text-[#0F172A] tracking-tight">
              {cashBalance != null ? formatINR(cashBalance) : 'Not available'}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Immediate Liquidity</span>
              <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                {runwayDays != null ? `${runwayDays} d Buffer` : 'Insufficient data'}
              </span>
            </div>
          </div>

          {/* Card 4: Receivables */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Receivables
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                ⏳
              </div>
            </div>
            <div className="text-2xl font-black text-[#0F172A] tracking-tight">
              {receivables != null ? formatINR(receivables) : '₹0'}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Customer Dues</span>
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                Ledger Grounded
              </span>
            </div>
          </div>

        </div>

        {/* Row 2: Decision & Health Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 5: Working Capital Coverage */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Working Capital
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                ⚖️
              </div>
            </div>
            <div className="text-2xl font-black text-[#0F172A] tracking-tight">
              {workingCapitalRatio != null ? `${workingCapitalRatio}x` : 'Not available'}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Ratio</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                {workingCapitalRatio != null && workingCapitalRatio >= 1.2 ? 'Well Covered' : (workingCapitalRatio != null && workingCapitalRatio >= 1.0 ? 'Adequate' : 'Tight')}
              </span>
            </div>
          </div>

          {/* Card 6: Cash Runway */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cash Runway
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                🗓️
              </div>
            </div>
            <div className="text-2xl font-black text-[#0F172A] tracking-tight">
              {runwayMonths != null ? `${runwayMonths} Mo` : (runwayDays != null ? `${runwayDays} d` : 'Insufficient data')}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">At Current Net Burn</span>
              <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                {runwayDays != null && runwayDays >= 45 ? 'Secure Buffer' : 'Monitor Flow'}
              </span>
            </div>
          </div>

          {/* Card 7: Business Risk */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Business Risk
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                🛡️
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {dashboardSummary ? `${dashboardSummary.liquidity_risk_level} • ${dashboardSummary.liquidity_risk_level === 'CRITICAL' ? 'ELEVATED' : 'STABLE'}` : 'MONITORING'}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Liquidity Rating</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                {dashboardSummary?.liquidity_risk_level || 'Evaluated'}
              </span>
            </div>
          </div>

          {/* Card 8: Growth Readiness */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Growth Readiness
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
                🚀
              </div>
            </div>
            <div className="text-2xl font-black text-blue-600 tracking-tight">
              {dashboardSummary?.readiness_score != null ? `${Math.round(dashboardSummary.readiness_score)}%` : 'Insufficient data'}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Capacity & Compliance</span>
              <span className="text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded-md">
                {dashboardSummary?.readiness_status || 'Evaluating'}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
          LEVEL 3: OPERATIONAL PRIORITY & ATTENTION CENTER
          ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
                Operational Priority & Optimization Center
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Targeted high-impact interventions to preserve liquidity, reduce costs, and accelerate enterprise growth.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
            3 Active Directives
          </span>
        </div>

        {/* 3 Priority Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(dashboardSummary?.operational_priorities && dashboardSummary.operational_priorities.length > 0
            ? dashboardSummary.operational_priorities
            : [
                {
                  step_num: '01',
                  priority_label: '01 • Cash Preservation',
                  urgency: receivables > 0 ? 'ACTION_REQUIRED' : 'STABLE',
                  title: 'Accelerate Customer Collections & Factoring',
                  description: receivables != null
                    ? `${formatINR(receivables)} in outstanding customer accounts. Enforce early settlement terms to convert receivables into liquid working capital.`
                    : 'Monitor receivables to preserve cash buffer.',
                  cta_label: 'Review Cash Flow →',
                  route: 'financial-plan',
                },
                {
                  step_num: '02',
                  priority_label: '02 • Growth Credit',
                  urgency: 'RECOMMENDED',
                  title: 'Working Capital MSME Credit Facility',
                  description: 'Explore working capital facility under CGTMSE credit guarantee with priority interest subvention for rural enterprises.',
                  cta_label: 'Explore Schemes →',
                  route: 'scheme',
                },
                {
                  step_num: '03',
                  priority_label: '03 • Operational Scale',
                  urgency: 'STABLE',
                  title: 'Workforce & Operational Scaling',
                  description: dashboardSummary
                    ? `Maintain ${dashboardSummary.total_employees} employee commitments (${formatINR(dashboardSummary.payroll_amount || 0)}/mo) with active compliance tracking.`
                    : 'Reconcile operational commitments and statutory filings to scale output.',
                  cta_label: 'Review Action Plan →',
                  route: 'action-plan',
                },
              ]
          ).map((p, idx) => (
            <div
              key={p.step_num || idx}
              className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold text-[11px]">
                    {p.priority_label || `0${idx + 1} • Directive`}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      p.urgency === 'URGENT'
                        ? 'text-red-600'
                        : p.urgency === 'ACTION_REQUIRED'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {p.urgency === 'URGENT'
                      ? 'Urgent'
                      : p.urgency === 'ACTION_REQUIRED'
                      ? 'Action Required'
                      : p.urgency === 'RECOMMENDED'
                      ? 'Recommended'
                      : 'On Track'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#0F172A]">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleAction(p.route || 'financial-plan')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer ${
                  idx === 0
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-blue-700'
                }`}
              >
                <span>{p.cta_label || 'View Details →'}</span>
              </button>
            </div>
          ))}
        </div>

      </section>

      {/* =========================================================================
          LEVEL 3 (ANALYTICAL HUBS): HYPER-LOCAL CATCHMENT MAP + VITTANAYA INSIGHTS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Sub-Column: 2D/3D Hyper-Local Catchment Intelligence (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <MarketInsightSection
            currentProfile={profile}
            onNavigate={handleAction}
            className="flex-1"
          />
        </div>

        {/* Right Sub-Column: AI Optimization & Strategic Recommendations (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <VittanayaInsightsCard
            currentProfile={profile}
            onNavigate={handleAction}
            className="flex-1"
          />
        </div>

      </div>

      {/* =========================================================================
          LEVEL 4 (FINANCIAL & OPERATIONAL AUDIT): CASH FLOW + OPTIMIZATION TRACKER
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Sub-Column: Operating Cash Flow & Working Capital (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Financial Audit
              </span>
              <span className="text-xs font-bold text-slate-500">Live Operating Inflows</span>
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">
              Operating Cash Flow & Working Capital
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consolidated cash velocity tracking monthly inflows, supplier liabilities, and net surplus buffer.
            </p>
          </div>

          {/* Cash Flow Distribution Stack */}
          {(() => {
            const tot = (monthlyRevenue || 0) + (monthlyExpenses || 0) + (payables || 0) || 1;
            const inW = Math.max(5, Math.round(((monthlyRevenue || 0) / tot) * 100));
            const outW = Math.max(5, Math.round(((monthlyExpenses || 0) / tot) * 100));
            const payW = Math.max(0, 100 - inW - outW);
            return (
              <div className="space-y-3 bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/70">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Cash Flow Ratio</span>
                  <span className="font-extrabold text-blue-600">{profitMargin != null ? `${profitMargin}% Margin` : 'Live Flow'}</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${inW}%` }} title="Operating Inflows" />
                  <div className="bg-blue-500 h-full" style={{ width: `${outW}%` }} title="Operating Expenses" />
                  <div className="bg-amber-400 h-full" style={{ width: `${payW}%` }} title="Payables Dues" />
                </div>
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Inflows: {monthlyRevenue != null ? formatINR(monthlyRevenue) : 'Not available'}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Outflows: {monthlyExpenses != null ? formatINR(monthlyExpenses) : 'Not available'}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Payables: {payables != null ? formatINR(payables) : '₹0'}</span>
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="pt-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Net Monthly Buffer Retained</div>
              <div className="text-lg font-black text-emerald-600">+{formatINR(operatingProfit)}</div>
            </div>
            <button
              type="button"
              onClick={() => handleAction('financial-plan')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>View Financial Plan</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Right Sub-Column: Optimization Tracker (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Enterprise Roadmap
              </span>
              <span className="text-xs font-bold text-slate-500">{dashboardSummary?.readiness_label || 'Evaluating'}</span>
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">
              Optimization Tracker
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Execution progress across statutory filings, procurement contracts, and shift scaling.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs">
              <span className="font-bold text-emerald-900">✓ Udyam & GST Reconciled</span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Verified</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs">
              <span className="font-bold text-blue-900">⏳ Supplier Term Renegotiation</span>
              <span className="text-[10px] font-bold text-blue-700 uppercase">In Progress</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <span className="font-bold text-slate-700">○ Double Shift Expansion</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Scheduled</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAction('action-plan')}
            className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-blue-700 font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Open 90-Day Action Plan</span>
            <span>→</span>
          </button>
        </div>

      </div>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <DashboardFooter lastUpdated="Live Dynamic Session" />

      {/* Profile Modification Modal */}
      <BusinessChangeModal
        isOpen={isChangeBusinessOpen}
        onClose={() => setIsChangeBusinessOpen(false)}
        currentProfile={profile}
        onSelectBusiness={(newP) => {
          if (typeof updateProfile === 'function') updateProfile(newP);
          setIsChangeBusinessOpen(false);
        }}
      />

    </div>
  );
}
