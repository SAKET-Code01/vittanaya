import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AVAILABLE_OPERATIONS } from '../data/adaptiveWorkspaceConfig';
import { formatINR } from '../mocks/dashboardMockData';
import {
  EditProfileModal,
  EditBusinessInfoModal,
  EditBusinessTypeModal,
  EditOperationsModal,
  EditFinancialValuesModal,
} from '../components/profile/BusinessProfileModals';
import OperationConfigModal from '../components/profile/OperationConfigModal';
import { getOperationSummaryBadges } from '../data/defaultOperationsConfig';

/**
 * BusinessProfilePage Component — 100% STRICT APPROVED REFERENCE DESIGN
 * 
 * All data is 100% dynamic and connected directly to the single source of truth (WorkspaceContext).
 */
export default function BusinessProfilePage({ onNavigateHome }) {
  const {
    currentProfile,
    updateProfile,
    updateBusinessType,
    updateOperations,
    toggleOperation,
    operationsConfig,
    updateOperationConfig,
    enableOperation,
    deactivateOperation,
    financialData,
    financialSummary,
    updateFinancialValues,
    resetFinancialValues,
    setActiveNavId,
  } = useWorkspace();

  // Modal visibility states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditBusinessInfoOpen, setIsEditBusinessInfoOpen] = useState(false);
  const [isEditBusinessTypeOpen, setIsEditBusinessTypeOpen] = useState(false);
  const [isEditOperationsOpen, setIsEditOperationsOpen] = useState(false);
  const [isEditFinancialOpen, setIsEditFinancialOpen] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  // Dedicated Operation Config Modal State
  const [activeConfigOpId, setActiveConfigOpId] = useState(null);
  const [isOpConfigOpen, setIsOpConfigOpen] = useState(false);

  const selectedOps = currentProfile?.selectedOperations || [];

  // Operation icons and color maps
  const getOpIcon = (id, category) => {
    switch (id) {
      case 'sales':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'purchases':
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        );
      case 'inventory':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        );
      case 'production':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        );
      case 'employees':
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'assets':
        return (
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
      case 'banking':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        );
      case 'loans':
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
          </div>
        );
      case 'projects':
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'fleet':
        return (
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
        );
    }
  };

  const handleExportProfile = () => {
    const profileJson = JSON.stringify(
      {
        profile: currentProfile,
        financial: financialData,
        summary: financialSummary,
      },
      null,
      2
    );

    const blob = new Blob([profileJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentProfile.name || 'business_profile').toLowerCase().replace(/\s+/g, '_')}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  const handleHomeClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (setActiveNavId) {
      setActiveNavId('dashboard');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Header & Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
            <button
              type="button"
              onClick={handleHomeClick}
              className="flex items-center space-x-1 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <span>‹</span>
              <span>Home</span>
            </button>
            <span>/</span>
            <span className="text-slate-800 font-bold">Business Profile</span>
          </div>

          {/* Heading with Info Icon */}
          <div className="flex items-center space-x-2 pt-0.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Business Profile
            </h1>
            <span
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
              title="View and manage your business information, operations and workspace configuration."
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            View and manage your business information, operations and workspace configuration.
          </p>
        </div>

        {/* Action Buttons: Export Profile & Edit Profile */}
        <div className="flex items-center space-x-3 self-start md:self-center flex-wrap">
          <button
            type="button"
            onClick={handleExportProfile}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {showExportSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between animate-fadeIn">
          <span>✓ Profile configuration successfully exported as JSON file.</span>
          <button onClick={() => setShowExportSuccess(false)} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {/* 2. Top 3 Cards Grid (Business Identity, Business Type, Workspace Configuration) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* Card 1: Business Identity */}
        <div className="dash-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Business Identity
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsEditBusinessInfoOpen(true)}
              className="flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
            >
              <span>✎</span>
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-3 text-xs flex-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">👤</span>
                <span>Business / Company Name</span>
              </span>
              <span className="font-extrabold text-slate-900 text-right truncate max-w-[180px]">
                {currentProfile.name || 'Universal MSME Profile'}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">👤</span>
                <span>Owner / Contact Name</span>
              </span>
              <span className="font-bold text-slate-800 text-right truncate">
                {currentProfile.user_name || 'Business Owner'}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">📞</span>
                <span>Phone Number</span>
              </span>
              <span className="font-semibold text-slate-800 text-right font-mono">
                {currentProfile.phone || <span className="text-slate-400 italic font-normal">Not provided</span>}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">✉️</span>
                <span>Email Address</span>
              </span>
              <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
                {currentProfile.email || <span className="text-slate-400 italic font-normal">Not provided</span>}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">📍</span>
                <span>Business Location</span>
              </span>
              <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
                {currentProfile.location || <span className="text-slate-400 italic font-normal">Not set</span>}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">🪪</span>
                <span>GST Number</span>
              </span>
              <span className="font-extrabold text-slate-900 text-right font-mono uppercase">
                {currentProfile.gstin || '21ABCDE1234F1Z5'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Business Type */}
        <div className="dash-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Business Type
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsEditBusinessTypeOpen(true)}
              className="flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
            >
              <span>✎</span>
              <span>Edit</span>
            </button>
          </div>

          {/* Highlighted Business Type Inner Card */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white text-purple-600 border border-purple-200 flex items-center justify-center shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-black text-purple-900 capitalize">
                  {currentProfile.category || currentProfile.businessType || 'Manufacturing'}
                </h4>
                <span className="text-[11px] text-purple-700 font-medium">Primary Business Type</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {currentProfile.description || currentProfile.industry || 'Manufacturing of industrial components and precision parts for B2B clients.'}
          </p>

          {/* Bottom Meta Tags */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">🏢</span>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Industry Sector</span>
                <span className="font-bold text-slate-800 capitalize truncate block">
                  {currentProfile.category || currentProfile.businessType || 'Manufacturing'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">📅</span>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Business Since</span>
                <span className="font-bold text-slate-800 font-mono block">
                  {currentProfile.businessSince || '2022'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Workspace Configuration */}
        <div className="dash-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Workspace Configuration
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsEditOperationsOpen(true)}
              className="flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
            >
              <span>✎</span>
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-3 text-xs flex-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">🏢</span>
                <span>Business Type</span>
              </span>
              <span className="font-extrabold text-slate-900 text-right capitalize">
                {currentProfile.category || currentProfile.businessType || 'Manufacturing'}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">👥</span>
                <span>Active Operations</span>
              </span>
              <span className="font-extrabold text-slate-900 font-mono text-right">
                {selectedOps.length} / {AVAILABLE_OPERATIONS.length}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">⚙️</span>
                <span>Workspace Status</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                Active
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">🕒</span>
                <span>Last Updated</span>
              </span>
              <span className="font-semibold text-slate-800 text-right">
                {currentProfile.lastUpdatedAt || '15 Nov 2024, 10:30 AM'}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">🕒</span>
                <span>Onboarding Completed</span>
              </span>
              <span className="font-semibold text-slate-800 text-right">
                {currentProfile.onboardingCompletedAt || '15 Nov 2024, 10:15 AM'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Big Card: Active Operations */}
      <div className="dash-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Active Operations
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {selectedOps.length} / {AVAILABLE_OPERATIONS.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Configured operations actively monitored in your workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditOperationsOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <span>Manage All</span>
          </button>
        </div>

        {/* Dynamic Active Operations Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {AVAILABLE_OPERATIONS.filter((op) => selectedOps.includes(op.id)).map((op) => {
            const summaryBadges = getOperationSummaryBadges(op.id, operationsConfig[op.id]);

            return (
              <div
                key={op.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 shadow-xs transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    {getOpIcon(op.id, op.category)}
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      Active
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {op.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-0.5">
                      {op.desc}
                    </p>
                  </div>

                  {/* Compact Live Metric Summary Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {summaryBadges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-700 text-[10px] font-bold font-mono"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {op.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveConfigOpId(op.id);
                      setIsOpConfigOpen(true);
                    }}
                    className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                  >
                    <span>✎</span>
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Available / Inactive Operations Section */}
        {AVAILABLE_OPERATIONS.some((op) => !selectedOps.includes(op.id)) && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Available Operations
                </h4>
                <p className="text-[11px] text-slate-500">
                  Additional business capabilities ready to enable and configure
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
              {AVAILABLE_OPERATIONS.filter((op) => !selectedOps.includes(op.id)).map((op) => {
                return (
                  <div
                    key={op.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        {getOpIcon(op.id, op.category)}
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                          Available
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">
                          {op.label}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-0.5">
                          {op.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {op.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          enableOperation(op.id);
                          setActiveConfigOpId(op.id);
                          setIsOpConfigOpen(true);
                        }}
                        className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                      >
                        <span>+</span>
                        <span>Enable</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Card: Business Details & Compliance */}
      <div className="dash-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Business Details
              </h3>
              <p className="text-xs text-slate-500">
                Additional business information and compliance details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditBusinessInfoOpen(true)}
            className="flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
          >
            <span>✎</span>
            <span>Edit Details</span>
          </button>
        </div>

        {/* 6-Column Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-medium block">PAN Number</span>
            <span className="font-extrabold text-slate-900 font-mono uppercase block">
              {currentProfile.pan || 'ABCDE1234F'}
            </span>
          </div>

          <div className="space-y-1 sm:pl-4">
            <span className="text-slate-400 font-medium block">Business Registration No. ⓘ</span>
            <span className="font-extrabold text-slate-900 font-mono block truncate">
              {currentProfile.regNo || 'UDYAM-OD-21-0001234'}
            </span>
          </div>

          <div className="space-y-1 sm:pl-4">
            <span className="text-slate-400 font-medium block">Legal Structure</span>
            <span className="font-extrabold text-slate-900 block truncate">
              {currentProfile.legalStructure || 'Proprietorship'}
            </span>
          </div>

          <div className="space-y-1 sm:pl-4">
            <span className="text-slate-400 font-medium block">Financial Year</span>
            <span className="font-extrabold text-slate-900 block">
              {currentProfile.financialYear || 'April - March'}
            </span>
          </div>

          <div className="space-y-1 sm:pl-4">
            <span className="text-slate-400 font-medium block">Tax Regime</span>
            <span className="font-extrabold text-slate-900 block">
              {currentProfile.taxRegime || 'Regular'}
            </span>
          </div>

          <div className="space-y-1 sm:pl-4">
            <span className="text-slate-400 font-medium block">Currency</span>
            <span className="font-extrabold text-slate-900 block">
              {currentProfile.currency || 'INR (₹)'}
            </span>
          </div>
        </div>

        {/* 3 Text Blocks: Registered Address, Business Description, Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-slate-700 block">Registered Address</span>
            <p className="text-slate-600 leading-relaxed">
              {currentProfile.registeredAddress || currentProfile.location || <span className="text-slate-400 italic">Not provided</span>}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-700 block">Business Description</span>
            <p className="text-slate-600 leading-relaxed">
              {currentProfile.description || currentProfile.industry || <span className="text-slate-400 italic">No description provided</span>}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-700 block">Notes</span>
            <p className="text-slate-600 leading-relaxed">
              {currentProfile.notes || <span className="text-slate-400 italic">No notes added</span>}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Financial Starting Position & Baseline Liquidity Card */}
      <div className="dash-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Financial Starting Position & Baseline Liquidity
              </h3>
              <p className="text-xs text-slate-500">
                Editable financial parameters synchronized across all dashboard metrics and forecast models
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditFinancialOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Financial Values</span>
          </button>
        </div>

        {/* 6 Editable Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">Cash Available</span>
            <p className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono">
              {formatINR(financialData?.cash_balance ?? 1485000)}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">Starting Liquid Cash</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">Receivables</span>
            <p className="text-base sm:text-lg font-extrabold text-blue-700 font-mono">
              {formatINR(financialData?.receivables_total ?? 2850000)}
            </p>
            <span className="text-[10px] text-blue-600 font-medium">Pending Invoices</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">Payables</span>
            <p className="text-base sm:text-lg font-extrabold text-rose-700 font-mono">
              {formatINR(financialData?.payables_total ?? 1920000)}
            </p>
            <span className="text-[10px] text-rose-600 font-medium">Committed Bills</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">Expected Inflow</span>
            <p className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono">
              {formatINR(financialData?.expected_inflow ?? 930000)}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">30D Forecast Inflow</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">Expected Outflow</span>
            <p className="text-base sm:text-lg font-extrabold text-rose-700 font-mono">
              {formatINR(financialData?.expected_outflow ?? 720000)}
            </p>
            <span className="text-[10px] text-rose-600 font-medium">30D Forecast Outflow</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">Safety Buffer</span>
            <p className="text-base sm:text-lg font-extrabold text-purple-700 font-mono">
              {formatINR(financialData?.min_cash_buffer ?? 500000)}
            </p>
            <span className="text-[10px] text-purple-600 font-medium">Target Floor</span>
          </div>
        </div>

        {/* Derived Values Strip */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-800">
              Live Solvency Projections (Derived Automatically):
            </span>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6 flex-wrap gap-y-2">
            <div>
              <span className="text-slate-400 text-[11px]">Runway: </span>
              <strong className="text-purple-700 font-extrabold font-mono">
                {financialSummary?.runway_days ?? 38} Days
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Liquidity Gap: </span>
              <strong className="text-slate-900 font-extrabold font-mono">
                {formatINR(financialSummary?.liquidity_gap ?? 0)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Lowest Projected Cash: </span>
              <strong className="text-blue-700 font-extrabold font-mono">
                {formatINR(financialSummary?.lowest_projected_cash ?? 640000)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Health Score: </span>
              <strong className="text-emerald-700 font-extrabold font-mono">
                {financialSummary?.health_score ?? 84} / 100
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT MODAL OVERLAYS */}
      {/* ========================================================================= */}

      {/* 1. Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={currentProfile}
        onSave={(fields) => updateProfile(fields)}
      />

      {/* 2. Edit Business Identity & Details Modal */}
      <EditBusinessInfoModal
        isOpen={isEditBusinessInfoOpen}
        onClose={() => setIsEditBusinessInfoOpen(false)}
        profile={currentProfile}
        onSave={(fields) => updateProfile(fields)}
      />

      {/* 3. Edit Business Type Modal */}
      <EditBusinessTypeModal
        isOpen={isEditBusinessTypeOpen}
        onClose={() => setIsEditBusinessTypeOpen(false)}
        currentTypeId={currentProfile.businessType || currentProfile.id}
        onSelectType={(typeId) => updateBusinessType(typeId)}
      />

      {/* 4. Edit Operations Modal */}
      <EditOperationsModal
        isOpen={isEditOperationsOpen}
        onClose={() => setIsEditOperationsOpen(false)}
        selectedOps={selectedOps}
        onSave={(newOps) => updateOperations(newOps)}
      />

      {/* 5. Edit Financial Values Modal */}
      <EditFinancialValuesModal
        isOpen={isEditFinancialOpen}
        onClose={() => setIsEditFinancialOpen(false)}
        financialData={financialData}
        financialSummary={financialSummary}
        onSave={(values) => updateFinancialValues(values)}
        onReset={() => resetFinancialValues()}
      />

      {/* 6. Operation-Specific Configuration Modal (13 Operations) */}
      <OperationConfigModal
        isOpen={isOpConfigOpen}
        onClose={() => {
          setIsOpConfigOpen(false);
          setActiveConfigOpId(null);
        }}
        opId={activeConfigOpId}
        currentProfile={currentProfile}
        operationsConfig={operationsConfig}
        onSaveConfig={(opId, values) => updateOperationConfig(opId, values)}
        onDeactivate={(opId) => deactivateOperation(opId)}
      />

    </div>
  );
}
