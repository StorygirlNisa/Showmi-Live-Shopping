import React, { useState } from 'react';
import { 
  Users, 
  Play, 
  MapPin, 
  ArrowRight, 
  Radio, 
  Heart, 
  Share2, 
  ShoppingBag, 
  Check, 
  Info,
  Sparkles
} from 'lucide-react';
import { LiveSession, Product, Seller } from '../types';
import { ProductDetailDrawer } from './ProductDetailDrawer';

interface LiveStreamsListViewProps {
  liveSessions: LiveSession[];
  products: Product[];
  sellers?: Seller[];
  onOpenLiveRoom: (sessionId: string) => void;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onBuyNow?: (product: Product, quantity?: number) => void;
  onSelectSeller?: (sellerId: string) => void;
}

export const LiveStreamsListView: React.FC<LiveStreamsListViewProps> = ({
  liveSessions,
  products,
  sellers = [],
  onOpenLiveRoom,
  onAddToCart,
  onBuyNow,
  onSelectSeller
}) => {
  // On-demand product detail drawer state
  const [selectedDrawerProduct, setSelectedDrawerProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Likes state
  const [likedSessions, setLikedSessions] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const handleLike = (sessionId: string, initialLikes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = likedSessions[sessionId];
    setLikedSessions(prev => ({ ...prev, [sessionId]: !isLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [sessionId]: (prev[sessionId] || initialLikes) + (isLiked ? -1 : 1)
    }));
  };

  const handleShare = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddToCart || product.stock <= 0) return;
    onAddToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const openDrawer = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDrawerProduct(product);
    setIsDrawerOpen(true);
  };

  return (
    <div className="w-full min-w-0 max-w-full bg-[#0c0e12] overflow-hidden">
      
      {/* Toast Notification */}
      {copiedId && (
        <div className="fixed top-20 right-4 z-50 bg-[#0066ff] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl shadow-[#0066ff]/40 flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>Live broadcast link copied</span>
        </div>
      )}

      {/* Main Vertically Scrolling Snap Feed */}
      <div 
        className="w-full h-[calc(100vh-154px)] sm:h-[calc(100dvh-154px)] md:h-[calc(100dvh-114px)] overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-none flex flex-col items-center"
        role="feed"
        aria-label="LIVE Shopping Stream Feed"
      >
        {liveSessions.map((session, idx) => {
          const featured = products.find(p => p.id === session.featuredProductId) || products[idx % products.length];
          const seller = sellers.find(s => s.id === session.sellerId);
          const isLiked = likedSessions[session.id];
          const initialLikes = 320 + idx * 110;
          const currentLikes = likeCounts[session.id] !== undefined ? likeCounts[session.id] : initialLikes;
          const isAdded = featured && addedProductId === featured.id;
          const isSoldOut = featured && featured.stock <= 0;

          return (
            <article
              key={session.id}
              onClick={() => onOpenLiveRoom(session.id)}
              className="w-full h-[calc(100vh-154px)] sm:h-[calc(100dvh-154px)] md:h-[calc(100dvh-114px)] snap-start snap-always shrink-0 relative overflow-hidden bg-black select-none max-w-md lg:max-w-lg md:rounded-2xl md:my-1.5 md:border md:border-[#212633] shadow-2xl cursor-pointer group"
              role="button"
              tabIndex={0}
              aria-label={`Open live stream: ${session.title}`}
            >
              {/* Full-Bleed Stream Cover Media */}
              <img
                src={session.coverImage}
                alt={session.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* High-Contrast Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 via-50% to-black/30 pointer-events-none" />

              {/* Top Bar: LIVE Status, Viewers, & Category */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-md font-mono border border-white/10 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    {session.viewerCount.toLocaleString()} watching
                  </span>
                </div>

                <div className="bg-black/60 backdrop-blur-md text-slate-200 text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-md border border-white/10">
                  {session.streamCategory}
                </div>
              </div>

              {/* Center Play Overlay Icon on Hover */}
              <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-[#0066ff]/90 text-white flex items-center justify-center shadow-2xl shadow-[#0066ff]/40 transform scale-90 group-hover:scale-100 transition-transform backdrop-blur-sm">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
              </div>

              {/* Right-Side Floating Actions */}
              <aside className="absolute right-3 bottom-24 sm:bottom-28 z-20 flex flex-col items-center gap-3.5" onClick={(e) => e.stopPropagation()}>
                
                {/* Host Avatar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectSeller && seller) {
                      onSelectSeller(seller.id);
                    } else {
                      onOpenLiveRoom(session.id);
                    }
                  }}
                  className="relative p-0.5 rounded-full bg-red-600 cursor-pointer shadow-lg active:scale-95 transition-transform"
                  title={`View host ${session.sellerName}`}
                  aria-label={`View host ${session.sellerName}`}
                >
                  <img
                    src={session.sellerAvatar}
                    alt={session.sellerName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border-2 border-black"
                  />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-1 rounded-full uppercase tracking-tighter">
                    Host
                  </span>
                </button>

                {/* Like Button */}
                <button
                  onClick={(e) => handleLike(session.id, initialLikes, e)}
                  className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform"
                  aria-label={`Like live room. Current likes: ${currentLikes}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                    isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/50 text-white hover:bg-black/70'
                  }`}>
                    <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-red-500 scale-110' : ''}`} />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white drop-shadow">
                    {currentLikes}
                  </span>
                </button>

                {/* Details Button for Featured Item */}
                {featured && (
                  <button
                    onClick={(e) => openDrawer(featured, e)}
                    className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform"
                    title="View featured item details"
                    aria-label="View featured item details"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-[#0066ff] text-white flex items-center justify-center backdrop-blur-md transition-colors">
                      <Info className="w-5 h-5 text-[#60a5fa] hover:text-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-200 drop-shadow">
                      Specs
                    </span>
                  </button>
                )}

                {/* Share Button */}
                <button
                  onClick={(e) => handleShare(session.id, e)}
                  className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform"
                  title="Share stream"
                  aria-label="Share live stream"
                >
                  <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200 drop-shadow">
                    Share
                  </span>
                </button>

              </aside>

              {/* Bottom Essential Overlay: Host, Title & Pinned Product Pill */}
              <div className="absolute left-3.5 right-16 sm:right-20 bottom-3.5 z-20 space-y-2.5">
                
                {/* Host Info */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white drop-shadow">
                      {session.sellerName}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      Broadcasting
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 flex items-center gap-1 drop-shadow">
                    <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                    <span>{session.sellerLocation}</span>
                  </p>
                </div>

                {/* Stream Title */}
                <h2 className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-snug drop-shadow pr-2">
                  {session.title}
                </h2>

                {/* Pinned Product in Show Pill */}
                {featured && (
                  <div 
                    onClick={(e) => openDrawer(featured, e)}
                    className="bg-[#12151d]/90 backdrop-blur-md border border-[#212633] hover:border-[#0066ff]/60 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-lg active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={featured.images[0]}
                        alt={featured.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover border border-[#262c3a] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                          Pinned in Stream
                        </span>
                        <p className="text-xs font-bold text-white truncate leading-tight">
                          {featured.name}
                        </p>
                        <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 block mt-0.5">
                          R {featured.priceZAR.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {onAddToCart && (
                        <button
                          onClick={(e) => handleQuickAdd(featured, e)}
                          disabled={isSoldOut}
                          className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow ${
                            isSoldOut
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                              : isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#181c25] hover:bg-[#202534] text-white border border-[#2e3648] active:scale-95'
                          }`}
                          title={isSoldOut ? 'Sold out' : 'Add to basket'}
                          aria-label="Add pinned product to basket"
                        >
                          {isAdded ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <ShoppingBag className="w-3.5 h-3.5 text-[#0066ff]" />
                          )}
                          <span className="hidden xs:inline">{isAdded ? 'Added' : 'Basket'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </article>
          );
        })}
      </div>

      {/* On-Demand Featured Product Detail Drawer */}
      <ProductDetailDrawer
        product={selectedDrawerProduct}
        seller={sellers.find(s => s.id === selectedDrawerProduct?.sellerId)}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddToCart={(prod, qty) => {
          if (onAddToCart) onAddToCart(prod, qty);
        }}
        onBuyNow={(prod, qty) => {
          if (onBuyNow) {
            onBuyNow(prod, qty);
          } else if (onAddToCart) {
            onAddToCart(prod, qty);
          }
        }}
        onViewSeller={onSelectSeller}
        onOpenLiveRoom={onOpenLiveRoom}
      />

    </div>
  );
};
