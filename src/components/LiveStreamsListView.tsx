import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Play, 
  MapPin, 
  ArrowRight, 
  Radio, 
  Heart, 
  Share2, 
  Check, 
  Info,
  Sparkles,
  Volume2,
  VolumeX,
  Package,
  Search,
  X,
  Plus
} from 'lucide-react';
import { LiveSession, Product, Seller, CartItem } from '../types';
import { ProductDetailDrawer } from './ProductDetailDrawer';

interface LiveStreamsListViewProps {
  liveSessions: LiveSession[];
  products: Product[];
  sellers?: Seller[];
  onOpenLiveRoom: (sessionId: string) => void;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onBuyNow?: (product: Product, quantity?: number) => void;
  onSelectSeller?: (sellerId: string) => void;
  onOpenTab?: (tab: 'LIVE' | 'Showrooms' | 'Seller Studio' | 'My Orders' | 'Basket') => void;
  cartItems?: CartItem[];
  ordersCount?: number;
  searchQuery?: string;
  onSearchSubmit?: (query: string) => void;
  onClearSearch?: () => void;
}

interface FloatingHeart {
  id: string;
  x: number;
  size: number;
  color: string;
  isGradient?: boolean;
}

// In-memory persistent scroll offset to preserve feed browsing position across tab changes
let savedLiveScrollTop = 0;

