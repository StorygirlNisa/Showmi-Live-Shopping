import React from 'react';
import { ShoppingBag, Store, Sparkles, Search, X, Package, Radio } from 'lucide-react';
import { CartItem, Seller } from '../types';
import { ShowmiLogo } from './ShowmiLogo';

export type MainTab = 'LIVE' | 'Showrooms' | 'Seller Studio';
export type AppTab = MainTab | 'My Orders' | 'Basket';

interface NavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  cartItems: CartItem[];
  onOpenInfoModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  userRole: 'buyer' | 'seller' | 'admin';
  currentSeller?: Seller;
  onOpenSellerSignIn: () => void;
  ordersCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  cartItems,
  onOpenInfoModal,
  searchQuery,
  onSearchChange,
  onClearSearch,
  userRole,
  currentSeller,
  onOpenSellerSignIn,
  ordersCount = 0
}) => {
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.product.priceZAR * item.quantity, 0);

  // Tabs displayed in horizontal bar: LIVE, Showrooms, Seller Studio
  const tabs: { id: MainTab; label: string; icon: React.ReactNode; isLive?: boolean }[] = [
    {
      id: 'LIVE',
      label: 'LIVE',
      icon: <Radio className="w-4 h-4 shrink-0" />,
      isLive: true
    },
    {
      id: 'Showrooms',
      label: 'Showrooms',
      icon: <Store className="w-4 h-4 shrink-0" />
    },
    {
      id: 'Seller Studio',
      label: 'Seller Studio',
      icon: <Sparkles className="w-4 h-4 shrink-0 text-current" />
    }
  ];

  return (
    <header className="sticky top-12 z-40 bg-[#171A21]/95 backdrop-blur-md border-b border-[#242936] transition-colors safe-area-top w-full max-w-full overflow-hidden">
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
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search streams, showrooms, or products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full min-h-[40px] bg-[#0D1018] hover:bg-[#121622] focus:bg-[#0D1018] border border-[#242936] focus:border-[#19BFFF] rounded-xl pl-10 pr-9 text-xs text-white focus:text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Clear search"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: My Orders, Basket */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* My Orders Trigger */}
          <button
            onClick={() => {
              onClearSearch();
              setActiveTab('My Orders');
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer min-h-[40px] select-none ${
              activeTab === 'My Orders'
                ? 'bg-[#19BFFF] text-[#0D1018] font-bold shadow-md shadow-[#19BFFF]/20'
                : 'bg-[#171A21] text-slate-200 hover:bg-[#20242E] border border-[#242936]'
            }`}
            aria-label={`My Orders${ordersCount > 0 ? ` (${ordersCount})` : ''}`}
            title="My Orders"
          >
            <Package className="w-4 h-4 shrink-0 opacity-80" />
            <span className="whitespace-nowrap">Orders</span>
            {ordersCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold tabular-nums ${
                  activeTab === 'My Orders'
                    ? 'bg-[#0D1018] text-[#19BFFF]'
                    : 'bg-[#20242E] text-slate-300 border border-[#2A3142]'
                }`}
              >
                {ordersCount}
              </span>
            )}
          </button>

          {/* Basket Trigger */}
          <button
            onClick={() => {
              onClearSearch();
              setActiveTab('Basket');
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer min-h-[40px] select-none ${
              activeTab === 'Basket'
                ? 'bg-[#19BFFF] text-[#0D1018] font-bold shadow-md shadow-[#19BFFF]/20 ring-2 ring-[#19BFFF]/30'
                : totalItemCount > 0
                ? 'bg-[#19BFFF] text-[#0D1018] font-bold hover:bg-[#00AEEF] shadow-md shadow-[#19BFFF]/20'
                : 'bg-[#171A21] text-slate-200 hover:bg-[#20242E] border border-[#242936]'
            }`}
            aria-label={`Basket with ${totalItemCount} items`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Basket</span>
            {totalItemCount > 0 && (
              <span className="bg-[#0D1018] text-[#19BFFF] px-1.5 py-0.2 rounded-full text-[11px] font-bold tabular-nums">
                {totalItemCount}
              </span>
            )}
            {cartSubtotal > 0 && (
              <span className="hidden sm:inline font-mono tabular-nums text-slate-900 border-l border-slate-900/30 pl-2">
                R {cartSubtotal.toLocaleString()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row (Directly below branding row on mobile) */}
      <div className="md:hidden px-3 pb-2 pt-0.5">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search streams, showrooms, or products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full min-h-[42px] bg-[#0D1018] border border-[#242936] focus:border-[#19BFFF] rounded-xl pl-10 pr-9 text-xs text-white focus:text-white placeholder-slate-400 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
              title="Clear search"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </header>
  );
};
