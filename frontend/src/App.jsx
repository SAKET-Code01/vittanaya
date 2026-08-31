import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // Fresh load / refresh ALWAYS begins with Splash -> Welcome -> Login
  const [showSplash, setShowSplash] = useState(true);
  const [appScreen, setAppScreen] = useState('welcome'); // 'welcome' | 'login' | 'steps' | 'workspace'
  const [selectedStage, setSelectedStage] = useState(''); // '' | 'new_idea' | 'startup' | 'established'
  const [establishedSubStep, setEstablishedSubStep] = useState(2); // 2: Info | 3: Type | 4: Ops | 5: Prepare

  // Centralized History & Screen Navigation Helper
  const navigate = useCallback((screen, extra = {}, replace = false) => {
    let hash = '#welcome';
    if (screen === 'welcome') hash = '#welcome';
    else if (screen === 'login') hash = '#login';
    else if (screen === 'steps') {
      const stg = extra.stage !== undefined ? extra.stage : selectedStage;
      if (!stg) hash = '#stage-selection';
      else if (stg === 'new_idea') hash = '#new-idea';
      else if (stg === 'startup') hash = '#startup';
      else if (stg === 'established') {
        const sub = extra.subStep !== undefined ? extra.subStep : establishedSubStep;
        hash = sub === 2 ? '#established-info' : sub === 3 ? '#established-type' : sub === 4 ? '#established-ops' : '#established';
      }
    } else if (screen === 'workspace') {
      const nav = extra.navId || activeNavId || 'dashboard';
      hash = `#${nav}`;
    }

    const stateObj = { screen, ...extra };
    if (replace) {
      window.history.replaceState(stateObj, '', hash);
    } else {
      const currentState = window.history.state;
      if (!currentState || currentState.screen !== screen || JSON.stringify(currentState) !== JSON.stringify(stateObj)) {
        window.history.pushState(stateObj, '', hash);
      }
    }

    setAppScreen(screen);
    if (extra.stage !== undefined) setSelectedStage(extra.stage);
    if (extra.subStep !== undefined) setEstablishedSubStep(extra.subStep);
    if (extra.navId) setActiveNavId(extra.navId);
  }, [selectedStage, establishedSubStep, activeNavId, setActiveNavId]);

  // Native Browser Back / Forward History Listener
  const didInitHistoryRef = useRef(false);
  useEffect(() => {
    // Fresh session always begins at #welcome (only once — re-running replaceState
    // on every render would clobber the current navigation hash, e.g. after
    // onboarding completes and the workspace loads).
    if (!didInitHistoryRef.current) {
      didInitHistoryRef.current = true;
      window.history.replaceState({ screen: 'welcome' }, '', '#welcome');
    }

    const handlePopState = (event) => {
      const state = event.state;
      if (!state || !state.screen) {
        const hash = (window.location.hash || '').replace('#', '');
        if (hash === 'login') {
          setAppScreen('login');
        } else if (hash === 'stage-selection') {
          setAppScreen('steps');
          setSelectedStage('');
        } else if (hash === 'new-idea') {
          setAppScreen('steps');
          setSelectedStage('new_idea');
        } else if (hash === 'startup') {
          setAppScreen('steps');
          setSelectedStage('startup');
        } else if (hash === 'established-info') {
          setAppScreen('steps');
          setSelectedStage('established');
          setEstablishedSubStep(2);
        } else if (hash === 'established-type') {
          setAppScreen('steps');
          setSelectedStage('established');
          setEstablishedSubStep(3);
        } else if (hash === 'established-ops') {
          setAppScreen('steps');
          setSelectedStage('established');
          setEstablishedSubStep(4);
        } else if (hash && ['dashboard', 'business', 'feasibility', 'financial-plan', 'scheme', 'action-plan', 'settings', 'help'].includes(hash)) {
          setAppScreen('workspace');
          setActiveNavId(hash);
        } else {
          setAppScreen('welcome');
        }
        return;
      }

      setAppScreen(state.screen);
      if (state.screen === 'steps') {
        setSelectedStage(state.stage || '');
        if (state.subStep) setEstablishedSubStep(state.subStep);
      } else if (state.screen === 'workspace') {
        if (state.navId) setActiveNavId(state.navId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveNavId]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Welcome -> Login
  const handleGetStarted = () => {
    navigate('login');
  };

  // Login as Guest or Register -> Stage Selection
  const handleGuestContinue = () => {
    navigate('steps', { stage: '' });
  };

  // Explicit Login action — Replicates Guest functionality to always show Business Stage Selection
  const handleLoginSuccess = () => {
    navigate('steps', { stage: '' });
  };

  // Stage Selection -> Stage Intake
  const handleSelectStage = (stg) => {
    navigate('steps', { stage: stg, subStep: 2 });
  };

  // Back from Stage Selection -> Login
  const handleBackFromStageSelect = () => {
    navigate('login');
  };

  // Back to Stage Selection from an intake form
  const handleBackToStageSelect = () => {
    navigate('steps', { stage: '' });
  };

  // Established SubStep Change
  const handleEstablishedSubStepChange = (sub) => {
    navigate('steps', { stage: 'established', subStep: sub });
  };

  // Logo / Home Navigation
  const handleNavigateHome = () => {
    navigate('welcome');
  };

  // Onboarding Complete (after Workspace Preparation)
  const handleOnboardingComplete = (newProfile) => {
    const profileWithCompletion = {
      ...newProfile,
      onboardingCompletedAt: newProfile?.onboardingCompletedAt || new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }),
      lastUpdatedAt: newProfile?.lastUpdatedAt || new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }),
    };
    setCurrentProfile(profileWithCompletion);
    if (profileWithCompletion?.ownCapital) {
      updateFinancialValues({
        min_cash_buffer: Math.max(50000, Math.round(profileWithCompletion.ownCapital * 0.2)),
        cash_balance: profileWithCompletion.ownCapital,
      });
    }
    if (clearNavigationHistory) clearNavigationHistory();
    navigate('workspace', { navId: 'dashboard' });
  };

  // Explore Demo Workspace
  const handleExploreDemo = () => {
    enterDemoMode();
    if (clearNavigationHistory) clearNavigationHistory();
    navigate('workspace', { navId: 'dashboard' });
  };

  // Exit Demo Workspace -> Login
  const handleExitDemo = () => {
    exitDemoMode();
    if (clearNavigationHistory) clearNavigationHistory();
    navigate('login');
  };

  // Logout -> Login
  const handleLogout = () => {
    if (isDemoMode) exitDemoMode();
    if (clearNavigationHistory) clearNavigationHistory();
    navigate('login');
  };

  // Primary workspace tab selection
  const handleSelectNav = (navId) => {
    navigate('workspace', { navId });
  };

  const workspacePage =
    activeNavId === 'business' || activeNavId === 'profile' ? (
      <BusinessProfilePage currentProfile={currentProfile} onNavigateHome={() => handleSelectNav('dashboard')} />
    ) : activeNavId === 'feasibility' ? (
      <FeasibilityPage currentProfile={currentProfile} onNavigateHome={() => handleSelectNav('dashboard')} />
    ) : activeNavId === 'financial-plan' ? (
      <FinancialPlanPage currentProfile={currentProfile} onNavigateHome={() => handleSelectNav('dashboard')} />
    ) : activeNavId === 'scheme' ? (
      <SchemePage currentProfile={currentProfile} onNavigateHome={() => handleSelectNav('dashboard')} />
    ) : activeNavId === 'action-plan' ? (
      <ActionPlanPage currentProfile={currentProfile} onNavigateHome={() => handleSelectNav('dashboard')} />
    ) : activeNavId === 'settings' ? (
      <SettingsPage currentProfile={currentProfile} onNavigateHome={() => handleSelectNav('dashboard')} />
    ) : activeNavId === 'help' ? (
      <HelpSupportPage currentProfile={currentProfile} onNavigateHome={() => handleSelectNav('dashboard')} />
    ) : (
      <DashboardPage currentProfile={currentProfile} onNavigate={handleSelectNav} />
    );

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      {!showSplash && appScreen === 'welcome' && (
        <OnboardingFlow
          isOpen
          initialStep={1}
          onClose={handleGetStarted}
          currentProfile={currentProfile}
          onExploreDemo={handleExploreDemo}
          onIntroComplete={handleGetStarted}
          onHome={handleNavigateHome}
          onComplete={handleOnboardingComplete}
        />
      )}
      {!showSplash && appScreen === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onGuestContinue={handleGuestContinue}
          onRegister={handleGuestContinue}
          onHome={handleNavigateHome}
        />
      )}
      {!showSplash && appScreen === 'steps' && (
        <OnboardingFlow
          isOpen
          initialStep={2}
          selectedStage={selectedStage}
          onSelectStage={handleSelectStage}
          establishedSubStep={establishedSubStep}
          onEstablishedSubStepChange={handleEstablishedSubStepChange}
          onBackToStageSelect={handleBackToStageSelect}
          onClose={handleBackFromStageSelect}
          onHome={handleNavigateHome}
          currentProfile={currentProfile}
          onExploreDemo={handleExploreDemo}
          onComplete={handleOnboardingComplete}
        />
      )}
      {!showSplash && appScreen === 'workspace' && (
        <AppLayout
          currentProfile={currentProfile}
          activeNavId={activeNavId}
          onSelectNav={handleSelectNav}
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
