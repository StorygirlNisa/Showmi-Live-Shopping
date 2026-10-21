/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, Store, Sparkles, Radio, ShoppingBag, Package } from 'lucide-react';
import { Navigation, AppTab } from './components/Navigation';
import { AdminRoleSwitcher } from './components/AdminRoleSwitcher';
import { ProductDetailView } from './components/ProductDetailView';
import { SellerShowroomView, SellerStorefrontView } from './components/SellerShowroomView';
import { LiveRoomView } from './components/LiveRoomView';
import { BasketCheckoutView } from './components/BasketCheckoutView';
import { SellersListView } from './components/SellersListView';
import { LiveStreamsListView } from './components/LiveStreamsListView';
import { SellerDashboardView } from './components/SellerDashboardView';
import { SetupInfoModal } from './components/SetupInfoModal';
import { SellerSignInModal } from './components/SellerSignInModal';
import { SellerHostModeView } from './components/SellerHostModeView';
import { ResponsivePreviewToolbar, ViewportMode } from './components/ResponsivePreviewToolbar';
import { SearchResultsView } from './components/SearchResultsView';

import { PRODUCTS, SELLERS, LIVE_SESSIONS, INITIAL_PROMOTIONS, INITIAL_ORDERS, INITIAL_ISSUES } from './data/mockData';
import { Product, CartItem, StreamSnippet, LivePromotion, Order, OrderItem, OrderIssue, IssueType } from './types';
import { MyOrdersView } from './components/MyOrdersView';
import { OrderPlacementPayload } from './components/BasketCheckoutView';
import { ProfileModal } from './components/ProfileModal';
import { HostDisclaimerModal } from './components/HostDisclaimerModal';

const STORAGE_KEYS = {
  PRODUCTS: 'showmi_products_v1',
  CART: 'showmi_cart_v1',
  SNIPPETS: 'showmi_snippets_v1',
  PROMOTIONS: 'showmi_promotions_v1',
  ORDERS: 'showmi_orders_v1',
  ORDER_ISSUES: 'showmi_order_issues_v1',
  USER_ROLE: 'showmi_user_role_v1',
  SELLER_ID: 'showmi_current_seller_id_v1',
  FOLLOWED_SELLERS: 'showmi_followed_sellers_v1'
};

