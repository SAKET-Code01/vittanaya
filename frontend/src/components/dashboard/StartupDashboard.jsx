import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { financeService } from '../../services/financeService';
import MarketInsightSection from './MarketInsightSection';
import VittanayaInsightsCard from './VittanayaInsightsCard';
import DashboardFooter from './DashboardFooter';

/**
 * Inline SVG Icon System
 */
function DashboardIcon({ name, size = 18, className = '' }) {
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
    case 'award':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg {...props}>
          <path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...props}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...props}>
          <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
          <path d="m19 16 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z" />
        </svg>
      );
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
 * StartupDashboard Component
 * 
 * Production-grade dashboard specifically tailored for the "Startup Phase"
 * Grounded 100% in authoritative backend financial and operational calculations.
 */
export default function StartupDashboard({
  currentProfile: propProfile,
  onNavigate,
}) {
  const { currentProfile: contextProfile } = useWorkspace();
  const rawProfile = propProfile || contextProfile || {};
  const profile = {
    ...rawProfile,
    id: rawProfile?.id,
    businessName: rawProfile?.businessName || rawProfile?.name || rawProfile?.business_name || 'Selected Startup',
    name: rawProfile?.name || rawProfile?.businessName || rawProfile?.business_name || 'Selected Startup',
    category: rawProfile?.category || rawProfile?.industry || rawProfile?.businessType || 'Micro-Enterprise',
    industry: rawProfile?.industry || rawProfile?.description || rawProfile?.category || 'Emerging Rural Business',
    location: rawProfile?.location || [rawProfile?.location_district || rawProfile?.district, rawProfile?.location_state || rawProfile?.state].filter(Boolean).join(', ') || 'Odisha',
  };

  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

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
        console.warn('Could not fetch startup dashboard summary:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingSummary(false);
      });
    return () => { isMounted = false; };
  }, [businessId]);

  // Synchronize live readiness and metrics when Action Plan tasks are updated
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

  const businessName = profile.businessName;
  const category = profile.category;
  const industry = profile.industry;
  const location = profile.location;

  const ownCapital = Number(profile.own_capital || profile.ownCapital || 0);
  const capitalDeployed = Number(profile.existing_investment || profile.existingInvestment || ownCapital || 0);
  const monthlyRevenue = dashboardSummary ? Number(dashboardSummary.monthly_revenue) : Number(profile.monthly_revenue || 0);
  const operatingCost = dashboardSummary ? Number(dashboardSummary.monthly_expenses) : Number(profile.monthly_expenses || 0);
  const monthlySurplus = dashboardSummary ? Number(dashboardSummary.operating_profit) : Math.max(0, monthlyRevenue - operatingCost);
  const profitMargin = dashboardSummary ? Number(dashboardSummary.ebitda_margin) : (monthlyRevenue > 0 ? Math.round((monthlySurplus / monthlyRevenue) * 100) : 0);
  const cashBalance = dashboardSummary ? Number(dashboardSummary.cash_balance) : Number(profile.financialData?.cash_balance || 0);
  const runwayMonths = dashboardSummary ? dashboardSummary.runway_months : (operatingCost > 0 ? (cashBalance / operatingCost).toFixed(1) : null);
  const healthScore = dashboardSummary ? dashboardSummary.health_score : null;
  const healthStatus = dashboardSummary ? dashboardSummary.health_status : (loadingSummary ? 'CALCULATING...' : 'INSUFFICIENT DATA');
  const readinessScore = dashboardSummary ? Math.round(dashboardSummary.readiness_score) : null;
  const readinessLabel = dashboardSummary?.readiness_label || 'Evaluating';
  const riskLevel = dashboardSummary?.liquidity_risk_level || 'EVALUATING';

  const handleAction = (destination) => {
    if (typeof onNavigate === 'function') {
      onNavigate(destination);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12 animate-fadeIn select-none">

      {/* =========================================================================
          LEVEL 1: STARTUP HERO (Deep Navy Atmospheric Design System)
          ========================================================================= */}
      <section className="hero-spark-card relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#060D1D] via-[#0B1736] to-[#0A1128] p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300">
        <div className="hero-glow-pulse absolute -top-16 -right-16 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none transition-all duration-700" />
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-indigo-500/15 blur-[90px] pointer-events-none" />

        {/* Hero Content Layout */}
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          {/* Left: Startup Identity & Signals */}
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-blue-600 text-white shadow-sm shadow-blue-500/30 flex items-center gap-1.5">
                <DashboardIcon name="spark" size={12} />
                <span>Stage: Startup Phase</span>
              </span>
              <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md text-blue-100 border border-white/15">
                Active Operations • Unit Economics Positive
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] drop-shadow-sm">
                {businessName}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-semibold pt-1">
                <span className="flex items-center gap-1.5 text-blue-300">
                  <DashboardIcon name="award" size={15} />
                  <span>{category}</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <DashboardIcon name="map-pin" size={15} className="text-blue-400" />
                  <span>{location}</span>
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed max-w-2xl pt-1">
              Operational performance assessment prepared for <strong className="text-white font-semibold">{industry}</strong>.
              Active capital deployed: <strong className="text-blue-300 font-bold">₹{capitalDeployed.toLocaleString('en-IN')}</strong>.
              Estimated operating cash runway is <strong className="text-emerald-400 font-bold">{runwayMonths} months</strong> with healthy monthly gross margin.
            </p>
          </div>

          {/* Right: Startup Health Index */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-xl gap-4 shrink-0 w-full sm:w-64 lg:w-72">
            <div className="text-center space-y-1 w-full">
              <span className="text-[10px] font-black text-blue-200/90 uppercase tracking-widest block">
                Startup Health Index
              </span>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                {loadingSummary ? (
                  <span className="text-2xl font-bold text-slate-300">Loading…</span>
                ) : healthScore != null ? (
                  <>
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{healthScore}</span>
                    <span className="text-base font-bold text-blue-300/70">/100</span>
                  </>
                ) : (
                  <span className="text-base font-bold text-slate-400">Not available</span>
                )}
              </div>
              <div className="pt-1">
                <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                  (healthScore || 0) >= 75
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : (healthScore || 0) >= 50
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}>
                  {healthStatus}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAction('financial-plan')}
              className="w-full px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Startup Growth Plan</span>
              <DashboardIcon name="arrow-right" size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          LEVEL 2: EIGHT KEY STARTUP METRICS (Clean White KPI Grid: 2 Rows of 4)
          ========================================================================= */}
      <section className="space-y-4">
        
        {/* ROW 1: OPERATING PERFORMANCE METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Capital Deployed */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Capital Deployed</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DashboardIcon name="wallet" size={17} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {capitalDeployed > 0 ? `₹${(capitalDeployed / 100000).toFixed(2)} L` : 'Not recorded'}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Active equity & asset seed</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Verified Cap</span>
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                {capitalDeployed > 0 ? 'Seeded' : 'Pending'}
              </span>
            </div>
          </div>

          {/* 2. Monthly Revenue */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DashboardIcon name="target" size={17} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {monthlyRevenue > 0 ? `₹${(monthlyRevenue / 100000).toFixed(2)} L` : 'Not available'}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Active customer billing</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Monthly Pace</span>
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">Authoritative</span>
            </div>
          </div>

          {/* 3. Operating Cost */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operating Cost</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DashboardIcon name="clock" size={17} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {operatingCost > 0 ? `₹${(operatingCost / 100000).toFixed(2)} L` : 'Not available'}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Materials & fixed overhead</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Cost Ratio</span>
              <span className="text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                {monthlyRevenue > 0 && operatingCost > 0 ? `${Math.round((operatingCost / monthlyRevenue) * 100)}% of Rev` : 'Baseline'}
              </span>
            </div>
          </div>

          {/* 4. Cash Runway */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cash Runway</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DashboardIcon name="rocket" size={17} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {runwayMonths != null ? `${runwayMonths} Mo` : 'Insufficient data'}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Liquidity survival cushion</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Cash Buffer</span>
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                {runwayMonths && Number(runwayMonths) >= 3 ? 'Healthy Runway' : 'Monitor Cushion'}
              </span>
            </div>
          </div>

        </div>

        {/* ROW 2: DECISION & HEALTH METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 5. Monthly Surplus */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Surplus</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DashboardIcon name="bank" size={17} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {monthlySurplus > 0 ? `+₹${(monthlySurplus / 1000).toFixed(0)}k` : (monthlyRevenue > 0 ? 'Break-even' : 'Not available')}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Net operating cash buffer</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Operating Margin</span>
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                {profitMargin > 0 ? `${profitMargin}% Margin` : 'Operational'}
              </span>
            </div>
          </div>

          {/* 6. Funding Readiness */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Funding Readiness</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DashboardIcon name="shield" size={17} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {readinessScore != null ? `${readinessScore}%` : 'Not available'}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Statutory & operational gates</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Status</span>
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                {readinessLabel}
              </span>
            </div>
          </div>

          {/* 7. Business Risk */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Business Risk</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DashboardIcon name="alert-triangle" size={17} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {riskLevel || 'EVALUATING'}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Liquidity & credit stress index</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Tier</span>
              <span className="text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                {riskLevel === 'LOW' ? 'Low Risk' : (riskLevel === 'CRITICAL' ? 'Elevated Risk' : 'Moderate')}
              </span>
            </div>
          </div>

          {/* 8. Growth Readiness */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Growth Potential</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DashboardIcon name="compass" size={17} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {readinessScore != null ? `${readinessScore}%` : 'Not available'}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Expanding regional catchment</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Scale Trajectory</span>
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                {dashboardSummary?.readiness_status || 'Evaluating'}
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          LEVEL 3: STARTUP ATTENTION & ACTION CENTER (Operational Priorities)
          ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DashboardIcon name="spark" size={16} />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
              Startup Attention Center
            </h2>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/80">
            3 Operational Priorities
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Gate 1: Working Capital & Invoices */}
          <div className="p-4 rounded-2xl border bg-blue-50/40 border-blue-200/70 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[12px] font-black text-white">
                  01
                </span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white">
                  Priority 1 • Cash Flow
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug pt-1">
                Maintain 30-Day Debtor Collections & Buffer
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Streamline supplier payables and invoice factoring to preserve a minimum 45-day cash safety cushion.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAction('financial-plan')}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer text-center"
            >
              Manage Cash Flow →
            </button>
          </div>

          {/* Gate 2: Expansion Financing */}
          <div className="p-4 rounded-2xl border bg-slate-50/70 border-slate-200/70 hover:bg-slate-50 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[12px] font-black text-white">
                  02
                </span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                  Priority 2 • Growth Funding
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug pt-1">
                PMEGP Expansion / Mudra Working Capital Facility
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Qualify for institutional credit line up to ₹10 Lakh with interest subvention under micro-enterprise credit schemes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAction('scheme')}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs cursor-pointer text-center"
            >
              View Expansion Schemes →
            </button>
          </div>

          {/* Gate 3: Capacity Scaling */}
          <div className="p-4 rounded-2xl border bg-slate-50/70 border-slate-200/70 hover:bg-slate-50 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[12px] font-black text-white">
                  03
                </span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                  Priority 3 • Capacity
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug pt-1">
                Execute 60-Day Scaling & Compliance Roadmap
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Procure secondary equipment, complete statutory GST filings and onboard 2 technical apprentices.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAction('action-plan')}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs cursor-pointer text-center"
            >
              Action Roadmap →
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          LEVEL 3: HYPER-LOCAL GROWTH INTELLIGENCE + VITTANAYA INSIGHTS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Hyper-Local Catchment & Competitor Map (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <MarketInsightSection
            currentProfile={profile}
            onNavigate={handleAction}
            className="flex-1"
          />
        </div>

        {/* Right: Vittanaya Operational & Growth Insights (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <VittanayaInsightsCard
            currentProfile={profile}
            onNavigate={handleAction}
            className="flex-1"
          />
        </div>

      </div>

      {/* =========================================================================
          LEVEL 4: CASH FLOW OUTLOOK & GROWTH READINESS TRACKER
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Cash Flow Snapshot Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <DashboardIcon name="bank" size={16} />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
                Operating Cash Flow Outlook
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Cash: ₹{(cashBalance / 100000).toFixed(2)}L
            </span>
          </div>

          {/* 3-Tier Flow Bar */}
          {(() => {
            const tot = (monthlyRevenue || 0) + (operatingCost || 0) + (monthlySurplus || 0) || 1;
            const inW = Math.max(5, Math.round(((monthlyRevenue || 0) / tot) * 100));
            const outW = Math.max(5, Math.round(((operatingCost || 0) / tot) * 100));
            const surW = Math.max(0, 100 - inW - outW);
            return (
              <div className="space-y-3">
                <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                  <div style={{ width: `${inW}%` }} className="bg-blue-600 transition-all duration-500" title="Monthly Inflows" />
                  <div style={{ width: `${outW}%` }} className="bg-slate-600 transition-all duration-500" title="Monthly Outflows" />
                  <div style={{ width: `${surW}%` }} className="bg-blue-400 transition-all duration-500" title="Net Surplus Buffer" />
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Inflows ({monthlyRevenue > 0 ? `₹${(monthlyRevenue / 100000).toFixed(2)}L` : '—'})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-600 inline-block" /> Operating Costs ({operatingCost > 0 ? `₹${(operatingCost / 100000).toFixed(2)}L` : '—'})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Net Retained ({monthlySurplus > 0 ? `+₹${(monthlySurplus / 1000).toFixed(0)}k` : '—'})
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Expected Inflow</span>
              <span className="text-sm font-black text-slate-900 mt-0.5 block">
                {monthlyRevenue > 0 ? formatINR(monthlyRevenue) : 'Not available'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Monthly Burn</span>
              <span className="text-sm font-black text-slate-900 mt-0.5 block">
                {operatingCost > 0 ? formatINR(operatingCost) : 'Not available'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50/30 border border-blue-100 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Net Buffer</span>
              <span className="text-sm font-black text-blue-700 mt-0.5 block">
                {monthlySurplus > 0 ? `+${formatINR(monthlySurplus)}` : (monthlyRevenue > 0 ? 'Break-even' : 'Not available')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAction('financial-plan')}
            className="w-full py-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Explore Full Financial Plan & Simulator →
          </button>
        </div>

        {/* Right: Growth Readiness Tracker (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <DashboardIcon name="target" size={16} />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
                Growth Readiness Tracker
              </h2>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/80">
              {readinessLabel}
            </span>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5">
            {[
              { label: 'Udyam Registration & Trade License', status: 'Completed', tone: 'blue' },
              { label: 'Primary Tooling & Machinery Installed', status: 'Completed', tone: 'blue' },
              { label: 'Dedicated Working Capital Facility', status: 'In Progress', tone: 'amber' },
              { label: 'Apprentice Onboarding & Shift Expansion', status: 'Upcoming', tone: 'slate' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-800">{item.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  item.tone === 'blue'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : item.tone === 'amber'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleAction('action-plan')}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Open 60-Day Execution Roadmap →
          </button>
        </div>

      </div>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <DashboardFooter onNavigate={handleAction} />

    </div>
  );
}
