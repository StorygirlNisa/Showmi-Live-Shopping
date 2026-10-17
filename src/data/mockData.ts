import { Product, Seller, LiveSession, LivePromotion, Order } from '../types';

// Real high-fidelity local assets generated for Showmi
import streamCapeImg from '../assets/images/stream_cape_botanics_1791709648933.jpg';
import productMarulaImg from '../assets/images/product_marula_elixir_1791709660681.jpg';
import productKarooImg from '../assets/images/product_karoo_duffle_1791709671382.jpg';
import productJoziImg from '../assets/images/product_jozi_sneaker_1791709682806.jpg';
import productCeramicImg from '../assets/images/seller_craft_ceramics_1791709692940.jpg';

export const SELLERS: Seller[] = [
  {
    id: 'seller-cape-botanics',
    name: "Le'Khoi Botanical Roots",
    handle: '@lekhoi.botanics',
    tagline: 'Fynbos-infused wild botanical serums handcrafted in Cape Town',
    bio: 'Founded by Mandisa Khumalo in Tamboerskloof, Cape Town. We harvest wild organic Kalahari melon seed and cold-pressed Marula fruit to craft small-batch restorative skin elixirs without synthetics or fillers.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    city: 'Cape Town',
    province: 'Western Cape',
    rating: 4.9,
    salesCount: 1420,
    followersCount: 12800,
    verifiedArtisan: true,
    currentLiveSessionId: 'live-lekhoi-01',
    snippets: [
      {
        id: 'snip-1',
        sellerId: 'seller-cape-botanics',
        productId: 'prod-marula-elixir',
        title: 'Cold-pressing organic Marula seeds & testing oil viscosity',
        duration: '03:42',
        recordedDate: '2 days ago',
        thumbnail: productMarulaImg,
        highlightTag: 'Extraction Demo',
        views: '4.8k',
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDurationHours: 168,
        isArchived: false,
        userDescription: 'Showing pure Marula seed extraction and testing viscosity on skin.'
      },
      {
        id: 'snip-2',
        sellerId: 'seller-cape-botanics',
        productId: 'prod-kalahari-balm',
        title: 'Morning radiance routine demo & live Q&A with Mandisa',
        duration: '05:15',
        recordedDate: '8 days ago',
        thumbnail: streamCapeImg,
        highlightTag: 'Live Routine',
        views: '8.2k',
        publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDurationHours: 168,
        isArchived: false,
        userDescription: 'Demonstrating morning face wash and melting sunscreen with Kalahari balm.'
      }
    ]
  },
  {
    id: 'seller-karoo-leather',
    name: 'Karoo Heritage Leathercraft',
    handle: '@karoo.leatherworks',
    tagline: 'Full-grain vegetable tanned goods from the heart of the Great Karoo',
    bio: 'Operating out of Nieu-Bethesda in the Eastern Cape. Third-generation saddler Danie van Zyl hand-cuts and hand-stitches heirloom leather travel bags and everyday carry using South African hides and solid brass hardware.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80',
    city: 'Nieu-Bethesda',
    province: 'Eastern Cape',
    rating: 4.95,
    salesCount: 890,
    followersCount: 7650,
    verifiedArtisan: true,
    currentLiveSessionId: 'live-karoo-01',
    snippets: [
      {
        id: 'snip-3',
        sellerId: 'seller-karoo-leather',
        productId: 'prod-karoo-duffle',
        title: 'Saddle stitching the Karoo Weekender: 2,000 tension passes',
        duration: '04:18',
        recordedDate: '3 days ago',
        thumbnail: productKarooImg,
        highlightTag: 'Artisan Workshop',
        views: '3.9k',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDurationHours: 168,
        isArchived: false,
        userDescription: 'Hand-stitching thick Karoo leather panels with reinforced thread.'
      },
      {
        id: 'snip-4',
        sellerId: 'seller-karoo-leather',
        productId: 'prod-karoo-wallet',
        title: 'Burnishing edges with local beeswax & water resistance test',
        duration: '02:50',
        recordedDate: '2 weeks ago',
        thumbnail: productKarooImg,
        highlightTag: 'Durability Test',
        views: '5.1k',
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDurationHours: 168,
        isArchived: false,
        userDescription: 'Testing leather burnishing and water droplets repelling on vegetable tanned leather.'
      }
    ]
  },
  {
    id: 'seller-jozi-street',
    name: 'Jozi Streetwear & Sneaker Lab',
    handle: '@jozi.streetwear',
    tagline: 'Afro-futuristic streetwear engineered for Johannesburg pavements',
    bio: 'Born in Maboneng, Johannesburg. We craft small-batch limited sneakers and heavyweight cotton street staples designed for African urban culture and everyday resilience.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    city: 'Johannesburg (Maboneng)',
    province: 'Gauteng',
    rating: 4.85,
    salesCount: 2310,
    followersCount: 24500,
    verifiedArtisan: true,
    currentLiveSessionId: 'live-jozi-01',
    snippets: [
      {
        id: 'snip-5',
        sellerId: 'seller-jozi-street',
        productId: 'prod-jozi-sneakers',
        title: 'City Push sole wear test on Braamfontein street asphalt',
        duration: '02:30',
        recordedDate: 'Yesterday',
        thumbnail: productJoziImg,
        highlightTag: 'Pavement Test',
        views: '11.4k',
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDurationHours: 168,
        isArchived: false,
        userDescription: 'Live test of rubber outsole grip and flexibility on rough city concrete.'
      },
      {
        id: 'snip-6',
        sellerId: 'seller-jozi-street',
        productId: 'prod-jozi-sneakers',
        title: 'Drop 04 unboxing & fit check with guest stylist Kamo',
        duration: '06:10',
        recordedDate: '4 days ago',
        thumbnail: productJoziImg,
        highlightTag: 'Fit Check',
        views: '9.8k',
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDurationHours: 168,
        isArchived: false,
        userDescription: 'Reviewing court sneaker dimensions, ankle padding, and on-foot styling.'
      }
    ]
  },
  {
    id: 'seller-kzn-ceramics',
    name: 'Mzansi Studio Ceramics',
    handle: '@mzansi.ceramics',
    tagline: 'Hand-thrown stoneware with electric cobalt glaze from Durban',
    bio: 'Potter Lindiwe Cele blends rich KwaZulu-Natal coastal speckled clay with bold electric-blue dip glazes. Every single coffee dripper and mug is thrown on the kickwheel and fired in reduction.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    rating: 4.9,
    salesCount: 940,
    followersCount: 6200,
    verifiedArtisan: true,
    snippets: [
      {
        id: 'snip-7',
        sellerId: 'seller-kzn-ceramics',
        productId: 'prod-ceramic-dripper',
        title: 'Centering 1.2kg clay & pulling pour-over coffee cones on the wheel',
        duration: '04:45',
        recordedDate: '5 days ago',
        thumbnail: productCeramicImg,
        highlightTag: 'Wheel Throwing',
        views: '6.7k',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDurationHours: 168,
        isArchived: false,
        userDescription: 'Throwing spiral ribs inside the ceramic cone for ideal brew drawdown.'
      },
      {
        id: 'snip-8',
        sellerId: 'seller-kzn-ceramics',
        productId: 'prod-ceramic-dripper',
        title: 'Kiln opening reveal: The electric cobalt dip collection',
        duration: '03:15',
        recordedDate: '10 days ago',
        thumbnail: productCeramicImg,
        highlightTag: 'Kiln Reveal',
        views: '12.1k',
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDurationHours: 168,
        isArchived: false,
        userDescription: 'Opening the reduction kiln to inspect reactive cobalt blue glaze.'
      }
    ]
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-marula-elixir',
    sellerId: 'seller-cape-botanics',
    sellerName: "Le'Khoi Botanical Roots",
    sellerLocation: 'Cape Town, Western Cape',
    name: 'Botanical Roots Pure Marula & Rooibos Facial Elixir (30ml)',
    category: 'beauty',
    categoryLabel: 'Beauty & Fynbos',
    priceZAR: 480,
    originalPriceZAR: 560,
    stock: 14,
    dispatchTime: 'Dispatched within 24 hours from Cape Town',
    courierPartner: 'The Courier Guy / Courier Express (2-3 business days across SA)',
    images: [
      productMarulaImg,
      streamCapeImg,
    ],
    description: 'Cold-pressed wild South African marula seed oil infused with antioxidant-rich Cape Cedarberg rooibos extract. Light, rapidly absorbing, and leaves an unmistakable luminous African glow without greasy residue.',
    features: [
      '100% Wild-harvested Marula Seed Oil',
      'Infused with Cedarberg Organic Green Rooibos',
      'Amber UV glass bottle with precision pipette',
      'Cruelty-free, vegan & free from synthetic perfume',
      'Hand-bottled in Tamboerskloof, Cape Town'
    ],
    rating: 4.9,
    reviewCount: 88,
    liveNowSessionId: 'live-lekhoi-01'
  },
  {
    id: 'prod-karoo-duffle',
    sellerId: 'seller-karoo-leather',
    sellerName: 'Karoo Heritage Leathercraft',
    sellerLocation: 'Nieu-Bethesda, Eastern Cape',
    name: 'Karoo Handcrafted Full-Grain Leather Weekender Duffle',
    category: 'leather',
    categoryLabel: 'Leather & Craft',
    priceZAR: 2850,
    originalPriceZAR: 3200,
    stock: 6,
    dispatchTime: 'Dispatched within 48 hours from Nieu-Bethesda',
    courierPartner: 'The Courier Guy Direct (3-4 days nationwide)',
    images: [
      productKarooImg,
    ],
    description: 'An heirloom travel companion built to last generations. Crafted from thick 2.2mm South African vegetable-tanned bovine leather in rich saddle tan, fitted with heavy antique brass zips and reinforced load-bearing saddle stitching.',
    features: [
      '2.2mm Full-Grain South African Saddle Tan Leather',
      'Heavy-duty solid antique brass zips and hardware',
      'Detachable ergonomic leather shoulder strap with pad',
      'Internal zippered passport and keys security pocket',
      'Lifetime craftsmanship stitching guarantee'
    ],
    rating: 5.0,
    reviewCount: 42,
    liveNowSessionId: 'live-karoo-01'
  },
  {
    id: 'prod-jozi-sneakers',
    sellerId: 'seller-jozi-street',
    sellerName: 'Jozi Streetwear & Sneaker Lab',
    sellerLocation: 'Maboneng, Johannesburg',
    name: 'City Push High-Top Court Sneaker - Electric Blue / Charcoal',
    category: 'streetwear',
    categoryLabel: 'Footwear & Streetwear',
    priceZAR: 1950,
    originalPriceZAR: 2200,
    stock: 8,
    dispatchTime: 'Dispatched within 24 hours from Maboneng, JHB',
    courierPartner: 'Fastway & Courier Guy Express (1-2 days Gauteng, 2-3 days coastal)',
    images: [
      productJoziImg,
    ],
    description: 'Engineered for high durability on concrete and tarmac. Features premium electric-blue textured nubuck, charcoal ballistic canvas paneling, high-impact air cushioning in the heel, and a grippy chevron rubber outsole.',
    features: [
      'Genuine South African nubuck suede with electric blue accents',
      'Encapsulated heel air cushioning unit for city walking',
      'Reinforced ankle collar strap with custom Jozi typography',
      'High-traction dual-density non-marking rubber outsole',
      'Comes with dual electric blue and charcoal lace sets'
    ],
    rating: 4.8,
    reviewCount: 114,
    liveNowSessionId: 'live-jozi-01'
  },
  {
    id: 'prod-ceramic-dripper',
    sellerId: 'seller-kzn-ceramics',
    sellerName: 'Mzansi Studio Ceramics',
    sellerLocation: 'Durban, KwaZulu-Natal',
    name: 'Speckled Stoneware Pour-Over Dripper & Mug Set - Electric Cobalt',
    category: 'ceramics',
    categoryLabel: 'Home & Ceramics',
    priceZAR: 640,
    originalPriceZAR: 720,
    stock: 12,
    dispatchTime: 'Dispatched within 48 hours from Durban',
    courierPartner: 'The Courier Guy / Dawn Wing (2-3 business days)',
    images: [
      productCeramicImg,
    ],
    description: 'Wheel-thrown coffee brewer and matching 350ml mug, crafted from iron-speckled stoneware clay and finished in a vibrant electric cobalt glaze dip. Fits standard V60-02 paper coffee filters for clean, rich extraction.',
    features: [
      'Individually hand-thrown on the potter’s kickwheel in Durban',
      'Signature electric-blue reactive cobalt dip glaze',
      'Optimised internal spiral ribbing for balanced coffee flow',
      'Dishwasher and microwave safe high-fired stoneware (1220°C)',
      'Includes 10 unbleached compostable filter papers'
    ],
    rating: 4.9,
    reviewCount: 39
  },
  {
    id: 'prod-kalahari-balm',
    sellerId: 'seller-cape-botanics',
    sellerName: "Le'Khoi Botanical Roots",
    sellerLocation: 'Cape Town, Western Cape',
    name: 'Wild Kalahari Melon & Frankincense Cleansing Balm (100ml)',
    category: 'beauty',
    categoryLabel: 'Beauty & Fynbos',
    priceZAR: 390,
    stock: 19,
    dispatchTime: 'Dispatched within 24 hours from Cape Town',
    courierPartner: 'The Courier Guy / Courier Express',
    images: [
      productMarulaImg,
    ],
    description: 'Melts water-resistant sunscreen and makeup on contact without stripping skin lipids. Powered by Kalahari melon seed linoleic acid and organic Somali frankincense.',
    features: [
      'Cold-pressed Kalahari melon seed base',
      'Washes away cleanly with warm water',
      'Glass tub with recyclable aluminium lid',
      'Free from mineral oils and parabens'
    ],
    rating: 4.8,
    reviewCount: 27
  },
  {
    id: 'prod-karoo-wallet',
    sellerId: 'seller-karoo-leather',
    sellerName: 'Karoo Heritage Leathercraft',
    sellerLocation: 'Nieu-Bethesda, Eastern Cape',
    name: 'Kalahari Minimalist Veg-Tanned Bifold Wallet - Saddle Tan',
    category: 'leather',
    categoryLabel: 'Leather & Craft',
    priceZAR: 550,
    stock: 24,
    dispatchTime: 'Dispatched within 24 hours from Nieu-Bethesda',
    courierPartner: 'The Courier Guy / Pargo Locker Available',
    images: [
      productKarooImg,
    ],
    description: 'Slimline front-pocket wallet carrying up to 8 cards plus folded South African rand banknotes. Patinas into a rich golden brown with daily handling.',
    features: [
      'Ultra-compact 8mm folded thickness',
      'Hand-burnished with natural Cape beeswax',
      '6 card slots plus central cash divider',
      '100% full-grain South African bovine leather'
    ],
    rating: 4.9,
    reviewCount: 65
  }
];

