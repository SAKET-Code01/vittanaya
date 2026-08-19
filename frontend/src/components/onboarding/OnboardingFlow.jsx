import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import BusinessInfoScreen from './BusinessInfoScreen';
import BusinessTypeScreen from './BusinessTypeScreen';
import OperationsScreen from './OperationsScreen';
import WorkspacePreparationScreen from './WorkspacePreparationScreen';
import { buildAdaptiveWorkspace } from '../../data/adaptiveWorkspaceConfig';

/**
 * OnboardingFlow Component
 * 
 * STEP 1: Welcome / Let's Onboard Your Business (Approved Reference Design)
 * STEP 2: Business Information Screen (Approved Reference Design)
 * STEP 3: Business Type Screen (Approved Reference Design)
 * STEP 4: Operations Screen (Approved Reference Design)
 * STEP 5: Workspace Preparation & Transition Screen (Approved Reference Design)
 */
export default function OnboardingFlow({ isOpen, onClose, onComplete, onExploreDemo, currentProfile }) {
  const [step, setStep] = useState(1); // 1: Welcome | 2: Info | 3: Type | 4: Ops | 5: Prepare

  // Form State - Starts completely empty by default
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    location: '',
    gstin: '',
  });

  // Step 3 & 4 State - Starts unselected
  const [businessType, setBusinessType] = useState('');
  const [selectedOps, setSelectedOps] = useState([]);

  // Business type selection (does not force operations)
  const handleSelectBusinessType = (typeId) => {
    setBusinessType(typeId);
  };

  // Toggle multi-select operations
  const handleToggleOp = (opId) => {
    setSelectedOps((prev) =>
      prev.includes(opId) ? prev.filter((id) => id !== opId) : [...prev, opId]
    );
  };

  // Final workspace configuration & activation handler
  const handleCompleteWorkspace = () => {
    const workspace = buildAdaptiveWorkspace({
      businessName: formData.businessName || 'My MSME Business',
      ownerName: formData.ownerName || 'Business Owner',
      phone: formData.phone || '',
      email: formData.email || '',
      businessType: businessType || 'manufacturing',
      selectedOps: selectedOps.length > 0 ? selectedOps : ['sales', 'purchases'],
      location: formData.location || 'India',
      gstin: formData.gstin || '',
    });
    onComplete(workspace);
    onClose();
    setStep(1); // reset to welcome for future modal triggers
  };

  if (!isOpen) return null;

  // =========================================================================
  // STEP 1: WELCOME SCREEN (100% Faithful to Reference)
  // =========================================================================
  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F9FBFE] animate-fadeIn">
        <WelcomeScreen
          onGetStarted={() => setStep(2)}
          onExploreDemo={onExploreDemo}
        />
      </div>
    );
  }

  // =========================================================================
  // STEP 2: BUSINESS INFORMATION SCREEN (100% Faithful to Reference)
  // =========================================================================
  if (step === 2) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
        <BusinessInfoScreen
          formData={formData}
          setFormData={setFormData}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      </div>
    );
  }

  // =========================================================================
  // STEP 3: BUSINESS TYPE SCREEN (100% Faithful to Reference)
  // =========================================================================
  if (step === 3) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
        <BusinessTypeScreen
          businessType={businessType}
          onSelectBusinessType={handleSelectBusinessType}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      </div>
    );
  }

  // =========================================================================
  // STEP 4: OPERATIONS SCREEN (100% Faithful to Reference)
  // =========================================================================
  if (step === 4) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
        <OperationsScreen
          businessType={businessType}
          selectedOps={selectedOps}
          onToggleOp={handleToggleOp}
          onBack={() => setStep(3)}
          onComplete={() => setStep(5)}
        />
      </div>
    );
  }

  // =========================================================================
  // STEP 5: WORKSPACE PREPARATION SCREEN (100% Faithful to Reference)
  // =========================================================================
  if (step === 5) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] animate-fadeIn">
        <WorkspacePreparationScreen
          formData={formData}
          businessType={businessType}
          selectedOps={selectedOps}
          onComplete={handleCompleteWorkspace}
        />
      </div>
    );
  }

  return null;
}
