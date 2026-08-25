import React, { useState } from 'react';
import CleanHeader from './CleanHeader';
import BusinessChangeModal from '../common/BusinessChangeModal';
import FloatingAiButton from '../dashboard/FloatingAiButton';
import AskVittanayaModal from '../dashboard/AskVittanayaModal';
import { useWorkspace } from '../../context/WorkspaceContext';

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
  const { updateProfile, financialSummary } = useWorkspace();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col overflow-x-hidden relative">
      <CleanHeader
        activeNavId={activeNavId}
        onSelectNav={onSelectNav}
        onOpenChangeBusiness={() => setIsBusinessChangeOpen(true)}
        onLogout={onLogout}
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
        {children}
      </main>

      {/* Global Authenticated Workspace Floating AI Assistant */}
      <FloatingAiButton onClick={() => setIsAiModalOpen(true)} />

      {/* Global AI Modal Dialog */}
      <AskVittanayaModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentProfile={currentProfile}
        financialSummary={financialSummary}
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
