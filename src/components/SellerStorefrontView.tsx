import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  CheckCircle, 
  Radio, 
  ShoppingBag, 
  Clock, 
  Play, 
  Users, 
  Sparkles, 
  Check, 
  MessageSquare,
  X
} from 'lucide-react';
import { Seller, Product, StreamSnippet } from '../types';

interface SellerStorefrontViewProps {
  seller: Seller;
  products: Product[];
  snippets?: StreamSnippet[];
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  onOpenLiveRoom: (sessionId: string) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onOpenStudio?: (sellerId: string) => void;
}

export const SellerStorefrontView: React.FC<SellerStorefrontViewProps> = ({
  seller,
  products,
  snippets,
  onBack,
  onSelectProduct,
  onOpenLiveRoom,
  onAddToCart,
  onBuyNow,
  onOpenStudio
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(seller.followersCount);
  const [activeSnippet, setActiveSnippet] = useState<StreamSnippet | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const sellerProducts = products.filter(p => p.sellerId === seller.id);

  const toggleFollow = () => {
    setIsFollowing(prev => !prev);
    setFollowers(prev => (isFollowing ? prev - 1 : prev + 1));
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageOpen(false);
      setMessageSent(false);
      setMessageText('');
    }, 2000);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours >= 48) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    if (hours >= 1) {
      return `${hours}h left`;
    }
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${mins}m left`;
  };

  // Only display active, unexpired, non-archived snippets on the public storefront
  const allSellerSnippets = snippets 
    ? snippets.filter(s => s.sellerId === seller.id) 
    : seller.snippets;

  const publicSnippets = allSellerSnippets.filter(s => {
    const notArchived = !s.isArchived;
    const notExpired = new Date(s.expiresAt).getTime() > Date.now();
    return notArchived && notExpired;
  });

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      
      {/* Top back navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Seller Header & Banner */}
      <div className="rounded-2xl overflow-hidden bg-[#14171f] border border-[#212633] shadow-xl">
        {/* Banner Image */}
        <div className="h-44 sm:h-56 relative bg-gradient-to-r from-blue-900 to-slate-900 overflow-hidden">
          <img
            src={seller.bannerImage}
            alt={seller.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14171f] via-transparent to-black/40" />

          {seller.currentLiveSessionId && (
            <button
              onClick={() => onOpenLiveRoom(seller.currentLiveSessionId!)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>Currently Live · Join Stream</span>
            </button>
          )}
        </div>

        {/* Profile Content */}
        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-[#212633]">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <img
                src={seller.avatar}
                alt={seller.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-[#14171f] shadow-2xl bg-black"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {seller.name}
                  </h1>
                  {seller.verifiedArtisan && (
                    <span className="inline-flex items-center gap-1 text-xs bg-[#0066ff]/20 text-[#60a5fa] border border-[#0066ff]/30 px-2 py-0.5 rounded-full font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-[#0066ff]" />
                      Verified Maker
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono">{seller.handle}</p>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{seller.city}, {seller.province} (South Africa)</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              {onOpenStudio && (
                <button
                  onClick={() => onOpenStudio(seller.id)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#181c25] hover:bg-[#202532] text-[#60a5fa] border border-[#0066ff]/40 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0066ff]" />
                  <span>AI Selling Assistant</span>
                </button>
              )}

              <button
                onClick={toggleFollow}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isFollowing
                    ? 'bg-[#1e2430] text-slate-300 border border-[#2e3648]'
                    : 'bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-md shadow-[#0066ff]/20'
                }`}
              >
                {isFollowing ? 'Following' : '+ Follow Maker'}
              </button>

              <button
                onClick={() => setMessageOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#181c25] hover:bg-[#202532] text-slate-300 hover:text-white border border-[#262c3a] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-4 pb-4 border-b border-[#212633] max-w-lg">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Followers</p>
              <p className="text-base font-bold font-mono text-white mt-0.5">
                {followers.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Customer Rating</p>
              <p className="text-base font-bold font-mono text-amber-400 flex items-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400" />
                {seller.rating}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Dispatched Orders</p>
              <p className="text-base font-bold font-mono text-white mt-0.5">
                {seller.salesCount}+
              </p>
            </div>
          </div>

          {/* Bio text */}
          <div className="pt-4 max-w-3xl space-y-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              About the Atelier & Workshop
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {seller.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Temporary Shoppable Snippets Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0066ff]" />
              Shoppable Snippets & Stream Highlights
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Limited-time product demonstrations recorded during live broadcasts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#10131a] border border-[#212633] px-2.5 py-1 rounded-lg text-slate-300 font-mono">
              {publicSnippets.length} active on storefront
            </span>
          </div>
        </div>

        {publicSnippets.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#14171f] border border-[#212633] text-center space-y-2">
            <p className="text-sm font-semibold text-white">No active shoppable snippets right now</p>
            <p className="text-xs text-slate-400">
              Previous snippets have expired or been archived. Visit Seller Studio to publish a new shoppable clip.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicSnippets.map((snippet) => {
              const linkedProd = products.find(p => p.id === snippet.productId);
              const timeLeft = getTimeRemaining(snippet.expiresAt);

              return (
                <div
                  key={snippet.id}
                  onClick={() => setActiveSnippet(snippet)}
                  className="bg-[#14171f] rounded-2xl border border-[#212633] overflow-hidden hover:border-[#0066ff]/60 transition-all cursor-pointer group flex flex-col sm:flex-row shadow-lg"
                >
                  {/* Thumbnail with duration and expiry badge */}
                  <div className="relative aspect-[16/9] sm:w-52 shrink-0 bg-black overflow-hidden">
                    <img
                      src={snippet.thumbnail}
                      alt={snippet.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[#0066ff] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white translate-x-0.5" />
                      </div>
                    </div>

                    <div className="absolute top-2 left-2 bg-[#0c0e12]/85 backdrop-blur-sm text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{timeLeft}</span>
                    </div>

                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {snippet.duration}
                    </div>
                  </div>

                  {/* Snippet Details & Linked Product Summary */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-[#0066ff] font-semibold">{snippet.highlightTag}</span>
                        <span className="font-mono text-[10px] text-slate-400">{snippet.recordedDate}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-[#0066ff] transition-colors line-clamp-2">
                        {snippet.title}
                      </h3>
                    </div>

                    {/* Linked Product Micro-Banner */}
                    {linkedProd && (
                      <div className="p-2 rounded-lg bg-[#0c0e12] border border-[#212633] flex items-center justify-between text-xs">
                        <div className="truncate mr-2">
                          <span className="text-[10px] text-slate-400 block">Featured in Clip:</span>
                          <span className="font-semibold text-white truncate block">{linkedProd.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-white block">R {linkedProd.priceZAR.toLocaleString()}</span>
                          <span className={`text-[10px] ${linkedProd.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {linkedProd.stock > 0 ? `${linkedProd.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-[#212633]">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Users className="w-3 h-3 text-slate-500" />
                        {snippet.views} views
                      </span>
                      <span className="text-[#0066ff] font-semibold text-[11px] flex items-center gap-1">
                        Watch & Shop <Play className="w-3 h-3 fill-[#0066ff]" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Explicit Livestream Activity Disclaimer */}
        <p className="text-[11px] text-slate-500 italic pt-1">
          *Notice: Temporary shoppable snippets do not count towards the seller's official livestream activity requirements or live broadcast hours.
        </p>
      </section>

      {/* Seller Products Catalog */}
      <section className="space-y-4 pt-4 border-t border-[#212633]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Products by {seller.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Available for immediate dispatch from {seller.city}
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {sellerProducts.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellerProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product.id)}
              className="group bg-[#14171f] rounded-2xl border border-[#212633] overflow-hidden hover:border-[#0066ff]/50 transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-[#0c0e12] overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-3 left-3">
                  <span className={`backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded border ${
                    product.stock > 0 
                      ? 'bg-[#0c0e12]/80 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-950/80 text-red-400 border-red-500/30'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    {product.categoryLabel}
                  </span>
                  <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#0066ff] transition-colors">
                    {product.name}
                  </h3>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#212633]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold font-mono text-white">
                      R {product.priceZAR.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#0066ff]" />
                      Dispatch in 24-48h
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    disabled={product.stock <= 0}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      product.stock <= 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : addedProductId === product.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#181c25] hover:bg-[#0066ff] text-slate-200 hover:text-white border border-[#262c3a] hover:border-transparent'
                    }`}
                  >
                    {product.stock <= 0 ? (
                      'Out of Stock'
                    ) : addedProductId === product.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Added to Basket
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add to Basket
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shoppable Stream Snippet Video Player & Purchase Modal */}
      {activeSnippet && (() => {
        const linkedProduct = products.find(p => p.id === activeSnippet.productId);
        const isSnippetExpired = new Date(activeSnippet.expiresAt).getTime() <= Date.now() || !!activeSnippet.isArchived;
        const isOutOfStock = linkedProduct ? linkedProduct.stock <= 0 : true;
        const timeLeft = getTimeRemaining(activeSnippet.expiresAt);

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#14171f] border border-[#212633] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative space-y-0">
              
              {/* Header */}
              <div className="p-4 border-b border-[#212633] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#0066ff] font-bold uppercase tracking-wider">
                      Shoppable Snippet
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isSnippetExpired 
                        ? 'bg-red-950 text-red-400 border border-red-800' 
                        : 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                    }`}>
                      {isSnippetExpired ? 'Offer Expired' : `Expires in ${timeLeft}`}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1 mt-0.5">
                    {activeSnippet.title}
                  </h4>
                </div>
                <button
                  onClick={() => setActiveSnippet(null)}
                  className="w-8 h-8 rounded-full bg-[#1e2330] hover:bg-[#283042] text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Simulated Clip Player */}
              <div className="relative aspect-[16/9] bg-black">
                <img
                  src={activeSnippet.thumbnail}
                  alt={activeSnippet.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#0066ff] flex items-center justify-center shadow-lg animate-pulse">
                    <Play className="w-5 h-5 fill-white translate-x-0.5" />
                  </div>
                  <p className="text-xs font-semibold">Playing Recorded Demonstration ({activeSnippet.duration})</p>
                  <p className="text-[11px] text-slate-300 max-w-sm">
                    {activeSnippet.userDescription || `Recorded in ${seller.city} workshop. Authentic unedited footage.`}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                  <div className="h-full bg-[#0066ff] w-3/5 animate-pulse" />
                </div>
              </div>

              {/* Linked Product Purchase Module */}
              <div className="p-5 bg-[#0e1117] border-t border-[#212633] space-y-4">
                
                {isSnippetExpired ? (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                    <p className="font-bold">This temporary shoppable snippet has expired.</p>
                    <p className="text-[11px] text-red-400 mt-0.5">
                      The time-limited promotional offer is no longer available. You can still browse the seller's standard catalog below.
                    </p>
                  </div>
                ) : linkedProduct ? (
                  <div className="p-3.5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#0066ff] font-bold uppercase tracking-wider">
                        Featured Product in Clip
                      </span>
                      <span className={`font-mono font-semibold ${isOutOfStock ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isOutOfStock ? 'Out of Stock' : `${linkedProduct.stock} units available`}
                      </span>
                    </div>

                    <div 
                      onClick={() => {
                        setActiveSnippet(null);
                        onSelectProduct(linkedProduct.id);
                      }}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <img
                        src={linkedProduct.images[0]}
                        alt={linkedProduct.name}
                        className="w-14 h-14 rounded-xl object-cover border border-[#212633] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#0066ff] transition-colors">
                          {linkedProduct.name}
                        </h5>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-base font-bold font-mono text-white">
                            R {linkedProduct.priceZAR.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            · {linkedProduct.dispatchTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shoppable CTAs */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (!isOutOfStock) {
                            onAddToCart(linkedProduct);
                            setAddedProductId(linkedProduct.id);
                            setTimeout(() => setAddedProductId(null), 1500);
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            : addedProductId === linkedProduct.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#1e2330] hover:bg-[#283042] text-white border border-[#2e3648]'
                        }`}
                      >
                        {isOutOfStock ? (
                          'Out of Stock'
                        ) : addedProductId === linkedProduct.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Added!
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
                          if (!isOutOfStock) {
                            setActiveSnippet(null);
                            if (onBuyNow) {
                              onBuyNow(linkedProduct);
                            } else {
                              onAddToCart(linkedProduct);
                            }
                          }
                        }}
                        disabled={isOutOfStock}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-[#0066ff] hover:bg-[#0052cc] disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white flex items-center justify-center gap-1 shadow-md shadow-[#0066ff]/25 cursor-pointer active:scale-95 transition-transform"
                      >
                        {isOutOfStock ? 'Sold Out' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Published: {new Date(activeSnippet.publishedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setActiveSnippet(null)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#1e2330] hover:bg-[#283042] text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Close Snippet
                  </button>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* Message Seller Modal */}
      {messageOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14171f] border border-[#212633] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#212633]">
              <h3 className="font-bold text-white text-base">Inquire with {seller.name}</h3>
              <button
                onClick={() => setMessageOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1e2330] text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {messageSent ? (
              <div className="py-8 text-center space-y-2 text-emerald-400">
                <CheckCircle className="w-10 h-10 mx-auto" />
                <h4 className="font-bold text-white">Message Sent!</h4>
                <p className="text-xs text-slate-400">
                  {seller.name} responds within 2 business hours during weekday workshop times.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Your Inquiry</label>
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Ask about custom dimensions, leather patina, fynbos ingredients, or delivery options..."
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066ff]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Send Inquiry to Maker
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
