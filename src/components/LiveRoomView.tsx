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
    <div className="relative w-screen h-screen bg-black overflow-hidden selection:bg-[#0066ff] selection:text-white">
      
      {/* Immersive Full-Screen Video */}
      <img
        src={session.coverImage}
        alt={session.title}
        referrerPolicy="no-referrer"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-60'}`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
            <button className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white border border-white/20" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>
            <button className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white border border-white/20" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Right-side engagement panel */}
      <div className="absolute right-3 bottom-32 z-30 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
            <button onClick={handleHeartClick} className="p-3 rounded-full bg-black/30 backdrop-blur-md text-white">
                <Heart className="w-7 h-7" />
            </button>
            <span className="text-xs font-bold text-white">{heartCount}</span>
        </div>
        <button onClick={() => setIsDescriptionExpanded(true)} className="p-3 rounded-full bg-black/30 backdrop-blur-md text-white">
            <Info className="w-7 h-7" />
        </button>
        <button onClick={handleShare} className="p-3 rounded-full bg-black/30 backdrop-blur-md text-white">
            <Share2 className="w-7 h-7" />
        </button>
        <button onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-full bg-black/30 backdrop-blur-md text-white">
            {isMuted ? <VolumeX className="w-7 h-7"/> : <Volume2 className="w-7 h-7" />}
        </button>
      </div>

      {/* Bottom overlay: Buy button & Showroom Info */}
      <div className="absolute bottom-24 left-4 right-20 z-30 space-y-2">
        <h3 className="text-white font-bold text-lg">{session.sellerName}</h3>
        <p className="text-white text-sm line-clamp-2">{session.title}</p>
        {featuredProduct && (
          <button
            onClick={() => onBuyNow(featuredProduct)}
            className="bg-[#0066ff] text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-2xl shadow-[#0066ff]/50 flex items-center justify-center gap-2 w-full"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Buy Now · R {featuredProduct.priceZAR.toLocaleString()}</span>
          </button>
        )}
      </div>

    </div>
  );
};
