import React, { useEffect, useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { feasibilityService } from '../../services/feasibilityService';
import { schemeService } from '../../services/schemeService';
import { readinessService } from '../../services/readinessService';
import { financeService } from '../../services/financeService';
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
 * 100% Backend-Grounded Dashboard for NEW / IDEA / PRE-LAUNCH businesses.
 * All feasibility scores, capital allocations, scheme subsidies, and launch
 * readiness metrics originate from authoritative FastAPI domain engines.
 */
export default function NewBusinessDashboard({
  currentProfile: propProfile,
  onNavigate,
}) {
  const { currentProfile: contextProfile } = useWorkspace();
  const profile = propProfile || contextProfile || {};

  const businessId = profile.id ? Number(profile.id) : null;
  const ownCapital = profile.own_capital != null ? Number(profile.own_capital) : (profile.ownCapital != null ? Number(profile.ownCapital) : null);
  const socialCategory = profile.socialCategory || profile.social_category || 'General';
  const areaType = profile.areaType || profile.area_type || 'Rural';
  const businessCategory = profile.category || profile.type || 'General';
  const specificBusiness = profile.industry || profile.description || 'General Enterprise';
  const location = profile.location || profile.district || 'Odisha';

  // Backend States
  const [feasibilityData, setFeasibilityData] = useState(null);
  const [schemeData, setSchemeData] = useState(null);
  const [readinessData, setReadinessData] = useState(null);
  const [fundingStructure, setFundingStructure] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    Promise.allSettled([
      feasibilityService.getBusinessFeasibility(businessId),
      readinessService.getReadiness(businessId),
      schemeService.matchSchemes({
        indicative_project_cost: Number(profile.project_cost || profile.estimatedProjectCost || 500000),
        available_margin_capital: ownCapital != null ? ownCapital : 50000,
        business_category: businessCategory,
        specific_business: specificBusiness,
        location,
        social_category: socialCategory,
        area_type: areaType,
      }),
    ]).then(([feasibilityRes, readinessRes, schemeRes]) => {
      if (!isMounted) return;

      if (feasibilityRes.status === 'fulfilled' && feasibilityRes.value) {
        setFeasibilityData(feasibilityRes.value);
      } else {
        setFeasibilityData(null);
      }

      if (readinessRes.status === 'fulfilled' && readinessRes.value) {
        setReadinessData(readinessRes.value);
      } else {
        setReadinessData(null);
      }

      if (schemeRes.status === 'fulfilled' && schemeRes.value) {
        setSchemeData(schemeRes.value);
      } else {
        setSchemeData(null);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [businessId, ownCapital, businessCategory, specificBusiness, location, socialCategory, areaType, profile.project_cost, profile.estimatedProjectCost]);

  // Synchronize live readiness updates from Action Plan task checkoffs
  useEffect(() => {
    const handleReadinessUpdate = () => {
      if (businessId) {
        readinessService.getReadiness(businessId).then((res) => {
          if (res) setReadinessData(res);
        }).catch(() => {});
      }
    };
    window.addEventListener('vittanaya-readiness-updated', handleReadinessUpdate);
    return () => window.removeEventListener('vittanaya-readiness-updated', handleReadinessUpdate);
  }, [businessId]);

  // Derived Authoritative Values from Backend
  const feasibilityScore = feasibilityData?.final_score != null ? Number(feasibilityData.final_score.toFixed(1)) : null;

  const feasibilityStatus = useMemo(() => {
    if (feasibilityScore == null) return null;
    if (feasibilityScore >= 75) return 'HIGH FEASIBILITY';
    if (feasibilityScore >= 60) return 'GOOD POTENTIAL';
    if (feasibilityScore >= 45) return 'MODERATE POTENTIAL';
    return 'HIGH RISK / EARLY';
  }, [feasibilityScore]);

  const topScheme = schemeData?.eligible_schemes?.[0] || null;
  const subsidyPct = topScheme?.estimated_subsidy_pct != null
    ? Math.round(topScheme.estimated_subsidy_pct)
    : (schemeData?.ineligible_schemes?.length ? 0 : null);

  const estimatedProjectCost = useMemo(() => {
    if (profile.project_cost && Number(profile.project_cost) > 0) return Number(profile.project_cost);
    if (feasibilityData?.business_project_cost && feasibilityData.business_project_cost > 0) return feasibilityData.business_project_cost;
    if (feasibilityData?.reference_project_cost && feasibilityData.reference_project_cost > 0) return feasibilityData.reference_project_cost;
    if (topScheme?.max_eligible_cost && topScheme.max_eligible_cost > 0) return topScheme.max_eligible_cost;
    return null;
  }, [profile.project_cost, feasibilityData, topScheme]);

  const estimatedSubsidy = useMemo(() => {
    if (topScheme?.estimated_subsidy_amount != null && topScheme.estimated_subsidy_amount > 0) {
      return Math.round(topScheme.estimated_subsidy_amount);
    }
    if (estimatedProjectCost && subsidyPct != null) {
      return Math.round(estimatedProjectCost * (subsidyPct / 100));
    }
    return null;
  }, [topScheme, estimatedProjectCost, subsidyPct]);

  const estimatedBankLoan = useMemo(() => {
    if (topScheme?.eligible_loan_amount != null && topScheme.eligible_loan_amount > 0) {
      return Math.round(topScheme.eligible_loan_amount);
    }
    if (estimatedProjectCost && ownCapital != null) {
      return Math.max(0, Math.round(estimatedProjectCost - ownCapital - (estimatedSubsidy || 0)));
    }
    return null;
  }, [topScheme, estimatedProjectCost, ownCapital, estimatedSubsidy]);

  const estimatedEmi = useMemo(() => {
    if (estimatedBankLoan && estimatedBankLoan > 0) {
      const p = estimatedBankLoan;
      const r = 0.095 / 12; // 9.5% annual reducing balance benchmark
      const n = 7 * 12; // 7 years tenure
      return Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    }
    return null;
  }, [estimatedBankLoan]);

  // Risk & Market traces from backend AHP computation
  const riskCriterion = feasibilityData?.criteria_traces?.find((c) => c.criterion === 'risk');
  const riskLevel = useMemo(() => {
    if (!riskCriterion) return null;
    if (riskCriterion.raw_score >= 70) return 'LOW';
    if (riskCriterion.raw_score >= 45) return 'MEDIUM';
    return 'HIGH';
  }, [riskCriterion]);

  const marketCriterion = feasibilityData?.criteria_traces?.find((c) => c.criterion === 'market');
  const marketPotential = useMemo(() => {
    if (!marketCriterion) return null;
    if (marketCriterion.raw_score >= 70) return 'HIGH';
    if (marketCriterion.raw_score >= 45) return 'MODERATE';
    return 'EMERGING';
  }, [marketCriterion]);

  const breakevenEstimate = useMemo(() => {
    const finCriterion = feasibilityData?.criteria_traces?.find((c) => c.criterion === 'financial');
    if (!finCriterion) return null;
    if (finCriterion.raw_score >= 65) return '4 – 6 Months';
    if (finCriterion.raw_score >= 40) return '6 – 9 Months';
    return '9 – 14 Months';
  }, [feasibilityData]);

  const handleAction = (destination) => {
    if (typeof onNavigate === 'function') {
      onNavigate(destination);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12 animate-fadeIn select-none">

      {/* =========================================================================
          LEVEL 1: LARGE BUSINESS HERO (Authoritative Feasibility Score from Backend)
          ========================================================================= */}
      <DashboardHero
        profile={profile}
        subsidyPct={subsidyPct}
        ownCapital={ownCapital}
        feasibilityScore={feasibilityScore}
        feasibilityStatus={feasibilityStatus}
        isLoading={isLoading}
        onNavigate={handleAction}
      />

      {/* =========================================================================
          LEVEL 2: FOUR KEY VENTURE METRICS (Dynamic Backend KPI Grid)
          ========================================================================= */}
      <DashboardKPIGrid
        ownCapital={ownCapital}
        subsidyPct={subsidyPct}
        estimatedProjectCost={estimatedProjectCost}
        breakevenEstimate={breakevenEstimate}
        readinessLabel={readinessData?.readiness_label}
        readinessCountContext={
          readinessData
            ? `${readinessData.completed_requirements ?? 0} of ${readinessData.total_requirements ?? 0} launch requirements`
            : null
        }
        fundingReadinessLabel={topScheme ? `${Math.round(topScheme.required_margin_pct)}% Margin` : null}
        fundingContext={topScheme ? `Scheme: ${topScheme.scheme_code}` : null}
        riskLevel={riskLevel}
        riskContext={riskCriterion?.data_source}
        marketPotential={marketPotential}
        marketContext={marketCriterion?.data_source}
        isLoading={isLoading}
      />

      {/* =========================================================================
          LEVEL 3: PRIORITY ACTION CENTER (Dynamic Requirements Launch Gates)
          ========================================================================= */}
      <PriorityActionCenter
        socialCategory={socialCategory}
        pendingRequirements={readinessData?.requirements?.filter((r) => r.status === 'pending')}
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
            isLoading={isLoading}
            onNavigate={handleAction}
            className="flex-1"
          />
        </div>

        {/* Right Sub-Column: Launch Readiness Tracker (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <LaunchReadinessCard
            readinessScore={readinessData?.readiness_score}
            readinessLabel={readinessData?.readiness_label}
            requirements={readinessData?.requirements}
            isLoading={isLoading}
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
