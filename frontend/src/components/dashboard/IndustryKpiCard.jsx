import React, { useState, useEffect, useCallback } from 'react';
import { financeService } from '../../services/financeService';

const mapCategoryToCode = (catStr) => {
  if (!catStr) return 'MANUFACTURING';
  const c = String(catStr).toUpperCase();
  if (c.includes('RETAIL') || c.includes('SHOP') || c.includes('STORE') || c.includes('TRADE')) return 'RETAIL';
  if (c.includes('RESTAURANT') || c.includes('FOOD') || c.includes('CAFE') || c.includes('EATERY') || c.includes('BAKERY')) return 'RESTAURANT';
  if (c.includes('TRANSPORT') || c.includes('VEHICLE') || c.includes('TAXI') || c.includes('TRUCK') || c.includes('LOGISTICS')) return 'TRANSPORT';
  if (c.includes('SERVICE') || c.includes('IT') || c.includes('SOFTWARE') || c.includes('AGENCY')) return 'SERVICES';
  if (c.includes('CREATOR') || c.includes('DIGITAL') || c.includes('MEDIA') || c.includes('CONTENT') || c.includes('YOUTUBE')) return 'CREATOR';
  return 'MANUFACTURING';
};

export default function IndustryKpiCard({ currentProfile }) {
  const [industryData, setIndustryData] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [customVariables, setCustomVariables] = useState({});
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bizId = currentProfile?.id || null;
  const category = currentProfile?.category || currentProfile?.businessType || 'Manufacturing';
  const indCode = mapCategoryToCode(category);

  // Fetch Templates
  useEffect(() => {
    financeService.getIndustryTemplates().then((res) => {
      const list = res?.data || res || [];
      setTemplates(list);
    }).catch((err) => console.warn('Templates fetch warning:', err));
  }, []);

  const activeTemplate = templates.find((t) => t.industry_code === indCode) || null;

  // Analyze Industry
  const runAnalysis = useCallback(
    async (vars = {}) => {
      setIsLoading(true);
      try {
        const payload = {
          business_id: bizId ? Number(bizId) : null,
          industry_code: indCode,
          variables: vars,
        };
        const res = await financeService.analyzeIndustry(payload);
        const data = res?.data || res;
        setIndustryData(data);
      } catch (err) {
        console.warn('Industry analytics warning:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [bizId, indCode]
  );

  useEffect(() => {
    runAnalysis(customVariables);
  }, [runAnalysis, customVariables]);

  const handleFieldChange = (key, val) => {
    setCustomVariables((prev) => ({
      ...prev,
      [key]: Number(val) || 0,
    }));
  };

  const kpis = industryData?.kpis || [];
  const risks = industryData?.risk_signals || [];
  const scenario = industryData?.scenario_result;

  return (
    <div className="rounded-[22px] border border-[#E4E9E6] bg-white p-5 shadow-[0_6px_24px_rgba(25,48,38,0.045)] space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-600">
            Sector-Specific Intelligence
          </p>
          <h3 className="text-lg font-black text-[#17201C]">
            {industryData?.display_name || 'Industry Analytics'}
          </h3>
          <p className="text-xs text-[#64748B]">
            Tailored KPI drivers &amp; risk benchmarks for <strong>{category}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomizer((v) => !v)}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-extrabold rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-[#1D4ED8] hover:bg-[#EFF6FF] transition cursor-pointer"
        >
          {showCustomizer ? 'Hide Field Drivers' : 'Customize Sector Drivers'} →
        </button>
      </div>

      {/* PROGRESSIVE FIELD CUSTOMIZER DRAWER */}
      {showCustomizer && activeTemplate && (
        <div className="rounded-2xl border border-blue-100 bg-[#F4F8FF] p-4 space-y-3">
          <p className="text-xs font-extrabold text-blue-900">
            Progressive Input Drivers for {activeTemplate.display_name}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeTemplate.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#475569] flex justify-between">
                  <span>{field.label}</span>
                  <span className="text-blue-700">({field.unit})</span>
                </label>
                <input
                  type="number"
                  value={customVariables[field.key] ?? field.default}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-black text-[#0F172A] focus:border-blue-600 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI GRID */}
      {isLoading ? (
        <div className="py-6 text-center text-xs font-bold text-[#94A3B8]">
          Computing Sector Analytics...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.key} className="rounded-2xl border border-[#E2EEE8] bg-[#F7FBF9] p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">{kpi.label}</p>
                <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-blue-100 text-blue-800">
                  {kpi.data_status}
                </span>
              </div>
              <p className="mt-2 text-xl font-black text-[#0F172A]">{kpi.formatted_value}</p>
              {kpi.benchmark_advice && (
                <p className="mt-1 text-[10px] text-[#64748B] leading-tight">{kpi.benchmark_advice}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SECTOR RISK ALERTS & SCENARIO */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Risk Alerts */}
        {risks.length > 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 space-y-2">
            <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
              Sector Vulnerability Signals
            </p>
            {risks.map((r, idx) => (
              <div key={idx} className="text-xs text-amber-900 border-t border-amber-200/60 pt-2 first:border-t-0 first:pt-0">
                <span className="font-extrabold block text-amber-800">{r.risk_name} ({r.severity})</span>
                <span className="text-[11px] block">{r.reason}</span>
                <span className="text-[11px] font-bold text-blue-800 block mt-0.5">Rec: {r.recommendation}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
            <span className="font-extrabold block">Sector Vulnerability Status</span>
            <span className="text-[11px]">All sector KPI metrics comply with standard industry health benchmarks.</span>
          </div>
        )}

        {/* Sector What-If Scenario */}
        {scenario && (
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-3.5 text-xs text-purple-900 space-y-1">
            <span className="font-extrabold block text-purple-900 uppercase tracking-wider">
              Sector Sensitivity Test: {scenario.scenario_name}
            </span>
            <div className="flex items-center justify-between text-[11px] font-bold pt-1">
              <span>Baseline Monthly Net: ₹{scenario.baseline_net_monthly.toLocaleString('en-IN')}</span>
              <span>Stressed Net: ₹{scenario.simulated_net_monthly.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[10px] text-purple-800">
              Net Impact: <strong className="text-rose-700">₹{scenario.net_delta.toLocaleString('en-IN')}</strong> per month. {scenario.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
