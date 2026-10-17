import React, { useState } from 'react';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Check, 
  MapPin, 
  Eye, 
  Play, 
  Sparkles,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react';
import { Product, Seller, StreamSnippet } from '../types';
import { ProductDetailDrawer } from './ProductDetailDrawer';

interface DiscoverViewProps {
  products: Product[];
  sellers: Seller[];
  snippets?: StreamSnippet[];
  onSelectProduct: (productId: string) => void;
  onSelectSeller: (sellerId: string) => void;
  onOpenLiveRoom?: (sessionId: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow?: (product: Product, quantity?: number) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  products,
  sellers,
  snippets = [],
  onSelectProduct,
  onSelectSeller,
  onOpenLiveRoom,
  onAddToCart,
  onBuyNow
}) => {
  // Active product for on-demand detail drawer (preserves vertical feed scroll position)
  const [selectedDrawerProduct, setSelectedDrawerProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Likes state per post id
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Construct shoppable vertical video feed posts from snippets and products
  const activeSnippets = snippets.filter(s => !s.isArchived && new Date(s.expiresAt).getTime() > Date.now());
  const allSnippetsToUse = activeSnippets.length > 0 ? activeSnippets : snippets;

  // Map snippets into immersive video feed items
  const feedPosts = allSnippetsToUse.map((snippet, idx) => {
    const linkedProduct = products.find(p => p.id === snippet.productId) || products[idx % products.length];
    const linkedSeller = sellers.find(s => s.id === snippet.sellerId) || sellers.find(s => s.id === linkedProduct?.sellerId) || sellers[0];

    return {
      id: snippet.id,
      title: snippet.title,
      mediaUrl: snippet.thumbnail || linkedProduct?.images[0],
      duration: snippet.duration || '03:30',
      highlightTag: snippet.highlightTag || 'Shoppable Demo',
      views: snippet.views || '4.2k',
      initialLikes: 140 + idx * 85,
      product: linkedProduct,
      seller: linkedSeller
    };
  });

  const handleLikeToggle = (postId: string, initialLikes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [postId]: (prev[postId] || initialLikes) + (isLiked ? -1 : 1)
    }));
  };

  const handleShare = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
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
      
      {/* Toast Notification for Link Copied */}
      {copiedId && (
        <div className="fixed top-20 right-4 z-50 bg-[#0066ff] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl shadow-[#0066ff]/40 flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>Clip link copied to clipboard</span>
        </div>
      )}

      {/* Main Vertically Scrolling Container with CSS Scroll Snapping */}
      {/* Height accounts for sticky navigation on mobile (~150px) and desktop (~112px) */}
      <div 
        className="w-full h-[calc(100vh-154px)] sm:h-[calc(100dvh-154px)] md:h-[calc(100dvh-114px)] overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-none flex flex-col items-center"
        role="feed"
        aria-label="Shoppable Video Feed"
      >
        {feedPosts.map((post) => {
          const isLiked = likedPosts[post.id];
          const currentLikes = likeCounts[post.id] !== undefined ? likeCounts[post.id] : post.initialLikes;
          const isAdded = addedProductId === post.product.id;
          const isSoldOut = post.product.stock <= 0;

          return (
            <article
              key={post.id}
              className="w-full h-[calc(100vh-154px)] sm:h-[calc(100dvh-154px)] md:h-[calc(100dvh-114px)] snap-start snap-always shrink-0 relative overflow-hidden bg-black select-none max-w-md lg:max-w-lg md:rounded-2xl md:my-1.5 md:border md:border-[#212633] shadow-2xl"
            >
              {/* Full-Bleed Media (Video/Image Thumbnail) */}
              <img
                src={post.mediaUrl}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* High-Contrast Gradient Overlay for Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 via-50% to-black/30 pointer-events-none" />

              {/* Top Meta Badges (Essential only) */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#0066ff] text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {post.highlightTag}
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-slate-300 text-[11px] px-2 py-0.5 rounded-md font-mono border border-white/10">
                    {post.duration}
                  </span>
                </div>

                <div className="bg-black/60 backdrop-blur-md text-slate-300 text-[11px] px-2.5 py-0.5 rounded-md font-mono border border-white/10 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-blue-400" />
                  <span>{post.views}</span>
                </div>
              </div>

              {/* Right-Side Floating Action Bar (Thumb-Zone Ergonomics) */}
              <aside className="absolute right-3 bottom-24 sm:bottom-28 z-20 flex flex-col items-center gap-3.5">
                
                {/* Creator Avatar with Follow/Profile Link */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSeller(post.seller.id);
                  }}
                  className="relative group p-0.5 rounded-full bg-gradient-to-tr from-[#0066ff] to-cyan-400 cursor-pointer shadow-lg active:scale-95 transition-transform"
                  title={`View ${post.seller.name}'s atelier`}
                  aria-label={`View ${post.seller.name}'s atelier`}
                >
                  <img
                    src={post.seller.avatar}
                    alt={post.seller.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border-2 border-black"
                  />
                  {post.seller.currentLiveSessionId && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-1 rounded-full uppercase tracking-tighter animate-pulse shadow">
                      Live
                    </span>
                  )}
                </button>

                {/* Like Button */}
                <button
                  onClick={(e) => handleLikeToggle(post.id, post.initialLikes, e)}
                  className="flex flex-col items-center gap-0.5 cursor-pointer group active:scale-90 transition-transform"
                  aria-label={`Like post. Current likes: ${currentLikes}`}
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

                {/* On-Demand Product Detail Drawer Trigger */}
                <button
                  onClick={(e) => openDrawer(post.product, e)}
                  className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform"
                  title="View complete product details"
                  aria-label="View complete product details"
                >
                  <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-[#0066ff] text-white flex items-center justify-center backdrop-blur-md transition-colors">
                    <Info className="w-5 h-5 text-[#60a5fa] hover:text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200 drop-shadow">
                    Details
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={(e) => handleShare(post.id, e)}
                  className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform"
                  title="Share shoppable clip"
                  aria-label="Share shoppable clip"
                >
                  <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200 drop-shadow">
                    Share
                  </span>
                </button>

              </aside>

              {/* Bottom Essential Overlay: Creator, Title & Shoppable Product Pill */}
              <div className="absolute left-3.5 right-16 sm:right-20 bottom-3.5 z-20 space-y-2.5">
                
                {/* Creator Name & Location */}
                <div className="space-y-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSeller(post.seller.id);
                    }}
                    className="flex items-center gap-1.5 text-left group cursor-pointer"
                  >
                    <span className="font-bold text-sm text-white group-hover:text-[#0066ff] transition-colors drop-shadow">
                      {post.seller.name}
                    </span>
                    <span className="text-xs text-slate-300 font-normal drop-shadow">
                      {post.seller.handle}
                    </span>
                  </button>

                  <p className="text-[11px] text-slate-300 flex items-center gap-1 drop-shadow">
                    <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                    <span>{post.seller.city}, {post.seller.province}</span>
                  </p>
                </div>

                {/* Short Title (No long descriptions in feed) */}
                <p className="text-xs sm:text-sm font-medium text-slate-100 line-clamp-2 leading-snug drop-shadow pr-2">
                  {post.title}
                </p>

                {/* Compact Shoppable Product Pill */}
                <div 
                  onClick={(e) => openDrawer(post.product, e)}
                  className="bg-[#12151d]/90 backdrop-blur-md border border-[#212633] hover:border-[#0066ff]/60 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-lg active:scale-[0.99]"
                >
                  {/* Thumbnail & Product Details */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={post.product.images[0]}
                      alt={post.product.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover border border-[#262c3a] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate leading-tight">
                        {post.product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400">
                          R {post.product.priceZAR.toLocaleString()}
                        </span>
                        {isSoldOut ? (
                          <span className="text-[10px] text-red-400 font-semibold">Sold Out</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {post.product.stock} left
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Quick Add or Details Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handleQuickAdd(post.product, e)}
                      disabled={isSoldOut}
                      className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow ${
                        isSoldOut
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#0066ff] hover:bg-[#0052cc] text-white active:scale-95'
                      }`}
                      title={isSoldOut ? 'Sold out' : 'Quick add to basket'}
                      aria-label="Add product to basket"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isSoldOut ? 'Out' : 'Shop'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </article>
          );
        })}
      </div>

      {/* On-Demand Product Detail Drawer / Bottom Sheet */}
      <ProductDetailDrawer
        product={selectedDrawerProduct}
        seller={sellers.find(s => s.id === selectedDrawerProduct?.sellerId)}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddToCart={onAddToCart}
        onBuyNow={(prod, qty) => {
          if (onBuyNow) {
            onBuyNow(prod, qty);
          } else {
            onAddToCart(prod, qty);
          }
        }}
        onViewSeller={onSelectSeller}
        onOpenLiveRoom={onOpenLiveRoom}
      />

    </div>
  );
};
