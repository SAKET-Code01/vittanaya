import React from 'react';
import vittanayaBrandLogo from '../../assets/vittanaya-logo.png';

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
    xs: 'h-8 sm:h-9',
    sm: 'h-10 sm:h-11 md:h-12',
    header: 'h-11 sm:h-12 md:h-14 lg:h-16',
    md: 'h-12 sm:h-14 md:h-16 lg:h-18',
    lg: 'h-16 sm:h-20 md:h-24',
    xl: 'h-20 sm:h-24 md:h-28 lg:h-32',
    responsive: 'h-11 sm:h-12 md:h-14 lg:h-16',
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
      src={vittanayaBrandLogo || '/assets/vittanaya-logo.png'}
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

