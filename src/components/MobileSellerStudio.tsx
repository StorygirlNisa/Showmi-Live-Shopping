import React, { useState } from 'react';
import { Radio, Package, Sparkles, Film, Trash2, Edit3, X, RefreshCw } from 'lucide-react';
import { Seller, Product, StreamSnippet } from '../types';

interface MobileSellerStudioProps {
  seller: Seller;
  products: Product[];
  snippets: StreamSnippet[];
  onOpenLiveHostMode: (sessionId: string) => void;
  onUpdateProduct: (product: Product) => void;
  onArchiveSnippet: (snippetId: string) => void;
}

export const MobileSellerStudio: React.FC<MobileSellerStudioProps> = ({ 
  seller, products, snippets, onOpenLiveHostMode, onUpdateProduct, onArchiveSnippet 
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'snippets' | 'inventory'>('ai');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-2">
          <img src={seller.avatar} alt="Seller Profile" className="w-10 h-10 rounded-full object-cover" />
          <h2 className="text-lg font-bold text-white">Seller Studio</h2>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-[#14171f] p-1 rounded-xl">
        <button onClick={() => setActiveTab('ai')} className={`py-2 rounded-lg text-xs font-bold ${activeTab === 'ai' ? 'bg-[#0066ff] text-white' : 'text-slate-400'}`}>AI Assistant</button>
        <button onClick={() => setActiveTab('snippets')} className={`py-2 rounded-lg text-xs font-bold ${activeTab === 'snippets' ? 'bg-[#0066ff] text-white' : 'text-slate-400'}`}>Snippets</button>
        <button onClick={() => setActiveTab('inventory')} className={`py-2 rounded-lg text-xs font-bold ${activeTab === 'inventory' ? 'bg-[#0066ff] text-white' : 'text-slate-400'}`}>Inventory</button>
      </div>

      {/* Tab Content */}
      {activeTab === 'ai' && (
        <div className="p-4 bg-[#14171f] rounded-2xl border border-[#212633] space-y-4">
            <h3 className="text-sm font-bold text-white">AI Selling Assistant</h3>
            <button className="w-full py-3 rounded-xl bg-[#0066ff] text-white text-xs font-bold">Generate Selling Prompts</button>
        </div>
      )}
      {activeTab === 'snippets' && (
        <div className="space-y-3">
            {snippets.map(s => (
                <div key={s.id} className="p-4 bg-[#14171f] rounded-2xl border border-[#212633] flex items-center justify-between">
                    <span className="text-xs text-white">{s.title}</span>
                    <button onClick={() => onArchiveSnippet(s.id)} className="text-slate-400"><Trash2 className="w-4 h-4" /></button>
                </div>
            ))}
        </div>
      )}
      {activeTab === 'inventory' && (
        <div className="space-y-3">
            {products.map(p => (
                <div key={p.id} className="p-4 bg-[#14171f] rounded-2xl border border-[#212633] flex items-center gap-3">
                    <img src={p.images[0]} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-white">{p.name}</h4>
                        <p className="text-[10px] text-slate-400">Stock: {p.stock} | R {p.priceZAR}</p>
                    </div>
                    <button className="text-slate-400"><Edit3 className="w-4 h-4" /></button>
                </div>
            ))}
        </div>
      )}
      
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
    </div>
  );
};
