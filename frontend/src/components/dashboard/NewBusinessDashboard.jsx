import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import DashboardHero from './DashboardHero';
import DashboardKPIGrid from './DashboardKPIGrid';
import PriorityActionCenter from './PriorityActionCenter';
import MarketInsightSection from './MarketInsightSection';
import VittanayaInsightsCard from './VittanayaInsightsCard';
import FundingBlueprintCard from './FundingBlueprintCard';
import LaunchReadinessCard from './LaunchReadinessCard';
import DashboardFooter from './DashboardFooter';

/**
 * NewBusinessDashboard Component
 * 
 * Scalable, backend-ready, state-of-the-art dashboard engineered specifically for the "New Business Idea" stage.
 * Structured with the unified Blue + Black + White design system, clear 4-level visual hierarchy,
 * interactive 2D/3D hyper-local intelligence, and desktop-only particle sparks with mobile fallback.
 */
export default function NewBusinessDashboard({
  currentProfile: propProfile,
  onNavigate,
}) {
  const { currentProfile: contextProfile } = useWorkspace();
  const profile = propProfile || contextProfile || {};

  const ownCapital = Number(profile.ownCapital || profile.available_margin_capital || 50000);
  const socialCategory = profile.socialCategory || 'General';
  const areaType = profile.areaType || 'Rural';

  // Derived financial heuristics for new venture (deterministic formulas)
  const subsidyPct =
    socialCategory === 'SC' || socialCategory === 'ST' || socialCategory === 'Women'
      ? 35
      : areaType === 'Rural'
        ? 25
        : 15;

  const estimatedProjectCost = Math.round(ownCapital / 0.15); // Own capital as ~15% margin money
  const estimatedSubsidy = Math.round(estimatedProjectCost * (subsidyPct / 100));
  const estimatedBankLoan = Math.max(0, estimatedProjectCost - ownCapital - estimatedSubsidy);
  const estimatedEmi = Math.round((estimatedBankLoan * 0.1) / 12); // ~10% simple annual interest indicator

  const handleAction = (destination) => {
    if (typeof onNavigate === 'function') {
      onNavigate(destination);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12 animate-fadeIn select-none">

      {/* =========================================================================
          LEVEL 1: LARGE BUSINESS HERO (Blue Visual Identity + Desktop Hover Spark)
          ========================================================================= */}
      <DashboardHero
        profile={profile}
        subsidyPct={subsidyPct}
        ownCapital={ownCapital}
        estimatedProjectCost={estimatedProjectCost}
        onNavigate={handleAction}
      />

      {/* =========================================================================
          LEVEL 2: FOUR KEY VENTURE METRICS (Clean White KPI Grid)
          ========================================================================= */}
      <DashboardKPIGrid
        ownCapital={ownCapital}
        subsidyPct={subsidyPct}
        estimatedProjectCost={estimatedProjectCost}
      />

      {/* =========================================================================
          LEVEL 3: PRIORITY ACTION CENTER (High-Priority Decision Gates)
          ========================================================================= */}
      <PriorityActionCenter
        socialCategory={socialCategory}
        onNavigate={handleAction}
      />

      {/* =========================================================================
          LEVEL 3 (ANALYTICAL HUBS): HYPER-LOCAL INTELLIGENCE + VITTANAYA INSIGHTS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Left Sub-Column: Hyper-Local Intelligence Hub with Live 2D/3D Map (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <MarketInsightSection
            currentProfile={profile}
            onNavigate={handleAction}
            className="flex-1"
          />
        </div>

        {/* Right Sub-Column: Vittanaya Insights Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <VittanayaInsightsCard
            currentProfile={profile}
            onNavigate={handleAction}
            className="flex-1"
          />
        </div>

      </div>

      {/* =========================================================================
          LEVEL 4 (DETAILED PLANNING): FUNDING BLUEPRINT + READINESS TRACKER
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Left Sub-Column: Funding & Subsidy Blueprint (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <FundingBlueprintCard
            ownCapital={ownCapital}
            subsidyPct={subsidyPct}
            estimatedProjectCost={estimatedProjectCost}
            estimatedSubsidy={estimatedSubsidy}
            estimatedBankLoan={estimatedBankLoan}
            estimatedEmi={estimatedEmi}
            onNavigate={handleAction}
            className="flex-1"
          />
        </div>

        {/* Right Sub-Column: Launch Readiness Tracker (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <LaunchReadinessCard
            onNavigate={handleAction}
            className="flex-1"
          />
        </div>

      </div>

      {/* =========================================================================
          FOOTER: DISCLAIMER & LAST UPDATED
          ========================================================================= */}
      <DashboardFooter lastUpdated="Live Dynamic Session" />

    </div>
  );
}
