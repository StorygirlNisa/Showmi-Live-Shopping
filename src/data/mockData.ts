import { Product, Seller, LiveSession, LivePromotion, Order, OrderIssue } from '../types';

import streamCapeImg from '../assets/images/stream_cape_botanics_1791709648933.jpg';
import productMarulaImg from '../assets/images/product_marula_elixir_1791709660681.jpg';
import productKarooImg from '../assets/images/product_karoo_duffle_1791709671382.jpg';
import productJoziImg from '../assets/images/product_jozi_sneaker_1791709682806.jpg';

export const LEGACY_SELLERS: Seller[] = [
  {
    id: 'seller-karoo-leather',
    name: 'Karoo Heritage Leathercraft',
    handle: '@karoo.leatherworks',
    tagline: 'Full-grain vegetable tanned goods',
    bio: 'Operating out of Nieu-Bethesda.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80',
    city: 'Nieu-Bethesda',
    province: 'Eastern Cape',
    rating: 4.95,
    salesCount: 890,
    followersCount: 7650,
    verifiedArtisan: true,
    snippets: []
  }
];

export const SELLERS: Seller[] = [
  {
    id: 'seller-cupcake-corner',
    name: "The Cupcake Corner",
    handle: '@cupcake.corner',
    tagline: 'Delightful artisanal cupcakes baked daily.',
    bio: 'Artisanal bakery specializing in gourmet cupcakes.',
    avatar: 'https://images.unsplash.com/photo-1587668178277-295251f900de?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
    city: 'Cape Town',
    province: 'Western Cape',
    rating: 5.0,
    salesCount: 0,
    followersCount: 0,
    verifiedArtisan: true,
    snippets: [],
    currentLiveSessionId: 'live-cupcake-01'
  },
  {
    id: 'seller-glow-theory',
    name: "Glow Theory Skincare",
    handle: '@glow.theory',
    tagline: 'Fynbos-infused wild botanical serums',
    bio: 'Restorative skin elixirs crafted with local botanicals.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    city: 'Cape Town',
    province: 'Western Cape',
    rating: 4.9,
    salesCount: 1420,
    followersCount: 12800,
    verifiedArtisan: true,
    snippets: [],
    currentLiveSessionId: 'live-glow-01'
  },
  {
    id: 'seller-style-edit',
    name: "The Style Edit",
    handle: '@style.edit',
    tagline: 'Afro-futuristic streetwear',
    bio: 'Curated fashion and streetwear staples.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    city: 'Johannesburg',
    province: 'Gauteng',
    rating: 4.85,
    salesCount: 2310,
    followersCount: 24500,
    verifiedArtisan: true,
    snippets: [],
    currentLiveSessionId: 'live-style-01'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-cupcake-6',
    sellerId: 'seller-cupcake-corner',
    sellerName: "The Cupcake Corner",
    sellerLocation: 'Cape Town',
    name: 'Cupcake Six-Pack',
    category: 'pantry',
    categoryLabel: 'Food & Bakery',
    priceZAR: 150,
    stock: 20,
    dispatchTime: 'Baked fresh, 24 hours',
    courierPartner: 'Local Delivery',
    images: ['https://images.unsplash.com/photo-1587668178277-295251f900de?auto=format&fit=crop&w=400&q=80'],
    description: 'A delicious assortment of our classic cupcakes.',
    features: ['Handcrafted', 'Fresh ingredients'],
    rating: 5.0,
    reviewCount: 10
  },
  {
    id: 'prod-marula-elixir',
    sellerId: 'seller-glow-theory',
    sellerName: "Glow Theory Skincare",
    sellerLocation: 'Cape Town, Western Cape',
    name: 'Botanical Roots Pure Marula & Rooibos Facial Elixir (30ml)',
    category: 'beauty',
    categoryLabel: 'Beauty & Skincare',
    priceZAR: 480,
    stock: 14,
    dispatchTime: 'Dispatched within 24 hours',
    courierPartner: 'The Courier Guy',
    images: [productMarulaImg],
    description: 'Cold-pressed wild marula seed oil...',
    features: ['Organic', 'Cruelty-free'],
    rating: 4.9,
    reviewCount: 88,
    liveNowSessionId: 'live-glow-01'
  },
  {
    id: 'prod-jozi-sneakers',
    sellerId: 'seller-style-edit',
    sellerName: 'The Style Edit',
    sellerLocation: 'Johannesburg',
    name: 'City Push High-Top Court Sneaker',
    category: 'streetwear',
    categoryLabel: 'Clothing & Fashion',
    priceZAR: 1950,
    stock: 8,
    dispatchTime: 'Dispatched within 24 hours',
    courierPartner: 'Fastway',
    images: [productJoziImg],
    description: 'Engineered for high durability...',
    features: ['Premium nubuck', 'High-impact air cushioning'],
    rating: 4.8,
    reviewCount: 114,
    liveNowSessionId: 'live-style-01'
  }
];

