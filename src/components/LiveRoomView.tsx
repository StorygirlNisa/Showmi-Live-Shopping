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
  Radio, 
  Info,
  Truck,
  ShieldCheck,
  Star,
  ChevronDown,
  ChevronUp
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
  const [isPlaying] = useState(true);
  const [viewerCount, setViewerCount] = useState(session.viewerCount);
  const [comments, setComments] = useState<LiveComment[]>(session.initialComments);
  const [commentInput, setCommentInput] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [heartCount, setHeartCount] = useState(842);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  // Default description to collapsed per requirement
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const featuredProduct = products.find(p => p.id === session.featuredProductId) || products[0];

  // Auto-scroll comments to bottom
  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments]);

  // Simulate incoming live viewers & chat messages periodically (no location to protect buyer privacy)
  useEffect(() => {
    const automatedComments = [
      { userName: 'Zandi K.', text: 'Does it smell like natural fynbos?' },
      { userName: 'Lungile M.', text: 'The packaging looks so premium! Adding to cart 🇿🇦' },
      { userName: 'Kobus V.', text: 'Can this be shipped via Pargo locker?' },
      { userName: 'Nthabi P.', text: 'Watching live, love your brand!' },
      { userName: 'Sipho B.', text: 'Does it come with the guarantee certificate?' },
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

  const handleHeartClick = () => {
    setHeartCount(h => h + 1);
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x: Math.floor(Math.random() * 40) - 20,
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
    <div className="min-h-screen bg-[#0c0e12] flex flex-col pb-24 selection:bg-[#0066ff] selection:text-white">
      
      {/* Toast Notification */}
      {copiedLink && (
        <div className="fixed top-20 right-4 z-50 bg-[#0066ff] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>Live room link copied</span>
        </div>
      )}

      {/* Top Floating Control Bar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-[#0c0e12]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 border-b border-[#212633] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#14171f] hover:bg-[#1e2330] text-white flex items-center justify-center border border-[#212633] transition-colors cursor-pointer shrink-0"
            title="Leave Live Room"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div 
            onClick={() => seller && onViewSeller(seller.id)}
            className="flex items-center gap-2 bg-[#14171f] px-3 py-1.5 rounded-full border border-[#212633] cursor-pointer hover:border-[#0066ff]/60 transition-colors"
          >
            <img
              src={session.sellerAvatar}
              alt={session.sellerName}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover border border-[#0066ff] shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {session.sellerName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {session.sellerLocation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#14171f] text-white text-xs px-2.5 py-1 rounded-md border border-[#212633] flex items-center gap-1.5 font-mono">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>{viewerCount.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full bg-[#14171f] hover:bg-[#1e2330] text-white flex items-center justify-center border border-[#212633] transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-[#14171f] hover:bg-[#1e2330] text-white flex items-center justify-center border border-[#212633] transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {onOpenHostMode && (
            <button
              onClick={() => onOpenHostMode(session.id)}
              className="px-3 py-1 rounded-lg bg-[#14171f] hover:bg-[#1c2230] border border-[#212633] text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Host Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* Vertical Content Flow: Video -> Product Details -> Comments */}
      <div className="max-w-3xl w-full mx-auto px-3 sm:px-4 py-4 space-y-6">
        
        {/* 1. Immersive Full-Width Video Area */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[500px] rounded-3xl overflow-hidden bg-black border border-[#212633] shadow-2xl flex items-center justify-center">
          <img
            src={session.coverImage}
            alt={session.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-95' : 'opacity-60'}`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Red LIVE Indicator on the right-hand side of the live video feed */}
          <div className="absolute top-4 right-4 z-20 bg-red-600/95 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl shadow-red-600/40 border border-white/20 select-none">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>LIVE</span>
          </div>

          {/* Floating Buy Now and Add to Cart Controls */}
          {featuredProduct && (
            <div className="absolute bottom-24 right-4 z-20 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(featuredProduct);
                  setAddedProductId(featuredProduct.id);
                  setTimeout(() => setAddedProductId(null), 1500);
                }}
                disabled={featuredProduct.stock <= 0}
                className="w-12 h-12 rounded-full bg-[#14171f]/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-[#1e2330] cursor-pointer active:scale-95 transition-transform"
                aria-label="Add to Basket"
              >
                {addedProductId === featuredProduct.id ? <Check className="w-5 h-5 text-emerald-400" /> : <ShoppingBag className="w-5 h-5" />}
              </button>

              <button
                onClick={(e) => {
                  if (featuredProduct.stock > 0) {
                    onBuyNow(featuredProduct);
                  }
                }}
                disabled={featuredProduct.stock <= 0}
                className="bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-2xl shadow-[#0066ff]/50 flex items-center gap-2 cursor-pointer active:scale-95 transition-transform border border-white/10"
                aria-label="Buy Now featured product"
              >
                <span>Buy Now · R {featuredProduct.priceZAR.toLocaleString()}</span>
              </button>
            </div>
          )}

          {/* Floating Heart Button */}
          <button
            onClick={handleHeartClick}
            className="absolute bottom-4 left-4 z-20 w-11 h-11 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex flex-col items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer"
            title="Send love"
          >
            <Heart className="w-5 h-5 fill-white" />
            <span className="text-[9px] font-mono font-bold leading-none mt-0.5">
              {heartCount}
            </span>
          </button>

          {/* Floating Hearts Animation Canvas */}
          <div className="absolute bottom-16 left-6 pointer-events-none w-16 h-48 overflow-hidden z-20">
            {floatingHearts.map((h) => (
              <div
                key={h.id}
                style={{
                  left: `calc(50% + ${h.x}px)`,
                  color: h.color
                }}
                className="absolute bottom-0 animate-float-heart"
              >
                <Heart className="w-5 h-5 fill-current drop-shadow-md" />
              </div>
            ))}
          </div>
        </div>

        {/* 2. Detailed Product Description Section (Full-width below video) */}
        {featuredProduct && (
          <div className="bg-[#14171f] border border-[#212633] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#0066ff] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured in Stream
                </span>
                <h2 
                  onClick={() => onSelectProduct(featuredProduct.id)}
                  className="text-lg sm:text-xl font-bold text-white hover:text-[#0066ff] transition-colors cursor-pointer"
                >
                  {featuredProduct.name}
                </h2>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{featuredProduct.sellerName} · {featuredProduct.sellerLocation}</span>
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-400">
                  R {featuredProduct.priceZAR.toLocaleString()}
                </div>
                {featuredProduct.originalPriceZAR && (
                  <div className="text-xs text-slate-500 line-through font-mono">
                    R {featuredProduct.originalPriceZAR.toLocaleString()}
                  </div>
                )}
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  {featuredProduct.stock} in stock
                </span>
              </div>
            </div>

            {/* Collapsible Product Description (collapsed by default so live chat is easily accessible) */}
            <div className="space-y-1.5">
              <p className={`text-xs sm:text-sm text-slate-300 leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                {featuredProduct.description}
              </p>
              
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs font-bold text-[#0066ff] hover:text-blue-400 inline-flex items-center gap-1 cursor-pointer transition-colors py-0.5"
                aria-label={isDescriptionExpanded ? "Collapse product description" : "Expand full product description"}
              >
                <span>{isDescriptionExpanded ? 'Show less' : 'More'}</span>
                {isDescriptionExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Extended Features & Courier Info (visible when expanded) */}
            {isDescriptionExpanded && (
              <div className="space-y-3 pt-2 border-t border-[#212633] animate-fade-in">
                {featuredProduct.features && featuredProduct.features.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {featuredProduct.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-[#0066ff] shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dispatch & Courier Info */}
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#1e2433] text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#0066ff]" />
                    <span>{featuredProduct.dispatchTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{featuredProduct.courierPartner}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={(e) => handleQuickAdd(featuredProduct, e)}
                disabled={featuredProduct.stock <= 0}
                className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  featuredProduct.stock <= 0
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : addedProductId === featuredProduct.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#1e2330] hover:bg-[#283042] text-white border border-[#2e3648]'
                }`}
              >
                {addedProductId === featuredProduct.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Basket
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#0066ff]" />
                    Add to Basket
                  </>
                )}
              </button>

              <button
                onClick={() => onBuyNow(featuredProduct)}
                disabled={featuredProduct.stock <= 0}
                className="flex-1 py-3 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#0066ff]/30 transition-colors"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Audience Comments & Chat Section (Directly below product description) */}
        <div className="bg-[#14171f] border border-[#212633] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#212633]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Live Audience Chat</span>
              <span className="text-xs text-slate-400 font-mono font-normal">({comments.length})</span>
            </h3>
            <span className="text-xs text-emerald-400 font-medium">Real-time engagement</span>
          </div>

          {/* Scrollable Comments Container */}
          <div 
            ref={commentsContainerRef}
            className="max-h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin"
          >
            {comments.map((comment) => (
              <div 
                key={comment.id}
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
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
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{comment.timestamp}</span>
                </div>
                <p className="text-white text-xs">{comment.text}</p>
              </div>
            ))}
          </div>

          {/* Comment Input Form */}
          <form onSubmit={handleSendComment} className="flex items-center gap-2 pt-2 border-t border-[#212633]">
            <input
              type="text"
              placeholder="Type your question or comment for the host..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 min-h-[44px] bg-[#0c0e12] border border-[#212633] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066ff]"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

        {/* Other Active Live Streams removed */}
      </div>

    </div>
  );
};
