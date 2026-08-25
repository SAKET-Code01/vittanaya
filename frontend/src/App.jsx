import React, { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import BusinessProfilePage from './pages/BusinessProfilePage';
import FeasibilityPage from './pages/FeasibilityPage';
import FinancialPlanPage from './pages/FinancialPlanPage';
import SchemePage from './pages/SchemePage';
import ActionPlanPage from './pages/ActionPlanPage';
import SettingsPage from './pages/SettingsPage';
import HelpSupportPage from './pages/HelpSupportPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import SplashScreen from './components/SplashScreen';
import LoginPage from './pages/Login';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { LocaleProvider } from './locale/LocaleContext';

function AppContent() {
  const {
    currentProfile,
    setCurrentProfile,
    activeNavId,
    setActiveNavId,
    isDemoMode,
    enterDemoMode,
    exitDemoMode,
    updateFinancialValues,
    clearNavigationHistory,
  } = useWorkspace();

  const [showSplash, setShowSplash] = useState(true);

  const [appScreen, setAppScreen] = useState('welcome');

  const changeAppScreen = (screen) => {
    try {
      localStorage.setItem('vittanaya_app_screen', screen);
    } catch (e) {}
    setAppScreen(screen);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleGetStarted = () => changeAppScreen('login');

  const handleGuestContinue = () => changeAppScreen('steps');

  const handleLoginSuccess = () => {
    try {
      const savedProfile = localStorage.getItem('vittanaya_profile_v2');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed && (parsed.onboardingCompletedAt || parsed.stage || parsed.name)) {
          changeAppScreen('workspace');
          return;
        }
      }
    } catch (e) {}
    if (currentProfile && (currentProfile.onboardingCompletedAt || currentProfile.stage || currentProfile.name)) {
      changeAppScreen('workspace');
      return;
    }
    changeAppScreen('steps');
  };

  const handleOnboardingComplete = (newProfile) => {
    setCurrentProfile(newProfile);
    if (newProfile?.ownCapital) {
      updateFinancialValues({
        min_cash_buffer: Math.max(50000, Math.round(newProfile.ownCapital * 0.2)),
        cash_balance: newProfile.ownCapital,
      });
    }
    if (clearNavigationHistory) clearNavigationHistory();
    setActiveNavId('dashboard');
    changeAppScreen('workspace');
  };

  const handleExploreDemo = () => {
    enterDemoMode();
    if (clearNavigationHistory) clearNavigationHistory();
    setActiveNavId('dashboard');
    changeAppScreen('workspace');
  };

  const handleExitDemo = () => {
    exitDemoMode();
    if (clearNavigationHistory) clearNavigationHistory();
    setActiveNavId('dashboard');
    changeAppScreen('login');
  };

  const handleLogout = () => {
    if (isDemoMode) exitDemoMode();
    if (clearNavigationHistory) clearNavigationHistory();
    setActiveNavId('dashboard');
    changeAppScreen('login');
  };

  const workspacePage =
    activeNavId === 'business' || activeNavId === 'profile' ? (
      <BusinessProfilePage currentProfile={currentProfile} onNavigateHome={() => setActiveNavId('dashboard')} />
    ) : activeNavId === 'feasibility' ? (
      <FeasibilityPage currentProfile={currentProfile} onNavigateHome={() => setActiveNavId('dashboard')} />
    ) : activeNavId === 'financial-plan' ? (
      <FinancialPlanPage currentProfile={currentProfile} onNavigateHome={() => setActiveNavId('dashboard')} />
    ) : activeNavId === 'scheme' ? (
      <SchemePage currentProfile={currentProfile} onNavigateHome={() => setActiveNavId('dashboard')} />
    ) : activeNavId === 'action-plan' ? (
      <ActionPlanPage currentProfile={currentProfile} onNavigateHome={() => setActiveNavId('dashboard')} />
    ) : activeNavId === 'settings' ? (
      <SettingsPage currentProfile={currentProfile} onNavigateHome={() => setActiveNavId('dashboard')} />
    ) : activeNavId === 'help' ? (
      <HelpSupportPage currentProfile={currentProfile} onNavigateHome={() => setActiveNavId('dashboard')} />
    ) : (
      <DashboardPage currentProfile={currentProfile} onNavigate={setActiveNavId} />
    );

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      {!showSplash && appScreen === 'welcome' && (
        <OnboardingFlow
          isOpen
          onClose={() => changeAppScreen('login')}
          currentProfile={currentProfile}
          onExploreDemo={handleExploreDemo}
          onIntroComplete={handleGetStarted}
          onComplete={handleOnboardingComplete}
        />
      )}
      {!showSplash && appScreen === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onGuestContinue={handleGuestContinue}
          onRegister={handleGuestContinue}
        />
      )}
      {!showSplash && appScreen === 'steps' && (
        <OnboardingFlow
          isOpen
          initialStep={2}
          onClose={() => changeAppScreen('login')}
          currentProfile={currentProfile}
          onExploreDemo={handleExploreDemo}
          onComplete={handleOnboardingComplete}
        />
      )}
      {!showSplash && appScreen === 'workspace' && (
        <AppLayout
          currentProfile={currentProfile}
          activeNavId={activeNavId}
          onSelectNav={setActiveNavId}
          isDemoMode={isDemoMode}
          onExitDemo={handleExitDemo}
          onLogout={handleLogout}
        >
          {workspacePage}
        </AppLayout>
      )}
    </>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <WorkspaceProvider>
        <AppContent />
      </WorkspaceProvider>
    </LocaleProvider>
  );
}
