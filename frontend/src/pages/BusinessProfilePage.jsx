import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AVAILABLE_OPERATIONS, BUSINESS_TYPES } from '../data/adaptiveWorkspaceConfig';
import { formatINR } from '../mocks/dashboardMockData';
import {
  EditProfileModal,
  EditBusinessInfoModal,
  EditBusinessTypeModal,
  EditOperationsModal,
  EditFinancialValuesModal,
} from '../components/profile/BusinessProfileModals';
import OperationConfigModal from '../components/profile/OperationConfigModal';
import { getOperationSummaryBadges } from '../data/defaultOperationsConfig';

function formatHumanLabel(value) {
  if (!value) return 'Not provided';
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMaybeDate(value) {
  if (!value) return 'Not recorded';
  return value;
}

function resolveBusinessTypeLabel(profile) {
  const typeId = profile?.businessType;
  const match = BUSINESS_TYPES.find((type) => type.id === typeId);
  return profile?.category || match?.label || (typeId ? formatHumanLabel(typeId) : 'Not provided');
}

function getStatusTone(status) {
  switch (status) {
    case 'Healthy':
    case 'Strong':
    case 'Complete':
    case 'Active':
      return 'emerald';
    case 'Moderate':
    case 'Developing':
    case 'Partial':
      return 'amber';
    case 'Needs attention':
    case 'Incomplete':
    case 'Missing':
      return 'rose';
    default:
      return 'slate';
  }
}

function StatusPill({ tone = 'slate', children }) {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${styles[tone] || styles.slate}`}>
      {children}
    </span>
  );
}

function SectionLabel({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 border-b border-slate-100">
      <div className="space-y-1">
        {eyebrow && (
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">
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

function UsedByVittanaya({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        Used by
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniIcon({ type = 'sparkles', tone = 'emerald' }) {
  const toneClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/20',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/20',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-400/20',
  };

  const paths = {
    sparkles: 'M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8',
    heart: 'M20.8 8.7c0 5.7-8.8 11.1-8.8 11.1S3.2 14.4 3.2 8.7A4.7 4.7 0 018 4a5 5 0 014 2.1A5 5 0 0116 4a4.8 4.8 0 014.8 4.7z',
    chart: 'M4 19V5m0 14h16M8 15l3-4 3 2 4-6',
    layers: 'M12 3l8 4-8 4-8-4 8-4zm-8 9 8 4 8-4M4 17l8 4 8-4',
    file: 'M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2zm7 1v5h5M9 13h6M9 17h6',
    pin: 'M12 21s7-5.1 7-11A7 7 0 005 10c0 5.9 7 11 7 11zm0-8a3 3 0 100-6 3 3 0 000 6z',
    target: 'M12 3v3m0 12v3M3 12h3m12 0h3M12 7a5 5 0 105 5M12 9a3 3 0 103 3',
    users: 'M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m6-10a4 4 0 100-8 4 4 0 000 8zm8 2a3 3 0 100-6 3 3 0 000 6zm0 0c2.1 0 4 1.2 4 3.5V21',
  };

  return (
    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-[0_8px_20px_rgba(16,185,129,0.05)] ${toneClasses[tone] || toneClasses.emerald}`}>
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={paths[type] || paths.sparkles} />
      </svg>
    </span>
  );
}

