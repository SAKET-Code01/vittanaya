import React, { useState } from 'react';
import ContextMenu from '../common/ContextMenu';

/**
 * AttentionFeed Component — STRICT REFERENCE 2 IMPLEMENTATION
 * 
 * Displays 3 actionable alert items:
 * 1. 3 receivables approaching due date (Total: ₹4,20,000)
 * 2. Projected cash reaches lowest point on Day 18 (On 02 Sep 2024)
 * 3. One payment concentration requires monitoring (Vendor: Steel Works)
 * 
 * Interactive capabilities:
 * - Click alert navigates to respective detail module
 * - Three-dot menu: View All Alerts, Filter Alerts, Mark All as Reviewed, Hide Card
 * - Footer link: View All Alerts →
 */
export default function AttentionFeed({
  onOpenDetail,
  onHideCard,
  activeMenuId,
  setActiveMenuId,
}) {
  const [filterType, setFilterType] = useState('All');
  const [reviewedAlertIds, setReviewedAlertIds] = useState([]);

  const alerts = [
    {
      id: 'alert-1',
      category: 'Receivables',
      title: '3 receivables approaching due date',
      sub: 'Total: ₹4,20,000',
      iconBg: 'bg-rose-50 text-rose-500',
      icon: (
        <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      targetDetail: 'receivables',
    },
    {
      id: 'alert-2',
      category: 'Cash Flow',
      title: 'Projected cash reaches lowest point on Day 18',
      sub: 'On 02 Sep 2024',
      iconBg: 'bg-amber-50 text-amber-500',
      icon: (
        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      targetDetail: 'runway',
    },
    {
      id: 'alert-3',
      category: 'Payments',
      title: 'One payment concentration requires monitoring',
      sub: 'Vendor: Steel Works',
      iconBg: 'bg-blue-50 text-blue-500',
      icon: (
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      targetDetail: 'payables',
    },
  ];

  const handleMarkAllReviewed = () => {
    setReviewedAlertIds(alerts.map((a) => a.id));
  };

  const filteredAlerts = alerts.filter((item) => {
    if (filterType === 'All') return true;
    return item.category === filterType;
  });

  const menuItems = [
    {
      id: 'view-all',
      label: 'View All Alerts',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      onClick: () => {
        if (onOpenDetail) onOpenDetail('all-alerts');
      },
    },
    {
      id: 'mark-reviewed',
      label: 'Mark All as Reviewed',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
      onClick: handleMarkAllReviewed,
    },
    {
      id: 'filter-receivables',
      label: filterType === 'All' ? 'Filter: Receivables Only' : 'Filter: Show All',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      ),
      onClick: () => {
        setFilterType((prev) => (prev === 'All' ? 'Receivables' : 'All'));
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
        if (onHideCard) onHideCard('feed-attention');
      },
    },
  ];

  return (
    <div className="dash-card p-5 sm:p-6 space-y-3.5 flex flex-col justify-between h-full">
      
      {/* Top Header: Title + Info Icon + Three-Dot Menu */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Needs Attention
          </h3>
          <span className="text-slate-400 hover:text-slate-600" title="Prioritized actionable financial alerts">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <ContextMenu
            menuId="menu-feed-attention"
            activeMenuId={activeMenuId}
            setActiveMenuId={setActiveMenuId}
            items={menuItems}
          />
        </div>
      </div>

      {/* 3 Alert Rows matching Reference 2 */}
      <div className="space-y-2.5">
        {filteredAlerts.map((alert) => {
          const isReviewed = reviewedAlertIds.includes(alert.id);

          return (
            <div
              key={alert.id}
              onClick={() => {
                if (onOpenDetail && alert.targetDetail) {
                  onOpenDetail(alert.targetDetail);
                }
              }}
              className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs ${
                isReviewed
                  ? 'bg-slate-50/60 border-slate-200/60 opacity-60'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/40'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl ${alert.iconBg} flex items-center justify-center flex-shrink-0 shadow-xs`}>
                  {alert.icon}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {alert.title}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {alert.sub}
                  </p>
                </div>
              </div>

              <div className="text-slate-400 hover:text-slate-600 flex-shrink-0 pl-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
        <button
          type="button"
          onClick={() => {
            if (onOpenDetail) onOpenDetail('all-alerts');
          }}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View All Alerts</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
}