export const LiveStreamsListView: React.FC<LiveStreamsListViewProps> = ({
  liveSessions,
  products,
  sellers = [],
  onOpenLiveRoom,
  onAddToCart,
  onBuyNow,
  onSelectSeller,
  onOpenTab,
  cartItems = [],
  ordersCount = 0,
  searchQuery,
  onSearchSubmit,
  onClearSearch
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery || '');

  useEffect(() => {
    setLocalQuery(searchQuery || '');
  }, [searchQuery]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim() && onSearchSubmit) {
      onSearchSubmit(localQuery);
    }
  };
  // On-demand product detail drawer state
  const [selectedDrawerProduct, setSelectedDrawerProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Likes state & Floating Hearts
  const [likedSessions, setLikedSessions] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [sessionHearts, setSessionHearts] = useState<Record<string, FloatingHeart[]>>({});
  const nextHeartId = useRef(0);
  const holdIntervalRef = useRef<number | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastSessionId, setToastSessionId] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const feedContainerRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Clean up any pending toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Restore feed scroll position when returning from Basket or other views
  useEffect(() => {
    if (feedContainerRef.current && savedLiveScrollTop > 0) {
      feedContainerRef.current.scrollTop = savedLiveScrollTop;
      const raf = requestAnimationFrame(() => {
        if (feedContainerRef.current && savedLiveScrollTop > 0) {
          feedContainerRef.current.scrollTop = savedLiveScrollTop;
        }
      });
      return () => cancelAnimationFrame(raf);
    }
  }, []);

  const totalCartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const spawnHeartsForSession = (sessionId: string, count = 2) => {
    const heartChoices = [
      { color: '#19BFFF', isGradient: false },
      { color: '#7A3CFF', isGradient: false },
      { color: 'gradient', isGradient: true }
    ];
    const spawned: FloatingHeart[] = [];

    for (let i = 0; i < count; i++) {
      nextHeartId.current += 1;
      const heartId = `heart-${Date.now()}-${nextHeartId.current}-${i}`;
      const x = Math.floor(Math.random() * 32) - 16;
      const choice = heartChoices[Math.floor(Math.random() * heartChoices.length)];
      const size = Math.floor(Math.random() * 8) + 22;

      spawned.push({
        id: heartId,
        x,
        size,
        color: choice.color,
        isGradient: choice.isGradient
      });

      setTimeout(() => {
        setSessionHearts(prev => ({
          ...prev,
          [sessionId]: (prev[sessionId] || []).filter(item => item.id !== heartId)
        }));
      }, 1600);
    }

    setSessionHearts(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), ...spawned]
    }));
  };

  const handleLikeStart = (sessionId: string, initialLikes: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const isLiked = likedSessions[sessionId];
    setLikedSessions(prev => ({ ...prev, [sessionId]: true }));
    setLikeCounts(prev => ({
      ...prev,
      [sessionId]: (prev[sessionId] || initialLikes) + 1
    }));

    spawnHeartsForSession(sessionId, 2);

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = window.setInterval(() => {
      spawnHeartsForSession(sessionId, 1);
    }, 180);
  };

  const handleLikeEnd = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const handleShare = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickAdd = (product: Product, sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddToCart || product.stock <= 0) return;
    onAddToCart(product, 1);
    setToastSessionId(sessionId);
    setToastKey(prev => prev + 1);

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastSessionId(null);
      toastTimeoutRef.current = null;
    }, 2000);
  };

  const openDrawer = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDrawerProduct(product);
    setIsDrawerOpen(true);
  };

  return (
    <div className="w-full min-w-0 max-w-full bg-[#0c0e12] overflow-hidden relative">
      
      {/* Toast Notification */}
      {copiedId && (
        <div className="fixed top-20 right-4 z-50 bg-[#0066ff] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl shadow-[#0066ff]/40 flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>Live broadcast link copied</span>
        </div>
      )}



      {/* Main Vertically Scrolling Snap Feed */}
      <div 
        ref={feedContainerRef}
        onScroll={(e) => {
          savedLiveScrollTop = e.currentTarget.scrollTop;
        }}
        className="w-full h-[100dvh] md:h-[calc(100vh-64px)] overflow-y-auto scroll-smooth snap-y snap-mandatory scrollbar-none flex flex-col items-center"
        role="feed"
        aria-label="LIVE Shopping Stream Feed"
      >
        {liveSessions.map((session, idx) => {
          const featured = products.find(p => p.id === session.featuredProductId) || products[idx % products.length];
          const seller = sellers.find(s => s.id === session.sellerId);
          const isLiked = likedSessions[session.id];
          const initialLikes = 320 + idx * 110;
          const currentLikes = likeCounts[session.id] !== undefined ? likeCounts[session.id] : initialLikes;
          const isSoldOut = featured && featured.stock <= 0;

          return (
            <article
              key={session.id}
              onClick={() => onOpenLiveRoom(session.id)}
              className="w-full h-[100dvh] md:h-[calc(100vh-64px)] snap-start snap-always shrink-0 relative overflow-hidden bg-black select-none max-w-full md:max-w-2xl lg:max-w-3xl mx-auto rounded-none md:rounded-2xl md:my-2 border-0 md:border md:border-[#212633] shadow-2xl cursor-pointer group"
              role="button"
              tabIndex={0}
              aria-label={`Open live stream: ${session.title}`}
            >
              {/* Full-Bleed Stream Cover Media (Immersive video background at all times) */}
              {session.videoUrl ? (
                  <video
                    src={session.videoUrl}
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                    ref={(el) => {
                      if (el) {
                        const observer = new IntersectionObserver(
                          ([entry]) => {
                            if (entry.isIntersecting) {
                              el.play().catch(e => {
                                if (e.name !== 'AbortError') console.error("Play failed", e);
                              });
                              el.muted = isMuted;
                            } else {
                              el.pause();
                              el.muted = true;
                            }
                          },
                          { threshold: 0.6 }
                        );
                        observer.observe(el);
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
              ) : (
                <img
                  src={session.coverImage}
                  alt={session.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}

              {/* Red LIVE Label */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-rose-600 px-2 py-1 rounded-md text-[10px] font-bold text-white shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </div>

              {/* High-Contrast Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 via-50% to-black/30 pointer-events-none" />

              {/* Labels - Visible over gradient */}
              {/* LIVE Label - Top Right */}
              <div className="absolute top-16 right-4 z-40 flex items-center gap-1.5 bg-rose-600 px-2 py-1 rounded-md text-[10px] font-bold text-white shadow-lg pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </div>

              {/* DEMO Label - Top Right, below LIVE */}
              <div className="absolute top-24 right-4 z-40 bg-black/40 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[9px] font-bold text-white tracking-wide uppercase pointer-events-none">
                DEMO VIDEO
              </div>

              {/* Floating Top Bar: Translucent Search Bar & Stream Controls over video */}
              <div 
                className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-30 pointer-events-none flex items-center gap-2 safe-area-top"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Floating Translucent Search Bar over video */}
                <div 
                  className="relative flex-1 pointer-events-auto max-w-md mx-auto sm:mx-0"
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <form onSubmit={handleFormSubmit} className="relative w-full" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="submit"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-[#19BFFF] p-1 cursor-pointer"
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
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className="w-full min-h-[40px] bg-black/40 hover:bg-black/55 focus:bg-black/80 backdrop-blur-md border border-white/20 focus:border-[#19BFFF] rounded-full pl-10 pr-9 text-xs text-white placeholder-white/70 focus:outline-none transition-all shadow-xl"
                    />
                    {(localQuery || searchQuery) && onClearSearch && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalQuery('');
                          onClearSearch();
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1 rounded-full cursor-pointer"
                        title="Clear search"
                        aria-label="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </form>
                </div>


                {/* Mute Toggle Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0"
                  title={isMuted ? 'Unmute stream preview audio' : 'Mute stream preview audio'}
                  aria-label={isMuted ? 'Unmute stream preview audio' : 'Mute stream preview audio'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white/70" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#19BFFF]" />
                  )}
                </button>
              </div>



              {/* Right-Side Floating Actions */}
              <aside className="absolute right-3 bottom-24 sm:bottom-28 z-20 flex flex-col items-center gap-3.5" onClick={(e) => e.stopPropagation()}>
                
                {/* Profile Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectSeller && seller) {
                      onSelectSeller(seller.id);
                    } else {
                      onOpenLiveRoom(session.id);
                    }
                  }}
                  className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform"
                  title={`View ${session.sellerName} profile`}
                  aria-label={`View ${session.sellerName} profile`}
                >
                  <div className="relative p-0.5 rounded-full bg-red-600 shadow-lg">
                    <img
                      src={session.sellerAvatar}
                      alt={session.sellerName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200 drop-shadow">
                    Profile
                  </span>
                </button>

                {/* Like Button with Press-and-Hold Floating Hearts */}
                <button
                  onMouseDown={(e) => handleLikeStart(session.id, initialLikes, e)}
                  onMouseUp={handleLikeEnd}
                  onMouseLeave={handleLikeEnd}
                  onTouchStart={(e) => handleLikeStart(session.id, initialLikes, e)}
                  onTouchEnd={handleLikeEnd}
                  onTouchCancel={handleLikeEnd}
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform select-none"
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

                {/* Floating Animated Hearts Layer for Feed Card */}
                <div className="absolute right-4 bottom-32 w-24 h-64 pointer-events-none overflow-visible z-30 flex items-end justify-center">
                  <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
                    <defs>
                      <linearGradient id={`heart-grad-feed-${session.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#19BFFF" />
                        <stop offset="100%" stopColor="#7A3CFF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {(sessionHearts[session.id] || []).map((h) => (
                    <div
                      key={h.id}
                      className="absolute animate-float-heart"
                      style={{
                        right: '8px',
                        transform: `translateX(${h.x}px)`,
                        bottom: '0px',
                        color: h.isGradient ? `url(#heart-grad-feed-${session.id})` : h.color
                      }}
                    >
                      <Heart
                        style={{
                          width: h.size,
                          height: h.size,
                          fill: h.isGradient ? `url(#heart-grad-feed-${session.id})` : h.color
                        }}
                        className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                      />
                    </div>
                  ))}
                </div>

                {/* Product Information Details Button for Featured Item */}
                {featured && (
                  <button
                    onClick={(e) => openDrawer(featured, e)}
                    className="flex flex-col items-center cursor-pointer active:scale-90 transition-transform"
                    title="Product Information"
                    aria-label="Product Information"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-[#0066ff] text-white flex items-center justify-center backdrop-blur-md transition-colors">
                      <Info className="w-5 h-5 text-[#60a5fa] hover:text-white" />
                    </div>
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

              {/* Bottom Essential Overlay: Comments, Showroom Info & Pinned Product */}
              <div className="absolute left-3.5 right-16 sm:right-20 bottom-20 sm:bottom-20 z-20 space-y-2">
                
                {/* Live Comments / Chat Feed Preview */}
                <div className="h-16 overflow-y-auto space-y-1 scrollbar-none pr-2 text-left pointer-events-auto">
                  {(session.initialComments || []).slice(-3).map((c) => (
                    <div
                      key={c.id}
                      className="inline-block max-w-full px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm text-[11px] text-white border border-white/10"
                    >
                      <span className={`font-bold mr-1 ${c.isHost ? 'text-[#19BFFF]' : 'text-slate-300'}`}>
                        {c.userName}:
                      </span>
                      <span className="text-slate-100">{c.text}</span>
                    </div>
                  ))}
                </div>

                {/* Showroom Information Block: Immediately above pinned product block */}
                <div className="space-y-0.5 text-left pointer-events-auto">
                  <h2 className="font-bold text-sm sm:text-base text-white drop-shadow leading-tight">
                    {seller?.name || session.sellerName}
                  </h2>
                  <p className="text-[11px] text-white flex items-center gap-1 drop-shadow leading-tight">
                    <MapPin className="w-3 h-3 text-white shrink-0" />
                    <span>{seller?.city || session.sellerLocation}</span>
                  </p>
                  {(seller?.bio || seller?.tagline) && (
                    <p className="text-[11px] text-white truncate drop-shadow leading-tight max-w-full">
                      {seller?.bio || seller?.tagline}
                    </p>
                  )}
                </div>

                {/* Pinned Product in Show Pill */}
                {featured && (
                  <div className="relative">
                    <div 
                      onClick={(e) => openDrawer(featured, e)}
                      className="bg-[#12151d]/90 backdrop-blur-md border border-[#212633] hover:border-[#19BFFF]/60 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-xl active:scale-[0.99] pointer-events-auto"
                    >
                      {/* Product details without thumbnail for maximum text readability */}
                      <div className="min-w-0 flex-1 pr-1 text-left">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-medium leading-none mb-1">
                          Pinned in Stream
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2" title={featured.name}>
                          {featured.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 leading-none">
                            R {featured.priceZAR.toLocaleString()}
                          </span>
                          <span className="text-slate-500 text-[10px] leading-none">•</span>
                          {isSoldOut ? (
                            <span className="text-[10px] sm:text-[11px] font-semibold text-rose-400 leading-none">
                              Sold out
                            </span>
                          ) : featured.stock <= 5 ? (
                            <span className="text-[10px] sm:text-[11px] font-semibold text-amber-400 leading-none">
                              Only {featured.stock} left
                            </span>
                          ) : (
                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-none">
                              {featured.stock} in stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-stretch gap-1.5 shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                        {/* Confirmation Toast: compact, dark charcoal, electric blue accent, directly above action buttons */}
                        {toastSessionId === session.id && (
                          <div 
                            key={toastKey}
                            role="status"
                            aria-live="polite"
                            className="absolute bottom-full mb-2 right-0 z-50 pointer-events-none select-none animate-fade-in"
                          >
                            <div className="bg-[#171A21] border border-[#19BFFF]/50 text-white px-3 py-1.5 rounded-xl shadow-2xl shadow-black/80 flex items-center gap-1.5 backdrop-blur-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#19BFFF] shadow-[0_0_8px_#19BFFF] shrink-0" />
                              <span className="text-[11px] sm:text-xs font-semibold text-white whitespace-nowrap">
                                Added to basket. Keep browsing!
                              </span>
                            </div>
                          </div>
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={(e) => handleQuickAdd(featured, session.id, e)}
                            disabled={isSoldOut}
                            className={`min-h-[42px] px-2.5 sm:px-3 py-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shadow active:scale-95 ${
                              isSoldOut
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                : 'bg-[#181c25] hover:bg-[#202534] text-white border border-[#2e3648]'
                            }`}
                            title={isSoldOut ? 'Sold out' : 'Add to basket'}
                            aria-label={`Add ${featured.name} to basket`}
                          >
                            <Plus className="w-3.5 h-3.5 text-[#19BFFF] shrink-0" />
                            <span className="text-[10px] sm:text-[11px] font-bold leading-tight text-center text-slate-100 whitespace-nowrap">
                              to Basket
                            </span>
                          </button>
                        )}

                        {onBuyNow && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isSoldOut) onBuyNow(featured, 1);
                            }}
                            disabled={isSoldOut}
                            className="min-h-[42px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] shadow-md shadow-[#19BFFF]/20 transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            title="Buy now directly from feed"
                            aria-label={`Buy now ${featured.name}`}
                          >
                            <span>Buy Now</span>
                          </button>
                        )}
                      </div>
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
