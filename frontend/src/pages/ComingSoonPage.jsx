import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * VITTANAYA — Dynamic Coming Soon Page Component
 * 
 * Provides a professional, premium "Under Active Development" experience
 * for all unbuilt pages and routes (Reports, Forecast, Digital Twin, Simulator, Recommendations, etc.)
 */

// Comprehensive configuration dictionary for all unbuilt and future features
export const COMING_SOON_CONFIGS = {
  reports: {
    id: 'reports',
    title: 'Reports & Financial Audits',
    category: 'DECISION TOOLS',
    tag: 'COMING SOON',
    badge: 'In Development • Q3 Release',
    accentColor: 'emerald',
    description: "We're building something powerful for your financial intelligence workspace.",
    supportingText: 'Export board-ready financial dossiers, GST reconciliation packages, and multi-period cash audits designed specifically for MSME compliance.',
    plannedFeatures: [
      'Automated P&L & Balance Sheet',
      'GST & Tax Reconciliation Packages',
      'Multi-Period Cash Flow Audits',
      'One-Click PDF & Excel Dossiers',
    ],
    illustration: (
      <svg className="w-24 h-24 sm:w-28 sm:h-28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="15" width="70" height="90" rx="10" className="fill-emerald-500/10 stroke-emerald-500/40 dark:fill-emerald-500/5 dark:stroke-emerald-500/30" strokeWidth="2" />
        <rect x="35" y="28" width="32" height="4" rx="2" className="fill-emerald-500/80" />
        <rect x="35" y="38" width="50" height="3" rx="1.5" className="fill-slate-300 dark:fill-slate-700" />
        <rect x="35" y="46" width="42" height="3" rx="1.5" className="fill-slate-300 dark:fill-slate-700" />
        {/* Mini chart inside document */}
        <path d="M 36 82 L 50 68 L 64 74 L 84 56" className="stroke-emerald-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="84" cy="56" r="3.5" className="fill-emerald-400 animate-ping" />
        <circle cx="84" cy="56" r="2.5" className="fill-emerald-500" />
        {/* Verification stamp */}
        <circle cx="75" cy="85" r="12" className="fill-emerald-500/20 stroke-emerald-500/60" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M 70 85 L 73 88 L 80 81" className="stroke-emerald-500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  forecast: {
    id: 'forecast',
    title: 'Cash Flow Forecasting Engine',
    category: 'WORKSPACE',
    tag: 'COMING SOON',
    badge: 'Calibrating AI Model • 90-Day Horizon',
    accentColor: 'cyan',
    description: 'Predictive financial insights and future cash-flow analysis are on the way.',
    supportingText: 'Leverage causal AI modeling to forecast 30, 60, and 90-day cash positions, simulate customer invoice payment probabilities, and detect liquidity dips before they occur.',
    plannedFeatures: [
      '90-Day Predictive Cash Curves',
      'Customer Payment Likelihood Scores',
      'Seasonal Revenue Trend Modeling',
      'Automated Runway Stress Tests',
    ],
    illustration: (
      <svg className="w-24 h-24 sm:w-28 sm:h-28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="48" className="stroke-cyan-500/20 dark:stroke-cyan-500/10" strokeWidth="1.5" strokeDasharray="4 4" />
        {/* Trajectory curve */}
        <path d="M 22 84 C 40 80, 50 55, 65 62 C 80 70, 88 38, 102 30" className="stroke-cyan-500" strokeWidth="3" strokeLinecap="round" />
        {/* Forecast prediction cone */}
        <path d="M 65 62 L 102 20 L 102 44 Z" className="fill-cyan-500/15" />
        <circle cx="65" cy="62" r="4" className="fill-cyan-400" />
        <circle cx="102" cy="30" r="5" className="fill-cyan-400 animate-pulse" />
        <circle cx="102" cy="30" r="2.5" className="fill-white" />
        {/* Axis line */}
        <line x1="20" y1="94" x2="104" y2="94" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="1.5" strokeDasharray="2 4" />
      </svg>
    ),
  },

  'digital-twin': {
    id: 'digital-twin',
    title: 'Causal Digital Twin',
    category: 'WORKSPACE',
    tag: 'COMING SOON',
    badge: 'Neural Topology • Real-Time Simulation',
    accentColor: 'purple',
    description: "Your business's intelligent digital representation is coming soon.",
    supportingText: 'An interconnected causal simulation of your supplier contracts, inventory lead times, customer collections, and banking obligations running 24/7 in real time.',
    plannedFeatures: [
      'Live Working Capital Topology',
      'Causal Bottleneck Detection',
      'Cross-Operation Ripple Analysis',
      'Real-Time Telemetry Sync',
    ],
    illustration: (
      <svg className="w-24 h-24 sm:w-28 sm:h-28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="42" className="stroke-purple-500/30 dark:stroke-purple-500/20" strokeWidth="1.5" strokeDasharray="4 6" />
        <circle cx="60" cy="60" r="24" className="stroke-purple-500/40" strokeWidth="1" />
        {/* Nodes */}
        <circle cx="60" cy="28" r="5" className="fill-purple-400" />
        <circle cx="90" cy="68" r="5" className="fill-purple-400" />
        <circle cx="30" cy="68" r="5" className="fill-purple-400" />
        <circle cx="60" cy="60" r="8" className="fill-purple-500/20 stroke-purple-400" strokeWidth="2" />
        {/* Interconnections */}
        <line x1="60" y1="28" x2="60" y2="52" className="stroke-purple-400" strokeWidth="2" strokeDasharray="2 2" />
        <line x1="60" y1="60" x2="90" y2="68" className="stroke-purple-400" strokeWidth="2" strokeDasharray="2 2" />
        <line x1="60" y1="60" x2="30" y2="68" className="stroke-purple-400" strokeWidth="2" strokeDasharray="2 2" />
        <circle cx="60" cy="60" r="3" className="fill-white" />
      </svg>
    ),
  },

  simulator: {
    id: 'simulator',
    title: 'What-If Scenario Simulator',
    category: 'DECISION TOOLS',
    tag: 'COMING SOON',
    badge: 'Scenario Modeling • Capital Stress Testing',
    accentColor: 'amber',
    description: 'Explore future business scenarios and financial decisions before committing capital.',
    supportingText: 'Simulate supplier price hikes, hiring expansions, delayed customer payments, and equipment financing with instant visual impact on your cash runway.',
    plannedFeatures: [
      'Hiring & Payroll Expansion Modeling',
      'Supplier Price Hike Stress Tests',
      'Customer Payment Delay Impact',
      'Capex Financing vs Cash Comparison',
    ],
    illustration: (
      <svg className="w-24 h-24 sm:w-28 sm:h-28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Branching tree */}
        <circle cx="30" cy="60" r="6" className="fill-amber-500" />
        <path d="M 36 60 C 50 60, 60 38, 85 38" className="stroke-amber-500" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 36 60 C 50 60, 60 82, 85 82" className="stroke-amber-500/60" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        <circle cx="88" cy="38" r="6" className="fill-amber-400" />
        <circle cx="88" cy="82" r="5" className="fill-amber-500/50" />
        {/* Sliders preview */}
        <rect x="42" y="15" width="46" height="8" rx="4" className="fill-amber-500/20 stroke-amber-500/40" strokeWidth="1" />
        <circle cx="68" cy="19" r="4" className="fill-amber-400" />
      </svg>
    ),
  },

  recommendations: {
    id: 'recommendations',
    title: 'Smart AI Recommendations',
    category: 'DECISION TOOLS',
    tag: 'COMING SOON',
    badge: 'Autonomous Advice • Liquidity Protection',
    accentColor: 'teal',
    description: 'Smart financial recommendations tailored to your business are coming soon.',
    supportingText: 'Autonomous, context-aware suggestions to accelerate receivables collection, negotiate optimal vendor terms, prevent cash crunches, and capture early-payment discounts.',
    plannedFeatures: [
      'Working Capital Optimization Plays',
      'Early-Payment Discount Captures',
      'Overdue Collection Strategy Playbooks',
      'Dynamic Safety Buffer Sizing',
    ],
    illustration: (
      <svg className="w-24 h-24 sm:w-28 sm:h-28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bulb & Intelligence Core */}
        <circle cx="60" cy="50" r="26" className="fill-teal-500/10 stroke-teal-500/40 dark:fill-teal-500/5" strokeWidth="2" />
        <path d="M 52 74 L 68 74 L 64 84 L 56 84 Z" className="fill-teal-500/30 stroke-teal-500" strokeWidth="1.5" />
        {/* Inner neural filament */}
        <path d="M 54 50 Q 60 38 66 50 Q 60 62 54 50 Z" className="stroke-teal-400" strokeWidth="2" />
        <circle cx="60" cy="50" r="3" className="fill-white" />
        {/* Glow rays */}
        <line x1="60" y1="16" x2="60" y2="22" className="stroke-teal-400" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="26" x2="40" y2="30" className="stroke-teal-400" strokeWidth="2" strokeLinecap="round" />
        <line x1="84" y1="26" x2="80" y2="30" className="stroke-teal-400" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },

  invoices: {
    id: 'invoices',
    title: 'Smart Invoices & Receivables',
    category: 'WORKSPACE',
    tag: 'COMING SOON',
    badge: 'Automated Aging • Smart Reconciliation',
    accentColor: 'blue',
    description: 'Automated invoice tracking, customer aging analysis, and smart collection workflows are on the way.',
    supportingText: 'Streamline your invoice lifecycle, track payment statuses in real time, and trigger AI-assisted collection reminders before receivables become overdue.',
    plannedFeatures: [
      'Real-Time Customer Aging Buckets',
      'Automated Payment Reminders',
      'Dispute & Reconciliation Logs',
      'Customer Credit Limit Scoring',
    ],
    illustration: (
      <svg className="w-24 h-24 sm:w-28 sm:h-28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="25" width="56" height="74" rx="8" className="fill-blue-500/10 stroke-blue-500/30" strokeWidth="1.5" />
        <rect x="38" y="16" width="56" height="74" rx="8" className="fill-blue-500/20 stroke-blue-500/60 dark:fill-blue-500/10 dark:stroke-blue-500/40" strokeWidth="2" />
        <rect x="48" y="30" width="24" height="4" rx="2" className="fill-blue-400" />
        <rect x="48" y="40" width="36" height="3" rx="1.5" className="fill-slate-300 dark:fill-slate-700" />
        <rect x="48" y="48" width="28" height="3" rx="1.5" className="fill-slate-300 dark:fill-slate-700" />
        <circle cx="76" cy="68" r="10" className="fill-blue-500/30 stroke-blue-400" strokeWidth="1.5" />
        <path d="M 72 68 L 75 71 L 81 65" className="stroke-blue-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  holding: {
    id: 'holding',
    title: 'Warehouse & Inventory Intelligence',
    category: 'WORKSPACE',
    tag: 'COMING SOON',
    badge: 'Stock Valuation • Holding Cost Optimization',
    accentColor: 'indigo',
    description: 'Intelligent inventory monitoring, holding cost analysis, and stock velocity insights are coming soon.',
    supportingText: 'Connect warehouse stock levels directly to cash runway to prevent overstocking capital lockup and identify high-velocity SKUs that drive immediate cash flow.',
    plannedFeatures: [
      'Holding Cost vs Runway Analysis',
      'Low-Stock Reorder Triggers',
      'Deadstock Liquidation Alerts',
      'Multi-Warehouse Inventory Tracking',
    ],
    illustration: (
      <svg className="w-24 h-24 sm:w-28 sm:h-28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Isometric boxes */}
        <path d="M 60 25 L 90 42 L 60 59 L 30 42 Z" className="fill-indigo-500/30 stroke-indigo-400" strokeWidth="1.5" />
        <path d="M 30 42 L 60 59 L 60 92 L 30 75 Z" className="fill-indigo-600/40 stroke-indigo-400" strokeWidth="1.5" />
        <path d="M 90 42 L 60 59 L 60 92 L 90 75 Z" className="fill-indigo-500/20 stroke-indigo-400" strokeWidth="1.5" />
        <circle cx="60" cy="59" r="3" className="fill-white" />
      </svg>
    ),
  },
};

/**
 * Reusable ComingSoonPage Component
 */
export default function ComingSoonPage({ featureKey = 'reports', onNavigateHome }) {
  const { currentProfile, setActiveNavId } = useWorkspace();
  const [isNotified, setIsNotified] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Retrieve matching config or fallback cleanly
  const config = COMING_SOON_CONFIGS[featureKey] || {
    id: featureKey,
    title: featureKey.charAt(0).toUpperCase() + featureKey.slice(1).replace('-', ' '),
    category: 'WORKSPACE',
    tag: 'COMING SOON',
    badge: 'Under Active Development',
    accentColor: 'emerald',
    description: "We're building something powerful for your financial intelligence workspace.",
    supportingText: 'Advanced financial insights, analytical tools, and automated decision-making workflows are currently under active development.',
    plannedFeatures: [
      'Real-Time Telemetry Sync',
      'Automated Intelligence Reports',
      'Scenario Stress Testing',
      'Proactive Financial Alerts',
    ],
    illustration: (
      <svg className="w-24 h-24 sm:w-28 sm:h-28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="44" className="stroke-emerald-500/30" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="60" cy="60" r="28" className="fill-emerald-500/10 stroke-emerald-500/40" strokeWidth="1.5" />
        <path d="M 60 40 L 60 62 L 74 70" className="stroke-emerald-400" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="60" cy="60" r="3" className="fill-white" />
      </svg>
    ),
  };

  const handleNotifyMe = () => {
    setIsNotified(true);
    setToastMsg(`You'll be notified as soon as ${config.title} is available!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (setActiveNavId) {
      setActiveNavId('dashboard');
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center min-h-[calc(100vh-80px)]">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-400/30 text-xs font-semibold flex items-center space-x-2 animate-bounce">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Glass Card Container */}
      <div className="relative bg-white dark:bg-[#111C28] border border-slate-200/80 dark:border-[#162231] rounded-3xl p-8 sm:p-14 shadow-sm backdrop-blur-md overflow-hidden transition-all duration-300">
        
        {/* Subtle Ambient Decorative Gradient Halos */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content Layout */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
          
          {/* 1. Category & Release Badge */}
          <div className="flex items-center space-x-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              {config.tag}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              • {config.badge}
            </span>
          </div>

          {/* 2. Feature SVG Illustration */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D151F] border border-slate-100 dark:border-[#162231] shadow-inner transition-transform duration-300 hover:scale-105">
            {config.illustration}
          </div>

          {/* 3. Feature Title & Description */}
          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {config.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
              {config.description}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
              {config.supportingText}
            </p>
          </div>

          {/* 4. Planned Capabilities Preview Chips */}
          <div className="w-full pt-2">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Planned Capabilities
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {config.plannedFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#162231] border border-slate-200/80 dark:border-[#1E2D40] text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Action Buttons (Back to Dashboard + Notify Me) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleGoHome}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>

            <button
              type="button"
              onClick={handleNotifyMe}
              disabled={isNotified}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm border transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 ${
                isNotified
                  ? 'bg-emerald-50 dark:bg-blue-600/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-white dark:bg-[#162231] border-slate-200 dark:border-[#1E2D40] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A2838]'
              }`}
            >
              <span>{isNotified ? '✓' : '🔔'}</span>
              <span>{isNotified ? 'Notification Enabled' : 'Notify When Ready'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Reassurance Footer Pillars */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#111C28]/60 border border-slate-200/60 dark:border-[#162231]/60">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">🔒 Enterprise Grade Security</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">256-bit encryption on all financial pipelines</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#111C28]/60 border border-slate-200/60 dark:border-[#162231]/60">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">⚡ MSME Engineered</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Designed for high-precision cash flow control</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#111C28]/60 border border-slate-200/60 dark:border-[#162231]/60">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">🎯 Zero Work Disruptions</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Live workspace remains active & unaffected</p>
        </div>
      </div>

    </div>
  );
}
