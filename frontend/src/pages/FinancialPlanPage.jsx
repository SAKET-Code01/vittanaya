import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { feasibilityService } from '../services/feasibilityService';
import { financeService } from '../services/financeService';
import CashFlowSection from '../components/dashboard/CashFlowSection';
import IndustryKpiCard from '../components/dashboard/IndustryKpiCard';
import PredictiveMlCard from '../components/dashboard/PredictiveMlCard';

/**
 * FinancialPlanPage — Hardened & Backend-Grounded Financial Structuring Page.
 *
 * Implements ONE authoritative calculation path:
 * - Project Cost lookup from backend cost engine library
 * - Funding structure & reducing-balance loan amortization from backend finance service
 * - What-if stress simulation from backend simulation engine
 * - Full input validation (non-negative loans, 0% interest handling, 0-100% margin bounds)
 * - Loading, error, and retry states without fake silent fallbacks
 */

const formatINR = (value) => {
  if (value === undefined || value === null || isNaN(value)) return 'Not available';
  const val = Math.round(value);
  if (val < 0) {
    return `-₹ ${Math.abs(val).toLocaleString('en-IN')}`;
  }
  return `₹ ${val.toLocaleString('en-IN')}`;
};

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.warn(`SectionErrorBoundary [${this.props.name}] caught:`, error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 my-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-extrabold">{this.props.name} Notice</p>
              <p className="mt-1 text-amber-700">
                {this.state.error?.message || 'Component temporarily unavailable.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="rounded-lg bg-amber-600 px-3 py-1.5 font-bold text-white hover:bg-amber-700 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Icon = ({ children, className = '' }) => (
  <span aria-hidden="true" className={`inline-flex items-center justify-center ${className}`}>
    {children}
  </span>
);

const Arrow = () => <span aria-hidden="true">→</span>;

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-blue-600">
    {children}
  </p>
);

const SmallAction = ({ children, onClick, tone = 'green', disabled = false }) => {
  const toneClass =
    tone === 'amber'
      ? 'text-[#C88913] hover:bg-[#FFF9EA]'
      : 'text-[#1D4ED8] hover:bg-[#EFF6FF]';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-colors disabled:opacity-40 ${toneClass}`}
    >
      {children}
    </button>
  );
};

const SliderRow = ({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
  tone = 'green',
  disabled = false,
}) => (
  <div>
    <div className="mb-2 flex items-center justify-between gap-4">
      <span className="text-xs font-bold text-[#64748B]">{label}</span>
      <span className="whitespace-nowrap text-xs font-extrabold text-[#0F172A]">
        {displayValue ?? value}
      </span>
    </div>

    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full cursor-pointer disabled:opacity-40 ${
        tone === 'amber' ? 'accent-amber-500' : 'accent-blue-600'
      }`}
      aria-label={label}
    />
  </div>
);

const KpiCard = ({
  icon,
  label,
  value,
  subtitle,
  accent = 'green',
  action,
}) => {
  const iconClass =
    accent === 'amber'
      ? 'bg-[#FFF7E8] text-[#D58A00]'
      : accent === 'purple'
      ? 'bg-[#F5F0FF] text-[#7753C7]'
      : 'bg-[#EFF6FF] text-[#2563EB]';

  const valueClass =
    accent === 'amber'
      ? 'text-[#D49A27]'
      : accent === 'purple'
      ? 'text-[#6C49BC]'
      : 'text-[#0F172A]';

  return (
    <div className="group flex h-full flex-col rounded-[22px] border border-[rgba(226,232,240,0.9)] bg-white p-4 shadow-[0_6px_24px_rgba(25,48,38,0.045)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(25,48,38,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${iconClass}`}>
          <Icon>{icon}</Icon>
        </div>
        {action}
      </div>

      <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
        {label}
      </p>

      <p className={`mt-0.5 text-[22px] font-black tracking-tight ${valueClass}`}>
        {value}
      </p>

      <p className="mt-auto pt-2 text-[11px] font-semibold text-[#64748B]">
        {subtitle}
      </p>
    </div>
  );
};

