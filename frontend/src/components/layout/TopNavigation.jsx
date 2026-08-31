import React from 'react';
import CleanHeader from './CleanHeader';

export default function TopNavigation({
  activeNavId,
  onSelectNav,
  currentProfile,
  onOpenProfile,
  onLogout,
}) {
  return (
    <CleanHeader
      activeNavId={activeNavId}
      onSelectNav={onSelectNav}
      onOpenChangeBusiness={onOpenProfile}
      onLogout={onLogout}
      currentProfile={currentProfile}
    />
  );
}
