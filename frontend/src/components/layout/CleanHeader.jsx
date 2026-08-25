import React, { useEffect, useRef, useState } from 'react';

const primaryItems = [
  ['dashboard', 'Dashboard'], ['business', 'Business'], ['feasibility', 'Feasibility'],
  ['financial-plan', 'Financial Plan'], ['scheme', 'Scheme'], ['action-plan', 'Action Plan'],
];

export default function CleanHeader({ activeNavId, onSelectNav, onOpenChangeBusiness, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const close = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const select = (id) => { setOpen(false); onSelectNav(id); };
  return <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
    <button type="button" onClick={() => onSelectNav('dashboard')} className="text-left shrink-0"><span className="block font-black tracking-[0.18em] text-emerald-700">VITTANAYA</span><span className="block text-[10px] text-slate-500">Business advisory workspace</span></button>
    <nav className="hidden xl:flex items-center gap-1" aria-label="Primary workspace navigation">{primaryItems.map(([id, label]) => <button key={id} type="button" onClick={() => onSelectNav(id)} className={`px-3 py-2 rounded-lg text-xs font-semibold ${activeNavId === id ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}>{label}</button>)}</nav>
    <div className="relative" ref={menuRef}><button type="button" onClick={() => setOpen((value) => !value)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Menu</button>
      {open && <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace</p>
        {primaryItems.map(([id, label]) => <button key={id} type="button" onClick={() => select(id)} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">{label}</button>)}
        <div className="my-1 border-t border-slate-100" />
        <button type="button" onClick={() => select('profile')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">Profile</button>
        <button type="button" onClick={() => select('settings')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">Settings</button>
        <button type="button" onClick={() => select('help')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">Help</button>
        <div className="my-1 border-t border-slate-100" />
        <button type="button" onClick={() => { setOpen(false); onOpenChangeBusiness(); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-emerald-700 hover:bg-emerald-50">Switch Business / Location</button>
        <button type="button" onClick={() => { setOpen(false); onLogout(); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50">Logout / New Session</button>
      </div>}
    </div>
  </header>;
}