export const LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'live-cupcake-01',
    title: 'The Cupcake Corner: Freshly Baked Delights',
    sellerId: 'seller-cupcake-corner',
    sellerName: "The Cupcake Corner",
    sellerAvatar: 'https://images.unsplash.com/photo-1587668178277-295251f900de?auto=format&fit=crop&w=300&q=80',
    sellerLocation: 'Cape Town',
    viewerCount: 500,
    isLive: true,
    coverImage: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=300&q=80',
    featuredProductId: 'prod-cupcake-6',
    additionalProductIds: [],
    streamCategory: 'Food & Bakery',
    initialComments: [
      { id: 'c-cupcake-1', userName: 'Zandi K.', text: 'Are the vanilla bean cupcakes nut-free?', timestamp: '2m ago' },
      { id: 'c-cupcake-2', userName: 'Lungile M.', text: 'The packaging looks so premium! Adding to cart 🇿🇦', timestamp: '1m ago' },
      { id: 'c-cupcake-3', userName: 'SpamBot99', text: 'Earn quick money online: visit www.fakelink-za.xyz 🚫', timestamp: 'Just now' },
      { id: 'c-cupcake-4', userName: 'Kobus V.', text: 'Can this be shipped via local door-to-door courier?', timestamp: 'Just now' }
    ],
    videoUrl: '/assets/videos/South%20African%20Baker%20Cupcake%20Live%20%282%29.mp4'
  },
  {
    id: 'live-glow-01',
    title: 'Glow Theory Skincare Routine',
    sellerId: 'seller-glow-theory',
    sellerName: "Glow Theory Skincare",
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    sellerLocation: 'Cape Town',
    viewerCount: 1420,
    isLive: true,
    coverImage: streamCapeImg,
    featuredProductId: 'prod-marula-elixir',
    additionalProductIds: [],
    streamCategory: 'Beauty & Skincare',
    initialComments: [
      { id: 'c-glow-1', userName: 'Zandi K.', text: 'Does it feel lightweight on sensitive skin?', timestamp: '2m ago' },
      { id: 'c-glow-2', userName: 'FakePromoBot', text: 'Get free crypto tokens at http://scam-promo.top ❌', timestamp: '1m ago' },
      { id: 'c-glow-3', userName: 'Carla D.', text: 'Ordered! Can’t wait for The Courier Guy delivery.', timestamp: 'Just now' }
    ],
    videoUrl: '/assets/videos/Skincare%20Livestream%20Demonstration%20%281%29.mp4'
  },
  {
    id: 'live-style-01',
    title: 'The Style Edit: Boutique Fashion',
    sellerId: 'seller-style-edit',
    sellerName: 'The Style Edit',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    sellerLocation: 'Johannesburg',
    viewerCount: 2180,
    isLive: true,
    coverImage: productJoziImg,
    featuredProductId: 'prod-jozi-sneakers',
    additionalProductIds: [],
    streamCategory: 'Clothing & Fashion',
    initialComments: [
      { id: 'c-style-1', userName: 'Sipho B.', text: 'What sizes are left in the high-tops?', timestamp: '2m ago' },
      { id: 'c-style-2', userName: 'SpamAd32', text: 'Luxury replica watches whatsapp: 0812345678 ⚠️', timestamp: '1m ago' },
      { id: 'c-style-3', userName: 'Nthabi P.', text: 'The nubuck stitching is top tier.', timestamp: 'Just now' }
    ],
    videoUrl: '/assets/videos/Boutique%20Live%20Shopping%20Stream%20%282%29.mp4'
  }
];

// Re-export other constants required by App.tsx
export const CATEGORIES_LIST = [
  { id: 'all', label: 'All Categories', icon: '✨' },
  { id: 'beauty', label: 'Beauty & Skincare', icon: '🌿' },
  { id: 'streetwear', label: 'Clothing & Fashion', icon: '👟' },
  { id: 'pantry', label: 'Food & Bakery', icon: '🥐' },
];

export const SA_PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Mpumalanga',
  'Limpopo',
  'North West',
  'Northern Cape'
];

export const INITIAL_PROMOTIONS: LivePromotion[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_ISSUES: OrderIssue[] = [];
