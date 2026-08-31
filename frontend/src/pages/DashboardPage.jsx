import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import NewBusinessDashboard from '../components/dashboard/NewBusinessDashboard';
import StartupDashboard from '../components/dashboard/StartupDashboard';
import EnterpriseDashboard from '../components/dashboard/EnterpriseDashboard';

/**
 * DashboardPage Route Orchestrator
 * 
 * Scalable stage-aware router:
 * - NEW_BUSINESS / new_idea -> NewBusinessDashboard
 * - STARTUP / startup -> StartupDashboard
 * - ESTABLISHED / established -> EnterpriseDashboard
 */
export default function DashboardPage({
  currentProfile: propProfile,
  onNavigate,
  onOpenWhy,
}) {
  const { currentProfile: contextProfile } = useWorkspace();
  const profile = propProfile || contextProfile || {};

  const rawStage = (profile?.stage || '').toUpperCase();
  const isNewBusiness =
    rawStage === 'NEW_BUSINESS' ||
    rawStage === 'NEW_IDEA' ||
    rawStage === 'IDEA';
  const isStartup = rawStage === 'STARTUP';

  if (isNewBusiness) {
    return (
      <NewBusinessDashboard
        currentProfile={profile}
        onNavigate={onNavigate}
        onOpenWhy={onOpenWhy}
      />
    );
  }

  if (isStartup) {
    return (
      <StartupDashboard
        currentProfile={profile}
        onNavigate={onNavigate}
        onOpenWhy={onOpenWhy}
      />
    );
  }

  return (
    <EnterpriseDashboard
      currentProfile={profile}
      onNavigate={onNavigate}
      onOpenWhy={onOpenWhy}
    />
  );
}