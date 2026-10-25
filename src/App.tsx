/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { AuthModal, AccountType } from './components/AuthModal';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  where
} from 'firebase/firestore';
import { auth, db } from './lib/firebase';

import { PRODUCTS, SELLERS, LIVE_SESSIONS, INITIAL_PROMOTIONS, INITIAL_ORDERS, INITIAL_ISSUES } from './data/mockData';
import { Product, Seller, CartItem, StreamSnippet, LivePromotion, Order, OrderItem, OrderIssue, IssueType, LiveComment, LiveSession, Withdrawal } from './types';
import { MyOrdersView } from './components/MyOrdersView';
import { OrderPlacementPayload } from './components/BasketCheckoutView';
import { ProfileModal } from './components/ProfileModal';
import { HostDisclaimerModal } from './components/HostDisclaimerModal';
import { LiveCountdownOverlay } from './components/LiveCountdownOverlay';

const STORAGE_KEYS = {
  PRODUCTS: 'showmi_products_v1',
  CART: 'showmi_cart_v1',
  SNIPPETS: 'showmi_snippets_v1',
  PROMOTIONS: 'showmi_promotions_v1',
  ORDERS: 'showmi_orders_v1',
  ORDER_ISSUES: 'showmi_order_issues_v1',
  USER_ROLE: 'showmi_user_role_v1',
  SELLER_ID: 'showmi_current_seller_id_v1',
  FOLLOWED_SELLERS: 'showmi_followed_sellers_v1',
  SESSION_MODERATORS: 'showmi_session_moderators_v1',
  SESSION_COMMENTS: 'showmi_session_comments_v1',
  DELETED_COMMENTS: 'showmi_deleted_comments_v1',
  WITHDRAWALS: 'showmi_withdrawals_v1'
};

// In-memory fallback map to handle sandbox iframe storage restrictions or QuotaExceededError
const memoryStorageFallback = new Map<string, string>();

const cleanFirestoreData = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj === undefined ? null : obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestoreData).filter(item => item !== undefined);
  }
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = cleanFirestoreData(val);
    }
  }
  return cleaned;
};

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

interface CartOriginContext {
  tab: AppTab;
  selectedProductId: string | null;
  selectedSellerId: string | null;
  activeLiveSessionId: string | null;
  isSellerHostMode: boolean;
  searchQuery: string;
  windowScrollY: number;
}

