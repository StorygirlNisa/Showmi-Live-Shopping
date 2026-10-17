import React, { useState, useMemo } from 'react';
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

interface BasketCheckoutViewProps {
  cartItems: CartItem[];
  productsList?: Product[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onBackToDiscover: () => void;
  onSelectProduct: (productId: string) => void;
  onPlaceOrder?: (orderItems: CartItem[]) => boolean | void;
  onSimulateStockChange?: (productId: string, newStock: number) => void;
}

export const BasketCheckoutView: React.FC<BasketCheckoutViewProps> = ({
  cartItems,
  productsList = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onBackToDiscover,
  onSelectProduct,
  onPlaceOrder,
  onSimulateStockChange
}) => {
  // Checkout Form State
  const [step, setStep] = useState<'basket' | 'checkout' | 'confirmation'>('basket');
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pargo' | 'express'>('courier');
  const [paymentMethod, setPaymentMethod] = useState<'ozow' | 'capitec' | 'card'>('ozow');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderConfirmation | null>(null);
  const [checkoutStockError, setCheckoutStockError] = useState<string | null>(null);

  // Customer Details
  const [formData, setFormData] = useState({
    fullName: 'Nisa Bardien',
    email: 'nisabardien@gmail.com',
    phone: '+27 82 555 1234',
    address: '14 Kloof Nek Road, Gardens',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8001'
  });

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

  const subtotalZAR = resolvedCartItems.reduce(
    (sum, item) => sum + item.product.priceZAR * item.quantity, 
    0
  );

  // Delivery calculation
  const getDeliveryCost = () => {
    if (resolvedCartItems.length === 0) return 0;
    if (deliveryMethod === 'express') return 140;
    if (deliveryMethod === 'pargo') return 60;
    // Standard Door-to-Door courier is free over R750
    return subtotalZAR >= 750 ? 0 : 85;
  };

  const deliveryCost = getDeliveryCost();
  const grandTotalZAR = subtotalZAR + deliveryCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStockError(null);

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

    setIsProcessingPayment(true);

    setTimeout(() => {
      // Re-verify at transaction confirmation time
      const finalFailing = resolvedCartItems.filter(
        item => item.product.stock <= 0 || item.quantity > item.product.stock
      );

      if (finalFailing.length > 0) {
        setIsProcessingPayment(false);
        setCheckoutStockError('Order cancelled: stock was updated elsewhere while approving payment. Please adjust your basket.');
        return;
      }

      setIsProcessingPayment(false);
      const newOrder: OrderConfirmation = {
        orderId: `SHW-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('en-ZA', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }),
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: `${formData.address}, ${formData.city}`,
        province: formData.province,
        postalCode: formData.postalCode,
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
        items: [...resolvedCartItems],
        subtotalZAR,
        shippingZAR: deliveryCost,
        totalZAR: grandTotalZAR,
        estimatedDeliveryDate: '2–3 Business Days'
      };

      setCompletedOrder(newOrder);
      setStep('confirmation');
      if (onPlaceOrder) {
        onPlaceOrder([...resolvedCartItems]);
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
              Order Confirmed!
            </h1>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Thank you, {completedOrder.customerName}. Your simulated order has been registered and scheduled for dispatch.
            </p>
          </div>

          {/* Reference Banner */}
          <div className="bg-[#0c0e12] rounded-2xl p-4 border border-[#212633] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-md mx-auto">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Order Reference</p>
              <p className="text-lg font-bold font-mono text-[#0066ff]">{completedOrder.orderId}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Estimated Dispatch</p>
              <p className="text-sm font-bold text-white">Within 24–48 Hours</p>
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

          <button
            onClick={onBackToDiscover}
            className="w-full py-3 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Back to Showmi Marketplace
          </button>

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
            onClick={onBackToDiscover}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {step === 'basket' ? 'Your Shopping Basket' : 'Checkout & Dispatch Details'}
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`px-2 py-0.5 rounded ${step === 'basket' ? 'bg-[#0066ff] text-white font-bold' : 'text-slate-400'}`}>
            1. Basket
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-2 py-0.5 rounded ${step === 'checkout' ? 'bg-[#0066ff] text-white font-bold' : 'text-slate-400'}`}>
            2. Delivery & Pay
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
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                      <div className="flex items-center bg-[#0c0e12] border border-[#212633] rounded-lg overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
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
              
              {/* Delivery Address Card */}
              <div className="p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <MapPin className="w-4 h-4 text-[#0066ff]" />
                  <span>South African Delivery Address</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0066ff]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Mobile Phone (SA)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+27 82 123 4567"
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0066ff]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-400">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. 14 Kloof Nek Road, Gardens"
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0066ff]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">City / Suburb</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0066ff]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Province</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0066ff]"
                    >
                      {SA_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="8001"
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0066ff]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Email for Courier Tracking</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0066ff]"
                      required
                    />
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
                <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-mono font-bold text-white">
                  R {subtotalZAR.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>South African Courier</span>
                <span className="font-mono text-white">
                  {deliveryCost === 0 ? (
                    <span className="text-emerald-400 font-bold">FREE</span>
                  ) : (
                    `R ${deliveryCost}`
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

            {/* Progress Button */}
            {step === 'basket' ? (
              <div className="space-y-2">
                <button
                  onClick={() => setStep('checkout')}
                  disabled={cartItems.some(i => i.product.stock <= 0)}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#0066ff] hover:bg-[#0052cc] disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 shadow-lg shadow-[#0066ff]/25 cursor-pointer transition-all active:scale-[0.99]"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
                {cartItems.some(i => i.product.stock <= 0) && (
                  <p className="text-[11px] text-red-400 text-center font-medium">
                    An item in your basket is currently out of stock. Please remove it to proceed.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Simulating SA Payment Approval...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Place Simulated Order · R {grandTotalZAR.toLocaleString()}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('basket')}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer text-center"
                >
                  Edit Basket Items
                </button>
              </div>
            )}

            {/* Reassurance */}
            <div className="pt-2 border-t border-[#212633] space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0066ff] shrink-0" />
                <span>Simulated demo mode: No real debit or banking credentials required.</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Estimated dispatch 24–48 hours from artisan workshops.</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
