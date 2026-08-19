import React, { useState } from 'react';

/**
 * BusinessTypeScreen Component (Step 3 of Onboarding)
 * 100% visually identical reproduction of the approved Step 3 reference design.
 * 
 * Features:
 * - Top-left VITTANAYA logo with "Financial Intelligence"
 * - Top 4-stage progress tracker:
 *    - Step 1: Welcome (Completed ✓, Green)
 *    - Step 2: Business Information (Completed ✓, Green)
 *    - Step 3: Business Type (Active 3, Blue)
 *    - Step 4: Complete Setup (Inactive 4, Gray)
 * - Two-column main container:
 *    - Left Panel:
 *       - Heading: "What kind of business / do you run?"
 *       - Subtext: "This helps us tailor your financial workspace / to the way your business operates."
 *       - Label: "Select your business type *"
 *       - 3x3 Grid of 9 Business Type Cards (Manufacturing, Trading/Wholesale, Retail, Services, Transport/Logistics, Construction, Healthcare, Education, Other)
 *       - Unselected by default; single selection; top-right blue checkmark on selected card
 *       - Back and Next buttons with purple-to-blue gradient
 *    - Right Panel:
 *       - Business understanding / clipboard illustration with floating 3D chart, pie disc, community badge, and potted plant
 *       - Heading: "We understand your business / to serve you better"
 *       - 4 Value propositions with circular icons
 * - Bottom security guarantee with lock icon
 */

export const BUSINESS_TYPE_CARDS = [
  {
    id: 'manufacturing',
    title: 'Manufacturing',
    description: 'Produce goods using raw materials and machinery',
    iconBg: 'bg-[#EEF2FF] text-[#4F46E5]',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 19h16v2H4v-2zm16-4V7l-4 3V7l-4 3V4l-6 5v10h14zM8 17H6v-6.5l2-1.67V17zm4 0h-2V11.5l2-1.5V17zm4 0h-2V11.5l2-1.5V17z" />
      </svg>
    ),
  },
  {
    id: 'trading',
    title: 'Trading / Wholesale',
    description: 'Buy in bulk and sell to retailers or businesses',
    iconBg: 'bg-[#ECFDF5] text-[#059669]',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'retail',
    title: 'Retail',
    description: 'Sell products directly to customers',
    iconBg: 'bg-[#FFFBEB] text-[#D97706]',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    id: 'services',
    title: 'Services',
    description: 'Provide professional or specialized services',
    iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 6h-4V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z" />
        <circle cx="12" cy="13" r="1.5" />
      </svg>
    ),
  },
  {
    id: 'transport',
    title: 'Transport / Logistics',
    description: 'Provide transportation or logistics services',
    iconBg: 'bg-[#F0F9FF] text-[#0284C7]',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 18.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm-12 0a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM20 8h-3V4H3a1 1 0 00-1 1v11a1 1 0 001 1h1.08a4.5 4.5 0 018.84 0h3.16a4.5 4.5 0 018.84 0H23a1 1 0 001-1v-5l-4-3zm-1 3.5V9.5h2.15l2.4 2.5H19z" />
      </svg>
    ),
  },
  {
    id: 'construction',
    title: 'Construction',
    description: 'Work on construction or infrastructure projects',
    iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3a9 9 0 00-9 9v3a1 1 0 001 1h16a1 1 0 001-1v-3a9 9 0 00-9-9zm-1 2.08c2.42.23 4.41 1.7 5.34 3.92H6.66c.93-2.22 2.92-3.69 5.34-3.92zM4.06 14A7.008 7.008 0 0110 9.07V14H4.06zm7.94 0V9.07a7.008 7.008 0 015.94 4.93H12zm-9 3a1 1 0 000 2h18a1 1 0 100-2H3z" />
      </svg>
    ),
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Provide healthcare or medical services',
    iconBg: 'bg-[#FFF1F2] text-[#E11D48]',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        <path fill="#fff" d="M10.5 7.5h3v2h2v3h-2v2h-3v-2h-2v-3h2z" />
      </svg>
    ),
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Schools, colleges or training institutes',
    iconBg: 'bg-[#F0FDFA] text-[#0D9488]',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 8.55L4.45 8.1 12 4.05l7.55 4.05L12 11.55zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
      </svg>
    ),
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Some other type of business',
    iconBg: 'bg-[#F1F5F9] text-[#64748B]',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="5" cy="12" r="2.5" />
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="19" cy="12" r="2.5" />
      </svg>
    ),
  },
];

