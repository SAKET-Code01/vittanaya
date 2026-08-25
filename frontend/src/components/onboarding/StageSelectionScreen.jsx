import React, { useState } from 'react';
import VittanayaLogo from '../common/VittanayaLogo';

/**
 * StageSelectionScreen Component (SIH26091 Phase A & Browser Navigation)
 * 
 * Initial stage selection screen after login:
 * 1. New Business Idea (Idea / Concept)
 * 2. Startup Phase (Early-stage / Setup)
 * 3. Established Business (Operational enterprise)
 */
export default function StageSelectionScreen({
  onSelectStage,
  onBack,
  onForward,
  canGoForward = false,
  onHome,
  onExploreDemo,
}) {
  const [selected, setSelected] = useState('new_idea');

  const stages = [
    {
      id: 'new_idea',
      badge: 'Concept & Planning',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'New Business Idea',
      subtitle: 'I want to start a new business or explore a new commercial idea.',
      bullet1: 'Takes 1 minute • Only Category, Location & Own Capital needed',
      bullet2: 'Instant hyper-local feasibility, demand radar & government scheme routing',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.493 1.508 1.333 1.508 2.316V18" />
        </svg>
      ),
      accentBorder: 'hover:border-emerald-400',
      selectedRing: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20',
    },
    {
      id: 'startup',
      badge: 'Early Stage / Pilot',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      title: 'Startup Phase',
      subtitle: 'I have started initial preparations, registration, or early pilot testing.',
      bullet1: 'Takes 2 minutes • Idea/Business name, stage & capital details',
      bullet2: 'Structured financial planning, bank loan gap & working capital breakdown',
      icon: (
        <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      ),
      accentBorder: 'hover:border-blue-400',
      selectedRing: 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20',
    },
    {
      id: 'established',
      badge: 'Operating Enterprise',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      title: 'Established Business',
      subtitle: 'My enterprise is actively operating and generating commercial revenue.',
      bullet1: 'Complete 4-Step Setup • Multi-module operational & billing setup',
      bullet2: 'Full cash-flow digital twin, receivables tracking, and runway monitoring',
      icon: (
        <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      ),
      accentBorder: 'hover:border-purple-400',
      selectedRing: 'ring-2 ring-purple-500 border-purple-500 bg-purple-50/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-x-hidden flex flex-col justify-between py-6 px-4 sm:px-8 select-none">
      
      {/* Top Header: Brand */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <VittanayaLogo size="header" onHome={onHome || onBack} className="shrink-0" />
        </div>

        {onExploreDemo && (
          <button
            type="button"
            onClick={onExploreDemo}
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-all"
          >
            Explore Demo Workspace →
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto my-auto py-6 sm:py-8 space-y-6">
        
        {/* Title Section */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Step 1 of Assessment
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            What stage is your business at?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Select the profile that best describes your current journey so we can tailor the exact financial models, local feasibility analysis, and government schemes.
          </p>
        </div>

        {/* 3 Interactive Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {stages.map((stg) => {
            const isSelected = selected === stg.id;
            return (
              <div
                key={stg.id}
                onClick={() => setSelected(stg.id)}
                className={`p-5 sm:p-6 rounded-3xl bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${stg.accentBorder} ${
                  isSelected ? stg.selectedRing : 'border-slate-200/90'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-2xs">
                      {stg.icon}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${stg.badgeColor}`}>
                      {stg.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {stg.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {stg.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
                  <div className="flex items-start space-x-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span className="font-semibold">{stg.bullet1}</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{stg.bullet2}</span>
                  </div>
                </div>

                {/* Radio selection indicator */}
                <div className="pt-2 flex items-center justify-between text-xs font-bold">
                  <span className={isSelected ? 'text-slate-900' : 'text-slate-400'}>
                    {isSelected ? 'Selected' : 'Click to select'}
                  </span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <span className="text-xs">✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={() => onSelectStage(selected)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Continue to Assessment</span>
            <span>→</span>
          </button>
        </div>

      </main>

      {/* Footer Disclaimer */}
      <footer className="max-w-5xl w-full mx-auto text-center text-[11px] text-slate-400 font-medium pt-4">
        VITTANAYA SIH26091 • MoSJE Concessional Scheme Matching & Rural Financial Structuring
      </footer>

    </div>
  );
}
