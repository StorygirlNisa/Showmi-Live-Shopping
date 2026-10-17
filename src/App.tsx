/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { DiscoverView } from './components/DiscoverView';
import { ProductDetailView } from './components/ProductDetailView';
import { SellerStorefrontView } from './components/SellerStorefrontView';
import { LiveRoomView } from './components/LiveRoomView';
import { BasketCheckoutView } from './components/BasketCheckoutView';
import { SellersListView } from './components/SellersListView';
import { LiveStreamsListView } from './components/LiveStreamsListView';
import { SellerDashboardView } from './components/SellerDashboardView';
import { SetupInfoModal } from './components/SetupInfoModal';
import { SellerHostModeView } from './components/SellerHostModeView';
import { ResponsivePreviewToolbar, ViewportMode } from './components/ResponsivePreviewToolbar';

import { PRODUCTS, SELLERS, LIVE_SESSIONS, INITIAL_PROMOTIONS } from './data/mockData';
import { Product, CartItem, StreamSnippet, LivePromotion } from './types';

const STORAGE_KEYS = {
  PRODUCTS: 'showmi_products_v1',
  CART: 'showmi_cart_v1',
  SNIPPETS: 'showmi_snippets_v1',
  PROMOTIONS: 'showmi_promotions_v1'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'discover' | 'live' | 'sellers' | 'basket' | 'studio'>('discover');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [activeLiveSessionId, setActiveLiveSessionId] = useState<string | null>(null);
  
  // Dynamic products list persisted to localStorage
  const [productsList, setProductsList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading products from localStorage', e);
    }
    return PRODUCTS;
  });

  // Basket State with initial item for demonstration, persisted to localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading cart from localStorage', e);
    }
    return [
      {
        product: PRODUCTS[0],
        quantity: 1
      }
    ];
  });

  // Dynamic snippets list with expiry and archive status, persisted to localStorage
  const [snippetsList, setSnippetsList] = useState<StreamSnippet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SNIPPETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading snippets from localStorage', e);
    }
    return SELLERS.flatMap(s => s.snippets);
  });

  // Dynamic promotions list with active terms and expiry dates
  const [promotionsList, setPromotionsList] = useState<LivePromotion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMOTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading promotions from localStorage', e);
    }
    return INITIAL_PROMOTIONS;
  });

  // Host Mode toggle: controls private host mode during live stream
  const [isSellerHostMode, setIsSellerHostMode] = useState<boolean>(false);

  // Development-only responsive layout preview mode
  const [viewportMode, setViewportMode] = useState<ViewportMode>('responsive');
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  // Sync products to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsList));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [productsList]);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  // Sync snippets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SNIPPETS, JSON.stringify(snippetsList));
    } catch (e) {
      console.error('Failed to save snippets to localStorage', e);
    }
  }, [snippetsList]);

  // Sync promotions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promotionsList));
    } catch (e) {
      console.error('Failed to save promotions to localStorage', e);
    }
  }, [promotionsList]);

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    const currentProduct = productsList.find(p => p.id === product.id) || product;
    if (currentProduct.stock <= 0) {
      showNotification(`${currentProduct.name} is currently out of stock`);
      return;
    }

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
    showNotification(`Added ${currentProduct.name} to basket`);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    const currentProduct = productsList.find(p => p.id === product.id) || product;
    if (currentProduct.stock <= 0) {
      showNotification(`${currentProduct.name} is currently out of stock`);
      return;
    }
    handleAddToCart(currentProduct, quantity);
    setSelectedProductId(null);
    setActiveLiveSessionId(null);
    setSelectedSellerId(null);
    setActiveTab('basket');
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

  // Order placement & inventory decrement (guarantees stock never becomes negative)
  const handlePlaceOrder = (orderItems: CartItem[]) => {
    setProductsList(prevProducts => {
      return prevProducts.map(prod => {
        const purchased = orderItems.find(item => item.product.id === prod.id);
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
    showNotification('Order completed! Inventory updated across Showmi');
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
    const pastDate = new Date(Date.now() - 60000).toISOString(); // 1 minute ago
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

  const handleResetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.SNIPPETS);
    localStorage.removeItem(STORAGE_KEYS.PROMOTIONS);
    setProductsList(PRODUCTS);
    setCartItems([{ product: PRODUCTS[0], quantity: 1 }]);
    setSnippetsList(SELLERS.flatMap(s => s.snippets));
    setPromotionsList(INITIAL_PROMOTIONS);
    setIsSellerHostMode(false);
    showNotification('Reset all demo data to default');
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
  };

  const handleOpenHostMode = (sessionId: string) => {
    setActiveLiveSessionId(sessionId);
    setIsSellerHostMode(true);
    setSelectedProductId(null);
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

  const handleTabChange = (tab: 'discover' | 'live' | 'sellers' | 'basket' | 'studio') => {
    setSelectedProductId(null);
    setSelectedSellerId(null);
    setActiveLiveSessionId(null);
    setIsSellerHostMode(false);
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

  const getViewportWidthStyle = () => {
    switch (viewportMode) {
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

  const appContent = (
    <div className={`min-h-screen bg-[#0c0e12] text-slate-100 flex flex-col selection:bg-[#0066ff] selection:text-white ${viewportMode !== 'responsive' ? 'relative overflow-hidden' : ''}`}>
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-[#0066ff] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl shadow-[#0066ff]/40 animate-fade-in flex items-center gap-2">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Main Navigation (hidden during active full live room on mobile for immersion) */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        cartItems={cartItems}
        onOpenInfoModal={() => setIsSetupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* View 1: Active Live Shopping Room (Shopper vs Seller Host Mode) */}
        {activeLiveSession ? (
          isSellerHostMode ? (
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
          ) : (
            <LiveRoomView
              session={activeLiveSession}
              products={productsList}
              seller={SELLERS.find(s => s.id === activeLiveSession.sellerId)}
              onBack={() => setActiveLiveSessionId(null)}
              onSelectProduct={handleSelectProduct}
              onViewSeller={handleSelectSeller}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onSwitchSession={(sessionId) => setActiveLiveSessionId(sessionId)}
              allLiveSessions={LIVE_SESSIONS}
              onOpenHostMode={handleOpenHostMode}
            />
          )
        ) : selectedProduct ? (
          /* View 2: Product Detail Page */
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
          /* View 3: Seller Storefront */
          <SellerStorefrontView
            seller={selectedSeller}
            products={productsList}
            snippets={snippetsList}
            onBack={() => setSelectedSellerId(null)}
            onSelectProduct={handleSelectProduct}
            onOpenLiveRoom={handleOpenLiveRoom}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onOpenStudio={(sellerId) => {
              setSelectedSellerId(sellerId);
              setActiveTab('studio');
            }}
          />
        ) : activeTab === 'studio' ? (
          /* View 4: Seller Dashboard & AI Selling Assistant */
          <SellerDashboardView
            sellers={SELLERS}
            products={productsList}
            snippets={snippetsList}
            promotions={promotionsList}
            currentSellerId={selectedSellerId || SELLERS[0].id}
            onSelectSeller={(id) => setSelectedSellerId(id)}
            onBackToShopping={() => setActiveTab('discover')}
            onUpdateProductDescription={handleUpdateProductDescription}
            onPublishSnippet={handlePublishSnippet}
            onArchiveSnippet={handleArchiveSnippet}
            onExpireSnippetNow={handleExpireSnippetNow}
            onRepublishSnippet={handleRepublishSnippet}
            onOpenLiveHostMode={handleOpenHostMode}
          />
        ) : activeTab === 'basket' ? (
          /* View 5: Basket & Checkout Preview */
          <BasketCheckoutView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onBackToDiscover={() => setActiveTab('discover')}
            onSelectProduct={handleSelectProduct}
            onPlaceOrder={handlePlaceOrder}
          />
        ) : activeTab === 'live' ? (
          /* View 6: Live Streams Directory */
          <LiveStreamsListView
            liveSessions={LIVE_SESSIONS}
            products={productsList}
            onOpenLiveRoom={handleOpenLiveRoom}
          />
        ) : activeTab === 'sellers' ? (
          /* View 7: Sellers / Makers Directory */
          <SellersListView
            sellers={SELLERS}
            products={productsList}
            snippets={snippetsList}
            onSelectSeller={handleSelectSeller}
            onOpenLiveRoom={handleOpenLiveRoom}
          />
        ) : (
          /* View 8: Discover Page (Default) */
          <DiscoverView
            products={productsList}
            sellers={SELLERS}
            liveSessions={LIVE_SESSIONS}
            snippets={snippetsList}
            onSelectProduct={handleSelectProduct}
            onSelectSeller={handleSelectSeller}
            onOpenLiveRoom={handleOpenLiveRoom}
            onAddToCart={handleAddToCart}
          />
        )}
      </main>

      {/* Architecture & Free Setup Modal */}
      <SetupInfoModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onResetDemoData={handleResetDemoData}
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
        <div className="mb-4 px-4 py-2 rounded-full bg-[#14171f] border border-[#212633] text-xs font-mono text-slate-300 flex items-center gap-3 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            Simulating Viewport: <strong className="text-white">{viewportMode}</strong> ({isLandscape ? 'Landscape' : 'Portrait'})
          </span>
          <button
            onClick={() => setViewportMode('responsive')}
            className="text-[#0066ff] hover:text-[#3385ff] underline font-bold cursor-pointer ml-1"
          >
            ✕ Full Screen Fluid
          </button>
        </div>

        <div className={`${getViewportWidthStyle()} transition-all duration-300 rounded-[2.5rem] border-8 border-[#212633] shadow-2xl overflow-y-auto bg-[#0c0e12] max-h-[92vh] min-h-[640px] relative`}>
          {appContent}
        </div>
      </div>
    );
  }

  return appContent;
}
