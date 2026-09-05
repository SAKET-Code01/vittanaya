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
import { authService } from './services/authService';
import { businessService } from './services/businessService';
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

  // Fresh load / refresh respects saved workspace profile & active route
  const [showSplash, setShowSplash] = useState(true);
  const [appScreen, setAppScreen] = useState(() => {
    try {
      const hash = (window.location.hash || '').replace('#', '');
      if (['dashboard', 'business', 'feasibility', 'financial-plan', 'scheme', 'action-plan', 'settings', 'help'].includes(hash)) {
        return 'workspace';
      }
      const savedProfile = localStorage.getItem('vittanaya_profile_v2');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed && parsed.onboardingCompletedAt) {
          return 'workspace';
        }
      }
    } catch (e) { }
    return 'welcome';
  });
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
    if (!didInitHistoryRef.current) {
      didInitHistoryRef.current = true;
      const hash = (window.location.hash || '').replace('#', '');
      let initialScreen = 'welcome';
      let initialHash = '#welcome';
      let navId = undefined;

      const validWorkspaceRoutes = ['dashboard', 'business', 'feasibility', 'financial-plan', 'scheme', 'action-plan', 'settings', 'help'];

      if (validWorkspaceRoutes.includes(hash)) {
        initialScreen = 'workspace';
        initialHash = `#${hash}`;
        navId = hash;
        setActiveNavId(hash);
      } else {
        try {
          const saved = localStorage.getItem('vittanaya_profile_v2');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.onboardingCompletedAt) {
              initialScreen = 'workspace';
              initialHash = '#dashboard';
              navId = 'dashboard';
            }
          }
        } catch (e) { }
      }

      window.history.replaceState(
        { screen: initialScreen, ...(navId ? { navId } : {}) },
        '',
        initialHash
      );
    }

    const handlePopState = (event) => {
      const state = event.state;
      if (!state || !state.screen) {
        const currentHash = (window.location.hash || '').replace('#', '');
        if (currentHash === 'login') {
          setAppScreen('login');
        } else if (currentHash === 'stage-selection') {
          setAppScreen('steps');
          setSelectedStage('');
        } else if (currentHash === 'new-idea') {
          setAppScreen('steps');
          setSelectedStage('new_idea');
        } else if (currentHash === 'startup') {
          setAppScreen('steps');
          setSelectedStage('startup');
        } else if (currentHash === 'established-info') {
          setAppScreen('steps');
          setSelectedStage('established');
          setEstablishedSubStep(2);
        } else if (currentHash === 'established-type') {
          setAppScreen('steps');
          setSelectedStage('established');
          setEstablishedSubStep(3);
        } else if (currentHash === 'established-ops') {
          setAppScreen('steps');
          setSelectedStage('established');
          setEstablishedSubStep(4);
        } else if (currentHash && ['dashboard', 'business', 'feasibility', 'financial-plan', 'scheme', 'action-plan', 'settings', 'help'].includes(currentHash)) {
          setAppScreen('workspace');
          setActiveNavId(currentHash);
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

    // Persist real business profile to FastAPI / PostgreSQL backend
    if (!isDemoMode) {
      businessService
        .createBusiness({
          owner_id: 1,
          name: profileWithCompletion.businessName || profileWithCompletion.name || 'Rural Micro-Enterprise',
          type: profileWithCompletion.businessType || profileWithCompletion.category || 'Retail',
          industry: profileWithCompletion.industry || 'General',
          stage: profileWithCompletion.stage || 'established',
          category: profileWithCompletion.category || null,
          location_village: profileWithCompletion.village || null,
          location_block: profileWithCompletion.block || null,
          location_district: profileWithCompletion.district || 'Puri',
          location_state: profileWithCompletion.state || 'Odisha',
          location_pin: profileWithCompletion.pin || null,
          phone: profileWithCompletion.phone || null,
          email: profileWithCompletion.email || null,
          description: profileWithCompletion.description || null,
          own_capital: Number(profileWithCompletion.ownCapital || 0.0),
          project_cost: Number(profileWithCompletion.project_cost || profileWithCompletion.projectCost || 0.0),
          existing_investment: Number(profileWithCompletion.alreadyInvested || 0.0),
          social_category: profileWithCompletion.socialCategory || 'General',
          area_type: profileWithCompletion.areaType || 'Rural',
          monthly_revenue_estimate: Number(profileWithCompletion.monthlyRevenue || 0.0),
          monthly_expense_estimate: Number(profileWithCompletion.monthlyExpense || 0.0),
        })
        .then((savedBiz) => {
          if (savedBiz && savedBiz.id) {
            setCurrentProfile((prev) => ({
              ...prev,
              id: savedBiz.id,
              project_cost: Number(savedBiz.project_cost ?? prev.project_cost ?? 0),
              projectCost: Number(savedBiz.project_cost ?? prev.projectCost ?? 0),
              estimatedProjectCost: Number(savedBiz.project_cost ?? prev.estimatedProjectCost ?? 0),
            }));
          }
        })
        .catch((err) => {
          console.warn('Backend business persistence notice:', err);
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

  // Logout / New Session -> Clear Active Session & Return to Onboarding Stage Selection
  const handleLogout = () => {
    if (isDemoMode) exitDemoMode();
    // 1. Clear authenticated/session profile state
    setCurrentProfile(null);
    try {
      localStorage.removeItem('vittanaya_profile_v2');
    } catch (e) {}

    // 2. Clear stage and sub-step selections
    setSelectedStage('');
    setEstablishedSubStep(2);

    // 3. Clear navigation history
    if (clearNavigationHistory) clearNavigationHistory();

    // 4. Terminate auth session
    try {
      authService.logout();
    } catch (e) {}

    // 5. Navigate to the existing Stage Selection screen in onboarding flow
    navigate('steps', { stage: '' }, true);
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
