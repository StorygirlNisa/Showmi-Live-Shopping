import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Check, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  Plus, 
  Minus, 
  Radio, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Product, Seller } from '../types';

interface ProductDetailDrawerProps {
  product: Product | null;
  seller?: Seller;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onViewSeller?: (sellerId: string) => void;
  onOpenLiveRoom?: (sessionId: string) => void;
}

export const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({
  product,
  seller,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onViewSeller,
  onOpenLiveRoom
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    if (product.stock <= 0 || isAddedSuccess) return;
    onAddToCart(product, quantity);
    setIsAddedSuccess(true);
    setTimeout(() => {
      setIsAddedSuccess(false);
    }, 1500);
  };

  const handleBuy = () => {
    if (product.stock <= 0) return;
    onBuyNow(product, quantity);
    onClose();
  };

  const isSoldOut = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
      {/* Dimmed Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Drawer Container (Mobile Bottom Sheet / Desktop Modal) */}
      <div className="relative z-50 w-full md:max-w-xl max-h-[calc(88vh-68px)] md:max-h-[90vh] bg-[#12151d] border-t md:border border-[#212633] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up mb-[calc(68px+env(safe-area-inset-bottom,0px))] md:mb-0">
        
        {/* Drawer Header with Drag Handle & Close */}
        <div className="p-4 sm:p-5 border-b border-[#212633] flex items-center justify-between gap-3 bg-[#14171f] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0066ff]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Product Details
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 -mr-1 rounded-full text-slate-400 hover:text-white hover:bg-[#202534] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Close details"
            aria-label="Close product details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Product Media Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black border border-[#212633]">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                {isSoldOut ? (
                  <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                    Sold Out
                  </span>
                ) : isLowStock ? (
                  <span className="bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                    Only {product.stock} units left
                  </span>
                ) : (
                  <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                    {product.stock} units in stock
                  </span>
                )}
              </div>

              {/* Category */}
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-slate-200 text-xs px-2.5 py-1 rounded-md border border-white/10 font-mono">
                {product.categoryLabel}
              </div>
            </div>

            {/* Thumbnail Strip if multiple images */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx ? 'border-[#0066ff] ring-2 ring-[#0066ff]/40' : 'border-[#212633] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Pricing */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold font-mono text-white">
                R {product.priceZAR.toLocaleString()}
              </span>
              {product.originalPriceZAR && (
                <span className="text-sm text-slate-500 line-through font-mono">
                  R {product.originalPriceZAR.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Maker / Workshop Lockup */}
          {seller && (
            <div 
              onClick={() => {
                if (onViewSeller) {
                  onClose();
                  onViewSeller(seller.id);
                }
              }}
              className="p-3.5 rounded-2xl bg-[#181c25] border border-[#262c3a] flex items-center justify-between hover:border-[#0066ff] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover border border-[#212633] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-white truncate group-hover:text-[#0066ff] transition-colors">
                      {seller.name}
                    </p>
                    {seller.verifiedArtisan && (
                      <span className="text-[10px] bg-[#0066ff]/20 text-[#60a5fa] border border-[#0066ff]/30 px-1.5 py-0.2 rounded font-semibold shrink-0">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="truncate">{seller.city}, {seller.province}</span>
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-[#0066ff] flex items-center gap-1 shrink-0 pl-2">
                Visit Showroom <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {/* Full Detailed Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description & Craftsmanship
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Specifications / Highlights */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#212633]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Craft Specifications
              </h3>
              <ul className="space-y-1.5">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066ff] mt-1.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Courier & Guarantee Notice */}
          <div className="p-3.5 rounded-2xl bg-[#0c0e12] border border-[#212633] space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Truck className="w-4 h-4 text-[#0066ff]" />
              <span>Courier Delivery Across All 9 SA Provinces</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dispatches {product.dispatchTime || 'within 24–48 hours'} via {product.courierPartner || 'The Courier Guy / Pargo'}. 
              Payment is held through our payment partner until receipt is confirmed, subject to applicable terms.
            </p>
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 border-t border-[#212633] bg-[#14171f] shrink-0 space-y-3">
          
          {/* Quantity Selector & Price Summary */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Quantity:</span>
              <div className="flex items-center bg-[#0c0e12] border border-[#212633] rounded-xl p-1">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-mono font-bold text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  disabled={quantity >= product.stock || isSoldOut}
                  className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total</span>
              <span className="text-base font-bold font-mono text-white">
                R {(product.priceZAR * quantity).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleAdd}
              disabled={isSoldOut}
              className={`min-h-[46px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSoldOut
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : isAddedSuccess
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-[#181c25] hover:bg-[#202534] text-white border border-[#2e3648] active:scale-95'
              }`}
            >
              {isSoldOut ? (
                'Sold Out'
              ) : isAddedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#0066ff]" />
                  <span>Add to Basket</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuy}
              disabled={isSoldOut}
              className={`min-h-[46px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                isSoldOut
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-[#0066ff]/25 active:scale-95'
              }`}
            >
              <span>Buy Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
