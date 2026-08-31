import React, { useState, useEffect } from 'react';
import WelcomeScreen from './WelcomeScreen';
import StageSelectionScreen from './StageSelectionScreen';
import NewIdeaIntakeScreen from './NewIdeaIntakeScreen';
import StartupIntakeScreen from './StartupIntakeScreen';
import BusinessInfoScreen from './BusinessInfoScreen';
import BusinessTypeScreen from './BusinessTypeScreen';
import OperationsScreen from './OperationsScreen';
import WorkspacePreparationScreen from './WorkspacePreparationScreen';
import { buildAdaptiveWorkspace } from '../../data/adaptiveWorkspaceConfig';

/**
 * OnboardingFlow Component with Browser-Style Back / Forward / Home Navigation Stack
 * 
 * STEP 1: Welcome Screen (Let's Onboard Your Business)
 * STAGE SELECT: Stage Selection Screen (New Idea | Startup | Established)
 * 
 * PATH A (New Idea):
 * - NewIdeaIntakeScreen (1-Screen fast intake: Category, Location, Own Capital)
 * 
 * PATH B (Startup Phase):
 * - StartupIntakeScreen (Startup name, Category, Location, Capital & Stage)
 * 
 * PATH C (Established Business):
 * - Step 2: Business Information Screen
 * - Step 3: Business Type Screen
 * - Step 4: Operations Screen
 * - Step 5: Workspace Preparation & Transition Screen
 * 
 * All drafts and inputs are retained across back/forward navigation without data loss.
 */
