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
  ChevronUp,
  MessageSquare,
  Send,
  Image as ImageIcon,
  X,
  AlertTriangle
} from 'lucide-react';
import { Order, OrderItem, OrderIssue, IssueType } from '../types';

interface MyOrdersViewProps {
  orders: Order[];
  issues: OrderIssue[];
  onConfirmDelivery: (orderId: string, productId: string) => void;
  onReportIssue: (payload: {
    orderId: string;
    productId: string;
    sellerId: string;
    issueType: IssueType;
    issueTypeLabel: string;
    description: string;
    evidenceImage?: string;
  }) => void;
  onBackToShopping: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  orders,
  issues,
  onConfirmDelivery,
  onReportIssue,
  onBackToShopping,
  onSelectProduct
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders[0]?.id || null
  );
  const [confirmNotification, setConfirmNotification] = useState<string | null>(null);

  // Issue reporting modal state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [reportingItem, setReportingItem] = useState<{
    orderId: string;
    productId: string;
    sellerId: string;
    productName: string;
  } | null>(null);
  const [issueType, setIssueType] = useState<IssueType>('item_damaged');
  const [issueDescription, setIssueDescription] = useState('');
  const [evidenceImage, setEvidenceImage] = useState<string>('');
  const [imagePreviewName, setImagePreviewName] = useState<string>('');
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const [issueFormError, setIssueFormError] = useState<string | null>(null);

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

  const isProtectionActive = (protectionExpiresAtStr: string) => {
    try {
      return new Date(protectionExpiresAtStr).getTime() > Date.now();
    } catch {
      return true;
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

  const handleOpenIssueModal = (orderId: string, productId: string, sellerId: string, productName: string) => {
    setReportingItem({ orderId, productId, sellerId, productName });
    setIssueType('item_damaged');
    setIssueDescription('');
    setEvidenceImage('');
    setImagePreviewName('');
    setIssueFormError(null);
    setIsIssueModalOpen(true);
  };

  const handleEvidenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setIssueFormError('Please select a valid image file for evidence attachment.');
      return;
    }
    setImagePreviewName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      if (b64) setEvidenceImage(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleWorkspaceIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingItem) return;

    if (!issueDescription.trim() || issueDescription.trim().length < 10) {
      setIssueFormError('Please provide a detailed description of the issue (minimum 10 characters).');
      return;
    }

    // Prevent duplicate clicks
    if (isSubmittingIssue) return;
    setIsSubmittingIssue(true);
    setIssueFormError(null);

    const typeLabels: Record<IssueType, string> = {
      item_not_received: 'Item not received',
      item_damaged: 'Item damaged',
      incorrect_item: 'Incorrect item',
      missing_items: 'Missing items',
      other: 'Other'
    };

    setTimeout(() => {
      onReportIssue({
        orderId: reportingItem.orderId,
        productId: reportingItem.productId,
        sellerId: reportingItem.sellerId,
        issueType,
        issueTypeLabel: typeLabels[issueType] || 'Issue Reported',
        description: issueDescription.trim(),
        evidenceImage: evidenceImage || undefined
      });

      setIsSubmittingIssue(false);
      setIsIssueModalOpen(false);
      setConfirmNotification('Issue report successfully submitted against order item!');
      setTimeout(() => setConfirmNotification(null), 4000);
    }, 800);
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

  const getIssueStatusBadge = (status: OrderIssue['status']) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Submitted · Awaiting Artisan Response</span>
          </span>
        );
      case 'seller_responded':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>Seller Responded</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Issue Resolved</span>
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
            const protectionActive = isProtectionActive(order.protectionExpiresAt);

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
                    <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                      protectionActive ? 'bg-[#141720] border-[#0066ff]/40' : 'bg-[#1c1518] border-amber-500/30'
                    }`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                            protectionActive ? 'bg-[#0066ff]/20 border-[#0066ff]/40 text-[#60a5fa]' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          }`}>
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                              <span>Showmi 14-Day Buyer Protection</span>
                              {protectionActive ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-normal">
                                  Active Coverage
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-normal">
                                  Protection Expired
                                </span>
                              )}
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
                          <span className={`text-xs font-bold font-mono ${protectionActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {formatDate(order.protectionExpiresAt)} ({getDaysRemainingProtection(order.protectionExpiresAt)})
                          </span>
                        </div>
                      </div>

                      {!protectionActive && (
                        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>The 14-day protection window for this order has expired. New issue reporting is closed, but you may still review previously submitted reports.</span>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        <em>Covers transit damage, non-delivery, or authentic craft discrepancies. Demonstration Sandbox: Safe simulation of Showmi's 8% Buyer Protection policy.</em>
                      </p>
                    </div>

                    {/* Purchased Items & Delivery Tracking Status */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Item Status & Workshop Fulfilment & Issue Reporting
                      </h4>

                      <div className="space-y-3">
                        {order.items.map((item) => {
                          const existingIssue = issues.find(
                            i => i.orderId === order.id && i.productId === item.productId
                          );

                          return (
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

                              {/* Issue Report Display if submitted */}
                              {existingIssue && (
                                <div className="p-4 bg-[#0c0e12] rounded-xl border border-blue-500/30 space-y-3">
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4 text-[#0066ff]" />
                                      <span className="text-xs font-bold text-white">
                                        Reported Issue: <span className="text-[#60a5fa]">{existingIssue.issueTypeLabel}</span>
                                      </span>
                                    </div>
                                    <div>
                                      {getIssueStatusBadge(existingIssue.status)}
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-300 leading-relaxed bg-[#141720] p-3 rounded-lg border border-[#212633]">
                                    "{existingIssue.description}"
                                  </p>

                                  {existingIssue.evidenceImage && (
                                    <div className="flex items-center gap-2">
                                      <img 
                                        src={existingIssue.evidenceImage} 
                                        alt="Evidence Attachment" 
                                        className="w-16 h-16 rounded-lg object-cover border border-[#212633]"
                                      />
                                      <span className="text-[10px] text-slate-400 font-mono">Simulated Evidence Attached</span>
                                    </div>
                                  )}

                                  {/* Seller Response Section */}
                                  {existingIssue.sellerResponse ? (
                                    <div className="p-3 bg-[#182030] rounded-xl border border-blue-500/20 space-y-2 mt-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          <span>Seller Response & Resolution Note</span>
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          {formatDate(existingIssue.sellerResponse.respondedAt)}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-200 leading-relaxed">
                                        {existingIssue.sellerResponse.message}
                                      </p>
                                      {existingIssue.sellerResponse.resolutionNote && (
                                        <p className="text-[11px] text-emerald-300 font-medium pt-1 border-t border-[#212633]">
                                          Resolution: {existingIssue.sellerResponse.resolutionNote}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-amber-300 italic">
                                      Waiting for workshop review and response from {item.sellerName || 'the artisan'}.
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Action Button: Confirm Delivery & Report an Issue */}
                              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#1e2433]">
                                <div className="text-[11px] text-slate-400">
                                  {item.status === 'confirmed' ? (
                                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Receipt confirmed{item.confirmedAt ? ` on ${formatDate(item.confirmedAt)}` : ''}. 14-day protection active.</span>
                                    </span>
                                  ) : item.status === 'delivered' ? (
                                    <span className="text-slate-300">
                                      Package delivered. Please confirm receipt to complete order.
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">
                                      Package en route. Eligible for 14-day protection claims.
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  {/* Report Issue Button */}
                                  {!existingIssue && (
                                    <button
                                      onClick={() => handleOpenIssueModal(order.id, item.productId, item.sellerId, item.name)}
                                      disabled={!protectionActive}
                                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        protectionActive 
                                          ? 'bg-[#1e2330] hover:bg-[#283244] text-[#60a5fa] border border-[#2e374d]' 
                                          : 'bg-[#14171f] text-slate-500 border border-[#212633] opacity-60 cursor-not-allowed'
                                      }`}
                                      title={protectionActive ? 'Report a delivery or quality issue' : 'Protection period expired'}
                                    >
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      <span>Report Issue</span>
                                    </button>
                                  )}

                                  {(item.status === 'in_transit' || item.status === 'delivered') && (
                                    <button
                                      onClick={() => handleConfirmItem(order.id, item.productId, item.name)}
                                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Confirm Receipt</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                            </div>
                          );
                        })}
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

      {/* Report an Issue Modal */}
      {isIssueModalOpen && reportingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171f] border border-[#212633] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#212633]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[#60a5fa]">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Report an Issue
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Order #{reportingItem.orderId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1e2330] hover:bg-[#283042] text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWorkspaceIssueSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-[#0c0e12] rounded-xl border border-[#212633]">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Target Item</span>
                <p className="text-xs font-bold text-white mt-0.5">{reportingItem.productName}</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Select Issue Type *</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as IssueType)}
                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-white focus:outline-none focus:border-[#0066ff]"
                >
                  <option value="item_damaged">Item damaged in transit</option>
                  <option value="item_not_received">Item not received / delayed</option>
                  <option value="incorrect_item">Incorrect item received</option>
                  <option value="missing_items">Missing items in parcel</option>
                  <option value="other">Other issue</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Describe the Issue in Detail * (Min 10 chars)</label>
                <textarea
                  rows={4}
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Please describe what happened, parcel condition, or craft discrepancy..."
                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-white focus:outline-none focus:border-[#0066ff] leading-relaxed"
                />
              </div>

              {/* Simulated Evidence Image Attachment */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-300 block flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#0066ff]" />
                  Simulated Evidence Attachment (Optional photo/screenshot)
                </label>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0c0e12] border border-[#212633]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEvidenceFileChange}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1e2330] file:text-white hover:file:bg-[#283042] file:cursor-pointer cursor-pointer"
                  />
                </div>
                {imagePreviewName && (
                  <p className="text-[11px] text-emerald-400 font-mono">Attached: {imagePreviewName}</p>
                )}
              </div>

              {issueFormError && (
                <p className="text-[11px] text-red-400 font-semibold">{issueFormError}</p>
              )}

              <div className="pt-4 border-t border-[#212633] flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#1e2330] hover:bg-[#283042] text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIssue}
                  className="flex-1 py-3 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold transition-colors cursor-pointer shadow-lg shadow-[#0066ff]/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingIssue ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Issue Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
