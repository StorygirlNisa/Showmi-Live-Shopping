import React, { useState } from 'react';
import { Radio, Package, Sparkles, Film, Trash2, Edit3, X, RefreshCw, Truck, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { Seller, Product, StreamSnippet, Order, OrderItem } from '../types';

interface MobileSellerStudioProps {
  seller: Seller;
  products: Product[];
  snippets: StreamSnippet[];
  orders?: Order[];
  onOpenLiveHostMode: (sessionId: string) => void;
  onUpdateProduct: (product: Product) => void;
  onArchiveSnippet: (snippetId: string) => void;
  onUpdateOrderItemStatus?: (
    orderId: string, 
    productId: string, 
    sellerId: string, 
    newStatus: OrderItem['status'], 
    tracking?: { courierPartner?: string; trackingNumber?: string }
  ) => void;
}

export const MobileSellerStudio: React.FC<MobileSellerStudioProps> = ({ 
  seller, 
  products, 
  snippets, 
  orders = [],
  onOpenLiveHostMode, 
  onUpdateProduct, 
  onArchiveSnippet,
  onUpdateOrderItemStatus 
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'snippets' | 'inventory' | 'orders'>('ai');
  const [trackingWaybills, setTrackingWaybills] = useState<Record<string, string>>({});

  // Filter orders that contain items from this seller
  const sellerOrders = orders.filter(o => 
    o.items.some(item => item.sellerId === seller.id)
  );

  const handleDispatchItem = (orderId: string, productId: string) => {
    const customTracking = trackingWaybills[`${orderId}_${productId}`] || `TCG-ZA-${Math.floor(10000000 + Math.random() * 90000000)}`;
    if (onUpdateOrderItemStatus) {
      onUpdateOrderItemStatus(orderId, productId, seller.id, 'in_transit', {
        courierPartner: 'The Courier Guy',
        trackingNumber: customTracking
      });
    }
  };

  const handleDeliverItem = (orderId: string, productId: string) => {
    if (onUpdateOrderItemStatus) {
      onUpdateOrderItemStatus(orderId, productId, seller.id, 'delivered');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-3">
          <img src={seller.avatar} alt="Seller Profile" className="w-10 h-10 rounded-full object-cover border border-[#212633]" />
          <div>
            <h2 className="text-base font-bold text-white leading-tight">Seller Studio</h2>
            <p className="text-[11px] text-slate-400">{seller.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-[#14171f] p-1 rounded-xl">
        <button onClick={() => setActiveTab('ai')} className={`py-2 rounded-lg text-[11px] font-bold ${activeTab === 'ai' ? 'bg-[#0066ff] text-white' : 'text-slate-400'}`}>AI</button>
        <button onClick={() => setActiveTab('snippets')} className={`py-2 rounded-lg text-[11px] font-bold ${activeTab === 'snippets' ? 'bg-[#0066ff] text-white' : 'text-slate-400'}`}>Clips</button>
        <button onClick={() => setActiveTab('inventory')} className={`py-2 rounded-lg text-[11px] font-bold ${activeTab === 'inventory' ? 'bg-[#0066ff] text-white' : 'text-slate-400'}`}>Stock</button>
        <button onClick={() => setActiveTab('orders')} className={`py-2 rounded-lg text-[11px] font-bold relative ${activeTab === 'orders' ? 'bg-[#0066ff] text-white' : 'text-slate-400'}`}>
          Orders ({sellerOrders.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'ai' && (
        <div className="p-4 bg-[#14171f] rounded-2xl border border-[#212633] space-y-4">
          <h3 className="text-sm font-bold text-white">AI Selling Assistant</h3>
          <p className="text-xs text-slate-400">Launch live host mode or manage catalog descriptions with Gemini AI.</p>
        </div>
      )}

      {activeTab === 'snippets' && (
        <div className="space-y-3">
          {snippets.map(s => (
            <div key={s.id} className="p-4 bg-[#14171f] rounded-2xl border border-[#212633] flex items-center justify-between">
              <span className="text-xs text-white truncate max-w-[200px]">{s.title}</span>
              <button onClick={() => onArchiveSnippet(s.id)} className="text-slate-400 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="p-3 bg-[#14171f] rounded-2xl border border-[#212633] flex items-center gap-3">
              <img src={p.images[0]} className="w-12 h-12 rounded-lg object-cover bg-black" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono">Stock: {p.stock} | R {p.priceZAR.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-3">
          <div className="p-3 bg-[#141720] rounded-2xl border border-[#212633] text-xs space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#0066ff]" />
              Artisan Fulfilment & Dispatch
            </span>
            <p className="text-[11px] text-slate-400">
              Manage dispatch for items from your workshop. Other artisan items in multi-seller orders are hidden for privacy.
            </p>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="p-8 text-center bg-[#14171f] rounded-2xl border border-[#212633] space-y-2">
              <Package className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-white">No customer orders yet</p>
            </div>
          ) : (
            sellerOrders.map(order => {
              // Only display this seller's items
              const myItems = order.items.filter(item => item.sellerId === seller.id);
              if (myItems.length === 0) return null;

              return (
                <div key={order.id} className="p-4 bg-[#14171f] rounded-2xl border border-[#212633] space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#212633]">
                    <span className="font-mono font-bold text-[#0066ff]">{order.id}</span>
                    <span className="text-[10px] text-slate-400">{order.city}, {order.province}</span>
                  </div>

                  <div className="space-y-2.5">
                    {myItems.map(item => (
                      <div key={item.productId} className="bg-[#0c0e12] p-3 rounded-xl border border-[#212633] space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Qty: {item.quantity} · R {(item.priceZAR * item.quantity).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'confirmed' ? 'bg-emerald-950 text-emerald-300' :
                            item.status === 'delivered' ? 'bg-emerald-950/60 text-emerald-400' :
                            item.status === 'in_transit' ? 'bg-blue-950 text-blue-300' :
                            'bg-amber-950 text-amber-300'
                          }`}>
                            {item.status === 'confirmed' ? 'Receipt Confirmed' :
                             item.status === 'delivered' ? 'Delivered' :
                             item.status === 'in_transit' ? 'In Transit' : 'Awaiting Dispatch'}
                          </span>
                        </div>

                        {item.trackingNumber && (
                          <p className="text-[10px] font-mono text-slate-400">
                            Waybill: <strong className="text-blue-400">{item.trackingNumber}</strong> ({item.courierPartner || 'The Courier Guy'})
                          </p>
                        )}

                        <div className="pt-1 flex gap-2">
                          {item.status === 'awaiting_dispatch' && (
                            <button
                              onClick={() => handleDispatchItem(order.id, item.productId)}
                              className="w-full py-2 bg-[#0066ff] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Mark Dispatched</span>
                            </button>
                          )}
                          {item.status === 'in_transit' && (
                            <button
                              onClick={() => handleDeliverItem(order.id, item.productId)}
                              className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Delivered</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      
      {/* Go Live Control */}
      {seller.currentLiveSessionId && (
        <button
          onClick={() => onOpenLiveHostMode(seller.currentLiveSessionId!)}
          className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Radio className="w-5 h-5" />
          Launch Live Host Mode
        </button>
      )}
    </div>
  );
};
