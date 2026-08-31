import React, { useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import VittanayaLogo from '../common/VittanayaLogo';

const primaryItems = [
  ['dashboard', 'Dashboard'],
  ['business', 'Business'],
  ['feasibility', 'Feasibility'],
  ['financial-plan', 'Financial Plan'],
  ['scheme', 'Scheme'],
  ['action-plan', 'Action Plan'],
];

/**
 * CleanHeader Component — Instant-Switch Floating Glass Navbar
 * 
 * Strict Motion Rules:
 * - NO movement/position animation (no transform, top, left, width, height transitions).
 * - Instant state switch between Top (flush static) and Scrolled (floating capsule glass).
 * - Only visual properties transition smoothly (background-color, backdrop-filter, box-shadow, border-color, opacity).
 */
export default function CleanHeader({ activeNavId, onSelectNav, onOpenChangeBusiness, onLogout }) {
  const { clearNavigationHistory, setActiveNavId } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);

  // Click outside to close dropdown menu
  useEffect(() => {
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Performance-optimized passive scroll listener with requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 20;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const select = (id) => {
    setOpen(false);
    if (onSelectNav) onSelectNav(id);
  };

  const handleLogoutClick = () => {
    setOpen(false);
    if (clearNavigationHistory) clearNavigationHistory();
    if (onLogout) onLogout();
  };

  // Return to New Business Dashboard on logo click
  const handleLogoClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOpen(false);

    if (onSelectNav) {
      onSelectNav('dashboard');
    }
    if (setActiveNavId) {
      setActiveNavId('dashboard');
    }

    if (window.history && window.history.pushState) {
      window.history.pushState(
        { screen: 'workspace', navId: 'dashboard', stage: 'new_idea' },
        '',
        '#dashboard'
      );
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full relative z-50 min-h-[58px] sm:min-h-[64px]">
      <header
        className={`select-none flex items-center justify-between gap-3 sm:gap-4 ${
          isScrolled
            ? 'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[95%] sm:w-[88%] max-w-[1400px] rounded-[28px] py-2 sm:py-2.5 px-4 sm:px-6'
            : 'sticky top-0 left-0 z-40 w-full rounded-none py-3 sm:py-3.5 px-4 sm:px-8 border-b border-slate-200'
        }`}
        style={
          isScrolled
            ? {
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 12px rgba(0, 0, 0, 0.04)',
                transition:
                  'background-color 0.2s ease, backdrop-filter 0.2s ease, -webkit-backdrop-filter 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
              }
            : {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                boxShadow: 'none',
                transition:
                  'background-color 0.2s ease, backdrop-filter 0.2s ease, -webkit-backdrop-filter 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
              }
        }
      >
        {/* 1. Left: Official Brand Logo (Returns to New Business Dashboard) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleLogoClick}
            className="shrink-0 cursor-pointer group flex items-center rounded-xl p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2"
            title="Return to VITTANAYA New Business Dashboard"
            aria-label="Return to VITTANAYA New Business Dashboard"
          >
            <VittanayaLogo
              size="header"
              onHome={handleLogoClick}
              onClick={handleLogoClick}
              className="h-[34px] sm:h-[38px] md:h-[42px] lg:h-[46px] transition-opacity duration-200 group-hover:opacity-90"
            />
          </button>
        </div>

        {/* 2. Center: Primary Workspace Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1.5" aria-label="Primary workspace navigation">
          {primaryItems.map(([id, label]) => {
            const isActive = activeNavId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => select(id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-blue-50/70'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Menu Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 cursor-pointer flex items-center space-x-1.5 ${
              isScrolled
                ? 'border-slate-300/60 bg-white/80 text-slate-800 hover:bg-blue-50/60 shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Menu</span>
            <svg className="w-3 h-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-2 shadow-2xl animate-fadeIn z-[10000]">
              <p className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Workspace
              </p>
              {primaryItems.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => select(id)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                    activeNavId === id ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}

              <div className="my-1.5 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => select('profile')}
                className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold cursor-pointer ${
                  activeNavId === 'profile' || activeNavId === 'business' ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => select('settings')}
                className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold cursor-pointer ${
                  activeNavId === 'settings' ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Settings
              </button>
              <button
                type="button"
                onClick={() => select('help')}
                className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold cursor-pointer ${
                  activeNavId === 'help' ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Help & Support
              </button>

              <div className="my-1.5 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (onOpenChangeBusiness) onOpenChangeBusiness();
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-blue-700 hover:bg-blue-50 cursor-pointer"
              >
                Switch Business / Location
              </button>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                Logout / New Session
              </button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
