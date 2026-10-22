import React, { useEffect } from 'react';
import { Seller, Product, StreamSnippet } from '../types';
import { MapPin, Star, Film, ArrowRight, CheckCircle2, Store, Users } from 'lucide-react';

interface SellersListViewProps {
  sellers: Seller[];
  products: Product[];
  snippets?: StreamSnippet[];
  onSelectSeller: (sellerId: string) => void;
  onOpenLiveRoom: (sessionId: string) => void;
  followedSellerIds?: string[];
  onToggleFollow?: (sellerId: string) => void;
}

// In-memory persistent scroll offset to preserve Showrooms feed browsing position across navigation
let savedShowroomsScrollTop = 0;

export const SellersListView: React.FC<SellersListViewProps> = ({
  sellers,
  products,
  snippets = [],
  onSelectSeller,
  onOpenLiveRoom,
  followedSellerIds = [],
  onToggleFollow
}) => {
  const displaySellers = sellers;

  // Restore feed scroll position when returning to Showrooms
  useEffect(() => {
    if (savedShowroomsScrollTop > 0) {
      window.scrollTo({ top: savedShowroomsScrollTop, behavior: 'auto' });
      const raf = requestAnimationFrame(() => {
        window.scrollTo({ top: savedShowroomsScrollTop, behavior: 'auto' });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, []);

  // Track window scroll position while browsing the Showrooms feed
  useEffect(() => {
    const handleScroll = () => {
      savedShowroomsScrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-154px)] bg-[#0c0e12] pb-28">
      
      {/* Header */}
      <div className="flex flex-col w-full max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-4 space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          South African Showrooms
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Explore curated South African showrooms, brand storefronts, and independent businesses.
        </p>
      </div>

      {/* Mandatory Single-Column Vertical Feed */}
      <div className="flex flex-col w-full max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        {displaySellers.map((seller) => {
            const sellerProductCount = products.filter(p => p.sellerId === seller.id).length;
            const activeSnippetsCount = snippets.filter(s => s.sellerId === seller.id && !s.isArchived && new Date(s.expiresAt).getTime() > Date.now()).length;

            return (
              <article
                key={seller.id}
                className="block w-full bg-[#14171f] border border-[#212633] rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl"
              >
                {/* 1. Banner image: h-40 w-full object-cover, entirely clickable */}
                <div
                  onClick={() => onSelectSeller(seller.id)}
                  className="w-full h-40 relative bg-black cursor-pointer rounded-2xl overflow-hidden group"
                  role="button"
                  tabIndex={0}
                  aria-label={`Open storefront for ${seller.name}`}
                >
                  <img
                    src={seller.bannerImage}
                    alt={seller.name}
                    referrerPolicy="no-referrer"
                    className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

                  {seller.currentLiveSessionId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLiveRoom(seller.currentLiveSessionId!);
                      }}
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg cursor-pointer z-10"
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      <span>Live Now</span>
                    </button>
                  )}
                </div>

                {/* Card Content Stack */}
                <div className="space-y-3.5">
                  {/* 2. Profile picture or logo */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      referrerPolicy="no-referrer"
                      onClick={() => onSelectSeller(seller.id)}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#14171f] shadow-xl bg-black cursor-pointer hover:scale-105 transition-transform shrink-0"
                      role="button"
                      tabIndex={0}
                      aria-label={`Open storefront for ${seller.name}`}
                    />
                    
                    <div className="min-w-0 flex-1 space-y-1">
                      {/* 3. Store name */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2
                          onClick={() => onSelectSeller(seller.id)}
                          className="font-bold text-white text-base sm:text-lg hover:text-[#0066ff] transition-colors cursor-pointer break-words"
                        >
                          {seller.name}
                        </h2>
                        {seller.verifiedArtisan && (
                          <CheckCircle2 className="w-4 h-4 text-[#0066ff] shrink-0" />
                        )}
                      </div>

                      {/* 4. Location */}
                      {seller.city && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className="break-words">{seller.city}, {seller.province}</span>
                        </p>
                      )}

                      {/* 5. Rating and follower count underneath store title with flexible wrapping */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-300 pt-0.5">
                        <span className="flex items-center gap-1 text-amber-400 font-bold shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {seller.rating}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-300 shrink-0">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {seller.followersCount.toLocaleString()} followers
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {seller.bio && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words">
                      {seller.bio}
                    </p>
                  )}

                  {/* 6. Enter Storefront button & clip/product stats */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#212633]">
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Film className="w-3.5 h-3.5 text-[#0066ff]" />
                        {activeSnippetsCount} active clips
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-300">
                        {sellerProductCount} products
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectSeller(seller.id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0066ff]/30 cursor-pointer transition-colors active:scale-95 shrink-0"
                    >
                      <span>Enter Showroom</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

    </div>
  );
};
