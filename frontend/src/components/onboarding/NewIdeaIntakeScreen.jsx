import React, { useState } from 'react';
import VittanayaLogo from '../common/VittanayaLogo';

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
  { label: '₹ 25,000', value: 25000 },
  { label: '₹ 50,000', value: 50000 },
  { label: '₹ 1,00,000', value: 100000 },
  { label: '₹ 2,50,000', value: 250000 },
  { label: '₹ 5,00,000', value: 500000 },
  { label: '₹ 10,00,000', value: 1000000 },
];

/**
 * NewIdeaIntakeScreen Component (SIH26091 Phase A)
 * 
 * Streamlined 1-Screen Intake for brand-new entrepreneurs:
 * - Proposed business category & specific activity
 * - Normalized location (Village, Block, District, State)
 * - Available own capital / margin capital
 * - Social category & Area type for subsidy rules
 * 
 * Persists all state in parent draft store to ensure zero data loss on navigation.
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
  const category = draft.category || '';
  const specificActivity = draft.specificActivity || '';
  const village = draft.village || '';
  const block = draft.block || '';
  const district = draft.district || '';
  const state = draft.state || '';
  const pin = draft.pin || '';
  const ownCapital = draft.ownCapital ?? '';
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

  const selectedCatObj = POPULAR_CATEGORIES.find((c) => c.id === category);
  const activityPlaceholder = selectedCatObj
    ? `e.g. ${selectedCatObj.defaultActivity}`
    : 'Enter the business activity or product';

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!category) newErrors.category = 'Please select a business category';
    if (!village.toString().trim()) newErrors.village = 'Village / Area name is required';
    if (!district.toString().trim()) newErrors.district = 'District name is required';
    if (!state.toString().trim()) newErrors.state = 'State is required';
    if (!pin.toString().trim() || !/^\d{6}$/.test(pin.toString().trim())) {
      newErrors.pin = 'Valid 6-digit PIN code required';
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

    const matchedCat = selectedCatObj || { label: 'Micro Enterprise' };
    const locationString = [village, block, district, state, pin].filter(Boolean).join(', ');

    onComplete({
      stage: 'new_idea',
      businessName: `${village || 'Rural'} ${matchedCat.label} Venture`,
      category: matchedCat.label,
      industry: specificActivity.trim() || matchedCat.defaultActivity || matchedCat.label,
      businessType: category === 'transport' || category === 'services' ? 'services' : category === 'retail' ? 'retail' : 'manufacturing',
      village: village.trim(),
      block: block.trim(),
      district: district.trim(),
      state: state.trim(),
      pin: pin.trim(),
      location: locationString,
      locationData: {
        village: village.trim(),
        block: block.trim(),
        district: district.trim(),
        state: state.trim(),
        pin: pin.trim(),
        state_code: null,
        district_code: null,
        block_code: null,
        village_code: null,
        gram_panchayat_code: null,
        latitude: null,
        longitude: null,
      },
      ownCapital: Number(ownCapital),
      available_margin_capital: Number(ownCapital),
      existingInvestment: 0,
      socialCategory,
      areaType,
      selectedOps: ['sales', 'purchases'],
      description: `New proposed ${matchedCat.label} enterprise in ${locationString}. Available margin capital: ₹${Number(ownCapital).toLocaleString('en-IN')}.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-x-hidden flex flex-col justify-between py-6 px-4 sm:px-8 select-none">
      
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-3 border-b border-slate-200/80 gap-3">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <VittanayaLogo size="header" onHome={onHome || onBack} className="shrink-0" />
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Fast Intake (1 Min)
        </span>
      </header>

      {/* Main Form Card */}
      <main className="max-w-4xl w-full mx-auto my-auto py-5 sm:py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Section 1: Business Category & Activity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">1</span>
                <span>Select Proposed Business Category *</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Click a category below</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {POPULAR_CATEGORIES.map((item) => {
                const isSelected = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCategorySelect(item)}
                    className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all text-xs font-bold cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-2xs ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/40'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <span className="leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.category}</p>}

            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Specific Activity / Product Specification
              </label>
              <input
                type="text"
                value={specificActivity}
                onChange={(e) => updateField('specificActivity', e.target.value)}
                placeholder={activityPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section 2: Geographic Location */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">2</span>
              <span>Geographic Location (Catchment Area)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Village / Town *</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => updateField('village', e.target.value)}
                  placeholder="Enter village or town"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {errors.village && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.village}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Block / Tehsil</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => updateField('block', e.target.value)}
                  placeholder="e.g. Lathikata Block"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">District *</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => updateField('district', e.target.value)}
                  placeholder="Enter district"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {errors.district && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.district}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">State *</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="Enter state"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {errors.state && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.state}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section 3: Available Own Margin Capital */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">3</span>
                <span>Available Margin Capital (Your Own Investment) *</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Min 10% Baseline
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                <input
                  type="number"
                  value={ownCapital}
                  onChange={(e) => updateField('ownCapital', e.target.value)}
                  min="0"
                  step="5000"
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            {errors.ownCapital && <p className="text-[10px] font-bold text-rose-500">{errors.ownCapital}</p>}

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Quick Select:</span>
              {CAPITAL_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => updateField('ownCapital', chip.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                    Number(ownCapital) === chip.value
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section 4: Social Category & Area Type for Scheme Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Beneficiary Category (For MoSJE Subsidy Rules) *
              </label>
              <select
                value={socialCategory}
                onChange={(e) => updateField('socialCategory', e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-500 ${
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
                className={`w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-500 ${
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
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Analyze My Idea</span>
              <span>→</span>
            </button>
          </div>

        </form>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-[11px] text-slate-400 font-medium pt-2">
        VITTANAYA SIH26091 • No fabricated estimates • Transparent deterministic financial structuring
      </footer>

    </div>
  );
}
