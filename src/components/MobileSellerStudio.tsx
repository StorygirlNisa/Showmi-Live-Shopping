import React, { useState } from 'react';
import { 
  Radio, 
  Package, 
  Sparkles, 
  RefreshCw, 
  Truck, 
  Check, 
  Copy, 
  Plus, 
  AlertTriangle, 
  MessageSquare, 
  Send,
  FileText,
  ShieldCheck,
  X
} from 'lucide-react';
import { Seller, Product, StreamSnippet, Order, OrderItem, OrderIssue, LiveSession } from '../types';

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

  // AI Generation Props from parent
  onGeneratePrep?: () => Promise<void>;
  onGenerateCopy?: () => Promise<void>;
  isGenerating?: boolean;
  prepResults?: {
    openingHook: string;
    talkingPoints: string;
    demoSteps: string;
    faqQuestions: string;
    streamTimeline: string;
  };
  setPrepResults?: React.Dispatch<React.SetStateAction<{
    openingHook: string;
    talkingPoints: string;
    demoSteps: string;
    faqQuestions: string;
    streamTimeline: string;
  }>>;
  copyResults?: {
    improvedDescription: string;
    socialCaption: string;
    streamTeaser: string;
  };
  setCopyResults?: React.Dispatch<React.SetStateAction<{
    improvedDescription: string;
    socialCaption: string;
    streamTeaser: string;
  }>>;
  selectedProductId?: string;
  onSelectProduct?: (id: string) => void;
  onApplyDescription?: () => void;
  onOpenAddProductModal?: () => void;
  sessionModerators?: Record<string, string[]>;
  liveSessions?: LiveSession[];
  sellers?: Seller[];
  onAppointModerator?: (sessionId: string, sellerId: string) => void;
  onRevokeModerator?: (sessionId: string, sellerId: string) => void;
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
  onRespondToIssue,
  onGeneratePrep,
  onGenerateCopy,
  isGenerating = false,
  prepResults,
  setPrepResults,
  copyResults,
  setCopyResults,
  selectedProductId,
  onSelectProduct,
  onApplyDescription,
  onOpenAddProductModal,
  sessionModerators = {},
  liveSessions = [],
  sellers = [],
  onAppointModerator,
  onRevokeModerator
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'stock' | 'orders'>('ai');
  const [isModeratorModalOpen, setIsModeratorModalOpen] = useState(false);
  const [trackingWaybills, setTrackingWaybills] = useState<Record<string, string>>({});
  const [issueResponses, setIssueResponses] = useState<Record<string, { message: string; resolutionNote: string }>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [appliedCopyFeedback, setAppliedCopyFeedback] = useState(false);

  // Filter orders that contain items from this seller
  const sellerOrders = orders.filter(o => 
    o.items.some(item => item.sellerId === seller.id)
  );

  // Filter issues for this seller
  const sellerIssues = issues.filter(issue => issue.sellerId === seller.id);
  const openIssuesCount = sellerIssues.filter(i => i.status !== 'resolved').length;

  const currentSelectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyCopy = () => {
    if (onApplyDescription) {
      onApplyDescription();
      setAppliedCopyFeedback(true);
      setTimeout(() => setAppliedCopyFeedback(false), 2000);
    }
  };

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
          <img src={seller.avatar} alt="Seller Profile" className="w-10 h-10 rounded-full object-cover border border-[#242936]" />
          <div className="text-left">
            <h2 className="text-base font-bold text-white leading-tight font-heading">Seller Studio</h2>
            <p className="text-[11px] text-slate-400">{seller.name} · {seller.city}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-[#171A21] p-1 rounded-xl border border-[#242936]">
        <button
          onClick={() => setActiveTab('ai')}
          className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ai' ? 'bg-[#19BFFF] text-[#0D1018] shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          AI Assistant
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'stock' ? 'bg-[#19BFFF] text-[#0D1018] shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Stock ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 rounded-lg text-xs font-bold relative flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'orders' ? 'bg-[#19BFFF] text-[#0D1018] shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Orders</span>
          {openIssuesCount > 0 ? (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          ) : (
            <span className="text-[10px] text-slate-400">({sellerOrders.length})</span>
          )}
        </button>
      </div>

      {/* Tab Content: AI Selling Assistant */}
      {activeTab === 'ai' && (
        <div className="space-y-4 text-left">
          {/* Host Mode Launcher Card */}
          <div className="p-4 bg-[#171A21] rounded-2xl border border-[#242936] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-heading">
                <Sparkles className="w-4 h-4 text-[#19BFFF]" />
                Live Broadcast Host
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Launch your private seller studio and start broadcasting to South African shoppers with real-time AI sales coaching.
            </p>
            <button
              onClick={() => onOpenLiveHostMode(seller.id)}
              className="w-full py-3 bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-[#19BFFF]/20 active:scale-95"
            >
              <Radio className="w-4 h-4" />
              <span>Launch Live / Host Mode</span>
            </button>
          </div>

          {/* Assign Moderator Card & Modal */}
          {(() => {
            const sellerSessionId = seller.currentLiveSessionId || (liveSessions.find(s => s.sellerId === seller.id)?.id) || `live-${seller.id}`;
            const appointedModsForThisSeller = Array.from(new Set([
              ...(sessionModerators[sellerSessionId] || []),
              ...(sessionModerators[seller.id] || [])
            ]));

            return (
              <div className="p-4 bg-[#171A21] rounded-2xl border border-[#242936] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 font-heading">
                    <ShieldCheck className="w-4 h-4 text-[#19BFFF]" />
                    Live Stream Chat Moderators
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {appointedModsForThisSeller.length} assigned
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {appointedModsForThisSeller.length > 0
                    ? `Appointed: ${appointedModsForThisSeller.map(id => sellers.find(s => s.id === id)?.name || id).join(', ')}`
                    : 'No moderators assigned yet.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsModeratorModalOpen(true)}
                  className="w-full py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-[#0066ff]/20 active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Assign Moderator ({appointedModsForThisSeller.length})</span>
                </button>

                {/* Moderator Selection Modal */}
                {isModeratorModalOpen && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
                    role="dialog"
                    aria-modal="true"
                  >
                    <div className="bg-[#171A21] border border-[#242936] rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative">
                      <button
                        onClick={() => setIsModeratorModalOpen(false)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-[#19BFFF]" />
                          Assign Moderators
                        </h3>
                        <p className="text-xs text-slate-400">
                          Appoint fellow makers to moderate your chat and keep the stream safe.
                        </p>
                      </div>

                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-none">
                        {sellers.filter(s => s.id !== seller.id).map(s => {
                          const isMod = appointedModsForThisSeller.includes(s.id);
                          return (
                            <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0D1018] border border-[#242936]">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{s.name}</p>
                                  <p className="text-[10px] text-slate-400">{s.city}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (isMod) {
                                    onRevokeModerator && onRevokeModerator(sellerSessionId, s.id);
                                  } else {
                                    onAppointModerator && onAppointModerator(sellerSessionId, s.id);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isMod
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                    : 'bg-[#19BFFF] text-[#0D1018] hover:bg-[#00AEEF]'
                                }`}
                              >
                                {isMod ? <X className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                <span>{isMod ? 'Revoke' : 'Assign'}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setIsModeratorModalOpen(false)}
                        className="w-full py-3 bg-[#242936] hover:bg-[#2d3343] text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Product Selection for AI actions */}
          <div className="p-4 bg-[#171A21] rounded-2xl border border-[#242936] space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Target Product for AI Script & Copy:
            </label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {products.map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelectProduct && onSelectProduct(p.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    (selectedProductId === p.id || (!selectedProductId && currentSelectedProduct?.id === p.id))
                      ? 'bg-[#19BFFF]/10 border-[#19BFFF] text-white'
                      : 'bg-[#0D1018] border-[#242936] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-black shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">R {p.priceZAR.toLocaleString()} · Stock: {p.stock}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* AI Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => onGeneratePrep && onGeneratePrep()}
                disabled={isGenerating || !currentSelectedProduct}
                className="w-full py-3 bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#19BFFF]/20 active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGenerating ? 'Generating...' : 'Generate Livestream Script'}</span>
              </button>

              <button
                onClick={() => onGenerateCopy && onGenerateCopy()}
                disabled={isGenerating || !currentSelectedProduct}
                className="w-full py-3 bg-[#20242E] hover:bg-[#28303F] text-white border border-[#242936] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-[#19BFFF]" />}
                <span>{isGenerating ? 'Generating...' : 'Improve Product Copy'}</span>
              </button>
            </div>
          </div>

          {/* Generated Livestream Script Display */}
          {prepResults && prepResults.openingHook && (
            <div className="p-4 bg-[#171A21] rounded-2xl border border-[#242936] space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#242936] pb-2">
                <span className="text-xs font-bold text-[#19BFFF] uppercase tracking-wide">
                  ✓ Generated Livestream Script
                </span>
                <button
                  onClick={() => handleCopy('hook', `${prepResults.openingHook}\n\n${prepResults.talkingPoints}\n\n${prepResults.streamTimeline}`)}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'hook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'hook' ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">1. Opening Hook:</span>
                <textarea
                  rows={3}
                  value={prepResults.openingHook}
                  onChange={(e) => setPrepResults && setPrepResults({ ...prepResults, openingHook: e.target.value })}
                  className="w-full bg-[#0D1018] border border-[#242936] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#19BFFF]"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">2. Core Talking Points:</span>
                <textarea
                  rows={4}
                  value={prepResults.talkingPoints}
                  onChange={(e) => setPrepResults && setPrepResults({ ...prepResults, talkingPoints: e.target.value })}
                  className="w-full bg-[#0D1018] border border-[#242936] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#19BFFF]"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">3. 10-Minute Outline:</span>
                <textarea
                  rows={4}
                  value={prepResults.streamTimeline}
                  onChange={(e) => setPrepResults && setPrepResults({ ...prepResults, streamTimeline: e.target.value })}
                  className="w-full bg-[#0D1018] border border-[#242936] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#19BFFF]"
                />
              </div>
            </div>
          )}

          {/* Generated Product Copy Display */}
          {copyResults && copyResults.improvedDescription && (
            <div className="p-4 bg-[#171A21] rounded-2xl border border-[#242936] space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#242936] pb-2">
                <span className="text-xs font-bold text-[#19BFFF] uppercase tracking-wide">
                  ✓ Enhanced Product Copy
                </span>
                <button
                  onClick={handleApplyCopy}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {appliedCopyFeedback ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{appliedCopyFeedback ? 'Applied!' : 'Apply to Store'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">Enhanced Description:</span>
                <textarea
                  rows={4}
                  value={copyResults.improvedDescription}
                  onChange={(e) => setCopyResults && setCopyResults({ ...copyResults, improvedDescription: e.target.value })}
                  className="w-full bg-[#0D1018] border border-[#242936] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#19BFFF]"
                />
              </div>

              {copyResults.socialCaption && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block">Promotional Caption:</span>
                  <textarea
                    rows={3}
                    value={copyResults.socialCaption}
                    onChange={(e) => setCopyResults && setCopyResults({ ...copyResults, socialCaption: e.target.value })}
                    className="w-full bg-[#0D1018] border border-[#242936] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#19BFFF]"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Stock & Product Inventory */}
      {activeTab === 'stock' && (
        <div className="space-y-3 text-left">
          {/* Add Item / Product Action for Mobile */}
          <div className="p-3 bg-[#171A21] rounded-2xl border border-[#242936] flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white font-heading">Inventory Management</p>
              <p className="text-[10px] text-slate-400">{products.length} products listed</p>
            </div>
            <button
              onClick={() => onOpenAddProductModal && onOpenAddProductModal()}
              className="px-3.5 py-2 rounded-xl bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#19BFFF]/20 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Product Items List */}
          <div className="space-y-2.5">
            {products.map(p => (
              <div key={p.id} className="p-3 bg-[#171A21] rounded-2xl border border-[#242936] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-black border border-white/10 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate font-heading">{p.name}</h4>
                    <p className="text-[11px] text-[#19BFFF] font-mono tabular-nums font-bold mt-0.5">
                      R {p.priceZAR.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-slate-400">Stock: {p.stock} units</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      const newStock = Math.max(0, p.stock - 1);
                      onUpdateProduct({ ...p, stock: newStock });
                    }}
                    className="w-7 h-7 rounded-lg bg-[#20242E] text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold border border-[#242936] cursor-pointer"
                    title="Decrease stock"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-mono font-bold text-white">{p.stock}</span>
                  <button
                    onClick={() => onUpdateProduct({ ...p, stock: p.stock + 1 })}
                    className="w-7 h-7 rounded-lg bg-[#20242E] text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold border border-[#242936] cursor-pointer"
                    title="Increase stock"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Orders & Fulfilment */}
      {activeTab === 'orders' && (
        <div className="space-y-3 text-left">
          <div className="p-3 bg-[#171A21] rounded-2xl border border-[#242936] text-xs space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5 font-heading">
              <Truck className="w-3.5 h-3.5 text-[#19BFFF]" />
              Artisan Fulfilment & Dispatch
            </span>
            <p className="text-[11px] text-slate-400">
              Manage dispatch and respond to customer queries.
            </p>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="p-8 text-center bg-[#171A21] rounded-2xl border border-[#242936] space-y-2">
              <Package className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-white">No customer orders yet</p>
            </div>
          ) : (
            sellerOrders.map(order => {
              const myItems = order.items.filter(item => item.sellerId === seller.id);
              if (myItems.length === 0) return null;

              const orderIssuesForSeller = sellerIssues.filter(i => i.orderId === order.id);

              return (
                <div key={order.id} className="p-4 bg-[#171A21] rounded-2xl border border-[#242936] space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#242936]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#19BFFF]">{order.id}</span>
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
                    {myItems.map(item => (
                      <div key={item.productId} className="bg-[#0D1018] p-3 rounded-xl border border-[#242936] space-y-2">
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
                            Waybill: <strong className="text-[#19BFFF]">{item.trackingNumber}</strong> ({item.courierPartner || 'The Courier Guy'})
                          </p>
                        )}

                        <div className="pt-1 flex gap-2">
                          {item.status === 'awaiting_dispatch' && (
                            <button
                              onClick={() => handleDispatchItem(order.id, item.productId)}
                              className="w-full py-2 bg-[#19BFFF] text-[#0D1018] text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Mark Dispatched</span>
                            </button>
                          )}
                          {item.status === 'in_transit' && (
                            <button
                              onClick={() => handleDeliverItem(order.id, item.productId)}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
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
    </div>
  );
};