export const LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'live-lekhoi-01',
    title: 'Fynbos & Marula Radiance Glow Routine — Live Harvest Q&A',
    sellerId: 'seller-cape-botanics',
    sellerName: "Le'Khoi Botanical Roots",
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    sellerLocation: 'Tamboerskloof, Cape Town',
    viewerCount: 1420,
    isLive: true,
    coverImage: streamCapeImg,
    featuredProductId: 'prod-marula-elixir',
    additionalProductIds: ['prod-kalahari-balm'],
    streamCategory: 'Beauty & Skincare',
    initialComments: [
      {
        id: 'c1',
        userName: 'Mandi S.',
        location: 'Cape Town',
        text: 'The glow on camera is unreal! Just ordered my 2nd bottle ❤️',
        timestamp: '1m ago'
      },
      {
        id: 'c2',
        userName: 'Thabo M.',
        location: 'Soweto',
        text: 'Does this work well for combination dry skin during winter in JHB?',
        timestamp: '45s ago'
      },
      {
        id: 'c3',
        userName: "Mandisa (Host)",
        location: 'Host',
        text: 'Thabo! Yes! The high linoleic ratio makes it absorb in 30 seconds without shine.',
        timestamp: '30s ago',
        isHost: true
      },
      {
        id: 'c4',
        userName: 'Zoe van der Merwe',
        location: 'Stellenbosch',
        text: 'How quickly does The Courier Guy deliver to Stellenbosch?',
        timestamp: '15s ago'
      },
      {
        id: 'c5',
        userName: 'Kagiso N.',
        location: 'Durban North',
        text: 'Added to basket! Can you show the dropper texture on your wrist again?',
        timestamp: 'Just now'
      }
    ]
  },
  {
    id: 'live-jozi-01',
    title: 'Drop 04: City Push High-Top Court Sneaker Showcase & Wear Test',
    sellerId: 'seller-jozi-street',
    sellerName: 'Jozi Streetwear & Sneaker Lab',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    sellerLocation: 'Maboneng, Johannesburg',
    viewerCount: 2180,
    isLive: true,
    coverImage: productJoziImg,
    featuredProductId: 'prod-jozi-sneakers',
    additionalProductIds: [],
    streamCategory: 'Streetwear & Kicks',
    initialComments: [
      {
        id: 'cj1',
        userName: 'Siya D.',
        location: 'Braamfontein',
        text: 'That electric blue suede pops so hard 🔥🔥',
        timestamp: '2m ago'
      },
      {
        id: 'cj2',
        userName: 'Bongani K.',
        location: 'Pretoria',
        text: 'Are sizes true to size or size up for wide feet?',
        timestamp: '1m ago'
      },
      {
        id: 'cj3',
        userName: 'Jozi Lab Host',
        location: 'Host',
        text: 'True to size! Sbu is wearing UK 10 right now with sports socks.',
        timestamp: '30s ago',
        isHost: true
      }
    ]
  },
  {
    id: 'live-karoo-01',
    title: 'Behind the Bench: Hand-Stitching the Karoo Weekender Live',
    sellerId: 'seller-karoo-leather',
    sellerName: 'Karoo Heritage Leathercraft',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    sellerLocation: 'Nieu-Bethesda, Karoo',
    viewerCount: 890,
    isLive: true,
    coverImage: productKarooImg,
    featuredProductId: 'prod-karoo-duffle',
    additionalProductIds: ['prod-karoo-wallet'],
    streamCategory: 'Artisanal Craft',
    initialComments: [
      {
        id: 'ck1',
        userName: 'Christo P.',
        location: 'Bloemfontein',
        text: 'The brass buckle detailing is superb Danie. Pure Karoo quality.',
        timestamp: '3m ago'
      },
      {
        id: 'ck2',
        userName: 'Nadia B.',
        location: 'Port Elizabeth',
        text: 'Does it fit as carry-on for FlySafair flights?',
        timestamp: '1m ago'
      },
      {
        id: 'ck3',
        userName: 'Danie (Maker)',
        location: 'Host',
        text: 'Fits all domestic airline overhead bins perfectly! 52 x 28 x 26cm.',
        timestamp: '20s ago',
        isHost: true
      }
    ]
  }
];

