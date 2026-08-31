import React, { useState } from 'react';
import { BUSINESS_TYPES, AVAILABLE_OPERATIONS } from '../../data/adaptiveWorkspaceConfig';
import { formatINR } from '../../mocks/dashboardMockData';

/**
 * 1. EDIT PROFILE MODAL ("Change Profile")
 * Allows editing user photo/initials, full name, role, phone, and email.
 */
export function EditProfileModal({ isOpen, onClose, profile, onSave }) {
  const [formData, setFormData] = useState({
    user_name: profile?.user_name || '',
    user_role: profile?.user_role || 'Business Owner',
    phone: profile?.phone || '',
    email: profile?.email || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const userInitials = formData.user_name
    ? formData.user_name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Change Profile</h3>
              <p className="text-xs text-slate-500">Update personal credentials and contact details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-14 h-14 rounded-full bg-slate-800 text-blue-400 font-extrabold text-lg flex items-center justify-center shadow-md">
              {userInitials}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Profile Photo / Avatar</p>
              <p className="text-[11px] text-slate-500">Generated dynamically from your initials</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Role / Designation *</label>
            <input
              type="text"
              required
              value={formData.user_role}
              onChange={(e) => setFormData({ ...formData, user_role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Business Owner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="owner@example.com"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * 2. EDIT BUSINESS IDENTITY & DETAILS MODAL
 * Allows editing Business Name, Location, GST, PAN, Udyam, Structure, Description, etc.
 */
export function EditBusinessInfoModal({ isOpen, onClose, profile, onSave }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    user_name: profile?.user_name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    location: profile?.location || '',
    gstin: profile?.gstin || '',
    pan: profile?.pan || '',
    regNo: profile?.regNo || '',
    legalStructure: profile?.legalStructure || 'Proprietorship',
    taxRegime: profile?.taxRegime || 'Regular',
    financialYear: profile?.financialYear || 'April - March',
    currency: profile?.currency || 'INR (₹)',
    registeredAddress: profile?.registeredAddress || '',
    description: profile?.description || '',
    notes: profile?.notes || '',
    businessSince: profile?.businessSince || '2022',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Edit Business Identity & Details</h3>
              <p className="text-xs text-slate-500">Update company identity, compliance numbers, and addresses</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Business / Company Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Test Business A"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Owner / Contact Name *</label>
              <input
                type="text"
                required
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Amiya Nayak"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Business Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">GST Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => {
                  const gstinVal = e.target.value.toUpperCase();
                  const autoPan = gstinVal.length === 15 ? gstinVal.substring(2, 12) : formData.pan;
                  setFormData({ ...formData, gstin: gstinVal, pan: autoPan });
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 uppercase font-mono"
                placeholder="21ABCDE1234F1Z5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">PAN Number</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 uppercase font-mono"
                placeholder="ABCDE1234F"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Registration No. (Udyam)</label>
              <input
                type="text"
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 font-mono"
                placeholder="UDYAM-OD-21-0001234"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Legal Structure</label>
              <select
                value={formData.legalStructure}
                onChange={(e) => setFormData({ ...formData, legalStructure: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="Proprietorship">Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="LLP">LLP</option>
                <option value="Private Limited">Private Limited</option>
                <option value="Public Limited">Public Limited</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Financial Year</label>
              <input
                type="text"
                value={formData.financialYear}
                onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tax Regime</label>
              <select
                value={formData.taxRegime}
                onChange={(e) => setFormData({ ...formData, taxRegime: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="Regular">Regular</option>
                <option value="Composition">Composition</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Business Since (Year)</label>
              <input
                type="text"
                value={formData.businessSince}
                onChange={(e) => setFormData({ ...formData, businessSince: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Registered Address</label>
            <input
              type="text"
              value={formData.registeredAddress}
              onChange={(e) => setFormData({ ...formData, registeredAddress: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
              placeholder="Full registered address"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Business Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
              placeholder="Describe your primary business operations"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Notes & Focus Areas</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Focus on automation, quality control and customer satisfaction."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * 3. EDIT BUSINESS TYPE MODAL
 * Switch between the 9 supported business types.
 */
export function EditBusinessTypeModal({ isOpen, onClose, currentTypeId, onSelectType }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Select Business Type</h3>
              <p className="text-xs text-slate-500">Adapts workspace terminology, dashboards, and KPI drivers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {BUSINESS_TYPES.map((type) => {
            const isSelected = currentTypeId === type.id;
            return (
              <div
                key={type.id}
                onClick={() => {
                  onSelectType(type.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 text-left ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/80 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">{type.label}</span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{type.desc}</p>
                <span className="text-[10px] font-semibold text-purple-700 pt-1">
                  Holding: {type.terminology?.holding || 'Stock'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 4. EDIT OPERATIONS MODAL ("Edit Operations")
 * Multi-select modal to toggle available operations.
 */
export function EditOperationsModal({ isOpen, onClose, selectedOps = [], onSave }) {
  const [currentSelected, setCurrentSelected] = useState(selectedOps);

  if (!isOpen) return null;

  const handleToggle = (opId) => {
    setCurrentSelected((prev) =>
      prev.includes(opId) ? prev.filter((id) => id !== opId) : [...prev, opId]
    );
  };

  const handleSave = () => {
    onSave(currentSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Manage Active Operations</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {currentSelected.length} / {AVAILABLE_OPERATIONS.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500">Enable or disable business operation modules for your workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-1">
          {AVAILABLE_OPERATIONS.map((op) => {
            const isSelected = currentSelected.includes(op.id);
            return (
              <div
                key={op.id}
                onClick={() => handleToggle(op.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-blue-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{op.label}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{op.desc}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{op.category}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isSelected ? 'Active' : 'Enable'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentSelected(AVAILABLE_OPERATIONS.map((o) => o.id))}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Select All
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Save Active Operations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 5. EDIT FINANCIAL VALUES MODAL ("Edit Financial Values")
 * Allows editing Cash Available, Receivables, Payables, Expected Inflow, Expected Outflow, Safety Buffer.
 * Automatically displays live derived Cash Runway, Liquidity Gap, Lowest Cash, and Health Score.
 */
export function EditFinancialValuesModal({
  isOpen,
  onClose,
  financialData,
  financialSummary,
  onSave,
  onReset,
}) {
  const [formData, setFormData] = useState({
    cash_balance: financialData?.cash_balance ?? 1485000,
    receivables_total: financialData?.receivables_total ?? 2850000,
    payables_total: financialData?.payables_total ?? 1920000,
    expected_inflow: financialData?.expected_inflow ?? 930000,
    expected_outflow: financialData?.expected_outflow ?? 720000,
    min_cash_buffer: financialData?.min_cash_buffer ?? 500000,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      cash_balance: Number(formData.cash_balance),
      receivables_total: Number(formData.receivables_total),
      payables_total: Number(formData.payables_total),
      expected_inflow: Number(formData.expected_inflow),
      expected_outflow: Number(formData.expected_outflow),
      min_cash_buffer: Number(formData.min_cash_buffer),
    });
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      setFormData({
        cash_balance: 1485000,
        receivables_total: 2850000,
        payables_total: 1920000,
        expected_inflow: 930000,
        expected_outflow: 720000,
        min_cash_buffer: 500000,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Edit Financial Starting Position</h3>
              <p className="text-xs text-slate-500">Updates shared financial mock data and synchronizes the entire dashboard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Editable Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Cash Available (₹) *</span>
                <span className="text-[10px] text-blue-600 font-normal">Primary Liquid Ledger</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={1000}
                value={formData.cash_balance}
                onChange={(e) => setFormData({ ...formData, cash_balance: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 font-medium">{formatINR(Number(formData.cash_balance))}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Receivables Total (₹) *</span>
                <span className="text-[10px] text-blue-600 font-normal">Pending Invoices</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={1000}
                value={formData.receivables_total}
                onChange={(e) => setFormData({ ...formData, receivables_total: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 font-medium">{formatINR(Number(formData.receivables_total))}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Payables Total (₹) *</span>
                <span className="text-[10px] text-rose-600 font-normal">Committed Vendor Dues</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={1000}
                value={formData.payables_total}
                onChange={(e) => setFormData({ ...formData, payables_total: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 font-medium">{formatINR(Number(formData.payables_total))}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Safety Buffer (₹) *</span>
                <span className="text-[10px] text-purple-600 font-normal">Minimum Floor</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={1000}
                value={formData.min_cash_buffer}
                onChange={(e) => setFormData({ ...formData, min_cash_buffer: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 font-medium">{formatINR(Number(formData.min_cash_buffer))}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Expected 30D Inflow (₹) *</span>
                <span className="text-[10px] text-blue-600 font-normal">Incoming collections</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={1000}
                value={formData.expected_inflow}
                onChange={(e) => setFormData({ ...formData, expected_inflow: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 font-medium">{formatINR(Number(formData.expected_inflow))}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Expected 30D Outflow (₹) *</span>
                <span className="text-[10px] text-rose-600 font-normal">Scheduled payments</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={1000}
                value={formData.expected_outflow}
                onChange={(e) => setFormData({ ...formData, expected_outflow: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 font-medium">{formatINR(Number(formData.expected_outflow))}</p>
            </div>
          </div>

          {/* Derived Values Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Derived Values (Calculated Automatically)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                Non-Editable
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 bg-white rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Cash Runway</span>
                <span className="text-xs font-extrabold text-purple-700">
                  {financialSummary?.runway_days ?? 38} Days
                </span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Liquidity Gap</span>
                <span className="text-xs font-extrabold text-slate-900">
                  {formatINR(financialSummary?.liquidity_gap ?? 0)}
                </span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Lowest Cash</span>
                <span className="text-xs font-extrabold text-blue-700">
                  {formatINR(financialSummary?.lowest_projected_cash ?? 640000)}
                </span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Health Score</span>
                <span className="text-xs font-extrabold text-blue-700">
                  {financialSummary?.health_score ?? 84} / 100
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
            >
              Reset to Demo Defaults
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Save Financial Values
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
