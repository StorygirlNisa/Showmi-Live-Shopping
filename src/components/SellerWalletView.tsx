import React, { useMemo, useState } from 'react';
import { 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Store, 
  Calendar, 
  Package, 
  Info,
  ChevronDown,
  ChevronUp,
  ArrowDownLeft,
  Sparkles
} from 'lucide-react';
import { Seller, Order, OrderItem, OrderIssue } from '../types';

interface SellerWalletViewProps {
  currentSeller?: Seller;
  orders: Order[];
  issues?: OrderIssue[];
  userRole: 'buyer' | 'seller' | 'admin';
  currentUser?: any | null;
  onSelectSeller?: (sellerId: string) => void;
  sellers?: Seller[];
  onOpenSellerSignIn?: () => void;
}

interface SellerTransaction {
  id: string;
  orderId: string;
  orderReference: string;
  createdAt: string;
  sellerAmount: number;
  protectionFeeZAR: number;
  status: 'Pending Payment' | 'Pending Balance' | 'In Escrow' | 'Completed' | 'Rejected' | 'Protection Active';
  statusCode: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    priceZAR: number;
    status: OrderItem['status'];
    productImage?: string;
  }[];
  customerName: string;
  city: string;
  confirmedAt?: string;
}

export const SellerWalletView: React.FC<SellerWalletViewProps> = ({
  currentSeller,
  orders = [],
  issues = [],
  userRole,
  currentUser,
  onSelectSeller,
  sellers = [],
  onOpenSellerSignIn
}) => {
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null);

  // If the user is an ordinary buyer without a selected seller workshop:
  const isAuthorizedSeller = Boolean(
    (userRole === 'seller' || userRole === 'admin') && currentSeller
  );

  // Filter orders strictly for the current seller
  const sellerId = currentSeller?.id;

  const { transactions, pendingPayment, pendingBalance, availableBalance, totalLifetimeEarnings } = useMemo(() => {
    if (!sellerId) {
      return {
        transactions: [],
        pendingPayment: 0,
        pendingBalance: 0,
        availableBalance: 0,
        totalLifetimeEarnings: 0
      };
    }

    let pendingPaymentSum = 0;
    let pendingBalanceSum = 0;
    let availableSum = 0;
    let lifetimeSum = 0;

    const txns: SellerTransaction[] = [];
    const seenOrderIds = new Set<string>();

    // Filter orders containing items for this seller, deduplicating to prevent duplicate transactions/earnings
    const relevantOrders = (orders || []).filter(order => {
      if (!order || !order.id || seenOrderIds.has(order.id)) return false;
      const hasSellerIdInList = Array.isArray(order.sellerIds) && order.sellerIds.includes(sellerId);
      const hasSellerItem = Array.isArray(order.items) && order.items.some(item => Boolean(item && item.sellerId === sellerId));
      if (hasSellerIdInList || hasSellerItem) {
        seenOrderIds.add(order.id);
        return true;
      }
      return false;
    });

    relevantOrders.forEach(order => {
      // Isolate strictly the items belonging to this specific seller
      const sellerItems = (order.items || []).filter(item => Boolean(item && item.sellerId === sellerId));
      if (sellerItems.length === 0) return;

      const nonRejectedItems = sellerItems.filter(item => item.status !== 'rejected');
      const orderTotalForSeller = nonRejectedItems.reduce(
        (sum, item) => sum + (item.priceZAR * item.quantity), 
        0
      );

      // Check for unresolved order issues or disputes
      const orderIssuesList = (issues || []).filter(i => i.orderId === order.id);
      const hasUnresolvedDispute = orderIssuesList.some(i => i.status !== 'resolved');

      let allRejected = sellerItems.length > 0 && sellerItems.every(item => item.status === 'rejected');
      let allReleased = sellerItems.length > 0 && sellerItems.every(item => Boolean(item.paymentReleased) || Boolean(order.paymentReleased) || item.status === 'confirmed');

      // Calculate balance additions ensuring no item is counted in multiple balances
      sellerItems.forEach(item => {
        if (item.status === 'rejected' || item.paymentStatus === 'refunded') return;
        const itemAmount = item.priceZAR * item.quantity;

        lifetimeSum += itemAmount;

        const isRefundPending = item.paymentStatus === 'refund_pending';
        const isUnconfirmedPayment = item.paymentStatus === 'pending_payment';
        const isConfirmedReceipt = item.status === 'confirmed' || Boolean(item.confirmedAt) || Boolean(item.paymentReleased);

        // Rule 1, 2, 4, 5: Earnings appear under Pending Balance while awaiting receipt confirmation or dispute resolution
        if (isConfirmedReceipt && !hasUnresolvedDispute && !isRefundPending) {
          availableSum += itemAmount;
        }
        else {
          pendingBalanceSum += itemAmount;
        }
      });

      let txStatus: 'Pending Payment' | 'Pending Balance' | 'In Escrow' | 'Completed' | 'Rejected' = 'Pending Balance';
      if (allRejected) {
        txStatus = 'Rejected';
      } else if (sellerItems.some(i => i.paymentStatus === 'pending_payment')) {
        txStatus = 'Pending Payment';
      } else if (hasUnresolvedDispute) {
        txStatus = 'In Escrow';
      } else if (allReleased && !hasUnresolvedDispute) {
        txStatus = 'Completed';
      } else {
        txStatus = 'Pending Balance';
      }

      txns.push({
        id: `TXN-${order.id}`,
        orderId: order.id,
        orderReference: order.id.startsWith('#') ? order.id : `#${order.id}`,
        createdAt: order.createdAt || new Date().toISOString(),
        sellerAmount: orderTotalForSeller,
        protectionFeeZAR: order.protectionFeeZAR || 0,
        status: txStatus,
        statusCode: txStatus.toLowerCase().replace(/\s+/g, '_'),
        items: sellerItems.map(i => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          priceZAR: i.priceZAR,
          status: i.status,
          productImage: i.productImage
        })),
        customerName: order.customerName || 'Customer',
        city: order.city || 'South Africa',
        confirmedAt: order.confirmedAt || sellerItems.find(i => i.confirmedAt)?.confirmedAt
      });
    });

    // Sort transactions by date descending
    txns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      transactions: txns,
      pendingPayment: pendingPaymentSum,
      pendingBalance: pendingBalanceSum + pendingPaymentSum,
      availableBalance: availableSum,
      totalLifetimeEarnings: lifetimeSum
    };
  }, [orders, issues, sellerId]);

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

  const formatZAR = (val: number) => {
    return `R ${val.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // If user is not authorized or viewing without seller context
  if (!isAuthorizedSeller || !currentSeller) {
    return (
      <div className="p-6 text-center space-y-5 animate-fade-in">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1e2330] border border-[#212633] flex items-center justify-center text-[#19BFFF]">
          <Wallet className="w-7 h-7" />
        </div>
        <div className="space-y-2 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-white tracking-tight">Showpreneur Seller Wallet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Seller Wallet is reserved for authorized South African artisans and makers. To protect shop confidentiality, sellers can only view their own workshop balance and transactions.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c0e12] border border-[#212633] text-left text-xs space-y-2 max-w-sm mx-auto">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#19BFFF] shrink-0" />
            <span>Authorized Access Only</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            You are currently signed in as a buyer. Please open Seller Studio or sign in with your verified seller profile to access your earnings dashboard.
          </p>
        </div>

        {onOpenSellerSignIn && (
          <button
            onClick={onOpenSellerSignIn}
            className="px-5 py-2.5 rounded-xl bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] text-xs font-bold transition-all shadow-lg shadow-[#19BFFF]/20 cursor-pointer"
          >
            Sign In as Seller
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 space-y-5 animate-fade-in text-white">
      {/* Active Workshop Header Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0c0e12] border border-[#212633]">
        <div className="flex items-center gap-3 min-w-0">
          <img 
            src={currentSeller.avatar} 
            alt={currentSeller.name} 
            className="w-11 h-11 rounded-xl object-cover border border-[#212633] shrink-0 bg-black"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate">{currentSeller.name}</h3>
              <span className="text-[10px] text-emerald-400 font-mono">
                · Verified Workshop
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {currentSeller.handle} · {currentSeller.city}, {currentSeller.province}
            </p>
          </div>
        </div>

        {/* Admin Multi-seller selector switch for testing/auditing */}
        {userRole === 'admin' && sellers.length > 1 && onSelectSeller && (
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <span className="text-[10px] text-slate-400 font-mono">Workshop:</span>
            <select
              value={currentSeller.id}
              onChange={(e) => onSelectSeller(e.target.value)}
              className="bg-[#1e2330] text-white px-2.5 py-1 rounded-lg border border-[#212633] text-xs font-semibold outline-none cursor-pointer"
            >
              {sellers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Short Demonstration Balances Only Notice */}
      <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-bold text-amber-300">Demonstration Balances Only</span>
      </div>

      {/* Exactly Two Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 1. Pending Balance Card */}
        <div className="p-4.5 rounded-2xl bg-[#0c0e12] border border-[#212633] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Balance</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono font-bold">
              Demo Value
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
            {formatZAR(pendingBalance)}
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Seller earnings awaiting buyer receipt confirmation or resolution of a dispute or refund hold.
          </p>
        </div>

        {/* 2. Available Balance Card */}
        <div className="p-4.5 rounded-2xl bg-[#0c0e12] border border-[#212633] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Available Balance</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              Demo Value
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {formatZAR(availableBalance)}
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Seller earnings released after buyer confirms receipt, provided there is no active dispute or hold.
          </p>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-[#19BFFF]" />
            <span>Transaction History</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {transactions.length} {transactions.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0c0e12] border border-[#212633] space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-xs font-semibold text-slate-300">No transactions recorded yet</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              When customers purchase your workshop's products and confirm delivery receipt, order transactions will appear here under Pending Balance.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {transactions.map((tx) => {
              const isExpanded = expandedTxnId === tx.id;
              const isPending = tx.status === 'Pending Payment';

              return (
                <div 
                  key={tx.id}
                  className="rounded-2xl bg-[#0c0e12] border border-[#212633] overflow-hidden transition-all hover:border-slate-700"
                >
                  {/* Transaction Primary Row */}
                  <div 
                    onClick={() => setExpandedTxnId(isExpanded ? null : tx.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPending ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30' :
                        tx.status === 'Completed' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' :
                        tx.status === 'Rejected' ? 'bg-red-950/60 text-red-400 border border-red-500/30' :
                        'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                      }`}>
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-white">
                            {tx.orderReference}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(tx.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                          <span className={`font-semibold ${
                            isPending ? 'text-amber-300' :
                            tx.status === 'Completed' ? 'text-emerald-300' :
                            tx.status === 'Rejected' ? 'text-red-300' :
                            'text-blue-300'
                          }`}>
                            {tx.status}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-slate-400 truncate">
                            {tx.items.length} {tx.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 text-right">
                      <div>
                        <div className="font-mono font-extrabold text-sm text-emerald-400">
                          +{formatZAR(tx.sellerAmount)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Demo Value
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="text-slate-400 hover:text-white p-1 cursor-pointer"
                        aria-label={isExpanded ? "Collapse transaction details" : "Expand transaction details"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Transaction Details */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-[#1a1f2c] bg-[#121622]/50 text-xs space-y-3">
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Sold Workshop Items:
                        </span>
                        {tx.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] bg-[#0c0e12] p-2.5 rounded-xl border border-[#212633]">
                            <div className="min-w-0 pr-2 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-white truncate">{item.name}</p>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  item.status === 'confirmed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                                  item.status === 'delivered' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30' :
                                  item.status === 'in_transit' ? 'bg-blue-950 text-blue-300 border border-blue-500/30' :
                                  item.status === 'rejected' ? 'bg-red-950 text-red-300 border border-red-500/30' :
                                  'bg-slate-900 text-slate-300'
                                }`}>
                                  {item.status === 'confirmed' ? 'Receipt Confirmed (Available Balance)' :
                                   item.status === 'delivered' ? 'Delivered (48h Inspection)' :
                                   item.status === 'in_transit' ? 'In Transit' :
                                   item.status === 'rejected' ? 'Rejected' :
                                   'Order Placed'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Qty: {item.quantity} × {formatZAR(item.priceZAR)} = <strong className="text-slate-200">{formatZAR(item.priceZAR * item.quantity)}</strong>
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-emerald-400 text-xs">
                                +{formatZAR(item.priceZAR * item.quantity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#1a1f2c] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                        <div>
                          <span>Buyer: <strong className="text-slate-300">{tx.customerName}</strong></span>
                          <span aria-hidden="true" className="mx-1.5">·</span>
                          <span>Destination: <strong className="text-slate-300">{tx.city}</strong></span>
                        </div>
                        <div className="text-slate-400">
                          Buyer Protection Fee ({formatZAR(tx.protectionFeeZAR)}) kept separate by platform.
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
    </div>
  );
};