export const CATEGORIES_LIST: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'All Categories', icon: '✨' },
  { id: 'beauty', label: 'Beauty & Fynbos', icon: '🌿' },
  { id: 'streetwear', label: 'Streetwear & Kicks', icon: '👟' },
  { id: 'leather', label: 'Leather & Craft', icon: '🧳' },
  { id: 'ceramics', label: 'Home & Ceramics', icon: '☕' },
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

export const ALL_INITIAL_SNIPPETS = SELLERS.flatMap(s => s.snippets);

export const INITIAL_PROMOTIONS: LivePromotion[] = [
  {
    id: 'promo-lekhoi-marula',
    sellerId: 'seller-cape-botanics',
    productId: 'prod-marula-elixir',
    title: 'Live Room Special: R40 Off + Complimentary Fynbos Soap',
    terms: 'R40 discount off standard R420 price + complimentary wild honey soap for live stream viewers.',
    promoPriceZAR: 380,
    discountPercentage: 10,
    startDate: new Date(Date.now() - 2 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    isActive: true
  },
  {
    id: 'promo-lekhoi-kalahari',
    sellerId: 'seller-cape-botanics',
    productId: 'prod-kalahari-balm',
    title: 'Past Weekend Morning Routine Bundle',
    terms: 'Expired flash launch special (10% off for early morning routine stream).',
    promoPriceZAR: 310,
    discountPercentage: 10,
    startDate: new Date(Date.now() - 72 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    isActive: false
  },
  {
    id: 'promo-jozi-sneakers',
    sellerId: 'seller-jozi-street',
    productId: 'prod-jozi-sneakers',
    title: 'Live Studio Drop: Free Extra Electric Blue Laces & Bag',
    terms: 'Complimentary extra lace set and Jozi sneaker carry pouch with every live order.',
    promoPriceZAR: 1950,
    startDate: new Date(Date.now() - 1 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 3600000).toISOString(),
    isActive: true
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'SHW-582914',
    buyerId: 'buyer-current',
    customerName: 'Nisa Bardien',
    customerEmail: 'nisabardien@gmail.com',
    customerPhone: '+27 82 555 1234',
    shippingAddress: '14 Kloof Nek Road, Gardens',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8001',
    items: [
      {
        productId: 'prod-marula-elixir',
        sellerId: 'seller-cape-botanics',
        sellerName: "Le'Khoi Botanical Roots",
        productImage: productMarulaImg,
        name: 'Cold-Pressed Marula Restorative Elixir (50ml)',
        quantity: 1,
        priceZAR: 420,
        status: 'in_transit',
        courierPartner: 'The Courier Guy',
        trackingNumber: 'TCG-ZA-48291045',
        dispatchedAt: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        productId: 'prod-karoo-duffle',
        sellerId: 'seller-karoo-leather',
        sellerName: 'Karoo Heritage Leathercraft',
        productImage: productKarooImg,
        name: 'Karoo Heirloom Leather Weekender Duffle',
        quantity: 1,
        priceZAR: 3850,
        status: 'awaiting_dispatch'
      }
    ],
    subtotalZAR: 4270,
    shippingZAR: 0,
    protectionFeeZAR: Math.round(4270 * 0.08), // R 342
    totalZAR: 4270 + 0 + Math.round(4270 * 0.08), // R 4612
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 3600000).toISOString(),
    protectionExpiresAt: new Date(Date.now() + 16 * 24 * 3600000).toISOString(), // 14 days after estimated delivery!
    deliveryMethod: 'Standard Door-to-Door Courier',
    paymentMethod: 'Ozow Instant EFT (Simulated)'
  },
  {
    id: 'SHW-319042',
    buyerId: 'buyer-current',
    customerName: 'Nisa Bardien',
    customerEmail: 'nisabardien@gmail.com',
    customerPhone: '+27 82 555 1234',
    shippingAddress: '14 Kloof Nek Road, Gardens',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8001',
    items: [
      {
        productId: 'prod-jozi-sneakers',
        sellerId: 'seller-jozi-street',
        sellerName: 'Jozi Streetwear & Sneaker Lab',
        productImage: productJoziImg,
        name: 'City Push Court Low Sneakers (Drop 04)',
        quantity: 1,
        priceZAR: 1950,
        status: 'delivered',
        courierPartner: 'The Courier Guy Express',
        trackingNumber: 'TCG-ZA-89102452',
        dispatchedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
        deliveredAt: new Date(Date.now() - 6 * 3600000).toISOString()
      }
    ],
    subtotalZAR: 1950,
    shippingZAR: 0,
    protectionFeeZAR: Math.round(1950 * 0.08), // R 156
    totalZAR: 1950 + 0 + Math.round(1950 * 0.08), // R 2106
    createdAt: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    estimatedDeliveryDate: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    protectionExpiresAt: new Date(Date.now() + 13 * 24 * 3600000).toISOString(), // 14 days from estimated delivery date!
    deliveryMethod: 'Standard Door-to-Door Courier',
    paymentMethod: 'Capitec Pay (Simulated)'
  }
];


