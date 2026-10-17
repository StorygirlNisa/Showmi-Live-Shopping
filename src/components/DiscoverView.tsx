import React, { useState } from 'react';
import { 
  Radio, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Truck, 
  Clock, 
  Star, 
  ArrowRight, 
  MapPin, 
  Users, 
  Check, 
  Play,
  Film
} from 'lucide-react';
import { Product, Seller, LiveSession, Category, StreamSnippet } from '../types';
import { CATEGORIES_LIST } from '../data/mockData';

interface DiscoverViewProps {
  products: Product[];
  sellers: Seller[];
  liveSessions: LiveSession[];
  snippets?: StreamSnippet[];
  onSelectProduct: (productId: string) => void;
  onSelectSeller: (sellerId: string) => void;
  onOpenLiveRoom: (sessionId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  products,
  sellers,
  liveSessions,
  snippets,
  onSelectProduct,
  onSelectSeller,
  onOpenLiveRoom,
  onAddToCart
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const activeLiveStreams = liveSessions.filter(s => s.isLive);
  const heroLive = activeLiveStreams[0];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
      
      {/* Search & Notice Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search South African makers, serums, sneakers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14171f] border border-[#212633] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0066ff] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#12151d] px-3.5 py-2 rounded-xl border border-[#212633] self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span>Courier Delivery Across All 9 SA Provinces</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 font-mono">ZAR (R)</span>
        </div>
      </div>

      {/* Hero Live Session Spotlight (Vertical/Horizontal hybrid for maximum mobile & desktop presence) */}
      {heroLive && (
        <section className="relative rounded-2xl overflow-hidden border border-[#212633] bg-[#14171f] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Visual Stream Window Preview */}
            <div className="lg:col-span-7 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[380px] bg-black overflow-hidden group">
              <img
                src={heroLive.coverImage}
                alt={heroLive.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1117] via-transparent to-black/60 pointer-events-none" />

              {/* Live Status Indicators */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  Live Now
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  {heroLive.viewerCount.toLocaleString()} watching
                </span>
              </div>

              {/* Demonstration Disclaimer Badge */}
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-slate-300 text-[11px] px-2.5 py-1 rounded-md border border-white/10 font-mono">
                Demonstration Stream
              </div>

              {/* Play CTA Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => onOpenLiveRoom(heroLive.id)}
                  className="w-16 h-16 rounded-full bg-[#0066ff] text-white flex items-center justify-center shadow-xl shadow-[#0066ff]/40 hover:scale-110 active:scale-95 transition-all cursor-pointer group-hover:bg-[#1a75ff]"
                >
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </button>
              </div>

              {/* Bottom Stream Host Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <img
                    src={heroLive.sellerAvatar}
                    alt={heroLive.sellerName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border-2 border-[#0066ff] object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm leading-tight">{heroLive.sellerName}</p>
                    <p className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      {heroLive.sellerLocation}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenLiveRoom(heroLive.id)}
                  className="px-3.5 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Join Room
                </button>
              </div>
            </div>

            {/* Stream Info & Featured Product Right-Side Module */}
            <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-6 bg-[#14171f]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0066ff]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured Broadcast
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                  {heroLive.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
                  Interact live with the makers, ask about formulation and sizing, and purchase directly with dispatch across South Africa.
                </p>
              </div>

              {/* Pinned Featured Item in Stream */}
              {(() => {
                const featuredProd = products.find(p => p.id === heroLive.featuredProductId);
                if (!featuredProd) return null;
                return (
                  <div className="p-3.5 rounded-xl bg-[#0c0e12] border border-[#212633] space-y-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Pinned Product in Show
                    </span>
                    <div 
                      onClick={() => onSelectProduct(featuredProd.id)}
                      className="flex items-center gap-3.5 cursor-pointer group"
                    >
                      <img
                        src={featuredProd.images[0]}
                        alt={featuredProd.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover shrink-0 border border-[#262c3a] group-hover:opacity-90"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#0066ff] transition-colors">
                          {featuredProd.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-base font-bold font-mono text-white">
                            R {featuredProd.priceZAR.toLocaleString()}
                          </span>
                          {featuredProd.originalPriceZAR && (
                            <span className="text-xs text-slate-500 line-through font-mono">
                              R {featuredProd.originalPriceZAR.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-emerald-400 mt-0.5">
                          {featuredProd.stock} units left in stock
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={(e) => handleQuickAdd(featuredProd, e)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          addedProductId === featuredProd.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#1e2330] hover:bg-[#272d3e] text-white border border-[#2e3648]'
                        }`}
                      >
                        {addedProductId === featuredProd.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-[#0066ff]" />
                            Add to Basket
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onOpenLiveRoom(heroLive.id)}
                        className="py-2 px-3 rounded-lg text-xs font-semibold bg-[#0066ff] hover:bg-[#0052cc] text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        Watch & Buy
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* Live Sessions Row (All active live streams) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Live Shopping Rooms
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {activeLiveStreams.length} streaming now
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeLiveStreams.map((session) => (
            <div
              key={session.id}
              onClick={() => onOpenLiveRoom(session.id)}
              className="group bg-[#14171f] rounded-xl border border-[#212633] overflow-hidden hover:border-[#0066ff]/60 transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={session.coverImage}
                  alt={session.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    Live
                  </span>
                  <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" />
                    {session.viewerCount}
                  </span>
                </div>

                <div className="absolute top-3 right-3 bg-black/60 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-white/10 font-mono">
                  Demo
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <img
                    src={session.sellerAvatar}
                    alt={session.sellerName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-white/50 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate leading-tight">
                      {session.sellerName}
                    </p>
                    <p className="text-[10px] text-slate-300 truncate">
                      {session.sellerLocation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <h4 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#0066ff] transition-colors">
                  {session.title}
                </h4>
                <div className="flex items-center justify-between pt-1 border-t border-[#212633] text-xs">
                  <span className="text-slate-400 text-[11px]">{session.streamCategory}</span>
                  <span className="text-[#0066ff] font-semibold flex items-center gap-1">
                    Enter Stream <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Filter Tabs (Interactive Filter Controls allowed by design guidelines) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Browse by Department
          </h3>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as Category)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/25'
                  : 'bg-[#14171f] text-slate-300 hover:text-white border border-[#212633] hover:border-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Featured South African Products
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Small-batch crafted, authenticated local makers, fast nationwide dispatch
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {filteredProducts.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product.id)}
              className="group bg-[#14171f] rounded-2xl border border-[#212633] overflow-hidden hover:border-[#0066ff]/50 transition-all duration-200 cursor-pointer flex flex-col"
            >
              {/* Product Image Area */}
              <div className="relative aspect-[4/3] bg-[#0c0e12] overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Stock or Live Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.liveNowSessionId && (
                    <span className="bg-red-600/95 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      On Live Now
                    </span>
                  )}
                  {product.stock <= 8 && (
                    <span className="bg-amber-500/90 backdrop-blur-md text-black text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Only {product.stock} left
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3">
                  <span className="bg-[#0c0e12]/80 backdrop-blur-md text-slate-300 text-[10px] px-2 py-0.5 rounded border border-white/10 font-mono">
                    {product.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="hover:text-slate-200 truncate max-w-[180px]">
                      {product.sellerName}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 text-[11px] font-medium shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#0066ff] transition-colors">
                    {product.name}
                  </h4>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#212633]">
                  {/* Price and Stock */}
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold font-mono text-white">
                        R {product.priceZAR.toLocaleString()}
                      </span>
                      {product.originalPriceZAR && (
                        <span className="text-xs text-slate-500 line-through font-mono">
                          R {product.originalPriceZAR.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Stock: {product.stock}
                    </span>
                  </div>

                  {/* Dispatch Estimate */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-[#0066ff] shrink-0" />
                    <span className="truncate">{product.dispatchTime}</span>
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      addedProductId === product.id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-[#181c25] hover:bg-[#0066ff] text-slate-200 hover:text-white border border-[#262c3a] hover:border-transparent'
                    }`}
                  >
                    {addedProductId === product.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Added to Basket
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Quick Add to Basket
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured South African Sellers */}
      <section className="space-y-4 pt-4 border-t border-[#212633]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Meet the South African Makers
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Independent workshops and ateliers broadcasting live
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              onClick={() => onSelectSeller(seller.id)}
              className="bg-[#14171f] rounded-2xl border border-[#212633] p-4 hover:border-[#0066ff]/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#212633] group-hover:border-[#0066ff] transition-colors"
                  />
                  {seller.currentLiveSessionId && (
                    <span className="inline-flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      Streaming
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-white text-sm group-hover:text-[#0066ff] transition-colors">
                    {seller.name}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                    {seller.city}, {seller.province}
                  </p>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {seller.tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#212633] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-[#0066ff]" />
                  {(snippets ? snippets.filter(s => s.sellerId === seller.id && !s.isArchived && new Date(s.expiresAt).getTime() > Date.now()) : seller.snippets.filter(s => !s.isArchived && new Date(s.expiresAt).getTime() > Date.now())).length} active clips
                </span>
                <span className="text-[#0066ff] font-semibold flex items-center gap-1">
                  Visit Store <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="bg-gradient-to-r from-[#14171f] via-[#10141d] to-[#14171f] border border-[#212633] rounded-2xl p-6 text-slate-300">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0066ff]/10 border border-[#0066ff]/20 flex items-center justify-center text-[#0066ff] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm">Door-to-Door Courier</h5>
              <p className="text-xs text-slate-400 mt-0.5">
                Reliable tracking with The Courier Guy & Pargo across SA.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm">Interactive Live Demos</h5>
              <p className="text-xs text-slate-400 mt-0.5">
                Ask questions in real-time before buying. Real maker engagement.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm">Simulated Payments</h5>
              <p className="text-xs text-slate-400 mt-0.5">
                Safe sandbox demo: test instant EFT, Capitec Pay & Card preview.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
