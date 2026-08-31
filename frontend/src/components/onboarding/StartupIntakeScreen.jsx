import React, { useState, useCallback } from 'react';
import VittanayaLogo from '../common/VittanayaLogo';
import SearchableLocationSelect from '../common/SearchableLocationSelect';
import locationService from '../../services/locationService';

const STARTUP_CATEGORIES = [
  { id: 'manufacturing', label: 'Manufacturing & Fabrication', icon: '⚙️' },
  { id: 'agro_processing', label: 'Agro-Processing & Food', icon: '🌾' },
  { id: 'poultry_dairy', label: 'Poultry & Livestock', icon: '🐄' },
  { id: 'transport', label: 'Transport & Logistics', icon: '🚚' },
  { id: 'retail', label: 'Retail & Wholesale', icon: '🏪' },
  { id: 'services', label: 'Services & Technical', icon: '🔧' },
  { id: 'construction', label: 'Construction & Materials', icon: '🏗️' },
  { id: 'other', label: 'Other Enterprise', icon: '📦' },
];

const STAGES = [
  { id: 'concept', label: 'Concept / Planning', desc: 'Finalizing business plan & financial model' },
  { id: 'setup', label: 'Workshop / Setup WIP', desc: 'Acquiring machinery, equipment, or lease' },
  { id: 'pilot', label: 'Pilot / Pre-Revenue', desc: 'Initial trial runs, sampling or testing' },
  { id: 'early_revenue', label: 'Early Billing / Sales', desc: 'First commercial orders & customer billing' },
];

/**
 * StartupIntakeScreen Component (SIH26091 Phase A)
 * 
 * 2-minute structured intake for emerging startups:
 * - SECTION 1: Startup Identity & Category (Business / Venture Name *, Category *, Specific Activity)
 * - SECTION 2: Current Venture Stage
 * - SECTION 3: Location (Operating Catchment: State * -> District * -> Block / Tehsil -> Village / Town *)
 * - SECTION 4: Capital Structure & Equity (Available Own Margin Capital *, Capital Already Invested)
 * - Optional Readiness Details (Premises, Machinery, Existing Monthly Sales, Customer Commitments)
 * - Beneficiary & Area Classification for Government Schemes
 */
