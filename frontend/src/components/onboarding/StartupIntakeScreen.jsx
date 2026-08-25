import React, { useState } from 'react';

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
 * 2-Screen / Structured intake for emerging startups:
 * - Business / Idea name
 * - Category & Stage
 * - Location (Village, Block, District, State)
 * - Own Capital & Already Invested
 * - Optional readiness indicators (Premises, Machinery, Existing Sales)
 */
export default function StartupIntakeScreen({
  onComplete,
  onBack,
}) {
  const [businessName, setBusinessName] = useState('Utkal Micro-Agri Solutions');
  const [category, setCategory] = useState('agro_processing');
  const [specificActivity, setSpecificActivity] = useState('Solar Cold Storage & Spice Processing');
  const [stage, setStage] = useState('setup');
  
  // Location
  const [village, setVillage] = useState('Kuarmunda');
  const [block, setBlock] = useState('Kuarmunda Block');
  const [district, setDistrict] = useState('Sundargarh');
  const [state, setState] = useState('Odisha');
  const [pin, setPin] = useState('770039');

  // Capital
  const [ownCapital, setOwnCapital] = useState(150000);
  const [alreadyInvested, setAlreadyInvested] = useState(50000);

  // Optional Readiness
  const [showOptional, setShowOptional] = useState(false);
  const [hasPremises, setHasPremises] = useState('yes');
  const [hasEquipment, setHasEquipment] = useState('partial');
  const [existingMonthlySales, setExistingMonthlySales] = useState('0');
  const [customerCount, setCustomerCount] = useState('0');

  // Beneficiary
  const [socialCategory, setSocialCategory] = useState('General');
  const [areaType, setAreaType] = useState('Rural');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!businessName.trim()) newErrors.businessName = 'Business / Idea name is required';
    if (!village.trim()) newErrors.village = 'Village is required';
    if (!district.trim()) newErrors.district = 'District is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!ownCapital || Number(ownCapital) <= 0) newErrors.ownCapital = 'Enter valid available own capital';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const matchedCat = STARTUP_CATEGORIES.find((c) => c.id === category) || { label: 'Startup Enterprise' };
    const locationString = [village, block, district, state].filter(Boolean).join(', ') || 'India';

    onComplete({
      stage: 'startup',
      businessName,
      category: matchedCat.label,
      industry: specificActivity || matchedCat.label,
      businessType: category === 'poultry_dairy' || category === 'agro_processing' ? 'manufacturing' : category,
      village,
      block,
      district,
      state,
      pin,
      location: locationString,
      locationData: {
        village,
        block,
        district,
        state,
        pin,
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
      existingInvestment: Number(alreadyInvested) || 0,
      socialCategory,
      areaType,
      startupDetails: {
        startupStage: stage,
        hasPremises,
        hasEquipment,
        existingMonthlySales: Number(existingMonthlySales) || 0,
        customerCount: Number(customerCount) || 0,
      },
      selectedOps: ['sales', 'purchases', 'inventory', 'assets'],
      description: `Early-stage startup '${businessName}' in ${locationString}. Stage: ${stage}. Own Capital: ₹${Number(ownCapital).toLocaleString('en-IN')}, Already Invested: ₹${Number(alreadyInvested).toLocaleString('en-IN')}.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-x-hidden flex flex-col justify-between py-6 px-4 sm:px-8 select-none">
      
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00C6FF] to-[#0072FF] flex items-center justify-center text-white font-black text-lg">
            V
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-900 leading-none">
              VITTANAYA
            </h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              Startup Phase Setup • Working Capital & Capex Structuring
            </p>
          </div>
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
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    if (errors.businessName) setErrors((prev) => ({ ...prev, businessName: null }));
                  }}
                  placeholder="e.g. Utkal Micro-Agri Solutions"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                {errors.businessName && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.businessName}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Primary Sector / Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                >
                  {STARTUP_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Specific Activity / Focus</label>
              <input
                type="text"
                value={specificActivity}
                onChange={(e) => setSpecificActivity(e.target.value)}
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
                    onClick={() => setStage(stg.id)}
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

          {/* Section 3: Geographic Location */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">3</span>
              <span>Location (Operating Catchment)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Village / Town *</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => {
                    setVillage(e.target.value);
                    if (errors.village) setErrors((prev) => ({ ...prev, village: null }));
                  }}
                  placeholder="e.g. Kuarmunda"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                {errors.village && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.village}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Block / Tehsil</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="e.g. Kuarmunda Block"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">District *</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    if (errors.district) setErrors((prev) => ({ ...prev, district: null }));
                  }}
                  placeholder="e.g. Sundargarh"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                {errors.district && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.district}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">State *</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    if (errors.state) setErrors((prev) => ({ ...prev, state: null }));
                  }}
                  placeholder="e.g. Odisha"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                {errors.state && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.state}</p>}
              </div>
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
                    onChange={(e) => {
                      setOwnCapital(e.target.value);
                      if (errors.ownCapital) setErrors((prev) => ({ ...prev, ownCapital: null }));
                    }}
                    min="0"
                    step="5000"
                    placeholder="e.g. 150000"
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
                    onChange={(e) => setAlreadyInvested(e.target.value)}
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
              className="w-full flex items-center justify-between text-xs font-extrabold text-slate-800"
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
                    onChange={(e) => setHasPremises(e.target.value)}
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
                    onChange={(e) => setHasEquipment(e.target.value)}
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
                    onChange={(e) => setExistingMonthlySales(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Initial Customer Commitments (Count)</label>
                  <input
                    type="number"
                    value={customerCount}
                    onChange={(e) => setCustomerCount(e.target.value)}
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
                Beneficiary Category (For MoSJE Subsidy Rules)
              </label>
              <select
                value={socialCategory}
                onChange={(e) => setSocialCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="General">General Category</option>
                <option value="SC">Scheduled Caste (SC) • 35% Subsidy / Special Concession</option>
                <option value="ST">Scheduled Tribe (ST) • 35% Subsidy / Special Concession</option>
                <option value="OBC">Other Backward Class (OBC) • NBCFDC Concession</option>
                <option value="Women">Women Entrepreneur • 5% Margin Money</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Area Classification
              </label>
              <select
                value={areaType}
                onChange={(e) => setAreaType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="Rural">Rural Gram Panchayat (Higher Subsidy Benefit)</option>
                <option value="Urban">Urban / Semi-Urban Municipal Ward</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
            >
              ← Back to Stage Selection
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
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
