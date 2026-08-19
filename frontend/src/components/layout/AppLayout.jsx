import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Universal Application Layout Wrapper — STRICT REFERENCE 1 & 2 IMPLEMENTATION
 * 
 * Provides:
 * - Clean off-white background (#F8FAFC)
 * - Reference 1 dark liquid-glass hover-expanding sidebar
 * - Reference 2 top light header
 * - Responsive content container without layout shifts
 */
export default function AppLayout({
  children,
  currentProfile,
  onOpenRegister,
  onOpenIndustrySwitcher,
  activeNavId = 'dashboard',
  onSelectNav,
  onOpenCustomize,
  hiddenCardsCount = 0,
  isDemoMode = false,
  onExitDemo,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex relative overflow-x-hidden">
      
      {/* Navigation Sidebar (Reference 1) */}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        currentProfile={currentProfile}
        onOpenRegister={onOpenRegister}
        onOpenIndustrySwitcher={onOpenIndustrySwitcher}
        activeNavId={activeNavId}
        onSelectNav={onSelectNav}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[72px] relative z-10 transition-all duration-300">
        
        {/* Top Header (Reference 2) */}
        <Header
          setMobileOpen={setMobileOpen}
          currentProfile={currentProfile}
          onOpenRegister={onOpenRegister}
          onOpenIndustrySwitcher={onOpenIndustrySwitcher}
          onOpenCustomize={onOpenCustomize}
          hiddenCardsCount={hiddenCardsCount}
          activeNavId={activeNavId}
          isDemoMode={isDemoMode}
          onExitDemo={onExitDemo}
        />

        {/* Demo Mode Top Information Banner */}
        {isDemoMode && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 sm:px-8 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-xs">
                DEMO MODE
              </span>
              <span>
                You are viewing the demonstration dashboard with sample data. Real user data is not affected.
              </span>
            </div>
            {onExitDemo && (
              <button
                type="button"
                onClick={onExitDemo}
                className="ml-3 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center space-x-1 flex-shrink-0"
              >
                <span>Exit Demo</span>
                <span>✕</span>
              </button>
            )}
          </div>
        )}

        {/* Dynamic Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {children}
        </main>

      </div>
    </div>
  );
}
