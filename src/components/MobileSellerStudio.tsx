import React, { useState } from 'react';
import { Radio, Package, Sparkles, Film, Trash2, Edit3, X, RefreshCw, Truck, CheckCircle2, Clock, ShieldCheck, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { Seller, Product, StreamSnippet, Order, OrderItem, OrderIssue } from '../types';

interface MobileSellerStudioProps {
  seller: Seller;
  products: Product[];
  snippets: StreamSnippet[];
  orders?: Order[];
  issues?: OrderIssue[];
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
  onRespondToIssue?: (
    issueId: string, 
    response: { message: string; resolutionNote?: string; status?: 'seller_responded' | 'resolved' }
  ) => void;
}

export const MobileSellerStudio: React.FC<MobileSellerStudioProps> = ({ 
  seller, 
  products, 
  snippets, 
  orders = [],
  issues = [],
  onOpenLiveHostMode, 
  onUpdateProduct, 
  onArchiveSnippet,
  onUpdateOrderItemStatus,
  onRespondToIssue
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'stock' | 'orders'>('ai');
  const [trackingWaybills, setTrackingWaybills] = useState<Record<string, string>>({});
  const [issueResponses, setIssueResponses] = useState<Record<string, { message: string; resolutionNote: string }>>({});

  // Filter orders that contain items from this seller
  const sellerOrders = orders.filter(o => 
    o.items.some(item => item.sellerId === seller.id)
  );

  // Filter issues for this seller (enforcing ownership)
  const sellerIssues = issues.filter(issue => issue.sellerId === seller.id);
  const openIssuesCount = sellerIssues.filter(i => i.status !== 'resolved').length;

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

  const handleUpdateIssueResponse = (issueId: string, field: 'message' | 'resolutionNote', value: string) => {
    setIssueResponses(prev => ({
      ...prev,
      [issueId]: {
        message: field === 'message' ? value : (prev[issueId]?.message ?? ''),
        resolutionNote: field === 'resolutionNote' ? value : (prev[issueId]?.resolutionNote ?? '')
      }
    }));
  };

  const handleSendIssueReply = (issue: OrderIssue, markResolved = false) => {
    const input = issueResponses[issue.id];
    const defaultMsg = markResolved
      ? 'Issue reviewed and marked as resolved by artisan.'
      : 'Thank you for reaching out. We are attending to your request.';
    const message = input?.message?.trim() || issue.sellerResponse?.message || defaultMsg;
    const resolutionNote = input?.resolutionNote?.trim() || issue.sellerResponse?.resolutionNote;

    if (onRespondToIssue) {
      onRespondToIssue(issue.id, {
        message,
        resolutionNote: resolutionNote || undefined,
        status: markResolved ? 'resolved' : 'seller_responded'
      });
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
      <div className="grid grid-cols-3 gap-1 bg-[#14171f] p-1 rounded-xl">
        <button onClick={() => setActiveTab('ai')} className={`py-2 rounded-lg text-xs font-bold ${activeTab === 'ai' ? 'bg-[#0066ff] text-white' : 'text-slate-400'}`}>AI</button>
        <button onClick={() => setActiveTab('stock')} className={`py-2 rounded-lg text-xs font-bold ${activeTab === 'stock' ? 'bg-[#0066ff] text-white' : 'text-slate-400'}`}>Stock</button>
        <button onClick={() => setActiveTab('orders')} className={`py-2 rounded-lg text-xs font-bold relative flex items-center justify-center gap-1 ${activeTab === 'orders' ? 'bg-[#0066ff] text-white' : 'text-slate-400'}`}>
          <span>Orders</span>
          {openIssuesCount > 0 ? (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          ) : (
            <span className="text-[10px] text-slate-400">({sellerOrders.length})</span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#14171f] rounded-2xl border border-[#212633] space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0066ff]" />
              AI Sales Assistant
            </h3>
            <p className="text-xs text-slate-400">Manage your livestream prep and product copy right from your phone.</p>
            <button className="w-full py-3 bg-[#1e2330] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2">
              <Radio className="w-4 h-4" />
              Launch Live Host Mode
            </button>
          </div>
          <div className="p-4 bg-[#14171f] rounded-2xl border border-[#212633] space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Quick Actions</h4>
              <button className="w-full py-2.5 bg-[#0066ff] text-white text-xs font-bold rounded-lg">Generate Livestream Script</button>
              <button className="w-full py-2.5 bg-[#1e2330] text-slate-200 text-xs font-bold rounded-lg">Improve Product Copy</button>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
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
              Manage dispatch and respond to customer queries. Items from other sellers in joint orders are hidden.
            </p>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="p-8 text-center bg-[#14171f] rounded-2xl border border-[#212633] space-y-2">
              <Package className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-white">No customer orders yet</p>
            </div>
          ) : (
            sellerOrders.map(order => {
              // Only display this seller's items (enforcing seller ownership)
              const myItems = order.items.filter(item => item.sellerId === seller.id);
              if (myItems.length === 0) return null;

              const orderIssuesForSeller = sellerIssues.filter(i => i.orderId === order.id);

              return (
                <div key={order.id} className="p-4 bg-[#14171f] rounded-2xl border border-[#212633] space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#212633]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0066ff]">{order.id}</span>
                      {orderIssuesForSeller.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                          <span>{orderIssuesForSeller.length} Issue</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{order.city}, {order.province}</span>
                  </div>

                  <div className="space-y-2.5">
                    {myItems.map(item => {
                      const itemIssue = sellerIssues.find(i => i.orderId === order.id && i.productId === item.productId);

                      return (
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

                          {/* Mobile Issue Management Panel */}
                          {itemIssue && (
                            <div className="p-3 bg-[#141720] rounded-xl border border-amber-500/30 space-y-2 mt-2">
                              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-[#212633]">
                                <span className="font-bold text-amber-300 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>{itemIssue.issueTypeLabel}</span>
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#0c0e12] text-slate-300">
                                  {itemIssue.status === 'resolved' ? 'Resolved' : itemIssue.status === 'seller_responded' ? 'Responded' : 'Needs Response'}
                                </span>
                              </div>

                              {itemIssue.isPostReleaseReturn && (
                                <p className="text-[10px] text-amber-200/90 leading-tight">
                                  * Post-release query: refunds must be negotiated directly with buyer.
                                </p>
                              )}

                              <p className="text-[11px] text-slate-300 bg-[#0c0e12] p-2 rounded-lg">
                                "{itemIssue.description}"
                              </p>

                              {itemIssue.sellerResponse && (
                                <div className="p-2 bg-[#0c0e12] rounded-lg border border-blue-500/20 text-[10px] text-slate-300 space-y-1">
                                  <p className="font-bold text-blue-300">Your response: {itemIssue.sellerResponse.message}</p>
                                  {itemIssue.sellerResponse.resolutionNote && (
                                    <p className="text-emerald-300">Note: {itemIssue.sellerResponse.resolutionNote}</p>
                                  )}
                                </div>
                              )}

                              <div className="space-y-1.5 pt-1">
                                <input
                                  type="text"
                                  value={issueResponses[itemIssue.id]?.message ?? itemIssue.sellerResponse?.message ?? ''}
                                  onChange={(e) => handleUpdateIssueResponse(itemIssue.id, 'message', e.target.value)}
                                  placeholder="Message to buyer..."
                                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                                <input
                                  type="text"
                                  value={issueResponses[itemIssue.id]?.resolutionNote ?? itemIssue.sellerResponse?.resolutionNote ?? ''}
                                  onChange={(e) => handleUpdateIssueResponse(itemIssue.id, 'resolutionNote', e.target.value)}
                                  placeholder="Resolution note..."
                                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSendIssueReply(itemIssue, false)}
                                    className="flex-1 py-1.5 bg-[#0066ff] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Reply</span>
                                  </button>
                                  {itemIssue.status !== 'resolved' && (
                                    <button
                                      onClick={() => handleSendIssueReply(itemIssue, true)}
                                      className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Resolve</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
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