export default function OnboardingFlow({
  isOpen,
  onClose,
  onComplete,
  onExploreDemo,
  currentProfile,
  initialStep = 1,
  onIntroComplete,
  selectedStage: controlledSelectedStage,
  onSelectStage,
  establishedSubStep: controlledEstablishedSubStep,
  onEstablishedSubStepChange,
  onBackToStageSelect: externalBackToStageSelect,
  onHome,
}) {
  const [step, setStep] = useState(initialStep); // 1: Welcome | 2: Stage / Profile Flow
  const [internalSelectedStage, setInternalSelectedStage] = useState('');
  const [internalEstablishedSubStep, setInternalEstablishedSubStep] = useState(2);

  const selectedStage = controlledSelectedStage !== undefined ? controlledSelectedStage : internalSelectedStage;
  const establishedSubStep = controlledEstablishedSubStep !== undefined ? controlledEstablishedSubStep : internalEstablishedSubStep;

  const setSelectedStage = (stg) => {
    setInternalSelectedStage(stg);
    if (onSelectStage) onSelectStage(stg);
  };

  const setEstablishedSubStep = (sub) => {
    setInternalEstablishedSubStep(sub);
    if (onEstablishedSubStepChange) onEstablishedSubStepChange(sub);
  };

  // Pending workspace object during Workspace Preparation loading transition
  const [pendingPreparedWorkspace, setPendingPreparedWorkspace] = useState(null);

  // Persistent Draft State for New Business Idea Path
  // Starts 100% empty for fresh new entrepreneurs
  const [newIdeaDraft, setNewIdeaDraft] = useState(() => ({
    category: '',
    specificActivity: '',
    village: '',
    block: '',
    district: '',
    state: '',
    pin: '',
    ownCapital: '',
    socialCategory: '',
    areaType: '',
  }));

  // Persistent Draft State for Startup Phase Path
  // Starts 100% empty for fresh new entrepreneurs
  const [startupDraft, setStartupDraft] = useState(() => ({
    businessName: '',
    category: '',
    specificActivity: '',
    stage: '',
    village: '',
    block: '',
    district: '',
    state: '',
    pin: '',
    ownCapital: '',
    alreadyInvested: '',
    hasPremises: '',
    hasEquipment: '',
    existingMonthlySales: '',
    customerCount: '',
    socialCategory: '',
    areaType: '',
  }));

  // Persistent Draft State for Established Business Path
  const [formData, setFormData] = useState(() => ({
    businessName: currentProfile?.name || '',
    businessDescription: currentProfile?.description || '',
    phone: currentProfile?.phone || '',
    email: currentProfile?.email || '',
    village: currentProfile?.village || currentProfile?.locationData?.village || '',
    district: currentProfile?.district || currentProfile?.locationData?.district || '',
    state: currentProfile?.state || currentProfile?.locationData?.state || '',
    pin: currentProfile?.pin || currentProfile?.locationData?.pin || '',
  }));

  // Established Business Type & Operations
  const [businessType, setBusinessType] = useState(() => currentProfile?.businessType || '');
  const [selectedOps, setSelectedOps] = useState(() => currentProfile?.selectedOperations || []);

  // Sync initialStep changes
  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const handleSelectBusinessType = (typeId) => {
    setBusinessType(typeId);
  };

  const handleToggleOp = (opId) => {
    setSelectedOps((prev) =>
      prev.includes(opId) ? prev.filter((id) => id !== opId) : [...prev, opId]
    );
  };

  // Nav actions
  const handleStageSelect = (stg) => {
    setPendingPreparedWorkspace(null);
    setSelectedStage(stg);
    if (stg === 'established') {
      setEstablishedSubStep(2);
    }
  };

  const handleBackToStageSelect = () => {
    setPendingPreparedWorkspace(null);
    if (externalBackToStageSelect) {
      externalBackToStageSelect();
    } else {
      setSelectedStage('');
    }
  };

  const handleOnboardingHome = () => {
    setPendingPreparedWorkspace(null);
    if (onHome) {
      onHome();
    } else if (selectedStage) {
      handleBackToStageSelect();
    } else if (step === 2) {
      if (onClose) onClose();
      else setStep(1);
    }
  };


  // Completion handler for New Idea intake
  const handleCompleteNewIdea = (newIdeaData) => {
    const workspace = buildAdaptiveWorkspace({
      stage: 'new_idea',
      businessName: newIdeaData.businessName || 'New Venture Idea',
      category: newIdeaData.category,
      industry: newIdeaData.industry,
      businessType: newIdeaData.businessType || 'manufacturing',
      village: newIdeaData.village,
      block: newIdeaData.block,
      district: newIdeaData.district,
      state: newIdeaData.state,
      pin: newIdeaData.pin,
      location: newIdeaData.location,
      locationData: newIdeaData.locationData,
      ownCapital: newIdeaData.ownCapital,
      available_margin_capital: newIdeaData.available_margin_capital,
      existingInvestment: 0,
      socialCategory: newIdeaData.socialCategory,
      areaType: newIdeaData.areaType,
      selectedOps: newIdeaData.selectedOps || ['sales', 'purchases'],
      description: newIdeaData.description,
      ownerName: 'Entrepreneur',
    });
    setPendingPreparedWorkspace(null);
    setSelectedStage('');
    setStep(1);
    if (onComplete) {
      onComplete(workspace);
    }
  };

  // Completion handler for Startup intake
  const handleCompleteStartup = (startupData) => {
    const workspace = buildAdaptiveWorkspace({
      stage: 'startup',
      businessName: startupData.businessName || 'Startup Venture',
      category: startupData.category,
      industry: startupData.industry,
      businessType: startupData.businessType || 'manufacturing',
      village: startupData.village,
      block: startupData.block,
      district: startupData.district,
      state: startupData.state,
      pin: startupData.pin,
      location: startupData.location,
      locationData: startupData.locationData,
      ownCapital: startupData.ownCapital,
      available_margin_capital: startupData.available_margin_capital,
      existingInvestment: startupData.existingInvestment,
      socialCategory: startupData.socialCategory,
      areaType: startupData.areaType,
      startupDetails: startupData.startupDetails,
      selectedOps: startupData.selectedOps || ['sales', 'purchases', 'inventory', 'assets'],
      description: startupData.description,
      ownerName: 'Startup Founder',
    });
    setPendingPreparedWorkspace(workspace);
  };

  // Completion handler for Established Business path
  const handleCompleteEstablishedWorkspace = () => {
    const locationString = [formData.village, formData.block, formData.district, formData.state].filter(Boolean).join(', ') || 'India';
    const workspace = buildAdaptiveWorkspace({
      stage: 'established',
      businessName: formData.businessName || 'My MSME Business',
      phone: formData.phone || '',
      email: formData.email || '',
      description: formData.businessDescription || '',
      village: formData.village || '',
      block: formData.block || formData.city || '',
      district: formData.district || '',
      state: formData.state || '',
      pin: formData.pin || '',
      businessType: businessType || 'manufacturing',
      selectedOps: selectedOps.length > 0 ? selectedOps : ['sales', 'purchases'],
      location: locationString,
      locationData: {
        village: formData.village || '',
        block: formData.block || formData.city || '',
        district: formData.district || '',
        state: formData.state || '',
        pin: formData.pin || '',
        state_code: formData.stateId || null,
        district_code: formData.districtId || null,
        block_code: formData.blockId || null,
        village_code: formData.villageId || null,
        gram_panchayat_code: null,
        latitude: null,
        longitude: null,
      },
      ownCapital: 220000,
      available_margin_capital: 220000,
      existingInvestment: 500000,
    });
    if (onComplete) {
      onComplete(workspace);
    }
  };

  if (!isOpen) return null;

  // =========================================================================
  // STEP 1: WELCOME SCREEN
  // =========================================================================
  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F9FBFE] animate-fadeIn">
        <WelcomeScreen
          onGetStarted={onIntroComplete || (() => setStep(2))}
          onExploreDemo={onExploreDemo}
        />
      </div>
    );
  }

  // =========================================================================
  // STEP 2: STAGE SELECTION & BRANCHED INTAKE
  // =========================================================================
  if (step === 2) {
    // 2.0 Stage Selection Screen
    if (!selectedStage) {
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
          <StageSelectionScreen
            onSelectStage={handleStageSelect}
            onBack={onClose || (() => setStep(1))}
            onHome={handleOnboardingHome}
            onExploreDemo={onExploreDemo}
          />
        </div>
      );
    }

    // 2.A New Business Idea Intake Screen (Controlled draft data + Back/Forward/Home)
    if (selectedStage === 'new_idea') {
      if (pendingPreparedWorkspace) {
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
            <WorkspacePreparationScreen
              formData={{
                businessName: pendingPreparedWorkspace.businessName || pendingPreparedWorkspace.name,
                ownerName: pendingPreparedWorkspace.ownerName || 'Entrepreneur',
              }}
              businessType={pendingPreparedWorkspace.businessType || 'manufacturing'}
              selectedOps={pendingPreparedWorkspace.selectedOperations || ['sales', 'purchases']}
              onHome={handleOnboardingHome}
              onComplete={() => {
                const ws = pendingPreparedWorkspace;
                setPendingPreparedWorkspace(null);
                setSelectedStage('');
                setStep(1);
                onComplete(ws);
              }}
            />
          </div>
        );
      }

      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
          <NewIdeaIntakeScreen
            draft={newIdeaDraft}
            setDraft={setNewIdeaDraft}
            onComplete={handleCompleteNewIdea}
            onBack={handleBackToStageSelect}
            onHome={handleOnboardingHome}
          />
        </div>
      );
    }

    // 2.B Startup Phase Intake Screen (Controlled draft data + Back/Forward/Home)
    if (selectedStage === 'startup') {
      if (pendingPreparedWorkspace) {
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
            <WorkspacePreparationScreen
              formData={{
                businessName: pendingPreparedWorkspace.businessName || pendingPreparedWorkspace.name,
                ownerName: pendingPreparedWorkspace.ownerName || 'Startup Founder',
              }}
              businessType={pendingPreparedWorkspace.businessType || 'manufacturing'}
              selectedOps={pendingPreparedWorkspace.selectedOperations || ['sales', 'purchases', 'inventory', 'assets']}
              onHome={handleOnboardingHome}
              onComplete={() => {
                const ws = pendingPreparedWorkspace;
                setPendingPreparedWorkspace(null);
                if (onComplete) {
                  onComplete(ws);
                }
              }}
            />
          </div>
        );
      }

      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
          <StartupIntakeScreen
            draft={startupDraft}
            setDraft={setStartupDraft}
            onComplete={handleCompleteStartup}
            onBack={handleBackToStageSelect}
            onHome={handleOnboardingHome}
          />
        </div>
      );
    }

    // 2.C Established Business Flow (100% Preserves existing 4-step sequence & draft data)
    if (selectedStage === 'established') {
      if (establishedSubStep === 2) {
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
            <BusinessInfoScreen
              formData={formData}
              setFormData={setFormData}
              onBack={handleBackToStageSelect}
              onNext={() => setEstablishedSubStep(3)}
              onHome={handleOnboardingHome}
            />
          </div>
        );
      }

      if (establishedSubStep === 3) {
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
            <BusinessTypeScreen
              businessType={businessType}
              onSelectBusinessType={handleSelectBusinessType}
              onBack={() => setEstablishedSubStep(2)}
              onNext={() => setEstablishedSubStep(4)}
              onHome={handleOnboardingHome}
            />
          </div>
        );
      }

      if (establishedSubStep === 4) {
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
            <OperationsScreen
              businessType={businessType}
              selectedOps={selectedOps}
              onToggleOp={handleToggleOp}
              onBack={() => setEstablishedSubStep(3)}
              onComplete={() => setEstablishedSubStep(5)}
              onHome={handleOnboardingHome}
            />
          </div>
        );
      }

      if (establishedSubStep === 5) {
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
            <WorkspacePreparationScreen
              formData={formData}
              businessType={businessType}
              selectedOps={selectedOps}
              onHome={handleOnboardingHome}
              onComplete={handleCompleteEstablishedWorkspace}
            />
          </div>
        );
      }
    }
  }

  return null;
}

