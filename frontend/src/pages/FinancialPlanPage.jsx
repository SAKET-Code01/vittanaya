import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * FinancialPlanPage
 * ------------------------------------------------------------
 * Premium but spacious Financial Plan screen.
 *
 * Keeps the existing VITTANAYA structure and adds:
 * - KPI helper actions
 * - Interactive financial simulator
 * - Live financial impact strip
 * - DPR cost breakdown with visual bars
 * - VITTANAYA recommendation
 * - Affordability check
 * - What-if stress test
 * - Repayment schedule preview
 * - Quick actions
 *
 * No new package is required.
 */

const formatINR = (value) => `₹ ${Math.round(value).toLocaleString('en-IN')}`;

const Icon = ({ children, className = '' }) => (
  <span
    aria-hidden="true"
    className={`inline-flex items-center justify-center ${className}`}
  >
    {children}
  </span>
);

const Arrow = () => <span aria-hidden="true">→</span>;

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#00966C]">
    {children}
  </p>
);

const SmallAction = ({ children, onClick, tone = 'green' }) => {
  const toneClass =
    tone === 'amber'
      ? 'text-[#C88913] hover:bg-[#FFF9EA]'
      : 'text-[#087E5B] hover:bg-[#F0FBF6]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-colors ${toneClass}`}
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
}) => (
  <div>
    <div className="mb-2 flex items-center justify-between gap-4">
      <span className="text-xs font-bold text-[#607267]">{label}</span>
      <span className="whitespace-nowrap text-xs font-extrabold text-[#18211D]">
        {displayValue ?? value}
      </span>
    </div>

    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full cursor-pointer ${
        tone === 'amber' ? 'accent-[#D4A343]' : 'accent-[#17875F]'
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
      : 'bg-[#EDF9F3] text-[#11865E]';

  const valueClass =
    accent === 'amber'
      ? 'text-[#D49A27]'
      : accent === 'purple'
      ? 'text-[#6C49BC]'
      : 'text-[#18211D]';

  return (
    <div className="group flex h-full flex-col rounded-[22px] border border-[#E6EAE7] bg-white p-4 shadow-[0_6px_24px_rgba(25,48,38,0.045)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(25,48,38,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${iconClass}`}
        >
          <Icon>{icon}</Icon>
        </div>

        {action}
      </div>

      <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#738278]">
        {label}
      </p>

      <p className={`mt-0.5 text-[22px] font-black tracking-tight ${valueClass}`}>
        {value}
      </p>

      <p className="mt-auto pt-2 text-[11px] font-semibold text-[#607267]">
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

  const [projectCostInput, setProjectCostInput] = useState(1000000);
  const [marginPct, setMarginPct] = useState(10);
  const [loanTenureYears, setLoanTenureYears] = useState(7);
  const [interestRate, setInterestRate] = useState(8.5);

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showMarginReason, setShowMarginReason] = useState(false);
  const [showLoanCalculation, setShowLoanCalculation] = useState(false);
  const [showAffordability, setShowAffordability] = useState(false);
  const [showStressTest, setShowStressTest] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [stressMode, setStressMode] = useState(false);

  const navigateBack = onNavigateHome || (() => window.history.back());

  const financials = useMemo(() => {
    const ownMarginCapital = Math.round((projectCostInput * marginPct) / 100);
    const loanAmount = Math.max(projectCostInput - ownMarginCapital, 0);
    const totalMonths = loanTenureYears * 12;
    const monthlyRate = interestRate / 100 / 12;

    const monthlyEmi =
      loanAmount === 0
        ? 0
        : Math.round(
            (loanAmount *
              monthlyRate *
              Math.pow(1 + monthlyRate, totalMonths)) /
              (Math.pow(1 + monthlyRate, totalMonths) - 1)
          );

    const quarterlyRepayment = monthlyEmi * 3;

    // Simple planning proxies for the screen.
    // They are intentionally labelled as estimates/proxies rather than
    // pretending to be a bank underwriting decision.
    const estimatedMonthlySurplus = Math.max(
      Math.round(projectCostInput * 0.052),
      0
    );
    const afterEmi = Math.max(estimatedMonthlySurplus - monthlyEmi, 0);
    const cashBufferPct =
      estimatedMonthlySurplus > 0
        ? Math.round((afterEmi / estimatedMonthlySurplus) * 100)
        : 0;

    const stressMonthlySurplus = Math.max(
      Math.round(estimatedMonthlySurplus * 0.72 - monthlyEmi * 1.1),
      0
    );

    return {
      ownMarginCapital,
      loanAmount,
      totalMonths,
      monthlyEmi,
      quarterlyRepayment,
      estimatedMonthlySurplus,
      afterEmi,
      cashBufferPct,
      stressMonthlySurplus,
    };
  }, [projectCostInput, marginPct, loanTenureYears, interestRate]);

  const {
    ownMarginCapital,
    loanAmount,
    totalMonths,
    monthlyEmi,
    quarterlyRepayment,
    estimatedMonthlySurplus,
    afterEmi,
    cashBufferPct,
    stressMonthlySurplus,
  } = financials;

  const costItems = [
    {
      name: 'Plant & Core Machinery',
      pct: 55,
      amount: Math.round(projectCostInput * 0.55),
    },
    {
      name: 'Premises & Electrical Fitments',
      pct: 15,
      amount: Math.round(projectCostInput * 0.15),
    },
    {
      name: 'Working Capital (Raw Material & Payroll)',
      pct: 20,
      amount: Math.round(projectCostInput * 0.2),
    },
    {
      name: 'Pre-operative & Contingency Buffer',
      pct: 10,
      amount: Math.round(projectCostInput * 0.1),
    },
  ];

  const scheduleRows = [1, 2, 3, 4, 5, 6].map((year) => ({
    year,
    opening: Math.max(
      Math.round(
        loanAmount * Math.pow(1 - year / Math.max(loanTenureYears, 1), 1.12)
      ),
      0
    ),
    payment: quarterlyRepayment * 4,
  }));

  const runStressTest = () => {
    setStressMode(true);
    setShowStressTest(true);
  };

  return (
    <div className="w-full bg-[#F7F9F8] pb-12 pt-1 text-[#18211D]">
      <div className="space-y-5">
        {/* -------------------------------------------------------
            PAGE HEADER
        -------------------------------------------------------- */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-[#607267]">
              <button
                type="button"
                onClick={navigateBack}
                className="transition-colors hover:text-[#102A1E]"
              >
                Dashboard
              </button>
              <span>/</span>
              <span className="font-extrabold text-[#18211D]">
                Financial Plan
              </span>
            </div>

            <h1 className="text-[26px] font-black tracking-tight text-[#17201C] sm:text-[30px]">
              Financial Structuring &amp; Capital Allocation
            </h1>

            <p className="mt-1 max-w-3xl text-xs leading-5 text-[#607267] sm:text-sm">
              DPR-ready Capex, Margin capital, and Working capital models for{' '}
              <strong>
                {currentProfile?.name || 'Your Enterprise'}
              </strong>{' '}
              in {currentProfile?.location || 'India'}.
            </p>
          </div>

          <button
            type="button"
            onClick={navigateBack}
            className="self-start rounded-full border border-[#E4E9E6] bg-white px-4 py-2 text-xs font-extrabold text-[#26332D] shadow-sm transition hover:bg-[#F8FAF9] xl:self-auto"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* -------------------------------------------------------
            TOP KPIs
        -------------------------------------------------------- */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 items-stretch">
          <KpiCard
            icon="◔"
            label="Project Cost"
            value={formatINR(projectCostInput)}
            subtitle="Total CapEx + Initial Working Capital"
            action={
              <SmallAction
                onClick={() => setShowBreakdown((v) => !v)}
              >
                {showBreakdown ? 'Hide' : 'View Breakdown'} <Arrow />
              </SmallAction>
            }
          />

          <KpiCard
            icon="♙"
            label="Own Margin Capital"
            value={formatINR(ownMarginCapital)}
            subtitle={`${marginPct}% Promoter Equity Contribution`}
            accent="amber"
            action={
              <SmallAction
                tone="amber"
                onClick={() => setShowMarginReason((v) => !v)}
              >
                Why {marginPct}%? <Arrow />
              </SmallAction>
            }
          />

          <KpiCard
            icon="▥"
            label="Maximum Loan Amount"
            value={formatINR(loanAmount)}
            subtitle={`${100 - marginPct}% Bank Financed`}
            action={
              <SmallAction
                onClick={() => setShowLoanCalculation((v) => !v)}
              >
                How calculated? <Arrow />
              </SmallAction>
            }
          />

          <KpiCard
            icon="▣"
            label="Quarterly Repayment"
            value={formatINR(quarterlyRepayment)}
            subtitle={`${formatINR(monthlyEmi)} / mo · ${loanTenureYears}-Yr Tenure`}
            action={
              <SmallAction
                onClick={() => setShowAffordability((v) => !v)}
              >
                Affordability <Arrow />
              </SmallAction>
            }
          />
        </section>

        {/* Small contextual helper panels — only appear when requested */}
        {(showBreakdown ||
          showMarginReason ||
          showLoanCalculation ||
          showAffordability) && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {showBreakdown && (
              <div className="rounded-2xl border border-[#DCECE4] bg-[#F2FBF7] p-4">
                <p className="text-xs font-extrabold text-[#087E5B]">
                  Project cost logic
                </p>
                <p className="mt-1 text-xs leading-5 text-[#607267]">
                  The current project cost is treated as the full capital
                  requirement. The DPR allocation below divides it into
                  machinery, premises, working capital, and contingency.
                </p>
              </div>
            )}

            {showMarginReason && (
              <div className="rounded-2xl border border-[#F1E4BF] bg-[#FFFBF0] p-4">
                <p className="text-xs font-extrabold text-[#B77A0A]">
                  Why promoter contribution matters
                </p>
                <p className="mt-1 text-xs leading-5 text-[#607267]">
                  A higher own contribution reduces the loan requirement and
                  therefore lowers the monthly repayment burden. Use the slider
                  to compare structures before finalising the DPR.
                </p>
              </div>
            )}

            {showLoanCalculation && (
              <div className="rounded-2xl border border-[#DCECE4] bg-[#F8FBFA] p-4">
                <p className="text-xs font-extrabold text-[#087E5B]">
                  Loan calculation
                </p>
                <p className="mt-1 text-xs leading-5 text-[#607267]">
                  Maximum loan = Project Cost − Own Margin Capital ={' '}
                  <strong>
                    {formatINR(projectCostInput)} −{' '}
                    {formatINR(ownMarginCapital)}
                  </strong>{' '}
                  = <strong>{formatINR(loanAmount)}</strong>.
                </p>
              </div>
            )}

            {showAffordability && (
              <div className="rounded-2xl border border-[#DCECE4] bg-[#F2FBF7] p-4">
                <p className="text-xs font-extrabold text-[#087E5B]">
                  Affordability estimate
                </p>
                <p className="mt-1 text-xs leading-5 text-[#607267]">
                  Estimated monthly surplus is{' '}
                  <strong>{formatINR(estimatedMonthlySurplus)}</strong>.
                  After the estimated EMI, the planning buffer is{' '}
                  <strong>{formatINR(afterEmi)}</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------
            MAIN SIMULATOR
        -------------------------------------------------------- */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12 items-stretch">
          {/* Controls */}
          <div className="flex flex-col h-full rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.045)] xl:col-span-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionLabel>Simulation</SectionLabel>
                <h2 className="mt-1 text-lg font-black">
                  Interactive Financial Parameters
                </h2>
                <p className="mt-1 text-xs text-[#738278]">
                  Change an assumption and the funding structure updates
                  instantly.
                </p>
              </div>

              <button
                type="button"
                onClick={runStressTest}
                className="hidden shrink-0 rounded-full border border-[#DDECE5] bg-[#F3FBF7] px-3 py-2 text-[11px] font-extrabold text-[#087E5B] transition hover:bg-[#EAF8F1] sm:block"
              >
                Run Stress Test <Arrow />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <SliderRow
                label="Total Project Cost"
                value={projectCostInput}
                displayValue={formatINR(projectCostInput)}
                min={200000}
                max={5000000}
                step={50000}
                onChange={setProjectCostInput}
              />

              <SliderRow
                label="Promoter Margin Contribution"
                value={marginPct}
                displayValue={`${marginPct}% (${formatINR(
                  ownMarginCapital
                )})`}
                min={5}
                max={25}
                step={1}
                onChange={setMarginPct}
                tone="amber"
              />

              <SliderRow
                label="Loan Amortization Tenure"
                value={loanTenureYears}
                displayValue={`${loanTenureYears} Years`}
                min={3}
                max={10}
                step={1}
                onChange={setLoanTenureYears}
              />

              <SliderRow
                label="Bank Interest Rate (p.a.)"
                value={interestRate}
                displayValue={`${interestRate}%`}
                min={6.5}
                max={12}
                step={0.25}
                onChange={setInterestRate}
              />
            </div>

            {/* Live impact */}
            <div className="mt-6 rounded-2xl border border-[#E2EEE8] bg-[#F7FBF9] p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E7F6EF] text-lg text-[#0B8B61]">
                  <Icon>⌁</Icon>
                </div>

                <div>
                  <p className="text-xs font-extrabold text-[#1C2923]">
                    Live financial impact
                  </p>
                  <p className="text-[10px] text-[#708078]">
                    Based on current simulator inputs
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
                    Estimated EMI
                  </p>
                  <p className="mt-1 text-xs font-black">
                    {formatINR(monthlyEmi)} / mo
                  </p>
                </div>

                <div className="border-r border-[#DCE6E1] px-2 last:border-r-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#83928A]">
                    Cash Buffer
                  </p>
                  <p className="mt-1 text-xs font-black">{formatINR(afterEmi)} / mo</p>
                </div>

                <div className="px-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#83928A]">
                    Risk Level
                  </p>
                  <p className="mt-1 text-xs font-black text-[#087E5B]">
                    {cashBufferPct >= 55 ? 'LOW' : cashBufferPct >= 30 ? 'MEDIUM' : 'HIGH'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={runStressTest}
              className="mt-3 w-full rounded-xl border border-[#DDECE5] bg-white py-2.5 text-xs font-extrabold text-[#087E5B] transition hover:bg-[#F3FBF7] sm:hidden"
            >
              Run Stress Test <Arrow />
            </button>
          </div>

          {/* DPR breakdown */}
          <div className="flex flex-col h-full rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.045)] xl:col-span-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionLabel>Capital Allocation</SectionLabel>
                <h2 className="mt-1 text-lg font-black">
                  Project Cost Breakdown
                </h2>
                <p className="mt-1 text-xs text-[#738278]">
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

            <div className="mt-auto flex items-center justify-between border-t border-[#E6EAE7] pt-4">
              <span className="text-sm font-black">Total Capital Required</span>
              <span className="text-sm font-black text-[#087E5B]">
                {formatINR(projectCostInput)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowSchedule(true)}
              className="mt-3 w-full rounded-xl border border-[#CDEBDD] bg-[#F4FCF8] py-2.5 text-xs font-extrabold text-[#087E5B] transition hover:bg-[#ECFAF3]"
            >
              View Repayment Schedule <Arrow />
            </button>
          </div>
        </section>

        {/* -------------------------------------------------------
            INSIGHT ROW
        -------------------------------------------------------- */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 items-stretch">
          {/* Recommendation */}
          <div className="flex h-full flex-col rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.04)]">
            <SectionLabel>VITTANAYA Recommends</SectionLabel>
            <h2 className="mt-1 text-base font-black">
              A balanced funding structure
            </h2>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between rounded-xl bg-[#F7FAF8] px-3 py-2.5">
                <span className="text-xs font-bold text-[#4D5D54]">
                  Own Margin Capital
                </span>
                <span className="text-xs font-black">
                  {formatINR(ownMarginCapital)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F7FAF8] px-3 py-2.5">
                <span className="text-xs font-bold text-[#4D5D54]">
                  Bank Loan
                </span>
                <span className="text-xs font-black">
                  {formatINR(loanAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F7FAF8] px-3 py-2.5">
                <span className="text-xs font-bold text-[#4D5D54]">
                  Estimated EMI
                </span>
                <span className="text-xs font-black">
                  {formatINR(monthlyEmi)} / month
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#EFFAF5] p-3">
              <p className="text-[11px] font-extrabold text-[#087E5B]">
                Suggested starting point
              </p>
              <p className="mt-1 text-[10px] leading-4 text-[#607267]">
                Keep enough promoter contribution to protect the monthly
                repayment buffer while retaining working capital.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMarginPct(Math.min(marginPct + 5, 25))}
              className="mt-3 w-full rounded-xl bg-[#079B6B] py-2.5 text-xs font-extrabold text-white transition hover:bg-[#078C62]"
            >
              Compare Healthier Structure <Arrow />
            </button>
          </div>

          {/* Affordability */}
          <div className="flex h-full flex-col rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.04)]">
            <SectionLabel>Can I Afford This?</SectionLabel>
            <h2 className="mt-1 text-base font-black">
              Monthly repayment comfort
            </h2>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#EEF1EF] pb-2.5">
                <span className="font-semibold text-[#5F7066]">
                  Monthly Surplus (Est.)
                </span>
                <strong>{formatINR(estimatedMonthlySurplus)}</strong>
              </div>

              <div className="flex justify-between border-b border-[#EEF1EF] pb-2.5">
                <span className="font-semibold text-[#5F7066]">
                  Estimated EMI
                </span>
                <strong>{formatINR(monthlyEmi)}</strong>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-[#5F7066]">After EMI</span>
                <strong>{formatINR(afterEmi)}</strong>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F0FAF5] px-3 py-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#789086]">
                  Cash Buffer
                </p>
                <p className="mt-0.5 text-sm font-black text-[#087E5B]">
                  {cashBufferPct}%
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                  cashBufferPct >= 55
                    ? 'bg-[#DDF5E9] text-[#087E5B]'
                    : cashBufferPct >= 30
                    ? 'bg-[#FFF2D3] text-[#B5790C]'
                    : 'bg-[#FFE8E8] text-[#C44242]'
                }`}
              >
                {cashBufferPct >= 55
                  ? 'Healthy'
                  : cashBufferPct >= 30
                  ? 'Watch'
                  : 'Tight'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAffordability((v) => !v)}
              className="mt-3 w-full rounded-xl border border-[#D5EBE1] bg-white py-2.5 text-xs font-extrabold text-[#087E5B] transition hover:bg-[#F2FBF7]"
            >
              {showAffordability ? 'Hide Details' : 'See Affordability Logic'}{' '}
              <Arrow />
            </button>
          </div>

          {/* Stress test */}
          <div className="flex h-full flex-col rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SectionLabel>Stress Test</SectionLabel>
                <h2 className="mt-1 text-base font-black">
                  What-if Analysis
                </h2>
              </div>

              <span className="rounded-full bg-[#F6F0FF] px-2.5 py-1 text-[10px] font-extrabold text-[#7452BD]">
                Scenario
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-4 text-[#708078]">
              Test how the structure behaves if sales fall and operating costs
              rise.
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-[#FAF8FE] px-3 py-2">
                <span className="text-[10px] font-bold text-[#69756F]">
                  Sales decrease
                </span>
                <span className="text-xs font-black text-[#C64D4D]">−15%</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-[#FAF8FE] px-3 py-2">
                <span className="text-[10px] font-bold text-[#69756F]">
                  Costs increase
                </span>
                <span className="text-xs font-black text-[#C64D4D]">+10%</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-[#FAF8FE] px-3 py-2">
                <span className="text-[10px] font-bold text-[#69756F]">
                  Interest rate
                </span>
                <span className="text-xs font-black text-[#C64D4D]">+1%</span>
              </div>
            </div>

            {showStressTest && (
              <div className="mt-3 rounded-xl bg-[#F7F2FF] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-[#6C5A8A]">
                    Stress monthly surplus
                  </span>
                  <strong className="text-xs text-[#493A62]">
                    {formatINR(stressMonthlySurplus)}
                  </strong>
                </div>
                <p className="mt-1 text-[10px] leading-4 text-[#756B82]">
                  {stressMonthlySurplus > 0
                    ? 'The scenario remains serviceable, but the repayment buffer becomes tighter.'
                    : 'The scenario creates a funding pressure and should be reviewed before proceeding.'}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={runStressTest}
              className="mt-3 w-full rounded-xl border border-[#E4D9F8] bg-[#FAF7FF] py-2.5 text-xs font-extrabold text-[#6C49BC] transition hover:bg-[#F5EEFF]"
            >
              {stressMode ? 'Re-run Stress Test' : 'Run Stress Test'}{' '}
              <Arrow />
            </button>
          </div>
        </section>

        {/* -------------------------------------------------------
            QUICK ACTIONS
        -------------------------------------------------------- */}
        <section className="rounded-[22px] border border-[#E4E9E6] bg-white p-4 shadow-[0_6px_24px_rgba(25,48,38,0.04)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>Quick Actions</SectionLabel>
              <h2 className="mt-1 text-base font-black">
                Continue your financial analysis
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowSchedule(true)}
              className="text-left text-[11px] font-extrabold text-[#087E5B] sm:text-right"
            >
              View Decision Summary <Arrow />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
            <button
              type="button"
              onClick={runStressTest}
              className="group rounded-xl border border-[#D9EEE5] bg-[#F5FCF9] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="text-xs font-extrabold text-[#1C2923]">
                What-if Simulator
              </p>
              <p className="mt-1 text-[10px] leading-4 text-[#6D7B73]">
                Simulate loan, EMI &amp; cash-flow impact.
              </p>
              <p className="mt-2 text-xs font-black text-[#087E5B]">
                <Arrow />
              </p>
            </button>

            <button
              type="button"
              onClick={() => setShowBreakdown(true)}
              className="group rounded-xl border border-[#F0E3BC] bg-[#FFFCF3] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="text-xs font-extrabold text-[#1C2923]">
                Detailed DPR Report
              </p>
              <p className="mt-1 text-[10px] leading-4 text-[#6D7B73]">
                Review the complete cost allocation.
              </p>
              <p className="mt-2 text-xs font-black text-[#B57B12]">
                <Arrow />
              </p>
            </button>

            <button
              type="button"
              onClick={() => setShowSchedule(true)}
              className="group rounded-xl border border-[#E8E0F9] bg-[#FAF8FF] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="text-xs font-extrabold text-[#1C2923]">
                Repayment Schedule
              </p>
              <p className="mt-1 text-[10px] leading-4 text-[#6D7B73]">
                Preview yearly repayment planning.
              </p>
              <p className="mt-2 text-xs font-black text-[#7651C5]">
                <Arrow />
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                window.print ? window.print() : setShowBreakdown(true)
              }
              className="group rounded-xl border border-[#DCE8F5] bg-[#F7FAFE] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="text-xs font-extrabold text-[#1C2923]">
                Export Financial Plan
              </p>
              <p className="mt-1 text-[10px] leading-4 text-[#6D7B73]">
                Print or save this planning view.
              </p>
              <p className="mt-2 text-xs font-black text-[#3F72B4]">
                <Arrow />
              </p>
            </button>

            <button
              type="button"
              onClick={() => setShowAffordability(true)}
              className="group rounded-xl border border-[#D9EEE5] bg-[#F5FCF9] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="text-xs font-extrabold text-[#1C2923]">
                AI Advisor
              </p>
              <p className="mt-1 text-[10px] leading-4 text-[#6D7B73]">
                Review affordability and funding logic.
              </p>
              <p className="mt-2 text-xs font-black text-[#087E5B]">
                <Arrow />
              </p>
            </button>
          </div>
        </section>
      </div>

      {/* ---------------------------------------------------------
          REPAYMENT SCHEDULE MODAL
      ---------------------------------------------------------- */}
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
                <SectionLabel>Repayment Planning</SectionLabel>
                <h2 className="mt-1 text-xl font-black">
                  Estimated Repayment Schedule
                </h2>
                <p className="mt-1 text-xs text-[#6C7B72]">
                  {formatINR(loanAmount)} loan · {interestRate}% p.a. ·{' '}
                  {loanTenureYears} years
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSchedule(false)}
                className="rounded-full border border-[#E5EAE7] px-3 py-1.5 text-xs font-extrabold text-[#526159] hover:bg-[#F7F9F8]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#F5FAF7] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">
                  Monthly EMI
                </p>
                <p className="mt-1 text-sm font-black">{formatINR(monthlyEmi)}</p>
              </div>
              <div className="rounded-xl bg-[#F5FAF7] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">
                  Quarterly
                </p>
                <p className="mt-1 text-sm font-black">
                  {formatINR(quarterlyRepayment)}
                </p>
              </div>
              <div className="rounded-xl bg-[#F5FAF7] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">
                  Tenure
                </p>
                <p className="mt-1 text-sm font-black">{totalMonths} months</p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-[#E6EBE8]">
              <div className="grid grid-cols-3 bg-[#F5F8F6] px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#708078]">
                <span>Year</span>
                <span>Est. Outstanding</span>
                <span className="text-right">Annual Payment</span>
              </div>

              {scheduleRows.map((row) => (
                <div
                  key={row.year}
                  className="grid grid-cols-3 border-t border-[#EEF1EF] px-3 py-3 text-xs"
                >
                  <span className="font-extrabold">Year {row.year}</span>
                  <span className="font-semibold text-[#5E6D65]">
                    {formatINR(row.opening)}
                  </span>
                  <span className="text-right font-extrabold">
                    {formatINR(row.payment)}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[10px] leading-4 text-[#7A8780]">
              Planning estimate for the VITTANAYA interface. Final repayment
              terms depend on the lender, sanctioned amount, rate, fees, and
              actual amortisation schedule.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