export default function BusinessTypeScreen({
  businessType,
  onSelectBusinessType,
  onBack,
  onNext,
}) {
  const [error, setError] = useState(null);

  const handleCardClick = (typeId) => {
    onSelectBusinessType(typeId);
    if (error) setError(null);
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    if (!businessType) {
      setError('Please select your business type.');
      return;
    }
    onNext();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-x-hidden flex flex-col justify-between py-6 px-4 sm:px-8 select-none">
      
      {/* Top Header: VITTANAYA Brand + 4-Step Progress Tracker */}
      <header className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C6FF] via-[#0072FF] to-[#7A00FF] flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-xl tracking-tight">
            V
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-[#0F172A] leading-none">
              VITTANAYA
            </h1>
            <p className="text-xs font-medium text-[#64748B] tracking-normal mt-0.5">
              Financial Intelligence
            </p>
          </div>
        </div>

        {/* 4-Step Progress Tracker */}
        <div className="flex items-center space-x-2 sm:space-x-4 self-center lg:self-auto overflow-x-auto py-1">
          {/* Step 1: Welcome (Completed) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Step 1</span>
              <span className="text-xs font-semibold text-emerald-600 block leading-tight">Welcome</span>
            </div>
          </div>

          {/* Line 1: Green */}
          <div className="w-8 sm:w-14 h-[2px] bg-emerald-500 rounded-full" />

          {/* Step 2: Business Information (Completed) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Step 2</span>
              <span className="text-xs font-semibold text-emerald-600 block leading-tight whitespace-nowrap">Business Information</span>
            </div>
          </div>

          {/* Line 2: Blue */}
          <div className="w-8 sm:w-14 h-[2px] bg-blue-600 rounded-full" />

          {/* Step 3: Business Type (Active) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-500/30">
              3
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-blue-600 block leading-tight">Step 3</span>
              <span className="text-xs font-bold text-[#0F172A] block leading-tight whitespace-nowrap">Business Type</span>
            </div>
          </div>

          {/* Line 3: Gray */}
          <div className="w-8 sm:w-14 h-[2px] bg-slate-200 rounded-full" />

          {/* Step 4: Complete Setup (Inactive) */}
          <div className="flex items-center space-x-2 opacity-60">
            <div className="w-6 h-6 rounded-full border border-slate-300 bg-white text-slate-400 flex items-center justify-center text-xs font-medium">
              4
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-medium text-slate-400 block leading-tight">Step 4</span>
              <span className="text-xs font-medium text-slate-400 block leading-tight whitespace-nowrap">Complete Setup</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Two-Column Container */}
      <main className="max-w-6xl w-full mx-auto my-auto py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* ========================================================================= */}
          {/* LEFT PANEL: BUSINESS TYPE SELECTION */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-6">
            
            {/* Heading Section */}
            <div className="space-y-1.5">
              <h2 className="text-3xl sm:text-[34px] font-black text-[#0F172A] leading-[1.15] tracking-tight">
                What kind of business<br />do you run?
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] font-normal leading-relaxed">
                This helps us tailor your financial workspace<br />
                to the way your business operates.
              </p>
            </div>

            {/* Selection Grid Area */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Select your business type <span className="text-rose-500">*</span>
              </label>

              {/* 3x3 Grid of 9 Business Type Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUSINESS_TYPE_CARDS.map((card) => {
                  const isSelected = businessType === card.id;

                  return (
                    <div
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      className={`relative p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 min-h-[140px] space-y-1.5 ${
                        isSelected
                          ? 'border-2 border-blue-600 bg-white ring-2 ring-blue-600/10 shadow-sm'
                          : 'border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Top-Right Circular Checkmark Badge for Selected Card */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          ✓
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1 ${card.iconBg}`}>
                        {card.icon}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs sm:text-[13px] font-bold text-[#0F172A] leading-snug">
                        {card.title}
                      </h4>

                      {/* Description */}
                      <p className="text-[10px] sm:text-[11px] text-[#64748B] leading-tight line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Inline Validation Error Message */}
              {error && (
                <p className="text-[11px] font-medium text-rose-500 mt-1">
                  {error}
                </p>
              )}
            </div>

            {/* Bottom Navigation Actions: Back & Next */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>←</span>
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextClick}
                className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-[#7000FF] via-[#5A3FFF] to-[#00A3FF] hover:from-[#6200EA] hover:to-[#0091EA] text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL: BUSINESS UNDERSTANDING ILLUSTRATION & VALUE PROP */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-6 relative overflow-hidden">
            
            {/* Top Visual: Business Understanding Document Composition */}
            <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-[#F0F7FF] to-[#F8FAFC] rounded-2xl flex items-center justify-center p-4 border border-blue-50/80 overflow-hidden">
              
              {/* Soft background blue glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

              {/* Subtle Dot Grid Backgrounds */}
              <div className="absolute left-6 top-10 grid grid-cols-4 gap-1.5 opacity-25 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-blue-400" />
                ))}
              </div>
              <div className="absolute right-6 top-8 grid grid-cols-4 gap-1.5 opacity-25 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-blue-400" />
                ))}
              </div>

              {/* Central Clipboard / Workspace Paper */}
              <div className="relative w-52 sm:w-56 bg-white rounded-2xl p-4 shadow-xl border border-slate-100/90 space-y-3.5 z-10">
                {/* Clipboard Top Clip */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 rounded-t-md bg-blue-300 flex items-center justify-center shadow-xs">
                  <div className="w-4 h-1.5 rounded-full bg-white/80" />
                </div>

                {/* Header Row: Blue Store/Business Badge + "Your Business" */}
                <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block leading-tight">Your Business</span>
                    <span className="text-[8px] text-[#64748B] block leading-tight">Understanding your business to build the right workspace</span>
                  </div>
                </div>

                {/* 3 Status Checkmark Rows */}
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">
                      ✓
                    </span>
                    <div className="h-2 w-32 bg-slate-200/90 rounded-full" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">
                      ✓
                    </span>
                    <div className="h-2 w-38 bg-slate-200/90 rounded-full" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">
                      ✓
                    </span>
                    <div className="h-2 w-28 bg-slate-200/90 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating 3D Chart Badge (Top-Left) */}
              <div className="absolute left-3 top-6 sm:top-8 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#3B82F6] flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 z-20 transform -rotate-3 border-2 border-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>

              {/* Floating 3D Pie / Donut Disc (Bottom-Left) */}
              <div className="absolute left-3 bottom-6 sm:bottom-8 w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-100 z-20">
                <svg className="w-6 h-6 text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 2v9h9A10 10 0 0011 2z" />
                  <path d="M9 4.05A10 10 0 1019.95 15H10a1 1 0 01-1-1V4.05z" fill="#06B6D4" opacity="0.8" />
                </svg>
              </div>

              {/* Floating Community / People Badge (Right) */}
              <div className="absolute right-3 top-20 sm:top-24 w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] flex items-center justify-center text-amber-700 shadow-md border-2 border-white z-20">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>

              {/* Potted Plant (Bottom-Right) */}
              <div className="absolute right-4 bottom-4 sm:bottom-6 z-20">
                <div className="relative flex flex-col items-center">
                  <svg className="w-9 h-9 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C7.58 2 4 5.58 4 10c0 2.5 1.15 4.74 2.95 6.22C7.03 16.5 7.1 16.76 7.17 17h9.66c.07-.24.14-.5.22-.78C18.85 14.74 20 12.5 20 10c0-4.42-3.58-8-8-8zm-1 14h2v-4h-2v4z" />
                  </svg>
                  <div className="w-5 h-4 bg-slate-100 border border-slate-300 rounded-b-md shadow-xs" />
                </div>
              </div>

            </div>

            {/* Bottom Value Propositions */}
            <div className="space-y-4 pt-1">
              <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                We understand your business<br />
                to serve you better
              </h3>

              <div className="space-y-2.5 text-xs text-[#475569]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="2.2" />
                      <circle cx="12" cy="12" r="5" strokeWidth="2.2" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  <span>Personalized insights that matter</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="2.2" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 7v5l3 2" />
                    </svg>
                  </div>
                  <span>Recommendations tailored to your industry</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span>Smarter decisions with relevant data</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span>Everything in one intelligent platform</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Bottom Security Guarantee Footer */}
      <footer className="max-w-md mx-auto py-3 flex items-center justify-center space-x-3 text-center">
        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-[#0F172A] leading-tight">
            Your information is secure with us.
          </p>
          <p className="text-[11px] text-[#64748B] leading-tight">
            We never share your data with anyone.
          </p>
        </div>
      </footer>

    </div>
  );
}
