import React, { useEffect, useMemo, useState } from 'react';
import { CircularScoreGauge } from '../components/common/JapaneseArtwork';
import { useWorkspace } from '../context/WorkspaceContext';
import { formatINR } from '../mocks/dashboardMockData';
import { feasibilityService } from '../services/feasibilityService';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatMaybeText(value, fallback = 'Awaiting analysis') {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
}

function formatScore(value, max) {
  if (value === null || value === undefined) return 'Not available';
  return `${value} / ${max}`;
}

function statusTone(status) {
  const value = String(status || '').toLowerCase();
  if (value.includes('strong') || value.includes('healthy') || value.includes('complete') || value.includes('low')) return 'blue';
  if (value.includes('moderate') || value.includes('proxy') || value.includes('caution')) return 'amber';
  if (value.includes('high') || value.includes('critical') || value.includes('needs') || value.includes('risk')) return 'rose';
  return 'slate';
}

function TonePill({ tone = 'slate', children, className = '' }) {
  const styles = {
    emerald: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${styles[tone] || styles.slate} ${className}`}
    >
      {children}
    </span>
  );
}

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 border-b border-slate-100">
      <div className="space-y-1">
        {eyebrow && (
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">
            {eyebrow}
          </p>
        )}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function ModalShell({ isOpen, title, description, onClose, tone = 'blue', children, footer }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const accent = {
    emerald: 'border-blue-200 bg-blue-50 text-blue-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px] cursor-default"
        aria-label="Close modal overlay"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col animate-fadeIn">
        <div className={`px-5 sm:px-6 py-4 border-b flex items-start justify-between gap-4 ${accent[tone] || accent.slate}`}>
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] opacity-80">
              VITTANAYA ANALYSIS
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h3>
            {description && <p className="text-xs text-slate-600">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/70 hover:bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {children}
        </div>
        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/70">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function DataRow({ label, value, note, valueClassName = '', fallback = 'Not available' }) {
  const displayValue = value === null || value === undefined || value === '' ? fallback : value;

  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        {note && <p className="text-[11px] text-slate-500">{note}</p>}
      </div>
      <div className={`text-right text-xs font-bold text-slate-900 ${valueClassName}`}>
        {displayValue}
      </div>
    </div>
  );
}

function EvidenceRow({ signal, evidence, confidence, source }) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="py-3 pr-4 align-top">
        <div className="text-sm font-bold text-slate-900">{signal}</div>
      </td>
      <td className="py-3 pr-4 align-top text-xs text-slate-600 leading-relaxed">{evidence}</td>
      <td className="py-3 pr-4 align-top text-xs font-bold text-slate-900">{confidence}</td>
      <td className="py-3 align-top text-xs text-slate-500">{source || 'Not available'}</td>
    </tr>
  );
}

function FeasibilityPage({ currentProfile: propProfile, onNavigateHome }) {
  const {
    currentProfile: contextProfile,
    financialSummary,
    isDemoMode,
    setActiveNavId,
  } = useWorkspace();

  const profile = propProfile || contextProfile || {};
  const selectedOps = profile.selectedOperations || [];
  const businessName = profile.businessName || profile.name || 'Your Enterprise';
  const businessLocation =
    profile.location ||
    [profile.village, profile.district, profile.state].filter(Boolean).join(', ') ||
    'Awaiting analysis';
  const catchmentLabel = businessLocation === 'Awaiting analysis'
    ? 'Awaiting analysis'
    : isDemoMode
      ? '0-15 km analysis window'
      : '5-15 km analysis window';
  const hasDetailedLocation = Boolean(profile.village || profile.district || profile.state);
  const hasLocation = Boolean(profile.location || hasDetailedLocation);

  const navigateHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    if (setActiveNavId) setActiveNavId('dashboard');
  };

  const navigateTo = (navId) => {
    if (setActiveNavId) {
      setActiveNavId(navId);
      return;
    }
    if (navId === 'dashboard') navigateHome();
  };

  const financialHealth = typeof financialSummary?.health_score === 'number' ? financialSummary.health_score : null;
  const runwayDays = typeof financialSummary?.runway_days === 'number' ? financialSummary.runway_days : null;
  const liquidityGap = typeof financialSummary?.liquidity_gap === 'number' ? financialSummary.liquidity_gap : null;

  const [backendInsights, setBackendInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingInsights(true);
    setInsightsError(null);

    feasibilityService
      .getUnifiedInsights({
        available_margin_capital: Number(profile.ownCapital || profile.available_margin_capital || 50000),
        business_category: profile.category || profile.businessType || 'Retail',
        specific_business: profile.businessName || profile.name || 'General Enterprise',
        location: profile.district || profile.location || 'Odisha',
        social_category: profile.socialCategory || 'General',
        area_type: profile.areaType || 'Rural',
      })
      .then((data) => {
        if (isMounted) {
          setBackendInsights(data);
          setIsLoadingInsights(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Live backend feasibility insights notice:', err);
          setInsightsError(err.message || 'Backend service unreachable');
          setIsLoadingInsights(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    profile.ownCapital,
    profile.available_margin_capital,
    profile.category,
    profile.businessType,
    profile.businessName,
    profile.name,
    profile.district,
    profile.location,
    profile.socialCategory,
    profile.areaType,
  ]);

  const factorScores = useMemo(() => {
    const market = Math.min(
      30,
      (hasLocation ? 10 : 0) +
      (profile.category ? 6 : 0) +
      (selectedOps.length > 0 ? 6 : 0) +
      Math.min(8, selectedOps.length * 2)
    );

    const financial = financialHealth === null ? null : Math.min(25, Math.max(0, Math.round(financialHealth * 0.23)));

    const location = hasDetailedLocation
      ? 15
      : hasLocation
        ? 10
        : null;

    const competition = isDemoMode
      ? 9
      : hasLocation
        ? 8
        : null;

    const risk = financialHealth === null
      ? null
      : clamp(
          Math.round(
            15 -
            Math.max(0, (financialHealth - 55) / 6) -
            (liquidityGap && liquidityGap > 0 ? 2 : 0) -
            (runwayDays && runwayDays < 30 ? 2 : 0)
          ),
          6,
          15
        );

    const entries = [
      { key: 'market', score: market, max: 30 },
      { key: 'financial', score: financial, max: 25 },
      { key: 'location', score: location, max: 15 },
      { key: 'competition', score: competition, max: 15 },
      { key: 'risk', score: risk, max: 15 },
    ];

    const scored = entries.filter((entry) => typeof entry.score === 'number');
    const totalScore = scored.reduce((sum, entry) => sum + entry.score, 0);
    const totalMax = scored.reduce((sum, entry) => sum + entry.max, 0) || 1;
    const overall = Math.round((totalScore / totalMax) * 100);

    const evidenceCount = [
      profile.name,
      businessLocation !== 'Awaiting analysis',
      financialHealth !== null,
      selectedOps.length > 0,
      profile.description,
    ].filter(Boolean).length;

    const confidence = clamp(45 + evidenceCount * 9 + (hasDetailedLocation ? 4 : 0) + (isDemoMode ? 5 : 0), 45, 95);

    return {
      entries,
      overall,
      confidence,
    };
  }, [
    financialHealth,
    hasDetailedLocation,
    hasLocation,
    isDemoMode,
    liquidityGap,
    profile.category,
    profile.description,
    profile.name,
    runwayDays,
    selectedOps.length,
    businessLocation,
  ]);

  const overallScore = Math.round(backendInsights?.opportunity?.overall_opportunity_score ?? factorScores.overall);
  const isDataSufficient = backendInsights?.opportunity?.is_data_sufficient ?? true;
  const overallConfidence = factorScores.confidence;
  const factorBreakdown = factorScores.entries.filter((entry) => typeof entry.score === 'number');
  const factorCount = factorBreakdown.length;

  const dataUpdated = profile.lastUpdatedAt || profile.onboardingCompletedAt || null;
  const sourceCount = [
    profile.name,
        businessLocation !== 'Awaiting analysis',
    financialHealth !== null,
    selectedOps.length > 0,
    isDemoMode,
  ].filter(Boolean).length;
  const isEstablished = (profile?.stage || '').toUpperCase() === 'ESTABLISHED';

  const decisionLabel = useMemo(() => {
    if (isEstablished) {
      if (overallScore >= 70) return 'SUSTAINABLE — OPTIMIZATION RECOMMENDED';
      if (overallScore >= 55) return 'VIABLE COMMERCIAL OPERATION';
      return 'HEALTH AUDIT IN PROGRESS';
    }
    if (overallConfidence < 55) return 'DECISION PENDING DATA VALIDATION';
    if (overallScore >= 75 && overallConfidence >= 65) return 'PROCEED WITH CAUTION';
    if (overallScore >= 60) return 'REVIEW BEFORE PROCEEDING';
    return 'DECISION PENDING DATA VALIDATION';
  }, [isEstablished, overallConfidence, overallScore]);

  const feasibilityStatus =
    decisionLabel === 'SUSTAINABLE — OPTIMIZATION RECOMMENDED'
      ? 'Sustainable & Healthy'
      : decisionLabel === 'VIABLE COMMERCIAL OPERATION'
      ? 'Viable Commercial Operation'
      : decisionLabel === 'PROCEED WITH CAUTION'
      ? 'Proceed with caution'
      : decisionLabel === 'REVIEW BEFORE PROCEEDING'
        ? 'Review before proceeding'
        : 'Decision pending data validation';

  const hasConfidenceEvidence = sourceCount > 0;
  const confidenceDisplay = `${overallConfidence}%`;

  const marketFitScore = factorScores.entries.find((entry) => entry.key === 'market')?.score;
  const financialFitScore = factorScores.entries.find((entry) => entry.key === 'financial')?.score;
  const locationFitScore = factorScores.entries.find((entry) => entry.key === 'location')?.score;
  const competitionScore = factorScores.entries.find((entry) => entry.key === 'competition')?.score;
  const riskScore = factorScores.entries.find((entry) => entry.key === 'risk')?.score;

  const marketDemandLabel = marketFitScore !== null && marketFitScore >= 20
    ? 'HIGH'
    : marketFitScore !== null && marketFitScore >= 12
      ? 'MODERATE'
      : 'Awaiting analysis';
  const competitionLabel = competitionScore !== null && competitionScore >= 8
    ? isDemoMode ? 'MODERATE' : 'Proxy'
    : 'Not enough data';
  const riskLabel = riskScore !== null && riskScore <= 8
    ? 'LOW'
    : riskScore !== null && riskScore <= 12
      ? 'MODERATE'
      : 'HIGH';

  const marketSignals = useMemo(() => {
    const signals = [
      {
        signal: 'Business profile captured',
        evidence: profile.name ? `Business name: ${profile.name}` : 'Business name not recorded',
        confidence: profile.name ? 'High' : 'Low',
        source: 'Workspace profile',
      },
      {
        signal: 'Location context available',
        evidence: hasLocation ? businessLocation : 'Location evidence is missing',
        confidence: hasLocation ? 'High' : 'Low',
        source: 'Workspace profile',
      },
      {
        signal: 'Operational scope defined',
        evidence: selectedOps.length > 0 ? `${selectedOps.length} active operations are configured.` : 'No active operations are configured yet.',
        confidence: selectedOps.length > 0 ? 'Medium' : 'Low',
        source: 'Operations config',
      },
      {
        signal: 'Financial baseline loaded',
        evidence: financialHealth !== null ? `Health score is ${financialHealth}/100.` : 'Financial health summary not available.',
        confidence: financialHealth !== null ? 'Medium' : 'Low',
        source: 'Financial summary',
      },
    ];

    if (isDemoMode) {
      signals.push({
        signal: 'Demo mode sample context',
        evidence: 'Demo Mode is active, so sample feasibility signals may appear in the UI.',
        confidence: 'Medium',
        source: 'Demo mode',
      });
    }

    return signals;
  }, [businessLocation, financialHealth, hasLocation, isDemoMode, profile.name, selectedOps.length]);

  const riskFactors = useMemo(() => {
    const items = [];

    if (financialHealth !== null) {
      items.push({
        factor: 'Cash runway',
        severity: runwayDays !== null && runwayDays < 30 ? 'Medium' : 'Low',
        reason: runwayDays !== null ? `${runwayDays} day runway from current financial summary.` : 'Runway not available.',
        mitigation: 'Keep operating buffer above the current safety threshold.',
      });
    }

    if (liquidityGap !== null) {
      items.push({
        factor: 'Liquidity gap',
        severity: liquidityGap > 0 ? 'Medium' : 'Low',
        reason: liquidityGap > 0 ? `Gap of ${formatINR(liquidityGap)} is projected in the current summary.` : 'No liquidity gap detected in the summary.',
        mitigation: 'Preserve cash and monitor receivables collections.',
      });
    }

    if (selectedOps.length > 0) {
      items.push({
        factor: 'Operational complexity',
        severity: selectedOps.length >= 7 ? 'Medium' : 'Low',
        reason: `${selectedOps.length} active operations are configured in the workspace.`,
        mitigation: 'Review operation priorities and keep configuration tidy.',
      });
    }

    if (!hasLocation) {
      items.push({
        factor: 'Market evidence',
        severity: 'Medium',
        reason: 'Location analysis is incomplete, so market-side risk cannot be fully scored.',
        mitigation: 'Complete location inputs and open the market/feasibility view again.',
      });
    }

    return items;
  }, [financialHealth, hasLocation, liquidityGap, runwayDays, selectedOps.length]);

  const pricingComparison = useMemo(() => {
    if (isDemoMode) {
      return {
        yourPrice: '₹85',
        localAverage: '₹92',
        observedRange: '₹78 - ₹105',
        position: 'Competitive',
      };
    }
    return null;
  }, [isDemoMode]);

  const decisionReasons = useMemo(() => {
    const reasons = [];
    if (marketFitScore !== null && marketFitScore >= 20) reasons.push('Strong market signal');
    if (locationFitScore !== null && locationFitScore >= 10) reasons.push('Good location/connectivity context');
    if (competitionScore !== null && competitionScore >= 8) reasons.push(isDemoMode ? 'Manageable demo competition profile' : 'Competition remains a proxy signal');
    if (riskScore !== null && riskScore <= 12) reasons.push('Risk remains within a manageable band');
    if (financialHealth !== null && financialHealth >= 80) reasons.push('Healthy financial baseline');
    if (liquidityGap !== null && liquidityGap > 0) reasons.push('Financing gap requires attention');
    if (reasons.length === 0) reasons.push('Decision pending data validation');
    return reasons;
  }, [competitionScore, financialHealth, isDemoMode, liquidityGap, locationFitScore, marketFitScore, riskScore]);

  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    if (!activeModal) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setActiveModal(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal]);

  const feasibilityPrompt = useMemo(() => {
    return [
      `Explain this feasibility decision for ${businessName} in ${businessLocation}.`,
      `Overall score: ${overallScore}/100.`,
      `Confidence: ${overallConfidence}%.`,
      `Market fit: ${formatScore(marketFitScore, 30)}.`,
      `Financial fit: ${formatScore(financialFitScore, 25)}.`,
      `Location fit: ${formatScore(locationFitScore, 15)}.`,
      `Competition: ${formatMaybeText(competitionLabel)}.`,
      `Risk: ${formatScore(riskScore, 15)}.`,
    ].join(' ');
  }, [
    businessLocation,
    businessName,
    competitionLabel,
    financialFitScore,
    locationFitScore,
    marketFitScore,
    overallConfidence,
    overallScore,
    riskScore,
  ]);

  const openAIExplanation = () => {
    window.dispatchEvent(
      new CustomEvent('vittanaya-open-ai', {
        detail: {
          prompt: feasibilityPrompt,
        },
      })
    );
  };

  const backButton = (
    <button
      type="button"
      onClick={navigateHome}
      className="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
    >
      <span>← Back to Dashboard</span>
    </button>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-5 pb-12 text-slate-900">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span>Dashboard</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-700">Feasibility Module</span>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">
                  {isEstablished ? 'Enterprise Health & Sustainability Audit' : 'Business Decision Intelligence'}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                  {isEstablished ? 'Enterprise Sustainability & Business Health Audit' : 'Hyper-Local Business Feasibility Analysis'}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-3xl">
                  {isEstablished
                    ? `Operational viability, market positioning, and growth capacity for ${businessName} in ${businessLocation}`
                    : `5–10 km catchment assessment for ${businessName} in ${businessLocation}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TonePill tone="blue">{businessName}</TonePill>
            <TonePill tone="slate">{businessLocation}</TonePill>
            <TonePill tone="blue">Catchment: {catchmentLabel}</TonePill>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <span className="font-bold text-slate-600">Evidence Confidence</span>
              <span className="font-extrabold text-slate-900">
                {isDemoMode ? 'Demo' : confidenceDisplay}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <span className="font-bold text-slate-600">Data Updated</span>
              <span className="font-semibold text-slate-900">{formatMaybeText(dataUpdated)}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <span className="font-bold text-slate-600">Inputs</span>
              <span className="font-semibold text-slate-900">{sourceCount || 0}</span>
            </div>
            {isDemoMode && <TonePill tone="amber">Demo Mode data</TonePill>}
          </div>
        </div>

        <div className="flex flex-wrap xl:flex-col xl:items-end gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:shadow-md transition-all">
              <span>⇩</span><span>Download Report</span>
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md transition-all">
              <span>♡</span><span>Save Analysis</span>
            </button>
          </div>
          {backButton}
        </div>
      </div>

      {/* Main score + supporting cards */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-4 rounded-[26px] border border-blue-500/25 bg-gradient-to-br from-[#060D1D] via-[#0B1736] to-[#0A1128] p-5 sm:p-6 text-white shadow-[0_16px_40px_rgba(6,13,29,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(11,23,54,0.45)]">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-center gap-2 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-200/80">Overall Feasibility Index</p>
              <span className="text-xs text-blue-200/60" title="Composite feasibility score">ⓘ</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <CircularScoreGauge score={clamp(overallScore, 0, 100)} size={150} strokeWidth={10} stroke="#3B82F6" />
              <div className="mt-2 text-center">
                <div className="text-2xl sm:text-3xl font-black text-blue-400">
                  {overallScore >= 75 ? 'Good Potential' : overallScore >= 60 ? 'Review Required' : 'Needs Validation'}
                </div>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-blue-100/75">
                  Business fundamentals and available local evidence currently support this feasibility position.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-blue-200/60">Confidence</p>
                <p className="mt-1 text-sm font-extrabold text-white">{isDemoMode ? 'Demo' : confidenceDisplay}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-blue-200/60">Factors</p>
                <p className="mt-1 text-sm font-extrabold text-white">{factorCount}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal('score')}
              className="mt-3 inline-flex items-center justify-between rounded-2xl border border-blue-400/40 bg-blue-500/15 px-4 py-3 text-xs font-bold text-blue-200 hover:bg-blue-500/25 transition-all cursor-pointer"
            >
              <span>Why this score?</span><span>→</span>
            </button>
          </div>
        </div>

        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Market */}
          <div className="dash-card p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Market Fit</p>
                  <h2 className="mt-1 text-base font-bold text-slate-900">Demand and catchment</h2>
                </div>
                <TonePill tone="blue">{isDemoMode ? '92%' : formatScore(marketFitScore, 30)}</TonePill>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Demand</span>
                    <span className="text-sm font-extrabold text-blue-700">{marketDemandLabel}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${isDemoMode ? 92 : clamp((marketFitScore || 0) / 30 * 100, 0, 100)}%` }} />
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-500">
                  {isDemoMode
                    ? '12,450 consumer households in the demo catchment with a strong local-demand signal.'
                    : 'Demand insights will become richer as market evidence is connected.'}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setActiveModal('market')} className="mt-4 inline-flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors">
              <span>View Evidence</span><span>→</span>
            </button>
          </div>

          {/* Financial */}
          <div className="dash-card p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">Financial Fit</p>
                  <h2 className="mt-1 text-base font-bold text-slate-900">Capital and coverage</h2>
                </div>
                <TonePill tone="amber">{isDemoMode ? '81%' : (financialFitScore === null ? 'Pending' : formatScore(financialFitScore, 25))}</TonePill>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-3">
                <DataRow label="Project Cost" value={profile.projectCost ? formatINR(profile.projectCost) : null} />
                <DataRow label="Own Capital" value={profile.ownCapital || profile.available_margin_capital ? formatINR(profile.ownCapital || profile.available_margin_capital) : null} />
                <DataRow label="Loan Required" value={profile.projectCost && (profile.ownCapital || profile.available_margin_capital) ? formatINR(Math.max(0, Number(profile.projectCost) - Number(profile.ownCapital || profile.available_margin_capital))) : null} />
                <DataRow label="Coverage" value={financialHealth !== null ? `${financialHealth}/100 health` : null} />
              </div>
            </div>
            <button type="button" onClick={() => setActiveModal('financial')} className="mt-4 inline-flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors">
              <span>View Calculation</span><span>→</span>
            </button>
          </div>

          {/* Risk */}
          <div className="dash-card p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Risk Exposure</p>
                  <h2 className="mt-1 text-base font-bold text-slate-900">Operating risk profile</h2>
                </div>
                <TonePill tone={statusTone(riskLabel)}>{isDemoMode ? '18%' : riskLabel}</TonePill>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Risk Exposure</span>
                  <span className="text-sm font-extrabold text-slate-900">{isDemoMode ? '18 / 100' : (riskScore !== null ? `${riskScore} / 15` : 'Not available')}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Runway</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{runwayDays !== null ? `${runwayDays} days` : 'Not available'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Liquidity Gap</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{liquidityGap !== null ? formatINR(liquidityGap) : 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setActiveModal('risk')} className="mt-4 inline-flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors">
              <span>View Risk Factors</span><span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Strategy / market intelligence */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-7 dash-card p-5 sm:p-6 flex h-full flex-col transition-all duration-300 hover:shadow-lg">
          <SectionHeader
            eyebrow="Strategy"
            title="SWOT Analysis"
            description="A compact view of the business position; open the score/explanations for detail."
            action={
              <button type="button" onClick={() => setActiveModal('score')} className="text-xs font-bold text-blue-700 hover:text-blue-800">
                View Full SWOT →
              </button>
            }
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SWOTCard title="Strengths" tone="emerald" badge="S" items={[
              { label: 'Configured business profile', evidence: profile.name ? 'Workspace identity is captured.' : null },
              { label: 'Financial summary available', evidence: financialHealth !== null ? `${financialHealth}/100 health score present.` : null },
            ]} />
            <SWOTCard title="Weaknesses" tone="amber" badge="W" items={[
              { label: 'Competitor dataset', evidence: hasLocation ? 'Competition remains a proxy until connected.' : null },
              { label: 'Pricing evidence', evidence: isDemoMode ? 'Demo pricing context only.' : 'Pricing inputs not available yet.' },
            ]} />
            <SWOTCard title="Opportunities" tone="blue" badge="O" items={[
              { label: 'Financial simulation', evidence: 'Refine capital and loan decisions.', action: () => navigateTo('financial-plan') },
              { label: 'Scheme matching', evidence: 'Check available financing support.', action: () => navigateTo('scheme') },
            ]} />
            <SWOTCard title="Threats" tone="rose" badge="T" items={[
              { label: 'Liquidity pressure', evidence: liquidityGap !== null && liquidityGap > 0 ? `Gap of ${formatINR(liquidityGap)} visible.` : 'No current liquidity gap visible.' },
              { label: 'Competition uncertainty', evidence: hasLocation ? 'Competitive intensity needs a connected dataset.' : 'Location evidence incomplete.' },
            ]} />
          </div>

          {/* Recommended next steps */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Next Steps</p>
                <h3 className="mt-1 text-sm font-extrabold text-slate-900">Recommended Next Steps</h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Turn the current feasibility findings into practical actions.
                </p>
              </div>
              <TonePill tone="slate">3 actions</TonePill>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2.5">
              <RecommendedNextStep
                number="01"
                title={!hasLocation ? 'Complete market location inputs' : 'Validate local competition'}
                text={!hasLocation
                  ? 'Add the location details needed for stronger market evidence.'
                  : 'Connect competitor evidence before making a final market decision.'}
                onClick={hasLocation ? () => navigateTo('dashboard') : () => navigateTo('business')}
                cta={hasLocation ? 'Review Market' : 'Complete Profile'}
              />
              <RecommendedNextStep
                number="02"
                title="Optimize financing"
                text="Review capital, loan requirement and repayment assumptions before proceeding."
                onClick={() => navigateTo('financial-plan')}
                cta="Open Financial Plan"
              />
              <RecommendedNextStep
                number="03"
                title="Check eligible schemes"
                text="Review available financing support that may reduce the funding gap."
                onClick={() => navigateTo('scheme')}
                cta="View Schemes"
              />
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
          {/* Market position */}
          <div className="dash-card p-5 transition-all duration-300 hover:shadow-lg">
            <SectionHeader
              eyebrow="Market Position"
              title="Demand vs Competition"
              description="Top-left is the strongest zone: high demand with manageable competition."
            />
            {(() => {
              const demandScore = isDemoMode ? 82 : (typeof marketFitScore === 'number' ? clamp(Math.round((marketFitScore / 30) * 100), 0, 100) : null);
              const competitionPressure = isDemoMode ? 35 : (typeof competitionScore === 'number' ? clamp(100 - Math.round((competitionScore / 15) * 100), 0, 100) : null);
              const canPlot = demandScore !== null && competitionPressure !== null;
              const left = canPlot ? `${clamp(competitionPressure, 8, 92)}%` : '50%';
              const top = canPlot ? `${100 - clamp(demandScore, 8, 92)}%` : '50%';
              return (
                <div className="mt-4">
                  <div className="relative aspect-[1.65] rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                      <div className="bg-blue-50/70 border-r border-b border-slate-200 p-2"><span className="text-[9px] font-black uppercase tracking-widest text-blue-700">Best Opportunity</span></div>
                      <div className="bg-rose-50/55 border-b border-slate-200 p-2 text-right"><span className="text-[9px] font-black uppercase tracking-widest text-rose-600">Saturated</span></div>
                      <div className="bg-amber-50/45 border-r border-slate-200 p-2 flex items-end"><span className="text-[9px] font-black uppercase tracking-widest text-amber-700">Niche</span></div>
                      <div className="bg-slate-50 p-2 flex items-end justify-end"><span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Low Potential</span></div>
                    </div>
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300" />
                    <div className="absolute left-1/2 -translate-x-1/2 top-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">High Demand</div>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">Low Demand</div>
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-black uppercase tracking-widest text-slate-400">Low Competition</div>
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 rotate-90 text-[9px] font-black uppercase tracking-widest text-slate-400">High Competition</div>
                    {canPlot && (
                      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left, top }}>
                        <div className="relative">
                          <div className="absolute -inset-2 rounded-full bg-blue-400/20 animate-pulse" />
                          <div className="relative h-8 w-8 rounded-full bg-blue-600 border-4 border-white shadow-lg" />
                          <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-2 py-1 shadow-md">
                            <p className="text-[9px] font-black text-blue-700">YOUR BUSINESS</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Demand: <b className="text-slate-900">{canPlot ? `${demandScore}/100` : 'Awaiting'}</b></span>
                    <span>Competition pressure: <b className="text-slate-900">{canPlot ? `${competitionPressure}/100` : 'Awaiting'}</b></span>
                  </div>
                </div>
              );
            })()}
            <button type="button" onClick={() => navigateTo('dashboard')} className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors">
              View Full Market Analysis →
            </button>
          </div>

          {/* Pricing */}
          <div className="dash-card p-5 transition-all duration-300 hover:shadow-lg">
            <SectionHeader
              eyebrow="Pricing"
              title="Local Pricing Intelligence"
              description="Benchmark your price against available local evidence."
            />
            {pricingComparison ? (
              <div className="mt-4">
                <div className="space-y-1.5 text-xs">
                  <DataRow label="Your Price" value={pricingComparison.yourPrice} />
                  <DataRow label="Local Average" value={pricingComparison.localAverage} />
                  <DataRow label="Observed Range" value={pricingComparison.observedRange} />
                  <DataRow label="Your Position" value={pricingComparison.position} />
                </div>
                <div className="mt-4">
                  <div className="relative h-2 rounded-full bg-slate-100">
                    <div className="absolute left-0 top-0 h-2 w-2/3 rounded-full bg-blue-200" />
                    <div className="absolute left-[42%] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow" />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>Lower</span><span>Average</span><span>Premium</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">Pricing data not available yet.</div>
            )}
            <button type="button" onClick={() => setActiveModal('pricing')} className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors">
              View Pricing Benchmark →
            </button>
          </div>
        </div>
      </div>

      {/* Quick access */}
      <div className="dash-card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Quick Access</p>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Other Key Intelligence</h2>
          </div>
          <button type="button" onClick={() => setActiveModal('decision')} className="text-xs font-bold text-blue-700 hover:text-blue-800">
            View Decision Summary →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5">
          <QuickAccessCard title="What-if Simulator" text="Simulate loan, EMI and cash-flow impact." tone="emerald" onClick={() => navigateTo('financial-plan')} />
          <QuickAccessCard title="Financial Stress Test" text="Test resilience under adverse scenarios." tone="amber" onClick={() => navigateTo('financial-plan')} />
          <QuickAccessCard title="Scheme Matching" text="Find financing support that fits." tone="violet" onClick={() => navigateTo('scheme')} />
          <QuickAccessCard title="Action Plan" text="Turn findings into next steps." tone="blue" onClick={() => navigateTo('action-plan')} />
          <QuickAccessCard title="AI Advisor" text="Ask VITTANAYA about this business." tone="emerald" onClick={openAIExplanation} />
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'score' && (
        <ModalShell isOpen title="Why this score?" description="Factor-level explanation of the current feasibility score." onClose={() => setActiveModal(null)} tone="emerald">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              {factorBreakdown.map((item) => <DataRow key={item.key} label={item.key} value={formatScore(item.score, item.max)} />)}
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">Current result</p>
              <p className="mt-2 text-4xl font-black text-slate-900">{overallScore}<span className="text-lg text-slate-400">/100</span></p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">This score combines the available market, financial, location, competition and risk inputs.</p>
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === 'market' && (
        <ModalShell isOpen title="Market evidence" description="Signals currently used to interpret local market readiness." onClose={() => setActiveModal(null)} tone="emerald">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-4 py-3">Signal</th><th className="px-4 py-3">Evidence</th><th className="px-4 py-3">Confidence</th><th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody>{marketSignals.map((item) => <EvidenceRow key={item.signal} {...item} />)}</tbody>
            </table>
          </div>
        </ModalShell>
      )}

      {activeModal === 'financial' && (
        <ModalShell isOpen title="Financial calculation" description="Existing workspace values used for this feasibility view." onClose={() => setActiveModal(null)} tone="blue">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <DataRow label="Project Cost" value={profile.projectCost ? formatINR(profile.projectCost) : null} />
              <DataRow label="Own Capital" value={profile.ownCapital || profile.available_margin_capital ? formatINR(profile.ownCapital || profile.available_margin_capital) : null} />
              <DataRow label="Loan Required" value={profile.projectCost && (profile.ownCapital || profile.available_margin_capital) ? formatINR(Math.max(0, Number(profile.projectCost) - Number(profile.ownCapital || profile.available_margin_capital))) : null} />
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
              <DataRow label="Financial Health" value={financialHealth !== null ? `${financialHealth}/100` : null} />
              <DataRow label="Runway" value={runwayDays !== null ? `${runwayDays} days` : null} />
              <DataRow label="Liquidity Gap" value={liquidityGap !== null ? formatINR(liquidityGap) : null} />
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === 'risk' && (
        <ModalShell isOpen title="Risk factors" description="Risk signals grounded in available workspace evidence." onClose={() => setActiveModal(null)} tone="rose">
          <div className="space-y-3">
            {riskFactors.length ? riskFactors.map((item) => (
              <div key={item.factor} className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                <DataRow label="Factor" value={item.factor} />
                <DataRow label="Severity" value={item.severity} />
                <DataRow label="Reason" value={item.reason} />
                <DataRow label="Mitigation" value={item.mitigation} />
              </div>
            )) : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Not enough data to build risk factors.</div>}
          </div>
        </ModalShell>
      )}

      {activeModal === 'pricing' && (
        <ModalShell isOpen title="Pricing evidence" description="Current pricing benchmark available in the workspace." onClose={() => setActiveModal(null)} tone="amber">
          {pricingComparison ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <MiniStat label="Your Price" value={pricingComparison.yourPrice} />
              <MiniStat label="Local Average" value={pricingComparison.localAverage} />
              <MiniStat label="Observed Range" value={pricingComparison.observedRange} />
              <MiniStat label="Position" value={pricingComparison.position} />
            </div>
          ) : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Pricing data not available yet.</div>}
        </ModalShell>
      )}

      {activeModal === 'decision' && (
        <ModalShell isOpen title="Decision summary" description="A concise explanation of the current recommendation." onClose={() => setActiveModal(null)} tone="emerald">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <TonePill tone={statusTone(decisionLabel)}>{decisionLabel}</TonePill>
              <TonePill tone="slate">Score: {overallScore}/100</TonePill>
              <TonePill tone="slate">Confidence: {overallConfidence}%</TonePill>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              {decisionReasons.map((reason) => (
                <li key={reason} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" /><span>{reason}</span></li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => navigateTo('financial-plan')} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">Run Financial Simulation →</button>
            <button type="button" onClick={openAIExplanation} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Explain this decision →</button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}


function RecommendedNextStep({ number, title, text, cta, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl border border-white bg-white px-3.5 py-3 text-left shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[10px] font-black text-blue-700">
        {number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-extrabold text-slate-900">{title}</span>
        <span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">{text}</span>
      </span>
      <span className="flex flex-shrink-0 items-center gap-1 text-[10px] font-bold text-blue-700">
        {cta}
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </span>
    </button>
  );
}

function QuickAccessCard({ title, text, tone = 'blue', onClick }) {
  const tones = {
    emerald: 'bg-blue-50/70 border-blue-100 text-blue-700',
    amber: 'bg-amber-50/70 border-amber-100 text-amber-700',
    violet: 'bg-violet-50/70 border-violet-100 text-violet-700',
    blue: 'bg-blue-50/70 border-blue-100 text-blue-700',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${tones[tone] || tones.emerald}`}
    >
      <span className="min-w-0">
        <span className="block text-xs font-extrabold text-slate-900">{title}</span>
        <span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">{text}</span>
      </span>
      <span className="flex-shrink-0 text-base font-bold transition-transform group-hover:translate-x-0.5">→</span>
    </button>
  );
}

function SWOTCard({ title, tone, badge, items = [] }) {
  const styles = {
    emerald: 'bg-blue-50 border-blue-100 text-blue-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    rose: 'bg-rose-50 border-rose-100 text-rose-700',
  };

  return (
    <div className={`rounded-2xl border p-4 ${styles[tone] || styles.emerald}`}>
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-white text-slate-900 flex items-center justify-center text-[11px] font-black border border-current/20">
          {badge}
        </span>
        <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
      </div>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-white/80 border border-white/80 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900">{item.label}</p>
                {item.evidence && (
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{item.evidence}</p>
                )}
              </div>
              {item.action && (
                <button
                  type="button"
                  onClick={item.action}
                  className="text-[10px] font-bold text-blue-700 hover:text-blue-800 whitespace-nowrap"
                >
                  Evidence -&gt;
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-900">{formatMaybeText(value, 'Not available')}</p>
    </div>
  );
}

export default FeasibilityPage;


