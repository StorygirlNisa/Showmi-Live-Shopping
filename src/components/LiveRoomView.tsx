import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Send, 
  Users, 
  Volume2, 
  VolumeX, 
  Share2, 
  Info,
  X,
  Plus
} from 'lucide-react';
import { LiveSession, Product, Seller, LiveComment } from '../types';
import { ProductDetailDrawer } from './ProductDetailDrawer';

interface LiveRoomViewProps {
  session: LiveSession;
  products: Product[];
  seller?: Seller;
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  onViewSeller: (sellerId: string) => void;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onBuyNow?: (product: Product, quantity?: number) => void;
  onSwitchSession: (sessionId: string) => void;
  allLiveSessions: LiveSession[];
  onOpenHostMode?: (sessionId: string) => void;
  isActive?: boolean;
}

interface FloatingHeart {
  id: string;
  x: number;
  size: number;
  color: string;
  isGradient?: boolean;
}

// Global playback timestamps map to preserve exact playback position across views without restarting
const sessionPlaybackTimes: Record<string, number> = {};

export const LiveRoomView: React.FC<LiveRoomViewProps> = ({
  session,
  products,
  seller,
  onBack,
  onSelectProduct,
  onViewSeller,
  onAddToCart,
  onBuyNow,
  onSwitchSession,
  allLiveSessions,
  onOpenHostMode,
  isActive = true
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [viewerCount, setViewerCount] = useState(session.viewerCount);
  const [comments, setComments] = useState<LiveComment[]>(session.initialComments);
  const [commentInput, setCommentInput] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [heartCount, setHeartCount] = useState(842);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Active Pinned Product & Live Session Product Queue
  const sessionQueueProducts = useMemo(() => {
    const list: Product[] = [];
    const featured = products.find(p => p.id === session.featuredProductId);
    if (featured) list.push(featured);

    (session.additionalProductIds || []).forEach(id => {
      const extra = products.find(p => p.id === id);
      if (extra && !list.some(p => p.id === extra.id)) {
        list.push(extra);
      }
    });

    if (seller) {
      products
        .filter(p => p.sellerId === seller.id && !list.some(item => item.id === p.id))
        .forEach(p => list.push(p));
    }

    return list.length > 0 ? list : products;
  }, [products, session, seller]);

  const [activeProductId, setActiveProductId] = useState<string>(
    session.featuredProductId || products[0]?.id || ''
  );

  // Update active product whenever session's featuredProductId changes
  useEffect(() => {
    if (session.featuredProductId) {
      setActiveProductId(session.featuredProductId);
    }
  }, [session.featuredProductId, session.id]);

  const activePinnedProduct = useMemo(() => {
    return products.find(p => p.id === activeProductId) || 
           products.find(p => p.id === session.featuredProductId) || 
           sessionQueueProducts[0] ||
           products[0];
  }, [products, activeProductId, session.featuredProductId, sessionQueueProducts]);

  const isSoldOut = activePinnedProduct ? activePinnedProduct.stock <= 0 : false;

  // Confirmation Toast & Share State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const toastTimeoutRef = useRef<number | null>(null);

  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const shareTimeoutRef = useRef<number | null>(null);

  // Product Detail Drawer for active pinned product
  const [selectedDrawerProduct, setSelectedDrawerProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSelectedDrawerProduct(product);
    setIsDrawerOpen(true);
  };

  const nextHeartId = useRef(0);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Preserve and restore video playback position so session never restarts when opening/returning from Cart
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isActive) {
      sessionPlaybackTimes[session.id] = video.currentTime;
      video.pause();
    } else {
      const savedTime = sessionPlaybackTimes[session.id];
      if (savedTime && Math.abs(video.currentTime - savedTime) > 0.3) {
        try {
          video.currentTime = savedTime;
        } catch {}
      }
      video.play().catch(err => {
        if (err.name !== 'AbortError') console.error("Playback resume failed", err);
      });
    }
  }, [isActive, session.id]);

  // Restore saved playback time when mounting or switching sessions
  useEffect(() => {
    const video = videoRef.current;
    const savedTime = sessionPlaybackTimes[session.id];
    if (video && savedTime) {
      try {
        video.currentTime = savedTime;
      } catch {}
    }
  }, [session.id]);

  // Cleanup timeouts on unmount and save current playback time
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        sessionPlaybackTimes[session.id] = videoRef.current.currentTime;
      }
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
      if (shareTimeoutRef.current) window.clearTimeout(shareTimeoutRef.current);
    };
  }, [session.id]);

  // Auto-scroll comments to bottom
  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments]);

  // Simulate incoming live viewers & chat messages periodically
  useEffect(() => {
    const automatedComments = [
      { userName: 'Zandi K.', text: 'Does it smell like natural fynbos?' },
      { userName: 'Lungile M.', text: 'The packaging looks so premium! Adding to cart 🇿🇦' },
      { userName: 'Kobus V.', text: 'Can this be shipped via Pargo locker?' },
      { userName: 'Nthabi P.', text: 'Watching live, love your brand!' },
      { userName: 'Sipho B.', text: 'Does it come with the authenticity certificate?' },
      { userName: 'Carla D.', text: 'Ordered! Can’t wait for The Courier Guy delivery.' }
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < automatedComments.length) {
        const item = automatedComments[messageIndex];
        setComments(prev => [
          ...prev,
          {
            id: `auto-${Date.now()}`,
            userName: item.userName,
            text: item.text,
            timestamp: 'Just now'
          }
        ]);
        messageIndex = (messageIndex + 1) % automatedComments.length;
        setViewerCount(v => v + Math.floor(Math.random() * 7) - 3);
      }
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: LiveComment = {
      id: `user-${Date.now()}`,
      userName: 'You (Shopper)',
      text: commentInput.trim(),
      timestamp: 'Just now',
      isCurrentUser: true
    };

    setComments(prev => [...prev, newComment]);
    setCommentInput('');

    setTimeout(() => {
      setComments(prev => [
        ...prev,
        {
          id: `host-reply-${Date.now()}`,
          userName: `${session.sellerName} (Host)`,
          text: `Thanks for asking! That is 100% small-batch crafted in our studio.`,
          timestamp: 'Just now',
          isHost: true
        }
      ]);
    }, 4000);
  };

  // Floating hearts generator on tap & press-and-hold
  const holdIntervalRef = useRef<number | null>(null);

  const spawnHearts = (count = 2) => {
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
        setFloatingHearts(prev => prev.filter(item => item.id !== heartId));
      }, 1600);
    }

    setFloatingHearts(prev => [...prev, ...spawned]);
  };

  const handleLikeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setHeartCount(h => h + 1);
    spawnHearts(2);

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = window.setInterval(() => {
      spawnHearts(1);
    }, 180);
  };

  const handleLikeEnd = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddToCart || product.stock <= 0) return;
    onAddToCart(product);
    setToastVisible(true);
    setToastKey(prev => prev + 1);

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastVisible(false);
      toastTimeoutRef.current = null;
    }, 2000);
  };

  const showShareFeedback = (msg: string) => {
    setShareFeedback(msg);
    if (shareTimeoutRef.current) window.clearTimeout(shareTimeoutRef.current);
    shareTimeoutRef.current = window.setTimeout(() => {
      setShareFeedback(null);
      shareTimeoutRef.current = null;
    }, 2500);
  };

  const handleShare = async (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const shareTitle = `Watch ${session.sellerName} LIVE on Showmi`;
    const shareText = activePinnedProduct 
      ? `Watch ${session.sellerName} live showcasing "${activePinnedProduct.name}" on Showmi!`
      : `Watch ${session.sellerName} live on Showmi!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        showShareFeedback('Stream link shared!');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        showShareFeedback('Live broadcast link copied!');
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showShareFeedback('Live broadcast link copied!');
      }
    } catch {
      showShareFeedback('Sharing unavailable on this device');
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#0D1018] flex items-center justify-center md:py-6 md:px-4">
      {/* Desktop portrait container / Mobile & Tablet full-viewport container */}
      <div className="relative w-full h-[100dvh] md:h-[86vh] md:max-h-[820px] md:max-w-[420px] md:rounded-3xl overflow-x-hidden overflow-y-visible bg-black md:border md:border-[#242936] md:shadow-2xl flex flex-col justify-between selection:bg-[#19BFFF] selection:text-[#0D1018]">
        
        {/* Livestream Video / Cover */}
        {session.videoUrl && !videoError ? (
          <video
            ref={videoRef}
            src={session.videoUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onTimeUpdate={() => {
              if (videoRef.current) {
                sessionPlaybackTimes[session.id] = videoRef.current.currentTime;
              }
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-60'}`}
            onError={() => setVideoError(true)}
          />
        ) : (
          <img
            src={session.coverImage}
            alt={session.title}
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-60'}`}
          />
        )}
        
        {/* Ambient Top and Bottom Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

        {/* DEMO Label - Visible over gradient */}
        <div className="absolute top-16 left-4 z-40 bg-black/40 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[9px] font-bold text-white tracking-wide uppercase pointer-events-none">
          DEMO VIDEO
        </div>

        {/* Top Floating Control Bar */}
        <div className="relative z-30 px-4 pt-3 pb-2 flex items-center justify-between safe-area-top">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
              aria-label="Back to feed"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-bold text-white text-[11px] tracking-wide uppercase">LIVE</span>
              <span className="text-white/60 text-[11px] flex items-center gap-1">
                <Users className="w-3 h-3" />
                {viewerCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 transition-colors cursor-pointer pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsMuted(!isMuted);
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white/70" /> : <Volume2 className="w-4 h-4 text-[#19BFFF]" />}
            </button>
          </div>
        </div>

        {/* Floating Share Feedback Toast */}
        {shareFeedback && (
          <div 
            role="status"
            aria-live="polite"
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#171A21] border border-[#19BFFF]/60 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xl shadow-black/80 flex items-center gap-2 animate-fade-in backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-[#19BFFF] shadow-[0_0_8px_#19BFFF]" />
            <span>{shareFeedback}</span>
          </div>
        )}

        {/* Floating Animated Hearts Layer (Non-blocking: pointer-events-none) */}
        <div className="absolute right-6 bottom-40 w-24 h-72 pointer-events-none overflow-visible z-55 flex items-end justify-center">
          <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
            <defs>
              <linearGradient id="heart-grad-room" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#19BFFF" />
                <stop offset="100%" stopColor="#7A3CFF" />
              </linearGradient>
            </defs>
          </svg>
          {floatingHearts.map((h) => (
            <div
              key={h.id}
              className="absolute animate-float-heart"
              style={{
                right: '8px',
                transform: `translateX(${h.x}px)`,
                bottom: '0px',
                color: h.isGradient ? 'url(#heart-grad-room)' : h.color
              }}
            >
              <Heart
                style={{
                  width: h.size,
                  height: h.size,
                  fill: h.isGradient ? 'url(#heart-grad-room)' : h.color
                }}
                className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              />
            </div>
          ))}
        </div>

        {/* Right-Side Engagement Floating Action Panel: Profile, Like, Product, Share */}
        <div className="absolute right-3 bottom-60 md:bottom-36 z-30 flex flex-col items-center gap-3 pointer-events-auto">
          {/* 1. Profile: Host / Seller Showroom Profile */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onViewSeller && seller) {
                onViewSeller(seller.id);
              }
            }}
            className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-transform group"
            title={`View ${session.sellerName} showroom profile`}
            aria-label={`View ${session.sellerName} showroom profile`}
          >
            <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#19BFFF] to-[#7A3CFF] shadow-lg group-hover:scale-105 transition-transform">
              <img
                src={session.sellerAvatar}
                alt={session.sellerName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-black"
              />
            </div>
          </button>

          {/* 2. Like Button with Counter & Press-and-Hold Support */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setHeartCount(h => h + 1);
                spawnHearts(2);
              }}
              onMouseDown={handleLikeStart}
              onMouseUp={handleLikeEnd}
              onMouseLeave={handleLikeEnd}
              onTouchStart={handleLikeStart}
              onTouchEnd={handleLikeEnd}
              onTouchCancel={handleLikeEnd}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-transform active:scale-125 cursor-pointer shadow-xl group select-none"
              aria-label={`Like livestream. Current likes: ${heartCount}`}
              title="Like (tap or hold)"
            >
              <Heart className="w-5 h-5 text-rose-400 group-hover:scale-110 group-active:text-rose-500 fill-rose-500/30 transition-all" />
            </button>
            <span className="text-[11px] font-mono font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {heartCount}
            </span>
          </div>

          {/* 3. Product Information Details Trigger: opens ProductDetailDrawer for active pinned product */}
          {activePinnedProduct && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openDrawer(activePinnedProduct, e);
              }}
              className="flex flex-col items-center cursor-pointer active:scale-90 transition-transform"
              aria-label={`Product Information for ${activePinnedProduct.name}`}
              title="Product Information"
            >
              <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-[#0066ff] text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/10">
                <Info className="w-5 h-5 text-[#60a5fa] hover:text-white" />
              </div>
            </button>
          )}

          {/* 4. Share Button: with native share & copy-link fallback */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleShare(e);
            }}
            className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform"
            title="Share stream"
            aria-label="Share live stream"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/10">
              <Share2 className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Expandable Stream & Maker Details Overlay */}
        {isDescriptionExpanded && (
          <div className="absolute inset-x-3 bottom-32 z-40 bg-[#171A21]/95 backdrop-blur-md border border-[#242936] rounded-2xl p-4 shadow-2xl text-left space-y-2 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-white font-heading">{session.sellerName}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{session.title}</p>
              </div>
              <button
                onClick={() => setIsDescriptionExpanded(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {seller && (
              <p className="text-[11px] text-slate-400 leading-relaxed border-t border-[#242936] pt-2">
                {seller.bio}
              </p>
            )}
          </div>
        )}

        {/* Bottom Section: Live Chat Preview + Pinned Product Card & Action Buttons */}
        <div className="relative z-30 px-3 pb-20 md:pb-3 space-y-2 safe-area-bottom">
          {/* Scrollable Live Chat Feed (Semi-transparent) */}
          <div
            ref={commentsContainerRef}
            className="h-28 overflow-y-auto space-y-1.5 scrollbar-none pr-12 text-left pointer-events-auto"
          >
            {comments.slice(-5).map((c) => (
              <div
                key={c.id}
                className="inline-block max-w-full px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-sm text-xs text-white border border-white/10"
              >
                <span className={`font-bold mr-1.5 ${c.isHost ? 'text-[#19BFFF]' : c.isCurrentUser ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {c.userName}:
                </span>
                <span className="text-slate-100">{c.text}</span>
              </div>
            ))}
          </div>

          {/* Quick Chat Input */}
          <form onSubmit={handleSendComment} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask the artisan live..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 min-h-[38px] bg-black/50 border border-white/20 rounded-xl px-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#19BFFF]"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="p-2 min-h-[38px] min-w-[38px] rounded-xl bg-[#19BFFF] text-[#0D1018] flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer"
              title="Send comment"
              aria-label="Send comment"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Live Product Queue Switcher (when multiple products are queued) */}
          {sessionQueueProducts.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 px-0.5 pointer-events-auto">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold shrink-0">
                Queue ({sessionQueueProducts.length}):
              </span>
              {sessionQueueProducts.map((p, idx) => {
                const isSelected = p.id === activePinnedProduct?.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveProductId(p.id);
                      session.featuredProductId = p.id;
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#19BFFF] text-[#0D1018] font-bold shadow-sm'
                        : 'bg-black/60 hover:bg-black/80 text-slate-300 border border-white/10'
                    }`}
                    title={`Showcase ${p.name}`}
                    aria-label={`Showcase product ${idx + 1}: ${p.name}`}
                  >
                    #{idx + 1} {p.name.length > 14 ? p.name.slice(0, 14) + '...' : p.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Featured / Active Pinned Product Card in Stream: Identical layout to LIVE feed */}
          {activePinnedProduct && (
            <div className="relative">
              <div 
                onClick={(e) => openDrawer(activePinnedProduct, e)}
                className="bg-[#12151d]/90 backdrop-blur-md border border-[#212633] hover:border-[#19BFFF]/60 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-xl active:scale-[0.99] pointer-events-auto"
              >
                {/* Product details without thumbnail for maximum text readability */}
                <div className="min-w-0 flex-1 pr-1 text-left">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-medium leading-none mb-1">
                    Pinned in Stream
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2" title={activePinnedProduct.name}>
                    {activePinnedProduct.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 leading-none">
                      R {activePinnedProduct.priceZAR.toLocaleString()}
                    </span>
                    <span className="text-slate-500 text-[10px] leading-none">•</span>
                    {isSoldOut ? (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-rose-400 leading-none">
                        Sold out
                      </span>
                    ) : activePinnedProduct.stock <= 5 ? (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-amber-400 leading-none">
                        Only {activePinnedProduct.stock} left
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-none">
                        {activePinnedProduct.stock} in stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons: Identical to LIVE feed */}
                <div className="flex items-stretch gap-1.5 shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                  {/* Confirmation Toast: compact, dark charcoal, electric blue accent, directly above action buttons */}
                  {toastVisible && (
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
                      onClick={(e) => handleQuickAdd(activePinnedProduct, e)}
                      disabled={isSoldOut}
                      className={`min-h-[42px] px-2.5 sm:px-3 py-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shadow active:scale-95 ${
                        isSoldOut
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-[#181c25] hover:bg-[#202534] text-white border border-[#2e3648]'
                      }`}
                      title={isSoldOut ? 'Sold out' : 'Add to basket'}
                      aria-label={`Add ${activePinnedProduct.name} to basket`}
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
                        if (!isSoldOut) onBuyNow(activePinnedProduct);
                      }}
                      disabled={isSoldOut}
                      className="min-h-[42px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] shadow-md shadow-[#19BFFF]/20 transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      title="Buy now directly from feed"
                      aria-label={`Buy now ${activePinnedProduct.name}`}
                    >
                      <span>Buy Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Product Detail Drawer for Active Pinned Product: Reusing existing drawer component */}
      <ProductDetailDrawer
        product={selectedDrawerProduct}
        seller={seller}
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
        onViewSeller={onViewSeller}
      />

    </div>
  );
};
