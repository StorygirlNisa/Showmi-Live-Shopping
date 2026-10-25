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
    isPostReleaseReturn?: boolean;
  }) => void;
  onBackToShopping: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  orders,
  issues = [],
  onConfirmDelivery,
  onReportIssue,
  onBackToShopping,
  onSelectProduct
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders[0]?.id || null
  );
  const [confirmNotification, setConfirmNotification] = useState<string | null>(null);

  // Warning confirmation modal state for receipt
  const [confirmWarningModal, setConfirmWarningModal] = useState<{
    orderId: string;
    productId: string;
    productName: string;
  } | null>(null);

  // Tracking modal state
  const [trackingModalItem, setTrackingModalItem] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);

  // Issue reporting modal state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [reportingItem, setReportingItem] = useState<{
    orderId: string;
    productId: string;
    sellerId: string;
    productName: string;
    isPostReleaseReturn?: boolean;
  } | null>(null);
  const [issueType, setIssueType] = useState<IssueType>('item_damaged');
  const [issueDescription, setIssueDescription] = useState('');
  const [evidenceImage, setEvidenceImage] = useState<string>('');
  const [imagePreviewName, setImagePreviewName] = useState<string>('');
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const [issueFormError, setIssueFormError] = useState<string | null>(null);

  const handleConfirmItem = (orderId: string, productId: string, productName: string) => {
    onConfirmDelivery(orderId, productId);
    setConfirmNotification(`Receipt confirmed for "${productName}". Payment simulated as released to seller.`);
    setTimeout(() => setConfirmNotification(null), 4000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-ZA', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const getInspectionWindowInfo = (order: Order) => {
    const deliveredAtStr = (order.items || []).find(i => Boolean(i?.deliveredAt))?.deliveredAt;
    const confirmedAtStr = (order.items || []).find(i => Boolean(i?.confirmedAt))?.confirmedAt;
    const deliveryTimestamp = deliveredAtStr || confirmedAtStr;

    if (!deliveryTimestamp) {
      return {
        statusText: 'Awaiting delivery confirmation',
        deadlineText: 'Will start upon delivery confirmation',
        deliveryText: 'Awaiting delivery confirmation',
        isExpired: false,
        hasConfirmedDelivery: false
      };
    }

    const deliveryTime = new Date(deliveryTimestamp).getTime();
    const deadlineTime = deliveryTime + 48 * 60 * 60 * 1000;
    const now = Date.now();
    const isExpired = now > deadlineTime;

    const deliveryDateStr = new Date(deliveryTimestamp).toLocaleString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const deadlineDateStr = new Date(deadlineTime).toLocaleString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      statusText: isExpired ? 'Inspection period ended' : 'Active',
      deadlineText: deadlineDateStr,
      deliveryText: deliveryDateStr,
      isExpired,
      hasConfirmedDelivery: true
    };
  };

  const handleOpenIssueModal = (
    orderId: string, 
    productId: string, 
    sellerId: string, 
    productName: string,
    isPostRelease = false
  ) => {
    setReportingItem({ 
      orderId, 
      productId, 
      sellerId, 
      productName, 
      isPostReleaseReturn: isPostRelease 
    });
    setIssueType(isPostRelease ? 'return_request' : 'item_damaged');
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
      setIssueFormError('Please provide a detailed description (minimum 10 characters).');
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
      return_request: 'Return Request / Order Query',
      other: 'Other issue'
    };

    setTimeout(() => {
      onReportIssue({
        orderId: reportingItem.orderId,
        productId: reportingItem.productId,
        sellerId: reportingItem.sellerId,
        issueType,
        issueTypeLabel: typeLabels[issueType] || 'Issue Reported',
        description: issueDescription.trim(),
        evidenceImage: evidenceImage || undefined,
        isPostReleaseReturn: reportingItem.isPostReleaseReturn
      });

      setIsSubmittingIssue(false);
      setIsIssueModalOpen(false);
      setConfirmNotification(
        reportingItem.isPostReleaseReturn 
          ? 'Return query submitted! Note: refunds after payment release must be arranged directly with the seller.'
          : 'Issue report successfully submitted against order item!'
      );
      setTimeout(() => setConfirmNotification(null), 5000);
    }, 600);
  };

  const getStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'awaiting_dispatch':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Order Placed</span>
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
      case 'pending_payment':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Order Placed (Pending Payment)</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Receipt Confirmed by You</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-950/80 text-red-300 border border-red-500/30 flex items-center gap-1.5 shrink-0">
            <X className="w-3.5 h-3.5 text-red-400" />
            <span>Rejected by Artisan</span>
          </span>
        );
      case 'pending_acceptance':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Order Placed (Processing)</span>
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
              My Orders & Payment Protection
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
              When you purchase products on Showmi, your order records, tracking waybills, and payment protection status will appear here.
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
            const inspectionInfo = getInspectionWindowInfo(order);
            const protectionActive = !inspectionInfo.isExpired || issues.some(i => i.orderId === order.id && i.status !== 'resolved');

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
                    
                    {/* Showmi Buyer Protection Banner */}
                    {(() => {
                      const inspectionInfo = getInspectionWindowInfo(order);
                      const hasUnresolvedIssue = issues.some(i => i.orderId === order.id && i.status !== 'resolved');

                      return (
                        <div className="p-4 sm:p-5 rounded-2xl border bg-[#141720] border-[#0066ff]/40 space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl border bg-[#0066ff]/20 border-[#0066ff]/40 text-[#60a5fa] flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                                  <span>Showmi Buyer Protection</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-normal ${
                                    hasUnresolvedIssue ? 'bg-amber-500/20 text-amber-300' :
                                    inspectionInfo.statusText === 'Inspection period ended' ? 'bg-slate-500/20 text-slate-300' :
                                    inspectionInfo.statusText === 'Awaiting delivery confirmation' ? 'bg-blue-500/20 text-blue-300' :
                                    'bg-emerald-500/20 text-emerald-300'
                                  }`}>
                                    Protection Status: {hasUnresolvedIssue ? 'Awaiting Dispute Resolution' : inspectionInfo.statusText}
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-400">
                                  Inspection Period: 48 hours from confirmed delivery.
                                </p>
                              </div>
                            </div>

                            <div className="bg-[#0c0e12] px-3 py-1.5 rounded-xl border border-[#212633] text-right shrink-0">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Buyer Protection Fee (8%)</span>
                              <span className="text-xs font-mono font-bold text-[#0066ff]">
                                R {order.protectionFeeZAR.toLocaleString()} Included
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0c0e12] p-3 rounded-xl border border-[#212633]">
                            <div>
                              <span className="text-[11px] text-slate-400 block">Confirmed Delivery Date/Time:</span>
                              <span className="text-xs font-bold text-white font-mono">
                                {inspectionInfo.hasConfirmedDelivery ? inspectionInfo.deliveryText : 'Awaiting delivery confirmation'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[11px] text-slate-400 block">48-Hour Inspection Deadline:</span>
                              <span className={`text-xs font-bold font-mono ${inspectionInfo.hasConfirmedDelivery ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {inspectionInfo.hasConfirmedDelivery ? inspectionInfo.deadlineText : 'Will start upon delivery confirmation'}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#212633] text-xs text-slate-300 space-y-1">
                            <p className="font-semibold text-white">Report a Problem:</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              Please report damage, missing items, or items that differ significantly from the description within 48 hours of confirmed delivery.
                            </p>
                          </div>

                          {inspectionInfo.statusText === 'Inspection period ended' && (
                            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-300 text-xs flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>Inspection period ended. No issues were reported.</span>
                            </div>
                          )}

                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            <em>Demo values only. No real funds are held or transferred.</em>
                          </p>
                        </div>
                      );
                    })()}

                    {/* Purchased Items & Delivery Tracking Status */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Item Status, Fulfilment & Issue Reporting
                      </h4>

                      <div className="space-y-3">
                        {order.items.map((item) => {
                          const existingIssue = issues.find(
                            i => i.orderId === order.id && i.productId === item.productId
                          );

                          const isReceiptConfirmed = item.status === 'confirmed' || Boolean(item.confirmedAt) || Boolean(item.paymentReleased);
                          const isDeliveredState = item.status === 'delivered' || Boolean(item.deliveredAt) || (order as any).status === 'delivered';
                          const isUnfulfilledOrInTransit = item.status === 'in_transit' || item.status === 'awaiting_dispatch' || item.status === 'accepted' || item.status === 'pending_acceptance' || item.status === 'pending_payment' || item.status === 'rejected';

                          const canConfirmReceipt = !isReceiptConfirmed && isDeliveredState && !isUnfulfilledOrInTransit;

                          // Separate, explicit visibility condition for the new Item Received action
                          const showItemReceivedButton = 
                            (item.status === 'delivered' || item.status === 'in_transit') && 
                            !item.confirmedAt && 
                            !item.paymentReleased;

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
                                      {item.sellerName || 'South African Storefront'}
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

                              {/* Prominent Delivered Item Action Banner for Mobile & Desktop */}
                              {showItemReceivedButton && (
                                <div className="p-3.5 bg-emerald-950/50 rounded-xl border border-emerald-500/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-2">
                                  <div className="flex items-center gap-2 text-xs text-emerald-200">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>{item.status === 'delivered' ? 'Item Delivered!' : 'Item In Transit!'} Confirm receipt to release seller earnings.</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onConfirmDelivery(order.id, item.productId);
                                      setConfirmNotification(`Receipt confirmed for "${item.name}". Earnings released to Available Balance.`);
                                      setTimeout(() => setConfirmNotification(null), 4000);
                                    }}
                                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all active:scale-95 shrink-0"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Item Received</span>
                                  </button>
                                </div>
                              )}

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
                                        {existingIssue.issueType === 'return_request' ? 'Return Query / Dispute:' : 'Reported Issue:'}{' '}
                                        <span className="text-[#60a5fa]">{existingIssue.issueTypeLabel}</span>
                                      </span>
                                    </div>
                                    <div>
                                      {getIssueStatusBadge(existingIssue.status)}
                                    </div>
                                  </div>

                                  {existingIssue.isPostReleaseReturn && (
                                    <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                                      <strong>Post-Payment Release Note:</strong> Payment was already simulated as released to the seller upon receipt confirmation. This query is submitted directly to the seller for resolution. Showmi does not provide automated refunds after payment release.
                                    </p>
                                  )}

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
                                      <p className="text-[10px] text-slate-400 italic pt-1">
                                        * Note: A seller response or resolution note does not constitute proof that an external bank refund or return transit has taken place.
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-amber-300 italic">
                                      Waiting for seller review and response from {item.sellerName || 'the storefront'}.
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Confirmed / Payment-Released Notice */}
                              {item.status === 'confirmed' && (
                                <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30 space-y-1.5 text-xs text-slate-300">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                      Payment Released to Seller (Simulated)
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      Confirmed: {formatDate(item.confirmedAt || order.confirmedAt || order.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-300 leading-relaxed">
                                    Showmi's payment hold has completed and simulated payout has been released to {item.sellerName || 'the seller'}.
                                  </p>
                                  <p className="text-[11px] text-amber-300/90 leading-relaxed bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                                    After payment is released, refunds must be arranged directly with the seller. Showmi does not hold funds or process automatic refunds at this stage.
                                  </p>
                                </div>
                              )}

                              {/* Action Buttons Row */}
                              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#1e2433]">
                                <div className="text-[11px] text-slate-400">
                                  {isReceiptConfirmed ? (
                                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Receipt confirmed. Seller earnings released to Available Balance.</span>
                                    </span>
                                  ) : showItemReceivedButton || canConfirmReceipt ? (
                                    <span className="text-slate-300">
                                      Package delivered. 48-hour inspection period active. Please check items before confirming receipt.
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">
                                      Package en route. Payment remains safely held until receipt is confirmed.
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
                                  {/* Track Order Button */}
                                  {(item.status === 'in_transit' || item.status === 'delivered' || item.status === 'confirmed') && (
                                    <button
                                      onClick={() => setTrackingModalItem({ order, item })}
                                      className="px-3 py-2 rounded-xl bg-[#1e2330] hover:bg-[#283244] text-slate-200 border border-[#2e374d] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                                      title="View delivery milestones & courier waybill tracking"
                                    >
                                      <Truck className="w-3.5 h-3.5 text-[#0066ff]" />
                                      <span>Track Order</span>
                                    </button>
                                  )}

                                  {/* Report Issue / Query Order Button */}
                                  {!existingIssue ? (
                                    isReceiptConfirmed ? (
                                      <button
                                        onClick={() => handleOpenIssueModal(order.id, item.productId, item.sellerId, item.name, true)}
                                        className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-[#1e2330] hover:bg-[#283244] text-amber-300 border border-amber-500/30"
                                        title="Submit a return inquiry or query to seller"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Query Order / Request Return</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleOpenIssueModal(order.id, item.productId, item.sellerId, item.name, false)}
                                        className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-[#1e2330] hover:bg-[#283244] text-[#60a5fa] border border-[#2e374d]"
                                        title="Report damage, missing items, or item differing from description"
                                      >
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>Report Issue</span>
                                      </button>
                                    )
                                  ) : (
                                    <span className="text-[11px] font-mono text-slate-400 bg-[#0c0e12] px-2.5 py-1.5 rounded-lg border border-[#212633] flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                                      <span>Issue Logged (#{existingIssue.id})</span>
                                    </span>
                                  )}

                                  {/* Item Received / Receipt Confirmation Section */}
                                  {isReceiptConfirmed ? (
                                    <span className="px-3.5 py-2 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 font-mono">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Receipt Confirmed</span>
                                    </span>
                                  ) : showItemReceivedButton || canConfirmReceipt ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onConfirmDelivery(order.id, item.productId);
                                        setConfirmNotification(`Receipt confirmed for "${item.name}". Earnings released to Available Balance.`);
                                        setTimeout(() => setConfirmNotification(null), 4000);
                                      }}
                                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Item Received</span>
                                    </button>
                                  ) : null}
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
                            <span>Payment Protection Fee (8%)</span>
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

      {/* Confirm Receipt Warning Modal (Requirement 4.C) */}
      {confirmWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171f] border-2 border-emerald-500/40 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-fade-in relative">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-white">
                Have you checked your items?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Confirming receipt triggers the intended release of payment to the seller. Check your order carefully first.
              </p>
              <p className="text-[11px] text-slate-400 italic">
                Item: <strong className="text-white">{confirmWarningModal.productName}</strong>
              </p>
              <div className="p-3 bg-[#0c0e12] border border-[#212633] rounded-xl text-left space-y-1">
                <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Please Note:</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  After payment is released, refunds must be arranged directly with the seller. Showmi does not hold customer funds or execute automatic refunds following receipt confirmation.
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  * Demo sandbox: simulates payout release to artisan. No real funds move.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmWarningModal(null)}
                className="py-3 px-4 rounded-xl bg-[#1e2330] hover:bg-[#283244] text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = confirmWarningModal;
                  setConfirmWarningModal(null);
                  handleConfirmItem(target.orderId, target.productId, target.productName);
                }}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Order Modal (Requirement 4.B) */}
      {trackingModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171f] border border-[#212633] rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#212633]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Courier Tracking</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Order #{trackingModalItem.order.id}</p>
                </div>
              </div>
              <button
                onClick={() => setTrackingModalItem(null)}
                className="w-8 h-8 rounded-full bg-[#1e2330] text-slate-300 flex items-center justify-center cursor-pointer hover:bg-[#283042]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#0c0e12] rounded-xl border border-[#212633] space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Target Item</span>
                <p className="font-bold text-white">{trackingModalItem.item.name}</p>
                <p className="text-slate-300 text-[11px]">
                  Courier: <strong className="text-white">{trackingModalItem.item.courierPartner || 'The Courier Guy'}</strong>
                </p>
                <p className="text-slate-300 text-[11px]">
                  Waybill Number: <strong className="font-mono text-[#0066ff]">{trackingModalItem.item.trackingNumber || 'TCG-ZA-PENDING'}</strong>
                </p>
              </div>

              {/* Delivery Milestones */}
              <div className="p-4 bg-[#0c0e12] rounded-xl border border-[#212633] space-y-3">
                <span className="text-[10px] text-slate-400 block uppercase font-mono mb-2">Tracking Progress</span>
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#212633]">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-black shrink-0 font-bold text-[10px] z-10">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-white">Order Registered & Payment Held</p>
                      <p className="text-[10px] text-slate-400 font-mono">{formatDate(trackingModalItem.order.createdAt)}</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] z-10 ${
                      trackingModalItem.item.status !== 'awaiting_dispatch' ? 'bg-emerald-500 text-black' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {trackingModalItem.item.status !== 'awaiting_dispatch' ? '✓' : '•'}
                    </div>
                    <div>
                      <p className="font-bold text-white">Artisan Workshop Dispatch</p>
                      <p className="text-[10px] text-slate-400">
                        {trackingModalItem.item.dispatchedAt ? `Dispatched on ${formatDate(trackingModalItem.item.dispatchedAt)}` : 'Preparing parcel at artisan workshop'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] z-10 ${
                      trackingModalItem.item.status === 'in_transit' ? 'bg-blue-500 text-white animate-pulse' : (trackingModalItem.item.status === 'delivered' || trackingModalItem.item.status === 'confirmed') ? 'bg-emerald-500 text-black' : 'bg-[#1e2330] text-slate-500'
                    }`}>
                      {(trackingModalItem.item.status === 'delivered' || trackingModalItem.item.status === 'confirmed') ? '✓' : '•'}
                    </div>
                    <div>
                      <p className="font-bold text-white">In Transit with Courier</p>
                      <p className="text-[10px] text-slate-400">En route via regional distribution hub</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-3 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] z-10 ${
                      (trackingModalItem.item.status === 'delivered' || trackingModalItem.item.status === 'confirmed') ? 'bg-emerald-500 text-black' : 'bg-[#1e2330] text-slate-500'
                    }`}>
                      {(trackingModalItem.item.status === 'delivered' || trackingModalItem.item.status === 'confirmed') ? '✓' : '•'}
                    </div>
                    <div>
                      <p className="font-bold text-white">Delivered to Recipient</p>
                      <p className="text-[10px] text-slate-400">
                        {trackingModalItem.item.deliveredAt ? `Delivered on ${formatDate(trackingModalItem.item.deliveredAt)}` : `Estimated delivery: ${formatDate(trackingModalItem.order.estimatedDeliveryDate)}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#141720] rounded-xl border border-[#212633] text-slate-300">
                <span className="text-[10px] text-slate-400 block font-mono">Delivery Destination:</span>
                <p className="font-bold text-white">{trackingModalItem.order.customerName}</p>
                <p>{trackingModalItem.order.shippingAddress}, {trackingModalItem.order.city}, {trackingModalItem.order.province}</p>
              </div>

              <button
                type="button"
                onClick={() => setTrackingModalItem(null)}
                className="w-full py-2.5 rounded-xl bg-[#1e2330] hover:bg-[#283244] text-white font-bold transition-colors cursor-pointer"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report an Issue or Query Order Modal */}
      {isIssueModalOpen && reportingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171f] border border-[#212633] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#212633]">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                  reportingItem.isPostReleaseReturn ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-blue-500/20 border-blue-500/40 text-[#60a5fa]'
                }`}>
                  {reportingItem.isPostReleaseReturn ? <MessageSquare className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {reportingItem.isPostReleaseReturn ? 'Query Order / Request Return' : 'Report an Issue'}
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
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-mono">Target Item</span>
                <p className="text-xs font-bold text-white mt-0.5">{reportingItem.productName}</p>
              </div>

              {/* Informational Guidance Notice depending on payment release state */}
              {reportingItem.isPostReleaseReturn ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-slate-300">
                  <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                    Post-Payment Release Direct Negotiation
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Payment was already simulated as released to the seller upon delivery confirmation. Showmi does not provide automated refunds after payment release. Submitting this request initiates a return query directly with the seller.
                  </p>
                    * This is a request. Refunds are subject to the seller's terms and the payment status. Showmi does not process automatic refunds or promise seller payouts.
                </div>
              ) : (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-1 text-slate-300">
                  <span className="text-[10px] text-[#60a5fa] font-bold block uppercase tracking-wider">
                    Payment Hold Protection Active
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Submitting an issue logs a formal claim within your 48-hour inspection window from confirmed delivery.
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Select Issue or Query Type *</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as IssueType)}
                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-white focus:outline-none focus:border-[#0066ff]"
                >
                  {reportingItem.isPostReleaseReturn ? (
                    <>
                      <option value="return_request">Return request / order query</option>
                      <option value="item_damaged">Damaged item discovered upon unboxing</option>
                      <option value="incorrect_item">Incorrect item received</option>
                      <option value="missing_items">Missing items or accessories</option>
                      <option value="other">Other issue</option>
                    </>
                  ) : (
                    <>
                      <option value="item_not_received">Item not received / courier delay</option>
                      <option value="item_damaged">Damaged item in transit</option>
                      <option value="incorrect_item">Incorrect item received</option>
                      <option value="missing_items">Missing items in parcel</option>
                      <option value="other">Other issue</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">
                  Describe the Issue or Query in Detail * (Min 10 chars)
                </label>
                <textarea
                  rows={4}
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Please describe what happened, condition of the craft item, or what resolution you are requesting from the artisan..."
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
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <span>Attached: {imagePreviewName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEvidenceImage('');
                        setImagePreviewName('');
                      }}
                      className="text-red-400 hover:text-red-300 font-bold ml-2 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
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
                      <span>{reportingItem.isPostReleaseReturn ? 'Submit Return Query' : 'Submit Issue Report'}</span>
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
