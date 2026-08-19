import React, { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import BusinessProfilePage from './pages/BusinessProfilePage';
import CashOverviewPage from './pages/CashOverviewPage';
import SettingsPage from './pages/SettingsPage';
import HelpSupportPage from './pages/HelpSupportPage';
import ComingSoonPage from './pages/ComingSoonPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import StartupOpeningAnimation from './components/common/StartupOpeningAnimation';
import IndustrySwitcherModal from './components/common/IndustrySwitcherModal';
import ExplanationModal from './components/common/ExplanationModal';
import { MOCK_EXPLANATIONS } from './mocks/dashboardMockData';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';

/**
 * AppContent Component — Single Source of Truth Workspace Integration
 */
function AppContent() {
  const {
    currentProfile,
    setCurrentProfile,
    activeNavId,
    setActiveNavId,
    isDemoMode,
    enterDemoMode,
    exitDemoMode,
  } = useWorkspace();
  const [hasPlayedStartup, setHasPlayedStartup] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [isIndustrySwitcherOpen, setIsIndustrySwitcherOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [hiddenCards, setHiddenCards] = useState([]);
  const [activeExplanationKey, setActiveExplanationKey] = useState(null);

  const activeExplanation = activeExplanationKey ? MOCK_EXPLANATIONS[activeExplanationKey] : null;

  // Handle entering isolated Demo Dashboard
  const handleExploreDemo = () => {
    enterDemoMode();
    setIsOnboardingOpen(false);
  };

  // Handle exiting Demo Dashboard back to Onboarding
  const handleExitDemo = () => {
    exitDemoMode();
    setIsOnboardingOpen(true);
  };

  return (
    <>
      {/* 1. Signature Startup Opening Animation */}
      {!hasPlayedStartup && (
        <StartupOpeningAnimation onComplete={() => setHasPlayedStartup(true)} />
      )}

      {isOnboardingOpen && !isDemoMode ? (
        <OnboardingFlow
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          currentProfile={currentProfile}
          onExploreDemo={handleExploreDemo}
          onComplete={(newProfile) => {
            setCurrentProfile(newProfile);
            setIsOnboardingOpen(false);
          }}
        />
      ) : (
        <AppLayout
          currentProfile={currentProfile}
          onOpenRegister={() => setActiveNavId('profile')}
          onOpenIndustrySwitcher={() => setIsIndustrySwitcherOpen(true)}
          onOpenCustomize={() => setIsCustomizeOpen(true)}
          activeNavId={activeNavId}
          onSelectNav={(navId) => setActiveNavId(navId)}
          hiddenCardsCount={hiddenCards.length}
          isDemoMode={isDemoMode}
          onExitDemo={handleExitDemo}
        >
          {activeNavId === 'profile' ? (
            <BusinessProfilePage onNavigateHome={() => setActiveNavId('dashboard')} />
          ) : activeNavId === 'cash-overview' ? (
            <CashOverviewPage onNavigateHome={() => setActiveNavId('dashboard')} />
          ) : activeNavId === 'settings' ? (
            <SettingsPage onNavigateHome={() => setActiveNavId('dashboard')} />
          ) : activeNavId === 'help' ? (
            <HelpSupportPage onNavigateHome={() => setActiveNavId('dashboard')} />
          ) : activeNavId === 'dashboard' ? (
            <DashboardPage
              currentProfile={currentProfile}
              onOpenWhy={(key) => setActiveExplanationKey(key)}
              onOpenRegister={() => setActiveNavId('profile')}
              onOpenIndustrySwitcher={() => setIsIndustrySwitcherOpen(true)}
              isCustomizeOpen={isCustomizeOpen}
              setIsCustomizeOpen={setIsCustomizeOpen}
              hiddenCards={hiddenCards}
              setHiddenCards={setHiddenCards}
            />
          ) : (
            <ComingSoonPage
              featureKey={activeNavId}
              onNavigateHome={() => setActiveNavId('dashboard')}
            />
          )}

          {/* 3. Industry Context Exploration Modal */}
          <IndustrySwitcherModal
            isOpen={isIndustrySwitcherOpen}
            onClose={() => setIsIndustrySwitcherOpen(false)}
            activeId={currentProfile.id}
            onSelectPreset={(preset) => setCurrentProfile(preset)}
          />

          {/* 4. Causal Explanation "Why?" Modal */}
          <ExplanationModal
            isOpen={Boolean(activeExplanationKey)}
            onClose={() => setActiveExplanationKey(null)}
            explanation={activeExplanation}
          />
        </AppLayout>
      )}
    </>
  );
}

/**
 * Root Application Entry Wrapped with WorkspaceProvider
 */
export default function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
}
