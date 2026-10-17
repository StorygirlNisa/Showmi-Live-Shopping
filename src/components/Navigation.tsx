import React from 'react';
import { ShoppingBag, Radio, Compass, Store, Sparkles, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';

interface NavigationProps {
  activeTab: 'discover' | 'live' | 'sellers' | 'basket' | 'studio';
  setActiveTab: (tab: 'discover' | 'live' | 'sellers' | 'basket' | 'studio') => void;
  cartItems: CartItem[];
  onOpenInfoModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  cartItems,
  onOpenInfoModal
}) => {
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.product.priceZAR * item.quantity, 0);

  return (
    <>
      {/* Desktop / Tablet Top Navigation Bar (Adheres to Top Bar Contract) */}
      <header className="sticky top-0 z-40 bg-[#0c0e12]/95 backdrop-blur-md border-b border-[#212633] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab('discover')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0066ff] flex items-center justify-center font-bold text-white shadow-lg shadow-[#0066ff]/20">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0">
              Showmi
            </span>
          </button>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('discover')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === 'discover' ? 'text-[#0066ff] font-semibold' : ''
              }`}
            >
              <Compass className="w-4 h-4" />
              Discover
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer relative ${
                activeTab === 'live' ? 'text-[#0066ff] font-semibold' : ''
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              Live Streams
            </button>

            <button
              onClick={() => setActiveTab('sellers')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === 'sellers' ? 'text-[#0066ff] font-semibold' : ''
              }`}
            >
              <Store className="w-4 h-4" />
              SA Makers
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'studio' ? 'text-[#0066ff] font-semibold' : 'text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#0066ff]" />
              Seller Studio (AI)
            </button>

            <button
              onClick={onOpenInfoModal}
              className="hover:text-white text-xs text-slate-400 border border-[#262c3a] px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0066ff]" />
              Setup & Info
            </button>
          </nav>

          {/* Zone 3: Primary Action / Basket */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('basket')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                totalItemCount > 0
                  ? 'bg-[#0066ff] text-white hover:bg-[#0052cc] shadow-md shadow-[#0066ff]/25'
                  : 'bg-[#181c25] text-slate-200 hover:bg-[#202532] border border-[#262c3a]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
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
      </header>

      {/* Mobile-First Fixed Bottom Navigation Bar (Thumb-Zone Ergonomics) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e1117]/95 backdrop-blur-md border-t border-[#212633] px-2 py-1.5">
        <div className="grid grid-cols-5 items-center h-14">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
              activeTab === 'discover' ? 'text-[#0066ff]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-tight mt-1">Discover</span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`flex flex-col items-center justify-center h-full cursor-pointer relative transition-colors ${
              activeTab === 'live' ? 'text-[#0066ff]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Radio className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </div>
            <span className="text-[9px] font-medium tracking-tight mt-1">Live Now</span>
          </button>

          <button
            onClick={() => setActiveTab('sellers')}
            className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
              activeTab === 'sellers' ? 'text-[#0066ff]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-tight mt-1">Makers</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
              activeTab === 'studio' ? 'text-[#0066ff]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-tight mt-1">AI Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('basket')}
            className={`flex flex-col items-center justify-center h-full cursor-pointer relative transition-colors ${
              activeTab === 'basket' ? 'text-[#0066ff]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#0066ff] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                  {totalItemCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium tracking-tight mt-1">Basket</span>
          </button>
        </div>
      </nav>
    </>
  );
};