export default function StartupIntakeScreen({
  draft = {},
  setDraft,
  onComplete,
  onBack,
  onForward,
  canGoForward = false,
  onHome,
}) {
  // Section 1: Identity & Category
  const businessName = draft.businessName || draft.name || '';
  const category = draft.category || '';
  const specificActivity = draft.specificActivity || '';

  // Section 2: Stage
  const stage = draft.stage || 'setup';

  // Section 3: Hierarchical Location
  const state = draft.state || '';
  const stateId = draft.stateId || '';
  const district = draft.district || '';
  const districtId = draft.districtId || '';
  const block = draft.block || '';
  const blockId = draft.blockId || '';
  const village = draft.village || draft.locality || '';
  const villageId = draft.villageId || draft.localityId || '';
  const pin = draft.pin || '';

  // Section 4: Capital
  const ownCapital = draft.ownCapital ?? '';
  const alreadyInvested = draft.alreadyInvested ?? '';

  // Optional Readiness Details
  const [showOptional, setShowOptional] = useState(false);
  const hasPremises = draft.hasPremises || 'yes';
  const hasEquipment = draft.hasEquipment || 'partial';
  const existingMonthlySales = draft.existingMonthlySales ?? 0;
  const customerCount = draft.customerCount ?? 0;

  // Scheme Classification
  const socialCategory = draft.socialCategory || '';
  const areaType = draft.areaType || '';

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    if (setDraft) {
      setDraft((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Location Loading Callbacks
  const loadStates = useCallback(async () => {
    return locationService.getStates();
  }, []);

  const loadDistricts = useCallback(async () => {
    if (!stateId && !state) return [];
    let sId = stateId;
    if (!sId && state) {
      const states = await locationService.getStates();
      const match = states.find((s) => s.name.toLowerCase() === state.toLowerCase());
      sId = match?.id || 'OD';
    }
    return locationService.getDistricts(sId || 'OD');
  }, [stateId, state]);

  const loadBlocks = useCallback(async () => {
    if (!districtId && !district) return [];
    const dId = districtId || `${stateId || 'OD'}_DIST`;
    return locationService.getBlocks(dId);
  }, [districtId, district, stateId]);

  const loadVillages = useCallback(async () => {
    if (!blockId && !block) return [];
    const bId = blockId || `${districtId || 'OD_KH'}_BLK1`;
    return locationService.getLocalities(bId);
  }, [blockId, block, districtId]);

  // Hierarchical Cascading Location Handlers with Parent Clears
  const handleStateChange = (stateObj) => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        state: stateObj.name,
        stateId: stateObj.id,
        // Clear all downstream children
        district: '',
        districtId: '',
        block: '',
        blockId: '',
        village: '',
        villageId: '',
      }));
    }
    setErrors((prev) => ({ ...prev, state: null, district: null, village: null }));
  };

  const handleStateClear = () => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        state: '',
        stateId: '',
        district: '',
        districtId: '',
        block: '',
        blockId: '',
        village: '',
        villageId: '',
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
        block: '',
        blockId: '',
        village: '',
        villageId: '',
      }));
    }
    setErrors((prev) => ({ ...prev, district: null, village: null }));
  };

  const handleDistrictClear = () => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        district: '',
        districtId: '',
        block: '',
        blockId: '',
        village: '',
        villageId: '',
      }));
    }
  };

  const handleBlockChange = (blockObj) => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        block: blockObj.name,
        blockId: blockObj.id,
        // Clear downstream children
        village: '',
        villageId: '',
      }));
    }
  };

  const handleBlockClear = () => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        block: '',
        blockId: '',
        village: '',
        villageId: '',
      }));
    }
  };

  const handleVillageChange = (villageObj) => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        village: villageObj.name,
        villageId: villageObj.id,
      }));
    }
    setErrors((prev) => ({ ...prev, village: null }));
  };

  const handleVillageClear = () => {
    if (setDraft) {
      setDraft((prev) => ({
        ...prev,
        village: '',
        villageId: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!businessName.toString().trim()) {
      newErrors.businessName = 'Business / Venture name is required';
    }
    if (!category) {
      newErrors.category = 'Primary sector / category is required';
    }
    if (!state.toString().trim()) {
      newErrors.state = 'State is required';
    }
    if (!district.toString().trim()) {
      newErrors.district = 'District is required';
    }
    if (!village.toString().trim()) {
      newErrors.village = 'Village / Town is required';
    }
    if (!ownCapital || Number(ownCapital) < 10000) {
      newErrors.ownCapital = 'Minimum own capital amount is ₹ 10,000';
    }
    if (!socialCategory) {
      newErrors.socialCategory = 'Please select a beneficiary category';
    }
    if (!areaType) {
      newErrors.areaType = 'Please select an area classification';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const matchedCat = STARTUP_CATEGORIES.find((c) => c.id === category) || { label: 'Startup Enterprise' };
    const locationParts = [village, block, district, state].filter(Boolean);
    if (pin) locationParts.push(pin);
    const locationString = locationParts.join(', ');

    onComplete({
      stage: 'startup',
      businessName: businessName.toString().trim(),
      name: businessName.toString().trim(),
      category: matchedCat.label,
      industry: specificActivity || matchedCat.label,
      businessType: category === 'services' || category === 'tech_services' ? 'services' : category === 'retail' ? 'retail' : 'manufacturing',
      village: village.trim(),
      block: block.trim(),
      district: district.trim(),
      state: state.trim(),
      pin: pin ? pin.trim() : '',
      stateId,
      districtId,
      blockId,
      villageId,
      location: locationString,
      locationData: {
        village: village.trim(),
        block: block.trim(),
        district: district.trim(),
        state: state.trim(),
        pin: pin ? pin.trim() : '',
        state_code: stateId || null,
        district_code: districtId || null,
        block_code: blockId || null,
        village_code: villageId || null,
        gram_panchayat_code: null,
        latitude: null,
        longitude: null,
      },
      ownCapital: Number(ownCapital),
      available_margin_capital: Number(ownCapital),
      existingInvestment: Number(alreadyInvested || 0),
      socialCategory,
      areaType,
      startupDetails: {
        startupStage: stage,
        hasPremises,
        hasEquipment,
        existingMonthlySales: Number(existingMonthlySales || 0),
        customerCount: Number(customerCount || 0),
      },
      selectedOps: stage === 'early_revenue' ? ['sales', 'purchases', 'inventory', 'banking'] : ['sales', 'purchases', 'banking'],
      description: `${businessName.trim()} — ${stage === 'early_revenue' ? 'Operating early-stage' : 'Pre-launch startup'} in ${matchedCat.label}, ${locationString}. Margin capital: ₹${Number(ownCapital).toLocaleString('en-IN')}.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-x-hidden flex flex-col justify-between py-6 px-4 sm:px-8 select-none">
      
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-3 border-b border-slate-200/80 gap-3">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <VittanayaLogo size="header" onHome={onHome || onBack} className="shrink-0" />
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          Startup Intake (2 Min)
        </span>
      </header>

      {/* Main Form */}
      <main className="max-w-4xl w-full mx-auto my-auto py-5 sm:py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Section 1: Business Name & Category */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">1</span>
              <span>Startup Identity & Category</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Business / Venture Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  placeholder="e.g. Utkal Micro-Agri Solutions"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                {errors.businessName && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.businessName}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Primary Sector / Category *</label>
                <select
                  value={category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-500 ${
                    !category ? 'text-slate-400 font-normal' : 'text-slate-900 font-semibold'
                  }`}
                >
                  <option value="">Select primary sector / category</option>
                  {STARTUP_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.category}</p>}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Specific Activity / Focus</label>
              <input
                type="text"
                value={specificActivity}
                onChange={(e) => updateField('specificActivity', e.target.value)}
                placeholder="e.g. Solar Cold Storage & Spice Processing"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section 2: Current Stage */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">2</span>
              <span>Current Venture Stage</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {STAGES.map((stg) => {
                const isSelected = stage === stg.id;
                return (
                  <div
                    key={stg.id}
                    onClick={() => updateField('stage', stg.id)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{stg.label}</h4>
                      <div className={`w-3.5 h-3.5 rounded-full border ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                      }`} />
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-1 leading-snug">{stg.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section 3: Geographic Location (Hierarchical Cascading: State -> District -> Block/Tehsil -> Village/Town) */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">3</span>
              <span>Location (Operating Catchment)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Level 1: State * */}
              <SearchableLocationSelect
                label="State"
                required
                value={state}
                placeholder="Select state"
                loadOptions={loadStates}
                parentSelected={true}
                onChange={handleStateChange}
                onClear={handleStateClear}
                error={errors.state}
                helperText="State / UT"
              />

              {/* Level 2: District * */}
              <SearchableLocationSelect
                label="District"
                required
                value={district}
                placeholder={state ? "Select district" : "Select state first"}
                loadOptions={loadDistricts}
                parentSelected={Boolean(state || stateId)}
                parentName="State"
                disabled={!state && !stateId}
                onChange={handleDistrictChange}
                onClear={handleDistrictClear}
                error={errors.district}
                helperText="Administrative district"
              />

              {/* Level 3: Block / Tehsil */}
              <SearchableLocationSelect
                label="Block / Tehsil"
                value={block}
                placeholder={district ? "Select or enter block" : "Select district first"}
                loadOptions={loadBlocks}
                parentSelected={Boolean(district || districtId)}
                parentName="District"
                disabled={!district && !districtId}
                onChange={handleBlockChange}
                onClear={handleBlockClear}
                error={errors.block}
                helperText="Sub-division / Block"
              />

              {/* Level 4: Village / Town * */}
              <SearchableLocationSelect
                label="Village / Town"
                required
                value={village}
                placeholder={district ? "Select or enter village/town" : "Select district first"}
                loadOptions={loadVillages}
                parentSelected={Boolean(district || districtId)}
                parentName="District"
                disabled={!district && !districtId}
                onChange={handleVillageChange}
                onClear={handleVillageClear}
                error={errors.village}
                helperText="Operating village / town"
              />
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section 4: Capital Structure */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">4</span>
              <span>Capital Structure & Equity</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Available Own Margin Capital (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    value={ownCapital}
                    onChange={(e) => updateField('ownCapital', e.target.value)}
                    min="0"
                    step="5000"
                    placeholder="Enter amount (e.g. 150000)"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                {errors.ownCapital && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.ownCapital}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Capital Already Invested (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    value={alreadyInvested}
                    onChange={(e) => updateField('alreadyInvested', e.target.value)}
                    min="0"
                    step="5000"
                    placeholder="e.g. 50000"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Prior spending on land, prototype or license</p>
              </div>
            </div>
          </div>

          {/* Optional Accordion: Startup Readiness Details */}
          <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/40">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="w-full flex items-center justify-between text-xs font-extrabold text-slate-800 cursor-pointer"
            >
              <span>{showOptional ? '▲ Hide Optional Readiness Details' : '▼ Add Optional Readiness Details (Premises, Machinery, Sales)'}</span>
              <span className="text-[11px] font-semibold text-blue-600">{showOptional ? 'Collapse' : 'Expand'}</span>
            </button>

            {showOptional && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 mt-3 border-t border-slate-200/60">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Premises Available?</label>
                  <select
                    value={hasPremises}
                    onChange={(e) => updateField('hasPremises', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="yes">Yes • Owned or Leased Site Ready</option>
                    <option value="negotiating">In Negotiation / Identifying Site</option>
                    <option value="no">Not Yet • Requires Site Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Machinery / Equipment Acquired?</label>
                  <select
                    value={hasEquipment}
                    onChange={(e) => updateField('hasEquipment', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="partial">Partially Acquired (50%)</option>
                    <option value="yes">Fully Acquired & Installed</option>
                    <option value="no">Not Yet Acquired (Needs Term Loan)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Existing Monthly Revenue (₹ / mo)</label>
                  <input
                    type="number"
                    value={existingMonthlySales}
                    onChange={(e) => updateField('existingMonthlySales', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Initial Customer Commitments (Count)</label>
                  <input
                    type="number"
                    value={customerCount}
                    onChange={(e) => updateField('customerCount', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Social Category & Area Type for Scheme Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Beneficiary Category (For MoSJE Subsidy Rules) *
              </label>
              <select
                value={socialCategory}
                onChange={(e) => updateField('socialCategory', e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-500 ${
                  !socialCategory ? 'text-slate-400 font-normal' : 'text-slate-800 font-bold'
                }`}
              >
                <option value="">Select beneficiary category</option>
                <option value="General">General Category</option>
                <option value="SC">Scheduled Caste (SC) • 35% Subsidy / Special Concession</option>
                <option value="ST">Scheduled Tribe (ST) • 35% Subsidy / Special Concession</option>
                <option value="OBC">Other Backward Class (OBC) • NBCFDC Concession</option>
                <option value="Women">Women Entrepreneur • 5% Margin Money</option>
              </select>
              {errors.socialCategory && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.socialCategory}</p>}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Area Classification *
              </label>
              <select
                value={areaType}
                onChange={(e) => updateField('areaType', e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-500 ${
                  !areaType ? 'text-slate-400 font-normal' : 'text-slate-800 font-bold'
                }`}
              >
                <option value="">Select area classification</option>
                <option value="Rural">Rural Gram Panchayat (Higher Subsidy Benefit)</option>
                <option value="Urban">Urban / Semi-Urban Municipal Ward</option>
              </select>
              {errors.areaType && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.areaType}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
            >
              ← Back to Stage Selection
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Analyze Startup Plan</span>
              <span>→</span>
            </button>
          </div>

        </form>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-[11px] text-slate-400 font-medium pt-2">
        VITTANAYA SIH26091 • Grounded financial modeling & working capital structuring
      </footer>

    </div>
  );
}
