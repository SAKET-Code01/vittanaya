import React, { useState } from 'react';
import { INDUSTRY_PRESETS } from '../../mocks/dashboardMockData';

/**
 * RegistrationModal Component
 * Allows an MSME owner to complete business onboarding and switch workspace configuration.
 */
export default function RegistrationModal({ isOpen, onClose, onRegisterSuccess, currentProfile }) {
  const [businessName, setBusinessName] = useState(currentProfile?.name === 'Universal MSME Profile' ? '' : (currentProfile?.name || ''));
  const [ownerName, setOwnerName] = useState(currentProfile?.user_name === 'Business Owner' ? '' : (currentProfile?.user_name || ''));
  const [selectedType, setSelectedType] = useState(currentProfile?.id || 'universal');
  const [location, setLocation] = useState('Bhubaneswar, Odisha');
  const [gstin, setGstin] = useState(currentProfile?.gstin || '21AAACV0000U1Z9');
  const [isConfiguring, setIsConfiguring] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsConfiguring(true);

    // Brief smooth transition (800ms) to simulate workspace initialization
    setTimeout(() => {
      const basePreset = INDUSTRY_PRESETS[selectedType] || INDUSTRY_PRESETS.universal;
      const updatedProfile = {
        ...basePreset,
        id: selectedType,
        name: businessName || (selectedType === 'universal' ? 'My MSME Business' : basePreset.name),
        user_name: ownerName || (selectedType === 'universal' ? 'Business Owner' : basePreset.user_name),
        user_role: 'Business Owner / Managing Director',
        gstin: gstin || basePreset.gstin,
        location: location,
      };
      setIsConfiguring(false);
      onRegisterSuccess(updatedProfile);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isConfiguring}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isConfiguring ? (
          /* Transitioning State */
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative flex h-12 w-12">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-12 w-12 bg-amber-500 items-center justify-center text-slate-950 font-black text-xl">
                V
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                Configuring Intelligent Financial Twin...
              </h3>
              <p className="text-xs text-slate-400">
                Adapting working-capital matrices for {businessName || 'your business'}
              </p>
            </div>
          </div>
        ) : (
          /* Form State */
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  Business Onboarding
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • Universal Architecture
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Onboard Your MSME Workspace
              </h2>
              <p className="text-xs text-slate-400">
                Configure your business identity and industry type to unlock personalized decision-support.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Business Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Business / Enterprise Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Ankit Steel Works, Priya Retail, or Apex Cargo"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Owner / User Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Business Owner / Finance Lead Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Ankit Sharma, Priya, or Rahul"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Business Type */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Industry & Operational Category
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="universal">Universal MSME (Standard Decision Engine)</option>
                  <option value="manufacturing">Manufacturing (Steel, Fabrication, Components)</option>
                  <option value="transport">Transport & Logistics (Fleet, Fuel, Transits)</option>
                  <option value="retail">Retail & Wholesale (FMCG, Superstores, Distribution)</option>
                  <option value="restaurant">Restaurant & Catering (Food Cost, Payroll, Banquets)</option>
                  <option value="services">IT & Professional Services (Consulting, Software Retainers)</option>
                </select>
              </div>

              {/* Location & GSTIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Location / State
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Odisha, India"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    GSTIN / Registration (Optional)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g. 21AAACV0000U1Z9"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors uppercase font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Activate Workspace</span>
                  <span>→</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