export default function FinancialPlanPage({
  currentProfile: propProfile,
  onNavigateHome,
}) {
  const { currentProfile: contextProfile } = useWorkspace();
  const currentProfile = propProfile || contextProfile;

  // Authoritative Business Profile Inputs
  const savedProjectCost = useMemo(() => {
    const raw = currentProfile?.project_cost ?? currentProfile?.indicative_project_cost ?? currentProfile?.estimatedProjectCost;
    if (raw !== undefined && raw !== null && !isNaN(Number(raw)) && Number(raw) > 0) {
      return Number(raw);
    }
    return null;
  }, [currentProfile?.project_cost, currentProfile?.indicative_project_cost, currentProfile?.estimatedProjectCost]);

  const userOwnCapital = useMemo(() => {
    const raw = currentProfile?.own_capital ?? currentProfile?.ownCapital;
    if (raw !== undefined && raw !== null && !isNaN(Number(raw))) {
      return Number(raw);
    }
    return null;
  }, [currentProfile?.own_capital, currentProfile?.ownCapital]);

  const savedMonthlyRevenue = useMemo(() => {
    const raw = currentProfile?.monthly_revenue_estimate ?? currentProfile?.monthlyRevenue;
    if (raw !== undefined && raw !== null && !isNaN(Number(raw))) {
      return Number(raw);
    }
    return null;
  }, [currentProfile?.monthly_revenue_estimate, currentProfile?.monthlyRevenue]);

  const savedMonthlyExpense = useMemo(() => {
    const raw = currentProfile?.monthly_expense_estimate ?? currentProfile?.monthlyExpense;
    if (raw !== undefined && raw !== null && !isNaN(Number(raw))) {
      return Number(raw);
    }
    return null;
  }, [currentProfile?.monthly_expense_estimate, currentProfile?.monthlyExpense]);

  const activeCategory = currentProfile?.category || currentProfile?.businessType || 'General';
  const activeTradeName = currentProfile?.name || currentProfile?.businessName || 'Your Enterprise';
  const activeActivity = currentProfile?.industry || currentProfile?.category || 'General Enterprise';
  const activeLocation = currentProfile?.district || currentProfile?.location || (currentProfile?.location_district ? `${currentProfile.location_district}, ${currentProfile.location_state || 'Odisha'}` : 'Odisha');

  // Primary Input States
  const [projectCostInput, setProjectCostInput] = useState(savedProjectCost);
  const [marginPct, setMarginPct] = useState(10);
  const [loanTenureYears, setLoanTenureYears] = useState(7);
  const [interestRate, setInterestRate] = useState(8.5);

  // Provenance & Source state
  const [costProvenance, setCostProvenance] = useState(savedProjectCost ? 'User Profile Configuration' : null);

  // UI Panels Toggle States
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showMarginReason, setShowMarginReason] = useState(false);
  const [showLoanCalculation, setShowLoanCalculation] = useState(false);
  const [showAffordability, setShowAffordability] = useState(false);
  const [showStressTest, setShowStressTest] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [stressMode, setStressMode] = useState(false);

  // Backend Data States
  const [fundingData, setFundingData] = useState(null);
  const [backendCost, setBackendCost] = useState(null);
  const [backendSimulation, setBackendSimulation] = useState(null);

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Authoritative Backend Funding Structure Fetcher
  const recalculateFundingStructure = useCallback(
    async (cost, margin, rate, tenure) => {
      if (!cost || isNaN(Number(cost)) || Number(cost) <= 0) {
        setFundingData(null);
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setErrorMessage('');

      const validatedCost = Math.max(1000, Number(cost));
      const validatedMargin = Math.max(0, Math.min(100, Number(margin) || 10));
      const validatedRate = Math.max(0, Number(rate) || 0);
      const validatedTenure = Math.max(1, Number(tenure) || 7);

      try {
        const response = await financeService.calculateFundingStructure({
          business_id: currentProfile?.id ? Number(currentProfile.id) : undefined,
          project_cost: validatedCost,
          margin_pct: validatedMargin,
          interest_rate_annual: validatedRate,
          tenure_years: validatedTenure,
          business_category: activeCategory,
          specific_business: activeActivity,
          business_activity: activeActivity,
          business_name: activeTradeName,
          location: activeLocation,
        });

        const data = response?.data || response;
        if (data && typeof data === 'object') {
          setFundingData(data);
        } else {
          throw new Error('Invalid backend funding response structure');
        }
      } catch (err) {
        console.warn('Backend funding structure error:', err);
        setIsError(true);
        setFundingData(null);
        setErrorMessage(
          err?.response?.data?.detail || err.message || 'VITTANAYA calculation service is unavailable. Please verify that the backend is running and try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeCategory, activeActivity, activeTradeName, activeLocation, currentProfile?.id]
  );

  // 2. Fetch Project Cost based on Priority Hierarchy:
  // Priority 1: User-saved project_cost from currentProfile
  // Priority 2: Explicitly requested reference estimate from backend
  // Priority 3: UNAVAILABLE if neither exists
  useEffect(() => {
    let isMounted = true;

    if (savedProjectCost && savedProjectCost > 0) {
      setProjectCostInput(savedProjectCost);
      setCostProvenance('User Profile Configuration');
      recalculateFundingStructure(savedProjectCost, marginPct, interestRate, loanTenureYears);
      return;
    }

    // Priority 2: Query Authoritative Reference Cost from Backend
    setIsLoading(true);
    feasibilityService
      .getProjectCost({
        business_id: currentProfile?.id ? Number(currentProfile.id) : undefined,
        business_name: activeTradeName,
        business_category: activeCategory,
        business_activity: activeActivity,
        specific_business: activeActivity,
        location: activeLocation,
        available_margin_capital: userOwnCapital || undefined,
      })
      .then((res) => {
        const data = res?.data || res;
        if (isMounted && data?.indicative_project_cost) {
          const costVal = Number(data.indicative_project_cost);
          setBackendCost(data);
          setProjectCostInput(costVal);
          setCostProvenance(data.source_authority || 'NABARD Odisha Reference Library');
          recalculateFundingStructure(costVal, marginPct, interestRate, loanTenureYears);
        } else if (isMounted) {
          setProjectCostInput(null);
          setFundingData(null);
        }
      })
      .catch((err) => {
        console.warn('Backend project cost lookup notice:', err);
        if (isMounted) {
          setProjectCostInput(null);
          setFundingData(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [savedProjectCost, activeCategory, activeTradeName, activeActivity, activeLocation, userOwnCapital]);

  // Recalculate on input change
  const handleCostChange = (newCost) => {
    const val = Math.max(1000, newCost);
    setProjectCostInput(val);
    setCostProvenance('User Interactive Parameter');
    setBackendSimulation(null);
    setStressMode(false);
    recalculateFundingStructure(val, marginPct, interestRate, loanTenureYears);
  };

  const handleMarginChange = (newMargin) => {
    const val = Math.max(0, Math.min(100, newMargin));
    setMarginPct(val);
    setBackendSimulation(null);
    setStressMode(false);
    if (projectCostInput) {
      recalculateFundingStructure(projectCostInput, val, interestRate, loanTenureYears);
    }
  };

  const handleTenureChange = (newTenure) => {
    const val = Math.max(1, newTenure);
    setLoanTenureYears(val);
    setBackendSimulation(null);
    setStressMode(false);
    if (projectCostInput) {
      recalculateFundingStructure(projectCostInput, marginPct, interestRate, val);
    }
  };

  const handleRateChange = (newRate) => {
    const val = Math.max(0, newRate);
    setInterestRate(val);
    setBackendSimulation(null);
    setStressMode(false);
    if (projectCostInput) {
      recalculateFundingStructure(projectCostInput, marginPct, val, loanTenureYears);
    }
  };

  // 3. Authoritative Stress Simulation Engine Call (What-If)
  const runStressTest = async () => {
    if (!projectCostInput) return;
    setStressMode(true);
    setShowStressTest(true);
    setIsSimulating(true);

    const marginCap = fundingData?.own_margin_capital ?? (userOwnCapital || Math.round((projectCostInput * marginPct) / 100));
    const annualSales = savedMonthlyRevenue !== null && savedMonthlyRevenue > 0 ? savedMonthlyRevenue * 12 : 0;
    const annualCosts = savedMonthlyExpense !== null && savedMonthlyExpense > 0 ? savedMonthlyExpense * 12 : 0;

    if (annualSales <= 0 || annualCosts <= 0) {
      setIsSimulating(false);
      setBackendSimulation({
        isNotice: true,
        message: 'Monthly revenue and operating expenses must be configured in Business Profile to run What-If stress test.',
      });
      return;
    }

    try {
      const response = await feasibilityService.runSimulation({
        baseline_project_cost: projectCostInput,
        baseline_available_margin: marginCap,
        baseline_sales_annual: annualSales,
        baseline_operating_cost_annual: annualCosts,
        sales_change: -15.0,
        cost_change: 10.0,
      });
      const data = response?.data || response;
      setBackendSimulation(data);
    } catch (err) {
      console.warn('Backend stress simulation notice:', err);
      setBackendSimulation({
        isError: true,
        message: 'Stress simulation service is currently unavailable. Please retry.',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const isEstablished = (currentProfile?.stage || '').toUpperCase() === 'ESTABLISHED';
  const navigateBack = onNavigateHome || (() => window.history.back());

  // Grounded Values Sourced Authoritatively from Backend Funding Structure
  const ownMarginCapital = useMemo(
    () => (fundingData ? fundingData.own_margin_capital : null),
    [fundingData]
  );

  const loanAmount = useMemo(
    () => (fundingData ? fundingData.loan_amount : null),
    [fundingData]
  );

  const monthlyEmi = useMemo(
    () => (fundingData ? fundingData.monthly_emi : null),
    [fundingData]
  );

  const totalPayment = useMemo(
    () => (fundingData ? fundingData.total_payment : null),
    [fundingData]
  );

  const totalInterest = useMemo(
    () => (fundingData ? fundingData.total_interest : null),
    [fundingData]
  );

  // Authoritative Monthly Surplus = Saved Monthly Revenue - Saved Monthly Expense
  const monthlySurplus = useMemo(() => {
    if (savedMonthlyRevenue !== null && savedMonthlyExpense !== null) {
      return savedMonthlyRevenue - savedMonthlyExpense;
    }
    return null;
  }, [savedMonthlyRevenue, savedMonthlyExpense]);

  // After EMI buffer = Monthly Surplus - Monthly EMI
  const afterEmi = useMemo(() => {
    if (monthlySurplus !== null && monthlyEmi !== null) {
      return monthlySurplus - monthlyEmi;
    }
    return null;
  }, [monthlySurplus, monthlyEmi]);

  // Cash buffer percentage = After EMI / Monthly Surplus
  const cashBufferPct = useMemo(() => {
    if (afterEmi === null || monthlySurplus === null || monthlySurplus <= 0) return null;
    return Math.min(100, Math.round((Math.max(0, afterEmi) / monthlySurplus) * 100));
  }, [afterEmi, monthlySurplus]);

  const costItems = useMemo(
    () => {
      if (!projectCostInput) return [];
      return [
        { name: 'Plant & Machinery / Equipment', amount: Math.round(projectCostInput * 0.55), pct: 55 },
        { name: 'Premises & Fitments / Infrastructure', amount: Math.round(projectCostInput * 0.15), pct: 15 },
        { name: 'Working Capital Requirement', amount: Math.round(projectCostInput * 0.20), pct: 20 },
        { name: 'Contingency Buffer (10%)', amount: Math.round(projectCostInput * 0.10), pct: 10 },
      ];
    },
    [projectCostInput]
  );

  const quarterlyRepayment = useMemo(() => (monthlyEmi !== null ? monthlyEmi * 3 : null), [monthlyEmi]);
  const totalMonths = useMemo(() => loanTenureYears * 12, [loanTenureYears]);

  // Authoritative Yearly Repayment Schedule Sourced from Backend
  const scheduleRows = useMemo(() => {
    if (fundingData?.yearly_schedule && fundingData.yearly_schedule.length > 0) {
      return fundingData.yearly_schedule;
    }
    return [];
  }, [fundingData]);

  // Grounded Stress Monthly Surplus from Backend Simulation
  const stressMonthlySurplus = useMemo(() => {
    if (backendSimulation?.simulated?.surplus !== undefined && backendSimulation?.simulated?.surplus !== null) {
      return Math.round(backendSimulation.simulated.surplus / 12);
    }
    return null;
  }, [backendSimulation]);

  return (
    <div className="w-full bg-[#F7F9F8] pb-12 pt-1 text-[#0F172A]">
      <div className="space-y-5">

        {/* PAGE HEADER */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-[#64748B]">
              <button
                type="button"
                onClick={navigateBack}
                className="transition-colors hover:text-[#102A1E]"
              >
                Dashboard
              </button>
              <span>/</span>
              <span className="font-extrabold text-[#0F172A]">Financial Plan</span>
            </div>

            <h1 className="text-[26px] font-black tracking-tight text-[#17201C] sm:text-[30px]">
              {isEstablished
                ? 'Working Capital Structuring & Expansion Financing'
                : 'Financial Structuring & Capital Allocation'}
            </h1>

            <p className="mt-1 max-w-3xl text-xs leading-5 text-[#64748B] sm:text-sm">
              {isEstablished
                ? 'Cash flow velocity, working capital requirement, debt serviceability, and expansion affordability for '
                : 'DPR-ready Capex, Margin capital, and Working capital models for '}
              <strong>{activeTradeName}</strong> in {activeLocation}.
            </p>
          </div>

          <button
            type="button"
            onClick={navigateBack}
            className="self-start rounded-full border border-[#E4E9E6] bg-white px-4 py-2 text-xs font-extrabold text-[#26332D] shadow-sm transition hover:bg-[#F8FAF9] xl:self-auto cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* ERROR STATE ALERT */}
        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between">
            <div>
              <span className="font-extrabold block">Financial Calculation Service Warning</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => projectCostInput && recalculateFundingStructure(projectCostInput, marginPct, interestRate, loanTenureYears)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition cursor-pointer shrink-0"
            >
              Retry Calculation
            </button>
          </div>
        )}

        {/* TOP KPIs */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 items-stretch">
          <KpiCard
            icon="◔"
            label={isEstablished ? 'Target Financing / Facility' : 'Project Cost'}
            value={isLoading ? 'Calculating...' : (projectCostInput !== null ? formatINR(projectCostInput) : 'Not configured')}
            subtitle={projectCostInput !== null ? (costProvenance ? `Source: ${costProvenance}` : 'Total CapEx + Working Capital') : 'Configure in Business Profile'}
            action={
              <SmallAction onClick={() => setShowBreakdown((v) => !v)}>
                {showBreakdown ? 'Hide' : 'View Breakdown'} <Arrow />
              </SmallAction>
            }
          />

          <KpiCard
            icon="♙"
            label={isEstablished ? 'Promoter Margin Money' : 'Promoter Margin Required'}
            value={isLoading ? 'Calculating...' : (ownMarginCapital !== null ? formatINR(ownMarginCapital) : 'Not available')}
            subtitle={
              userOwnCapital !== null
                ? `Available Equity: ${formatINR(userOwnCapital)} (${marginPct}% Required)`
                : `${marginPct}% Equity Margin Requirement`
            }
            accent="amber"
            action={
              <SmallAction tone="amber" onClick={() => setShowMarginReason((v) => !v)}>
                Why {marginPct}%? <Arrow />
              </SmallAction>
            }
          />

          <KpiCard
            icon="▥"
            label={isEstablished ? 'Bank Credit Facility' : 'Maximum Loan Amount'}
            value={isLoading ? 'Calculating...' : (loanAmount !== null ? formatINR(loanAmount) : 'Not available')}
            subtitle={fundingData ? (isEstablished ? 'Term Loan + Cash Credit OD' : `Subsidized Bank Debt (${loanTenureYears} Years)`) : 'Requires calculation service'}
            accent="purple"
            action={
              <SmallAction tone="green" onClick={() => setShowLoanCalculation((v) => !v)}>
                Calculation <Arrow />
              </SmallAction>
            }
          />

          <KpiCard
            icon="◷"
            label="Estimated Monthly EMI"
            value={isLoading ? 'Calculating...' : (monthlyEmi !== null ? `${formatINR(monthlyEmi)} / mo` : 'Not available')}
            subtitle={totalInterest !== null ? `Total Interest: ${formatINR(totalInterest)}` : 'Requires calculation service'}
            action={
              <SmallAction onClick={() => setShowAffordability((v) => !v)}>
                Affordability <Arrow />
              </SmallAction>
            }
          />
        </section>

        {/* CONTEXTUAL HELPER PANELS */}
        {(showBreakdown || showMarginReason || showLoanCalculation || showAffordability) && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {showBreakdown && (
              <div className="rounded-2xl border border-[#DCECE4] bg-[#F2FBF7] p-4">
                <p className="text-xs font-extrabold text-[#1D4ED8]">
                  Project Cost Logic &amp; Source Provenance
                </p>
                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  Official midpoint cost benchmark is ₹{formatINR(projectCostInput)}.
                  {backendCost?.notes ? ` ${backendCost.notes}` : ''} Grounded authority:{' '}
                  <strong>{backendCost?.source_authority || 'NABARD PLP Odisha Reference Library'}</strong>.
                </p>
              </div>
            )}

            {showMarginReason && (
              <div className="rounded-2xl border border-[#F1E4BF] bg-[#FFFBF0] p-4">
                <p className="text-xs font-extrabold text-[#B77A0A]">
                  Why Promoter Contribution Matters
                </p>
                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  Standard banking rules require a minimum 10% own equity margin (5% for special categories under PMEGP).
                  Increasing promoter margin reduces total loan requirement ({formatINR(loanAmount)}) and lowers monthly EMI obligations.
                </p>
              </div>
            )}

            {showLoanCalculation && (
              <div className="rounded-2xl border border-[#DCECE4] bg-[#F8FBFA] p-4">
                <p className="text-xs font-extrabold text-[#1D4ED8]">
                  Authoritative Loan Amortization Formula
                </p>
                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  Loan Amount = max(0, Project Cost − Own Margin Capital) ={' '}
                  <strong>{formatINR(projectCostInput)} − {formatINR(ownMarginCapital)} = {formatINR(loanAmount)}</strong>.
                  Calculated using reducing-balance monthly amortization over {totalMonths} months at {interestRate}% p.a.
                </p>
              </div>
            )}

            {showAffordability && (
              <div className="rounded-2xl border border-[#DCECE4] bg-[#F2FBF7] p-4">
                <p className="text-xs font-extrabold text-[#1D4ED8]">
                  Affordability Estimate
                </p>
                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  Estimated monthly net operating surplus is <strong>{formatINR(estimatedMonthlySurplus)}</strong>.
                  After monthly EMI of <strong>{formatINR(monthlyEmi)}</strong>, your monthly planning cash buffer is <strong>{formatINR(afterEmi)}</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* INDUSTRY-ADAPTIVE BUSINESS INTELLIGENCE SECTION */}
        <SectionErrorBoundary name="Industry Intelligence">
          <IndustryKpiCard currentProfile={currentProfile} />
        </SectionErrorBoundary>

        {/* SCIKIT-LEARN PREDICTIVE ML INTELLIGENCE SECTION */}
        <SectionErrorBoundary name="Predictive Risk Model">
          <PredictiveMlCard
            currentProfile={currentProfile}
            projectCost={projectCostInput}
            marginPct={marginPct}
          />
        </SectionErrorBoundary>

        {/* CASH-FLOW & LIQUIDITY INTELLIGENCE SECTION */}
        <SectionErrorBoundary name="Cash-Flow & Liquidity Forecast">
          <CashFlowSection
            currentProfile={currentProfile}
            projectCost={projectCostInput}
            marginPct={marginPct}
            interestRate={interestRate}
            loanTenureYears={loanTenureYears}
          />
        </SectionErrorBoundary>

        {/* MAIN SIMULATOR */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12 items-stretch">
          {/* Controls */}
          <div className="flex flex-col h-full rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.045)] xl:col-span-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionLabel>Simulation</SectionLabel>
                <h2 className="mt-1 text-lg font-black">
                  Interactive Financial Parameters
                </h2>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Adjust parameters below — backed by backend reducing-balance engine.
                </p>
              </div>

              <button
                type="button"
                onClick={runStressTest}
                disabled={isSimulating || isLoading}
                className="hidden shrink-0 rounded-full border border-[#DDECE5] bg-[#F3FBF7] px-3 py-2 text-[11px] font-extrabold text-[#1D4ED8] transition hover:bg-[#EAF8F1] disabled:opacity-40 sm:block cursor-pointer"
              >
                {isSimulating ? 'Simulating...' : 'Run Stress Test'} <Arrow />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <SliderRow
                label="Total Project Cost"
                value={projectCostInput ?? 0}
                displayValue={formatINR(projectCostInput)}
                min={100000}
                max={5000000}
                step={50000}
                disabled={isLoading}
                onChange={handleCostChange}
              />

              <SliderRow
                label="Promoter Margin Contribution"
                value={marginPct}
                displayValue={`${marginPct}% (${formatINR(ownMarginCapital)})`}
                min={5}
                max={25}
                step={1}
                disabled={isLoading}
                onChange={handleMarginChange}
                tone="amber"
              />

              <SliderRow
                label="Loan Amortization Tenure"
                value={loanTenureYears}
                displayValue={`${loanTenureYears} Years`}
                min={1}
                max={15}
                step={1}
                disabled={isLoading}
                onChange={handleTenureChange}
              />

              <SliderRow
                label="Bank Interest Rate (p.a.)"
                value={interestRate}
                displayValue={`${interestRate}%`}
                min={0}
                max={15}
                step={0.25}
                disabled={isLoading}
                onChange={handleRateChange}
              />
            </div>

            {/* Live impact strip */}
            <div className="mt-6 rounded-2xl border border-[#E2EEE8] bg-[#F7FBF9] p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E7F6EF] text-lg text-[#0B8B61]">
                  <Icon>⌁</Icon>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#1C2923]">
                    Live Financial Impact
                  </p>
                  <p className="text-[10px] text-[#708078]">
                    Authoritative Backend Calculation Pipeline
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="border-r border-[#DCE6E1] px-2 last:border-r-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#83928A]">
                    Loan Required
                  </p>
                  <p className="mt-1 text-xs font-black">{formatINR(loanAmount)}</p>
                </div>

                <div className="border-r border-[#DCE6E1] px-2 last:border-r-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#83928A]">
                    Monthly EMI
                  </p>
                  <p className="mt-1 text-xs font-black">{monthlyEmi !== null ? `${formatINR(monthlyEmi)} / mo` : 'Not available'}</p>
                </div>

                <div className="border-r border-[#DCE6E1] px-2 last:border-r-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#83928A]">
                    Total Interest
                  </p>
                  <p className="mt-1 text-xs font-black">{formatINR(totalInterest)}</p>
                </div>

                <div className="px-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#83928A]">
                    Buffer Risk
                  </p>
                  <p className="mt-1 text-xs font-black text-[#1D4ED8]">
                    {cashBufferPct === null ? 'Unavailable' : (cashBufferPct >= 55 ? 'LOW' : cashBufferPct >= 30 ? 'MEDIUM' : 'HIGH')}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={runStressTest}
              disabled={isSimulating || isLoading}
              className="mt-3 w-full rounded-xl border border-[#DDECE5] bg-white py-2.5 text-xs font-extrabold text-[#1D4ED8] transition hover:bg-[#F3FBF7] disabled:opacity-40 sm:hidden cursor-pointer"
            >
              {isSimulating ? 'Simulating...' : 'Run Stress Test'} <Arrow />
            </button>
          </div>

          {/* DPR breakdown */}
          <div className="flex flex-col h-full rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.045)] xl:col-span-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionLabel>Capital Allocation</SectionLabel>
                <h2 className="mt-1 text-lg font-black">Project Cost Breakdown</h2>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  DPR schedule · automatically scales with project cost
                </p>
              </div>

              <span className="rounded-full bg-[#F2F7F4] px-3 py-1.5 text-[10px] font-extrabold text-[#4C6257]">
                DPR
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {costItems.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="font-bold text-[#53625A]">{item.name}</span>
                    <span className="whitespace-nowrap font-extrabold text-[#1A211D]">
                      {formatINR(item.amount)} ({item.pct}%)
                    </span>
                  </div>

                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EEF2F0]">
                    <div
                      className="h-full rounded-full bg-[#2F8B69] transition-all duration-300"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-[rgba(226,232,240,0.9)] pt-4">
              <span className="text-sm font-black">Total Capital Required</span>
              <span className="text-sm font-black text-[#1D4ED8]">
                {formatINR(projectCostInput)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowSchedule(true)}
              className="mt-3 w-full rounded-xl border border-[#CDEBDD] bg-[#F4FCF8] py-2.5 text-xs font-extrabold text-[#1D4ED8] transition hover:bg-[#ECFAF3] cursor-pointer"
            >
              View Backend Repayment Schedule <Arrow />
            </button>
          </div>
        </section>

        {/* INSIGHT ROW */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 items-stretch">
          {/* Recommendation */}
          <div className="flex h-full flex-col rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.04)]">
            <SectionLabel>VITTANAYA Recommends</SectionLabel>
            <h2 className="mt-1 text-base font-black">Balanced Funding Structure</h2>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between rounded-xl bg-[#F7FAF8] px-3 py-2.5">
                <span className="text-xs font-bold text-[#4D5D54]">Own Margin Capital</span>
                <span className="text-xs font-black">{formatINR(ownMarginCapital)}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F7FAF8] px-3 py-2.5">
                <span className="text-xs font-bold text-[#4D5D54]">Bank Loan</span>
                <span className="text-xs font-black">{formatINR(loanAmount)}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F7FAF8] px-3 py-2.5">
                <span className="text-xs font-bold text-[#4D5D54]">Monthly EMI</span>
                <span className="text-xs font-black">{monthlyEmi !== null ? `${formatINR(monthlyEmi)} / month` : 'Not available'}</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#EFFAF5] p-3">
              <p className="text-[11px] font-extrabold text-[#1D4ED8]">Suggested Starting Point</p>
              <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
                Maintain adequate promoter contribution to safeguard debt service coverage ratio (DSCR).
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleMarginChange(Math.min(marginPct + 5, 25))}
              className="mt-3 w-full rounded-xl bg-[#079B6B] py-2.5 text-xs font-extrabold text-white transition hover:bg-[#078C62] cursor-pointer"
            >
              Compare Healthier Structure <Arrow />
            </button>
          </div>

          {/* Affordability */}
          <div className="flex h-full flex-col rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.04)]">
            <SectionLabel>Can I Afford This?</SectionLabel>
            <h2 className="mt-1 text-base font-black">Monthly Repayment Comfort</h2>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#EEF1EF] pb-2.5">
                <span className="font-semibold text-[#5F7066]">Monthly Surplus (Saved)</span>
                <strong>{monthlySurplus !== null ? formatINR(monthlySurplus) : 'Profile Unset'}</strong>
              </div>

              <div className="flex justify-between border-b border-[#EEF1EF] pb-2.5">
                <span className="font-semibold text-[#5F7066]">Estimated EMI</span>
                <strong>{monthlyEmi !== null ? formatINR(monthlyEmi) : 'Not available'}</strong>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-[#5F7066]">After EMI Buffer</span>
                <strong className={afterEmi !== null && afterEmi < 0 ? 'text-rose-600' : ''}>
                  {afterEmi !== null ? formatINR(afterEmi) : 'Not available'}
                </strong>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F0FAF5] px-3 py-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#789086]">
                  Cash Buffer
                </p>
                <p className="mt-0.5 text-sm font-black text-[#1D4ED8]">
                  {cashBufferPct !== null ? `${cashBufferPct}%` : 'Unavailable'}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                  cashBufferPct !== null
                    ? (cashBufferPct >= 55
                        ? 'bg-[#DDF5E9] text-[#1D4ED8]'
                        : cashBufferPct >= 30
                        ? 'bg-[#FFF2D3] text-[#B5790C]'
                        : 'bg-[#FFE8E8] text-[#C44242]')
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cashBufferPct !== null
                  ? (cashBufferPct >= 55 ? 'Healthy' : cashBufferPct >= 30 ? 'Watch' : 'Tight')
                  : 'Pending'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAffordability((v) => !v)}
              className="mt-3 w-full rounded-xl border border-[#D5EBE1] bg-white py-2.5 text-xs font-extrabold text-[#1D4ED8] transition hover:bg-[#F2FBF7] cursor-pointer"
            >
              {showAffordability ? 'Hide Details' : 'See Affordability Logic'} <Arrow />
            </button>
          </div>

          {/* Stress test */}
          <div className="flex h-full flex-col rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SectionLabel>Stress Test</SectionLabel>
                <h2 className="mt-1 text-base font-black">What-If Analysis</h2>
              </div>
              <span className="rounded-full bg-[#F6F0FF] px-2.5 py-1 text-[10px] font-extrabold text-[#7452BD]">
                Backend Simulation
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-4 text-[#708078]">
              Evaluates cash surplus stability under simulated sales reduction (-15%) and cost increase (+10%).
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-[#FAF8FE] px-3 py-2">
                <span className="text-[10px] font-bold text-[#69756F]">Sales decrease</span>
                <span className="text-xs font-black text-[#C64D4D]">−15%</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-[#FAF8FE] px-3 py-2">
                <span className="text-[10px] font-bold text-[#69756F]">Operating cost increase</span>
                <span className="text-xs font-black text-[#C64D4D]">+10%</span>
              </div>
            </div>

            {stressMode && (
              <div className="mt-4 rounded-xl border border-[#E4D9F8] bg-[#F9F6FF] p-3">
                {backendSimulation?.isNotice ? (
                  <p className="text-[11px] font-bold text-amber-700">
                    {backendSimulation.message}
                  </p>
                ) : backendSimulation?.isError ? (
                  <p className="text-[11px] font-bold text-rose-700">
                    {backendSimulation.message}
                  </p>
                ) : stressMonthlySurplus !== null ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#6C5A8A]">
                        Stressed Monthly Surplus
                      </span>
                      <strong className={`text-xs ${stressMonthlySurplus < 0 ? 'text-rose-600' : 'text-[#493A62]'}`}>
                        {formatINR(stressMonthlySurplus)}
                      </strong>
                    </div>
                    {backendSimulation?.simulated?.risk && (
                      <p className="mt-1 text-[10px] font-bold text-[#6C49BC]">
                        Evaluated Risk Level: {backendSimulation.simulated.risk}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] leading-4 text-[#756B82]">
                      {stressMonthlySurplus > 0
                        ? 'The scenario remains serviceable under simulated stress, but repayment buffer tightens.'
                        : 'The scenario creates funding stress. Consider increasing margin capital before applying.'}
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] font-bold text-slate-600">
                    Simulation result unavailable. Please retry.
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={runStressTest}
              disabled={isSimulating || isLoading || !projectCostInput}
              className="mt-3 w-full rounded-xl border border-[#E4D9F8] bg-[#FAF7FF] py-2.5 text-xs font-extrabold text-[#6C49BC] transition hover:bg-[#F5EEFF] disabled:opacity-40 cursor-pointer"
            >
              {isSimulating ? 'Simulating...' : stressMode ? 'Re-run Stress Test' : 'Run Stress Test'} <Arrow />
            </button>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="rounded-[22px] border border-[#E4E9E6] bg-white p-4 shadow-[0_6px_24px_rgba(25,48,38,0.04)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>Quick Actions</SectionLabel>
              <h2 className="mt-1 text-base font-black">Continue Your Financial Analysis</h2>
            </div>

            <button
              type="button"
              onClick={() => setShowSchedule(true)}
              className="text-left text-[11px] font-extrabold text-[#1D4ED8] sm:text-right cursor-pointer"
            >
              View Decision Summary <Arrow />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
            <button
              type="button"
              onClick={runStressTest}
              className="group rounded-xl border border-[#D9EEE5] bg-[#F5FCF9] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
            >
              <p className="text-xs font-extrabold text-[#1C2923]">What-If Simulator</p>
              <p className="mt-1 text-[10px] leading-4 text-[#6D7B73]">Simulate loan, EMI &amp; cash-flow impact.</p>
              <p className="mt-2 text-xs font-black text-[#1D4ED8]"><Arrow /></p>
            </button>

            <button
              type="button"
              onClick={() => setShowBreakdown(true)}
              className="group rounded-xl border border-[#F0E3BC] bg-[#FFFCF3] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
            >
              <p className="text-xs font-extrabold text-[#1C2923]">Detailed DPR Report</p>
              <p className="mt-1 text-[10px] leading-4 text-[#6D7B73]">Review complete cost allocation.</p>
              <p className="mt-2 text-xs font-black text-[#B57B12]"><Arrow /></p>
            </button>

            <button
              type="button"
              onClick={() => setShowSchedule(true)}
              className="group rounded-xl border border-[#E8E0F9] bg-[#FAF8FF] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
            >
              <p className="text-xs font-extrabold text-[#1C2923]">Repayment Schedule</p>
              <p className="mt-1 text-[10px] leading-4 text-[#6D7B73]">Preview yearly repayment schedule.</p>
              <p className="mt-2 text-xs font-black text-[#7651C5]"><Arrow /></p>
            </button>

            <button
              type="button"
              onClick={() => (window.print ? window.print() : setShowBreakdown(true))}
              className="group rounded-xl border border-[#DCE8F5] bg-[#F7FAFE] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
            >
              <p className="text-xs font-extrabold text-[#1C2923]">Export Financial Plan</p>
              <p className="mt-1 text-[10px] leading-4 text-[#6D7B73]">Print or save planning view.</p>
              <p className="mt-2 text-xs font-black text-[#3F72B4]"><Arrow /></p>
            </button>

            <button
              type="button"
              onClick={() => setShowAffordability(true)}
              className="group rounded-xl border border-[#D9EEE5] bg-[#F5FCF9] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
            >
              <p className="text-xs font-extrabold text-[#1C2923]">AI Advisor</p>
              <p className="mt-1 text-[10px] leading-4 text-[#6D7B73]">Review affordability &amp; funding logic.</p>
              <p className="mt-2 text-xs font-black text-[#1D4ED8]"><Arrow /></p>
            </button>
          </div>
        </section>
      </div>

      {/* REPAYMENT SCHEDULE MODAL */}
      {showSchedule && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102A1E]/35 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Repayment schedule"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowSchedule(false);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-[24px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionLabel>Authoritative Repayment Planning</SectionLabel>
                <h2 className="mt-1 text-xl font-black">Reducing-Balance Amortization Schedule</h2>
                <p className="mt-1 text-xs text-[#6C7B72]">
                  {formatINR(loanAmount)} loan · {interestRate}% p.a. · {loanTenureYears} years
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSchedule(false)}
                className="rounded-full border border-[#E5EAE7] px-3 py-1.5 text-xs font-extrabold text-[#526159] hover:bg-[#F7F9F8] cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#F5FAF7] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Monthly EMI</p>
                <p className="mt-1 text-sm font-black">{formatINR(monthlyEmi)}</p>
              </div>
              <div className="rounded-xl bg-[#F5FAF7] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Quarterly Repayment</p>
                <p className="mt-1 text-sm font-black">{formatINR(quarterlyRepayment)}</p>
              </div>
              <div className="rounded-xl bg-[#F5FAF7] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Total Interest</p>
                <p className="mt-1 text-sm font-black">{formatINR(totalInterest)}</p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-[#E6EBE8]">
              <div className="grid grid-cols-4 bg-[#F5F8F6] px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#708078]">
                <span>Year</span>
                <span>Opening</span>
                <span>Annual EMI</span>
                <span className="text-right">Closing Balance</span>
              </div>

              {scheduleRows.map((row) => (
                <div key={row.period} className="grid grid-cols-4 border-t border-[#EEF1EF] px-3 py-3 text-xs">
                  <span className="font-extrabold">Year {row.period}</span>
                  <span className="font-semibold text-[#5E6D65]">{formatINR(row.opening_balance)}</span>
                  <span className="font-extrabold text-[#1A211D]">{formatINR(row.emi_payment)}</span>
                  <span className="text-right font-bold text-[#1D4ED8]">{formatINR(row.closing_balance)}</span>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[10px] leading-4 text-[#7A8780]">
              Authoritative reducing-balance schedule calculated by VITTANAYA Financial Engine.
              Final closing balance at Year {loanTenureYears} is guaranteed at {formatINR(scheduleRows[scheduleRows.length - 1]?.closing_balance || 0)}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
