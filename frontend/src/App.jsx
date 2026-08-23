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
import LoginPage from './pages/Login';
import { MOCK_EXPLANATIONS } from './mocks/dashboardMockData';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { LocaleProvider } from './locale/LocaleContext';

/**
 * AppContent Component — Single Source of Truth Workspace Integration
 *
 * appScreen state machine:
 *   'login'      — Default screen after startup animation.
 *   'onboarding' — OnboardingFlow (new user OR unauthenticated guest path).
 *   'workspace'  — Authenticated workspace (AppLayout + dashboard).
 *
 * Auth actions are isolated in LoginPage handlers.
 * Guest path goes to 'onboarding' (unauthenticated) — NOT to workspace.
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

  // ── App-level screen state ────────────────────────────────────────────────
  const [hasPlayedStartup, setHasPlayedStartup] = useState(false);
  // 'login' | 'onboarding' | 'workspace'
  const [appScreen, setAppScreen] = useState('login');

  // ── Secondary UI state (unchanged) ───────────────────────────────────────
  const [isIndustrySwitcherOpen, setIsIndustrySwitcherOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [hiddenCards, setHiddenCards] = useState([]);
  const [activeExplanationKey, setActiveExplanationKey] = useState(null);

  const activeExplanation = activeExplanationKey ? MOCK_EXPLANATIONS[activeExplanationKey] : null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Called by LoginPage after credential authentication succeeds. */
  const handleLoginSuccess = () => {
    handleGuestContinue();
  };

  /**
   * Called by LoginPage "Continue as Guest".
   * Guest enters the OnboardingFlow (Assessment path) without authentication.
   * Guest is NOT considered logged in.
   */
  const handleGuestContinue = () => {
    setAppScreen('onboarding');
  };

  /**
   * Called by LoginPage "Register here".
   * TODO: Navigate to a dedicated registration screen once built.
   * For now, enters onboarding as an unauthenticated new-user path.
   */
  const handleRegister = () => {
    // TODO: Replace with appScreen = 'register' when RegisterPage is created.
    setAppScreen('onboarding');
  };

  /** OnboardingFlow completion — activates workspace with the new profile */
  const handleOnboardingComplete = (newProfile) => {
    setCurrentProfile(newProfile);
    setAppScreen('workspace');
  };

  /** Demo mode entry (from WelcomeScreen "Explore Demo") */
  const handleExploreDemo = () => {
    enterDemoMode();
    setAppScreen('workspace');
  };

  /** Exit demo — return to Login */
  const handleExitDemo = () => {
    exitDemoMode();
    setAppScreen('login');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* 1. Signature Startup Opening Animation — plays once on first load */}
      {!hasPlayedStartup && (
        <StartupOpeningAnimation onComplete={() => setHasPlayedStartup(true)} />
      )}

      {/* 2. Login Screen — shown after startup animation, before onboarding/workspace */}
      {hasPlayedStartup && appScreen === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onGuestContinue={handleGuestContinue}
          onRegister={handleRegister}
        />
      )}

      {/* 3. Onboarding Flow — new users and unauthenticated guests */}
      {hasPlayedStartup && appScreen === 'onboarding' && (
        <OnboardingFlow
          isOpen={true}
          onClose={() => setAppScreen('login')}
          currentProfile={currentProfile}
          onExploreDemo={handleExploreDemo}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* 4. Authenticated Workspace — AppLayout + pages */}
      {hasPlayedStartup && appScreen === 'workspace' && (
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
    <LocaleProvider>
      <WorkspaceProvider>
        <AppContent />
      </WorkspaceProvider>
    </LocaleProvider>
  );
}
