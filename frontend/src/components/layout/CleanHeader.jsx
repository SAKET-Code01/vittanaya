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
 * CleanHeader Component with Official Logo & Primary Navigation Tabs
 */
export default function CleanHeader({ activeNavId, onSelectNav, onOpenChangeBusiness, onLogout }) {
  const { clearNavigationHistory } = useWorkspace();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const select = (id) => {
    setOpen(false);
    onSelectNav(id);
  };

  const handleLogoutClick = () => {
    setOpen(false);
    if (clearNavigationHistory) clearNavigationHistory();
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-8 py-2 flex items-center justify-between gap-3 sm:gap-4 select-none">
      
      {/* 1. Left: Official Brand Logo (Global Home / Dashboard Navigation) */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onSelectNav('dashboard')}
          className="shrink-0 cursor-pointer group flex items-center rounded-lg p-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          title="Go to VITTANAYA Home (Dashboard)"
          aria-label="Go to VITTANAYA Home"
        >
          <VittanayaLogo
            size="header"
            className="transition-opacity group-hover:opacity-90 h-[36px] sm:h-[42px] md:h-[48px] lg:h-[52px]"
          />
        </button>
      </div>

      {/* 2. Center: Primary Workspace Navigation Tabs */}
      <nav className="hidden xl:flex items-center gap-1" aria-label="Primary workspace navigation">
        {primaryItems.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectNav(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeNavId === id ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* 3. Right: Menu Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center space-x-1.5"
        >
          <span>Menu</span>
          <svg className="w-3 h-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-fadeIn">
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </p>
            {primaryItems.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => select(id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                  activeNavId === id ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}

            <div className="my-1 border-t border-slate-100" />
            <button
              type="button"
              onClick={() => select('profile')}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold cursor-pointer ${
                activeNavId === 'profile' || activeNavId === 'business' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => select('settings')}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold cursor-pointer ${
                activeNavId === 'settings' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => select('help')}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold cursor-pointer ${
                activeNavId === 'help' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Help
            </button>

            <div className="my-1 border-t border-slate-100" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenChangeBusiness();
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
            >
              Switch Business / Location
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              Logout / New Session
            </button>
          </div>
        )}
      </div>

    </header>
  );
}
