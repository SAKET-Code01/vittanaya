import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { financeService } from '../../services/financeService';

const formatINR = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '₹ 0';
  const rounded = Math.round(val);
  return `₹ ${rounded.toLocaleString('en-IN')}`;
};

export default function CashFlowSection({
  currentProfile,
  projectCost = 1000000,
  marginPct = 10,
  interestRate = 8.5,
  loanTenureYears = 7,
}) {
  const [cashFlowData, setCashFlowData] = useState(null);
  const [isStressActive, setIsStressActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const bizId = currentProfile?.id || null;
  const ownCapital = Number(currentProfile?.ownCapital || 50000);
  const bizName = currentProfile?.name || currentProfile?.businessName || 'Micro-Enterprise';

  const fetchCashFlow = useCallback(
    async (stressChange = 0.0) => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage('');

      try {
        const payload = {
          business_id: bizId ? Number(bizId) : null,
          project_cost: Number(projectCost) || 1000000,
          available_margin_capital: ownCapital,
          interest_rate_annual: Number(interestRate) || 8.5,
          tenure_years: Number(loanTenureYears) || 7,
          stress_sales_change: stressChange,
          apply_seasonality: true,
        };

        const res = await financeService.getCashFlowForecast(payload);
        const data = res?.data || res;
        setCashFlowData(data);
      } catch (err) {
        console.warn('Cash flow forecast fetch error:', err);
        setIsError(true);
        setErrorMessage(
          err?.response?.data?.detail || err.message || 'Unable to compute cash-flow forecast.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [bizId, projectCost, ownCapital, interestRate, loanTenureYears]
  );

  useEffect(() => {
    fetchCashFlow(isStressActive ? -15.0 : 0.0);
  }, [fetchCashFlow, isStressActive]);

  const summary = cashFlowData?.summary;
  const months = cashFlowData?.months || [];
  const flags = cashFlowData?.liquidity_flags || [];
  const stressComp = cashFlowData?.stress_comparison;

  const riskBadgeColor = (risk) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.045)] space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-600">
            Authoritative Liquidity Model
          </p>
          <h2 className="mt-1 text-xl font-black text-[#17201C]">
            12-Month Cash-Flow &amp; Liquidity Intelligence
          </h2>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Deterministic operating cash roll-forward for <strong>{bizName}</strong> · Debt service &amp; seasonality integration
          </p>
        </div>

        {/* STRESS TEST TOGGLE */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsStressActive(false)}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border transition cursor-pointer ${
              !isStressActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-[#F8FAF9] text-[#64748B] border-[#E4E9E6] hover:bg-[#EEF2F0]'
            }`}
          >
            Baseline
          </button>
          <button
            type="button"
            onClick={() => setIsStressActive(true)}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border transition cursor-pointer ${
              isStressActive
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-[#F8FAF9] text-[#64748B] border-[#E4E9E6] hover:bg-[#EEF2F0]'
            }`}
          >
            Stress (Sales -15%)
          </button>
        </div>
      </div>

      {/* ERROR STATE */}
      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => fetchCashFlow(isStressActive ? -15.0 : 0.0)}
            className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#E2EEE8] bg-[#F7FBF9] p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            Min Projected Cash
          </p>
          <p className="mt-1 text-lg font-black text-[#0F172A]">
            {isLoading ? '...' : formatINR(summary?.minimum_projected_cash)}
          </p>
          <p className="mt-0.5 text-[10px] text-[#94A3B8]">Lowest 12m closing balance</p>
        </div>

        <div className="rounded-2xl border border-[#E2EEE8] bg-[#F7FBF9] p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            Working Capital Req.
          </p>
          <p className="mt-1 text-lg font-black text-[#2563EB]">
            {isLoading ? '...' : formatINR(summary?.working_capital_required)}
          </p>
          <p className="mt-0.5 text-[10px] text-[#94A3B8]">1.5m ops + net dues</p>
        </div>

        <div className="rounded-2xl border border-[#E2EEE8] bg-[#F7FBF9] p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            Target Cash Buffer
          </p>
          <p className="mt-1 text-lg font-black text-[#0F172A]">
            {isLoading ? '...' : formatINR(summary?.minimum_recommended_buffer)}
          </p>
          <p className="mt-0.5 text-[10px] text-[#94A3B8]">45-day operating safety</p>
        </div>

        <div className="rounded-2xl border border-[#E2EEE8] bg-[#F7FBF9] p-3.5 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            Liquidity Risk
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`inline-block px-2.5 py-1 text-xs font-black rounded-full border ${riskBadgeColor(
                summary?.liquidity_risk_level
              )}`}
            >
              {isLoading ? '...' : summary?.liquidity_risk_level || 'LOW'}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-[#94A3B8]">
            {summary?.critical_months?.length > 0
              ? `Alert in: ${summary.critical_months.join(', ')}`
              : 'No shortage projected'}
          </p>
        </div>
      </div>

      {/* STRESS COMPARISON ALERT */}
      {isStressActive && stressComp && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="font-extrabold block">Revenue Shock Sensitivity Simulation (-15% Sales)</span>
            <span>
              Baseline Min Cash: <strong>{formatINR(stressComp.baseline_min_cash)}</strong> → Stressed Min Cash:{' '}
              <strong>{formatINR(stressComp.stress_min_cash)}</strong> (Delta:{' '}
              <strong className="text-rose-700">{formatINR(stressComp.cash_delta)}</strong>). Risk Shift:{' '}
              <strong>{stressComp.baseline_risk} → {stressComp.stress_risk}</strong>.
            </span>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-xl bg-amber-200 font-black text-amber-900 text-[11px]">
            SENSITIVITY ACTIVE
          </span>
        </div>
      )}

      {/* RECHARTS COMPOSED CHART */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#0F172A]">
            12-Month Roll-Forward (Revenue vs. Expenses vs. Debt Service vs. Closing Cash)
          </span>
          <span className="text-[10px] font-bold text-[#64748B]">
            Data Integrity: <strong className="text-blue-600">{cashFlowData?.data_status || 'ESTIMATE'}</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-xs text-[#94A3B8] font-bold">
            Calculating Cash-Flow Roll-Forward...
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={months} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val, name) => [formatINR(val), name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Monthly Revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="operating_expenses" name="Operating Expenses" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="debt_service" name="Debt Service (EMI)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="closing_cash" name="Closing Cash" stroke="#2563EB" strokeWidth={3} dot={{ r: 3 }} />
                {summary?.minimum_recommended_buffer > 0 && (
                  <ReferenceLine
                    y={summary.minimum_recommended_buffer}
                    stroke="#D97706"
                    strokeDasharray="3 3"
                    label={{ value: 'Target Buffer', fill: '#D97706', fontSize: 10, position: 'insideTopRight' }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* LIQUIDITY RISK FLAGS & RECOMMENDATIONS */}
      {flags.length > 0 && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 space-y-2">
          <p className="text-xs font-black text-rose-900 uppercase tracking-wider">
            Liquidity Vulnerability Alerts &amp; Advisory
          </p>
          <div className="space-y-2">
            {flags.map((flag, idx) => (
              <div key={idx} className="rounded-xl bg-white p-3 border border-rose-200 text-xs text-[#0F172A]">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-extrabold text-rose-800">Month {flag.affected_month}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${riskBadgeColor(flag.risk_level)}`}>
                    {flag.risk_level}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mb-1">{flag.reason}</p>
                <p className="text-[11px] font-bold text-blue-700">Recommended Action: {flag.recommended_action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
