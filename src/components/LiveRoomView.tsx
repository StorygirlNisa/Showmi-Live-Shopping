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
  Sparkles, 
  Check, 
  MapPin, 
  Eye, 
  Radio, 
  Store,
  ChevronDown,
  Info,
  Maximize2
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
  id: number;
  x: number;
  color: string;
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewerCount, setViewerCount] = useState(session.viewerCount);
  const [comments, setComments] = useState<LiveComment[]>(session.initialComments);
  const [commentInput, setCommentInput] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [heartCount, setHeartCount] = useState(842);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [showProductDrawer, setShowProductDrawer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const featuredProduct = products.find(p => p.id === session.featuredProductId);
  const otherProducts = products.filter(p => session.additionalProductIds.includes(p.id));

  // Auto-scroll comments to bottom
  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments]);

  // Simulate incoming live viewers & chat messages periodically
  useEffect(() => {
    const automatedComments = [
      { userName: 'Zandi K.', location: 'Cape Town', text: 'Does it smell like natural fynbos?' },
      { userName: 'Lungile M.', location: 'Durban', text: 'The packaging looks so premium! Adding to cart 🇿🇦' },
      { userName: 'Kobus V.', location: 'Pretoria', text: 'Can this be shipped via Pargo locker?' },
      { userName: 'Nthabi P.', location: 'Sandton', text: 'Watching live from Joburg, love your brand!' },
      { userName: 'Sipho B.', location: 'Polokwane', text: 'Does it come with the guarantee certificate?' },
      { userName: 'Carla D.', location: 'Stellenbosch', text: 'Ordered! Can’t wait for The Courier Guy delivery.' }
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
            location: item.location,
            text: item.text,
            timestamp: 'Just now'
          }
        ]);
        messageIndex = (messageIndex + 1) % automatedComments.length;
        // Minor viewer flux
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
      location: 'Mzansi',
      text: commentInput.trim(),
      timestamp: 'Just now',
      isCurrentUser: true
    };

    setComments(prev => [...prev, newComment]);
    setCommentInput('');

    // Trigger host response simulation after 4 seconds
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

  const handleHeartClick = () => {
    setHeartCount(h => h + 1);
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x: Math.floor(Math.random() * 40) - 20, // random jitter
      color: Math.random() > 0.5 ? '#0066ff' : '#ef4444'
    };

    setFloatingHearts(prev => [...prev, newHeart]);

    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1800);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const handleShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0c0e12] flex flex-col justify-between relative overflow-hidden pb-16 md:pb-6">
      
      {/* Top Floating Control Bar */}
      <div className="z-30 px-3 sm:px-6 py-3 max-w-7xl w-full mx-auto flex items-center justify-between gap-3">
        
        {/* Back and Seller Lockup */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div 
            onClick={() => seller && onViewSeller(seller.id)}
            className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 cursor-pointer hover:border-[#0066ff]/60 transition-colors"
          >
            <img
              src={session.sellerAvatar}
              alt={session.sellerName}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-[#0066ff]"
            />
            <div className="max-w-[130px] sm:max-w-[180px]">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {session.sellerName}
              </p>
              <p className="text-[10px] text-slate-300 truncate">
                {session.sellerLocation}
              </p>
            </div>
            {seller && (
              <span className="text-[11px] text-[#0066ff] font-bold px-2 py-0.5 rounded-full bg-[#0066ff]/20 hidden sm:inline">
                Store
              </span>
            )}
          </div>
        </div>

        {/* Live Status & Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            LIVE
          </div>

          <div className="bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 font-mono">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>{viewerCount.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute stream' : 'Mute stream'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {onOpenHostMode && (
            <button
              onClick={() => onOpenHostMode(session.id)}
              className="px-2.5 py-1 rounded-md bg-[#161b26] hover:bg-[#1f2737] border border-[#2e374d] text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Host only: Open private seller control panel & AI sales coach"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Host Studio</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Live Stage Layout: Desktop Split / Mobile Immersive */}
      <div className="max-w-7xl w-full mx-auto px-2 sm:px-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch relative">
        
        {/* Stream Video Area (Mobile-First 9:16 Canvas / Responsive Frame) */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden bg-black border border-[#212633] flex items-center justify-center min-h-[480px] sm:min-h-[560px] shadow-2xl">
          
          {/* Main Video Stream Image Simulation */}
          <img
            src={session.coverImage}
            alt={session.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-100 opacity-95' : 'scale-105 opacity-60'}`}
          />

          {/* Gradients for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

          {/* Demonstration Notice Watermark */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-slate-300 text-[11px] px-3 py-1 rounded-md border border-white/10 font-mono flex items-center gap-1.5 pointer-events-none">
            <Info className="w-3.5 h-3.5 text-[#0066ff]" />
            Demonstration Live Broadcast
          </div>

          {/* Studio Audio Equalizer Simulation when unmuted */}
          {!isMuted && (
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/10">
              <span className="text-[10px] text-emerald-400 font-mono">LIVE AUDIO</span>
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-emerald-400 h-2 animate-pulse"></span>
                <span className="w-0.5 bg-emerald-400 h-3 animate-pulse delay-75"></span>
                <span className="w-0.5 bg-emerald-400 h-1.5 animate-pulse delay-150"></span>
              </div>
            </div>
          )}

          {/* Floating Hearts Reaction Canvas */}
          <div className="absolute bottom-24 right-6 pointer-events-none w-16 h-64 overflow-hidden z-20">
            {floatingHearts.map((h) => (
              <div
                key={h.id}
                style={{
                  left: `calc(50% + ${h.x}px)`,
                  color: h.color
                }}
                className="absolute bottom-0 animate-float-heart"
              >
                <Heart className="w-6 h-6 fill-current drop-shadow-md" />
              </div>
            ))}
          </div>

          {/* Mobile Overlay: Live Comments Feed directly over stream */}
          <div className="lg:hidden absolute bottom-28 left-3 right-16 z-20 max-h-48 overflow-y-auto space-y-1.5 scrollbar-none pointer-events-auto">
            {comments.slice(-4).map((c) => (
              <div
                key={c.id}
                className="bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1.5 rounded-xl border border-white/10 max-w-[85%] inline-block"
              >
                <span className={`font-bold mr-1.5 ${c.isHost ? 'text-amber-300' : c.isCurrentUser ? 'text-[#60a5fa]' : 'text-slate-200'}`}>
                  {c.userName}:
                </span>
                <span className="text-slate-100">{c.text}</span>
              </div>
            ))}
          </div>

          {/* Pinned Featured Product Card (On Bottom of Video Area) */}
          {featuredProduct && (
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-20">
              <div className="bg-[#14171f]/95 backdrop-blur-md border border-[#0066ff]/40 rounded-2xl p-3 shadow-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#0066ff] font-bold flex items-center gap-1 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Now Showcasing
                  </span>
                  <span className="text-emerald-400 font-mono font-medium">
                    {featuredProduct.stock} left in stock
                  </span>
                </div>

                <div 
                  onClick={() => onSelectProduct(featuredProduct.id)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={featuredProduct.images[0]}
                    alt={featuredProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-[#212633] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#0066ff] transition-colors">
                      {featuredProduct.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-base font-bold font-mono text-white">
                        R {featuredProduct.priceZAR.toLocaleString()}
                      </span>
                      {featuredProduct.originalPriceZAR && (
                        <span className="text-[11px] text-slate-500 line-through font-mono">
                          R {featuredProduct.originalPriceZAR.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instant Buy and Basket Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={(e) => {
                      if (featuredProduct.stock > 0) {
                        handleQuickAdd(featuredProduct, e);
                      }
                    }}
                    disabled={featuredProduct.stock <= 0}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      featuredProduct.stock <= 0
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : addedProductId === featuredProduct.id
                        ? 'bg-emerald-600 text-white cursor-pointer'
                        : 'bg-[#1e2330] hover:bg-[#283042] text-white border border-[#2e3648] cursor-pointer'
                    }`}
                  >
                    {featuredProduct.stock <= 0 ? (
                      'Out of Stock'
                    ) : addedProductId === featuredProduct.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 text-[#0066ff]" />
                        Add to Basket
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (featuredProduct.stock > 0) {
                        onBuyNow(featuredProduct);
                      }
                    }}
                    disabled={featuredProduct.stock <= 0}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-transform ${
                      featuredProduct.stock <= 0
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-md shadow-[#0066ff]/30 cursor-pointer active:scale-95'
                    }`}
                  >
                    {featuredProduct.stock <= 0 ? 'Sold Out' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right Floating Heart Reaction Button */}
          <button
            onClick={handleHeartClick}
            className="absolute bottom-4 right-4 z-30 w-12 h-12 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex flex-col items-center justify-center shadow-xl shadow-red-600/30 active:scale-90 transition-transform cursor-pointer"
            title="Send love to host"
          >
            <Heart className="w-5 h-5 fill-white" />
            <span className="text-[9px] font-mono font-bold leading-none mt-0.5">
              {heartCount}
            </span>
          </button>

        </div>

        {/* Right Column: Live Chat & Seller Showcase (Visible on Desktop, toggleable on mobile) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col justify-between bg-[#14171f] rounded-3xl border border-[#212633] overflow-hidden min-h-[560px]">
          
          {/* Stream Information Header */}
          <div className="p-4 border-b border-[#212633] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0066ff] uppercase tracking-wider">
                Live Studio Chat
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {comments.length} comments
              </span>
            </div>
            <h3 className="text-sm font-bold text-white line-clamp-1">
              {session.title}
            </h3>
          </div>

          {/* Chat Messages Feed */}
          <div 
            ref={commentsContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[380px]"
          >
            {comments.map((comment) => (
              <div 
                key={comment.id}
                className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                  comment.isHost 
                    ? 'bg-amber-950/40 border border-amber-600/30 text-amber-200' 
                    : comment.isCurrentUser
                    ? 'bg-[#0066ff]/15 border border-[#0066ff]/30 text-slate-200'
                    : 'bg-[#0c0e12] border border-[#212633] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={`font-bold ${
                    comment.isHost ? 'text-amber-400' : comment.isCurrentUser ? 'text-[#60a5fa]' : 'text-slate-400'
                  }`}>
                    {comment.userName}
                    {comment.location && ` (${comment.location})`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{comment.timestamp}</span>
                </div>
                <p className="text-white text-xs">{comment.text}</p>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-[#212633] bg-[#0c0e12]">
            <form onSubmit={handleSendComment} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about size, ingredients, dispatch..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-[#14171f] border border-[#212633] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066ff]"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Other Live Streams Switcher Strip */}
          <div className="p-3 border-t border-[#212633] bg-[#10131a] space-y-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Switch Stream
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {allLiveSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSwitchSession(s.id)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-left shrink-0 transition-colors cursor-pointer ${
                    s.id === session.id
                      ? 'border-[#0066ff] bg-[#0066ff]/10 text-white'
                      : 'border-[#212633] bg-[#14171f] text-slate-400 hover:text-white'
                  }`}
                >
                  <img
                    src={s.sellerAvatar}
                    alt={s.sellerName}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="max-w-[100px]">
                    <p className="text-[11px] font-bold truncate leading-tight">{s.sellerName}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Bottom Chat Input Bar */}
      <div className="lg:hidden px-3 pt-2">
        <form onSubmit={handleSendComment} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Comment in live room..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="flex-1 bg-[#14171f] border border-[#212633] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066ff]"
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
