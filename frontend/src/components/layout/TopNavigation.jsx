import React from 'react';
import CleanHeader from './CleanHeader';

export default function TopNavigation({
  activeNavId,
  onSelectNav,
  currentProfile,
  onOpenProfile,
}) {
  return (
    <CleanHeader
      activeNavId={activeNavId}
      onSelectNav={onSelectNav}
      onOpenChangeBusiness={onOpenProfile}
      onLogout={() => {}}
      currentProfile={currentProfile}
    />
  );
}
