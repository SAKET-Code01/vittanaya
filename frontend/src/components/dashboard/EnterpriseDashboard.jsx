import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import MarketInsightSection from './MarketInsightSection';
import VittanayaInsightsCard from './VittanayaInsightsCard';
import DashboardFooter from './DashboardFooter';
import BusinessChangeModal from '../common/BusinessChangeModal';
import { formatINR } from '../../mocks/dashboardMockData';

/**
 * EnterpriseDashboard Component
 * 
 * Production Dashboard for the "Established Business" stage.
 * Engineered to 100% exact UI, layout, grid, spacing, and component parity
 * with the reference New Business Dashboard while presenting authoritative
 * operating performance, working capital, cash flow, and expansion intelligence.
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

  const profile = {
    ...(propProfile || contextProfile || {}),
    name:
      propProfile?.name ||
      propProfile?.businessName ||
      contextProfile?.name ||
      contextProfile?.businessName ||
      'Apex Precision Engineering',
    category:
      propProfile?.category ||
      contextProfile?.category ||
      'Precision Manufacturing & Fabrication',
    location:
      propProfile?.location ||
      contextProfile?.location ||
      'Cuttack Industrial Estate, Odisha',
    businessType:
      propProfile?.businessType ||
      contextProfile?.businessType ||
      'manufacturing',
  };

  const selectedOps = profile.selectedOperations || profile.selectedOps || [
    'sales',
    'purchases',
    'inventory',
    'production',
    'employees',
  ];

  // Established operating metrics (from context financial data / defaults)
  const cashBalance = financialData?.cash_balance || 1485000;
  const receivables = financialData?.receivables_total || 1920000;
  const payables = financialData?.payables_total || 1240000;
  const monthlyRevenue = financialData?.expected_inflow || 2850000;
  const monthlyExpenses = financialData?.expected_outflow || 2170000;
  const operatingProfit = Math.max(0, monthlyRevenue - monthlyExpenses);
  const profitMargin = Math.round((operatingProfit / monthlyRevenue) * 100);

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
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                  HEALTHY & OPTIMIZED
                </span>
              </div>

              {/* Dynamic Health Score Gauge */}
              <div className="flex items-center justify-between space-x-4">
                <div>
                  <div className="text-4xl font-black text-white tracking-tight">
                    78<span className="text-xl text-blue-400 font-bold">/100</span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-0.5">
                    Tier-1 Commercial Rating
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
                      strokeDasharray="78, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-white">78%</span>
                </div>
              </div>

              {/* Summary Indicators */}
              <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Operating Margin:</span>
                  <span className="font-bold text-white">{profitMargin}% EBITDA</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Cash Runway:</span>
                  <span className="font-bold text-emerald-400">8.2 Months Buffer</span>
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
              {formatINR(monthlyRevenue)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Gross Monthly Inflows</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                +6.2% MoM
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
              {formatINR(operatingProfit)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">EBITDA Margin</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                {profitMargin}% Retained
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
              {formatINR(cashBalance)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Immediate Liquidity</span>
              <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                38 Days Buffer
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
              {formatINR(receivables)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Customer Dues</span>
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                34 Days Avg Cycle
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
              1.48x
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Ratio</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Well Covered
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
              8.2 Mo
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">At Current Net Burn</span>
              <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                Secure Buffer
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
              LOW • STABLE
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Credit Rating Factor</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Tier-1 Rating
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
              HIGH • 86%
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Capacity & Capital</span>
              <span className="text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded-md">
                Scale Ready
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
          
          {/* Priority 1: Cash Preservation */}
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold text-[11px]">
                  01 • Cash Preservation
                </span>
                <span className="text-xs font-bold text-amber-600">Priority 1</span>
              </div>
              <h3 className="font-bold text-sm text-[#0F172A]">
                Accelerate Q3 Customer Collections & Factoring
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ₹19.20L in outstanding accounts. Enforce early discount terms to convert receivables into liquid working capital.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAction('financial-plan')}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-blue-700 font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Review Cash Flow</span>
              <span>→</span>
            </button>
          </div>

          {/* Priority 2: Growth Credit */}
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[11px]">
                  02 • Growth Credit
                </span>
                <span className="text-xs font-bold text-emerald-600">Pre-Approved</span>
              </div>
              <h3 className="font-bold text-sm text-[#0F172A]">
                Collateral-Free MSME Credit Facility
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eligible for up to ₹15.00 Lakh under CGTMSE credit guarantee with 2% interest subvention for MSME manufacturing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAction('scheme')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Explore Scheme Details</span>
              <span>→</span>
            </button>
          </div>

          {/* Priority 3: Operations & Scale */}
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[11px]">
                  03 • Shift Scale-Up
                </span>
                <span className="text-xs font-bold text-blue-600">Capacity 68%</span>
              </div>
              <h3 className="font-bold text-sm text-[#0F172A]">
                Machinist Apprentice Onboarding
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Onboard 4 apprentice operators under NAPS to increase CNC machining capacity to secondary shift operations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAction('action-plan')}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-blue-700 font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Review Action Plan</span>
              <span>→</span>
            </button>
          </div>

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
          <div className="space-y-3 bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/70">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Cash Flow Ratio</span>
              <span className="font-extrabold text-blue-600">76% Inflow Efficiency</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: '55%' }} title="Operating Inflows" />
              <div className="bg-blue-500 h-full" style={{ width: '30%' }} title="Operating Expenses" />
              <div className="bg-amber-400 h-full" style={{ width: '15%' }} title="Payables Dues" />
            </div>
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Inflows: {formatINR(monthlyRevenue)}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Outflows: {formatINR(monthlyExpenses)}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Payables: {formatINR(payables)}</span>
              </span>
            </div>
          </div>

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
              <span className="text-xs font-bold text-slate-500">78% Optimized</span>
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
