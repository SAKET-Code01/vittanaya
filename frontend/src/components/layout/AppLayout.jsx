import React, { useEffect, useState } from 'react';
import BusinessChangeModal from '../common/BusinessChangeModal';
import FloatingAiButton from '../dashboard/FloatingAiButton';
import AskVittanayaModal from '../dashboard/AskVittanayaModal';
import { useWorkspace } from '../../context/WorkspaceContext';
import TopNavigation from './TopNavigation';

export default function AppLayout({
  children,
  currentProfile,
  activeNavId,
  onSelectNav,
  isDemoMode,
  onExitDemo,
  onLogout,
}) {
  const [isBusinessChangeOpen, setIsBusinessChangeOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiContextPrompt, setAiContextPrompt] = useState('');
  const { updateProfile, financialSummary } = useWorkspace();

  useEffect(() => {
    const handleOpenAssistant = (event) => {
      setAiContextPrompt(event?.detail?.prompt || '');
      setIsAiModalOpen(true);
    };

    window.addEventListener('vittanaya-open-ai', handleOpenAssistant);
    return () => window.removeEventListener('vittanaya-open-ai', handleOpenAssistant);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col overflow-x-hidden relative vt-atmosphere">
      <TopNavigation
        activeNavId={activeNavId}
        onSelectNav={onSelectNav}
        currentProfile={currentProfile}
        onOpenProfile={() => onSelectNav('business')}
      />
      {isDemoMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-8 py-2 flex items-center justify-between text-xs text-amber-800 font-medium">
          <span>Demo mode uses sample workspace data; it does not change saved data.</span>
          <button type="button" onClick={onExitDemo} className="font-bold underline cursor-pointer">
            Exit Demo
          </button>
        </div>
      )}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        <div key={activeNavId || 'workspace'} className="vt-page-enter">
          {children}
        </div>
      </main>

      {/* Global Authenticated Workspace Floating AI Assistant */}
      <FloatingAiButton
        onClick={() => {
          setAiContextPrompt('');
          setIsAiModalOpen(true);
        }}
      />
      {/* Global AI Modal Dialog */}
      <AskVittanayaModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentProfile={currentProfile}
        financialSummary={financialSummary}
        initialPrompt={aiContextPrompt}
      />

      <BusinessChangeModal
        isOpen={isBusinessChangeOpen}
        onClose={() => setIsBusinessChangeOpen(false)}
        currentProfile={currentProfile}
        onSave={updateProfile}
      />
    </div>
  );
}