export default function App() {
  // Role & Authentication State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'buyer' | 'seller'>('buyer');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [currentSellerId, setCurrentSellerId] = useState<string>(SELLERS[0].id);
  const pendingRegistrationRoleRef = useRef<{ email: string; role: 'buyer' | 'seller' } | null>(null);

  const [followedSellerIds, setFollowedSellerIds] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.FOLLOWED_SELLERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SELLERS.map(s => s.id);
  });

  // Sync User Profile with Firestore (Real-time)
  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeUserDoc = onSnapshot(userDocRef, async (userDoc) => {
          const userEmail = (user.email || '').toLowerCase().trim();

          if (!userDoc.exists()) {
            // New user registration profile initialization
            let targetRole: 'buyer' | 'seller' = 'buyer';

            if (pendingRegistrationRoleRef.current && pendingRegistrationRoleRef.current.email === userEmail) {
              targetRole = pendingRegistrationRoleRef.current.role;
              pendingRegistrationRoleRef.current = null;
            } else if (userEmail === 'showmisellerdemo@gmail.com' || userEmail.includes('sellerdemo')) {
              targetRole = 'seller';
            } else if (userEmail === 'showmibuyerdemo@gmail.com') {
              targetRole = 'buyer';
            }

            const newUser: Record<string, any> = {
              email: user.email || userEmail,
              displayName: user.displayName || user.email?.split('@')[0] || (targetRole === 'seller' ? 'Showpreneur' : 'Showshopper'),
              role: targetRole,
              createdAt: serverTimestamp()
            };

            if (targetRole === 'seller') {
              newUser.sellerId = SELLERS[0].id;
            }

            try {
              await setDoc(userDocRef, newUser, { merge: true });
            } catch (err) {
              console.error("Error setting initial user profile:", err);
            }

            setUserRole(targetRole);
            if (targetRole === 'seller') {
              setCurrentSellerId(SELLERS[0].id);
              setActiveTab('Seller Studio');
            } else {
              setActiveTab('LIVE');
            }
          } else {
            // Existing user profile loaded from Firestore - retrieve saved user role without defaulting to Buyer
            const data = userDoc.data();
            let role = (data?.role as 'admin' | 'buyer' | 'seller') || 'buyer';

            // Ensure existing demo accounts have their assigned Showmi roles without losing existing data
            if (userEmail === 'showmisellerdemo@gmail.com' && role !== 'seller' && role !== 'admin') {
              role = 'seller';
              try {
                await updateDoc(userDocRef, {
                  role: 'seller',
                  sellerId: data?.sellerId || SELLERS[0].id
                });
              } catch (err) {
                console.error("Error assigning demo seller role:", err);
              }
            } else if (userEmail === 'showmibuyerdemo@gmail.com' && role === 'seller') {
              role = 'buyer';
              try {
                await updateDoc(userDocRef, { role: 'buyer' });
              } catch (err) {
                console.error("Error assigning demo buyer role:", err);
              }
            }

            setUserRole(role);
            if (data?.sellerId) {
              setCurrentSellerId(data.sellerId);
            } else if (role === 'seller') {
              setCurrentSellerId(SELLERS[0].id);
            }

            // Route authorized sellers directly to Seller Studio
            if (role === 'seller' || role === 'admin') {
              setActiveTab('Seller Studio');
            } else {
              // Buyers default to LIVE feed or keep current view if not on Seller Studio
              setActiveTab((prev) => (prev === 'Seller Studio' ? 'LIVE' : prev));
            }
          }
          setIsAuthLoading(false);
        }, (error) => {
          console.error("Error listening to user record:", error);
          setIsAuthLoading(false);
        });
      } else {
        setUserRole('buyer');
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  // Dynamic products list persisted to localStorage (Initial/Fallback)
  const [productsList, setProductsList] = useState<Product[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRODUCTS;
  });

  const [isSeeding, setIsSeeding] = useState(false);
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);
  const [firestoreSellers, setFirestoreSellers] = useState<Seller[]>([]);

  // 1. Sync Products from Firestore
  useEffect(() => {
    if (isAuthLoading) return;
    setListenerErrors(prev => { const next = { ...prev }; delete next['products']; return next; });
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListenerErrors(prev => { const next = { ...prev }; delete next['products']; return next; });
      const list: Product[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Product);
      });
      setFirestoreProducts(list);
    }, (error) => {
      console.error('Products listener error:', error);
      setListenerErrors(prev => ({ ...prev, 'products': `${error.code} - ${error.message}` }));
      setFirestoreProducts([]);
    });
    return () => unsubscribe();
  }, [isAuthLoading, currentUser]);

  // 2. Sync Sellers from Firestore
  useEffect(() => {
    if (isAuthLoading) return;
    setListenerErrors(prev => { const next = { ...prev }; delete next['sellers']; return next; });
    const q = query(collection(db, 'sellers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListenerErrors(prev => { const next = { ...prev }; delete next['sellers']; return next; });
      const list: Seller[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Seller);
      });
      setFirestoreSellers(list);
    }, (error) => {
      console.error('Sellers listener error:', error);
      setListenerErrors(prev => ({ ...prev, 'sellers': `${error.code} - ${error.message}` }));
      setFirestoreSellers([]);
    });
    return () => unsubscribe();
  }, [isAuthLoading, currentUser]);

  // Merge Firestore data with Mock data (Firestore takes precedence)
  const allProducts = useMemo(() => {
    const map = new Map<string, Product>();
    PRODUCTS.forEach(p => map.set(p.id, p));
    productsList.forEach(p => map.set(p.id, p));
    firestoreProducts.forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  }, [firestoreProducts, productsList]);

  const allSellers = useMemo(() => {
    if (firestoreSellers.length === 0) return SELLERS;
    // Map existing mock data to firestore format if needed, 
    // but for now we assume firestoreSellers contains all necessary info
    return firestoreSellers;
  }, [firestoreSellers]);

  const [firestoreOrders, setFirestoreOrders] = useState<Order[]>([]);

  // 3. Sync Orders from Firestore (Filtered by role)
  useEffect(() => {
    if (!currentUser && userRole !== 'admin') {
      setFirestoreOrders([]);
      return;
    }

    let q;
    if (userRole === 'admin') {
      q = query(collection(db, 'orders'));
    } else if (userRole === 'seller' && currentSellerId) {
      q = query(collection(db, 'orders'), where('sellerIds', 'array-contains', currentSellerId));
    } else if (currentUser) {
      q = query(collection(db, 'orders'), where('buyerId', '==', currentUser.uid));
    } else {
      setFirestoreOrders([]);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Order);
      });
      // Sort by createdAt descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setFirestoreOrders(list);
    }, (error) => {
      console.warn("Orders snapshot notice:", error?.message || error);
    });

    return () => unsubscribe();
  }, [currentUser, userRole, currentSellerId]);

  // Dynamic orders list persisted to localStorage (Initial/Fallback)
  const [ordersList, setOrdersList] = useState<Order[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ORDERS;
  });

  // Explicit mapping of primary demo/test buyer accounts to assigned demo buyer IDs
  const DEMO_BUYER_MAPPINGS: Record<string, string> = {
    'nisabardien@gmail.com': 'buyer-demo-01',
    'showmibuyerdemo@gmail.com': 'buyer-demo-01',
  };

  // Merge Firestore orders with local orders (Firestore takes precedence)
  const allOrders = useMemo(() => {
    const map = new Map<string, Order>();

    const userEmailKey = (currentUser?.email || '').toLowerCase().trim();
    const mappedDemoBuyerId = currentUser
      ? (DEMO_BUYER_MAPPINGS[userEmailKey] || null)
      : 'buyer-demo-01';

    const filterOrderForUser = (o: Order) => {
      if (userRole === 'admin') {
        return true;
      } else if (userRole === 'seller' && currentSellerId) {
        return Boolean(o.sellerIds?.includes(currentSellerId) || o.items?.some(i => i.sellerId === currentSellerId));
      } else {
        // 1. Direct match on signed-in buyer's Firebase Auth UID or email
        if (currentUser && (o.buyerId === currentUser.uid || (currentUser.email && o.customerEmail?.toLowerCase() === currentUser.email.toLowerCase()))) {
          return true;
        }
        // 2. Explicit demo account mapping for demo buyer orders
        if (mappedDemoBuyerId && o.buyerId === mappedDemoBuyerId) {
          return true;
        }
        return false;
      }
    };

    ordersList.forEach(o => {
      if (filterOrderForUser(o)) {
        map.set(o.id, o);
      }
    });

    firestoreOrders.forEach(o => {
      if (filterOrderForUser(o)) {
        map.set(o.id, o);
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [firestoreOrders, ordersList, currentUser, userRole, currentSellerId]);

  const [firestoreSessions, setFirestoreSessions] = useState<LiveSession[]>([]);

  // 4. Sync Live Sessions from Firestore
  useEffect(() => {
    if (isAuthLoading) return;
    setListenerErrors(prev => { const next = { ...prev }; delete next['live_sessions']; return next; });
    const q = query(collection(db, 'live_sessions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListenerErrors(prev => { const next = { ...prev }; delete next['live_sessions']; return next; });
      const list: LiveSession[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as LiveSession);
      });
      setFirestoreSessions(list);
    }, (error) => {
      console.error('Live Sessions listener error:', error);
      setListenerErrors(prev => ({ ...prev, 'live_sessions': `${error.code} - ${error.message}` }));
      setFirestoreSessions([]);
    });
    return () => unsubscribe();
  }, [isAuthLoading, currentUser]);

  const allSessions = useMemo(() => {
    if (firestoreSessions.length === 0) return LIVE_SESSIONS;
    return firestoreSessions;
  }, [firestoreSessions]);

  // Core Navigation Tabs: 'LIVE' | 'SA Makers' | 'Seller Studio' | 'Basket'
  const [activeTab, setActiveTab] = useState<AppTab>('LIVE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [activeLiveSessionId, setActiveLiveSessionId] = useState<string | null>(null);
  const [basketInitialStep, setBasketInitialStep] = useState<'basket' | 'checkout'>('basket');

  // Origin tracking when navigating to Cart/Basket to ensure Back returns to exact originating context
  const [cartOrigin, setCartOrigin] = useState<CartOriginContext | null>(null);
  const cartOriginRef = useRef<CartOriginContext | null>(null);
  
  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'signin' | 'register'>('signin');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSellerSignInModalOpen, setIsSellerSignInModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHostDisclaimerOpen, setIsHostDisclaimerOpen] = useState(false);
  const [pendingHostSessionId, setPendingHostSessionId] = useState<string | null>(null);
  const [isLiveCountdownActive, setIsLiveCountdownActive] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [listenerErrors, setListenerErrors] = useState<Record<string, string>>({});
  const [dispatchError, setDispatchError] = useState<{
    orderId: string;
    code?: string;
    message: string;
    timestamp: string;
  } | null>(null);


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

  // Shared Live Session Moderators registry (sessionId -> array of appointed seller IDs)
  const [sessionModerators, setSessionModerators] = useState<Record<string, string[]>>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.SESSION_MODERATORS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Shared Live Session Comments state (sessionId -> LiveComment[])
  const [sessionComments, setSessionComments] = useState<Record<string, LiveComment[]>>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.SESSION_COMMENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    const initialMap: Record<string, LiveComment[]> = {};
    LIVE_SESSIONS.forEach(s => {
      initialMap[s.id] = s.initialComments || [];
    });
    return initialMap;
  });

  // Track deleted comment IDs to ensure persistent deletion across components and timers
  const [deletedCommentIds, setDeletedCommentIds] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.DELETED_COMMENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
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

  // Sync session moderators to safe storage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.SESSION_MODERATORS, JSON.stringify(sessionModerators));
  }, [sessionModerators]);

  // Sync session comments to safe storage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.SESSION_COMMENTS, JSON.stringify(sessionComments));
  }, [sessionComments]);

  // Sync deleted comments to safe storage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.DELETED_COMMENTS, JSON.stringify(deletedCommentIds));
  }, [deletedCommentIds]);

  // Sync withdrawals to safe storage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
  }, [withdrawals]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // References to prevent accidental rapid double-taps on the same button
  const lastAddRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });
  const lastBuyRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });

  const openCart = (step: 'basket' | 'checkout' = 'basket') => {
    // Only capture origin if we are not already on the Basket tab
    if (activeTab !== 'Basket') {
      const origin: CartOriginContext = {
        tab: activeTab,
        selectedProductId,
        selectedSellerId,
        activeLiveSessionId,
        isSellerHostMode,
        searchQuery,
        windowScrollY: window.scrollY || document.documentElement.scrollTop || 0
      };
      cartOriginRef.current = origin;
      setCartOrigin(origin);
    }
    setBasketInitialStep(step);
    setActiveTab('Basket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    if (userRole === 'seller' && currentSellerId && product.sellerId === currentSellerId) {
      showNotification("Oops! You can't buy your own item.");
      return;
    }

    const currentProduct = allProducts.find(p => p.id === product.id) || product;
    const availableStock = typeof currentProduct.stock === 'number' ? currentProduct.stock : 99;

    if (availableStock <= 0) {
      showNotification(`${currentProduct.name} is currently out of stock`);
      return;
    }

    // Prevent accidental duplicate additions caused by rapid single button tap
    const now = Date.now();
    if (lastAddRef.current.id === product.id && now - lastAddRef.current.time < 350) {
      return;
    }
    lastAddRef.current = { id: product.id, time: now };

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

    // Display consistent confirmation toast across all views including LIVE feed and active live sessions
    showNotification('Added to basket. Keep browsing!');
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    if (userRole === 'seller' && currentSellerId && product.sellerId === currentSellerId) {
      showNotification("Oops! You can't buy your own item.");
      return;
    }

    const currentProduct = allProducts.find(p => p.id === product.id) || product;
    const availableStock = typeof currentProduct.stock === 'number' ? currentProduct.stock : 99;

    if (availableStock <= 0) {
      showNotification(`${currentProduct.name} is currently out of stock`);
      return;
    }

    // Prevent accidental duplicate additions caused by rapid single button tap
    const now = Date.now();
    if (lastBuyRef.current.id === product.id && now - lastBuyRef.current.time < 350) {
      return;
    }
    lastBuyRef.current = { id: product.id, time: now };

    // Add selected product to basket while preserving all existing items
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

    // Navigate to Basket & Checkout flow at Step 1: Basket (capturing origin context for Back navigation)
    openCart('basket');
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const currentProduct = allProducts.find(p => p.id === productId);
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
  const handlePlaceOrder = async (orderPayload: OrderPlacementPayload) => {
    if (!currentUser) {
      showNotification('Please sign in to place an order');
      throw new Error('Please sign in to place an order');
    }

    try {
      const sellerIds = Array.from(new Set(orderPayload.items.map(item => item.product.sellerId)));
      const newOrderRecord: Order = {
        id: orderPayload.orderId,
        buyerId: currentUser.uid,
        sellerIds,
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
          sellerName: ci.product.sellerName || 'Maker',
          productImage: ci.product.images[0],
          name: ci.product.name,
          quantity: ci.quantity,
          priceZAR: ci.product.priceZAR,
          status: 'awaiting_dispatch' as const,
          paymentStatus: 'pending_payment' as const
        })),
        subtotalZAR: orderPayload.subtotalZAR,
        shippingZAR: orderPayload.shippingZAR,
        protectionFeeZAR: orderPayload.protectionFeeZAR,
        totalZAR: orderPayload.totalZAR,
        createdAt: new Date().toISOString(),
        estimatedDeliveryDate: orderPayload.estimatedDeliveryDate,
        protectionExpiresAt: orderPayload.protectionExpiresAt,
        deliveryMethod: orderPayload.deliveryMethod,
        paymentMethod: orderPayload.paymentMethod,
        isDemo: true
      };

      await runTransaction(db, async (transaction) => {
        const productRefs = orderPayload.items.map(item => doc(db, 'products', item.product.id));
        const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

        for (let i = 0; i < productDocs.length; i++) {
          const productDoc = productDocs[i];
          const item = orderPayload.items[i];

          if (productDoc.exists()) {
            const data = productDoc.data();
            const currentStock = typeof data?.stock === 'number' ? data.stock : item.product.stock;
            if (currentStock < item.quantity) {
              throw new Error(`Insufficient stock for ${item.product.name}. Available: ${currentStock}`);
            }
            transaction.update(productRefs[i], {
              stock: Math.max(0, currentStock - item.quantity)
            });
          }
        }

        const orderRef = doc(db, 'orders', orderPayload.orderId);
        transaction.set(orderRef, cleanFirestoreData(newOrderRecord));
      });

      setOrdersList(prev => [newOrderRecord, ...prev]);
      showNotification(`Order #${orderPayload.orderId} placed successfully!`);
    } catch (error: any) {
      console.error("Order transaction failed:", error);
      showNotification(error.message || "Checkout failed. Please try again.");
      throw error;
    }
  };

  // Diagnostic and Error Handling
  enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
  }
  
  function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, context: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    showNotification(`Error: ${errorMessage}`);
    console.error('Firestore Error Details: ', { error, operationType, path, context });
  }

  // Seller dispatch & fulfillment status updates (scoped by seller ID)
  const handleUpdateOrderItemStatus = async (
    orderId: string, 
    productId: string, 
    sellerId: string, 
    newStatus: OrderItem['status'], 
    tracking?: { courierPartner?: string; trackingNumber?: string }
  ) => {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
      showNotification("Order record not found.");
      return;
    }

    const targetItem = order.items.find(i => i.productId === productId);
    if (targetItem?.status === 'rejected') {
      showNotification("Cannot update status of a rejected item.");
      return;
    }

    const updatedItems = order.items.map(item => {
      if (item.productId === productId && (item.sellerId === sellerId || !item.sellerId || item.sellerId === currentSellerId)) {
        return {
          ...item,
          status: newStatus,
          courierPartner: tracking?.courierPartner || item.courierPartner || 'The Courier Guy',
          trackingNumber: tracking?.trackingNumber || item.trackingNumber || `TCG-ZA-${Math.floor(10000000 + Math.random() * 90000000)}`,
          dispatchedAt: (newStatus === 'in_transit' || newStatus === 'delivered') ? (item.dispatchedAt || new Date().toISOString()) : item.dispatchedAt,
          deliveredAt: newStatus === 'delivered' ? (item.deliveredAt || new Date().toISOString()) : item.deliveredAt,
        };
      }
      return item;
    });

    // Update local state and safeStorage immediately so UI reflects status change seamlessly
    setOrdersList(prev => {
      const exists = prev.some(o => o.id === orderId);
      const next = exists 
        ? prev.map(o => o.id === orderId ? { ...o, items: updatedItems } : o)
        : [{ ...order, items: updatedItems }, ...prev];
      safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(next));
      return next;
    });

    setDispatchError(null);
    showNotification(`Order status updated: ${newStatus.replace('_', ' ')}`);

    try {
      const orderRef = doc(db, 'orders', orderId);
      const updatePayload = { items: updatedItems };
      const cleanedPayload = cleanFirestoreData(updatePayload);
      await updateDoc(orderRef, cleanedPayload);
    } catch (error: any) {
      console.warn("Firestore status update skipped or failed:", error?.message || error);
    }
  };

  const handleAcceptOrderItem = async (orderId: string, productId: string, sellerId: string) => {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
      showNotification("Order record not found.");
      return;
    }

    const targetItem = order.items.find(i => i.productId === productId);
    if (targetItem?.status === 'rejected') {
      showNotification("Cannot accept a rejected item.");
      return;
    }

    const now = new Date().toISOString();
    const updatedItems = order.items.map(item => {
      if (item.productId === productId && (item.sellerId === sellerId || !item.sellerId || item.sellerId === currentSellerId)) {
        return {
          ...item,
          status: 'accepted' as const,
          paymentStatus: 'escrow_held' as const,
          acceptedAt: now
        };
      }
      return item;
    });

    setOrdersList(prev => {
      const exists = prev.some(o => o.id === orderId);
      const next = exists 
        ? prev.map(o => o.id === orderId ? { ...o, items: updatedItems } : o)
        : [{ ...order, items: updatedItems }, ...prev];
      safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(next));
      return next;
    });

    showNotification("Order accepted! Ready for packaging & dispatch.");

    try {
      const orderRef = doc(db, 'orders', orderId);
      const updatePayload = { items: updatedItems };
      await updateDoc(orderRef, cleanFirestoreData(updatePayload));
    } catch (error: any) {
      console.warn("Firestore accept notice:", error?.message || error);
    }
  };

  const handleRejectOrderItem = async (
    orderId: string, 
    productId: string, 
    sellerId: string, 
    rejectionReason: string, 
    rejectionNote?: string
  ) => {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
      showNotification("Order record not found.");
      return;
    }

    const targetItem = order.items.find(i => i.productId === productId);
    if (!targetItem) {
      showNotification("Order item not found.");
      return;
    }

    if (targetItem.status === 'rejected') {
      showNotification("This order item has already been rejected.");
      return;
    }

    const now = new Date().toISOString();
    const updatedItems = order.items.map(item => {
      if (item.productId === productId && (item.sellerId === sellerId || !item.sellerId || item.sellerId === currentSellerId)) {
        return {
          ...item,
          status: 'rejected' as const,
          rejectionReason,
          rejectionNote: rejectionNote || '',
          rejectedAt: now,
          paymentStatus: 'refund_pending' as const
        };
      }
      return item;
    });

    try {
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, 'products', productId);
        const productDoc = await transaction.get(productRef);

        if (productDoc.exists()) {
          const currentStock = productDoc.data()?.stock || 0;
          transaction.update(productRef, {
            stock: currentStock + targetItem.quantity
          });
        }

        const orderRef = doc(db, 'orders', orderId);
        transaction.set(orderRef, cleanFirestoreData({ ...order, items: updatedItems }), { merge: true });
      });

      setOrdersList(prev => {
        const exists = prev.some(o => o.id === orderId);
        const next = exists 
          ? prev.map(o => o.id === orderId ? { ...o, items: updatedItems } : o)
          : [{ ...order, items: updatedItems }, ...prev];
        safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(next));
        return next;
      });

      setProductsList(prev =>
        prev.map(p => p.id === productId ? { ...p, stock: p.stock + targetItem.quantity } : p)
      );

      showNotification(`Order item rejected and stock restored (${rejectionReason}). Payment flagged for refund review.`);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`, { action: 'reject', orderId });
    }
  };

  // Buyer receipt confirmation (releases earnings to Available Balance immediately)
  const handleConfirmItemReceipt = async (orderId: string, productId: string) => {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const now = new Date().toISOString();
    const updatedItems = order.items.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          status: 'confirmed' as const,
          confirmedAt: now,
          dispatchedAt: item.dispatchedAt || now,
          deliveredAt: item.deliveredAt || now,
          paymentReleased: true,
          paymentReleasedAt: now
        };
      }
      return item;
    });

    const allReceived = updatedItems.every(i => 
      i.status === 'confirmed' || Boolean(i.confirmedAt) || i.paymentReleased
    );
    const updateData: any = { 
      items: updatedItems,
      paymentReleased: true,
      paymentReleasedAt: now
    };
    if (allReceived && !order.confirmedAt) {
      updateData.confirmedAt = now;
    }

    try {
      await updateDoc(doc(db, 'orders', orderId), cleanFirestoreData(updateData));
      showNotification('Receipt confirmed! Seller earnings released to Available Balance.');
    } catch (error) {
      console.error("Failed to confirm receipt:", error);
      showNotification("Confirmation failed. Permission denied?");
    }

    setOrdersList(prev => {
      const exists = prev.some(o => o.id === orderId);
      const next = exists 
        ? prev.map(o => o.id === orderId ? { ...o, ...updateData, items: updatedItems } : o)
        : prev;
      safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(next));
      return next;
    });
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

  const handleSeedFirestore = async () => {
    if (userRole !== 'admin') return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      
      // 1. Seed Sellers
      SELLERS.forEach(seller => {
        const sellerRef = doc(db, 'sellers', seller.id);
        // Link all mock sellers to the current admin for initial control
        batch.set(sellerRef, {
          ...seller,
          ownerUid: currentUser?.uid || 'initial-admin'
        });
      });

      // 2. Seed Products
      PRODUCTS.forEach(product => {
        const productRef = doc(db, 'products', product.id);
        batch.set(productRef, cleanFirestoreData(product));
      });

      // 3. Seed Live Sessions
      LIVE_SESSIONS.forEach(session => {
        const sessionRef = doc(db, 'live_sessions', session.id);
        batch.set(sessionRef, cleanFirestoreData({
          ...session,
          moderatorUids: []
        }));
      });

      await batch.commit();
      showNotification('Marketplace and LIVE sessions seeded!');
    } catch (error) {
      console.error("Seeding failed:", error);
      showNotification('Seeding failed. Check console.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Product Inventory CRUD Handlers for Seller Studio - Now using Firestore
  const handleAddProduct = async (product: Product) => {
    try {
      const cleaned = cleanFirestoreData(product);
      await setDoc(doc(db, 'products', product.id), cleaned);
      setProductsList(prev => [product, ...prev.filter(p => p.id !== product.id)]);
      showNotification(`Added new product "${product.name}" to store inventory`);
    } catch (error: any) {
      console.error("Error adding product:", error);
      showNotification(`Failed to add product: ${error?.message || 'Permission denied'}`);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const cleaned = cleanFirestoreData(updatedProduct);
      await updateDoc(doc(db, 'products', updatedProduct.id), cleaned as any);
      setProductsList(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      showNotification(`Updated product "${updatedProduct.name}"`);
    } catch (error: any) {
      console.error("Error updating product:", error);
      showNotification(`Failed to update product: ${error?.message || 'Permission denied'}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProductsList(prev => prev.filter(p => p.id !== productId));
      showNotification('Removed product from store inventory');
    } catch (error: any) {
      console.error("Error deleting product:", error);
      showNotification(`Failed to delete product: ${error?.message || 'Permission denied'}`);
    }
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
    safeStorage.removeItem(STORAGE_KEYS.SESSION_MODERATORS);
    safeStorage.removeItem(STORAGE_KEYS.SESSION_COMMENTS);
    safeStorage.removeItem(STORAGE_KEYS.DELETED_COMMENTS);
    setProductsList(PRODUCTS);
    setCartItems([{ product: PRODUCTS[0], quantity: 1 }]);
    setSnippetsList(SELLERS.flatMap(s => s.snippets));
    setPromotionsList(INITIAL_PROMOTIONS);
    setOrdersList(INITIAL_ORDERS);
    setOrderIssues(INITIAL_ISSUES);
    setSessionModerators({});
    const initialMap: Record<string, LiveComment[]> = {};
    LIVE_SESSIONS.forEach(s => {
      initialMap[s.id] = s.initialComments || [];
    });
    setSessionComments(initialMap);
    setDeletedCommentIds([]);
    setUserRole('buyer');
    setCurrentSellerId(SELLERS[0].id);
    setFollowedSellerIds(SELLERS.map(s => s.id));
    setIsSellerHostMode(false);
    setIsLiveCountdownActive(false);
    setPendingHostSessionId(null);
    setActiveTab('LIVE');
    showNotification('Reset all demo data and role to default buyer');
  };

  const handleRequestWithdrawal = (amount: number) => {
    if (!currentSellerId) return;
    const newWithdrawal: Withdrawal = {
      id: `WD-${Date.now()}`,
      sellerId: currentSellerId,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setWithdrawals(prev => [newWithdrawal, ...prev]);
    showNotification(`Withdrawal request for R ${amount.toLocaleString()} submitted.`);
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

  // Real Authentication Handlers
  const handleOpenSignIn = () => {
    setAuthModalInitialMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalInitialMode('register');
    setIsAuthModalOpen(true);
  };

  const handleSignIn = () => {
    handleOpenSignIn();
  };

  const handleAuthSuccess = (authUser: FirebaseUser, assignedRole: AccountType) => {
    showNotification(
      authUser.displayName 
        ? `Signed in as ${authUser.displayName}` 
        : `Signed in successfully as ${assignedRole === 'seller' ? 'Seller' : 'Buyer'}`
    );
  };

  const handleSignOut = async () => {
    try {
      setListenerErrors({});
      await signOut(auth);
      showNotification('Signed out');
      setActiveTab('LIVE');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // Role & Authentication Handlers
  const handleSignInAsSeller = async (sellerId: string) => {
    if (!currentUser) {
      showNotification('Please sign in to access Seller Studio');
      handleOpenSignIn();
      return;
    }

    try {
      // 1. Update user profile document in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        email: currentUser.email || '',
        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Seller',
        role: 'seller',
        sellerId: sellerId,
        createdAt: serverTimestamp()
      }, { merge: true });

      // 2. Link seller document in Firestore
      const sellerRef = doc(db, 'sellers', sellerId);
      await setDoc(sellerRef, {
        ownerUid: currentUser.uid
      }, { merge: true });

      setCurrentSellerId(sellerId);
      setUserRole('seller');
      setActiveTab('Seller Studio');
      setIsSellerSignInModalOpen(false);
      showNotification(`Signed in as ${SELLERS.find(s => s.id === sellerId)?.name || 'Maker'}`);
    } catch (err: any) {
      console.error("Error signing in as seller:", err);
      showNotification(`Seller sign-in failed: ${err.message || 'Permission denied'}`);
    }
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

  const handleOpenHostMode = (sessionId?: string) => {
    const targetSession = allSessions.find(s => s.id === sessionId)
      || allSessions.find(s => s.sellerId === currentSellerId)
      || allSessions[0];
    setPendingHostSessionId(targetSession.id);
    setIsHostDisclaimerOpen(true);
  };

  const handleConfirmHostDisclaimer = () => {
    setIsHostDisclaimerOpen(false);
    // Launch full-screen 3-2-1 LIVE countdown before entering Host Studio
    setIsLiveCountdownActive(true);
  };

  const handleCancelHostDisclaimer = () => {
    setIsHostDisclaimerOpen(false);
    setPendingHostSessionId(null);
  };

  const handleCountdownComplete = () => {
    setIsLiveCountdownActive(false);
    if (pendingHostSessionId) {
      setActiveLiveSessionId(pendingHostSessionId);
      setIsSellerHostMode(true);
      setSelectedProductId(null);
      setPendingHostSessionId(null);
    }
  };

  const handleCountdownCancel = () => {
    setIsLiveCountdownActive(false);
    setPendingHostSessionId(null);
  };

  const handleSimulateOrderStockDecrement = async (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: Math.max(0, product.stock - 1)
      });
      showNotification('Simulated 1 order! Inventory decremented & stock reminder refreshed');
    } catch (error) {
      console.error("Simulation failed:", error);
    }
  };

  // Moderator Appointment & Revocation Handlers (Firestore Enforced & State Synced)
  const handleAppointModerator = async (sessionId: string, sellerId: string) => {
    const seller = allSellers.find(s => s.id === sellerId);
    if (!seller) {
      showNotification("Cannot appoint moderator: seller not found.");
      return;
    }
    const targetUid = seller.ownerUid || seller.id;

    // 1. Update local state and safeStorage immediately for instant feedback
    setSessionModerators(prev => {
      const current = prev[sessionId] || prev[sellerId] || [];
      if (current.includes(sellerId)) return prev;
      const next = [...current, sellerId];
      const updatedMap = { ...prev, [sessionId]: next, [sellerId]: next };
      safeStorage.setItem(STORAGE_KEYS.SESSION_MODERATORS, JSON.stringify(updatedMap));
      return updatedMap;
    });

    try {
      const sessionRef = doc(db, 'live_sessions', sessionId);
      const session = allSessions.find(s => s.id === sessionId);
      const currentMods = session?.moderatorUids || [];
      if (!currentMods.includes(targetUid)) {
        try {
          await updateDoc(sessionRef, {
            moderatorUids: [...currentMods, targetUid]
          });
        } catch (err: any) {
          if (err?.code === 'not-found' || err?.message?.includes('No document to update') || err?.message?.includes('not-found')) {
            await setDoc(sessionRef, {
              id: sessionId,
              sellerId: session?.sellerId || sellerId,
              moderatorUids: [...currentMods, targetUid]
            }, { merge: true });
          } else {
            throw err;
          }
        }
      }
      showNotification(`Successfully appointed ${seller.name} as chat moderator!`);
    } catch (error: any) {
      console.error("Moderator appointment failed:", error);
      showNotification(`Failed to appoint moderator: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRevokeModerator = async (sessionId: string, sellerId: string) => {
    const seller = allSellers.find(s => s.id === sellerId);
    if (!seller) return;
    const targetUid = seller.ownerUid || seller.id;

    // 1. Update local state and safeStorage immediately
    setSessionModerators(prev => {
      const current = prev[sessionId] || prev[sellerId] || [];
      const next = current.filter(id => id !== sellerId);
      const updatedMap = { ...prev, [sessionId]: next, [sellerId]: next };
      safeStorage.setItem(STORAGE_KEYS.SESSION_MODERATORS, JSON.stringify(updatedMap));
      return updatedMap;
    });

    try {
      const sessionRef = doc(db, 'live_sessions', sessionId);
      const session = allSessions.find(s => s.id === sessionId);
      const currentMods = session?.moderatorUids || [];
      try {
        await updateDoc(sessionRef, {
          moderatorUids: currentMods.filter((uid: string) => uid !== targetUid)
        });
      } catch (err: any) {
        if (err?.code === 'not-found' || err?.message?.includes('No document to update') || err?.message?.includes('not-found')) {
          await setDoc(sessionRef, {
            id: sessionId,
            sellerId: session?.sellerId || sellerId,
            moderatorUids: currentMods.filter((uid: string) => uid !== targetUid)
          }, { merge: true });
        } else {
          throw err;
        }
      }
      showNotification(`Revoked moderator status for ${seller.name}`);
    } catch (error: any) {
      console.error("Moderator revocation failed:", error);
      showNotification(`Failed to revoke moderator: ${error.message || 'Unknown error'}`);
    }
  };

  // Shared Chat Comment Add & Delete Handlers (Firestore Enforced)
  const handleAddSessionComment = async (sessionId: string, comment: LiveComment) => {
    if (!currentUser) return;
    
    try {
      const commentRef = doc(collection(db, 'live_sessions', sessionId, 'comments'));
      const newComment = {
        ...comment,
        id: commentRef.id,
        senderUid: currentUser.uid,
        timestamp: serverTimestamp()
      };
      await setDoc(commentRef, newComment);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteSessionComment = async (sessionId: string, commentId: string) => {
    try {
      await deleteDoc(doc(db, 'live_sessions', sessionId, 'comments', commentId));
      showNotification('Comment deleted from live session feed');
    } catch (error) {
      console.error("Failed to delete comment:", error);
      showNotification("Delete failed. Permission denied?");
    }
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

  const handleBackFromCart = () => {
    const origin = cartOriginRef.current || cartOrigin;
    // Clear origin immediately to avoid duplicate navigation history entries or loops
    cartOriginRef.current = null;
    setCartOrigin(null);

    if (origin && origin.tab !== 'Basket') {
      setActiveTab(origin.tab);
      setSelectedProductId(origin.selectedProductId);
      setSelectedSellerId(origin.selectedSellerId);
      setActiveLiveSessionId(origin.activeLiveSessionId);
      setIsSellerHostMode(origin.isSellerHostMode);
      setSearchQuery(origin.searchQuery);

      if (origin.windowScrollY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: origin.windowScrollY, behavior: 'auto' });
        });
      }
    } else {
      // Graceful fallback: return to Showrooms feed without hardcoding LIVE
      setActiveTab('Showrooms');
      setSelectedProductId(null);
      setSelectedSellerId(null);
      setActiveLiveSessionId(null);
      setIsSellerHostMode(false);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const handleTabChange = (tab: AppTab) => {
    // Role based navigation restriction
    if (tab === 'Seller Studio' && userRole !== 'seller' && userRole !== 'admin') {
      setIsSellerSignInModalOpen(true);
      return;
    }

    if (tab === 'Basket') {
      openCart('basket');
      return;
    }

    // Direct tab switch away from Cart or between primary views:
    // Clear any cart origin so we don't leave stale return destinations
    cartOriginRef.current = null;
    setCartOrigin(null);

    setSearchQuery('');
    setSelectedProductId(null);
    setSelectedSellerId(null);
    setActiveLiveSessionId(null);
    setIsSellerHostMode(false);
    setBasketInitialStep('basket');

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProductDescription = async (productId: string, newDesc: string) => {
    try {
      await updateDoc(doc(db, 'products', productId), { description: newDesc });
      showNotification('Product description updated across Showmi');
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // Resolve current active item/entity
  const selectedProduct = selectedProductId 
    ? allProducts.find(p => p.id === selectedProductId) 
    : null;

  const selectedSeller = selectedSellerId 
    ? allSellers.find(s => s.id === selectedSellerId) 
    : selectedProduct 
    ? allSellers.find(s => s.id === selectedProduct.sellerId) 
    : null;

  const activeLiveSession = activeLiveSessionId 
    ? allSessions.find(s => s.id === activeLiveSessionId) 
    : null;

  const currentSeller = allSellers.find(s => s.id === currentSellerId);

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

  const isLiveFeed = activeTab === 'LIVE' && !selectedProductId && !selectedSellerId && searchQuery.trim() === '' && !isSellerHostMode && !activeLiveSessionId;
  const isActiveLiveRoom = activeTab === 'LIVE' && !!activeLiveSession && !isSellerHostMode;
  const isImmersiveLive = isLiveFeed || isActiveLiveRoom;

  const appContent = (
    <div className={`min-h-screen bg-[#0D1018] text-white flex flex-col selection:bg-[#19BFFF] selection:text-[#0D1018] ${viewportMode !== 'responsive' ? 'relative overflow-hidden' : ''}`}>
      {Object.entries(listenerErrors).map(([key, error]) => (
        <div key={key} className="fixed bottom-20 left-4 max-w-sm p-3 bg-red-950/90 text-red-200 backdrop-blur-md rounded-2xl border border-red-700/60 shadow-2xl z-30 text-xs font-mono pointer-events-auto">
          <div className="font-bold text-red-400 uppercase tracking-wide flex justify-between items-center mb-1">
            <span>Diagnostic Warning ({key})</span>
            <button 
              onClick={() => setListenerErrors(prev => { const next = { ...prev }; delete next[key]; return next; })}
              className="text-red-300 hover:text-white text-xs font-bold cursor-pointer ml-2 px-1 rounded hover:bg-red-800/50"
              title="Dismiss warning"
            >
              ✕
            </button>
          </div>
          <p className="truncate text-[11px] text-slate-300">{error}</p>
        </div>
      ))}
      
      {/* Admin Control Bar (Only rendered for authorized Admin account) */}
      {userRole === 'admin' && (
        <div className="block">
          <AdminRoleSwitcher
            userRole={userRole}
            currentSellerId={currentSellerId}
            onSelectSeller={setCurrentSellerId}
            sellers={allSellers.map(s => ({ id: s.id, name: s.name }))}
            onSeedData={handleSeedFirestore}
            isSeeding={isSeeding}
          />
        </div>
      )}

      {/* Toast Notification (Non-blocking so it never interrupts video or controls) */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-[#19BFFF] text-[#0D1018] text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl shadow-[#19BFFF]/30 animate-fade-in flex items-center gap-2 pointer-events-none select-none">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Persistent Dispatch Error Diagnostic Panel */}
      {dispatchError && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto p-4 bg-red-950/95 text-red-100 backdrop-blur-md rounded-2xl border-2 border-red-600 shadow-2xl z-[60] text-xs font-mono pointer-events-auto animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-red-800/80 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-red-300 text-sm">
              <span>⚠️</span>
              <span>Dispatch Error Diagnostic</span>
            </div>
            <button
              onClick={() => setDispatchError(null)}
              className="px-2.5 py-1 bg-red-800/80 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border border-red-500/50"
              title="Dismiss error panel"
            >
              Close ✕
            </button>
          </div>
          <div className="space-y-1.5 text-left">
            <div>
              <span className="text-red-400 font-bold">Order ID: </span>
              <span className="text-white font-mono bg-red-900/60 px-1.5 py-0.5 rounded">{dispatchError.orderId}</span>
            </div>
            {dispatchError.code && (
              <div>
                <span className="text-red-400 font-bold">Code: </span>
                <span className="text-amber-300 font-mono">{dispatchError.code}</span>
              </div>
            )}
            <div>
              <span className="text-red-400 font-bold">Message: </span>
              <span className="text-slate-200 break-words font-sans">{dispatchError.message}</span>
            </div>
            <div className="text-[10px] text-red-400/80 pt-1 flex justify-between items-center border-t border-red-900/40 mt-2">
              <span>Time: {dispatchError.timestamp}</span>
              <button
                onClick={() => setDispatchError(null)}
                className="underline text-red-300 hover:text-white font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation (Always visible on mobile & desktop so users can search and sign in/out) */}
      <div className="block">
        <Navigation
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          cartItems={cartItems}
          ordersCount={allOrders.length}
          onOpenInfoModal={() => setIsSetupModalOpen(true)}
          searchQuery={searchQuery}
          onSearchSubmit={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          userRole={userRole}
          currentSeller={allSellers.find(s => s.id === currentSellerId)}
          onOpenSellerSignIn={() => setIsSellerSignInModalOpen(true)}
          currentUser={currentUser}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Main Content Area */}
      <main className={isImmersiveLive ? "flex-1 pb-0 md:pb-20 overflow-hidden" : "flex-1 pb-24 md:pb-20"}>
        {/* Preserved Active Live Session: kept mounted even when viewing Basket so video and session state do not restart */}
        {activeLiveSession && !isSellerHostMode && (
          <div className={activeTab === 'Basket' ? 'hidden' : 'contents'}>
            <LiveRoomView
              session={activeLiveSession}
              products={allProducts}
              seller={allSellers.find(s => s.id === activeLiveSession.sellerId)}
              allLiveSessions={LIVE_SESSIONS}
              allSellers={allSellers}
              onBack={() => {
                setActiveLiveSessionId(null);
                cartOriginRef.current = null;
                setCartOrigin(null);
              }}
              onSelectProduct={handleSelectProduct}
              onViewSeller={handleSelectSeller}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onSwitchSession={(sessionId) => setActiveLiveSessionId(sessionId)}
              isActive={activeTab !== 'Basket'}
              onAddComment={(comment) => handleAddSessionComment(activeLiveSession.id, comment)}
              onDeleteComment={(commentId) => handleDeleteSessionComment(activeLiveSession.id, commentId)}
              moderatorSellerIds={sessionModerators[activeLiveSession.id] || []}
              currentSellerId={currentSellerId}
              userRole={userRole}
            />
          </div>
        )}

        {/* Primary View Routing */}
        {activeTab === 'Basket' ? (
          /* View: Basket & Checkout Preview */
          <BasketCheckoutView
            cartItems={cartItems}
            productsList={allProducts}
            currentSellerId={userRole === 'seller' ? currentSellerId : undefined}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onBackToDiscover={handleBackFromCart}
            onSelectProduct={handleSelectProduct}
            onPlaceOrder={handlePlaceOrder}
            onViewOrders={() => {
              cartOriginRef.current = null;
              setCartOrigin(null);
              setActiveTab('My Orders');
            }}
            initialStep={basketInitialStep}
          />
        ) : activeLiveSession && !isSellerHostMode ? (
          /* Preserved active live session is rendered above */
          null
        ) : searchQuery.trim() !== '' ? (
          <SearchResultsView
            query={searchQuery}
            onClearQuery={() => setSearchQuery('')}
            onSetQuery={(q) => setSearchQuery(q)}
            products={allProducts}
            sellers={allSellers}
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
            seller={allSellers.find(s => s.id === activeLiveSession.sellerId) || allSellers[0]}
            products={allProducts}
            promotions={promotionsList}
            onExitHostMode={() => {
              setIsSellerHostMode(false);
              setActiveLiveSessionId(null);
            }}
            onViewShopperLiveRoom={() => setIsSellerHostMode(false)}
            onSimulateOrderStockDecrement={handleSimulateOrderStockDecrement}
            onExpirePromotionNow={handleExpirePromotionNow}
            onSwitchSession={(sessionId) => setActiveLiveSessionId(sessionId)}
            onAddComment={(comment) => handleAddSessionComment(activeLiveSession.id, comment)}
            onDeleteComment={(commentId) => handleDeleteSessionComment(activeLiveSession.id, commentId)}
            moderatorSellerIds={sessionModerators[activeLiveSession.id] || []}
            onAppointModerator={(sellerId) => handleAppointModerator(activeLiveSession.id, sellerId)}
            onRevokeModerator={(sellerId) => handleRevokeModerator(activeLiveSession.id, sellerId)}
            allSellers={allSellers}
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
            products={allProducts}
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
            sellers={allSellers}
            products={allProducts}
            snippets={snippetsList}
            promotions={promotionsList}
            orders={allOrders}
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
            sessionModerators={sessionModerators}
            liveSessions={LIVE_SESSIONS}
            onAppointModerator={(sessionId, sellerId) => handleAppointModerator(sessionId, sellerId)}
            onRevokeModerator={(sessionId, sellerId) => handleRevokeModerator(sessionId, sellerId)}
            onAcceptOrderItem={handleAcceptOrderItem}
            onRejectOrderItem={handleRejectOrderItem}
            withdrawals={withdrawals}
            onRequestWithdrawal={handleRequestWithdrawal}
          />
        ) : activeTab === 'My Orders' ? (
          /* View: Buyer Orders & 14-day Protection Tracker */
          <MyOrdersView
            orders={allOrders}
            issues={orderIssues}
            onConfirmDelivery={handleConfirmItemReceipt}
            onReportIssue={handleReportIssue}
            onBackToShopping={() => setActiveTab('LIVE')}
            onSelectProduct={handleSelectProduct}
          />
        ) : activeTab === 'Showrooms' ? (
          /* View: Showrooms Directory */
          <SellersListView
            sellers={allSellers}
            products={allProducts}
            snippets={snippetsList}
            onSelectSeller={handleSelectSeller}
            onOpenLiveRoom={handleOpenLiveRoom}
            followedSellerIds={followedSellerIds}
            onToggleFollow={handleToggleFollow}
          />
        ) : (
          /* Default View: LIVE Streams Immersive Shopping Feed with Vertical Scrolling */
          <LiveStreamsListView
            liveSessions={allSessions}
            products={allProducts}
            sellers={allSellers}
            onOpenLiveRoom={handleOpenLiveRoom}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSelectSeller={handleSelectSeller}
            onOpenTab={handleTabChange}
            cartItems={cartItems}
            ordersCount={allOrders.length}
            searchQuery={searchQuery}
            onSearchSubmit={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            sessionModerators={sessionModerators}
            sessionComments={sessionComments}
            deletedCommentIds={deletedCommentIds}
            currentSellerId={currentSellerId}
          />

        )}
      </main>

      {/* Architecture & Free Setup Modal */}
      <SetupInfoModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onResetDemoData={handleResetDemoData}
      />

      {/* Seller Sign-In & Application Prompt Modal */}
      <SellerSignInModal
        isOpen={isSellerSignInModalOpen}
        onClose={() => setIsSellerSignInModalOpen(false)}
        sellers={allSellers}
        userRole={userRole}
        currentUser={currentUser}
        onSignInAsSeller={handleSignInAsSeller}
        onApplySeller={() => {
          showNotification('Application submitted! Showmi Admin will review your account for seller authorization.');
          setIsSellerSignInModalOpen(false);
        }}
        onOpenAuthModal={handleOpenSignIn}
      />

      {/* Auth Modal (Supports Email/Password Sign-In, Registration with Buyer/Seller role, and Google Sign-In) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalInitialMode}
        onSuccess={handleAuthSuccess}
        onRoleAssigned={(email, role) => {
          pendingRegistrationRoleRef.current = { email: email.toLowerCase(), role };
        }}
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
        currentSeller={currentSeller}
        sellers={allSellers}
        onSelectSeller={(sellerId) => {
          setCurrentSellerId(sellerId);
          safeStorage.setItem(STORAGE_KEYS.SELLER_ID, sellerId);
        }}
        onOpenTab={handleTabChange}
        orders={allOrders}
        issues={orderIssues}
        ordersCount={allOrders.length}
        totalItemCount={totalItemCount}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onSignIn={handleOpenSignIn}
        withdrawals={withdrawals}
        onRequestWithdrawal={handleRequestWithdrawal}
      />

      {/* Mandatory Host Mode AI Disclaimer Confirmation Modal */}
      <HostDisclaimerModal
        isOpen={isHostDisclaimerOpen}
        onConfirm={handleConfirmHostDisclaimer}
        onCancel={handleCancelHostDisclaimer}
      />

      {/* Full-Screen 3-2-1 LIVE Broadcast Countdown */}
      {isLiveCountdownActive && (
        <LiveCountdownOverlay
          onComplete={handleCountdownComplete}
          onCancel={handleCountdownCancel}
          sessionTitle={LIVE_SESSIONS.find(s => s.id === pendingHostSessionId)?.title}
          sellerName={allSellers.find(s => s.id === (LIVE_SESSIONS.find(l => l.id === pendingHostSessionId)?.sellerId || currentSellerId))?.name}
        />
      )}

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
