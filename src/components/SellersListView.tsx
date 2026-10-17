import React from 'react';
import { Seller, Product, StreamSnippet } from '../types';
import { MapPin, Star, Film, Radio, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SellersListViewProps {
  sellers: Seller[];
  products: Product[];
  snippets?: StreamSnippet[];
  onSelectSeller: (sellerId: string) => void;
  onOpenLiveRoom: (sessionId: string) => void;
}

export const SellersListView: React.FC<SellersListViewProps> = ({
  sellers,
  products,
  snippets,
  onSelectSeller,
  onOpenLiveRoom
}) => {
  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          South African Makers & Ateliers
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Discover verified independent workshops from Cape Town fynbos botanicals to Karoo leather craftsmen and Johannesburg sneaker designers.
        </p>
      </div>

      {/* Sellers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sellers.map((seller) => {
          const sellerProductCount = products.filter(p => p.sellerId === seller.id).length;

          return (
            <div
              key={seller.id}
              onClick={() => onSelectSeller(seller.id)}
              className="bg-[#14171f] rounded-2xl border border-[#212633] overflow-hidden hover:border-[#0066ff]/60 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
            >
              {/* Banner with live badge */}
              <div className="relative h-32 sm:h-36 bg-black overflow-hidden">
                <img
                  src={seller.bannerImage}
                  alt={seller.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14171f] via-transparent to-black/30" />

                {seller.currentLiveSessionId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLiveRoom(seller.currentLiveSessionId!);
                    }}
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    <span>Live Now</span>
                  </button>
                )}
              </div>

              {/* Info Body */}
              <div className="p-5 -mt-10 relative flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-[#14171f] shadow-xl bg-black"
                    />
                    <div className="text-right">
                      <span className="text-xs text-amber-400 font-bold flex items-center gap-1 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {seller.rating}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {seller.salesCount}+ orders
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-white text-base group-hover:text-[#0066ff] transition-colors">
                        {seller.name}
                      </h3>
                      {seller.verifiedArtisan && (
                        <CheckCircle2 className="w-4 h-4 text-[#0066ff] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      <span>{seller.city}, {seller.province}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {seller.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#212633] flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Film className="w-3.5 h-3.5 text-[#0066ff]" />
                      {(snippets ? snippets.filter(s => s.sellerId === seller.id && !s.isArchived && new Date(s.expiresAt).getTime() > Date.now()) : seller.snippets.filter(s => !s.isArchived && new Date(s.expiresAt).getTime() > Date.now())).length} active clips
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[11px] font-mono text-slate-300">
                      {sellerProductCount} products
                    </span>
                  </div>

                  <span className="text-[#0066ff] font-bold text-xs flex items-center gap-1">
                    View Store <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
