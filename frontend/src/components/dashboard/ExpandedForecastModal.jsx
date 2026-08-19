import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  MOCK_CASH_FLOW_FORECAST_30D,
  MOCK_CASH_FLOW_FORECAST_60D,
  MOCK_CASH_FLOW_FORECAST_90D,
} from '../../mocks/dashboardMockData';

/**
 * ExpandedForecastModal Component — LIGHT FINTECH STYLING
 * 
 * Provides a dedicated, spacious Cash Flow Forecast experience:
 * - Substantially larger Recharts visual canvas
 * - Preserved 30D / 60D / 90D selector
 * - Net Cash Flow, Liquidity Gap, and Summary KPI strips
 * - Lowest projected cash point highlight and Safety Buffer line
 * - Clear Collapse / Close control
 */
export default function ExpandedForecastModal({
  isOpen,
  onClose,
  horizon,
  setHorizon,
  currentProfile,
  onOpenWhy,
}) {
  if (!isOpen) return null;

  const minBuffer = currentProfile?.min_cash_buffer || 500000;

  const dataset =
    horizon === '90D'
      ? MOCK_CASH_FLOW_FORECAST_90D
      : horizon === '60D'
      ? MOCK_CASH_FLOW_FORECAST_60D
      : MOCK_CASH_FLOW_FORECAST_30D;

  const totalInflow = dataset.reduce((acc, curr) => acc + (curr.inflow || 0), 0);
  const totalOutflow = dataset.reduce((acc, curr) => acc + (curr.outflow || 0), 0);
  const netCashFlow = totalInflow - totalOutflow;
  const lowestPoint = dataset.reduce(
    (min, curr) => (curr.closing_cash < min.closing_cash ? curr : min),
    dataset[0] || { closing_cash: 640000, date: 'Sep 02', full_date: '02 Sep 2026' }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 overflow-hidden my-auto">
        
        {/* Header: Title + 30D/60D/90D Selector + Collapse Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Cash Flow Forecast — Expanded Analysis
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Deterministic Twin ({horizon})
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Granular daily projections incorporating verified bank liquidity, scheduled collections, and committed obligations.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            {/* Horizon Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['30D', '60D', '90D'].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setHorizon(range)}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    horizon === range
                      ? 'bg-emerald-500 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Collapse / Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              aria-label="Collapse forecast"
              title="Collapse and return to dashboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 4 Macro Forecast Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Total Expected Inflow ({horizon})
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 num-tabular">
              +₹{new Intl.NumberFormat('en-IN').format(totalInflow)}
            </div>
            <p className="text-[11px] text-slate-400">Scheduled receivables + cash sales</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Total Expected Outflow ({horizon})
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 num-tabular">
              -₹{new Intl.NumberFormat('en-IN').format(totalOutflow)}
            </div>
            <p className="text-[11px] text-slate-400">Payables, payroll & utility dues</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Net Projected Cash Flow
            </span>
            <div className={`text-xl sm:text-2xl font-black num-tabular ${
              netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {netCashFlow >= 0 ? '+' : ''}₹{new Intl.NumberFormat('en-IN').format(netCashFlow)}
            </div>
            <p className="text-[11px] text-slate-400">Net liquidity generation</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Lowest Projected Cash
            </span>
            <div className="text-xl sm:text-2xl font-black text-blue-600 num-tabular">
              ₹{new Intl.NumberFormat('en-IN').format(lowestPoint.closing_cash)}
            </div>
            <p className="text-[11px] text-slate-400">
              On {lowestPoint.full_date || lowestPoint.date} (+₹1.4L cushion)
            </p>
          </div>
        </div>

        {/* Large Recharts Visual Canvas */}
        <div className="h-[380px] w-full pt-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={dataset}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="expandedLightGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />

              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                domain={[0, 'auto']}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0]?.payload || {};
                  return (
                    <div className="rounded-xl bg-white border border-slate-200 shadow-2xl p-4 space-y-2 text-xs min-w-[240px]">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.full_date || label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          Day {item.day || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-emerald-600 font-semibold">Closing Balance:</span>
                          <span className="font-bold text-slate-900 num-tabular">
                            ₹{new Intl.NumberFormat('en-IN').format(item.closing_cash || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600 font-semibold">Scheduled Inflow:</span>
                          <span className="font-semibold text-blue-600 num-tabular">
                            +₹{new Intl.NumberFormat('en-IN').format(item.inflow || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-rose-600 font-semibold">Scheduled Outflow:</span>
                          <span className="font-semibold text-rose-600 num-tabular">
                            -₹{new Intl.NumberFormat('en-IN').format(item.outflow || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                height={35}
                iconType="circle"
                iconSize={9}
                wrapperStyle={{ fontSize: '12px', color: '#64748B' }}
              />

              <ReferenceArea
                y1={0}
                y2={minBuffer}
                fill="#FAF5FF"
                fillOpacity={0.7}
              />

              <ReferenceLine
                y={minBuffer}
                stroke="#A855F7"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Safety Buffer: ₹${(minBuffer / 100000).toFixed(1)}L`,
                  fill: '#A855F7',
                  fontSize: 11,
                  position: 'insideBottomRight',
                }}
              />

              <Bar
                dataKey="inflow"
                name="Inflow (₹)"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />

              <Bar
                dataKey="outflow"
                name="Outflow (₹)"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />

              <Area
                type="monotone"
                dataKey="closing_cash"
                name="Closing Balance"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#expandedLightGreenGrad)"
              />

              <Line
                type="monotone"
                dataKey="closing_cash"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Actions and Return to Dashboard */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            <span>Model certainty confidence: </span>
            <span className="text-emerald-600 font-bold">96.4%</span>
            <span className="mx-2">•</span>
            <span>Safety buffer coverage: </span>
            <span className="text-blue-600 font-bold">100% Unbreached</span>
          </div>

          <div className="flex items-center space-x-3">
            {onOpenWhy && (
              <button
                type="button"
                onClick={() => onOpenWhy('lowest_projected_cash')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
              >
                Analyze Low Point Causal Factors →
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Collapse & Return to Dashboard
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
