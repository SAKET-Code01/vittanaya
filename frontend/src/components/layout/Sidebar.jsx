import React, { useState } from 'react';

/**
 * Sidebar Navigation Component — STRICT REFERENCE 1 IMPLEMENTATION
 * 
 * Complies with Reference 1 visual guide:
 * 1. Default (Collapsed): Only the narrow vertical dark rail (w-[72px]) is visible.
 * 2. Cursor Enters Logo/Rail: Smoothly expands to w-[240px] with liquid-glass transition.
 * 3. Smart Glow Follow: Smooth emerald glow follows cursor across navigation items.
 * 4. Item Clicked (Glass Locked): Selected item locks with liquid-glass effect + checkmark.
 * 5. Cursor Leaves Sidebar: Automatically collapses back to narrow rail without losing state.
 * 6. Navigation Sections: WORKSPACE, DECISION TOOLS, YOUR SPACE.
 */
export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  currentProfile,
  onOpenRegister,
  onOpenIndustrySwitcher,
  activeNavId = 'dashboard',
  onSelectNav,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const userName = currentProfile?.user_name || currentProfile?.ownerName || 'Business Owner';
  const userInitials = (userName ? userName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'BO') || 'BO';



  const selectedOps = currentProfile?.selectedOperations || ['sales', 'purchases', 'inventory'];

  // Universal Navigation Items matching Reference 1
  const workspaceItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'cash-overview',
      label: 'Cash Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'holding',
      label: currentProfile?.terminology?.holding || 'Holding',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'forecast',
      label: 'Forecast',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
    {
      id: 'digital-twin',
      label: 'Digital Twin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
  ];

  const decisionToolsItems = [
    {
      id: 'simulator',
      label: 'What-if Simulator',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const yourSpaceItems = [
    {
      id: 'profile',
      label: 'Business Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const isExpanded = isHovered || mobileOpen;

  const handleNavClick = (id) => {
    if (onSelectNav) onSelectNav(id);
    if (mobileOpen) setMobileOpen(false);
  };

  const renderNavSection = (sectionTitle, items) => (
    <div className="space-y-1 py-1">
      {/* Section Heading — visible when expanded */}
      <div
        className={`px-3 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400/90 transition-all duration-200 ${
          isExpanded ? 'opacity-100 h-auto py-1' : 'opacity-0 h-0 overflow-hidden py-0'
        }`}
      >
        {sectionTitle}
      </div>

      {items.map((item) => {
        const isActive = activeNavId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
            title={!isExpanded ? item.label : undefined}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer group ${
              isActive
                ? 'liquid-glass-active text-white font-bold'
                : 'text-slate-400 hover:text-white glow-follow-hover'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              {/* Navigation Icon */}
              <span
                className={`flex-shrink-0 transition-colors ${
                  isActive
                    ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'text-slate-400 group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                }`}
              >
                {item.icon}
              </span>

              {/* Navigation Label */}
              <span
                className={`whitespace-nowrap transition-all duration-200 truncate ${
                  isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 overflow-hidden'
                } ${isActive ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'}`}
              >
                {item.label}
              </span>
            </div>

            {/* Green checkmark indicator on active locked item (Reference 1) */}
            {isActive && isExpanded && (
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold shadow-xs animate-fadeIn">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Expandable Sidebar Container */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 bottom-0 z-50 glass-sidebar flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl ${
          mobileOpen
            ? 'translate-x-0 w-60'
            : isHovered
            ? 'w-60 translate-x-0'
            : '-translate-x-full lg:translate-x-0 lg:w-[72px]'
        }`}
      >
        {/* Brand Header — Leaf Logo in pill badge */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Green Leaf Logo */}
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)] transform group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
              </svg>
            </div>

            {/* Brand Title (Expanded) */}
            <div
              className={`transition-all duration-200 truncate ${
                isExpanded ? 'opacity-100 max-w-[130px]' : 'opacity-0 max-w-0 overflow-hidden'
              }`}
            >
              <h1 className="font-extrabold text-sm tracking-tight text-white leading-none">
                VITTANAYA
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-normal mt-0.5 truncate">
                Financial Intelligence
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Rail & Items */}
        <div className="flex-1 px-2 py-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {/* WORKSPACE */}
          {renderNavSection('Workspace', workspaceItems)}

          {/* DECISION TOOLS */}
          {renderNavSection('Decision Tools', decisionToolsItems)}

          {/* YOUR SPACE */}
          {renderNavSection('Your Space', yourSpaceItems)}
        </div>

        {/* Bottom User Profile Card (Reference 1) */}
        <div className="p-2.5 border-t border-white/10 flex-shrink-0">
          <div
            onClick={onOpenRegister}
            className={`rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all duration-200 flex items-center cursor-pointer group ${
              isExpanded ? 'p-2 space-x-2.5 bg-white/[0.03]' : 'p-2 justify-center'
            }`}
            title={`${userName} — ${currentProfile?.user_role || 'Business Owner'}`}
          >
            {/* User Avatar Circle */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                {userInitials}
              </div>
              {/* Notification Indicator Dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#070A0E]" />
            </div>

            {isExpanded && (
              <div className="flex-1 min-w-0 truncate animate-fadeIn">
                <p className="text-xs font-semibold text-white truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentProfile?.user_role || 'Business Owner'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
