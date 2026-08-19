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
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  MOCK_CASH_FLOW_FORECAST_30D,
  MOCK_CASH_FLOW_FORECAST_60D,
  MOCK_CASH_FLOW_FORECAST_90D,
  formatINR,
} from '../../mocks/dashboardMockData';
import ContextMenu from '../common/ContextMenu';
import { getDynamicForecastData } from '../../data/adaptiveWorkspaceConfig';
import { useWorkspace } from '../../context/WorkspaceContext';

/**
 * Custom Light Tooltip Component for Cash Flow Chart
 */
function CustomLightTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload || {};
  const closingCash = data.closing_cash || 0;
  const inflow = data.inflow || 0;
  const outflow = data.outflow || 0;
  const netShift = inflow - outflow;

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-xl p-3.5 space-y-2 text-xs min-w-[210px] ring-1 ring-black/5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
        <span className="font-bold text-slate-800">
          {data.full_date || label}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-medium">
          Day {data.day || '1'}
        </span>
      </div>

      <div className="space-y-1.5 text-slate-600">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Closing Balance:
          </span>
          <span className="font-bold text-slate-900 num-tabular">
            ₹{new Intl.NumberFormat('en-IN').format(closingCash)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Inflow:
          </span>
          <span className="font-semibold text-blue-600 num-tabular">
            +₹{new Intl.NumberFormat('en-IN').format(inflow)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Outflow:
          </span>
          <span className="font-semibold text-rose-600 num-tabular">
            -₹{new Intl.NumberFormat('en-IN').format(outflow)}
          </span>
        </div>

        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between font-bold">
          <span className="text-slate-500">Net Delta:</span>
          <span
            className={`num-tabular ${
              netShift >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {netShift >= 0 ? '+' : ''}₹{new Intl.NumberFormat('en-IN').format(netShift)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * CashFlowChart Component — STRICT REFERENCE 2 IMPLEMENTATION
 */
export default function CashFlowChart({
  currentProfile,
  horizon = '30D',
  setHorizon,
  onExpandForecast,
  onOpenDetail,
  onHideCard,
  activeMenuId,
  setActiveMenuId,
}) {
  const { financialData } = useWorkspace();
  const minBuffer = currentProfile?.min_cash_buffer || financialData?.min_cash_buffer || 500000;

  const rawDataset =
    horizon === '90D'
      ? MOCK_CASH_FLOW_FORECAST_90D
      : horizon === '60D'
      ? MOCK_CASH_FLOW_FORECAST_60D
      : MOCK_CASH_FLOW_FORECAST_30D;

  const dataset = getDynamicForecastData(rawDataset, financialData);

  const lowestPoint = dataset.reduce(
    (min, curr) => (curr.closing_cash < min.closing_cash ? curr : min),
    dataset[0] || { closing_cash: 640000, date: '02 Sep', full_date: '2026-09-02' }
  );

  const menuItems = [
    {
      id: 'expand',
      label: 'Expand Forecast',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ),
      onClick: () => {
        if (onExpandForecast) onExpandForecast();
      },
    },
    {
      id: 'settings',
      label: 'Forecast Settings',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => {
        if (onOpenDetail) onOpenDetail('forecast-settings');
      },
    },
    {
      id: 'detailed-view',
      label: 'View Detailed Forecast',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: () => {
        if (onExpandForecast) onExpandForecast();
      },
    },
    {
      id: 'export',
      label: 'Export Forecast',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      onClick: () => {
        if (onOpenDetail) onOpenDetail('export-forecast');
      },
    },
    { separator: true },
    {
      id: 'hide',
      label: 'Hide Card',
      danger: true,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        </svg>
      ),
      onClick: () => {
        if (onHideCard) onHideCard('chart-forecast');
      },
    },
  ];

  return (
    <div className="dash-card p-5 sm:p-6 space-y-4 flex flex-col justify-between h-full">
      
      {/* Top Header: Title + Info Icon + Horizon Selector + Three-Dot Menu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Cash Flow Forecast
          </h2>
          <span className="text-slate-400 hover:text-slate-600 cursor-pointer" title="Projected cash position based on expected inflows and outflows">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* 30D / 60D / 90D Switcher (Reference 2 style) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            {['30D', '60D', '90D'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setHorizon && setHorizon(range)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  horizon === range
                    ? 'bg-emerald-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Three-Dot Menu */}
          <ContextMenu
            menuId="menu-chart-forecast"
            activeMenuId={activeMenuId}
            setActiveMenuId={setActiveMenuId}
            items={menuItems}
          />
        </div>
      </div>

      {/* Legend Row matching Reference 2 */}
      <div className="flex items-center space-x-5 text-xs font-medium text-slate-600 flex-wrap gap-y-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Closing Balance</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Inflow</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Outflow</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-purple-500" />
          <span>Safety Buffer</span>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-[270px] w-full pt-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={dataset}
            margin={{ top: 30, right: 15, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="lightGreenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />

            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
              domain={[0, 2000000]}
              ticks={[0, 500000, 1000000, 1500000, 2000000]}
            />

            <Tooltip content={<CustomLightTooltip />} />

            {/* Shaded Safety Buffer Area */}
            <ReferenceArea
              y1={0}
              y2={minBuffer}
              fill="#FAF5FF"
              fillOpacity={0.7}
            />

            {/* Safety Buffer Dashed Reference Line */}
            <ReferenceLine
              y={minBuffer}
              stroke="#A855F7"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {/* Inflow Bars */}
            <Bar
              dataKey="inflow"
              name="Inflow"
              fill="#3B82F6"
              radius={[2, 2, 0, 0]}
              maxBarSize={8}
            />

            {/* Outflow Bars */}
            <Bar
              dataKey="outflow"
              name="Outflow"
              fill="#EF4444"
              radius={[2, 2, 0, 0]}
              maxBarSize={8}
            />

            {/* Closing Balance Area */}
            <Area
              type="monotone"
              dataKey="closing_cash"
              name="Closing Balance"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#lightGreenGrad)"
            />

            {/* Closing Balance Line with Dots */}
            <Line
              type="monotone"
              dataKey="closing_cash"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Lowest Point Floating Callout Pin (Reference 2) */}
        <div className="absolute top-8 left-[58%] -translate-x-1/2 pointer-events-none hidden sm:flex flex-col items-center animate-fadeIn">
          <div className="bg-white border border-slate-200/90 shadow-lg rounded-xl p-2 text-center text-xs space-y-0.5">
            <p className="text-[10px] text-slate-500 font-medium leading-none">
              {lowestPoint.date || 'Sep 02'} (Day 18)
            </p>
            <p className="text-xs font-black text-slate-900 num-tabular leading-none">
              {formatINR(lowestPoint.closing_cash)}
            </p>
            <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600">
              Lowest Point
            </span>
          </div>
          {/* Arrow pointing down */}
          <div className="w-2 h-2 bg-white border-r border-b border-slate-200/90 transform rotate-45 -mt-1" />
        </div>
      </div>

      {/* Bottom Alert Banner Strip matching Reference 2 */}
      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-amber-600 font-bold">⚠️</span>
          <span className="text-slate-800 font-medium">
            Lowest Projected Cash: <strong className="text-slate-900 font-bold">{formatINR(lowestPoint.closing_cash)}</strong> on {lowestPoint.date || '02 Sep'} (Day 18)
          </span>
        </div>

        <button
          type="button"
          onClick={onExpandForecast}
          className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer hover:underline flex-shrink-0"
        >
          <span>Expand Forecast</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
}
