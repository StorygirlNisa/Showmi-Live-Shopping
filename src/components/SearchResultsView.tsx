import React, { useState } from 'react';
import { 
  Search, 
  X, 
  ShoppingBag, 
  Radio, 
  Store, 
  Users, 
  Play, 
  MapPin, 
  ArrowRight, 
  Check, 
  Star,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Product, Seller, LiveSession, StreamSnippet } from '../types';

interface SearchResultsViewProps {
  query: string;
  onClearQuery: () => void;
  onSetQuery?: (q: string) => void;
  products: Product[];
  sellers: Seller[];
  liveSessions: LiveSession[];
  snippets?: StreamSnippet[];
  onSelectProduct: (productId: string) => void;
  onSelectSeller: (sellerId: string) => void;
  onOpenLiveRoom: (sessionId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  query,
  onClearQuery,
  onSetQuery,
  products,
  sellers,
  liveSessions,
  snippets = [],
  onSelectProduct,
  onSelectSeller,
  onOpenLiveRoom,
  onAddToCart
}) => {
  const [filterType, setFilterType] = useState<'all' | 'live' | 'products' | 'showrooms'>('all');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const cleanQuery = query.trim().toLowerCase();
  const queryTerms = cleanQuery.split(/\s+/).filter(t => t.length > 1);

  const matchesText = (text: string | undefined | null) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    if (lower.includes(cleanQuery)) return true;
    return queryTerms.some(term => lower.includes(term));
  };

  const matchingProducts = cleanQuery
    ? products.filter(p =>
        matchesText(p.name) ||
        matchesText(p.description) ||
        matchesText(p.categoryLabel) ||
        matchesText(p.category) ||
        matchesText(p.sellerName) ||
        (p.features && p.features.some(f => matchesText(f)))
      )
    : [];

  const matchingSellers = cleanQuery
    ? sellers.filter(s => {
        const sellerProducts = products.filter(p => p.sellerId === s.id);
        const hasMatchingProduct = sellerProducts.some(p =>
          matchesText(p.name) || matchesText(p.description) || matchesText(p.categoryLabel)
        );

        return (
          matchesText(s.name) ||
          matchesText(s.tagline) ||
          matchesText(s.bio) ||
          matchesText(s.city) ||
          matchesText(s.province) ||
          hasMatchingProduct
        );
      })
    : [];

  const matchingStreams = cleanQuery
    ? liveSessions.filter(s => {
        const seller = sellers.find(sel => sel.id === s.sellerId);
        const sellerMatches = seller && matchingSellers.some(ms => ms.id === seller.id);
        const featuredProd = products.find(p => p.id === s.featuredProductId);
        const prodMatches = featuredProd && matchingProducts.some(mp => mp.id === featuredProd.id);

        return (
          matchesText(s.title) ||
          matchesText(s.sellerName) ||
          matchesText(s.streamCategory) ||
          matchesText(s.sellerLocation) ||
          sellerMatches ||
          prodMatches
        );
      })
    : [];

  const allSnippets = snippets.length > 0 ? snippets : sellers.flatMap(s => s.snippets || []);
  const matchingSnippets = cleanQuery
    ? allSnippets.filter(snip => {
        if (snip.isArchived) return false;
        const seller = sellers.find(s => s.id === snip.sellerId);
        const sellerMatches = seller && matchingSellers.some(ms => ms.id === seller.id);
        const product = products.find(p => p.id === snip.productId);
        const productMatches = product && matchingProducts.some(mp => mp.id === product.id);

        return (
          matchesText(snip.title) ||
          matchesText(snip.highlightTag) ||
          matchesText(snip.caption) ||
          matchesText(snip.tags) ||
          sellerMatches ||
          productMatches
        );
      })
    : [];

  const liveCount = matchingStreams.length + matchingSnippets.length;
  const productsCount = matchingProducts.length;
  const showroomsCount = matchingSellers.length;
  const allCount = liveCount + productsCount + showroomsCount;

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const popularSearches = ['Marula', 'Leather', 'Sneakers', 'Ceramics', 'Cape Town', 'Johannesburg'];

  return (
    <div className="pb-16 pt-3 px-3 sm:px-6 max-w-7xl mx-auto space-y-4 w-full min-w-0 max-w-full">
      
      {/* Compact Search Header */}
      <div className="bg-[#14171f] border border-[#212633] px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <Search className="w-4 h-4 text-[#19BFFF] shrink-0" />
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
            "{query}" <span className="text-xs font-normal text-slate-400">({allCount} matches)</span>
          </h1>
        </div>

        <button
          onClick={onClearQuery}
          className="text-xs text-slate-400 hover:text-white underline font-semibold transition-colors cursor-pointer shrink-0"
          title="Clear search"
        >
          Clear Search
        </button>
      </div>

      {/* Result Tabs (Exact Order: All Results, LIVE, Products, Showrooms) */}
      <div className="w-full overflow-x-hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none touch-pan-x px-0.5 max-w-full">
          <button
            onClick={() => setFilterType('all')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              filterType === 'all'
                ? 'bg-[#19BFFF] text-[#0D1018] font-bold shadow-md shadow-[#19BFFF]/20'
                : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
            }`}
          >
            All Results ({allCount})
          </button>

          <button
            onClick={() => setFilterType('live')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              filterType === 'live'
                ? 'bg-[#19BFFF] text-[#0D1018] font-bold shadow-md shadow-[#19BFFF]/20'
                : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
            }`}
          >
            LIVE ({liveCount})
          </button>

          <button
            onClick={() => setFilterType('products')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              filterType === 'products'
                ? 'bg-[#19BFFF] text-[#0D1018] font-bold shadow-md shadow-[#19BFFF]/20'
                : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
            }`}
          >
            Products ({productsCount})
          </button>

          <button
            onClick={() => setFilterType('showrooms')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              filterType === 'showrooms'
                ? 'bg-[#19BFFF] text-[#0D1018] font-bold shadow-md shadow-[#19BFFF]/20'
                : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
            }`}
          >
            Showrooms ({showroomsCount})
          </button>
        </div>
      </div>

      {/* Empty State for Entire Search */}
      {allCount === 0 && (
        <div className="py-16 px-4 bg-[#14171f] rounded-2xl border border-[#212633] text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#19BFFF]/10 border border-[#19BFFF]/20 flex items-center justify-center text-[#19BFFF] mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-white">
              No results found for "{query}"
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              We couldn't find any products, South African makers, or live streams matching your search.
            </p>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Searches
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => onSetQuery && onSetQuery(term)}
                  className="px-3 py-1.5 rounded-lg bg-[#0c0e12] border border-[#212633] text-xs text-slate-300 hover:text-white hover:border-[#19BFFF] transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClearQuery}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] text-xs font-bold transition-all shadow-md shadow-[#19BFFF]/25 cursor-pointer"
            >
              Back to All Feeds
            </button>
          </div>
        </div>
      )}

      {/* 1. LIVE / Video Content Section (Active LIVE streams first, then prerecorded snippets labeled as Snippet) */}
      {(filterType === 'all' || filterType === 'live') && (
        liveCount > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#212633] pb-2">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                LIVE Streams & Video Snippets ({liveCount})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0 max-w-full">
              {/* Active LIVE streams first */}
              {matchingStreams.map((session) => {
                const featured = products.find(p => p.id === session.featuredProductId);

                return (
                  <div
                    key={session.id}
                    onClick={() => onOpenLiveRoom(session.id)}
                    className="bg-[#14171f] rounded-2xl border border-[#212633] overflow-hidden hover:border-[#19BFFF]/60 transition-all cursor-pointer group flex flex-col justify-between shadow-xl w-full min-w-0 max-w-full"
                  >
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black overflow-hidden">
                      {session.videoUrl ? (
                        <video
                          src={session.videoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                      ) : (
                        <img
                          src={session.coverImage}
                          alt={session.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          LIVE
                        </span>
                        <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded font-mono flex items-center gap-1 border border-white/10">
                          <Users className="w-3 h-3 text-[#19BFFF]" />
                          {session.viewerCount.toLocaleString()}
                        </span>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#19BFFF] text-[#0D1018] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-[#0D1018] translate-x-0.5" />
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 min-w-0">
                        <img
                          src={session.sellerAvatar}
                          alt={session.sellerName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full border border-white/60 object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate leading-tight">
                            {session.sellerName}
                          </p>
                          <p className="text-[10px] text-slate-300 flex items-center gap-1 truncate">
                            <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                            <span className="truncate">{session.sellerLocation}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 min-w-0 w-full max-w-full">
                      <div className="space-y-1.5 min-w-0">
                        <span className="text-[11px] text-[#19BFFF] font-semibold uppercase tracking-wider block">
                          {session.streamCategory}
                        </span>
                        <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-[#19BFFF] transition-colors leading-snug break-words">
                          {session.title}
                        </h3>
                      </div>

                      {featured && (
                        <div className="p-2.5 rounded-xl bg-[#0c0e12] border border-[#212633] flex items-center justify-between gap-3 min-w-0 w-full">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                              Featured Product
                            </span>
                            <p className="text-xs font-semibold text-white truncate">
                              {featured.name}
                            </p>
                          </div>
                          <span className="text-xs font-bold font-mono text-white shrink-0">
                            R {featured.priceZAR.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#212633] flex items-center justify-between text-xs gap-2 min-h-[44px]">
                        <span className="text-slate-400 text-[11px]">Join interactive room</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLiveRoom(session.id);
                          }}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-md shadow-[#19BFFF]/20 active:scale-95 cursor-pointer"
                        >
                          <span>Enter Stream</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Prerecorded video snippets (after active streams, clearly labeled as Snippet) */}
              {matchingSnippets.map((snippet) => (
                <div
                  key={`snippet-${snippet.id}`}
                  onClick={() => onSelectProduct(snippet.productId)}
                  className="bg-[#14171f] rounded-2xl border border-[#212633] overflow-hidden hover:border-[#19BFFF]/60 transition-all cursor-pointer group flex flex-col justify-between shadow-xl w-full min-w-0 max-w-full"
                >
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black overflow-hidden">
                    <img
                      src={snippet.thumbnail}
                      alt={snippet.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-slate-700 text-slate-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1 border border-white/10">
                        Snippet
                      </span>
                      <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-mono">
                        {snippet.duration}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#19BFFF] text-[#0D1018] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-[#0D1018] translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 min-w-0 w-full max-w-full">
                    <div className="space-y-1.5 min-w-0">
                      <span className="text-[11px] text-[#19BFFF] font-semibold uppercase tracking-wider block">
                        {snippet.highlightTag || 'Prerecorded Highlight'}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-[#19BFFF] transition-colors leading-snug break-words">
                        {snippet.title}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-[#212633] flex items-center justify-between text-xs gap-2 min-h-[44px]">
                      <span className="text-slate-400 text-[11px]">Prerecorded clip</span>
                      <span className="text-[#19BFFF] font-bold text-xs flex items-center gap-1">
                        View Product <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : filterType === 'live' ? (
          <div className="py-12 px-4 bg-[#14171f] rounded-2xl border border-[#212633] text-center space-y-3 max-w-md mx-auto">
            <p className="text-xs text-slate-400">No LIVE streams or snippets match "{query}".</p>
          </div>
        ) : null
      )}

      {/* 2. Products Section */}
      {(filterType === 'all' || filterType === 'products') && (
        productsCount > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#212633] pb-2">
              <ShoppingBag className="w-4 h-4 text-[#19BFFF]" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Products ({productsCount})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0 max-w-full">
              {matchingProducts.map((product) => {
                const isAdded = addedProductId === product.id;
                const isSoldOut = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product.id)}
                    className="group bg-[#14171f] rounded-2xl border border-[#212633] overflow-hidden hover:border-[#19BFFF]/60 transition-all cursor-pointer flex flex-col justify-between shadow-lg relative min-w-0 w-full max-w-full"
                  >
                    <div className="relative aspect-[4/3] bg-black overflow-hidden w-full">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                      <div className="absolute top-2.5 left-2.5">
                        {isSoldOut ? (
                          <span className="bg-red-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            Sold Out
                          </span>
                        ) : (
                          <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            In Stock ({product.stock})
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-slate-300 text-[10px] px-2 py-0.5 rounded border border-white/10 font-medium">
                        {product.categoryLabel}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 min-w-0">
                      <div className="space-y-1 min-w-0">
                        <p className="text-[11px] text-slate-400 truncate">
                          By {product.sellerName}
                        </p>
                        <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-[#19BFFF] transition-colors leading-snug break-words">
                          {product.name}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-[#212633] flex items-center justify-between gap-2">
                        <span className="text-base font-bold font-mono text-white">
                          R {product.priceZAR.toLocaleString()}
                        </span>

                        <button
                          onClick={(e) => handleQuickAdd(product, e)}
                          disabled={isSoldOut}
                          className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                            isSoldOut
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                              : isAdded
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] shadow-md shadow-[#19BFFF]/20 active:scale-95'
                          }`}
                          title={isSoldOut ? 'Sold out' : 'Add to basket'}
                        >
                          {isSoldOut ? (
                            <span className="text-[10px]">Out</span>
                          ) : isAdded ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : filterType === 'products' ? (
          <div className="py-12 px-4 bg-[#14171f] rounded-2xl border border-[#212633] text-center space-y-3 max-w-md mx-auto">
            <p className="text-xs text-slate-400">No products match "{query}".</p>
          </div>
        ) : null
      )}

      {/* 3. Showrooms Section */}
      {(filterType === 'all' || filterType === 'showrooms') && (
        showroomsCount > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#212633] pb-2">
              <Store className="w-4 h-4 text-[#19BFFF]" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                South African Showrooms ({showroomsCount})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0 max-w-full">
              {matchingSellers.map((seller) => (
                <div
                  key={seller.id}
                  onClick={() => onSelectSeller(seller.id)}
                  className="bg-[#14171f] rounded-2xl border border-[#212633] p-4 sm:p-5 hover:border-[#19BFFF]/60 transition-all cursor-pointer group flex flex-col justify-between shadow-lg w-full min-w-0 max-w-full"
                >
                  <div className="space-y-3 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#212633] group-hover:border-[#19BFFF] transition-colors shrink-0"
                      />
                      <div className="text-right shrink-0">
                        <span className="text-xs text-amber-400 font-bold flex items-center gap-1 justify-end">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {seller.rating}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {seller.salesCount}+ orders
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-white text-base group-hover:text-[#19BFFF] transition-colors truncate">
                          {seller.name}
                        </h3>
                        {seller.verifiedArtisan && (
                          <CheckCircle2 className="w-4 h-4 text-[#19BFFF] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">{seller.city}, {seller.province}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {seller.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#212633] flex items-center justify-between text-xs text-slate-400 min-h-[44px]">
                    <span className="text-[11px] font-mono text-slate-400">
                      {products.filter(p => p.sellerId === seller.id).length} Products
                    </span>
                    <span className="text-[#19BFFF] font-bold text-xs flex items-center gap-1">
                      Visit Atelier <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : filterType === 'showrooms' ? (
          <div className="py-12 px-4 bg-[#14171f] rounded-2xl border border-[#212633] text-center space-y-3 max-w-md mx-auto">
            <p className="text-xs text-slate-400">No showrooms match "{query}".</p>
          </div>
        ) : null
      )}

    </div>
  );
};
