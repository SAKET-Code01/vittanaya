import React, { useState, useCallback } from 'react';
import VittanayaLogo from '../common/VittanayaLogo';
import SearchableLocationSelect from '../common/SearchableLocationSelect';
import locationService from '../../services/locationService';

const POPULAR_CATEGORIES = [
  { id: 'poultry', label: 'Poultry Farming', icon: '🐔', defaultActivity: 'Commercial Broiler Farming (1000 birds)' },
  { id: 'dairy', label: 'Dairy & Livestock', icon: '🐄', defaultActivity: 'Dairy Cattle Milk Production & Chilling' },
  { id: 'agro_processing', label: 'Agro-Processing & Food', icon: '🌾', defaultActivity: 'Mini Rice Mill & Spice Processing' },
  { id: 'transport', label: 'Transport & Logistics', icon: '🚚', defaultActivity: 'Light Commercial Vehicle Freight' },
  { id: 'crafts', label: 'Artisan & Handicrafts', icon: '🎨', defaultActivity: 'Traditional Handloom & Handicrafts' },
  { id: 'retail', label: 'Rural Retail & Agrivet', icon: '🏪', defaultActivity: 'Agri-Inputs & General Store' },
  { id: 'fisheries', label: 'Fisheries & Aquaculture', icon: '🐟', defaultActivity: 'Composite Freshwater Fish Culture' },
  { id: 'manufacturing', label: 'Small Manufacturing', icon: '⚙️', defaultActivity: 'Custom Metal Fabrication & Job Work' },
  { id: 'services', label: 'Services & Repair', icon: '🔧', defaultActivity: 'Automotive & Machinery Repair Workshop' },
];

const CAPITAL_CHIPS = [
  { label: '₹ 500', value: 500 },
  { label: '₹ 1,000', value: 1000 },
  { label: '₹ 2,000', value: 2000 },
  { label: '₹ 5,000', value: 5000 },
  { label: '₹ 10,000', value: 10000 },
  { label: '₹ 25,000', value: 25000 },
  { label: '₹ 50,000', value: 50000 },
  { label: '₹ 1,00,000', value: 100000 },
];

const PROJECT_COST_CHIPS = [
  { label: '₹ 1 Lakh', value: 100000 },
  { label: '₹ 2 Lakh', value: 200000 },
  { label: '₹ 5 Lakh', value: 500000 },
  { label: '₹ 8 Lakh', value: 800000 },
  { label: '₹ 10 Lakh', value: 1000000 },
  { label: '₹ 15 Lakh', value: 1500000 },
  { label: '₹ 20 Lakh', value: 2000000 },
];

/**
 * NewIdeaIntakeScreen Component
 * 
 * Professional 3-Section Intake for New Business Ideas:
 * - SECTION A: Business Identity (Business / Venture Name *, Category *, Activity)
 * - SECTION B: Business Location (5-level cascading Indian administrative hierarchy)
 * - SECTION C: Financial Inputs (Margin Capital *, Beneficiary Category *, Area Classification *)
 */
