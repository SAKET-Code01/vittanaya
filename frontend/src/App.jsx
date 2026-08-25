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
import StartupOpeningAnimation from './components/common/StartupOpeningAnimation';
import LoginPage from './pages/Login';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { LocaleProvider } from './locale/LocaleContext';

function AppContent() {
  const { currentProfile, setCurrentProfile, activeNavId, setActiveNavId, isDemoMode, enterDemoMode, exitDemoMode } = useWorkspace();
  const [hasPlayedStartup, setHasPlayedStartup] = useState(false);
  const [appScreen, setAppScreen] = useState('onboarding');
  const handleGuestContinue = () => setAppScreen('steps');
  const handleOnboardingComplete = (newProfile) => { setCurrentProfile(newProfile); setActiveNavId('dashboard'); setAppScreen('workspace'); };
  const handleExploreDemo = () => { enterDemoMode(); setActiveNavId('dashboard'); setAppScreen('workspace'); };
  const handleExitDemo = () => { exitDemoMode(); setActiveNavId('dashboard'); setAppScreen('login'); };
  const handleLogout = () => { if (isDemoMode) exitDemoMode(); setActiveNavId('dashboard'); setAppScreen('login'); };
  const workspacePage = activeNavId === 'business' || activeNavId === 'profile' ? <BusinessProfilePage onNavigateHome={() => setActiveNavId('dashboard')} /> : activeNavId === 'feasibility' ? <FeasibilityPage onNavigateHome={() => setActiveNavId('dashboard')} /> : activeNavId === 'financial-plan' ? <FinancialPlanPage onNavigateHome={() => setActiveNavId('dashboard')} /> : activeNavId === 'scheme' ? <SchemePage onNavigateHome={() => setActiveNavId('dashboard')} /> : activeNavId === 'action-plan' ? <ActionPlanPage onNavigateHome={() => setActiveNavId('dashboard')} /> : activeNavId === 'settings' ? <SettingsPage onNavigateHome={() => setActiveNavId('dashboard')} /> : activeNavId === 'help' ? <HelpSupportPage onNavigateHome={() => setActiveNavId('dashboard')} /> : <DashboardPage currentProfile={currentProfile} onNavigate={setActiveNavId} />;
  return <>
    {!hasPlayedStartup && <StartupOpeningAnimation onComplete={() => setHasPlayedStartup(true)} />}
    {hasPlayedStartup && appScreen === 'login' && <LoginPage onLoginSuccess={handleGuestContinue} onGuestContinue={handleGuestContinue} onRegister={handleGuestContinue} />}
    {hasPlayedStartup && appScreen === 'onboarding' && <OnboardingFlow isOpen onClose={() => setAppScreen('login')} currentProfile={currentProfile} onExploreDemo={handleExploreDemo} onIntroComplete={() => setAppScreen('login')} onComplete={handleOnboardingComplete} />}
    {hasPlayedStartup && appScreen === 'steps' && <OnboardingFlow isOpen initialStep={2} onClose={() => setAppScreen('login')} currentProfile={currentProfile} onExploreDemo={handleExploreDemo} onComplete={handleOnboardingComplete} />}
    {hasPlayedStartup && appScreen === 'workspace' && <AppLayout currentProfile={currentProfile} activeNavId={activeNavId} onSelectNav={setActiveNavId} isDemoMode={isDemoMode} onExitDemo={handleExitDemo} onLogout={handleLogout}>{workspacePage}</AppLayout>}
  </>;
}

export default function App() { return <LocaleProvider><WorkspaceProvider><AppContent /></WorkspaceProvider></LocaleProvider>; }
