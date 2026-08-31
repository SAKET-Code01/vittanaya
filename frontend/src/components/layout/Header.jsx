import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';

/**
 * Top Application Header Component — STRICT REFERENCE 2 IMPLEMENTATION
 * 
 * Matches Reference 2:
 * - Breadcrumb: Green Home icon + "Home / Dashboard"
 * - Greeting: "Good Morning, Amit 👋"
 * - Subtitle: "Here's what's happening with your business today."
 * - Right: Search input (Ctrl + K), Notification bell (3), Theme toggle, User Profile dropdown, and Customize Dashboard button
 */
export default function Header({
  setMobileOpen,
  currentProfile,
  onOpenRegister,
  onOpenIndustrySwitcher,
  onOpenCustomize,
  hiddenCardsCount = 0,
  activeNavId,
  isDemoMode = false,
  onExitDemo,
}) {
  const { appPreferences = {}, updatePreferences, activeNavId: contextActiveNavId } = useWorkspace();
  const currentNav = activeNavId || contextActiveNavId || 'dashboard';
  const isDashboard = currentNav === 'dashboard';

  const isDark = appPreferences.theme === 'dark' || (appPreferences.theme === 'system' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const userName = currentProfile?.user_name || currentProfile?.ownerName || 'Business Owner';
  const userInitials = (userName ? userName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'BO') || 'BO';

  return (
    <header className="sticky top-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-md px-4 sm:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80">
      
      {/* Left side: Mobile Toggle + Breadcrumb + Greeting */}
      <div className="flex items-start space-x-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors mt-1"
          aria-label="Open navigation sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
            <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>Home</span>
            <span>/</span>
            <span className="text-slate-700">Dashboard</span>
            {isDemoMode && (
              <>
                <span>/</span>
                <span className="text-amber-600 font-bold">Demo Mode</span>
              </>
            )}
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            <span>Hello, {userName}</span>
            <span className="text-2xl">👋</span>
            {isDemoMode && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-black tracking-wider uppercase shadow-2xs">
                DEMO MODE
              </span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Here's what's happening with your business today.
          </p>
        </div>
      </div>

      {/* Right side: Search, Notifications, Theme, Profile & Customize Dashboard */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 self-end md:self-center flex-wrap">
        
        {/* Search Bar with Ctrl + K badge */}
        <div className="relative hidden xl:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            readOnly
            className="w-56 py-2 pl-9 pr-14 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none cursor-pointer"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
              Ctrl + K
            </kbd>
          </div>
        </div>

        {/* Notification Bell with Badge 3 */}
        <button
          type="button"
          onClick={onOpenIndustrySwitcher}
          className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          aria-label="View notifications"
          title="3 unread alerts"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
            3
          </span>
        </button>

        {/* Light / Dark Theme Toggle */}
        <button
          type="button"
          onClick={() => {
            const nextTheme = isDark ? 'light' : 'dark';
            updatePreferences({ theme: nextTheme });
          }}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>

        {/* User Profile Badge (Amit Kumar / Business Owner) */}
        <div
          onClick={onOpenRegister}
          className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs group"
          title="Manage Business Profile"
        >
          <div className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 font-bold text-xs flex items-center justify-center shadow-xs">
            {userInitials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none group-hover:text-blue-700">
              {userName}
            </p>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              {currentProfile?.user_role || 'Business Owner'}
            </p>
          </div>
          <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Exit Demo Button — Rendered ONLY in Demo Mode */}
        {isDemoMode && onExitDemo && (
          <button
            type="button"
            onClick={onExitDemo}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-black transition-all shadow-xs cursor-pointer hover:shadow-sm"
            title="Exit Demo and return to onboarding"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Exit Demo</span>
          </button>
        )}

        {/* Customize Dashboard Button — Rendered ONLY on Main Dashboard */}
        {isDashboard && onOpenCustomize && (
          <button
            type="button"
            onClick={onOpenCustomize}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50/60 border border-emerald-500/40 text-blue-700 text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-sm"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Customize Dashboard</span>
            {hiddenCardsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                {hiddenCardsCount}
              </span>
            )}
          </button>
        )}

      </div>
    </header>
  );
}
