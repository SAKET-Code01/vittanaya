import React, { useState } from 'react';

/**
 * BusinessChangeModal Component — Allows switching business and location dynamically
 */
export default function BusinessChangeModal({
  isOpen,
  onClose,
  currentProfile,
  onSelectBusiness,
  onSave,
}) {
  const [selectedLocation, setSelectedLocation] = useState(
    currentProfile?.location || 'Indore, Madhya Pradesh'
  );
  const [selectedType, setSelectedType] = useState(
    currentProfile?.businessType || 'transport'
  );

  if (!isOpen) return null;

  const businessPresets = [
    {
      id: 'transport',
      name: 'Transport & Logistics',
      category: 'Transport & Logistics',
      investmentRange: '₹8L – ₹45L',
      feasibilityScore: 78,
      marketOpportunity: 'High',
      riskLevel: 'Low',
      icon: '🚚',
      desc: 'Fleet operations, freight forwarding, city delivery & inter-state logistics.',
    },
    {
      id: 'dairy',
      name: 'Dairy Farming & Milk Processing',
      category: 'Dairy Farming',
      investmentRange: '₹5L – ₹30L',
      feasibilityScore: 84,
      marketOpportunity: 'High',
      riskLevel: 'Low',
      icon: '🥛',
      desc: 'Cattle management, chilling centers, cold-chain distribution & milk derivatives.',
    },
    {
      id: 'retail',
      name: 'Retail & Grocery Mart',
      category: 'Retail & Supermarket',
      investmentRange: '₹6L – ₹25L',
      feasibilityScore: 81,
      marketOpportunity: 'High',
      riskLevel: 'Medium',
      icon: '🛒',
      desc: 'Consumer goods, local neighborhood supermarket & fast-moving inventory.',
    },
    {
      id: 'food_processing',
      name: 'Food Processing & Packaging',
      category: 'Food Processing',
      investmentRange: '₹12L – ₹50L',
      feasibilityScore: 76,
      marketOpportunity: 'High',
      riskLevel: 'Low',
      icon: '🌾',
      desc: 'Milling, spice packaging, ready-to-eat products & cold storage facilities.',
    },
    {
      id: 'manufacturing',
      name: 'Precision Engineering & Fabrication',
      category: 'Manufacturing',
      investmentRange: '₹15L – ₹60L',
      feasibilityScore: 82,
      marketOpportunity: 'High',
      riskLevel: 'Low',
      icon: '⚙️',
      desc: 'CNC machining, metal components, sheet metal stamping & industrial fabrication.',
    },
    {
      id: 'agriculture',
      name: 'Organic Agri-Produce & Greenhouses',
      category: 'Agriculture & Horticulture',
      investmentRange: '₹4L – ₹20L',
      feasibilityScore: 79,
      marketOpportunity: 'High',
      riskLevel: 'Medium',
      icon: '🌱',
      desc: 'Polyhouse cultivation, organic vegetables, drip irrigation & wholesale mandi supply.',
    },
  ];

  const locations = [
    'Indore, Madhya Pradesh',
    'Pune, Maharashtra',
    'Rourkela, Odisha',
    'Jaipur, Rajasthan',
    'Bangalore, Karnataka',
    'Varanasi, Uttar Pradesh',
    'Ahmedabad, Gujarat',
    'Coimbatore, Tamil Nadu',
  ];

  const handleApply = () => {
    const selectedPreset = businessPresets.find((b) => b.id === selectedType) || businessPresets[0];
    const updatedProfile = {
      ...currentProfile,
      name: selectedPreset.name,
      category: selectedPreset.category,
      businessType: selectedPreset.id,
      location: selectedLocation,
      investmentRange: selectedPreset.investmentRange,
      assessmentDate: '17 May 2025',
    };
    
    if (onSelectBusiness) {
      onSelectBusiness(updatedProfile);
    } else if (onSave) {
      onSave(updatedProfile);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-fadeInScale p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Change Business & Location
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Select any sector or Indian city to dynamically recalculate market intelligence
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Location Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Select Location / Region
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            {locations.map((loc, idx) => (
              <option key={idx} value={loc}>
                📍 {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Business Type Cards Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">
            Select Business Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {businessPresets.map((b) => {
              const isSelected = selectedType === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedType(b.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{b.icon}</span>
                  <div className="space-y-0.5 flex-1">
                    <p className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                      {b.name}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{b.desc}</p>
                    <p className="text-[10px] font-black text-emerald-700">{b.investmentRange}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Apply & Recalculate Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
