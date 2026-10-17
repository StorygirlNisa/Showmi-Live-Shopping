import React from 'react';
import { Radio, Package, Sparkles } from 'lucide-react';
import { Seller, Product } from '../types';

interface MobileSellerStudioProps {
  seller: Seller;
  products: Product[];
  onOpenLiveHostMode: (sessionId: string) => void;
  onUpdateProduct: (product: Product) => void;
}

export const MobileSellerStudio: React.FC<MobileSellerStudioProps> = ({ seller, products, onOpenLiveHostMode, onUpdateProduct }) => {
  return (
    <div className="space-y-4">
      {/* Go Live Control */}
      {seller.currentLiveSessionId && (
        <button
          onClick={() => onOpenLiveHostMode(seller.currentLiveSessionId!)}
          className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2"
        >
          <Radio className="w-5 h-5" />
          Launch Live Host Mode
        </button>
      )}

      {/* Featured Products */}
      <div className="p-4 bg-[#14171f] rounded-2xl border border-[#212633] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-[#0066ff]" />
          Products for Live
        </h3>
        {products.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 bg-[#0c0e12] rounded-xl border border-[#212633]">
            <span className="text-xs font-bold text-slate-200">{p.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Stock: {p.stock}</span>
              <button 
                onClick={() => onUpdateProduct({...p, stock: p.stock + 1})}
                className="px-2 py-1 bg-[#1e2330] rounded-lg text-xs text-white"
              >+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
