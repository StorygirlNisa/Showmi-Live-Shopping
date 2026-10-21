import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Send, 
  ShoppingBag, 
  Users, 
  Volume2, 
  VolumeX, 
  Share2, 
  Check, 
  Info,
  X,
  Plus
} from 'lucide-react';
import { LiveSession, Product, Seller, LiveComment } from '../types';

interface LiveRoomViewProps {
  session: LiveSession;
  products: Product[];
  seller?: Seller;
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  onViewSeller: (sellerId: string) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onSwitchSession: (sessionId: string) => void;
  allLiveSessions: LiveSession[];
  onOpenHostMode?: (sessionId: string) => void;
}

interface FloatingHeart {
  id: string;
  x: number;
  size: number;
  color: string;
  isGradient?: boolean;
}

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
  onOpenHostMode
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [viewerCount, setViewerCount] = useState(session.viewerCount);
  const [comments, setComments] = useState<LiveComment[]>(session.initialComments);
  const [commentInput, setCommentInput] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [heartCount, setHeartCount] = useState(842);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const nextHeartId = useRef(0);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const featuredProduct = products.find(p => p.id === session.featuredProductId) || products[0];

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
    if (!onAddToCart || product.stock <= 0 || addedProductId === product.id) return;
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const handleShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#0D1018] flex items-center justify-center md:py-6 md:px-4">
      {/* Desktop portrait container / Mobile & Tablet full-viewport container */}
      <div className="relative w-full h-[100dvh] md:h-[86vh] md:max-h-[820px] md:max-w-[420px] md:rounded-3xl overflow-x-hidden overflow-y-visible bg-black md:border md:border-[#242936] md:shadow-2xl flex flex-col justify-between selection:bg-[#19BFFF] selection:text-[#0D1018]">
        
        {/* Livestream Video / Cover */}
        {session.videoUrl && !videoError ? (
          <video
            src={session.videoUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
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

        {/* Floating Copied Toast */}
        {copiedLink && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#19BFFF] text-[#0D1018] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg">
            Stream link copied!
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
          <div className="absolute right-3 bottom-44 md:bottom-36 z-30 flex flex-col items-center gap-3">
            {/* 1. Profile: Host / Seller Showroom Profile */}
            <button
              onClick={() => {
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

            {/* 3. Product Information Details Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(session.featuredProductId);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-transform"
              aria-label="Inspect featured product"
              title="Product Information"
            >
              <div className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors">
                <Info className="w-5 h-5 text-[#19BFFF]" />
              </div>
            </button>

            {/* 4. Share Button */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-transform"
              title="Share livestream"
              aria-label="Share livestream"
            >
              <div className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors">
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

        {/* Bottom Section: Live Chat Preview + Featured Product Card & Shopping Actions */}
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

          {/* Featured Product Card with "Add to Basket" & "Buy Now" Actions */}
          {featuredProduct && (
            <div className="bg-[#171A21]/95 backdrop-blur-md border border-[#242936] rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-2xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={featuredProduct.images[0]}
                  alt={featuredProduct.name}
                  className="w-12 h-12 rounded-xl object-cover bg-black shrink-0 border border-white/10"
                />
                <div className="min-w-0 text-left">
                  <h4 className="text-xs font-bold text-white truncate leading-tight font-heading">
                    {featuredProduct.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-[#19BFFF] font-mono tabular-nums">
                      R {featuredProduct.priceZAR.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      · {session.sellerName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shopping Buttons: Add Item & Buy Now */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Add to Basket Action */}
                <button
                  onClick={(e) => handleQuickAdd(featuredProduct, e)}
                  disabled={featuredProduct.stock <= 0}
                  className="px-2.5 py-2 rounded-xl bg-[#20242E] hover:bg-[#28303F] text-white text-xs font-semibold border border-[#242936] flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50 pointer-events-auto"
                  title="Add to basket"
                  aria-label="Add product to basket"
                >
                  {addedProductId === featuredProduct.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px] font-bold">Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Add</span>
                    </>
                  )}
                </button>

                {/* Buy Now Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuyNow(featuredProduct);
                  }}
                  disabled={featuredProduct.stock <= 0}
                  className="px-3.5 py-2 rounded-xl bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#19BFFF]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50 pointer-events-auto"
                  aria-label={`Buy Now for R ${featuredProduct.priceZAR.toLocaleString()}`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Buy Now</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
