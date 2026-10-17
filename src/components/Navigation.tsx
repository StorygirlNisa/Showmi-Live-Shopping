import React from 'react';
import { ShoppingBag, Store, Sparkles, ShieldCheck, Search, X, Package } from 'lucide-react';
import { CartItem, Seller } from '../types';

export type MainTab = 'LIVE' | 'SA Makers' | 'My Orders' | 'Seller Studio';
export type AppTab = MainTab | 'Basket';

interface NavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  cartItems: CartItem[];
  onOpenInfoModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  userRole: 'buyer' | 'seller';
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

  // Tabs displayed in order: LIVE, SA Makers, My Orders, Seller Studio
  const tabs: { id: MainTab; label: string; icon: React.ReactNode; isLive?: boolean; badgeCount?: number }[] = [
    {
      id: 'LIVE',
      label: 'LIVE',
      icon: (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      ),
      isLive: true
    },
    {
      id: 'SA Makers',
      label: 'SA Makers',
      icon: <Store className="w-4 h-4 shrink-0" />
    },
    {
      id: 'My Orders',
      label: 'My Orders',
      icon: <Package className="w-4 h-4 shrink-0" />,
      badgeCount: ordersCount
    },
    {
      id: 'Seller Studio',
      label: 'Seller Studio',
      icon: <Sparkles className="w-4 h-4 shrink-0 text-current" />
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0e12]/95 backdrop-blur-md border-b border-[#212633] transition-colors safe-area-top w-full max-w-full overflow-hidden">
      {/* Top Header Row: Brand, Search, and Utility Actions */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Logo */}
        <button
          onClick={() => {
            onClearSearch();
            setActiveTab('LIVE');
          }}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none min-h-[44px] shrink-0"
          aria-label="Showmi Home"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0066ff] flex items-center justify-center font-bold text-white shadow-lg shadow-[#0066ff]/20 shrink-0 group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            Showmi
          </span>
        </button>

        {/* Desktop Integrated Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search streams, makers, or products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full min-h-[40px] bg-[#14171f] hover:bg-[#181d28] focus:bg-[#14171f] border border-[#212633] focus:border-[#0066ff] rounded-xl pl-10 pr-9 text-xs text-white focus:text-white placeholder-slate-400 focus:outline-none transition-colors"
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

        {/* Right Actions: Seller Auth Badge (if seller), Basket */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {userRole === 'seller' && currentSeller && (
            <div className="flex items-center gap-2 bg-[#14171f] border border-[#212633] px-2.5 py-1 rounded-xl">
              <img
                src={currentSeller.avatar}
                alt={currentSeller.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-md object-cover bg-black"
              />
              <span className="text-xs font-bold text-white hidden lg:inline truncate max-w-[100px]">
                {currentSeller.name}
              </span>
            </div>
          )}

          {/* Setup & Architecture Info modal trigger removed */}

          {/* Basket Trigger */}
          <button
            onClick={() => {
              onClearSearch();
              setActiveTab('Basket');
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer min-h-[40px] ${
              activeTab === 'Basket'
                ? 'bg-[#0066ff] text-white ring-2 ring-[#0066ff]/40 shadow-md shadow-[#0066ff]/25'
                : totalItemCount > 0
                  ? 'bg-[#0066ff] text-white hover:bg-[#0052cc] shadow-md shadow-[#0066ff]/25'
                  : 'bg-[#14171f] text-slate-200 hover:bg-[#1c2230] border border-[#212633]'
            }`}
            aria-label={`Basket with ${totalItemCount} items`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Basket</span>
            {totalItemCount > 0 && (
              <span className="bg-white text-[#0066ff] px-1.5 py-0.2 rounded-full text-[11px] font-bold tabular-nums">
                {totalItemCount}
              </span>
            )}
            {cartSubtotal > 0 && (
              <span className="hidden sm:inline font-mono tabular-nums text-slate-100 border-l border-white/20 pl-2">
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
            placeholder="Search streams, makers, or products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full min-h-[42px] bg-[#14171f] border border-[#212633] focus:border-[#0066ff] rounded-xl pl-10 pr-9 text-xs text-white focus:text-white placeholder-slate-400 focus:outline-none transition-colors"
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

      {/* Sticky Horizontal Navigation Bar: LIVE | SA Makers | Seller Studio */}
      <div className="border-t border-[#1a1f2c]/80 bg-[#0c0e12]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <nav
            className="flex flex-row items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 touch-pan-x"
            role="tablist"
            aria-label="Main Feed Tabs"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id && !searchQuery;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    onClearSearch();
                    if (tab.id === 'Seller Studio' && userRole !== 'seller') {
                      onOpenSellerSignIn();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`min-h-[42px] px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-2 select-none ${
                    isActive
                      ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/30 ring-1 ring-[#0066ff]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#14171f] active:scale-95'
                  }`}
                >
                  {tab.icon}
                  <span className="tracking-tight">{tab.label}</span>
                  {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono tabular-nums ${
                      isActive ? 'bg-white text-[#0066ff]' : 'bg-[#1e2433] text-slate-300 border border-[#2e374d]'
                    }`}>
                      {tab.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
