import React from 'react';

/**
 * VittanayaLogo Component — Official Brand Asset Component
 * 
 * Uses the exact official brand asset: /assets/vittanaya-logo.png
 * Contains the VITTANAYA logo mark, wordmark, and "NEW BUSINESS IDEA INTAKE • HYPER-LOCAL FEASIBILITY" tagline.
 */
export default function VittanayaLogo({
  size = 'md',
  className = '',
  alt = 'VITTANAYA — New Business Idea • Hyper-Local Feasibility',
  onClick,
  onHome,
  style,
  ...props
}) {
  const handleClick = onClick || onHome;

  const sizeClasses = {
    xs: 'h-6 sm:h-7',
    sm: 'h-8 sm:h-9',
    header: 'h-9 sm:h-10 md:h-11',
    md: 'h-10 sm:h-11 md:h-12',
    lg: 'h-12 sm:h-14 md:h-16',
    xl: 'h-16 sm:h-20',
    responsive: 'h-9 sm:h-10 md:h-11',
  };

  const selectedSize = sizeClasses[size] || size;

  const handleKeyDown = (e) => {
    if (handleClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <img
      src="/assets/vittanaya-logo.png"
      alt={alt}
      onClick={handleClick}
      onKeyDown={handleClick ? handleKeyDown : undefined}
      tabIndex={handleClick ? 0 : undefined}
      role={handleClick ? 'button' : undefined}
      aria-label={handleClick ? 'Go to VITTANAYA Home' : undefined}
      style={{
        aspectRatio: '3.38 / 1',
        ...style,
      }}
      className={`w-auto object-contain block select-none max-w-full ${selectedSize} ${
        handleClick ? 'cursor-pointer hover:opacity-90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 rounded-lg' : ''
      } ${className}`}
      loading="eager"
      {...props}
    />
  );
}
