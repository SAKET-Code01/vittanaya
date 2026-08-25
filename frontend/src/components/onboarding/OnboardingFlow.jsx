import React, { useState } from 'react';
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
 * OnboardingFlow Component (SIH26091 Phase A)
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
 */
export default function OnboardingFlow({ isOpen, onClose, onComplete, onExploreDemo, currentProfile, initialStep = 1, onIntroComplete }) {
  const [step, setStep] = useState(initialStep); // 1: Welcome | 2: Stage / Profile Flow
  const [selectedStage, setSelectedStage] = useState(''); // '' | 'new_idea' | 'startup' | 'established'
  const [establishedSubStep, setEstablishedSubStep] = useState(2); // 2: Info | 3: Type | 4: Ops | 5: Prepare

  // Form State for Established Business Path
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    phone: '',
    email: '',
    village: '',
    district: '',
    state: '',
    pin: '',
  });

  // Established Business Type & Operations
  const [businessType, setBusinessType] = useState('');
  const [selectedOps, setSelectedOps] = useState([]);

  const handleSelectBusinessType = (typeId) => {
    setBusinessType(typeId);
  };

  const handleToggleOp = (opId) => {
    setSelectedOps((prev) =>
      prev.includes(opId) ? prev.filter((id) => id !== opId) : [...prev, opId]
    );
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
    onComplete(workspace);
    setSelectedStage('');
    setStep(1);
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
    onComplete(workspace);
    setSelectedStage('');
    setStep(1);
  };

  // Completion handler for Established Business path
  const handleCompleteEstablishedWorkspace = () => {
    const workspace = buildAdaptiveWorkspace({
      stage: 'established',
      businessName: formData.businessName || 'My MSME Business',
      phone: formData.phone || '',
      email: formData.email || '',
      description: formData.businessDescription || '',
      village: formData.village || '',
      district: formData.district || '',
      state: formData.state || '',
      pin: formData.pin || '',
      businessType: businessType || 'manufacturing',
      selectedOps: selectedOps.length > 0 ? selectedOps : ['sales', 'purchases'],
      location: [formData.village, formData.district, formData.state].filter(Boolean).join(', ') || 'India',
      locationData: {
        village: formData.village || '',
        block: '',
        district: formData.district || '',
        state: formData.state || '',
        pin: formData.pin || '',
        state_code: null,
        district_code: null,
        block_code: null,
        village_code: null,
        gram_panchayat_code: null,
        latitude: null,
        longitude: null,
      },
      ownCapital: 220000,
      available_margin_capital: 220000,
      existingInvestment: 500000,
    });
    onComplete(workspace);
    setSelectedStage('');
    setEstablishedSubStep(2);
    setStep(1);
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
    // 2.0 Stage Selection
    if (!selectedStage) {
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
          <StageSelectionScreen
            onSelectStage={(stg) => {
              setSelectedStage(stg);
              if (stg === 'established') {
                setEstablishedSubStep(2);
              }
            }}
            onBack={onClose || (() => setStep(1))}
            onExploreDemo={onExploreDemo}
          />
        </div>
      );
    }

    // 2.A New Business Idea Intake
    if (selectedStage === 'new_idea') {
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
          <NewIdeaIntakeScreen
            onComplete={handleCompleteNewIdea}
            onBack={() => setSelectedStage('')}
          />
        </div>
      );
    }

    // 2.B Startup Phase Intake
    if (selectedStage === 'startup') {
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
          <StartupIntakeScreen
            onComplete={handleCompleteStartup}
            onBack={() => setSelectedStage('')}
          />
        </div>
      );
    }

    // 2.C Established Business Flow (Preserves existing 4-step sequence)
    if (selectedStage === 'established') {
      if (establishedSubStep === 2) {
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
            <BusinessInfoScreen
              formData={formData}
              setFormData={setFormData}
              onBack={() => setSelectedStage('')}
              onNext={() => setEstablishedSubStep(3)}
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
              onComplete={handleCompleteEstablishedWorkspace}
            />
          </div>
        );
      }
    }
  }

  return null;
}
