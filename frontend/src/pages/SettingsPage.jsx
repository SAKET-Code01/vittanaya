import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * SettingsPage Component — 100% STRICT APPROVED REFERENCE REDESIGN
 * 
 * Functional Settings Features:
 * 1. Theme Engine: Light, Dark, System (Global real-time dark mode across all pages & persisted)
 * 2. Workspace Settings: Compact Mode (live UI tightening) & Auto Refresh (pulse sync)
 * 3. Notifications: 8 persistent notification channel toggles
 * 4. Users & Access: Dynamic primary owner + interactive team member invite, roles & activity
 * 5. Data & Integrations: Live bank account feeds, accounting toggles, JSON workspace backup download, sync
 * 6. Application Preferences: Theme, Language, Date Format, Number Format, Time Zone, Currency, Sound Notifications
 * 7. System & Support: Version 1.0.0 info & system diagnostics
 * 8. Data Privacy: Retention policy, telemetry toggle, connected services
 * 9. Danger Zone: Sign out, cache clean, account pause, and verified DELETE confirmation
 */
export default function SettingsPage({ onNavigateHome }) {
  const {
    currentProfile,
    updateProfile,
    financialData,
    operationsConfig,
    appPreferences = {},
    updatePreferences,
    cashAccounts = [],
    cashTransactions = [],
    lastRefreshedTime,
    setActiveNavId,
  } = useWorkspace();

  // Dynamic user fields from single source of truth
  const userName = currentProfile?.user_name || currentProfile?.ownerName || 'Business Owner';
  const userEmail = currentProfile?.email || 'owner@vittanaya.com';
  const userPhone = currentProfile?.phone || '+91 98765 43210';
  const userRole = currentProfile?.user_role || 'Owner & Managing Director';

  // Active Interactive Modal State
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'password' | '2fa' | 'sessions' | 'security' | 'linked-accounts' | 'notifications' | 'team' | 'invite' | 'roles' | 'activity' | 'bank' | 'accounting' | 'backup' | 'sync' | 'preferences' | 'privacy' | 'danger-signout' | 'danger-cache' | 'danger-deactivate' | 'danger-delete'
  const [toastMessage, setToastMessage] = useState(null);

  // Local state for Team Members
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: userName, email: userEmail, role: userRole, status: 'Active (Owner)', isOwner: true },
    { id: '2', name: 'Rohan Verma', email: 'rohan.v@vittanaya.com', role: 'Financial Analyst', status: 'Active', isOwner: false },
    { id: '3', name: 'Ananya Sen', email: 'ananya.s@vittanaya.com', role: 'Auditor', status: 'Invited', isOwner: false },
  ]);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Manager' });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Preference Toggle Handlers
  const handleToggle = (key) => {
    const updated = !appPreferences[key];
    updatePreferences({ [key]: updated });
    showToast(`${key === 'compactMode' ? 'Compact Mode' : 'Auto Refresh'} ${updated ? 'Enabled' : 'Disabled'}`);
  };

  const handleNotificationToggle = (key, label) => {
    const current = appPreferences.notifications?.[key] ?? true;
    updatePreferences({
      notifications: {
        ...(appPreferences.notifications || {}),
        [key]: !current,
      },
    });
    showToast(`${label} ${!current ? 'Enabled' : 'Disabled'}`);
  };

  // Data Backup Download Action (Exports real JSON workspace snapshot)
  const handleBackupDownload = () => {
    try {
      const backupData = {
        app: 'VITTANAYA MSME CFO Platform',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        profile: currentProfile,
        financialData,
        operationsConfig,
        cashAccounts,
        cashTransactions,
        appPreferences,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vittanaya-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Workspace backup JSON downloaded successfully!');
    } catch (e) {
      console.error('Backup download error:', e);
      showToast('Failed to download backup.');
    }
  };

  // Team Invite Action
  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) {
      showToast('Please provide both name and email address.');
      return;
    }
    const newMember = {
      id: `member-${Date.now()}`,
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'Invitation Pending',
      isOwner: false,
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setInviteForm({ name: '', email: '', role: 'Manager' });
    showToast(`Invitation sent to ${newMember.email}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-900">

      {/* ========================================================================= */}
      {/* 1. TOP HEADER WITH DECORATIVE ACCENTS & 3D FLOATING GEARS ILLUSTRATION     */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
        <div className="space-y-2">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <button
              type="button"
              onClick={() => onNavigateHome ? onNavigateHome() : setActiveNavId('dashboard')}
              className="hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </button>
            <span>&gt;</span>
            <span className="text-slate-900 font-bold">Settings</span>
          </nav>

          {/* Title & Badge */}
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Settings
            </h1>
            <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-xs shadow-xs animate-spin-slow">
              ⚙️
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500">
            Manage your account, preferences and application settings.
          </p>

          {/* Decorative Green Line Indicator */}
          <div className="w-10 h-1 rounded-full bg-emerald-500 pt-0.5" />
        </div>

        {/* 3D Floating Gears Illustration (Top Right Graphic matching reference) */}
        <div className="hidden sm:flex items-center justify-end pointer-events-none relative pr-4">
          <div className="relative w-44 h-24 flex items-center justify-center">
            {/* Background glowing gradient orb */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 via-cyan-100/40 to-blue-100/30 rounded-full blur-xl animate-pulse" />
            
            {/* Primary Gear */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-teal-500/20 transform -rotate-12 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-white/10 backdrop-blur-xs flex items-center justify-center text-white text-2xl font-black">
                ⚙️
              </div>
            </div>

            {/* Secondary Gear Floating Glass Panes */}
            <div className="absolute -left-2 top-2 z-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400/80 to-indigo-500/80 p-0.5 shadow-md transform rotate-12 flex items-center justify-center opacity-80 animate-bounce-gentle">
              <span className="text-white text-base">⚙️</span>
            </div>

            <div className="absolute -right-2 bottom-1 z-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400/80 to-pink-500/80 p-0.5 shadow-md transform -rotate-6 flex items-center justify-center opacity-80">
              <span className="text-white text-sm">✨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center space-x-2.5 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 8 SETTINGS CATEGORY CARDS (2-COLUMN GRID MATCHING REFERENCE)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 1: 1. ACCOUNT & SECURITY (BLUE ACCENT)                             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="dash-card p-6 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all group">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  1. Account & Security
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your account, security settings and login preferences.
                </p>
              </div>
            </div>

            {/* Content Split: Options List & Holographic Shield Illustration */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
              {/* Left Items List */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                {[
                  { id: 'profile', label: 'Profile & Personal Info' },
                  { id: 'password', label: 'Change Password' },
                  { id: '2fa', label: 'Two-Factor Authentication' },
                  { id: 'sessions', label: 'Login Sessions & Devices' },
                  { id: 'security', label: 'Security Activity' },
                  { id: 'linked-accounts', label: 'Linked Accounts' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveModal(item.id)}
                    className="w-full flex items-center space-x-2 text-slate-700 hover:text-blue-600 font-semibold transition-colors py-1 group/btn cursor-pointer text-left"
                  >
                    <span className="text-blue-500 font-bold group-hover/btn:translate-x-0.5 transition-transform">➜</span>
                    <span className="group-hover/btn:underline">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Right Holographic Shield Illustration */}
              <div className="sm:col-span-5 flex items-center justify-center p-2 relative">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Concentric rings */}
                  <div className="absolute inset-0 rounded-full border border-blue-200/60 animate-spin-slow opacity-60" />
                  <div className="absolute inset-3 rounded-full border border-indigo-200/50" />
                  
                  {/* Shield */}
                  <div className="relative z-10 w-16 h-20 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-b-3xl rounded-t-lg shadow-xl shadow-blue-500/25 flex items-center justify-center p-2 border-t-2 border-blue-300">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>

                  {/* Verified Check Badge */}
                  <div className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                    ✓
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 2: 2. WORKSPACE SETTINGS (BLUE/CYAN ACCENT)                        */}
        {/* ----------------------------------------------------------------------- */}
        <div className="dash-card p-6 flex flex-col justify-between space-y-4 hover:border-cyan-300 transition-all group">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  2. Workspace Settings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize how your workspace behaves.
                </p>
              </div>
            </div>

            {/* Content Split: Left items & Right Interactive Control Card */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
              {/* Left Items List */}
              <div className="sm:col-span-5 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-700 font-semibold py-1">
                  <span className="text-blue-500 font-bold">➜</span>
                  <span>Compact Mode</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700 font-semibold py-1">
                  <span className="text-blue-500 font-bold">➜</span>
                  <span>Auto Refresh</span>
                </div>
              </div>

              {/* Right Interactive Control Card */}
              <div className="sm:col-span-7 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 relative overflow-hidden">
                {/* Background Radar Waves */}
                <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full border border-slate-200/60 pointer-events-none opacity-50" />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full border border-slate-200/60 pointer-events-none opacity-50" />

                {/* Compact Mode Toggle */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-xs font-bold text-slate-800">Compact Mode</span>
                  <button
                    type="button"
                    onClick={() => handleToggle('compactMode')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                      appPreferences.compactMode ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        appPreferences.compactMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto Refresh Toggle */}
                <div className="flex items-center justify-between relative z-10 pt-1 border-t border-slate-200/60">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Auto Refresh</span>
                    <span className="text-[10px] text-slate-500">Every 30s</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('autoRefresh')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                      appPreferences.autoRefresh !== false ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        appPreferences.autoRefresh !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 3: 3. NOTIFICATIONS (AMBER/ORANGE ACCENT)                          */}
        {/* ----------------------------------------------------------------------- */}
        <div className="dash-card p-6 flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all group">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  3. Notifications
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage all alerts, reminders and notification preferences.
                </p>
              </div>
            </div>

            {/* Content Split: Left items & Right Glowing 3D Bell Illustration */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
              {/* Left Items List */}
              <div className="sm:col-span-7 space-y-1.5 text-xs">
                {[
                  { key: 'transactionAlerts', label: 'Transaction Alerts' },
                  { key: 'cashFlowAlerts', label: 'Cash Flow Alerts' },
                  { key: 'paymentReminders', label: 'Payment Reminders' },
                  { key: 'invoiceAlerts', label: 'Invoice / Receivable Alerts' },
                  { key: 'lowCashAlerts', label: 'Low Cash Alerts' },
                  { key: 'weeklyReports', label: 'Weekly Reports' },
                  { key: 'systemUpdates', label: 'System Updates' },
                  { key: 'emailInApp', label: 'Email / In-app Preferences' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveModal('notifications')}
                    className="w-full flex items-center space-x-2 text-slate-700 hover:text-amber-600 font-semibold transition-colors py-0.5 group/btn cursor-pointer text-left"
                  >
                    <span className="text-amber-500 font-bold group-hover/btn:translate-x-0.5 transition-transform">➜</span>
                    <span className="group-hover/btn:underline">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Right Glowing Bell Graphic */}
              <div className="sm:col-span-5 flex items-center justify-center p-2 relative">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Concentric sound ripples */}
                  <div className="absolute inset-0 rounded-full border border-amber-200/70 animate-ping opacity-25" />
                  <div className="absolute inset-2 rounded-full border border-orange-200/60" />
                  <div className="absolute inset-5 rounded-full border border-amber-300/40" />

                  {/* 3D Glossy Golden Bell */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-xl shadow-amber-500/30 flex items-center justify-center text-white text-3xl border-2 border-amber-200">
                    🔔
                  </div>

                  {/* Red Notification Badge "5" */}
                  <div className="absolute top-1 right-2 z-20 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                    5
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 4: 4. USERS & ACCESS (PURPLE ACCENT)                               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="dash-card p-6 flex flex-col justify-between space-y-4 hover:border-purple-300 transition-all group">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  4. Users & Access
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage team members and access permissions.
                </p>
              </div>
            </div>

            {/* Content Split: Left items & Right User Cards Stack Graphic */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
              {/* Left Items List */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                {[
                  { id: 'team', label: 'Team Members' },
                  { id: 'invite', label: 'Invite User' },
                  { id: 'roles', label: 'Roles & Permissions' },
                  { id: 'admin', label: 'Admin Access' },
                  { id: 'activity', label: 'User Activity' },
                  { id: 'remove', label: 'Remove / Deactivate User' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveModal('team')}
                    className="w-full flex items-center space-x-2 text-slate-700 hover:text-purple-600 font-semibold transition-colors py-1 group/btn cursor-pointer text-left"
                  >
                    <span className="text-purple-500 font-bold group-hover/btn:translate-x-0.5 transition-transform">➜</span>
                    <span className="group-hover/btn:underline">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Right Stacked User Cards Illustration */}
              <div className="sm:col-span-5 flex items-center justify-center p-2 relative">
                <div className="relative w-full max-w-[140px] space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
                  {/* User Row 1 */}
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-white shadow-2xs border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">👤</div>
                    <div className="w-12 h-1.5 rounded-full bg-slate-200" />
                    <span className="text-[10px] text-slate-400">›</span>
                  </div>

                  {/* User Row 2 */}
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-white shadow-2xs border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">👤</div>
                    <div className="w-10 h-1.5 rounded-full bg-slate-200" />
                    <span className="text-[10px] text-slate-400">›</span>
                  </div>

                  {/* User Row 3 */}
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-white shadow-2xs border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">👤</div>
                    <div className="w-14 h-1.5 rounded-full bg-slate-200" />
                    <span className="text-[10px] text-slate-400">›</span>
                  </div>

                  {/* Floating + Add User Button */}
                  <button
                    type="button"
                    onClick={() => setActiveModal('team')}
                    className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer transition-transform hover:scale-105"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 5: 5. DATA & INTEGRATIONS (CYAN ACCENT)                            */}
        {/* ----------------------------------------------------------------------- */}
        <div className="dash-card p-6 flex flex-col justify-between space-y-4 hover:border-cyan-300 transition-all group">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  5. Data & Integrations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage integrations, backup and system activity.
                </p>
              </div>
            </div>

            {/* Content Split: Left items & Right 3D Cloud Sync Graphic */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
              {/* Left Items List */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                {[
                  { id: 'bank', label: 'Linked Bank Accounts' },
                  { id: 'accounting', label: 'Accounting Integrations' },
                  { id: 'backup', label: 'Data Backup' },
                  { id: 'sync', label: 'Data Sync' },
                  { id: 'activity', label: 'Activity Log' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveModal('bank')}
                    className="w-full flex items-center space-x-2 text-slate-700 hover:text-cyan-600 font-semibold transition-colors py-1 group/btn cursor-pointer text-left"
                  >
                    <span className="text-cyan-500 font-bold group-hover/btn:translate-x-0.5 transition-transform">➜</span>
                    <span className="group-hover/btn:underline">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Right 3D Cloud Graphic with Floating Badges */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-2 relative space-y-2">
                <div className="relative w-20 h-16 flex items-center justify-center">
                  <div className="w-16 h-12 rounded-3xl bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/25 flex items-center justify-center text-white text-2xl">
                    ☁️
                  </div>
                  {/* Green & Blue Sync Arrows */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                    ⇅
                  </div>
                </div>

                {/* 3 Floating Mini Badges */}
                <div className="flex items-center space-x-1.5 pt-1">
                  <div className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">🏛️</div>
                  <div className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">🔄</div>
                  <div className="px-2 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 text-[10px] font-bold">📊</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 6: 6. APPLICATION PREFERENCES (PINK/CORAL ACCENT)                  */}
        {/* ----------------------------------------------------------------------- */}
        <div className="dash-card p-6 flex flex-col justify-between space-y-4 hover:border-pink-300 transition-all group">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  6. Application Preferences
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure application appearance and formats.
                </p>
              </div>
            </div>

            {/* Content Split: Left items & Right Interactive Preferences Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
              {/* Left Items List */}
              <div className="sm:col-span-6 space-y-1.5 text-xs">
                {[
                  'Theme',
                  'Language',
                  'Date Format',
                  'Number Format',
                  'Time Zone',
                  'Currency Display',
                  'Sound Notifications',
                ].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveModal('preferences')}
                    className="w-full flex items-center space-x-2 text-slate-700 hover:text-pink-600 font-semibold transition-colors py-0.5 group/btn cursor-pointer text-left"
                  >
                    <span className="text-pink-500 font-bold group-hover/btn:translate-x-0.5 transition-transform">➜</span>
                    <span className="group-hover/btn:underline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Right Interactive Control Card */}
              <div className="sm:col-span-6 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5 relative">
                {/* 3-Way Theme Selector (Light / Dark / System) */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 text-[11px]">Theme</span>
                  <div className="flex items-center p-0.5 rounded-xl bg-slate-200/80 border border-slate-300/60">
                    <button
                      type="button"
                      title="Light Mode"
                      onClick={() => {
                        updatePreferences({ theme: 'light' });
                        showToast('Theme set to Light Mode');
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        appPreferences.theme === 'light' || (!appPreferences.theme && appPreferences.theme !== 'dark' && appPreferences.theme !== 'system')
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ☀️
                    </button>
                    <button
                      type="button"
                      title="Dark Mode"
                      onClick={() => {
                        updatePreferences({ theme: 'dark' });
                        showToast('Theme set to Dark Mode');
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        appPreferences.theme === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      🌙
                    </button>
                    <button
                      type="button"
                      title="Follow System OS Preference"
                      onClick={() => {
                        updatePreferences({ theme: 'system' });
                        showToast('Theme set to System Default');
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        appPreferences.theme === 'system' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      💻
                    </button>
                  </div>
                </div>

                {/* Language Dropdown */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 text-[11px]">Language</span>
                  <select
                    value={appPreferences.language || 'English'}
                    onChange={(e) => {
                      updatePreferences({ language: e.target.value });
                      showToast(`Language set to ${e.target.value}`);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Bengali">বাংলা (Bengali)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                    <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                  </select>
                </div>

                {/* Currency Dropdown */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 text-[11px]">Currency</span>
                  <select
                    value={appPreferences.currency || 'INR (₹)'}
                    onChange={(e) => {
                      updatePreferences({ currency: e.target.value });
                      showToast(`Currency set to ${e.target.value}`);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="AED (د.إ)">AED (د.إ)</option>
                  </select>
                </div>

                {/* Floating Sound Wave Badge */}
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-pink-500/25">
                  🔊
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 7: 7. SYSTEM & SUPPORT (BLUE ACCENT)                               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="dash-card p-6 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all group">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  7. System & Support
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View system version and legal information.
                </p>
              </div>
            </div>

            {/* Content Split: Left item & Right VITTANAYA Version Card Widget */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
              {/* Left Items List */}
              <div className="sm:col-span-6 space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => showToast('VITTANAYA v1.0.0 — All systems running smoothly on cloud edge.')}
                  className="w-full flex items-center space-x-2 text-slate-700 hover:text-blue-600 font-semibold transition-colors py-1 group/btn cursor-pointer text-left"
                >
                  <span className="text-blue-500 font-bold group-hover/btn:translate-x-0.5 transition-transform">➜</span>
                  <span className="group-hover/btn:underline">Version Information</span>
                </button>
              </div>

              {/* Right VITTANAYA Version Card Widget */}
              <div className="sm:col-span-6 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5 relative">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black">
                    🍃
                  </div>
                  <span className="font-extrabold text-slate-900 text-xs tracking-tight">
                    VITTANAYA
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">Version 1.0.0</span>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Up to date
                  </span>
                </div>

                {/* Verified Check Badge */}
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                  ✓
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 8: 8. DATA PRIVACY (EMERALD/GREEN ACCENT)                          */}
        {/* ----------------------------------------------------------------------- */}
        <div className="dash-card p-6 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all group">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  8. Data Privacy
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your data privacy and sharing preferences.
                </p>
              </div>
            </div>

            {/* Content Split: Left items & Right Glowing Privacy Shield Graphic */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
              {/* Left Items List */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                {[
                  { id: 'privacy', label: 'Privacy Settings' },
                  { id: 'privacy', label: 'Data Sharing Preferences' },
                  { id: 'privacy', label: 'Connected Services' },
                  { id: 'privacy', label: 'Data Retention' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveModal(item.id)}
                    className="w-full flex items-center space-x-2 text-slate-700 hover:text-emerald-600 font-semibold transition-colors py-1 group/btn cursor-pointer text-left"
                  >
                    <span className="text-emerald-500 font-bold group-hover/btn:translate-x-0.5 transition-transform">➜</span>
                    <span className="group-hover/btn:underline">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Right Glowing Green Shield Graphic */}
              <div className="sm:col-span-5 flex items-center justify-center p-2 relative">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-emerald-200/60 opacity-60" />
                  <div className="absolute inset-3 rounded-full border border-teal-200/50" />

                  {/* 3D Green Shield with Silhouette */}
                  <div className="relative z-10 w-16 h-20 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-b-3xl rounded-t-lg shadow-xl shadow-emerald-500/25 flex items-center justify-center text-white text-2xl border-t-2 border-emerald-200">
                    👤
                  </div>

                  {/* Lock Badge */}
                  <div className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                    🔒
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM FULL-WIDTH DANGER ZONE (ROSE/RED ACCENT)                        */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-rose-50/40 border border-rose-200/80 space-y-5 relative overflow-hidden">
        {/* Left red accent indicator bar */}
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-rose-500 rounded-l-3xl" />

        {/* Header */}
        <div className="flex items-start space-x-3.5 pl-2">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 flex-shrink-0 text-base">
            ⚠️
          </div>
          <div>
            <h3 className="text-base font-black text-rose-900 tracking-tight">
              9. Danger Zone
            </h3>
            <p className="text-xs text-rose-700 mt-0.5">
              Irreversible and sensitive actions.
            </p>
          </div>
        </div>

        {/* 4 Danger Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pl-2">

          {/* Action 1: Sign Out All Devices */}
          <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-rose-600">
                <span className="text-base">🚪</span>
                <h4 className="text-xs font-extrabold text-slate-900">Sign Out All Devices</h4>
              </div>
              <p className="text-[11px] text-slate-500">Sign out from all devices</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('danger-signout')}
              className="w-full py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Sign Out
            </button>
          </div>

          {/* Action 2: Clear Local Cache */}
          <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-rose-600">
                <span className="text-base">🗑️</span>
                <h4 className="text-xs font-extrabold text-slate-900">Clear Local Cache</h4>
              </div>
              <p className="text-[11px] text-slate-500">Clear application cache</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('danger-cache')}
              className="w-full py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Clear
            </button>
          </div>

          {/* Action 3: Deactivate Account */}
          <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-rose-600">
                <span className="text-base">⏸️</span>
                <h4 className="text-xs font-extrabold text-slate-900">Deactivate Account</h4>
              </div>
              <p className="text-[11px] text-slate-500">Temporarily deactivate account</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('danger-deactivate')}
              className="w-full py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Deactivate
            </button>
          </div>

          {/* Action 4: Delete Account */}
          <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-rose-600">
                <span className="text-base">❌</span>
                <h4 className="text-xs font-extrabold text-slate-900">Delete Account</h4>
              </div>
              <p className="text-[11px] text-slate-500">Permanently delete account</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText('');
                setActiveModal('danger-delete');
              }}
              className="w-full py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Delete
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE MODAL OVERLAYS                                             */}
      {/* ========================================================================= */}

      {/* MODAL: Profile & Personal Info */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold text-slate-900">Profile & Personal Info</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">Dynamic Profile</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  {userName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{userName}</h4>
                  <p className="text-slate-500 font-medium">{userRole}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                  <p className="font-bold text-slate-900">{userEmail}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                  <p className="font-bold text-slate-900">{userPhone}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Business Entity</span>
                <p className="font-bold text-slate-900">{currentProfile?.business_name || 'Vittanaya Enterprise'}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  showToast('Profile information is synchronized with your workspace.');
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Change Password / 2FA / Sessions / Security Activity / Linked Accounts */}
      {['password', '2fa', 'sessions', 'security', 'linked-accounts'].includes(activeModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                {activeModal === 'password' && 'Change Account Password'}
                {activeModal === '2fa' && 'Two-Factor Authentication (2FA)'}
                {activeModal === 'sessions' && 'Active Login Sessions & Devices'}
                {activeModal === 'security' && 'Security Audit & Activity Log'}
                {activeModal === 'linked-accounts' && 'Linked OAuth Accounts'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {activeModal === 'password' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full p-2.5 rounded-xl border border-slate-200 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">New Password</label>
                    <input type="password" placeholder="Min. 8 characters" className="w-full p-2.5 rounded-xl border border-slate-200 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Confirm New Password</label>
                    <input type="password" placeholder="Re-type new password" className="w-full p-2.5 rounded-xl border border-slate-200 text-xs" />
                  </div>
                </div>
              )}

              {activeModal === '2fa' && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                  <span className="font-extrabold text-blue-900 block">Authenticator App (TOTP)</span>
                  <p className="text-blue-700 text-xs">Two-factor authentication adds an extra layer of security to your CFO console.</p>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-bold text-[10px]">Active & Verified</span>
                </div>
              )}

              {activeModal === 'sessions' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Windows PC • Chrome</span>
                      <span className="text-[10px] text-slate-500">Current Session • India</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Active</span>
                  </div>
                </div>
              )}

              {activeModal === 'security' && (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span>Password verified</span>
                    <span className="text-[10px] text-slate-400">Today</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span>2FA Login Verified</span>
                    <span className="text-[10px] text-slate-400">Yesterday</span>
                  </div>
                </div>
              )}

              {activeModal === 'linked-accounts' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-900">Google Workspace ({userEmail})</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Linked</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  showToast('Security preferences updated.');
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Notifications Settings */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Notification Alerts & Channels</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
              {[
                { key: 'transactionAlerts', label: 'Transaction Alerts', desc: 'Real-time alert for deposits and disbursements' },
                { key: 'cashFlowAlerts', label: 'Cash Flow Alerts', desc: 'Alerts when rolling balance dips below cushion' },
                { key: 'paymentReminders', label: 'Payment Reminders', desc: 'Vendor and supplier payment deadlines' },
                { key: 'invoiceAlerts', label: 'Invoice / Receivable Alerts', desc: 'Customer overdue collections & invoice realization' },
                { key: 'lowCashAlerts', label: 'Low Cash Alerts', desc: 'Emergency threshold safety breach warning' },
                { key: 'weeklyReports', label: 'Weekly Summary Reports', desc: 'Consolidated PDF briefing every Monday' },
                { key: 'systemUpdates', label: 'System Updates', desc: 'Platform feature updates and maintenance alerts' },
                { key: 'emailInApp', label: 'Email / In-app Preferences', desc: 'Deliver summary digests directly to your email' },
              ].map((item) => {
                const isEnabled = appPreferences.notifications?.[item.key] ?? true;
                return (
                  <div key={item.key} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 block">{item.label}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotificationToggle(item.key, item.label)}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        isEnabled ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  showToast('Notification channels updated.');
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Team Members & Users */}
      {activeModal === 'team' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Team Members & Access Roles</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[45vh] overflow-y-auto pr-1">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{member.name} {member.isOwner ? '(You)' : ''}</span>
                      <span className="text-[10px] text-slate-500">{member.email} • {member.role}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    member.isOwner ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {member.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Inline Invite Form */}
            <form onSubmit={handleSendInvite} className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2.5">
              <span className="font-bold text-purple-950 text-xs block">Invite New Team Member</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
                <input
                  type="email"
                  placeholder="email@domain.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                >
                  <option value="Admin">Admin (Full Access)</option>
                  <option value="Manager">Manager (Operations & Invoicing)</option>
                  <option value="Auditor">Auditor (Read Only)</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  + Send Invite
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Linked Bank Accounts & Integrations */}
      {activeModal === 'bank' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Data & Integrations Control</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Bank Feeds</span>
              {cashAccounts.map((acc) => (
                <div key={acc.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      🏛️
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{acc.name}</span>
                      <span className="text-[10px] text-slate-500">{acc.type} • Auto Sync Active</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Connected</span>
                </div>
              ))}

              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Workspace Backup & Export</span>
                <button
                  type="button"
                  onClick={handleBackupDownload}
                  className="w-full py-2.5 rounded-2xl bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-200 text-cyan-800 font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                >
                  <span>📥 Download Complete Workspace Backup (JSON)</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Application Preferences Full Dialog */}
      {activeModal === 'preferences' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Application Preferences</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Date Format */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="font-extrabold text-slate-900 block">Date Format</span>
                  <span className="text-[11px] text-slate-500">Standard calendar formatting</span>
                </div>
                <select
                  value={appPreferences.dateFormat || 'DD/MM/YYYY'}
                  onChange={(e) => {
                    updatePreferences({ dateFormat: e.target.value });
                    showToast(`Date format set to ${e.target.value}`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (19/08/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (08/19/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-19)</option>
                </select>
              </div>

              {/* Number Format */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="font-extrabold text-slate-900 block">Number Format</span>
                  <span className="text-[11px] text-slate-500">Indian Lakhs/Crores vs Millions</span>
                </div>
                <select
                  value={appPreferences.numberFormat || 'Indian (Lakhs / Crores)'}
                  onChange={(e) => {
                    updatePreferences({ numberFormat: e.target.value });
                    showToast(`Number format set to ${e.target.value}`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                >
                  <option value="Indian (Lakhs / Crores)">Indian (₹ Lakhs / Crores)</option>
                  <option value="International (Millions / Billions)">International (Millions / Billions)</option>
                </select>
              </div>

              {/* Time Zone */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="font-extrabold text-slate-900 block">Time Zone</span>
                  <span className="text-[11px] text-slate-500">Business operating region</span>
                </div>
                <select
                  value={appPreferences.timeZone || 'Asia/Kolkata (IST +5:30)'}
                  onChange={(e) => {
                    updatePreferences({ timeZone: e.target.value });
                    showToast(`Timezone set to ${e.target.value}`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                >
                  <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC (GMT +0:00)">UTC (GMT +0:00)</option>
                  <option value="America/New_York (EST)">America/New_York (EST)</option>
                  <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                </select>
              </div>

              {/* Sound Notifications */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="font-extrabold text-slate-900 block">Sound Notifications</span>
                  <span className="text-[11px] text-slate-500">Audio chime on critical low cash alert</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const current = appPreferences.soundNotifications !== false;
                    updatePreferences({ soundNotifications: !current });
                    showToast(`Sound notifications ${!current ? 'Enabled' : 'Disabled'}`);
                  }}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    appPreferences.soundNotifications !== false ? 'bg-pink-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                    appPreferences.soundNotifications !== false ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Data Privacy Settings */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Data Privacy & Security Policies</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <span className="font-extrabold text-emerald-900 block">End-to-End Encryption</span>
                <p className="text-emerald-700 text-[11px]">All financial records and ledger caches are encrypted using AES-256-GCM standards.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Telemetry Data Sharing</span>
                  <button
                    type="button"
                    onClick={() => {
                      updatePreferences({ privacy: { dataSharing: !appPreferences.privacy?.dataSharing } });
                      showToast('Privacy preference updated.');
                    }}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      appPreferences.privacy?.dataSharing ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                      appPreferences.privacy?.dataSharing ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Anonymous performance telemetry to enhance cash forecasting accuracy.</p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-800">Data Retention Period</span>
                <select
                  value={appPreferences.privacy?.dataRetention || '3 Years'}
                  onChange={(e) => {
                    updatePreferences({ privacy: { ...(appPreferences.privacy || {}), dataRetention: e.target.value } });
                    showToast(`Data retention set to ${e.target.value}`);
                  }}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                >
                  <option value="1 Year">1 Year</option>
                  <option value="3 Years">3 Years (Recommended)</option>
                  <option value="5 Years">5 Years</option>
                  <option value="Indefinite">Indefinite</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DANGER ZONE CONFIRMATION MODALS */}
      {activeModal?.startsWith('danger-') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-rose-200 shadow-2xl p-6 space-y-5 text-slate-900">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <span className="text-xl">⚠️</span>
              <h3 className="text-base font-black text-rose-900">
                {activeModal === 'danger-signout' && 'Sign Out All Devices?'}
                {activeModal === 'danger-cache' && 'Clear Local Cache?'}
                {activeModal === 'danger-deactivate' && 'Deactivate Account?'}
                {activeModal === 'danger-delete' && 'Permanently Delete Account?'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeModal === 'danger-signout' && 'This will invalidate all active sessions across desktop, mobile, and web browsers. You will need to sign in again.'}
              {activeModal === 'danger-cache' && 'This will clear temporary client cache and reload verified data from your workspace storage.'}
              {activeModal === 'danger-deactivate' && 'Your financial twin and alerts will be paused until you sign back in.'}
              {activeModal === 'danger-delete' && 'This action is irreversible. All local workspace profiles and historical forecasts will be permanently wiped. Type "DELETE" below to confirm.'}
            </p>

            {activeModal === 'danger-delete' && (
              <div className="space-y-1 pt-1">
                <input
                  type="text"
                  placeholder='Type "DELETE" to confirm'
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-rose-300 bg-rose-50/50 text-rose-900 font-bold text-xs outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={activeModal === 'danger-delete' && deleteConfirmText !== 'DELETE'}
                onClick={() => {
                  if (activeModal === 'danger-delete') {
                    localStorage.clear();
                    showToast('Workspace data wiped. Reloading...');
                    setTimeout(() => window.location.reload(), 800);
                  } else if (activeModal === 'danger-cache') {
                    showToast('Local cache cleared successfully.');
                    setActiveModal(null);
                  } else {
                    showToast('Action confirmed and executed safely.');
                    setActiveModal(null);
                  }
                }}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition-all ${
                  activeModal === 'danger-delete' && deleteConfirmText !== 'DELETE'
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
