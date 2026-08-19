import React, { useState } from 'react';

/**
 * BusinessInfoScreen Component (Step 2 of Onboarding)
 * 100% visually identical reproduction of the approved Step 2 reference design.
 * 
 * Features:
 * - Top-left VITTANAYA logo with "Financial Intelligence"
 * - Top 4-stage progress tracker (Step 1 Welcome completed ✓, Step 2 Business Information active, Step 3 & 4 inactive)
 * - Two-column main container:
 *    - Left Panel: Clean form (Business Name, Owner Name, Phone & Email side-by-side, Location, optional GSTIN) + Back & Next buttons
 *    - Right Panel: Business Profile card illustration (floating shield, mini chart, potted plant) + 4 benefit bullet points
 * - Bottom security guarantee with lock icon
 * - Form validation with clean inline states
 */
export default function BusinessInfoScreen({
  formData,
  setFormData,
  onBack,
  onNext,
}) {
  const [errors, setErrors] = useState({});
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Dynamic Browser Geolocation & Reverse Geocoding
  const handleDetectLocation = () => {
    setLocationNotice(null);
    if (!navigator.geolocation) {
      setLocationNotice('Location access unavailable. You can enter it manually.');
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedLocation = null;

        // 1. Primary reverse geocoding via OpenStreetMap Nominatim
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
            {
              headers: { 'Accept-Language': 'en' },
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.suburb ||
              addr.county ||
              addr.state_district ||
              addr.municipality ||
              '';
            const state = addr.state || '';
            const country = addr.country || '';
            const parts = [city, state, country].filter(Boolean);
            if (parts.length > 0) {
              detectedLocation = parts.join(', ');
            }
          }
        } catch (err) {
          // Nominatim fetch failed or timed out, attempt secondary fallback
        }

        // 2. Fallback reverse geocoding via BigDataCloud client API
        if (!detectedLocation) {
          try {
            const controller2 = new AbortController();
            const timeoutId2 = setTimeout(() => controller2.abort(), 5000);

            const res2 = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
              { signal: controller2.signal }
            );
            clearTimeout(timeoutId2);

            if (res2.ok) {
              const data2 = await res2.json();
              const city = data2.city || data2.locality || '';
              const state = data2.principalSubdivision || '';
              const country = data2.countryName || '';
              const parts = Array.from(new Set([city, state, country].filter(Boolean)));
              if (parts.length > 0) {
                detectedLocation = parts.join(', ');
              }
            }
          } catch (err2) {
            // Secondary fallback failed
          }
        }

        setIsDetectingLocation(false);

        if (detectedLocation) {
          handleChange('location', detectedLocation);
          setLocationNotice(null);
        } else {
          // In case reverse lookup failed to produce human-readable city
          setLocationNotice('Location access unavailable. You can enter it manually.');
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        // Error code 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        setLocationNotice('Location access unavailable. You can enter it manually.');
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  };

  const handleNext = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.businessName || !formData.businessName.trim()) {
      newErrors.businessName = 'Please enter your business name';
    }
    if (!formData.ownerName || !formData.ownerName.trim()) {
      newErrors.ownerName = 'Please enter owner or contact name';
    }
    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = 'Please enter phone number';
    }
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Please enter email address';
    }
    if (!formData.location || !formData.location.trim()) {
      newErrors.location = 'Please enter business location';
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
                Basic information to personalize your<br />
                VITTANAYA workspace.
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

              {/* Field 2: Owner / Contact Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Owner / Contact Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={formData.ownerName || ''}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    placeholder="Enter owner / contact name"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                      errors.ownerName
                        ? 'border-rose-400 ring-1 ring-rose-400'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                {errors.ownerName && (
                  <p className="text-[11px] font-medium text-rose-500 mt-0.5">{errors.ownerName}</p>
                )}
              </div>

              {/* Fields 3 & 4: Phone & Email side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Phone */}
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
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.phone
                          ? 'border-rose-400 ring-1 ring-rose-400'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] font-medium text-rose-500 mt-0.5">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.email
                          ? 'border-rose-400 ring-1 ring-rose-400'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-medium text-rose-500 mt-0.5">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Field 5: Business Location */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Business Location <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {isDetectingLocation ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin inline-block" />
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <span>📍</span>
                        <span>Auto-detect</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  {/* Left Pin Indicator */}
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    title="Click to detect location"
                    className={`absolute inset-y-0 left-0 pl-3.5 flex items-center cursor-pointer transition-colors ${
                      isDetectingLocation
                        ? 'text-blue-600'
                        : formData.location
                        ? 'text-emerald-600 hover:text-blue-600'
                        : 'text-slate-400 hover:text-blue-600'
                    }`}
                  >
                    {isDetectingLocation ? (
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <svg className="w-4 h-4 text-blue-600 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>

                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => {
                      handleChange('location', e.target.value);
                      if (locationNotice) setLocationNotice(null);
                    }}
                    placeholder={isDetectingLocation ? 'Detecting your location...' : 'Enter business location'}
                    disabled={isDetectingLocation}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                      errors.location
                        ? 'border-rose-400 ring-1 ring-rose-400'
                        : isDetectingLocation
                        ? 'border-blue-400 ring-1 ring-blue-400/30 bg-blue-50/20'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                    }`}
                  />

                  {/* Right Action: Detect trigger icon or checkmark */}
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                    {isDetectingLocation ? (
                      <span className="text-xs text-blue-600 font-medium animate-pulse">Detecting...</span>
                    ) : formData.location ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold" title="Location set">
                        ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        title="Auto-detect current location"
                        className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="7" strokeWidth="2" />
                          <circle cx="12" cy="12" r="2" fill="currentColor" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Validation Error */}
                {errors.location && (
                  <p className="text-[11px] font-medium text-rose-500 mt-0.5">{errors.location}</p>
                )}

                {/* Subtle, non-intrusive notification if permission denied or lookup unavailable */}
                {locationNotice && (
                  <p className="text-[11px] font-medium text-slate-500 flex items-center space-x-1.5 mt-1 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
                    <span className="text-amber-500 font-bold">ℹ</span>
                    <span>{locationNotice}</span>
                  </p>
                )}
              </div>

              {/* Field 6: GST Number (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  GST Number (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={formData.gstin || ''}
                    onChange={(e) => handleChange('gstin', e.target.value)}
                    placeholder="Enter GST number (optional)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all uppercase font-mono"
                  />
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
                We’ll set up your personalized<br />
                financial workspace
              </h3>

              <div className="space-y-2.5 text-xs text-[#475569]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span>Get real-time insights about your business</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Track cash flow, invoices & expenses</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span>Make smarter, data-driven decisions</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span>All in one secure platform</span>
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
