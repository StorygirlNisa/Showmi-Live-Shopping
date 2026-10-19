import React from 'react';
import showmiWhiteLogo from '../assets/images/showmi_live_logo_white.svg';

export interface ShowmiLogoProps {
  /**
   * 'gradient': decorative styling or standard brand use
   * 'monochrome': pure white logo artwork against dark backgrounds
   */
  variant?: 'gradient' | 'monochrome';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Showmi LIVE Official Logo & Shopping-Bag Icon Component
 * Uses the exact uploaded white shopping bag logo asset containing LIVE.
 */
export const ShowmiLogo: React.FC<ShowmiLogoProps> = ({
  variant = 'gradient',
  size = 'md',
  showWordmark = true,
  className = '',
  onClick
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const wordmarkSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 shrink-0 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label="Showmi LIVE Home"
    >
      {/* Official Uploaded White Shopping-Bag Logo Asset containing LIVE */}
      <div
        className={`${iconDimensions[size]} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
        aria-hidden="true"
      >
        <img
          src={showmiWhiteLogo}
          alt="Showmi LIVE Logo"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Header Wordmark: Pure "Showmi" */}
      {showWordmark && (
        <span
          className={`${wordmarkSizes[size]} font-heading font-extrabold tracking-tight whitespace-nowrap text-white`}
        >
          Showmi
        </span>
      )}
    </div>
  );
};


