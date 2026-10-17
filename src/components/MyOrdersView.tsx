import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  ShoppingBag,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Order, OrderItem } from '../types';

interface MyOrdersViewProps {
  orders: Order[];
  onConfirmDelivery: (orderId: string, productId: string) => void;
  onBackToShopping: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  orders,
  onConfirmDelivery,
  onBackToShopping,
  onSelectProduct
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders[0]?.id || null
  );
  const [confirmNotification, setConfirmNotification] = useState<string | null>(null);

  const handleConfirmItem = (orderId: string, productId: string, productName: string) => {
    onConfirmDelivery(orderId, productId);
    setConfirmNotification(`Confirmed delivery of "${productName}". 14-day protection remains active!`);
    setTimeout(() => setConfirmNotification(null), 3500);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-ZA', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const getDaysRemainingProtection = (expiresAtStr: string) => {
    try {
      const diffMs = new Date(expiresAtStr).getTime() - Date.now();
      if (diffMs <= 0) return 'Protection expired';
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return `${days} days remaining`;
    } catch {
      return '14 days';
    }
  };

  const getStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'awaiting_dispatch':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Awaiting Artisan Dispatch</span>
          </span>
        );
      case 'in_transit':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 shrink-0">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Dispatched & In Transit</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shrink-0">
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>Delivered</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Receipt Confirmed by You</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
      
      {/* Toast Notification */}
      {confirmNotification && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{confirmNotification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#212633]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToShopping}
            className="p-2 rounded-xl bg-[#14171f] text-slate-300 hover:text-white border border-[#212633] transition-colors cursor-pointer shrink-0"
            title="Back to live shopping"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#0066ff]/20 text-[#60a5fa] border border-[#0066ff]/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                Buyer Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Recorded
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              My Orders & Buyer Protection
            </h1>
          </div>
        </div>

        <button
          onClick={onBackToShopping}
          className="px-4 py-2 rounded-xl bg-[#14171f] hover:bg-[#1e2330] text-slate-200 border border-[#212633] text-xs font-bold transition-colors cursor-pointer"
        >
          Explore Live Streams
        </button>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="py-16 px-4 bg-[#14171f] rounded-3xl border border-[#212633] text-center space-y-5 max-w-lg mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#0066ff]/10 border border-[#0066ff]/20 flex items-center justify-center text-[#0066ff] mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white tracking-tight">No Orders Placed Yet</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you purchase small-batch handcrafted serums, leather bags, or streetwear on Showmi, your order records, tracking waybills, and 14-day buyer protection will appear here.
            </p>
          </div>
          <button
            onClick={onBackToShopping}
            className="px-6 py-3 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-[#0066ff]/25"
          >
            Start Exploring Showmi Live
          </button>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-5">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const allItemsConfirmed = order.items.every(i => i.status === 'confirmed');

            return (
              <div 
                key={order.id}
                className="bg-[#14171f] rounded-3xl border border-[#212633] overflow-hidden shadow-xl transition-all"
              >
                {/* Order Summary Header Bar */}
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-[#181d28]/60 transition-colors border-b border-[#212633]"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-extrabold font-mono text-[#0066ff]">
                        {order.id}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Placed: {formatDate(order.createdAt)}
                      </span>
                      {allItemsConfirmed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          Order Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-500/30">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 truncate">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · Delivering to {order.city}, {order.province}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Total Paid</span>
                      <span className="text-lg font-black font-mono text-white">
                        R {order.totalZAR.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[#0c0e12] border border-[#212633] flex items-center justify-center text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-6 bg-[#0e1117]/80">
                    
                    {/* 14-Day Buyer Protection Highlight Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#141720] border border-[#0066ff]/40 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#0066ff]/20 border border-[#0066ff]/40 flex items-center justify-center text-[#60a5fa] shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                              <span>Showmi 14-Day Buyer Protection</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-normal">
                                Active Coverage
                              </span>
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Calculated strictly from estimated delivery date ({formatDate(order.estimatedDeliveryDate)}).
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#0c0e12] px-3 py-1.5 rounded-xl border border-[#212633] text-right shrink-0">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Protection Fee (8%)</span>
                          <span className="text-xs font-mono font-bold text-[#0066ff]">
                            R {order.protectionFeeZAR.toLocaleString()} Included
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0c0e12] p-3 rounded-xl border border-[#212633]">
                        <div>
                          <span className="text-[11px] text-slate-400 block">Estimated Arrival Date:</span>
                          <span className="text-xs font-bold text-white font-mono">{formatDate(order.estimatedDeliveryDate)}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block">Protection Valid Through:</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {formatDate(order.protectionExpiresAt)} ({getDaysRemainingProtection(order.protectionExpiresAt)})
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        <em>Covers transit damage, non-delivery, or authentic craft discrepancies. Demonstration Sandbox: Safe simulation of Showmi's 8% Buyer Protection policy.</em>
                      </p>
                    </div>

                    {/* Purchased Items & Delivery Tracking Status */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Item Status & Workshop Fulfilment
                      </h4>

                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.productId}
                            className="p-4 bg-[#141720] rounded-2xl border border-[#212633] space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3.5 min-w-0">
                                {item.productImage && (
                                  <img
                                    src={item.productImage}
                                    alt={item.name}
                                    className="w-14 h-14 rounded-xl object-cover bg-black border border-[#212633] shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <span className="text-[10px] text-[#0066ff] font-bold uppercase tracking-wider block">
                                    {item.sellerName || 'South African Maker'}
                                  </span>
                                  <h5 
                                    onClick={() => onSelectProduct && onSelectProduct(item.productId)}
                                    className="text-xs sm:text-sm font-bold text-white truncate hover:text-[#0066ff] transition-colors cursor-pointer"
                                  >
                                    {item.name}
                                  </h5>
                                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                                    {item.quantity}x @ R {item.priceZAR.toLocaleString()} · R {(item.priceZAR * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div>
                                {getStatusBadge(item.status)}
                              </div>
                            </div>

                            {/* Tracking info row if in_transit or delivered */}
                            {item.trackingNumber && (
                              <div className="p-3 bg-[#0c0e12] rounded-xl border border-[#212633] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <Truck className="w-4 h-4 text-[#0066ff] shrink-0" />
                                  <span className="text-slate-300">
                                    Courier: <strong className="text-white">{item.courierPartner || 'The Courier Guy'}</strong>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 font-mono text-[11px]">Waybill:</span>
                                  <span className="font-mono font-bold text-[#0066ff] bg-[#0066ff]/10 px-2 py-0.5 rounded border border-[#0066ff]/20">
                                    {item.trackingNumber}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Action Button: Confirm Delivery */}
                            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#1e2433]">
                              <div className="text-[11px] text-slate-400">
                                {item.status === 'confirmed' ? (
                                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Receipt confirmed{item.confirmedAt ? ` on ${formatDate(item.confirmedAt)}` : ''}. 14-day protection remains active.</span>
                                  </span>
                                ) : item.status === 'delivered' ? (
                                  <span className="text-slate-300">
                                    Package delivered. Please confirm receipt to complete order.
                                  </span>
                                ) : item.status === 'in_transit' ? (
                                  <span className="text-slate-400">
                                    Package is en route with courier. You can confirm delivery once received.
                                  </span>
                                ) : (
                                  <span className="text-slate-400">
                                    Artisan is preparing this parcel for dispatch.
                                  </span>
                                )}
                              </div>

                              {(item.status === 'in_transit' || item.status === 'delivered') && (
                                <button
                                  onClick={() => handleConfirmItem(order.id, item.productId, item.name)}
                                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Confirm Receipt of Item</span>
                                </button>
                              )}
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Financial Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#212633] text-xs">
                      <div className="bg-[#141720] p-4 rounded-2xl border border-[#212633] space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          Delivery Destination
                        </span>
                        <p className="font-bold text-white">{order.customerName}</p>
                        <p className="text-slate-300">{order.shippingAddress}</p>
                        <p className="text-slate-300">{order.city}, {order.province} ({order.postalCode})</p>
                        <p className="text-slate-400 text-[11px] mt-1 font-mono">{order.customerPhone} · {order.customerEmail}</p>
                      </div>

                      <div className="bg-[#141720] p-4 rounded-2xl border border-[#212633] space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Financial Breakdown
                        </span>
                        <div className="space-y-1 text-slate-300">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-mono text-white">R {order.subtotalZAR.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Buyer Protection Fee (8%)</span>
                            <span className="font-mono text-white">R {order.protectionFeeZAR.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Courier Delivery</span>
                            <span className="font-mono text-white">{order.shippingZAR === 0 ? 'FREE' : `R ${order.shippingZAR}`}</span>
                          </div>
                          <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-[#212633]">
                            <span>Total Paid</span>
                            <span className="font-mono text-[#0066ff]">R {order.totalZAR.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
