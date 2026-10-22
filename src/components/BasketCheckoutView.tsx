import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  MapPin, 
  Lock, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { CartItem, OrderConfirmation, Product } from '../types';
import { SA_PROVINCES } from '../data/mockData';

export interface OrderPlacementPayload {
  orderId: string;
  items: CartItem[];
  subtotalZAR: number;
  shippingZAR: number;
  protectionFeeZAR: number;
  totalZAR: number;
  deliveryMethod: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  province: string;
  postalCode: string;
  estimatedDeliveryDate: string;
  protectionExpiresAt: string;
}

interface BasketCheckoutViewProps {
  cartItems: CartItem[];
  productsList?: Product[];
  currentSellerId?: string;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onBackToDiscover: () => void;
  onSelectProduct: (productId: string) => void;
  onPlaceOrder?: (payload: OrderPlacementPayload) => void;
  onSimulateStockChange?: (productId: string, newStock: number) => void;
  onViewOrders?: () => void;
  initialStep?: 'basket' | 'checkout' | 'confirmation';
}

export const BasketCheckoutView: React.FC<BasketCheckoutViewProps> = ({
  cartItems,
  productsList = [],
  currentSellerId,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onBackToDiscover,
  onSelectProduct,
  onPlaceOrder,
  onSimulateStockChange,
  onViewOrders,
  initialStep
}) => {
  // Checkout Form State
  const [step, setStep] = useState<'basket' | 'checkout' | 'confirmation'>(initialStep || 'basket');
  const prevInitialStepRef = useRef(initialStep);
  const submittingRef = useRef(false);

  // Synchronize step whenever initialStep explicitly changes from outside (e.g. navigating via Buy Now)
  useEffect(() => {
    if (initialStep && initialStep !== prevInitialStepRef.current) {
      prevInitialStepRef.current = initialStep;
      setStep(initialStep);
    }
  }, [initialStep]);
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pargo' | 'express'>('courier');
  const [paymentMethod, setPaymentMethod] = useState<'ozow' | 'capitec' | 'card'>('ozow');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderConfirmation | null>(null);
  const [checkoutStockError, setCheckoutStockError] = useState<string | null>(null);

  // Customer Details (Strictly fictional demonstration defaults; never real personal data)
  const [formData, setFormData] = useState({
    fullName: 'Demo Shopper',
    email: 'demo.shopper@example.co.za',
    phone: '+27 82 000 1234',
    address: '100 Demonstration Lane, Artisan Park',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8001'
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFillDemoDetails = () => {
    setFormData({
      fullName: 'Demo Shopper',
      email: 'demo.shopper@example.co.za',
      phone: '+27 82 000 1234',
      address: '100 Demonstration Lane, Artisan Park',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8001'
    });
    setFieldErrors({});
    setCheckoutStockError(null);
  };

  const handleClearForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: 'Western Cape',
      postalCode: ''
    });
    setFieldErrors({});
    setCheckoutStockError(null);
  };

  // CRITICAL FIX: Match every cart item to the latest product record in productsList by product ID.
  // Never rely on stale product snapshots stored in cartItems.
  const resolvedCartItems: CartItem[] = useMemo(() => {
    return cartItems.map(item => {
      const liveProduct = productsList.find(p => p.id === item.product.id) || item.product;
      return {
        ...item,
        product: liveProduct
      };
    });
  }, [cartItems, productsList]);

  // Stock issue evaluation per resolved item
  const stockStatuses = useMemo(() => {
    return resolvedCartItems.map(item => {
      const liveStock = Math.max(0, item.product.stock);
      const isSoldOut = liveStock <= 0;
      const isInsufficient = liveStock > 0 && item.quantity > liveStock;
      return {
        productId: item.product.id,
        liveStock,
        isSoldOut,
        isInsufficient,
        hasIssue: isSoldOut || isInsufficient,
        item
      };
    });
  }, [resolvedCartItems]);

  const hasSoldOut = stockStatuses.some(s => s.isSoldOut);
  const hasInsufficient = stockStatuses.some(s => s.isInsufficient);
  const hasAnyStockIssue = hasSoldOut || hasInsufficient;

  // Artisan integrity rule: Sellers must not purchase their own products
  const hasOwnArtisanProduct = Boolean(
    currentSellerId && resolvedCartItems.some(item => item.product.sellerId === currentSellerId)
  );

  const subtotalZAR = resolvedCartItems.reduce(
    (sum, item) => sum + item.product.priceZAR * item.quantity, 
    0
  );
  
  const buyerProtectionFee = Math.round(subtotalZAR * 0.08);

  // Delivery calculation
  const getDeliveryCost = () => {
    if (resolvedCartItems.length === 0) return 0;
    if (deliveryMethod === 'express') return 140;
    if (deliveryMethod === 'pargo') return 60;
    // Standard Door-to-Door courier is free over R750
    return subtotalZAR >= 750 ? 0 : 85;
  };

  const deliveryCost = getDeliveryCost();
  const grandTotalZAR = subtotalZAR + deliveryCost + buyerProtectionFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleProceedToCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItems.some(i => i.product.stock <= 0)) {
      return;
    }
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulatePayment = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Strict guard: orders can only be placed explicitly on the checkout review step
    if (step !== 'checkout') {
      return;
    }

    // Prevent accidental duplicate submissions
    if (isProcessingPayment || submittingRef.current) {
      return;
    }

    setCheckoutStockError(null);
    setFieldErrors({});

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (minimum 2 characters)';
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      errors.phone = 'Valid South African phone number is required';
    }
    if (!formData.address.trim() || formData.address.trim().length < 4) {
      errors.address = 'Street address is required';
    }
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      errors.city = 'City / Suburb is required';
    }
    if (!formData.postalCode.trim() || formData.postalCode.trim().length < 3) {
      errors.postalCode = 'Valid postal code is required';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Valid email address is required for waybill notifications';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setCheckoutStockError('Please provide all required delivery details before proceeding.');
      return;
    }

    // Validate stock again at submission against current productsList
    const failingItems = resolvedCartItems.filter(
      item => item.product.stock <= 0 || item.quantity > item.product.stock
    );

    if (failingItems.length > 0) {
      const issues = failingItems.map(item => 
        item.product.stock <= 0 
          ? `"${item.product.name}" is sold out`
          : `"${item.product.name}" has only ${item.product.stock} units available (requested ${item.quantity})`
      ).join('; ');
      setCheckoutStockError(`Cannot place order: ${issues}. Please return to your basket and correct your quantities.`);
      return;
    }

    submittingRef.current = true;
    setIsProcessingPayment(true);

    setTimeout(() => {
      // Re-verify at transaction confirmation time
      const finalFailing = resolvedCartItems.filter(
        item => item.product.stock <= 0 || item.quantity > item.product.stock
      );

      if (finalFailing.length > 0) {
        setIsProcessingPayment(false);
        submittingRef.current = false;
        setCheckoutStockError('Order cancelled: stock was updated elsewhere while approving payment. Please adjust your basket.');
        return;
      }

      setIsProcessingPayment(false);
      submittingRef.current = false;

      const now = new Date();
      const estDelivery = new Date(now.getTime() + 3 * 24 * 3600000);
      const protectionExpiry = new Date(estDelivery.getTime() + 14 * 24 * 3600000);
      const generatedOrderId = `SHW-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderPayload: OrderPlacementPayload = {
        orderId: generatedOrderId,
        items: [...resolvedCartItems],
        subtotalZAR,
        shippingZAR: deliveryCost,
        protectionFeeZAR: buyerProtectionFee,
        totalZAR: grandTotalZAR,
        deliveryMethod: deliveryMethod === 'courier' 
          ? 'Standard Door-to-Door Courier' 
          : deliveryMethod === 'pargo' 
          ? 'Pargo Pickup Locker' 
          : 'Express Overnight Courier',
        paymentMethod: paymentMethod === 'ozow' 
          ? 'Ozow Instant EFT (Simulated)' 
          : paymentMethod === 'capitec' 
          ? 'Capitec Pay (Simulated)' 
          : 'Credit / Cheque Card (Simulated)',
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        estimatedDeliveryDate: estDelivery.toISOString(),
        protectionExpiresAt: protectionExpiry.toISOString(),
      };

      const newOrder: OrderConfirmation = {
        orderId: generatedOrderId,
        date: now.toLocaleDateString('en-ZA', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }),
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: `${formData.address}, ${formData.city}`,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        deliveryMethod: orderPayload.deliveryMethod,
        paymentMethod: orderPayload.paymentMethod,
        items: [...resolvedCartItems],
        subtotalZAR,
        shippingZAR: deliveryCost,
        protectionFeeZAR: buyerProtectionFee,
        totalZAR: grandTotalZAR,
        estimatedDeliveryDate: estDelivery.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
        protectionExpiresAt: protectionExpiry.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      setCompletedOrder(newOrder);
      setStep('confirmation');
      if (onPlaceOrder) {
        onPlaceOrder(orderPayload);
      }
      onClearCart();
    }, 1600);
  };

  // 1. Order Confirmation View
  if (step === 'confirmation' && completedOrder) {
    return (
      <div className="pb-28 pt-8 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">
        <div className="bg-[#14171f] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
              Simulated Transaction Approved
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Order Confirmed & Saved!
            </h1>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Thank you, {completedOrder.customerName}. Your order has been registered in Showmi and scheduled for seller dispatch.
            </p>
          </div>

          {/* Reference Banner */}
          <div className="bg-[#0c0e12] rounded-2xl p-4 border border-[#212633] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-md mx-auto">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Order Reference</p>
              <p className="text-lg font-bold font-mono text-[#0066ff]">{completedOrder.orderId}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Estimated Delivery</p>
              <p className="text-sm font-bold text-white">{completedOrder.estimatedDeliveryDate}</p>
            </div>
          </div>

          {/* Payment-Protection Journey Confirmation Banner */}
          <div className="p-5 rounded-2xl bg-[#0c0e12] border-2 border-[#0066ff] text-left space-y-3 shadow-xl shadow-[#0066ff]/10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0066ff]" />
                Your payment is protected
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              A third-party financial institution would hold your payment until you confirm receipt. Check your items carefully before confirming.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              After payment is released, refunds must be arranged directly with the seller.
            </p>
            <div className="pt-2 border-t border-[#212633] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-[11px] text-slate-400 italic">
                Demo only. No real funds are held or transferred.
              </p>
              {onViewOrders && (
                <button
                  onClick={onViewOrders}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Go to My Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Courier Waybill Preview */}
          <div className="p-4 rounded-xl bg-[#10131a] border border-[#212633] text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0066ff]" />
                The Courier Guy Tracking Preview
              </span>
              <span className="text-[11px] font-mono text-emerald-400">Waybill Generated</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Waybill #TCG-ZA-{Math.floor(10000000 + Math.random() * 90000000)}
            </p>
            <p className="text-xs text-slate-300">
              Delivering to: <strong className="text-white">{completedOrder.shippingAddress}, {completedOrder.province} ({completedOrder.postalCode})</strong>
            </p>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3 pt-2 text-left border-t border-[#212633]">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Itemized Receipt
            </h3>
            <div className="space-y-2">
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#1c212c]">
                  <span className="text-slate-300">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-mono font-bold text-white">
                    R {(item.product.priceZAR * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">R {completedOrder.subtotalZAR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Protection Fee (8%)</span>
                <span className="font-mono text-white">R {completedOrder.protectionFeeZAR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery ({completedOrder.deliveryMethod})</span>
                <span>{completedOrder.shippingZAR === 0 ? 'Free' : `R ${completedOrder.shippingZAR}`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-[#212633]">
                <span>Total Paid (Simulated)</span>
                <span className="font-mono text-[#0066ff]">
                  R {completedOrder.totalZAR.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {onViewOrders && (
              <button
                onClick={onViewOrders}
                className="w-full py-3 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-lg shadow-[#0066ff]/25 flex items-center justify-center gap-2"
              >
                <span>View in My Orders</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onBackToDiscover}
              className={`w-full py-3 rounded-xl bg-[#1e2330] hover:bg-[#283244] text-slate-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer ${!onViewOrders ? 'sm:col-span-2' : ''}`}
            >
              Back to Showmi Marketplace
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. Empty Basket State
  if (cartItems.length === 0) {
    return (
      <div className="pb-28 pt-16 px-4 sm:px-6 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#14171f] border border-[#212633] flex items-center justify-center mx-auto text-slate-500">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Your Shopping Basket is Empty
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Discover handmade serums, Karoo leather bags, and limited Johannesburg kicks streaming live.
          </p>
        </div>
        <button
          onClick={onBackToDiscover}
          className="px-6 py-3 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Explore Live Rooms & Products
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#212633]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (step === 'checkout') {
                setStep('basket');
              } else {
                onBackToDiscover();
              }
            }}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 -ml-1 rounded-lg hover:bg-white/5"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {step === 'basket' ? 'Your Shopping Basket' : 'Checkout Review & Delivery Details'}
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setStep('basket')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${step === 'basket' ? 'bg-[#0066ff] text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            title="Step 1: Review basket items"
          >
            1. Basket
          </button>
          <span className="text-slate-600">→</span>
          <span className={`px-2 py-0.5 rounded ${step === 'checkout' ? 'bg-[#0066ff] text-white font-bold' : 'text-slate-400'}`}>
            2. Review & Place Order
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Items or Checkout Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {step === 'basket' ? (
            /* Itemized Basket Table */
            <div className="space-y-4">
              <div className="bg-[#14171f] rounded-2xl border border-[#212633] divide-y divide-[#212633] overflow-hidden">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="p-4 sm:p-5 flex items-center gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      onClick={() => onSelectProduct(item.product.id)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-black border border-[#212633] shrink-0 cursor-pointer hover:opacity-90"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.product.sellerName}
                      </p>
                      <h3 
                        onClick={() => onSelectProduct(item.product.id)}
                        className="text-sm font-semibold text-white leading-snug truncate cursor-pointer hover:text-[#0066ff]"
                      >
                        {item.product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-mono text-white">
                          R {item.product.priceZAR.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400">each</span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center bg-[#0c0e12] border border-[#212633] rounded-lg overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-9 h-9 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#181c25] transition-colors cursor-pointer active:scale-95 text-base font-bold"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                          className="w-9 h-9 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#181c25] transition-colors cursor-pointer active:scale-95 text-base font-bold"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-2 min-h-[38px] min-w-[38px] text-slate-400 hover:text-red-400 transition-colors cursor-pointer flex items-center justify-center rounded-lg hover:bg-[#181c25]"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                <span>{cartItems.length} distinct items in basket</span>
                <button
                  onClick={onClearCart}
                  className="text-red-400 hover:underline cursor-pointer"
                >
                  Empty basket
                </button>
              </div>
            </div>
          ) : (
            /* South African Delivery & Simulated Payment Form */
            <form id="checkout-form" onSubmit={handleSimulatePayment} className="space-y-6">
              {/* Step 2 Review Banner */}
              <div className="p-4 rounded-2xl bg-[#14171f] border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#19BFFF] animate-pulse"></span>
                    <span className="text-[11px] font-mono text-[#19BFFF] font-bold uppercase tracking-wider">Step 2 of 2 · Checkout Review</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Review your delivery destination and chosen payment option below before placing your order.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('basket');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#1e2330] hover:bg-[#283244] text-xs font-semibold text-slate-200 hover:text-white transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto border border-[#2e374d]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Cart to Edit Items</span>
                </button>
              </div>

              {/* Items in this order review card */}
              <div className="p-5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <ShoppingBag className="w-4 h-4 text-[#0066ff]" />
                    <span>Order Items ({resolvedCartItems.reduce((s, i) => s + i.quantity, 0)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('basket');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs text-[#19BFFF] hover:underline cursor-pointer font-medium"
                  >
                    Edit Quantities
                  </button>
                </div>
                <div className="divide-y divide-[#212633]/70">
                  {resolvedCartItems.map((item) => (
                    <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-black border border-[#212633] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{item.product.name}</p>
                          <p className="text-[11px] text-slate-400">Qty: {item.quantity} · R {item.product.priceZAR.toLocaleString()} each</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white shrink-0">
                        R {(item.product.priceZAR * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <MapPin className="w-4 h-4 text-[#0066ff]" />
                    <span>South African Delivery Destination</span>
                  </div>

                  {/* Fictional demo data helpers */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFillDemoDetails}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#1e2330] hover:bg-[#283244] text-[#60a5fa] border border-[#2e374d] rounded-lg transition-colors cursor-pointer"
                      title="Fill sample fictional demonstration details"
                    >
                      Fill Demo Data
                    </button>
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#1e2330] hover:bg-[#283244] text-slate-300 hover:text-white border border-[#2e374d] rounded-lg transition-colors cursor-pointer"
                      title="Clear fields to test required validation"
                    >
                      Clear Fields
                    </button>
                  </div>
                </div>

                {/* Demonstration Sandbox Notice */}
                <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-white">Prototype Demonstration:</strong> Fictional demo details are provided for evaluation. No real personal identities, bank cards, or deliveries are processed. You can edit any field or test required validation before placing an order.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 flex items-center justify-between">
                      <span>Full Name</span>
                      <span className="text-[10px] text-slate-500">Required</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Demo Shopper"
                      className={`w-full min-h-[44px] bg-[#0c0e12] border rounded-xl p-2.5 text-white focus:outline-none ${
                        fieldErrors.fullName ? 'border-red-500' : 'border-[#212633] focus:border-[#0066ff]'
                      }`}
                    />
                    {fieldErrors.fullName && (
                      <p className="text-[11px] text-red-400 font-medium">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 flex items-center justify-between">
                      <span>Mobile Phone (SA)</span>
                      <span className="text-[10px] text-slate-500">Required</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+27 82 000 1234"
                      className={`w-full min-h-[44px] bg-[#0c0e12] border rounded-xl p-2.5 text-white focus:outline-none ${
                        fieldErrors.phone ? 'border-red-500' : 'border-[#212633] focus:border-[#0066ff]'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-red-400 font-medium">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-400 flex items-center justify-between">
                      <span>Street Address</span>
                      <span className="text-[10px] text-slate-500">Required</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. 100 Demonstration Lane, Business Park"
                      className={`w-full min-h-[44px] bg-[#0c0e12] border rounded-xl p-2.5 text-white focus:outline-none ${
                        fieldErrors.address ? 'border-red-500' : 'border-[#212633] focus:border-[#0066ff]'
                      }`}
                    />
                    {fieldErrors.address && (
                      <p className="text-[11px] text-red-400 font-medium">{fieldErrors.address}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 flex items-center justify-between">
                      <span>City / Suburb</span>
                      <span className="text-[10px] text-slate-500">Required</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Cape Town"
                      className={`w-full min-h-[44px] bg-[#0c0e12] border rounded-xl p-2.5 text-white focus:outline-none ${
                        fieldErrors.city ? 'border-red-500' : 'border-[#212633] focus:border-[#0066ff]'
                      }`}
                    />
                    {fieldErrors.city && (
                      <p className="text-[11px] text-red-400 font-medium">{fieldErrors.city}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 flex items-center justify-between">
                      <span>Province</span>
                      <span className="text-[10px] text-slate-500">Required</span>
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full min-h-[44px] bg-[#0c0e12] border border-[#212633] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0066ff]"
                    >
                      {SA_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 flex items-center justify-between">
                      <span>Postal Code</span>
                      <span className="text-[10px] text-slate-500">Required</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="8001"
                      className={`w-full min-h-[44px] bg-[#0c0e12] border rounded-xl p-2.5 text-white focus:outline-none ${
                        fieldErrors.postalCode ? 'border-red-500' : 'border-[#212633] focus:border-[#0066ff]'
                      }`}
                    />
                    {fieldErrors.postalCode && (
                      <p className="text-[11px] text-red-400 font-medium">{fieldErrors.postalCode}</p>
                    )}
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-slate-400 flex items-center justify-between">
                      <span>Email for Courier Tracking</span>
                      <span className="text-[10px] text-slate-500">Required</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="demo.shopper@example.co.za"
                      className={`w-full min-h-[44px] bg-[#0c0e12] border rounded-xl p-2.5 text-white focus:outline-none ${
                        fieldErrors.email ? 'border-red-500' : 'border-[#212633] focus:border-[#0066ff]'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] text-red-400 font-medium">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Truck className="w-4 h-4 text-[#0066ff]" />
                    <span>Choose Delivery Method</span>
                  </div>
                  {subtotalZAR >= 750 && (
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Free Standard Shipping Unlocked!
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  <label 
                    onClick={() => setDeliveryMethod('courier')}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      deliveryMethod === 'courier'
                        ? 'border-[#0066ff] bg-[#0066ff]/10'
                        : 'border-[#212633] bg-[#0c0e12] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={deliveryMethod === 'courier'}
                        onChange={() => setDeliveryMethod('courier')}
                        className="text-[#0066ff]"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">Standard Door-to-Door Courier</p>
                        <p className="text-[11px] text-slate-400">The Courier Guy / Fastway (2-3 business days across SA)</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">
                      {subtotalZAR >= 750 ? 'FREE' : 'R 85'}
                    </span>
                  </label>

                  <label 
                    onClick={() => setDeliveryMethod('pargo')}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      deliveryMethod === 'pargo'
                        ? 'border-[#0066ff] bg-[#0066ff]/10'
                        : 'border-[#212633] bg-[#0c0e12] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={deliveryMethod === 'pargo'}
                        onChange={() => setDeliveryMethod('pargo')}
                        className="text-[#0066ff]"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">Pargo Pickup Point / Locker</p>
                        <p className="text-[11px] text-slate-400">Collect at your nearest Clicks / FreshStop locker</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">R 60</span>
                  </label>

                  <label 
                    onClick={() => setDeliveryMethod('express')}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      deliveryMethod === 'express'
                        ? 'border-[#0066ff] bg-[#0066ff]/10'
                        : 'border-[#212633] bg-[#0c0e12] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={deliveryMethod === 'express'}
                        onChange={() => setDeliveryMethod('express')}
                        className="text-[#0066ff]"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">Express Next-Day Courier</p>
                        <p className="text-[11px] text-slate-400">Major metropolitan centres (JHB, CPT, DBN)</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">R 140</span>
                  </label>
                </div>
              </div>

              {/* Simulated Payment Options */}
              <div className="p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <CreditCard className="w-4 h-4 text-[#0066ff]" />
                    <span>Payment Method (Simulated Sandbox)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    No Real Charge
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ozow')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      paymentMethod === 'ozow'
                        ? 'border-[#0066ff] bg-[#0066ff]/15'
                        : 'border-[#212633] bg-[#0c0e12] hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">Ozow Instant EFT</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">FNB, Standard, Nedbank, Absa</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('capitec')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      paymentMethod === 'capitec'
                        ? 'border-[#0066ff] bg-[#0066ff]/15'
                        : 'border-[#212633] bg-[#0c0e12] hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">Capitec Pay</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">1-click SA mobile approval</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-[#0066ff] bg-[#0066ff]/15'
                        : 'border-[#212633] bg-[#0c0e12] hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">Debit / Credit Card</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Visa & Mastercard</p>
                  </button>
                </div>

                <div className="p-3 bg-[#0c0e12] rounded-xl border border-[#212633] flex items-center gap-2 text-xs text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Simulated gateway enabled. Submitting will generate a verified order receipt with courier waybill.
                  </span>
                </div>
              </div>

            </form>
          )}

        </div>

        {/* Right Column: Order Summary (Sticky) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-6 sticky top-24 shadow-xl">
            <h3 className="text-base font-bold text-white tracking-tight">
              Order Summary
            </h3>

            {/* Calculations */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span>Subtotal ({resolvedCartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-mono font-bold text-white">
                  R {subtotalZAR.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Payment Protection Fee (8%)</span>
                <span className="font-mono text-white">
                  R {buyerProtectionFee.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>South African Courier</span>
                <span className="font-mono text-white">
                  {deliveryCost === 0 ? (
                    <span className="text-emerald-400 font-bold">FREE</span>
                  ) : (
                    `R ${deliveryCost.toLocaleString()}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-[#212633] flex items-baseline justify-between">
                <div>
                  <span className="text-base font-bold text-white block">Total (ZAR)</span>
                  <span className="text-[11px] text-slate-400">Includes 15% SA VAT</span>
                </div>
                <span className="text-2xl font-black font-mono text-[#0066ff]">
                  R {grandTotalZAR.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress Actions */}
            {step === 'basket' ? (
              <div key="basket-action-panel" className="space-y-2">
                <button
                  key="btn-proceed-to-checkout"
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={resolvedCartItems.some(i => i.product.stock <= 0)}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#19BFFF] hover:bg-[#00AEEF] disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-[#0D1018] flex items-center justify-center gap-2 shadow-lg shadow-[#19BFFF]/25 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {resolvedCartItems.some(i => i.product.stock <= 0) && (
                  <p className="text-[11px] text-red-400 text-center font-medium">
                    An item in your basket is currently out of stock. Please remove it to proceed.
                  </p>
                )}
              </div>
            ) : (
              <div key="checkout-action-panel" className="space-y-2.5">
                <button
                  key="btn-place-order"
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isProcessingPayment || hasAnyStockIssue}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer transition-all active:scale-[0.99]"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Simulating SA Payment Approval...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Place Order · R {grandTotalZAR.toLocaleString()}</span>
                    </>
                  )}
                </button>

                <button
                  key="btn-edit-basket"
                  type="button"
                  onClick={() => {
                    setStep('basket');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Cart to Edit Items</span>
                </button>
              </div>
            )}

            {/* Reassurance */}
            <div className="pt-2 border-t border-[#212633] space-y-2 text-[11px] text-slate-400">
              <div className="flex items-start gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#0066ff] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Payment Protection</span>
                  <span className="text-[10px] text-slate-400 leading-snug block mt-0.5">
                    Our intended payment-protection system would use a third-party financial institution to hold payment until you confirm receipt, subject to the agreed terms.
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic pt-1 border-t border-[#1e2330]">
                Demo only. No real funds are held or transferred.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
