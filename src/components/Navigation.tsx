import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { CartItem, Seller } from '../types';
import { ShowmiLogo } from './ShowmiLogo';

export type MainTab = 'LIVE' | 'Showrooms' | 'Seller Studio';
export type AppTab = MainTab | 'My Orders' | 'Basket';

interface NavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  cartItems?: CartItem[];
  onOpenInfoModal: () => void;
  searchQuery: string;
  onSearchSubmit: (query: string) => void;
  onClearSearch: () => void;
  userRole: 'buyer' | 'seller' | 'admin';
  currentSeller?: Seller;
  onOpenSellerSignIn: () => void;
  ordersCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  cartItems = [],
  onOpenInfoModal,
  searchQuery,
  onSearchSubmit,
  onClearSearch,
  userRole,
  currentSeller,
  onOpenSellerSignIn,
  ordersCount = 0
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      onSearchSubmit(localQuery);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#171A21]/95 backdrop-blur-md border-b border-[#242936] transition-colors safe-area-top w-full max-w-full overflow-hidden">
      {/* Top Header Row: Brand, Search, and Utility Actions */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Logo (Directly clickable route to LIVE feed) */}
        <ShowmiLogo
          variant="gradient"
          size="md"
          onClick={() => {
            onClearSearch();
            setActiveTab('LIVE');
          }}
        />

        {/* Desktop Integrated Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleFormSubmit} className="relative w-full">
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#19BFFF] p-1 cursor-pointer"
              title="Search"
              aria-label="Submit search"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Try leather handbags, birthday gifts..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="w-full min-h-[40px] bg-[#0D1018] hover:bg-[#121622] focus:bg-[#0D1018] border border-[#242936] focus:border-[#19BFFF] rounded-xl pl-10 pr-9 text-xs text-white focus:text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
            {(localQuery || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery('');
                  onClearSearch();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Clear search"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Right Actions: Redundant header basket button removed; persistent footer provides Cart access */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0" />
      </div>

      {/* Mobile Search Bar Row (Directly below branding row on mobile) */}
      <div className="md:hidden px-3 pb-2 pt-0.5">
        <form onSubmit={handleFormSubmit} className="relative w-full">
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#19BFFF] p-1.5 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Search"
            aria-label="Submit search"
          >
            <Search className="w-4 h-4" />
          </button>
          <input
            type="text"
            placeholder="Try leather handbags, birthday gifts..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full min-h-[42px] bg-[#0D1018] border border-[#242936] focus:border-[#19BFFF] rounded-xl pl-10 pr-9 text-xs text-white focus:text-white placeholder-slate-400 focus:outline-none transition-colors"
          />
          {(localQuery || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setLocalQuery('');
                onClearSearch();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
              title="Clear search"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

    </header>
  );
};
