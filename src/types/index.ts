export type Category = 
  | 'all'
  | 'beauty'
  | 'streetwear'
  | 'leather'
  | 'ceramics'
  | 'pantry';

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
  name: string;
  category: Category;
  categoryLabel: string;
  priceZAR: number;
  originalPriceZAR?: number;
  stock: number;
  dispatchTime: string; // e.g. "24–48 hours from Cape Town"
  courierPartner: string; // e.g. "The Courier Guy / Courier Express"
  images: string[];
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
  liveNowSessionId?: string;
}

export interface StreamSnippet {
  id: string;
  sellerId: string;
  productId: string;
  title: string;
  duration: string;
  recordedDate: string;
  thumbnail: string;
  highlightTag: string;
  views: string;
  publishedAt: string;
  expiresAt: string;
  expiryDurationHours: number;
  isArchived?: boolean;
  userDescription?: string;
  caption?: string;
  tags?: string;
}

export interface Seller {
  id: string;
  name: string;
  handle: string;
  tagline: string;
  bio: string;
  avatar: string;
  bannerImage: string;
  city: string;
  province: string;
  rating: number;
  salesCount: number;
  followersCount: number;
  verifiedArtisan: boolean;
  snippets: StreamSnippet[];
  currentLiveSessionId?: string;
}

export interface LiveComment {
  id: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  isHost?: boolean;
  isCurrentUser?: boolean;
}

export interface LiveSession {
  id: string;
  title: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerLocation: string;
  viewerCount: number;
  isLive: boolean;
  coverImage: string;
  featuredProductId: string;
  additionalProductIds: string[];
  streamCategory: string;
  initialComments: LiveComment[];
  videoUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface OrderItem {
  productId: string;
  sellerId: string;
  sellerName?: string;
  productImage?: string;
  name: string;
  quantity: number;
  priceZAR: number;
  status: 'awaiting_dispatch' | 'in_transit' | 'delivered' | 'confirmed';
  courierPartner?: string;
  trackingNumber?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  confirmedAt?: string;
  paymentReleased?: boolean;
  paymentReleasedAt?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  province: string;
  postalCode: string;
  items: OrderItem[];
  subtotalZAR: number;
  shippingZAR: number;
  protectionFeeZAR: number;
  totalZAR: number;
  createdAt: string;
  estimatedDeliveryDate: string;
  protectionExpiresAt: string;
  deliveryMethod: string;
  paymentMethod: string;
  confirmedAt?: string;
  paymentReleased?: boolean;
  paymentReleasedAt?: string;
}

export type IssueType = 
  | 'item_not_received' 
  | 'item_damaged' 
  | 'incorrect_item' 
  | 'missing_items' 
  | 'other'
  | 'return_request';

export type IssueStatus = 'submitted' | 'seller_responded' | 'resolved';

export interface SellerResponse {
  message: string;
  resolutionNote?: string;
  respondedAt: string;
}

export interface OrderIssue {
  id: string;
  orderId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  issueType: IssueType;
  issueTypeLabel: string;
  description: string;
  evidenceImage?: string;
  status: IssueStatus;
  createdAt: string;
  sellerResponse?: SellerResponse;
  isPostReleaseReturn?: boolean;
}

export interface OrderConfirmation {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryMethod: string;
  paymentMethod: string;
  items: CartItem[];
  subtotalZAR: number;
  shippingZAR: number;
  protectionFeeZAR: number;
  totalZAR: number;
  estimatedDeliveryDate: string;
  protectionExpiresAt: string;
}

export interface LivePromotion {
  id: string;
  sellerId: string;
  productId: string;
  title: string;
  terms: string;
  discountPercentage?: number;
  promoPriceZAR?: number;
  startDate: string;
  expiresAt: string;
  isActive: boolean;
}

export type SalesCoachPromptCategory =
  | 'welcome'
  | 'demo'
  | 'engagement'
  | 'promotion'
  | 'stock'
  | 'cta'
  | 'close';

export interface SalesCoachPrompt {
  id: string;
  category: SalesCoachPromptCategory;
  categoryLabel: string;
  title: string;
  body: string;
  guidanceTip?: string;
  sourceContext: string;
  priority: 'normal' | 'urgent';
  isDismissed?: boolean;
  productId?: string;
}
