import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Star, 
  Check, 
  Radio, 
  MapPin, 
  ChevronRight, 
  Sparkles,
  Share2
} from 'lucide-react';
import { Product, Seller, LiveSession } from '../types';

interface ProductDetailViewProps {
  product: Product;
  seller?: Seller;
  liveSession?: LiveSession;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onViewSeller: (sellerId: string) => void;
  onOpenLiveRoom: (sessionId: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  seller,
  liveSession,
  onBack,
  onAddToCart,
  onBuyNow,
  onViewSeller,
  onOpenLiveRoom
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2000);
  };

  const handleShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-7xl mx-auto">
      
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-[#14171f] text-slate-300 hover:text-white border border-[#212633] text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Prominent Photography & Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0c0e12] border border-[#212633] shadow-lg group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            
            {/* Live stream badge if currently being showcased */}
            {product.liveNowSessionId && liveSession && (
              <div 
                onClick={() => onOpenLiveRoom(liveSession.id)}
                className="absolute top-4 left-4 cursor-pointer bg-red-600/95 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>Featured Live Now in Studio · Watch Demo</span>
              </div>
            )}

            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md text-slate-300 text-xs font-mono border border-white/10">
              South African Origin
            </div>
          </div>

          {/* Thumbnail gallery if multiple images */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none touch-pan-x -mx-2 px-2 sm:mx-0 sm:px-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 active:scale-95 ${
                    selectedImageIndex === idx
                      ? 'border-[#0066ff] scale-102'
                      : 'border-[#212633] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Seller Preview Card inside PDP */}
          {seller && (
            <div 
              onClick={() => onViewSeller(seller.id)}
              className="p-4 rounded-xl bg-[#14171f] border border-[#212633] hover:border-[#0066ff]/50 transition-all cursor-pointer flex items-center justify-between mt-6"
            >
              <div className="flex items-center gap-3">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-[#262c3a]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-white text-sm">{seller.name}</p>
                    {seller.verifiedArtisan && (
                      <span className="text-[10px] bg-[#0066ff]/20 text-[#60a5fa] px-1.5 py-0.2 rounded font-medium">
                        Verified Maker
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-red-400" />
                    {seller.city}, {seller.province}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#0066ff] font-semibold">
                <span>View Storefront</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Product Description & Craftsmanship Details */}
          <div className="p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              About This Handcrafted Piece
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>

            <div className="pt-4 border-t border-[#212633] space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Key Features & Specifications
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#0066ff] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module (Sticky on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-6 sticky top-24 shadow-xl">
            
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0066ff] uppercase tracking-wider">
                  {product.categoryLabel}
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400">({product.reviewCount} reviews)</span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price block */}
            <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#212633] space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                  R {product.priceZAR.toLocaleString()}
                </span>
                {product.originalPriceZAR && (
                  <span className="text-sm text-slate-500 line-through font-mono">
                    R {product.originalPriceZAR.toLocaleString()}
                  </span>
                )}
                {product.originalPriceZAR && (
                  <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-semibold ml-auto">
                    Save R {(product.originalPriceZAR - product.priceZAR).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Inclusive of all South African VAT. Free shipping on orders over R750.
              </p>
            </div>

            {/* Stock & Dispatch Specifications */}
            <div className="space-y-3 p-4 rounded-xl bg-[#10131a] border border-[#212633]">
              
              {/* Stock status */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Availability:</span>
                <span className={`font-semibold flex items-center gap-1.5 ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Out of Stock (0 units available)'}
                </span>
              </div>

              {/* Dispatch time */}
              <div className="flex items-start gap-2.5 text-xs text-slate-300 pt-2 border-t border-[#1c2230]">
                <Clock className="w-4 h-4 text-[#0066ff] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Estimated Dispatch Time</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{product.dispatchTime}</p>
                </div>
              </div>

              {/* Courier partner */}
              <div className="flex items-start gap-2.5 text-xs text-slate-300 pt-2 border-t border-[#1c2230]">
                <Truck className="w-4 h-4 text-[#0066ff] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Nationwide SA Courier</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{product.courierPartner}</p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Quantity</span>
              <div className="flex items-center bg-[#0c0e12] border border-[#212633] rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.stock <= 0}
                  className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#181c25] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-base font-bold active:scale-95"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold font-mono text-white">
                  {product.stock <= 0 ? 0 : quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={product.stock <= 0 || quantity >= product.stock}
                  className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#181c25] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-base font-bold active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className={`w-full min-h-[44px] py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  product.stock <= 0
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : isAddedSuccess
                    ? 'bg-emerald-600 text-white cursor-pointer'
                    : 'bg-[#181c25] hover:bg-[#202532] text-white border border-[#2e3648] cursor-pointer active:scale-98'
                }`}
              >
                {product.stock <= 0 ? (
                  'Out of Stock'
                ) : isAddedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Basket!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#0066ff]" />
                    Add to Basket
                  </>
                )}
              </button>

              <button
                onClick={() => onBuyNow(product, quantity)}
                disabled={product.stock <= 0}
                className={`w-full min-h-[44px] py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  product.stock <= 0
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-[#0066ff]/25 active:scale-[0.99] cursor-pointer'
                }`}
              >
                {product.stock <= 0 ? 'Sold Out' : `Buy Now · R ${(product.priceZAR * quantity).toLocaleString()}`}
              </button>
            </div>

            {/* Live stream cross-promotion banner */}
            {product.liveNowSessionId && liveSession && (
              <div 
                onClick={() => onOpenLiveRoom(liveSession.id)}
                className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 via-[#18151c] to-blue-950/40 border border-red-500/30 flex items-center justify-between cursor-pointer hover:border-red-500/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-white">Live Stream In Progress</p>
                    <p className="text-[11px] text-slate-400">See this item demonstrated live</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#0066ff] flex items-center gap-1">
                  Watch <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            )}

            {/* Trust badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Simulated Payment · Free 14-day SA returns guarantee</span>
            </div>

          </div>
        </div>

      </div>

      {/* Mobile Sticky Bottom Purchase Bar (Thumb-Zone Ergonomics) */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 p-3 bg-[#0c0e12]/95 backdrop-blur-md border-t border-[#212633] flex items-center gap-3">
        <div className="min-w-[85px] shrink-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Price</span>
          <span className="text-base font-bold font-mono text-white">
            R {(product.priceZAR * quantity).toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-transform ${
            product.stock <= 0
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-[#181c25] text-white border border-[#2e3648] active:scale-95'
          }`}
        >
          {product.stock <= 0 ? (
            'Sold Out'
          ) : isAddedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 text-[#0066ff]" />
              <span>Basket</span>
            </>
          )}
        </button>

        <button
          onClick={() => onBuyNow(product, quantity)}
          disabled={product.stock <= 0}
          className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-transform ${
            product.stock <= 0
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-[#0066ff] text-white shadow-[#0066ff]/25 active:scale-95'
          }`}
        >
          <span>{product.stock <= 0 ? 'Unavailable' : 'Buy Now'}</span>
        </button>
      </div>

    </div>
  );
};
