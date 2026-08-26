import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BUSINESS_TYPES } from '../../data/adaptiveWorkspaceConfig';
import { getOperationsForBusinessType } from './OperationsScreen';
import VittanayaLogo from '../common/VittanayaLogo';

/**
 * WorkspacePreparationScreen Component (Step 5 of Onboarding)
 * 
 * High-fidelity animated transition screen between Onboarding and the Personalized Workspace.
 * 
 * Features:
 * - Top VITTANAYA Brand header and 4-step progress tracker
 * - Real-time sequential animation across 4 preparation stages:
 *    1. Understanding your business (0% -> 20%)
 *    2. Configuring your workspace (20% -> 45%)
 *    3. Preparing your insights (45% -> 72%)
 *    4. Finalizing your setup (72% -> 100%)
 * - Smoothly animated percentage counter (0% -> 100%) and progress bar with gradient shimmer
 * - Dynamic "Your selections" card reflecting actual Business Type and Selected Operations
 * - Smooth transition to "Workspace ready!" state with "Go to Dashboard →" CTA
 * - Full support for `prefers-reduced-motion`
 * - Bottom security guarantee
 */

export default function WorkspacePreparationScreen({
  formData = {},
  businessType = '',
  selectedOps = [],
  onComplete,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0: Step 1, 1: Step 2, 2: Step 3, 3: Step 4, 4: All Complete
  const [completedSteps, setCompletedSteps] = useState([]); // [0, 1, 2, 3]
  const [progressPercent, setProgressPercent] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const animationFrameRef = useRef(null);

  // Check user preference for reduced motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Resolve business type label
  const businessTypeObj = useMemo(() => {
    return BUSINESS_TYPES.find((b) => b.id === businessType) || {
      id: businessType || 'manufacturing',
      label: businessType ? businessType.charAt(0).toUpperCase() + businessType.slice(1) : 'Manufacturing',
    };
  }, [businessType]);

  // Resolve human-friendly operation labels for selected operations
  const resolvedOperations = useMemo(() => {
    const contextualOps = getOperationsForBusinessType(businessType);
    return selectedOps.map((opId) => {
      const found = contextualOps.find((c) => c.id === opId);
      return found ? found.title : opId;
    });
  }, [businessType, selectedOps]);

  // Sequential Animation Controller
  useEffect(() => {
    const totalDuration = prefersReducedMotion ? 1200 : 7000; // 7 seconds normal, 1.2s reduced motion
    const startTime = performance.now();

    // Stage milestone checkpoints
    // Stage 1: 0 -> 20%
    // Stage 2: 20 -> 45%
    // Stage 3: 45 -> 72%
    // Stage 4: 72 -> 100%
    const milestones = [
      { step: 0, startT: 0.00, endT: 0.22, startP: 0, endP: 20 },
      { step: 1, startT: 0.22, endT: 0.48, startP: 20, endP: 45 },
      { step: 2, startT: 0.48, endT: 0.74, startP: 45, endP: 72 },
      { step: 3, startT: 0.74, endT: 0.94, startP: 72, endP: 100 },
    ];

    const animate = (now) => {
      const elapsed = now - startTime;
      const progressRatio = Math.min(elapsed / totalDuration, 1);

      // Determine current stage & target progress
      let currentProgress = 0;
      let activeIndex = 0;
      const completed = [];

      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        if (progressRatio >= m.endT) {
          completed.push(m.step);
          activeIndex = i + 1;
          currentProgress = m.endP;
        } else if (progressRatio >= m.startT && progressRatio < m.endT) {
          activeIndex = i;
          const stageRatio = (progressRatio - m.startT) / (m.endT - m.startT);
          // Ease-out curve for smooth number interpolation
          const easedRatio = 1 - Math.pow(1 - stageRatio, 2);
          currentProgress = Math.round(m.startP + (m.endP - m.startP) * easedRatio);
          break;
        }
      }

      if (progressRatio >= 1) {
        currentProgress = 100;
        activeIndex = 4;
        completed.push(0, 1, 2, 3);
      }

      setProgressPercent(Math.min(currentProgress, 100));
      setCurrentStepIndex(activeIndex);
      setCompletedSteps(Array.from(new Set(completed)));

      if (progressRatio < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // After reaching 100%, show Workspace Ready view
        setTimeout(() => {
          setIsReady(true);
        }, prefersReducedMotion ? 100 : 500);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prefersReducedMotion]);

  const preparationStages = [
    {
      id: 'understanding',
      title: 'Understanding your business',
      description: 'Using your selected business type and information',
    },
    {
      id: 'configuring',
      title: 'Configuring your workspace',
      description: 'Setting up modules around your selected operations',
    },
    {
      id: 'insights',
      title: 'Preparing your insights',
      description: 'Preparing relevant financial & operational intelligence',
    },
    {
      id: 'finalizing',
      title: 'Finalizing your setup',
      description: 'Finishing personalized workspace setup',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-x-hidden flex flex-col justify-between py-6 px-4 sm:px-8 select-none">
      
      {/* Top Header: VITTANAYA Brand + 4-Step Progress Tracker */}
      <header className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <VittanayaLogo size="header" />
        </div>

        {/* 4-Step Progress Tracker */}
        <div className="flex items-center space-x-2 sm:space-x-4 self-center lg:self-auto overflow-x-auto py-1">
          {/* Step 1: Welcome (Completed) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Step 1</span>
              <span className="text-xs font-semibold text-emerald-600 block leading-tight">Welcome</span>
            </div>
          </div>

          {/* Line 1 */}
          <div className="w-8 sm:w-14 h-[2px] bg-emerald-500 rounded-full" />

          {/* Step 2: Info (Completed) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Step 2</span>
              <span className="text-xs font-semibold text-emerald-600 block leading-tight">Information</span>
            </div>
          </div>

          {/* Line 2 */}
          <div className="w-8 sm:w-14 h-[2px] bg-emerald-500 rounded-full" />

          {/* Step 3: Type (Completed) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Step 3</span>
              <span className="text-xs font-semibold text-emerald-600 block leading-tight">Business Type</span>
            </div>
          </div>

          {/* Line 3 */}
          <div className="w-8 sm:w-14 h-[2px] bg-emerald-500 rounded-full" />

          {/* Step 4: Operations (Completed) */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Step 4</span>
              <span className="text-xs font-semibold text-emerald-600 block leading-tight">Operations</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl w-full mx-auto my-auto py-6">
        
        {/* ========================================================================= */}
        {/* STATE A: WORKSPACE PREPARATION (ANIMATED 4-STAGE SEQUENTIAL FLOW) */}
        {/* ========================================================================= */}
        {!isReady ? (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] flex flex-col space-y-6 animate-fadeIn">
            
            {/* Top Heading & Logo */}
            <div className="text-center space-y-3 flex flex-col items-center">
              <div className="flex justify-center mb-1">
                <VittanayaLogo size="lg" className="h-16 sm:h-20" />
              </div>

              <h2 className="text-2xl sm:text-[28px] font-black text-[#0F172A] leading-tight tracking-tight">
                Your workspace is being prepared!
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] font-normal leading-relaxed max-w-md mx-auto">
                VITTANAYA is setting things up based on your business type and selected operations.
              </p>
            </div>

            {/* Smooth Animated Progress Bar & Percentage Number */}
            <div className="space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-slate-700">Preparation Progress</span>
                </span>
                <span className="text-blue-600 font-mono text-sm font-black transition-all">
                  {progressPercent}%
                </span>
              </div>

              <div className="relative w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7000FF] via-[#5A3FFF] to-[#00A3FF] rounded-full transition-all duration-150 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
                {/* Subtle moving light sheen */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
              </div>
            </div>

            {/* 4 Preparation Sequential Checklist Items */}
            <div className="space-y-3 pt-1">
              {preparationStages.map((stage, idx) => {
                const isCompleted = completedSteps.includes(idx);
                const isActive = currentStepIndex === idx && !isCompleted;
                const isPending = !isCompleted && !isActive;

                return (
                  <div
                    key={stage.id}
                    className={`flex items-start space-x-3.5 p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-50/50 border-emerald-200/70 text-slate-800'
                        : isActive
                        ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/15 text-[#0F172A] shadow-xs'
                        : 'bg-slate-50/50 border-slate-200/60 text-slate-400 opacity-60'
                    }`}
                  >
                    {/* Status Indicator Icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs transition-transform transform scale-100">
                          ✓
                        </div>
                      ) : isActive ? (
                        <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex items-center justify-center text-blue-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-400 text-[10px]">
                          ○
                        </div>
                      )}
                    </div>

                    {/* Step Text Info */}
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs sm:text-sm font-bold ${
                          isCompleted ? 'text-emerald-900' : isActive ? 'text-blue-950 font-black' : 'text-slate-500'
                        }`}>
                          {stage.title}
                        </h4>
                        {isActive && (
                          <span className="text-[10px] font-semibold text-blue-600 animate-pulse uppercase tracking-wider">
                            Setting up...
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-semibold text-emerald-600">
                            Ready
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] leading-tight ${
                        isCompleted ? 'text-emerald-700/80' : isActive ? 'text-slate-600 font-medium' : 'text-slate-400'
                      }`}>
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Selection Summary Card ("Your selections") */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2.5 transition-opacity duration-500">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Your Selections
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {formData.businessName ? formData.businessName : 'MSME Business Profile'}
                </span>
              </div>

              {/* Business Type */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Business Type:</span>
                <span className="font-bold text-[#0F172A] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  {businessTypeObj.label}
                </span>
              </div>

              {/* Selected Operations */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Selected Operations:</span>
                  <span className="text-[11px] font-bold text-blue-600">
                    {selectedOps.length} Active
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {resolvedOperations.map((opTitle, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white text-slate-700 text-[10px] font-semibold border border-slate-200 shadow-2xs"
                    >
                      ✓ {opTitle}
                    </span>
                  ))}
                  {resolvedOperations.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">
                      Standard operations selected
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* STATE B: WORKSPACE READY (CONFIRMATION & CTA TO DASHBOARD) */
          /* ========================================================================= */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] flex flex-col items-center text-center space-y-6 animate-scaleIn">
            
            {/* Radiant Success Badge */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-20 h-20 rounded-full bg-emerald-400/20 animate-ping" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-emerald-500/25">
                ✓
              </div>
            </div>

            {/* Main Ready Headings */}
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 uppercase tracking-wider">
                Setup Complete • 100%
              </span>
              <h2 className="text-3xl sm:text-[34px] font-black text-[#0F172A] leading-tight tracking-tight">
                Workspace ready!
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] font-normal leading-relaxed max-w-md mx-auto">
                Your personalized financial workspace is configured and ready to use.
              </p>
            </div>

            {/* Configured Summary Card */}
            <div className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-left text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A]">
                    {formData.businessName || 'My Business'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {formData.ownerName ? `Lead: ${formData.ownerName}` : 'Owner Workspace'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                  {businessTypeObj.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">Active Operations:</span>
                <span className="font-bold text-slate-900">
                  {selectedOps.length} Modules Connected
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">Intelligence Modules:</span>
                <span className="font-bold text-emerald-600">
                  Real-time Decision Twin Active
                </span>
              </div>
            </div>

            {/* Final Action CTA Button */}
            <div className="w-full pt-2">
              <button
                type="button"
                onClick={onComplete}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#7000FF] via-[#5A3FFF] to-[#00A3FF] hover:from-[#6200EA] hover:to-[#0091EA] text-white font-bold text-base tracking-wide shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <span className="text-lg">→</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Bottom Security Guarantee Footer */}
      <footer className="max-w-md mx-auto py-3 flex items-center justify-center space-x-3 text-center">
        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-[#0F172A] leading-tight">
            Your information is secure with us.
          </p>
          <p className="text-[11px] text-[#64748B] leading-tight">
            We never share your data with anyone.
          </p>
        </div>
      </footer>

    </div>
  );
}