function ProfileCompletenessCard({ profile, financialData, onCompleteProfile }) {
  const { percent, missingItems, checklistPreview } = useMemo(() => {
    const locationParts = [
      profile?.village || profile?.locationData?.village,
      profile?.district || profile?.locationData?.district,
      profile?.state || profile?.locationData?.state,
      profile?.pin || profile?.locationData?.pin,
    ];

    const checklist = [
      { label: 'Business / company name', shortLabel: 'Core identity', value: profile?.name },
      { label: 'Business stage', shortLabel: 'Business stage', value: profile?.stage },
      { label: 'Business type', shortLabel: 'Business type', value: resolveBusinessTypeLabel(profile) },
      { label: 'Business description', shortLabel: 'Business details', value: profile?.description },
      { label: 'Village / town', shortLabel: 'Village / town', value: profile?.village || profile?.locationData?.village },
      { label: 'District', shortLabel: 'District', value: profile?.district || profile?.locationData?.district },
      { label: 'State', shortLabel: 'State', value: profile?.state || profile?.locationData?.state },
      { label: 'PIN code', shortLabel: 'PIN code', value: profile?.pin || profile?.locationData?.pin },
      { label: 'Financial baseline', shortLabel: 'Financial information', value: financialData && Object.keys(financialData).length > 0 },
      { label: 'Workspace operations', shortLabel: 'Operations setup', value: (profile?.selectedOperations || []).length > 0 },
      {
        label: 'Registration details',
        shortLabel: 'Registration',
        value: profile?.gstin || profile?.pan || profile?.regNo || profile?.legalStructure,
      },
      { label: 'Location summary', shortLabel: 'Location summary', value: profile?.location || locationParts.filter(Boolean).length > 0 },
    ];

    const completeCount = checklist.filter((item) => Boolean(item.value)).length;
    const computedPercent = checklist.length > 0
      ? Math.round((completeCount / checklist.length) * 100)
      : 0;

    const gaps = checklist.filter((item) => !item.value).slice(0, 3);
    return {
      percent: computedPercent,
      missingItems: gaps.map((item) => item.label),
      checklistPreview: checklist.slice(0, 5),
    };
  }, [financialData, profile]);

  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="dash-card group relative overflow-hidden p-5 sm:p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,88,56,0.10)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-100/40 blur-3xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-emerald-400/10" />

      <SectionLabel
        eyebrow="Profile Readiness"
        title="Profile Completeness"
        description="See what is ready, what is missing, and what to fix next."
        action={
          <button
            type="button"
            onClick={onCompleteProfile}
            className="group/button inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/80 px-3.5 py-2.5 text-xs font-bold text-emerald-700 shadow-sm backdrop-blur transition-all duration-250 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-[0_8px_22px_rgba(16,185,129,0.12)] dark:border-emerald-400/20 dark:bg-emerald-500/5 dark:text-emerald-200 dark:hover:bg-emerald-500/10"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4L16.5 3.5z" />
            </svg>
            Complete Profile
            <span className="transition-transform duration-200 group-hover/button:translate-x-0.5">→</span>
          </button>
        }
      />

      <div className="mt-5 flex-1">
        <div className="grid gap-5 lg:grid-cols-[140px_1fr] items-center">
          <div className="relative mx-auto h-32 w-32">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-white/10" />
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(safePercent / 100) * 301.6} 301.6`}
                className="text-emerald-500 transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{safePercent}%</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Complete</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {safePercent >= 80 ? "Your profile is in good shape." : "You're almost there."}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Complete the remaining details to unlock stronger recommendations and more accurate business insights.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Readiness</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{safePercent}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700" style={{ width: `${safePercent}%` }} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {checklistPreview.map((item) => (
                <span key={item.shortLabel} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                  item.value
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/5 dark:text-emerald-200'
                    : 'border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/5 dark:text-amber-200'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${item.value ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {item.shortLabel}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 to-white/70 p-3.5 shadow-sm dark:border-emerald-400/15 dark:from-emerald-500/8 dark:to-white/[0.02]">
          <div className="flex items-start gap-3">
            <MiniIcon type="sparkles" tone="emerald" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">Next best action</p>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {missingItems.length
                  ? `Add ${missingItems.join(', ')} to improve the quality of your VITTANAYA recommendations.`
                  : 'Your profile has no critical gaps right now.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onCompleteProfile}
              className="shrink-0 self-center text-xs font-black text-emerald-700 transition-all hover:translate-x-0.5 hover:text-emerald-800 dark:text-emerald-300"
            >
              Fix now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessHealthSnapshot({ profile, financialSummary, selectedOps }) {
  const financialScore = typeof financialSummary?.health_score === 'number' ? financialSummary.health_score : null;

  const cards = [
    {
      title: 'Financial Health',
      type: 'heart',
      tone: financialScore === null ? 'slate' : financialScore >= 80 ? 'emerald' : financialScore >= 60 ? 'amber' : 'rose',
      value: financialScore === null ? '—' : `${financialScore} / 100`,
      status: financialScore === null ? 'Not enough data' : financialScore >= 80 ? 'Healthy' : financialScore >= 60 ? 'Moderate' : 'Needs attention',
      detail: financialScore === null ? 'Add financial data to assess health.' : 'Healthy financial profile.',
    },
    {
      title: 'Market Readiness',
      type: 'chart',
      tone: profile?.location && (profile?.category || profile?.businessType) ? 'emerald' : 'amber',
      value: profile?.location && (profile?.category || profile?.businessType) ? 'Strong' : 'Developing',
      status: profile?.location && (profile?.category || profile?.businessType) ? 'Strong' : 'Developing',
      detail: profile?.location ? 'High potential from the current business context.' : 'Add a location to improve market context.',
    },
    {
      title: 'Operational Readiness',
      type: 'layers',
      tone: selectedOps.length >= 8 ? 'emerald' : selectedOps.length >= 4 ? 'amber' : selectedOps.length > 0 ? 'blue' : 'slate',
      value: selectedOps.length >= 8 ? 'Strong' : selectedOps.length >= 4 ? 'Moderate' : selectedOps.length > 0 ? 'Developing' : '—',
      status: selectedOps.length >= 8 ? 'Strong' : selectedOps.length >= 4 ? 'Moderate' : selectedOps.length > 0 ? 'Developing' : 'Not enough data',
      detail: selectedOps.length > 0 ? `${selectedOps.length} active operations` : 'No active operations yet.',
    },
    {
      title: 'Documentation',
      type: 'file',
      tone: profile?.gstin && profile?.pan ? 'emerald' : (profile?.gstin || profile?.pan || profile?.regNo || profile?.legalStructure ? 'amber' : 'rose'),
      value: profile?.gstin && profile?.pan ? 'Complete' : (profile?.gstin || profile?.pan || profile?.regNo || profile?.legalStructure ? 'Partial' : 'Incomplete'),
      status: profile?.gstin && profile?.pan ? 'Complete' : (profile?.gstin || profile?.pan || profile?.regNo || profile?.legalStructure ? 'Partial' : 'Incomplete'),
      detail: profile?.gstin || profile?.pan || profile?.regNo ? 'Registration details are present.' : 'Add registration details to strengthen the profile.',
    },
  ];

  const iconTone = {
    emerald: 'emerald',
    amber: 'amber',
    rose: 'amber',
    blue: 'blue',
    slate: 'blue',
  };

  return (
    <div className="dash-card group relative overflow-hidden p-5 sm:p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,88,56,0.10)]">
      <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-emerald-100/40 blur-3xl dark:bg-emerald-400/10" />

      <SectionLabel
        eyebrow="Business Health Snapshot"
        title="Decision Layer"
        description="A quick read of the signals shaping your business readiness."
      />

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
        {cards.map((card) => (
          <div
            key={card.title}
            className="group/metric flex min-h-[148px] flex-col justify-between rounded-2xl border border-slate-100 bg-white/75 p-4.5 backdrop-blur transition-all duration-250 hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-[0_12px_30px_rgba(16,185,129,0.10)] dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-emerald-400/25 dark:hover:bg-emerald-500/[0.06]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <MiniIcon type={card.type} tone={iconTone[card.tone] || 'emerald'} />
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  {card.title}
                </p>
              </div>
              {card.title === 'Financial Health' && financialScore !== null && (
                <span className="whitespace-nowrap rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                  Score
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-center">
              <div className="whitespace-nowrap text-center">
                <p className="text-[19px] font-black tracking-tight text-slate-900 dark:text-white">{card.value}</p>
                <div className="mt-1.5 flex items-center justify-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${
                    card.tone === 'amber' ? 'bg-amber-500' :
                    card.tone === 'rose' ? 'bg-rose-500' :
                    card.tone === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />
                  <span className={`text-xs font-extrabold ${
                    card.tone === 'amber' ? 'text-amber-700 dark:text-amber-300' :
                    card.tone === 'rose' ? 'text-rose-700 dark:text-rose-300' :
                    card.tone === 'blue' ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {card.status}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-[11px] leading-4 text-slate-500 dark:text-slate-400">
              {card.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationIntelligenceCard({ profile, onNavigateFeasibility, usedByItems = [] }) {
  const location = profile?.location || [
    profile?.village || profile?.locationData?.village,
    profile?.district || profile?.locationData?.district,
    profile?.state || profile?.locationData?.state,
  ].filter(Boolean).join(', ');

  const locationLabel = location || 'Not provided';
  const isReady = Boolean(location);

  const metrics = [
    { label: 'Catchment', value: 'Awaiting analysis', icon: 'target' },
    { label: 'Market Opportunity', value: 'Awaiting analysis', icon: 'chart' },
    { label: 'Competition', value: 'Awaiting analysis', icon: 'users' },
    { label: 'Connectivity', value: 'Awaiting analysis', icon: 'pin' },
  ];

  return (
    <div className="dash-card group relative overflow-hidden p-5 sm:p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,88,56,0.10)]">
      <div className="pointer-events-none absolute -left-16 -bottom-20 h-44 w-44 rounded-full bg-emerald-100/40 blur-3xl dark:bg-emerald-400/10" />

      <SectionLabel
        eyebrow="Local Context"
        title="Location Intelligence"
        description="Understand the local context that will shape feasibility and recommendations."
        action={
          <button
            type="button"
            onClick={onNavigateFeasibility}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition-all duration-250 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-[0_8px_22px_rgba(16,185,129,0.12)] dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-emerald-500/10"
          >
            View Local Analysis
            <span>→</span>
          </button>
        }
      />

      <div className="mt-5 flex-1">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/75 via-white/80 to-white/60 p-4 shadow-sm dark:border-emerald-400/15 dark:from-emerald-500/10 dark:via-white/[0.03] dark:to-transparent">
          <div className="flex items-start gap-3">
            <MiniIcon type="pin" tone="emerald" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="break-words text-sm font-extrabold text-slate-900 dark:text-white">{locationLabel}</p>
                <StatusPill tone={isReady ? 'emerald' : 'slate'}>
                  {isReady ? 'Ready' : 'Awaiting analysis'}
                </StatusPill>
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                Local demand, competition, catchment and connectivity will appear as analysis data becomes available.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 text-[11px] dark:border-white/10 dark:bg-white/[0.03]">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Current location signal</span>
            <span className={`font-black ${isReady ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}`}>
              {isReady ? 'Ready for analysis' : 'Needs location'}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="group/location rounded-2xl border border-slate-100 bg-white/70 p-3.5 backdrop-blur transition-all duration-250 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-[0_10px_24px_rgba(16,185,129,0.08)] dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-emerald-400/20 dark:hover:bg-emerald-500/[0.05]"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={
                      metric.icon === 'target'
                        ? 'M12 3v3m0 12v3M3 12h3m12 0h3M12 7a5 5 0 105 5M12 9a3 3 0 103 3'
                        : metric.icon === 'users'
                        ? 'M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m6-10a4 4 0 100-8 4 4 0 000 8zm8 2a3 3 0 100-6 3 3 0 000 6'
                        : metric.icon === 'chart'
                        ? 'M4 19V5m0 14h16M8 15l3-4 3 2 4-6'
                        : 'M12 21s7-5.1 7-11A7 7 0 005 10c0 5.9 7 11 7 11zm0-8a3 3 0 100-6 3 3 0 000 6z'
                    } />
                  </svg>
                </span>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  {metric.label}
                </p>
              </div>
              <p className="mt-3 text-xs font-extrabold text-slate-900 dark:text-white">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <UsedByVittanaya items={usedByItems} />
          <button
            type="button"
            onClick={onNavigateFeasibility}
            className="hidden shrink-0 text-[11px] font-black text-emerald-700 transition-all hover:translate-x-0.5 hover:text-emerald-800 sm:inline-flex dark:text-emerald-300"
          >
            Explore area →
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, fallback = 'Not provided', mono = false, valueClassName = '' }) {
  const displayValue = value || fallback;

  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-slate-500 font-medium text-xs">{label}</span>
      <span className={`text-right text-xs font-semibold text-slate-900 ${mono ? 'font-mono' : ''} ${valueClassName}`}>
        {displayValue}
      </span>
    </div>
  );
}

function BusinessProfilePage({ onNavigateHome }) {
  const {
    currentProfile,
    updateProfile,
    updateBusinessType,
    updateOperations,
    operationsConfig,
    updateOperationConfig,
    enableOperation,
    deactivateOperation,
    financialData,
    financialSummary,
    updateFinancialValues,
    resetFinancialValues,
    setActiveNavId,
  } = useWorkspace();

  const profile = currentProfile || {};
  const selectedOps = profile.selectedOperations || [];

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditBusinessInfoOpen, setIsEditBusinessInfoOpen] = useState(false);
  const [isEditBusinessTypeOpen, setIsEditBusinessTypeOpen] = useState(false);
  const [isEditOperationsOpen, setIsEditOperationsOpen] = useState(false);
  const [isEditFinancialOpen, setIsEditFinancialOpen] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [activeConfigOpId, setActiveConfigOpId] = useState(null);
  const [isOpConfigOpen, setIsOpConfigOpen] = useState(false);

  const handleNavigate = (navId) => {
    if (navId === 'dashboard' && onNavigateHome) {
      onNavigateHome();
      return;
    }

    if (setActiveNavId) {
      setActiveNavId(navId);
      return;
    }

    if (navId === 'dashboard' && onNavigateHome) {
      onNavigateHome();
    }
  };

  const handleExportProfile = () => {
    const profileJson = JSON.stringify(
      {
        profile,
        financial: financialData,
        summary: financialSummary,
      },
      null,
      2
    );

    const blob = new Blob([profileJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(profile.name || 'business_profile').toLowerCase().replace(/\s+/g, '_')}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  const getOpIcon = (id) => {
    const iconMap = {
      sales: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      purchases: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      inventory: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      production: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
      employees: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      assets: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      banking: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      loans: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z',
      projects: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      fleet: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    };

    return (
      <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconMap[id] || 'M4 6h16M4 12h16m-7 6h7'} />
        </svg>
      </div>
    );
  };

  const activeOperationCards = useMemo(
    () => AVAILABLE_OPERATIONS.filter((op) => selectedOps.includes(op.id)),
    [selectedOps]
  );

  const availableOperationCards = useMemo(
    () => AVAILABLE_OPERATIONS.filter((op) => !selectedOps.includes(op.id)),
    [selectedOps]
  );

  const businessTypeLabel = resolveBusinessTypeLabel(profile);
  const stageLabel = profile.stage ? formatHumanLabel(profile.stage) : 'Not provided';
  const villageLabel = profile.village || profile.locationData?.village || 'Not provided';
  const districtLabel = profile.district || profile.locationData?.district || 'Not provided';
  const stateLabel = profile.state || profile.locationData?.state || 'Not provided';
  const pinLabel = profile.pin || profile.locationData?.pin || 'Not provided';
  const locationLabel = profile.location || [profile.village || profile.locationData?.village, profile.district || profile.locationData?.district, profile.state || profile.locationData?.state].filter(Boolean).join(', ') || 'Not provided';
  const businessSinceLabel = profile.businessSince && profile.businessSince !== '2022' ? profile.businessSince : null;
  const financialLastCalculated = financialData?.lastCalculatedAt || profile.lastUpdatedAt || null;

  const usedByLocation = ['Feasibility', 'Scheme Matching', 'Financial Plan'];
  const usedByBusinessType = ['Dashboard', 'Market Insight', 'AI Assistant'];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">
            Business Intelligence Profile
          </p>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Business Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              View and manage your business information, operations and workspace configuration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleExportProfile}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {showExportSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-center justify-between gap-3">
          <span>Profile configuration exported successfully.</span>
          <button
            type="button"
            onClick={() => setShowExportSuccess(false)}
            className="font-bold text-emerald-700 hover:text-emerald-900"
          >
            Close
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">
        <ProfileCompletenessCard
          profile={profile}
          financialData={financialData}
          onCompleteProfile={() => setIsEditBusinessInfoOpen(true)}
        />

        <BusinessHealthSnapshot
          profile={profile}
          financialSummary={financialSummary}
          selectedOps={selectedOps}
        />

        <LocationIntelligenceCard
          profile={profile}
          onNavigateFeasibility={() => handleNavigate('feasibility')}
          usedByItems={usedByLocation}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="dash-card p-5 sm:p-6 h-full">
          <SectionLabel
            eyebrow="Identity"
            title="Business Identity"
            description="The business-facing identity shown across workspace experiences."
            action={
              <button
                type="button"
                onClick={() => setIsEditBusinessInfoOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>Edit</span>
                <span aria-hidden="true">✎</span>
              </button>
            }
          />

          <div className="mt-4 space-y-3">
            <InfoRow label="Business / Company Name" value={profile.name} fallback="Not provided" />
            <InfoRow label="Business Stage" value={stageLabel} fallback="Not provided" />
            <InfoRow label="Business Type" value={businessTypeLabel} fallback="Not provided" />
            <InfoRow label="Business Description" value={profile.description} fallback="Not provided" />
            <InfoRow label="Village / Town" value={villageLabel} fallback="Not provided" />
            <InfoRow label="District" value={districtLabel} fallback="Not provided" />
            <InfoRow label="State" value={stateLabel} fallback="Not provided" />
            <InfoRow label="PIN" value={pinLabel} fallback="Not provided" mono />
          </div>
        </div>

        <div className="dash-card p-5 sm:p-6 h-full">
          <SectionLabel
            eyebrow="Type Profile"
            title="Business Type"
            description="A simplified summary of the business model and how Vittanaya classifies it."
            action={
              <button
                type="button"
                onClick={() => setIsEditBusinessTypeOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>Edit</span>
                <span aria-hidden="true">✎</span>
              </button>
            }
          />

          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
              Business Type
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-black text-emerald-950">{businessTypeLabel}</p>
                <p className="text-xs text-emerald-800/80">Primary Business Type</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Industry Sector</span>
              <span className="font-bold text-slate-900 text-right">{businessTypeLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Business Stage</span>
              <span className="font-bold text-slate-900 text-right">{stageLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">Business Since</span>
              <span className="font-bold text-slate-900 text-right">
                {businessSinceLabel || 'Not recorded'}
              </span>
            </div>
          </div>

          <UsedByVittanaya items={usedByBusinessType} />
        </div>

        <div className="dash-card p-5 sm:p-6 h-full">
          <SectionLabel
            eyebrow="Workspace"
            title="Workspace Configuration"
            description="The active workspace state driving operations, navigation and onboarding."
            action={
              <button
                type="button"
                onClick={() => setIsEditOperationsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Manage Operations</span>
                <span aria-hidden="true">→</span>
              </button>
            }
          />

          <div className="mt-5 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">Business Type</span>
              <StatusPill tone="emerald">{businessTypeLabel}</StatusPill>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">Active Operations</span>
              <StatusPill tone={selectedOps.length > 0 ? 'emerald' : 'slate'}>
                {selectedOps.length} / {AVAILABLE_OPERATIONS.length}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">Workspace Status</span>
              <StatusPill tone={profile.onboardingCompletedAt ? 'emerald' : 'amber'}>
                {profile.onboardingCompletedAt ? 'Onboarded' : 'Pending'}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">Last Updated</span>
              <span className="font-semibold text-slate-900 text-right">
                {formatMaybeDate(profile.lastUpdatedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">Onboarding Status</span>
              <StatusPill tone={profile.onboardingCompletedAt ? 'emerald' : 'amber'}>
                {profile.onboardingCompletedAt ? 'Completed' : 'Pending'}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">Onboarding Completed</span>
              <span className="font-semibold text-slate-900 text-right">
                {formatMaybeDate(profile.onboardingCompletedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-card p-5 sm:p-6 space-y-5">
        <SectionLabel
          eyebrow="Operations"
          title="Active Operations"
          description="Configured capabilities that are currently active in the workspace."
          action={
            <button
              type="button"
              onClick={() => setIsEditOperationsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>Manage All</span>
              <span aria-hidden="true">→</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {activeOperationCards.map((op) => {
            const summaryBadges = getOperationSummaryBadges(op.id, operationsConfig[op.id]);

            return (
              <div
                key={op.id}
                className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    {getOpIcon(op.id)}
                    <StatusPill tone="emerald">Active</StatusPill>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {op.label}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {op.desc}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {summaryBadges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 font-mono"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {op.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveConfigOpId(op.id);
                      setIsOpConfigOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>Edit</span>
                    <span aria-hidden="true">✎</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {availableOperationCards.length > 0 && (
          <div className="pt-2">
            <div className="flex items-end justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Available Operations</h3>
                <p className="text-xs text-slate-500">Capabilities ready to enable without changing the underlying logic.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {availableOperationCards.map((op) => (
                <div
                  key={op.id}
                  className="h-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      {getOpIcon(op.id)}
                      <StatusPill tone="slate">Available</StatusPill>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {op.label}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {op.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {op.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        enableOperation(op.id);
                        setActiveConfigOpId(op.id);
                        setIsOpConfigOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <span>Enable</span>
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dash-card p-5 sm:p-6 space-y-5">
        <SectionLabel
          eyebrow="Business Details"
          title="Business Details"
          description="Structured profile information, registration and descriptive notes."
          action={
            <button
              type="button"
              onClick={() => setIsEditBusinessInfoOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>Edit</span>
              <span aria-hidden="true">✎</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 lg:col-span-2 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Registration</p>
            <InfoRow label="PAN Number" value={profile.pan} fallback="Not recorded" mono />
            <InfoRow label="Business Registration No." value={profile.regNo} fallback="Not recorded" mono />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Legal Structure</p>
            <InfoRow label="Legal Structure" value={profile.legalStructure} fallback="Not recorded" />
            <InfoRow label="Financial Year" value={profile.financialYear} fallback="Not recorded" />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Tax & Currency</p>
            <InfoRow label="Tax Regime" value={profile.taxRegime} fallback="Not recorded" />
            <InfoRow label="Currency" value={profile.currency} fallback="Not recorded" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Registered Address</p>
            <p className="text-xs leading-relaxed text-slate-700">
              {profile.registeredAddress || profile.location || 'Not provided'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Business Description</p>
            <p className="text-xs leading-relaxed text-slate-700">
              {profile.description || 'Not provided'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Notes</p>
            <p className="text-xs leading-relaxed text-slate-700">
              {profile.notes || 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      <div className="dash-card p-5 sm:p-6 space-y-5">
        <SectionLabel
          eyebrow="Finance"
          title="Financial Starting Position"
          description="Derived from your current business financial data."
          action={
            <button
              type="button"
              onClick={() => setIsEditFinancialOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>Edit Financial Values</span>
              <span aria-hidden="true">✎</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Cash Available</p>
            <p className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono">
              {formatINR(financialData?.cash_balance ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Receivables</p>
            <p className="text-base sm:text-lg font-extrabold text-blue-700 font-mono">
              {formatINR(financialData?.receivables_total ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Payables</p>
            <p className="text-base sm:text-lg font-extrabold text-rose-700 font-mono">
              {formatINR(financialData?.payables_total ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Expected Inflow</p>
            <p className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono">
              {formatINR(financialData?.expected_inflow ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Expected Outflow</p>
            <p className="text-base sm:text-lg font-extrabold text-rose-700 font-mono">
              {formatINR(financialData?.expected_outflow ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Safety Buffer</p>
            <p className="text-base sm:text-lg font-extrabold text-purple-700 font-mono">
              {formatINR(financialData?.min_cash_buffer ?? 0)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-bold text-slate-800">Financial health strip</p>
            <p className="text-slate-500">
              Runway, liquidity gap, projected trough and score are derived from the current financial inputs.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 sm:justify-end">
            <div>
              <span className="text-slate-400">Runway: </span>
              <strong className="font-mono font-extrabold text-purple-700">
                {financialSummary?.runway_days ?? 'Not recorded'}{financialSummary?.runway_days !== undefined ? ' Days' : ''}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Liquidity Gap: </span>
              <strong className="font-mono font-extrabold text-slate-900">
                {typeof financialSummary?.liquidity_gap === 'number' ? formatINR(financialSummary.liquidity_gap) : 'Not recorded'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Lowest Projected Cash: </span>
              <strong className="font-mono font-extrabold text-blue-700">
                {typeof financialSummary?.lowest_projected_cash === 'number'
                  ? formatINR(financialSummary.lowest_projected_cash)
                  : 'Not recorded'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Health Score: </span>
              <strong className="font-mono font-extrabold text-emerald-700">
                {typeof financialSummary?.health_score === 'number'
                  ? `${financialSummary.health_score} / 100`
                  : 'Not recorded'}
              </strong>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Last calculated: <span className="font-semibold text-slate-700">{formatMaybeDate(financialLastCalculated)}</span>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profile}
        onSave={(fields) => updateProfile(fields)}
      />

      <EditBusinessInfoModal
        isOpen={isEditBusinessInfoOpen}
        onClose={() => setIsEditBusinessInfoOpen(false)}
        profile={profile}
        onSave={(fields) => updateProfile(fields)}
      />

      <EditBusinessTypeModal
        isOpen={isEditBusinessTypeOpen}
        onClose={() => setIsEditBusinessTypeOpen(false)}
        currentTypeId={profile.businessType || profile.id}
        onSelectType={(typeId) => updateBusinessType(typeId)}
      />

      <EditOperationsModal
        isOpen={isEditOperationsOpen}
        onClose={() => setIsEditOperationsOpen(false)}
        selectedOps={selectedOps}
        onSave={(newOps) => updateOperations(newOps)}
      />

      <EditFinancialValuesModal
        isOpen={isEditFinancialOpen}
        onClose={() => setIsEditFinancialOpen(false)}
        financialData={financialData}
        financialSummary={financialSummary}
        onSave={(values) => updateFinancialValues(values)}
        onReset={() => resetFinancialValues()}
      />

      <OperationConfigModal
        isOpen={isOpConfigOpen}
        onClose={() => {
          setIsOpConfigOpen(false);
          setActiveConfigOpId(null);
        }}
        opId={activeConfigOpId}
        currentProfile={profile}
        operationsConfig={operationsConfig}
        onSaveConfig={(opId, values) => updateOperationConfig(opId, values)}
        onDeactivate={(opId) => deactivateOperation(opId)}
      />
    </div>
  );
}

export default BusinessProfilePage;
  