import React, { useState } from 'react';
import { X, Sparkles, Store, Check, ShieldCheck } from 'lucide-react';
import { Seller } from '../types';

interface SellerSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellers: Seller[];
  onSignInAsSeller: (sellerId: string) => void;
}

export const SellerSignInModal: React.FC<SellerSignInModalProps> = ({
  isOpen,
  onClose,
  sellers,
  onSignInAsSeller
}) => {
  const [selectedSellerId, setSelectedSellerId] = useState<string>(sellers[0]?.id || '');

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSellerId) return;
    onSignInAsSeller(selectedSellerId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#14171f] border border-[#212633] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#212633]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0066ff] flex items-center justify-center text-white shadow-lg shadow-[#0066ff]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                SA Seller Studio Sign-In
              </h2>
              <p className="text-xs text-slate-400">Manage live streams, inventory & AI sales coach</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2330] hover:bg-[#283042] text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form / Account Selector */}
        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Select Your Maker Workshop / Atelier:
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {sellers.map(seller => {
                const isSelected = selectedSellerId === seller.id;
                return (
                  <div
                    key={seller.id}
                    onClick={() => setSelectedSellerId(seller.id)}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#0066ff]/10 border-[#0066ff] text-white shadow-md'
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
                      <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#212633] text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
            <span>Authenticated session grants full access to SA Seller Studio, AI Sales Coach, and inventory controls.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-lg shadow-[#0066ff]/30 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Access Seller Studio</span>
          </button>
        </form>

      </div>
    </div>
  );
};
