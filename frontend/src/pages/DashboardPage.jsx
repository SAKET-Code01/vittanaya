import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

export default function DashboardPage({ currentProfile, onNavigate }) {
  const { financialData, financialSummary } = useWorkspace();
  const cards = [['Cash available', financialData?.cash_balance], ['Expected inflow', financialData?.expected_inflow], ['Expected outflow', financialData?.expected_outflow], ['Liquidity gap', financialSummary?.liquidity_gap]];
  return <div className="space-y-6 animate-fadeIn">
    <section className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Active workspace</p><h1 className="mt-2 text-2xl font-black text-slate-900">{currentProfile?.name || 'Your business'}</h1><p className="mt-1 text-sm text-slate-600">{currentProfile?.category || currentProfile?.businessType || 'Business'}{currentProfile?.location ? ` · ${currentProfile.location}` : ''}</p><p className="mt-4 max-w-2xl text-sm text-slate-600">Review the financial position captured during onboarding and continue your business planning.</p></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{formatINR(value)}</p></article>)}</section>
    <section className="grid gap-4 lg:grid-cols-2"><article className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Financial position</h2><dl className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-500">Cash runway</dt><dd className="mt-1 font-bold">{financialSummary?.runway_days ?? '—'} days</dd></div><div><dt className="text-slate-500">Net cash flow</dt><dd className="mt-1 font-bold">{formatINR(financialSummary?.net_cashflow)}</dd></div></dl></article><article className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Continue planning</h2><div className="mt-4 flex flex-wrap gap-2">{[['feasibility', 'Feasibility'], ['financial-plan', 'Financial Plan'], ['scheme', 'Scheme'], ['action-plan', 'Action Plan']].map(([id, label]) => <button key={id} type="button" onClick={() => onNavigate(id)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100">{label}</button>)}</div></article></section>
  </div>;
}
