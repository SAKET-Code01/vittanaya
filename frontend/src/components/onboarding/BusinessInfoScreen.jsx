import React, { useState } from 'react';
import VittanayaLogo from '../common/VittanayaLogo';

/**
 * BusinessInfoScreen Component (Step 2 of Onboarding)
 * 100% visually identical reproduction of the approved Step 2 reference design.
 * 
 * Features:
 * - Top-left VITTANAYA logo with "Financial Intelligence"
 * - Top 4-stage progress tracker (Step 1 Welcome completed ✓, Step 2 Business Information active, Step 3 & 4 inactive)
 * - Two-column main container:
 *    - Left Panel: Clean form for business identity, description, contact and location + Back & Next buttons
 *    - Right Panel: Business Profile card illustration (floating shield, mini chart, potted plant) + 4 benefit bullet points
 * - Bottom security guarantee with lock icon
 * - Form validation with clean inline states
 */
export default function BusinessInfoScreen({
  formData,
  setFormData,
  onBack,
  onNext,
  onHome,
}) {
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    const newErrors = {};
    const requiredFields = [
      ['businessName', 'Business name', 2, 150],
      ['businessDescription', 'Business description', 10, 500],
      ['phone', 'Phone number', 10, 20],
      ['email', 'Email address', 5, 120],
      ['village', 'Village / Town', 2, 100],
      ['district', 'District', 2, 100],
      ['state', 'State', 2, 100],
      ['pin', 'PIN Code', 6, 6],
    ];

    requiredFields.forEach(([field, label, minLength, maxLength]) => {
      const value = formData[field]?.trim() || '';
      if (!value) {
        newErrors[field] = `Please enter ${label.toLowerCase()}`;
      } else if (value.length < minLength || value.length > maxLength) {
        newErrors[field] = `${label} must be ${minLength === maxLength ? `${minLength} digits` : `${minLength}-${maxLength} characters`}`;
      }
    });

    const phoneDigits = formData.phone?.replace(/\D/g, '') || '';
    if (formData.phone?.trim() && (phoneDigits.length < 10 || phoneDigits.length > 15 || !/^\+?[\d\s()-]+$/.test(formData.phone.trim()))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.email?.trim() && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.pin?.trim() && !/^\d{6}$/.test(formData.pin.trim())) {
      newErrors.pin = 'PIN Code must be exactly 6 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-x-hidden flex flex-col justify-between py-6 px-4 sm:px-8 select-none">
      
      {/* Top Header: VITTANAYA Brand + 4-Step Progress Tracker */}
      <header className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <VittanayaLogo size="header" onHome={onHome || onBack} />
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

          {/* Line 1 */}
          <div className="w-8 sm:w-14 h-[2px] bg-blue-500 rounded-full" />

          {/* Step 2: Business Information (Active) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-500/30">
              2
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-blue-600 block leading-tight">Step 2</span>
              <span className="text-xs font-bold text-[#0F172A] block leading-tight whitespace-nowrap">Business Information</span>
            </div>
          </div>

          {/* Line 2 */}
          <div className="w-8 sm:w-14 h-[2px] bg-slate-200 rounded-full" />

          {/* Step 3: Business Details (Inactive) */}
          <div className="flex items-center space-x-2 opacity-60">
            <div className="w-6 h-6 rounded-full border border-slate-300 bg-white text-slate-400 flex items-center justify-center text-xs font-medium">
              3
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-medium text-slate-400 block leading-tight">Step 3</span>
              <span className="text-xs font-medium text-slate-400 block leading-tight whitespace-nowrap">Business Details</span>
            </div>
          </div>

          {/* Line 3 */}
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
          {/* LEFT PANEL: BUSINESS INFORMATION FORM */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-6">
            
            {/* Heading */}
            <div className="space-y-1.5">
              <h2 className="text-3xl sm:text-[34px] font-black text-[#0F172A] leading-[1.15] tracking-tight">
                Tell us about<br />your business
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] font-normal leading-relaxed">
                Tell us what your business does so we can tailor VITTANAYA to your situation.
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleNext} className="space-y-4">
              
              {/* Field 1: Business / Company Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Business / Company Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={formData.businessName || ''}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    placeholder="Enter your business name"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                      errors.businessName
                        ? 'border-rose-400 ring-1 ring-rose-400'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                {errors.businessName && (
                  <p className="text-[11px] font-medium text-rose-500 mt-0.5">{errors.businessName}</p>
                )}
              </div>

              {/* Business Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">Business Details</h3>
                <label className="block text-xs font-bold text-slate-800">
                  What does your business do? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formData.businessDescription || ''}
                  onChange={(e) => handleChange('businessDescription', e.target.value)}
                  placeholder="Describe your products or services"
                  rows="2"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all resize-none ${
                    errors.businessDescription
                      ? 'border-rose-400 ring-1 ring-rose-400'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                  }`}
                />
                {errors.businessDescription && (
                  <p className="text-[11px] font-medium text-rose-500 mt-0.5">{errors.businessDescription}</p>
                )}
              </div>

              {/* Fields 3 & 4: Phone & Email side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${errors.phone ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'}`}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] font-medium text-rose-500 mt-0.5">{errors.phone}</p>}
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">@</span>
                    <input
                      type="text"
                      inputMode="email"
                      value={formData.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${errors.email ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'}`}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] font-medium text-rose-500 mt-0.5">{errors.email}</p>}
                </div>
              </div>

              {/* Business Location */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">Business Location</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    ['village', 'Village / Town', 'Enter village or town'],
                    ['district', 'District', 'Enter district'],
                    ['state', 'State', 'Enter state'],
                    ['pin', 'PIN Code', 'Enter 6-digit PIN'],
                  ].map(([field, label, placeholder]) => (
                    <div key={field} className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800">
                        {label} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode={field === 'pin' ? 'numeric' : 'text'}
                        maxLength={field === 'pin' ? 6 : undefined}
                        value={formData[field] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        placeholder={placeholder}
                        className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${errors[field] ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'}`}
                      />
                      {errors[field] && <p className="text-[11px] font-medium text-rose-500 mt-0.5">{errors[field]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Back & Next */}
              <div className="pt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>←</span>
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-[#7000FF] via-[#5A3FFF] to-[#00A3FF] hover:from-[#6200EA] hover:to-[#0091EA] text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              </div>

            </form>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL: BUSINESS PROFILE VISUAL & BENEFITS */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-6 relative overflow-hidden">
            
            {/* Top Visual: Floating Profile Card Composition */}
            <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-[#F0F7FF] to-[#F8FAFC] rounded-2xl flex items-center justify-center p-4 border border-blue-50/80 overflow-hidden">
              
              {/* Soft blue/purple background blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
              <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-purple-400/10 blur-xl pointer-events-none" />

              {/* Central Business Profile Document */}
              <div className="relative w-52 sm:w-56 bg-white rounded-2xl p-4 shadow-xl border border-slate-100/90 space-y-3 z-10">
                {/* Header with building logo */}
                <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-[#0F172A]">Business Profile</span>
                </div>

                {/* 3 Status Rows with Checkmarks */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                    <div className="h-2 w-28 bg-slate-200/90 rounded-full" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                    <div className="h-2 w-36 bg-slate-200/90 rounded-full" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                    <div className="h-2 w-24 bg-slate-200/90 rounded-full" />
                  </div>
                </div>

                {/* Bottom Signature flourish */}
                <div className="pt-2 flex justify-end">
                  <span className="font-serif italic text-xs text-slate-400 font-semibold tracking-wider">
                    laa
                  </span>
                </div>
              </div>

              {/* Floating Shield Badge (Left) */}
              <div className="absolute left-3 bottom-6 sm:bottom-8 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center text-white shadow-xl shadow-blue-500/30 z-20 transform -rotate-6 border-2 border-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              {/* Floating Mini Chart Card (Right Top) */}
              <div className="absolute right-3 top-6 sm:top-8 bg-white rounded-xl p-2.5 shadow-lg border border-slate-100 z-20 space-y-1">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <div className="w-6 h-1 bg-slate-200 rounded-full" />
                </div>
                <div className="h-8 flex items-end gap-1 px-1">
                  <div className="w-1.5 h-4 bg-cyan-400 rounded-t-sm" />
                  <div className="w-1.5 h-6 bg-blue-500 rounded-t-sm" />
                  <div className="w-1.5 h-8 bg-purple-600 rounded-t-sm" />
                </div>
              </div>

              {/* Potted Plant (Right Bottom) */}
              <div className="absolute right-4 bottom-4 sm:bottom-6 z-20">
                <div className="relative flex flex-col items-center">
                  <svg className="w-9 h-9 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C7.58 2 4 5.58 4 10c0 2.5 1.15 4.74 2.95 6.22C7.03 16.5 7.1 16.76 7.17 17h9.66c.07-.24.14-.5.22-.78C18.85 14.74 20 12.5 20 10c0-4.42-3.58-8-8-8zm-1 14h2v-4h-2v4z" />
                  </svg>
                  <div className="w-5 h-4 bg-slate-100 border border-slate-300 rounded-b-md shadow-xs" />
                </div>
              </div>

            </div>

            {/* Bottom Benefits Message */}
            <div className="space-y-4 pt-1">
              <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                We’ll tailor your workspace to your business.
              </h3>

              <div className="space-y-2.5 text-xs text-[#475569]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span>Understand your business and current situation</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>See your financial position clearly</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span>Get guidance relevant to your business</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span>Keep your information under your control</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Bottom Security Guarantee */}
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
