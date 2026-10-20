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

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2.5 shrink-0 bg-transparent border-0 p-0 text-left cursor-pointer group select-none active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#19BFFF] rounded-xl ${className}`}
        aria-label="LIVE Feed - Showmi LIVE Shopping"
        title="Open LIVE Feed"
      >
        {/* Official Uploaded White Shopping-Bag Logo Asset containing LIVE */}
        <div
          className={`${iconDimensions[size]} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
          aria-hidden="true"
        >
          <img
            src={showmiWhiteLogo}
            alt="Showmi LIVE shopping bag"
            className="w-full h-full object-contain pointer-events-none"
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
      </button>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 shrink-0 select-none ${className}`}
      aria-label="Showmi LIVE"
    >
      {/* Official Uploaded White Shopping-Bag Logo Asset containing LIVE */}
      <div
        className={`${iconDimensions[size]} flex items-center justify-center shrink-0`}
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