export default function NewIdeaIntakeScreen({
  draft = {},
  setDraft,
  onComplete,
  onBack,
  onForward,
  canGoForward = false,
  onHome,
}) {
  // Section A: Business Identity
  const businessName = draft.businessName || '';
  const category = draft.category || '';
  const specificActivity = draft.specificActivity || '';

  // Section B: 5-Level Location Hierarchy
  const state = draft.state || '';
  const stateId = draft.stateId || '';
  const district = draft.district || '';
  const districtId = draft.districtId || '';
  const city = draft.city || draft.cityTown || '';
  const cityId = draft.cityId || '';
  const block = draft.block || '';
  const blockId = draft.blockId || '';
  const locality = draft.locality || draft.village || '';
  const localityId = draft.localityId || '';
  const pin = draft.pin || '';

  // Section C: Financial & Beneficiary Inputs
  const projectCost = draft.projectCost ?? draft.project_cost ?? '';
  const ownCapital = draft.ownCapital ?? '';
  const socialCategory = draft.socialCategory || '';
  const areaType = draft.areaType || '';

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    if (setDraft) {
      setDraft((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleCategorySelect = (item) => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        category: item.id,
      }));
    }
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: null }));
    }
  };

  // Cascading Location Handlers with Parent Clears
  const handleStateChange = (stateObj) => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        state: stateObj.name,
        stateId: stateObj.id,
        // Clear all downstream children
        district: '',
        districtId: '',
        city: '',
        cityId: '',
        cityTown: '',
        block: '',
        blockId: '',
        locality: '',
        localityId: '',
        village: '',
      }));
    }
    setErrors((prev) => ({ ...prev, state: null, district: null, city: null }));
  };

  const handleStateClear = () => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        state: '',
        stateId: '',
        district: '',
        districtId: '',
        city: '',
        cityId: '',
        cityTown: '',
        block: '',
        blockId: '',
        locality: '',
        localityId: '',
        village: '',
      }));
    }
  };

  const handleDistrictChange = (districtObj) => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        district: districtObj.name,
        districtId: districtObj.id,
        // Clear downstream children
        city: '',
        cityId: '',
        cityTown: '',
        block: '',
        blockId: '',
        locality: '',
        localityId: '',
        village: '',
      }));
    }
    setErrors((prev) => ({ ...prev, district: null, city: null }));
  };

  const handleDistrictClear = () => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        district: '',
        districtId: '',
        city: '',
        cityId: '',
        cityTown: '',
        block: '',
        blockId: '',
        locality: '',
        localityId: '',
        village: '',
      }));
    }
  };

  const handleCityChange = (cityObj) => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        city: cityObj.name,
        cityId: cityObj.id,
        cityTown: cityObj.name,
        // Clear downstream children
        block: '',
        blockId: '',
        locality: '',
        localityId: '',
        village: '',
      }));
    }
    setErrors((prev) => ({ ...prev, city: null }));
  };

  const handleCityClear = () => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        city: '',
        cityId: '',
        cityTown: '',
        block: '',
        blockId: '',
        locality: '',
        localityId: '',
        village: '',
      }));
    }
  };

  const handleBlockChange = (blockObj) => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        block: blockObj.name,
        blockId: blockObj.id,
        locality: '',
        localityId: '',
        village: '',
      }));
    }
  };

  const handleBlockClear = () => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        block: '',
        blockId: '',
        locality: '',
        localityId: '',
        village: '',
      }));
    }
  };

  const handleLocalityChange = (locObj) => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        locality: locObj.name,
        localityId: locObj.id,
        village: locObj.name,
      }));
    }
  };

  const handleLocalityClear = () => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        locality: '',
        localityId: '',
        village: '',
      }));
    }
  };

  // Location Data Loaders for Dependent Dropdowns
  const loadStates = useCallback(async () => {
    return await locationService.getStates();
  }, []);

  const loadDistricts = useCallback(async () => {
    if (!stateId && !state) return [];
    return await locationService.getDistricts(stateId || state);
  }, [stateId, state]);

  const loadCities = useCallback(async () => {
    if (!districtId && !district) return [];
    return await locationService.getCities(districtId || district);
  }, [districtId, district]);

  const loadBlocks = useCallback(async () => {
    if (!cityId && !city) return [];
    return await locationService.getBlocks(cityId || city);
  }, [cityId, city]);

  const loadLocalities = useCallback(async () => {
    if (!blockId && !block) return [];
    return await locationService.getLocalities(blockId || block);
  }, [blockId, block]);

  const selectedCatObj = POPULAR_CATEGORIES.find((c) => c.id === category);
  const activityPlaceholder = selectedCatObj
    ? `e.g. ${selectedCatObj.defaultActivity}`
    : 'Enter the specific business activity or product';

  /**
   * Submit and launch AI Opportunity Structuring Engine
   */
  const handleAnalyzeIdea = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const newErrors = {};

    // 1. Business Name Validation
    if (!businessName.toString().trim()) {
      newErrors.businessName = 'Business / Venture Name is required';
    } else if (businessName.toString().trim().length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters long';
    }

    // 2. Category Validation
    if (!category) {
      newErrors.category = 'Please select a business category';
    }

    // 3. Location Hierarchy Validation
    if (!state.toString().trim()) {
      newErrors.state = 'State is required';
    }
    if (!district.toString().trim()) {
      newErrors.district = 'District is required';
    }
    if (!city.toString().trim()) {
      newErrors.city = 'City / Town is required';
    }
    if (pin.toString().trim() && !/^\d{6}$/.test(pin.toString().trim())) {
      newErrors.pin = 'Valid 6-digit PIN code required';
    }

    // 4. Financial Inputs Validation
    if (projectCost !== '' && Number(projectCost) < 0) {
      newErrors.projectCost = 'Project cost cannot be negative';
    }
    if (!ownCapital && ownCapital !== 0) {
      newErrors.ownCapital = 'Please enter your available starting capital';
    } else if (Number(ownCapital) < 0) {
      newErrors.ownCapital = 'Capital amount cannot be negative';
    } else if (Number(ownCapital) === 0 && !ownCapital.toString().trim()) {
      newErrors.ownCapital = 'Please enter your available starting capital';
    }
    if (!socialCategory) {
      newErrors.socialCategory = 'Please select a beneficiary category';
    }
    if (!areaType) {
      newErrors.areaType = 'Please select an area classification';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElem = document.querySelector(`[name="${firstErrorKey}"]`) || document.getElementById(firstErrorKey);
      if (errorElem) {
        errorElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const matchedCat = selectedCatObj || { label: 'Micro Enterprise' };
      const rawLocationParts = [locality || draft.village, block, city, district, state].filter(Boolean);
      // Deduplicate adjacent identical names
      const cleanLocationParts = rawLocationParts.filter((val, idx, arr) => arr.indexOf(val) === idx);
      const cleanLocationString = cleanLocationParts.join(', ') || `${city || district}, ${state}`;

      const assessmentData = {
        stage: 'new_idea',
        businessName: businessName.trim(),
        name: businessName.trim(),
        category: matchedCat.label,
        industry: specificActivity.trim() || matchedCat.defaultActivity || matchedCat.label,
        businessType:
          category === 'transport' || category === 'services'
            ? 'services'
            : category === 'retail'
            ? 'retail'
            : 'manufacturing',
        state: state.trim(),
        stateId: stateId || '',
        district: district.trim(),
        districtId: districtId || '',
        city: city.trim(),
        cityId: cityId || '',
        block: block.trim(),
        blockId: blockId || '',
        village: (locality || draft.village || '').trim(),
        locality: locality.trim(),
        localityId: localityId || '',
        pin: pin.trim(),
        location: cleanLocationString,
        locationData: {
          state: state.trim(),
          state_code: stateId || '',
          district: district.trim(),
          district_code: districtId || '',
          city: city.trim(),
          block: block.trim(),
          village: (locality || draft.village || '').trim(),
          locality: locality.trim(),
          pin: pin.trim(),
          latitude: null,
          longitude: null,
        },
        locationHierarchy: {
          state: { id: stateId || '', name: state.trim() },
          district: { id: districtId || '', name: district.trim() },
          city: { id: cityId || '', name: city.trim() },
          block: { id: blockId || '', name: block.trim() },
          locality: { id: localityId || '', name: locality.trim() },
        },
        ownCapital: Number(ownCapital),
        available_margin_capital: Number(ownCapital),
        project_cost: projectCost !== '' && Number(projectCost) > 0 ? Number(projectCost) : 0,
        projectCost: projectCost !== '' && Number(projectCost) > 0 ? Number(projectCost) : 0,
        existingInvestment: 0,
        socialCategory,
        areaType,
        selectedOps: ['sales', 'purchases'],
        description: `New proposed ${matchedCat.label} enterprise (${businessName.trim()}) in ${cleanLocationString}. Available margin capital: ₹${Number(ownCapital).toLocaleString('en-IN')}.`,
      };

      if (onComplete) {
        onComplete(assessmentData);
      }
    } catch (err) {
      console.error('Error submitting new business idea:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      
      {/* 1. Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-200">
        <VittanayaLogo size="header" onHome={onHome || onBack} className="shrink-0" />
        
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-slate-600 hover:text-blue-700 bg-white border border-slate-200 hover:border-blue-200 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
            >
              ← Back
            </button>
          )}
          {canGoForward && onForward && (
            <button
              type="button"
              onClick={onForward}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
            >
              Forward →
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Form Container */}
      <main className="max-w-4xl w-full mx-auto my-6">
        <div className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <span>💡</span>
            <span>Stage 1 • New Business Idea</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Structure Your New Business Opportunity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Provide your business identity, location hierarchy, and capital to instantly generate your hyper-local feasibility model and subsidy blueprints.
          </p>
        </div>

        <form onSubmit={handleAnalyzeIdea} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
          
          {/* =========================================================================
              SECTION A: BUSINESS IDENTITY
             ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                  A
                </span>
                <span>Business Identity</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-semibold">Core Venture Info</span>
            </div>

            {/* Field: Business / Venture Name * */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="businessNameInput" className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>Business / Venture Name</span>
                  <span className="text-rose-500 font-black">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Required</span>
              </div>
              <input
                id="businessNameInput"
                name="businessName"
                type="text"
                value={businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                placeholder="Enter the name you want to give your business"
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 transition-all ${
                  errors.businessName
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 bg-white'
                }`}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This name will appear across your Vittanaya workspace and reports.
              </p>
              {errors.businessName && (
                <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                  <span>⚠</span>
                  <span>{errors.businessName}</span>
                </p>
              )}
            </div>

            {/* Field: Business Category * */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>Select Business Category</span>
                  <span className="text-rose-500 font-black">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Choose primary domain</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {POPULAR_CATEGORIES.map((item) => {
                  const isSelected = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleCategorySelect(item)}
                      className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all text-xs font-bold cursor-pointer min-h-[48px] ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-2xs ring-2 ring-blue-500/30'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/40 hover:bg-white'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <span className="leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.category && (
                <p className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1">
                  <span>⚠</span>
                  <span>{errors.category}</span>
                </p>
              )}
            </div>

            {/* Field: Specific Activity / Product */}
            <div className="pt-1">
              <label htmlFor="specificActivityInput" className="text-xs font-bold text-slate-700 block mb-1.5">
                Specific Activity / Product Specification
              </label>
              <input
                id="specificActivityInput"
                name="specificActivity"
                type="text"
                value={specificActivity}
                onChange={(e) => updateField('specificActivity', e.target.value)}
                placeholder={activityPlaceholder}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* =========================================================================
              SECTION B: BUSINESS LOCATION (5-LEVEL CASCADING HIERARCHY)
             ========================================================================= */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                  B
                </span>
                <span>Business Location (Catchment Area)</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-semibold">5-Level Hierarchy</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Select your administrative location in sequence. Changing a parent location automatically resets subsequent child fields to maintain geographical accuracy.
            </p>

            {/* Desktop & Mobile Responsive Hierarchy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Level 1: State * */}
              <SearchableLocationSelect
                label="State"
                required
                value={state}
                placeholder="Search or select State..."
                loadOptions={loadStates}
                onChange={handleStateChange}
                onClear={handleStateClear}
                error={errors.state}
                helperText="Primary administrative territory"
              />

              {/* Level 2: District * */}
              <SearchableLocationSelect
                label="District"
                required
                value={district}
                placeholder="Search or select District..."
                parentSelected={Boolean(state)}
                parentName="State"
                loadOptions={loadDistricts}
                onChange={handleDistrictChange}
                onClear={handleDistrictClear}
                error={errors.district}
                helperText="District within selected state"
              />

              {/* Level 3: City / Town * */}
              <SearchableLocationSelect
                label="City / Town"
                required
                value={city}
                placeholder="Search or select City / Town..."
                parentSelected={Boolean(district)}
                parentName="District"
                loadOptions={loadCities}
                onChange={handleCityChange}
                onClear={handleCityClear}
                error={errors.city}
                helperText="Urban/rural municipality center"
              />

              {/* Level 4: Block / Tehsil (Optional) */}
              <SearchableLocationSelect
                label="Block / Tehsil"
                value={block}
                placeholder="Search or select Block / Tehsil..."
                parentSelected={Boolean(city || district)}
                parentName="City / Town"
                loadOptions={loadBlocks}
                onChange={handleBlockChange}
                onClear={handleBlockClear}
                helperText="Sub-district block or tehsil"
              />

              {/* Level 5: Village / Street / Locality (Optional) */}
              <div className="md:col-span-2">
                <SearchableLocationSelect
                  label="Village / Street / Locality"
                  value={locality}
                  placeholder="Enter or select specific village, market, or street locality..."
                  parentSelected={Boolean(city || district)}
                  parentName="City / Block"
                  loadOptions={loadLocalities}
                  onChange={handleLocalityChange}
                  onClear={handleLocalityClear}
                  helperText="Exact micro-location for catchment radius"
                />
              </div>

              {/* PIN Code */}
              <div>
                <label htmlFor="pinInput" className="text-xs font-bold text-slate-700 block mb-1.5">
                  Postal PIN Code <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="pinInput"
                  name="pin"
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => updateField('pin', e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit postal PIN"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                />
                {errors.pin && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <span>⚠</span>
                    <span>{errors.pin}</span>
                  </p>
                )}
              </div>

              {/* Live Location Summary Badge */}
              <div className="flex flex-col justify-end">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                    Selected Catchment Address
                  </span>
                  <span className="font-bold text-slate-800">
                    {[locality, block, city, district, state].filter(Boolean).join(', ') || 'Awaiting location selection'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION C: FINANCIAL INPUTS
             ========================================================================= */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                  C
                </span>
                <span>Financial &amp; Subsidy Parameters</span>
              </h2>
              <span className="text-[11px] text-blue-700 bg-blue-50 font-bold px-2 py-0.5 rounded-md border border-blue-100">
                Capital &amp; Scheme Inputs
              </span>
            </div>

            {/* Planned / Estimated Project Cost Input */}
            <div>
              <label htmlFor="projectCostInput" className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span>Estimated / Planned Project Cost</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Optional Reference
                  </span>
                </span>
                {projectCost !== '' && Number(projectCost) > 0 && (
                  <button
                    type="button"
                    onClick={() => updateField('projectCost', '')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Clear (Use Sector Benchmark)
                  </button>
                )}
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                <input
                  id="projectCostInput"
                  name="projectCost"
                  type="number"
                  value={projectCost}
                  onChange={(e) => updateField('projectCost', e.target.value)}
                  min="0"
                  step="1000"
                  placeholder="Enter expected total project cost (e.g. 8,00,000)"
                  className={`w-full min-h-[44px] pl-8 pr-4 py-2.5 rounded-xl border text-sm font-black text-slate-900 transition-all ${
                    errors.projectCost
                      ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 bg-white'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter the total amount you expect to invest in setting up this business. If you are unsure, VITTANAYA can use a sector benchmark as an estimate.
              </p>
              {errors.projectCost && (
                <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                  <span>⚠</span>
                  <span>{errors.projectCost}</span>
                </p>
              )}

              {/* Quick Project Cost Select Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Quick Select:</span>
                {PROJECT_COST_CHIPS.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => updateField('projectCost', chip.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      Number(projectCost) === chip.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Own / Starting Capital Input */}
            <div>
              <label htmlFor="ownCapitalInput" className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1">
                  <span>Available Own / Starting Capital</span>
                  <span className="text-rose-500 font-black">*</span>
                </span>
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                <input
                  id="ownCapitalInput"
                  name="ownCapital"
                  type="number"
                  value={ownCapital}
                  onChange={(e) => updateField('ownCapital', e.target.value)}
                  min="0"
                  step="1"
                  placeholder="Enter your available capital amount"
                  className={`w-full min-h-[44px] pl-8 pr-4 py-2.5 rounded-xl border text-sm font-black text-slate-900 transition-all ${
                    errors.ownCapital
                      ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 bg-white'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter the amount you can currently put toward starting this business.
              </p>
              {errors.ownCapital && (
                <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                  <span>⚠</span>
                  <span>{errors.ownCapital}</span>
                </p>
              )}

              {/* Quick Capital Select Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Quick Select:</span>
                {CAPITAL_CHIPS.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => updateField('ownCapital', chip.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      Number(ownCapital) === chip.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Beneficiary Category & Area Classification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label htmlFor="socialCategorySelect" className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                  <span>Beneficiary Category (For MoSJE Subsidy Rules)</span>
                  <span className="text-rose-500 font-black">*</span>
                </label>
                <select
                  id="socialCategorySelect"
                  name="socialCategory"
                  value={socialCategory}
                  onChange={(e) => updateField('socialCategory', e.target.value)}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
                    !socialCategory ? 'text-slate-400 font-normal' : 'text-slate-900 font-bold'
                  }`}
                >
                  <option value="">Select beneficiary category</option>
                  <option value="General">General Category (Standard Guidelines)</option>
                  <option value="SC">Scheduled Caste (SC) • 35% Subsidy / Special Concession</option>
                  <option value="ST">Scheduled Tribe (ST) • 35% Subsidy / Special Concession</option>
                  <option value="OBC">Other Backward Class (OBC) • NBCFDC Concession</option>
                  <option value="Women">Women Entrepreneur • 5% Margin Money</option>
                </select>
                {errors.socialCategory && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <span>⚠</span>
                    <span>{errors.socialCategory}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="areaTypeSelect" className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                  <span>Area Classification</span>
                  <span className="text-rose-500 font-black">*</span>
                </label>
                <select
                  id="areaTypeSelect"
                  name="areaType"
                  value={areaType}
                  onChange={(e) => updateField('areaType', e.target.value)}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
                    !areaType ? 'text-slate-400 font-normal' : 'text-slate-900 font-bold'
                  }`}
                >
                  <option value="">Select area classification</option>
                  <option value="Rural">Rural Gram Panchayat (Higher Subsidy Benefit)</option>
                  <option value="Urban">Urban / Semi-Urban Municipal Ward</option>
                </select>
                {errors.areaType && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <span>⚠</span>
                    <span>{errors.areaType}</span>
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* =========================================================================
              SUBMISSION & NAVIGATION
             ========================================================================= */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
            >
              ← Back to Stage Selection
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[44px] px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-75 text-white text-xs font-black shadow-md shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analyzing Idea...</span>
                </>
              ) : (
                <>
                  <span>Analyze My Idea</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>

        </form>
      </main>

      {/* 3. Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-[11px] text-slate-400 font-medium pt-2">
        VITTANAYA Platform • Deterministic Financial Structuring &amp; Hyper-Local Intelligence
      </footer>

    </div>
  );
}
