import React, { useState, useCallback } from 'react';
import VittanayaLogo from '../common/VittanayaLogo';
import SearchableLocationSelect from '../common/SearchableLocationSelect';
import locationService from '../../services/locationService';

/**
 * BusinessInfoScreen Component (Step 2 of Onboarding)
 * 100% visually identical reproduction of the approved Step 2 reference design.
 * 
 * Features:
 * - Top-left VITTANAYA logo with "Financial Intelligence"
 * - Top 4-stage progress tracker (Step 1 Welcome completed ✓, Step 2 Business Information active, Step 3 & 4 inactive)
 * - Two-column main container:
 *    - Left Panel: Clean form for business identity, description, contact and hierarchical location + Back & Next buttons
 *    - Right Panel: Business Profile card illustration (floating shield, mini chart, potted plant) + 4 benefit bullet points
 * - Bottom security guarantee with lock icon
 * - Form validation with clean inline states & hierarchical cascading location selection
 */
export default function BusinessInfoScreen({
  formData = {},
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

  // Location Loading Callbacks
  const loadStates = useCallback(async () => {
    return locationService.getStates();
  }, []);

  const loadDistricts = useCallback(async () => {
    if (!formData.stateId && !formData.state) return [];
    let sId = formData.stateId;
    if (!sId && formData.state) {
      const states = await locationService.getStates();
      const match = states.find((s) => s.name.toLowerCase() === formData.state.toLowerCase());
      sId = match?.id || 'OD';
    }
    return locationService.getDistricts(sId || 'OD');
  }, [formData.stateId, formData.state]);

  const loadBlocks = useCallback(async () => {
    if (!formData.districtId && !formData.district) return [];
    const dId = formData.districtId || `${formData.stateId || 'OD'}_DIST`;
    return locationService.getBlocks(dId);
  }, [formData.districtId, formData.district, formData.stateId]);

  const loadVillages = useCallback(async () => {
    if (!formData.blockId && !formData.block) return [];
    const bId = formData.blockId || `${formData.districtId || 'OD_KH'}_BLK1`;
    return locationService.getLocalities(bId);
  }, [formData.blockId, formData.block, formData.districtId]);

  // Hierarchical Cascading Location Handlers with Parent Clears
  const handleStateChange = (stateObj) => {
    setFormData((prev) => ({
      ...prev,
      state: stateObj.name,
      stateId: stateObj.id,
      district: '',
      districtId: '',
      block: '',
      blockId: '',
      city: '',
      cityId: '',
      village: '',
      villageId: '',
    }));
    setErrors((prev) => ({ ...prev, state: null, district: null, village: null }));
  };

  const handleStateClear = () => {
    setFormData((prev) => ({
      ...prev,
      state: '',
      stateId: '',
      district: '',
      districtId: '',
      block: '',
      blockId: '',
      city: '',
      cityId: '',
      village: '',
      villageId: '',
    }));
  };

  const handleDistrictChange = (districtObj) => {
    setFormData((prev) => ({
      ...prev,
      district: districtObj.name,
      districtId: districtObj.id,
      block: '',
      blockId: '',
      city: '',
      cityId: '',
      village: '',
      villageId: '',
    }));
    setErrors((prev) => ({ ...prev, district: null, village: null }));
  };

  const handleDistrictClear = () => {
    setFormData((prev) => ({
      ...prev,
      district: '',
      districtId: '',
      block: '',
      blockId: '',
      city: '',
      cityId: '',
      village: '',
      villageId: '',
    }));
  };

  const handleBlockChange = (blockObj) => {
    setFormData((prev) => ({
      ...prev,
      block: blockObj.name,
      blockId: blockObj.id,
      city: blockObj.name,
      cityId: blockObj.id,
      village: '',
      villageId: '',
    }));
  };

  const handleBlockClear = () => {
    setFormData((prev) => ({
      ...prev,
      block: '',
      blockId: '',
      city: '',
      cityId: '',
      village: '',
      villageId: '',
    }));
  };

  const handleVillageChange = (villageObj) => {
    setFormData((prev) => ({
      ...prev,
      village: villageObj.name,
      villageId: villageObj.id,
    }));
    setErrors((prev) => ({ ...prev, village: null }));
  };

  const handleVillageClear = () => {
    setFormData((prev) => ({
      ...prev,
      village: '',
      villageId: '',
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    const newErrors = {};
    const requiredFields = [
      ['businessName', 'Business name', 2, 150],
      ['businessDescription', 'Business description', 10, 500],
      ['phone', 'Phone number', 10, 20],
      ['email', 'Email address', 5, 120],
      ['state', 'State', 2, 100],
      ['district', 'District', 2, 100],
      ['village', 'Village / Locality', 2, 100],
      ['pin', 'PIN Code', 6, 6],
    ];

    requiredFields.forEach(([field, label, minLength, maxLength]) => {
      const value = formData[field]?.toString().trim() || '';
      if (!value) {
        newErrors[field] = `Please select or enter ${label.toLowerCase()}`;
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
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Step 1</span>
              <span className="text-xs font-semibold text-blue-700 block leading-tight">Welcome</span>
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

              {/* ========================================================================= */}
              {/* HIERARCHICAL BUSINESS LOCATION SECTION */}
              {/* ========================================================================= */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Business Location (Catchment Area)
                  </h3>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Hierarchical Selection
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* 1. State * */}
                  <SearchableLocationSelect
                    label="State"
                    required
                    value={formData.state || ''}
                    placeholder="Select state"
                    loadOptions={loadStates}
                    parentSelected={true}
                    onChange={handleStateChange}
                    onClear={handleStateClear}
                    error={errors.state}
                    helperText="Primary state territory"
                  />

                  {/* 2. District * */}
                  <SearchableLocationSelect
                    label="District"
                    required
                    value={formData.district || ''}
                    placeholder={formData.state ? "Select district" : "Select state first"}
                    loadOptions={loadDistricts}
                    parentSelected={Boolean(formData.state || formData.stateId)}
                    parentName="State"
                    disabled={!formData.state && !formData.stateId}
                    onChange={handleDistrictChange}
                    onClear={handleDistrictClear}
                    error={errors.district}
                    helperText="Administrative district"
                  />

                  {/* 3. Block / Tehsil / City */}
                  <SearchableLocationSelect
                    label="Block / Tehsil / City"
                    value={formData.block || formData.city || ''}
                    placeholder={formData.district ? "Select or enter block" : "Select district first"}
                    loadOptions={loadBlocks}
                    parentSelected={Boolean(formData.district || formData.districtId)}
                    parentName="District"
                    disabled={!formData.district && !formData.districtId}
                    onChange={handleBlockChange}
                    onClear={handleBlockClear}
                    error={errors.block}
                    helperText="Sub-division / Block"
                  />

                  {/* 4. Village / Town / Locality * */}
                  <SearchableLocationSelect
                    label="Village / Town / Locality"
                    required
                    value={formData.village || ''}
                    placeholder={formData.district ? "Select or enter village" : "Select district first"}
                    loadOptions={loadVillages}
                    parentSelected={Boolean(formData.district || formData.districtId)}
                    parentName="District"
                    disabled={!formData.district && !formData.districtId}
                    onChange={handleVillageChange}
                    onClear={handleVillageClear}
                    error={errors.village}
                    helperText="Operating street / village"
                  />
                </div>

                {/* Row 3: PIN Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      PIN Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.pin || ''}
                      onChange={(e) => handleChange('pin', e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit PIN"
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.pin
                          ? 'border-rose-400 ring-1 ring-rose-400'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                      }`}
                    />
                    {errors.pin && (
                      <p className="text-[11px] font-medium text-rose-500 mt-0.5">{errors.pin}</p>
                    )}
                  </div>
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
                  className="px-10 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-1.5 cursor-pointer"
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
              
              {/* Soft blue background blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
              <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-blue-400/10 blur-xl pointer-events-none" />

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
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                    <div className="h-2 w-28 bg-slate-200/90 rounded-full" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                    <div className="h-2 w-36 bg-slate-200/90 rounded-full" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                    <div className="h-2 w-20 bg-slate-200/90 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Benefit Bullets */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Why this matters</h4>
              <ul className="space-y-2.5 text-xs text-[#334155] font-medium">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-black">•</span>
                  <span>Enables localized market & competitor intelligence</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-black">•</span>
                  <span>Identifies state & central subsidy schemes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-black">•</span>
                  <span>Calibrates bankable working capital formulas</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </main>

      {/* Bottom Guarantee */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 flex items-center justify-center space-x-1.5 pt-4">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Your data is encrypted and confidential.</span>
      </footer>

    </div>
  );
}