// In-memory fallback map to handle sandbox iframe storage restrictions or QuotaExceededError
const memoryStorageFallback = new Map<string, string>();

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    } catch {}
    return memoryStorageFallback.get(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage quota exceeded or disabled in sandbox iframe
      try {
        // Free up space by pruning non-essential cache keys
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith('showmi_') && (k.includes('snippets') || k.includes('promotions') || k.includes('issues'))) {
            localStorage.removeItem(k);
          }
        }
        localStorage.setItem(key, value);
      } catch {
        // Fallback to in-memory store so the app functions seamlessly without errors
        memoryStorageFallback.set(key, value);
      }
    }
  },
  removeItem: (key: string) => {
    memoryStorageFallback.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

export default function App() {
  // Role & Authentication State
  const [userRole, setUserRole] = useState<'admin' | 'buyer' | 'seller'>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.USER_ROLE);
      if (saved === 'seller' || saved === 'admin') return saved;
    } catch {}
    return 'buyer';
  });

  const [currentSellerId, setCurrentSellerId] = useState<string>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.SELLER_ID);
      if (saved) return saved;
    } catch {}
    return SELLERS[0].id;
  });

  const [followedSellerIds, setFollowedSellerIds] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.FOLLOWED_SELLERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SELLERS.map(s => s.id);
  });

  // Core Navigation Tabs: 'LIVE' | 'SA Makers' | 'Seller Studio' | 'Basket'
  const [activeTab, setActiveTab] = useState<AppTab>('LIVE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [activeLiveSessionId, setActiveLiveSessionId] = useState<string | null>(null);
  const [basketInitialStep, setBasketInitialStep] = useState<'basket' | 'checkout'>('basket');
  
  // Modals
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSellerSignInModalOpen, setIsSellerSignInModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHostDisclaimerOpen, setIsHostDisclaimerOpen] = useState(false);
  const [pendingHostSessionId, setPendingHostSessionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Dynamic products list persisted to localStorage
  const [productsList, setProductsList] = useState<Product[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRODUCTS;
  });

  // Basket State with initial item for demonstration, persisted to localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => {
            const foundProduct = PRODUCTS.find(p => p.id === item.productId || p.id === item.product?.id);
            return {
              product: foundProduct || item.product,
              quantity: item.quantity || 1
            };
          }).filter(item => Boolean(item.product));
        }
      }
    } catch {}
    return [
      {
        product: PRODUCTS[0],
        quantity: 1
      }
    ];
  });

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Dynamic snippets list with expiry and archive status, persisted to localStorage
  const [snippetsList, setSnippetsList] = useState<StreamSnippet[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.SNIPPETS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SELLERS.flatMap(s => s.snippets);
  });

  // Dynamic orders list, persisted to localStorage
  const [ordersList, setOrdersList] = useState<Order[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ORDERS;
  });

  // Dynamic promotions list, persisted to localStorage
  const [promotionsList, setPromotionsList] = useState<LivePromotion[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.PROMOTIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROMOTIONS;
  });

  // Dynamic order issues list, persisted to localStorage
  const [orderIssues, setOrderIssues] = useState<OrderIssue[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.ORDER_ISSUES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ISSUES;
  });

  // Host Mode toggle: controls private host mode during live stream
  const [isSellerHostMode, setIsSellerHostMode] = useState<boolean>(false);

  // Development-only responsive layout preview mode
  const [viewportMode, setViewportMode] = useState<ViewportMode>('responsive');
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  // Sync role & state to safe storage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.USER_ROLE, userRole);
    safeStorage.setItem(STORAGE_KEYS.SELLER_ID, currentSellerId);
    safeStorage.setItem(STORAGE_KEYS.FOLLOWED_SELLERS, JSON.stringify(followedSellerIds));
  }, [userRole, currentSellerId, followedSellerIds]);

  // Sync products to safe storage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsList));
  }, [productsList]);

  // Sync cart to safe storage with lightweight payload
  useEffect(() => {
    try {
      const lightweightCart = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          priceZAR: item.product.priceZAR,
          stock: item.product.stock,
          images: item.product.images?.slice(0, 1),
          sellerId: item.product.sellerId,
          sellerName: item.product.sellerName
        }
      }));
      safeStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(lightweightCart));
    } catch {}
  }, [cartItems]);

  // Sync snippets to safe storage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.SNIPPETS, JSON.stringify(snippetsList));
  }, [snippetsList]);

  // Sync orders to safe storage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ordersList));
  }, [ordersList]);

  // Sync promotions to safe storage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promotionsList));
  }, [promotionsList]);

  // Sync order issues to safe storage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.ORDER_ISSUES, JSON.stringify(orderIssues));
  }, [orderIssues]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Reference to prevent accidental duplicate additions caused by single button tap
  const lastAddRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });

  const handleAddToCart = (product: Product, quantity = 1) => {
    const currentProduct = productsList.find(p => p.id === product.id) || product;
    const availableStock = typeof currentProduct.stock === 'number' ? currentProduct.stock : 99;

    if (availableStock <= 0) {
      showNotification(`${currentProduct.name} is currently out of stock`);
      return;
    }

    // Prevent accidental duplicate additions caused by rapid single button tap
    const now = Date.now();
    if (lastAddRef.current.id === product.id && now - lastAddRef.current.time < 500) {
      return;
    }
    lastAddRef.current = { id: product.id, time: now };

    console.log('Adding to cart:', currentProduct.name, 'qty:', quantity);
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === currentProduct.id);
      if (existing) {
        const newQty = Math.min(availableStock, existing.quantity + quantity);
        return prev.map(item =>
          item.product.id === currentProduct.id
            ? { ...item, product: currentProduct, quantity: newQty }
            : item
        );
      }
      return [...prev, { product: currentProduct, quantity: Math.min(availableStock, quantity) }];
    });
    console.log('Cart state updated');
    if (activeTab !== 'LIVE') {
      showNotification('Added to basket. Keep browsing!');
    }
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    const currentProduct = productsList.find(p => p.id === product.id) || product;

    if (currentProduct.stock <= 0) {
      showNotification(`${currentProduct.name} is currently out of stock`);
      return;
    }

    // Prevent accidental duplicate additions caused by rapid single button tap
    const now = Date.now();
    if (lastAddRef.current.id === product.id && now - lastAddRef.current.time < 500) {
      return;
    }
    lastAddRef.current = { id: product.id, time: now };

    // Add selected product to basket while preserving all existing items
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === currentProduct.id);
      if (existing) {
        const newQty = Math.min(currentProduct.stock, existing.quantity + quantity);
        return prev.map(item =>
          item.product.id === currentProduct.id
            ? { ...item, product: currentProduct, quantity: newQty }
            : item
        );
      }
      return [...prev, { product: currentProduct, quantity: Math.min(currentProduct.stock, quantity) }];
    });

    // Navigate to Basket & Checkout flow at Step 1: Basket (do not skip to checkout)
    setSelectedProductId(null);
    setActiveLiveSessionId(null);
    setSelectedSellerId(null);
    setBasketInitialStep('basket');
    setActiveTab('Basket');
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const currentProduct = productsList.find(p => p.id === productId);
    const maxStock = currentProduct ? currentProduct.stock : 999;
    const clampedQty = Math.max(1, Math.min(maxStock, quantity));
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: clampedQty } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order placement, inventory decrement & persistent storage
  const handlePlaceOrder = (orderPayload: OrderPlacementPayload) => {
    // 1. Decrement inventory
    setProductsList(prevProducts => {
      return prevProducts.map(prod => {
        const purchased = orderPayload.items.find(item => item.product.id === prod.id);
        if (purchased) {
          const updatedStock = Math.max(0, prod.stock - purchased.quantity);
          return {
            ...prod,
            stock: updatedStock
          };
        }
        return prod;
      });
    });

    // 2. Construct persistent Order record
    const newOrderRecord: Order = {
      id: orderPayload.orderId,
      buyerId: 'buyer-current',
      customerName: orderPayload.customerName,
      customerEmail: orderPayload.customerEmail,
      customerPhone: orderPayload.customerPhone,
      shippingAddress: orderPayload.shippingAddress,
      city: orderPayload.city,
      province: orderPayload.province,
      postalCode: orderPayload.postalCode,
      items: orderPayload.items.map(ci => ({
        productId: ci.product.id,
        sellerId: ci.product.sellerId,
        sellerName: ci.product.sellerName,
        productImage: ci.product.images[0],
        name: ci.product.name,
        quantity: ci.quantity,
        priceZAR: ci.product.priceZAR,
        status: 'awaiting_dispatch' as const
      })),
      subtotalZAR: orderPayload.subtotalZAR,
      shippingZAR: orderPayload.shippingZAR,
      protectionFeeZAR: orderPayload.protectionFeeZAR,
      totalZAR: orderPayload.totalZAR,
      createdAt: new Date().toISOString(),
      estimatedDeliveryDate: orderPayload.estimatedDeliveryDate,
      protectionExpiresAt: orderPayload.protectionExpiresAt,
      deliveryMethod: orderPayload.deliveryMethod,
      paymentMethod: orderPayload.paymentMethod
    };

    // 3. Add to ordersList (avoiding duplicates)
    setOrdersList(prev => {
      if (prev.some(o => o.id === newOrderRecord.id)) {
        return prev;
      }
      return [newOrderRecord, ...prev];
    });

    showNotification(`Order #${newOrderRecord.id} saved & inventory updated!`);
  };

  // Seller dispatch & fulfillment status updates (scoped by seller ID)
  const handleUpdateOrderItemStatus = (
    orderId: string, 
    productId: string, 
    sellerId: string, 
    newStatus: OrderItem['status'], 
    tracking?: { courierPartner?: string; trackingNumber?: string }
  ) => {
    setOrdersList(prev => 
      prev.map(order => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          items: order.items.map(item => {
            // Permission check: seller can only update their own items
            if (item.productId === productId && item.sellerId === sellerId) {
              return {
                ...item,
                status: newStatus,
                courierPartner: tracking?.courierPartner || item.courierPartner,
                trackingNumber: tracking?.trackingNumber || item.trackingNumber,
                dispatchedAt: newStatus === 'in_transit' ? new Date().toISOString() : item.dispatchedAt,
                deliveredAt: newStatus === 'delivered' ? new Date().toISOString() : item.deliveredAt,
              };
            }
            return item;
          })
        };
      })
    );
    showNotification(`Status updated: ${newStatus.replace('_', ' ')}`);
  };

  // Buyer receipt confirmation (Simulated payment release)
  const handleConfirmItemReceipt = (orderId: string, productId: string) => {
    setOrdersList(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = new Date().toISOString();
        const updatedItems = order.items.map(item => {
          if (item.productId === productId) {
            return {
              ...item,
              status: 'confirmed' as const,
              confirmedAt: now,
              paymentReleased: true,
              paymentReleasedAt: now
            };
          }
          return item;
        });

        const allConfirmed = updatedItems.every(i => i.status === 'confirmed');
        return {
          ...order,
          items: updatedItems,
          confirmedAt: allConfirmed ? now : order.confirmedAt,
          paymentReleased: allConfirmed ? true : order.paymentReleased,
          paymentReleasedAt: allConfirmed ? now : order.paymentReleasedAt
        };
      })
    );
    showNotification('Delivery confirmed! Simulated payment released to seller.');
  };

  // Buyer issue reporting handler (persisted to localStorage)
  const handleReportIssue = (payload: {
    orderId: string;
    productId: string;
    sellerId: string;
    issueType: IssueType;
    issueTypeLabel: string;
    description: string;
    evidenceImage?: string;
    isPostReleaseReturn?: boolean;
  }) => {
    setOrderIssues(prev => {
      // Prevent duplicate issues for the same order item
      const exists = prev.some(i => i.orderId === payload.orderId && i.productId === payload.productId);
      if (exists) {
        showNotification('An issue report or query is already open for this item.');
        return prev;
      }

      const newIssue: OrderIssue = {
        id: `ISS-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: payload.orderId,
        productId: payload.productId,
        buyerId: 'buyer-demo-01',
        sellerId: payload.sellerId,
        issueType: payload.issueType,
        issueTypeLabel: payload.issueTypeLabel,
        description: payload.description,
        evidenceImage: payload.evidenceImage,
        status: 'submitted',
        createdAt: new Date().toISOString(),
        isPostReleaseReturn: payload.isPostReleaseReturn
      };

      return [newIssue, ...prev];
    });
  };

  // Seller issue response & resolution note handler (persisted to localStorage)
  const handleSellerRespondIssue = (
    issueId: string,
    response: { message: string; resolutionNote?: string; status?: 'seller_responded' | 'resolved' }
  ) => {
    setOrderIssues(prev =>
      prev.map(issue => {
        if (issue.id !== issueId) return issue;
        return {
          ...issue,
          status: response.status || 'seller_responded',
          sellerResponse: {
            message: response.message,
            resolutionNote: response.resolutionNote,
            respondedAt: new Date().toISOString()
          }
        };
      })
    );
    showNotification('Response and resolution note saved!');
  };

  // Snippet lifecycle handlers
  const handlePublishSnippet = (snippet: StreamSnippet) => {
    setSnippetsList(prev => {
      const exists = prev.some(s => s.id === snippet.id);
      if (exists) {
        return prev.map(s => (s.id === snippet.id ? snippet : s));
      }
      return [snippet, ...prev];
    });
    showNotification('Shoppable snippet published to storefront!');
  };

  const handleArchiveSnippet = (snippetId: string) => {
    setSnippetsList(prev =>
      prev.map(s => (s.id === snippetId ? { ...s, isArchived: true } : s))
    );
    showNotification('Snippet removed from public storefront and moved to private archive');
  };

  const handleExpireSnippetNow = (snippetId: string) => {
    const pastDate = new Date(Date.now() - 60000).toISOString();
    setSnippetsList(prev =>
      prev.map(s => (s.id === snippetId ? { ...s, expiresAt: pastDate } : s))
    );
    showNotification('Simulated expiry! Snippet hidden from storefront and moved to private archive');
  };

  const handleRepublishSnippet = (snippetId: string, durationHours: number) => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + durationHours * 3600000);
    setSnippetsList(prev =>
      prev.map(s =>
        s.id === snippetId
          ? {
              ...s,
              publishedAt: now.toISOString(),
              expiresAt: expiryDate.toISOString(),
              expiryDurationHours: durationHours,
              isArchived: false
            }
          : s
      )
    );
    showNotification(`Snippet republished! Active for ${durationHours === 168 ? '7 days' : durationHours + ' hours'}`);
  };

  // Product Inventory CRUD Handlers for Seller Studio
  const handleAddProduct = (product: Product) => {
    setProductsList(prev => [product, ...prev]);
    showNotification(`Added new product "${product.name}" to store inventory`);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProductsList(prev =>
      prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    showNotification(`Updated product "${updatedProduct.name}"`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProductsList(prev => prev.filter(p => p.id !== productId));
    showNotification('Removed product from store inventory');
  };

  const handleResetDemoData = () => {
    safeStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    safeStorage.removeItem(STORAGE_KEYS.CART);
    safeStorage.removeItem(STORAGE_KEYS.SNIPPETS);
    safeStorage.removeItem(STORAGE_KEYS.PROMOTIONS);
    safeStorage.removeItem(STORAGE_KEYS.ORDERS);
    safeStorage.removeItem(STORAGE_KEYS.ORDER_ISSUES);
    safeStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    safeStorage.removeItem(STORAGE_KEYS.SELLER_ID);
    safeStorage.removeItem(STORAGE_KEYS.FOLLOWED_SELLERS);
    setProductsList(PRODUCTS);
    setCartItems([{ product: PRODUCTS[0], quantity: 1 }]);
    setSnippetsList(SELLERS.flatMap(s => s.snippets));
    setPromotionsList(INITIAL_PROMOTIONS);
    setOrdersList(INITIAL_ORDERS);
    setOrderIssues(INITIAL_ISSUES);
    setUserRole('buyer');
    setCurrentSellerId(SELLERS[0].id);
    setFollowedSellerIds(SELLERS.map(s => s.id));
    setIsSellerHostMode(false);
    setActiveTab('LIVE');
    showNotification('Reset all demo data and role to default buyer');
  };

  // Follow / Unfollow Maker
  const handleToggleFollow = (sellerId: string) => {
    setFollowedSellerIds(prev => {
      const isFollowing = prev.includes(sellerId);
      const next = isFollowing ? prev.filter(id => id !== sellerId) : [...prev, sellerId];
      showNotification(isFollowing ? 'Unfollowed maker' : 'Following maker!');
      return next;
    });
  };

  // Role & Authentication Handlers
  const handleSignInAsSeller = (sellerId: string) => {
    setUserRole('seller');
    setCurrentSellerId(sellerId);
    setActiveTab('Seller Studio');
    showNotification(`Signed in as seller: ${SELLERS.find(s => s.id === sellerId)?.name || 'Maker'}`);
  };

  // Navigation handlers
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleSelectSeller = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setSelectedProductId(null);
  };

  const handleOpenLiveRoom = (sessionId: string) => {
    setActiveLiveSessionId(sessionId);
    setIsSellerHostMode(false);
    setSelectedProductId(null);
    setSelectedSellerId(null);
    setSearchQuery('');
    setActiveTab('LIVE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenHostMode = (sessionId: string) => {
    setPendingHostSessionId(sessionId);
    setIsHostDisclaimerOpen(true);
  };

  const handleConfirmHostDisclaimer = () => {
    if (pendingHostSessionId) {
      setActiveLiveSessionId(pendingHostSessionId);
      setIsSellerHostMode(true);
      setSelectedProductId(null);
    }
    setIsHostDisclaimerOpen(false);
    setPendingHostSessionId(null);
  };

  const handleCancelHostDisclaimer = () => {
    setIsHostDisclaimerOpen(false);
    setPendingHostSessionId(null);
  };

  const handleSimulateOrderStockDecrement = (productId: string) => {
    setProductsList(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock - 1);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
    showNotification('Simulated 1 order! Inventory decremented & stock reminder refreshed');
  };

  const handleExpirePromotionNow = (promoId: string) => {
    const pastDate = new Date(Date.now() - 60000).toISOString();
    setPromotionsList(prev =>
      prev.map(p =>
        p.id === promoId ? { ...p, isActive: false, expiresAt: pastDate } : p
      )
    );
    showNotification('Promotion expired! Verified promo prompt removed from coach queue');
  };

  const handleTabChange = (tab: AppTab) => {
    // Role based navigation restriction
    if (tab === 'Seller Studio' && userRole === 'buyer') {
       showNotification('Access denied: Buyers cannot access management tools. Switch to Admin or Seller role.');
       return;
    }
    if (tab === 'Seller Studio' && userRole !== 'seller' && userRole !== 'admin') {
      setUserRole('seller');
      setCurrentSellerId(currentSellerId || SELLERS[0].id);
    }
    setSearchQuery('');
    setSelectedProductId(null);
    setSelectedSellerId(null);
    if (tab !== 'Basket') {
      setActiveLiveSessionId(null);
      setIsSellerHostMode(false);
    }
    setBasketInitialStep('basket');

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProductDescription = (productId: string, newDesc: string) => {
    setProductsList(prev =>
      prev.map(p => (p.id === productId ? { ...p, description: newDesc } : p))
    );
    showNotification('Product description updated across Showmi');
  };

  // Resolve current active item/entity
  const selectedProduct = selectedProductId 
    ? productsList.find(p => p.id === selectedProductId) 
    : null;

  const selectedSeller = selectedSellerId 
    ? SELLERS.find(s => s.id === selectedSellerId) 
    : selectedProduct 
    ? SELLERS.find(s => s.id === selectedProduct.sellerId) 
    : null;

  const activeLiveSession = activeLiveSessionId 
    ? LIVE_SESSIONS.find(s => s.id === activeLiveSessionId) 
    : null;

  const currentSeller = SELLERS.find(s => s.id === currentSellerId);

  const getViewportWidthStyle = () => {
    switch (viewportMode) {
      case 'mobile-xs':
        return isLandscape ? 'w-[568px]' : 'w-[320px]';
      case 'mobile-sm':
        return isLandscape ? 'w-[667px]' : 'w-[375px]';
      case 'mobile-md':
        return isLandscape ? 'w-[844px]' : 'w-[390px]';
      case 'tablet':
        return isLandscape ? 'w-[1024px]' : 'w-[768px]';
      case 'desktop':
        return 'w-[1200px]';
      default:
        return 'w-full';
    }
  };

  const isLiveFeed = activeTab === 'LIVE' && !selectedProductId && !selectedSellerId && searchQuery.trim() === '' && !isSellerHostMode;
  const isActiveLiveRoom = !!activeLiveSession && !isSellerHostMode;
  const isImmersiveLive = isLiveFeed || isActiveLiveRoom;

  const appContent = (
    <div className={`min-h-screen bg-[#0D1018] text-white flex flex-col selection:bg-[#19BFFF] selection:text-[#0D1018] ${viewportMode !== 'responsive' ? 'relative overflow-hidden' : ''}`}>
      
      {/* Admin Role Switcher (Hackathon Demo Only - Hidden on mobile during immersive LIVE feed or active stream) */}
      <div className={isImmersiveLive ? "hidden md:block" : "block"}>
        <AdminRoleSwitcher
          userRole={userRole}
          setUserRole={setUserRole}
          currentSellerId={currentSellerId}
          onSelectSeller={setCurrentSellerId}
          sellers={SELLERS.map(s => ({ id: s.id, name: s.name }))}
        />
      </div>

      {/* Toast Notification (Non-blocking so it never interrupts video or controls) */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-[#19BFFF] text-[#0D1018] text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl shadow-[#19BFFF]/30 animate-fade-in flex items-center gap-2 pointer-events-none select-none">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Main Navigation (Hidden completely on mobile when viewing LIVE feed or active stream, visible on desktop) */}
      <div className={isImmersiveLive ? "hidden md:block" : "block"}>
        <Navigation
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          cartItems={cartItems}
          ordersCount={ordersList.length}
          onOpenInfoModal={() => setIsSetupModalOpen(true)}
          searchQuery={searchQuery}
          onSearchSubmit={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          userRole={userRole}
          currentSeller={SELLERS.find(s => s.id === currentSellerId)}
          onOpenSellerSignIn={() => setIsSellerSignInModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className={isImmersiveLive ? "flex-1 pb-0 md:pb-20 overflow-hidden" : "flex-1 pb-24 md:pb-20"}>
        {/* Dedicated Search Results View */}
        {searchQuery.trim() !== '' ? (
          <SearchResultsView
            query={searchQuery}
            onClearQuery={() => setSearchQuery('')}
            onSetQuery={(q) => setSearchQuery(q)}
            products={productsList}
            sellers={SELLERS}
            liveSessions={LIVE_SESSIONS}
            snippets={snippetsList}
            onSelectProduct={(id) => {
              setSearchQuery('');
              handleSelectProduct(id);
            }}
            onSelectSeller={(id) => {
              setSearchQuery('');
              handleSelectSeller(id);
            }}
            onOpenLiveRoom={(id) => {
              setSearchQuery('');
              handleOpenLiveRoom(id);
            }}
            onAddToCart={handleAddToCart}
          />
        ) : isSellerHostMode && activeLiveSession ? (
          <SellerHostModeView
            session={activeLiveSession}
            seller={SELLERS.find(s => s.id === activeLiveSession.sellerId) || SELLERS[0]}
            products={productsList}
            promotions={promotionsList}
            onExitHostMode={() => {
              setIsSellerHostMode(false);
              setActiveLiveSessionId(null);
            }}
            onViewShopperLiveRoom={() => setIsSellerHostMode(false)}
            onSimulateOrderStockDecrement={handleSimulateOrderStockDecrement}
            onExpirePromotionNow={handleExpirePromotionNow}
            onSwitchSession={(sessionId) => setActiveLiveSessionId(sessionId)}
          />
        ) : activeLiveSession && !isSellerHostMode ? (
          /* View: Active Livestream Room */
          <LiveRoomView
            session={activeLiveSession}
            products={productsList}
            seller={SELLERS.find(s => s.id === activeLiveSession.sellerId)}
            allLiveSessions={LIVE_SESSIONS}
            onBack={() => setActiveLiveSessionId(null)}
            onSelectProduct={handleSelectProduct}
            onViewSeller={handleSelectSeller}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSwitchSession={(sessionId) => setActiveLiveSessionId(sessionId)}
          />
        ) : selectedProduct ? (
          /* View: Product Detail Page */
          <ProductDetailView
            product={selectedProduct}
            seller={selectedSeller || undefined}
            liveSession={
              selectedProduct.liveNowSessionId
                ? LIVE_SESSIONS.find(s => s.id === selectedProduct.liveNowSessionId)
                : undefined
            }
            onBack={() => setSelectedProductId(null)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onViewSeller={handleSelectSeller}
            onOpenLiveRoom={handleOpenLiveRoom}
          />
        ) : selectedSellerId && selectedSeller ? (
          /* View: Seller Showroom */
          <SellerStorefrontView
            seller={selectedSeller}
            products={productsList}
            snippets={snippetsList}
            onBack={() => setSelectedSellerId(null)}
            onSelectProduct={handleSelectProduct}
            onOpenLiveRoom={handleOpenLiveRoom}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onOpenStudio={
              (userRole === 'seller' && currentSellerId === selectedSeller.id) 
                ? (sellerId: string) => {
                    setCurrentSellerId(sellerId);
                    setSelectedSellerId(null);
                    setActiveTab('Seller Studio');
                  }
                : undefined
            }
          />
        ) : activeTab === 'Seller Studio' && (userRole === 'seller' || userRole === 'admin') ? (
          /* View: Seller Dashboard & AI Selling Assistant */
          <SellerDashboardView
            sellers={SELLERS}
            products={productsList}
            snippets={snippetsList}
            promotions={promotionsList}
            orders={ordersList}
            issues={orderIssues}
            currentSellerId={currentSellerId}
            onSelectSeller={(id) => setCurrentSellerId(id)}
            userRole={userRole}
            onBackToShopping={() => setActiveTab('LIVE')}
            onUpdateProductDescription={handleUpdateProductDescription}
            onPublishSnippet={handlePublishSnippet}
            onArchiveSnippet={handleArchiveSnippet}
            onExpireSnippetNow={handleExpireSnippetNow}
            onRepublishSnippet={handleRepublishSnippet}
            onOpenLiveHostMode={handleOpenHostMode}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderItemStatus={handleUpdateOrderItemStatus}
            onRespondToIssue={handleSellerRespondIssue}
          />
        ) : activeTab === 'My Orders' ? (
          /* View: Buyer Orders & 14-day Protection Tracker */
          <MyOrdersView
            orders={ordersList}
            issues={orderIssues}
            onConfirmDelivery={handleConfirmItemReceipt}
            onReportIssue={handleReportIssue}
            onBackToShopping={() => setActiveTab('LIVE')}
            onSelectProduct={handleSelectProduct}
          />
        ) : activeTab === 'Basket' ? (
          /* View: Basket & Checkout Preview */
          <BasketCheckoutView
            cartItems={cartItems}
            productsList={productsList}
            currentSellerId={userRole === 'seller' ? currentSellerId : undefined}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onBackToDiscover={() => {
              if (activeLiveSessionId) {
                setActiveTab('LIVE');
              } else {
                handleTabChange('LIVE');
              }
            }}
            onSelectProduct={handleSelectProduct}
            onPlaceOrder={handlePlaceOrder}
            onViewOrders={() => setActiveTab('My Orders')}
            initialStep={basketInitialStep}
          />
        ) : activeTab === 'Showrooms' ? (
          /* View: Showrooms Directory */
          <SellersListView
            sellers={SELLERS}
            products={productsList}
            snippets={snippetsList}
            onSelectSeller={handleSelectSeller}
            onOpenLiveRoom={handleOpenLiveRoom}
            followedSellerIds={followedSellerIds}
            onToggleFollow={handleToggleFollow}
          />
        ) : (
          /* Default View: LIVE Streams Immersive Shopping Feed with Vertical Scrolling */
          <LiveStreamsListView
            liveSessions={LIVE_SESSIONS}
            products={productsList}
            sellers={SELLERS}
            onOpenLiveRoom={handleOpenLiveRoom}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSelectSeller={handleSelectSeller}
            onOpenTab={handleTabChange}
            cartItems={cartItems}
            ordersCount={ordersList.length}
            searchQuery={searchQuery}
            onSearchSubmit={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        )}
      </main>

      {/* Architecture & Free Setup Modal */}
      <SetupInfoModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onResetDemoData={handleResetDemoData}
      />

      {/* Seller Sign-In & Account Selection Modal */}
      <SellerSignInModal
        isOpen={isSellerSignInModalOpen}
        onClose={() => setIsSellerSignInModalOpen(false)}
        sellers={SELLERS}
        onSignInAsSeller={handleSignInAsSeller}
      />

      {/* Fixed Black Footer: Profile | Showroom | Cart | Seller Studio */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D1018] border-t border-[#242936] py-2.5 px-4 shadow-2xl safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center justify-around h-12">
          {/* 1. Profile */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
              isProfileModalOpen ? 'text-[#19BFFF]' : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Profile and account settings"
            title="Profile"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold text-white">Profile</span>
          </button>

          {/* 2. Showroom */}
          <button
            onClick={() => handleTabChange('Showrooms')}
            className={`flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'Showrooms' ? 'text-[#19BFFF]' : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Showrooms directory"
            title="Showroom"
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-bold text-white">Showroom</span>
          </button>

          {/* 3. Cart */}
          <button
            onClick={() => handleTabChange('Basket')}
            className={`flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer relative ${
              activeTab === 'Basket' ? 'text-[#19BFFF]' : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Cart and checkout"
            title="Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#19BFFF] text-[#0D1018] px-1 py-0.2 rounded-full text-[9px] font-extrabold tabular-nums">
                  {totalItemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-white">Cart</span>
          </button>

          {/* 4. Seller Studio */}
          <button
            onClick={() => handleTabChange('Seller Studio')}
            className={`flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'Seller Studio' ? 'text-[#19BFFF]' : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Seller Studio management"
            title="Seller Studio"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-bold text-white">Seller Studio</span>
          </button>
        </div>
      </footer>

      {/* Profile & Account Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userRole={userRole}
        setUserRole={setUserRole}
        currentSeller={currentSeller}
        sellers={SELLERS}
        onSelectSeller={(sellerId) => {
          setCurrentSellerId(sellerId);
          safeStorage.setItem(STORAGE_KEYS.SELLER_ID, sellerId);
        }}
        onOpenTab={handleTabChange}
        ordersCount={ordersList.length}
      />

      {/* Mandatory Host Mode AI Disclaimer Confirmation Modal */}
      <HostDisclaimerModal
        isOpen={isHostDisclaimerOpen}
        onConfirm={handleConfirmHostDisclaimer}
        onCancel={handleCancelHostDisclaimer}
      />

      {/* Development-only Responsive Preview Option Toolbar */}
      <ResponsivePreviewToolbar
        currentMode={viewportMode}
        onModeChange={setViewportMode}
        isLandscape={isLandscape}
        onToggleOrientation={() => setIsLandscape(prev => !prev)}
      />

    </div>
  );

  if (viewportMode !== 'responsive') {
    return (
      <div className="min-h-screen bg-[#07090d] py-6 px-3 flex flex-col items-center justify-start overflow-x-auto">
        <div className="mb-4 px-4 py-2 rounded-full bg-[#171A21] border border-[#242936] text-xs font-mono text-slate-300 flex items-center gap-3 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            Simulating Viewport: <strong className="text-white">{viewportMode}</strong> ({isLandscape ? 'Landscape' : 'Portrait'})
          </span>
          <button
            onClick={() => setViewportMode('responsive')}
            className="text-[#19BFFF] hover:text-[#00AEEF] underline font-bold cursor-pointer ml-1"
          >
            ✕ Full Screen Fluid
          </button>
        </div>

        <div className={`${getViewportWidthStyle()} transition-all duration-300 rounded-[2.5rem] border-8 border-[#242936] shadow-2xl overflow-y-auto bg-[#0D1018] max-h-[92vh] min-h-[640px] relative`}>
          {appContent}
        </div>
      </div>
    );
  }

  return appContent;
}
