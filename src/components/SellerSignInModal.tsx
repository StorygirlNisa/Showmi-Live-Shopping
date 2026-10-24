import React, { useState } from 'react';
import { X, Sparkles, Store, Check, ShieldCheck, UserCheck } from 'lucide-react';
import { Seller } from '../types';

interface SellerSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellers: Seller[];
  onSignInAsSeller: (sellerId: string) => void;
  userRole?: 'buyer' | 'seller' | 'admin';
  currentUser?: any | null;
  onApplySeller?: () => void;
}

export const SellerSignInModal: React.FC<SellerSignInModalProps> = ({
  isOpen,
  onClose,
  sellers,
  onSignInAsSeller,
  userRole = 'buyer',
  currentUser = null,
  onApplySeller
}) => {
  const [selectedSellerId, setSelectedSellerId] = useState<string>(sellers[0]?.id || '');
  const [workshopName, setWorkshopName] = useState('');
  const [category, setCategory] = useState('Artisan Crafts & Ceramics');

  if (!isOpen) return null;

  const isApprovedSeller = userRole === 'seller' || userRole === 'admin';

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSellerId) return;
    onSignInAsSeller(selectedSellerId);
    onClose();
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (onApplySeller) {
      onApplySeller();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-4">
      <div className="bg-[#14171f] border border-[#212633] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-fade-in max-h-[85dvh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#212633] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#19BFFF]/10 border border-[#19BFFF]/30 flex items-center justify-center text-[#19BFFF] shadow-lg shadow-[#19BFFF]/20 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isApprovedSeller ? 'SA Seller Studio' : 'Become a Showpreneur'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {isApprovedSeller ? 'Manage live streams, inventory & AI sales coach' : 'Apply for local maker & seller authorization'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2330] hover:bg-[#283042] text-slate-300 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pt-3 sm:pt-4 pr-1 space-y-4">
          {!isApprovedSeller ? (
            /* Buyer Seller Application Prompt */
            <form onSubmit={handleApply} className="space-y-3.5">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0c0e12] border border-[#212633] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#19BFFF]">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Seller Authorization Required</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Seller Studio is reserved for verified South African Showpreneurs and local makers. To host LIVE streams, manage products, view sales analytics, and access AI Sales Coaching, your account must hold approved seller authorization.
                </p>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Workshop / Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Karoo Leather Atelier"
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    className="w-full bg-[#0c0e12] border border-[#212633] focus:border-[#19BFFF] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Primary Craft / Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0c0e12] border border-[#212633] focus:border-[#19BFFF] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Artisan Crafts & Ceramics">Artisan Crafts & Ceramics</option>
                    <option value="Local Fashion & Footwear">Local Fashion & Footwear</option>
                    <option value="Natural Skincare & Botanicals">Natural Skincare & Botanicals</option>
                    <option value="Bakery & Artisanal Foods">Bakery & Artisanal Foods</option>
                    <option value="Jewellery & Accessories">Jewellery & Accessories</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#212633] text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#19BFFF] shrink-0" />
                <span>Your seller application must be reviewed and approved by Showmi before you can access Seller Studio.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] text-xs font-bold tracking-wide transition-all cursor-pointer shadow-lg shadow-[#19BFFF]/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Apply to Become a Seller</span>
              </button>
            </form>
          ) : (
            /* Approved Seller Workshop Selector */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Select Your Active Maker Workshop / Atelier:
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {sellers.map(seller => {
                    const isSelected = selectedSellerId === seller.id;
                    return (
                      <div
                        key={seller.id}
                        onClick={() => setSelectedSellerId(seller.id)}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#19BFFF]/10 border-[#19BFFF] text-white shadow-md'
                            : 'bg-[#0c0e12] border-[#212633] text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={seller.avatar}
                          alt={seller.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover bg-black shrink-0 border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-white truncate">
                            {seller.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {seller.city}, {seller.province} · {seller.tagline}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#19BFFF] text-[#0D1018] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 font-bold" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#212633] text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#19BFFF] shrink-0" />
                <span>Authorized session grants full access to Seller Studio & AI Sales Coach.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] text-xs font-bold tracking-wide transition-all cursor-pointer shadow-lg shadow-[#19BFFF]/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Seller Studio</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
