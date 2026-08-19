import React from 'react';
import ContextMenu from '../common/ContextMenu';
import { formatINR } from '../../mocks/dashboardMockData';

/**
 * Mini Sparkline SVG Area Component for KPI Cards
 */
function MiniSparkline({ color = 'emerald', path, areaPath }) {
  const colorMap = {
    emerald: {
      stroke: '#10B981',
      gradStart: '#10B981',
      gradId: 'greenGrad',
    },
    blue: {
      stroke: '#3B82F6',
      gradStart: '#3B82F6',
      gradId: 'blueGrad',
    },
    rose: {
      stroke: '#F43F5E',
      gradStart: '#F43F5E',
      gradId: 'roseGrad',
    },
    purple: {
      stroke: '#8B5CF6',
      gradStart: '#8B5CF6',
      gradId: 'purpleGrad',
    },
  };

  const c = colorMap[color] || colorMap.emerald;

  return (
    <div className="w-24 sm:w-28 h-10 flex-shrink-0">
      <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={c.gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.gradStart} stopOpacity={0.25} />
            <stop offset="100%" stopColor={c.gradStart} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${c.gradId})`} />
        <path
          d={path}
          fill="none"
          stroke={c.stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Primary KPICard Component — STRICT REFERENCE 2 IMPLEMENTATION
 */
function PrimaryKPICard({
  id,
  label,
  value,
  trendText,
  trendType = 'positive',
  iconBg = 'bg-emerald-50 text-emerald-600',
  icon,
  sparkColor = 'emerald',
  sparkPath,
  sparkAreaPath,
  onClick,
  onOpenDetail,
  onHideCard,
  activeMenuId,
  setActiveMenuId,
  detailType,
}) {
  const menuItems = [
    {
      id: 'view-details',
      label: 'View Details',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      onClick: () => {
        if (onOpenDetail && detailType) onOpenDetail(detailType);
      },
    },
    {
      id: 'compare',
      label: 'Compare With',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: () => {
        if (onOpenDetail) onOpenDetail('compare');
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
        if (onHideCard) onHideCard(id);
      },
    },
  ];

  return (
    <div
      onClick={onClick}
      className="dash-card dash-card-hover p-4 sm:p-5 flex flex-col justify-between space-y-3 cursor-pointer"
    >
      {/* Card Header: Icon + Title + Three-Dot Menu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shadow-xs flex-shrink-0`}>
            {icon}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-700">
            {label}
          </span>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <ContextMenu
            menuId={`menu-${id}`}
            activeMenuId={activeMenuId}
            setActiveMenuId={setActiveMenuId}
            items={menuItems}
          />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="pt-1">
        <span className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight num-tabular">
          {value}
        </span>
      </div>

      {/* Bottom Subtitle / Trend + Mini Sparkline */}
      <div className="flex items-end justify-between gap-2 pt-1 border-t border-slate-50">
        <div className="text-xs font-semibold">
          {trendType === 'positive' && (
            <span className="text-emerald-600 flex items-center gap-1">
              <span>↑</span>
              <span>{trendText}</span>
            </span>
          )}
          {trendType === 'info' && (
            <span className="text-blue-600 flex items-center gap-1">
              <span>↑</span>
              <span>{trendText}</span>
            </span>
          )}
          {trendType === 'negative' && (
            <span className="text-rose-600 flex items-center gap-1">
              <span>↓</span>
              <span>{trendText}</span>
            </span>
          )}
          {trendType === 'purple' && (
            <span className="text-purple-600 flex items-center gap-1">
              <span>↑</span>
              <span>{trendText}</span>
            </span>
          )}
        </div>

        {/* Mini Sparkline Chart */}
        <MiniSparkline
          color={sparkColor}
          path={sparkPath}
          areaPath={sparkAreaPath}
        />
      </div>
    </div>
  );
}

/**
 * FinancialSnapshot Component — 4 Primary KPI Section
 */
export default function FinancialSnapshot({
  summary,
  onOpenDetail,
  hiddenCards = [],
  onHideCard,
  activeMenuId,
  setActiveMenuId,
}) {
  const cashVal = summary?.cash_balance !== undefined ? formatINR(summary.cash_balance) : '₹14,85,000';
  const receivablesVal = summary?.receivables_total !== undefined ? formatINR(summary.receivables_total) : '₹28,50,000';
  const payablesVal = summary?.payables_total !== undefined ? formatINR(summary.payables_total) : '₹19,20,000';
  const runwayVal = summary?.runway_days !== undefined ? `${summary.runway_days} Days` : '38 Days';

  const primaryCards = [
    {
      id: 'kpi-cash',
      label: 'Cash Available',
      value: cashVal,
      trendText: '8.5% vs last 30 days',
      trendType: 'positive',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      icon: (
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      sparkColor: 'emerald',
      sparkPath: 'M0,32 Q25,30 50,22 T80,18 T100,6',
      sparkAreaPath: 'M0,32 Q25,30 50,22 T80,18 T100,6 L100,40 L0,40 Z',
      detailType: 'cash-overview',
    },
    {
      id: 'kpi-receivables',
      label: 'Receivables',
      value: receivablesVal,
      trendText: '12.3% vs last 30 days',
      trendType: 'info',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      icon: (
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      sparkColor: 'blue',
      sparkPath: 'M0,30 Q30,32 55,20 T85,15 T100,8',
      sparkAreaPath: 'M0,30 Q30,32 55,20 T85,15 T100,8 L100,40 L0,40 Z',
      detailType: 'receivables',
    },
    {
      id: 'kpi-payables',
      label: 'Payables',
      value: payablesVal,
      trendText: '4.2% vs last 30 days',
      trendType: 'negative',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      icon: (
        <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      sparkColor: 'rose',
      sparkPath: 'M0,18 Q30,22 55,28 T85,26 T100,12',
      sparkAreaPath: 'M0,18 Q30,22 55,28 T85,26 T100,12 L100,40 L0,40 Z',
      detailType: 'payables',
    },
    {
      id: 'kpi-runway',
      label: 'Cash Runway',
      value: runwayVal,
      trendText: '6.7% vs last 30 days',
      trendType: 'purple',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      icon: (
        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      sparkColor: 'purple',
      sparkPath: 'M0,32 Q25,30 50,28 T80,24 T100,6',
      sparkAreaPath: 'M0,32 Q25,30 50,28 T80,24 T100,6 L100,40 L0,40 Z',
      detailType: 'runway',
    },
  ];

  const visibleCards = primaryCards.filter((card) => !hiddenCards.includes(card.id));

  const getGridColsClass = (count) => {
    if (count === 4) return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5';
    if (count === 3) return 'grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5';
    if (count === 2) return 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5';
    if (count === 1) return 'grid grid-cols-1 gap-4 sm:gap-5';
    return 'hidden';
  };

  return (
    <div className={getGridColsClass(visibleCards.length)}>
      {visibleCards.map((card) => (
        <PrimaryKPICard
          key={card.id}
          id={card.id}
          label={card.label}
          value={card.value}
          trendText={card.trendText}
          trendType={card.trendType}
          iconBg={card.iconBg}
          icon={card.icon}
          sparkColor={card.sparkColor}
          sparkPath={card.sparkPath}
          sparkAreaPath={card.sparkAreaPath}
          onClick={() => {
            if (onOpenDetail && card.detailType) onOpenDetail(card.detailType);
          }}
          onOpenDetail={onOpenDetail}
          onHideCard={onHideCard}
          activeMenuId={activeMenuId}
          setActiveMenuId={setActiveMenuId}
          detailType={card.detailType}
        />
      ))}
    </div>
  );
}
