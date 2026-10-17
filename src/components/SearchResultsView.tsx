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
import { Product, Seller, LiveSession } from '../types';

interface SearchResultsViewProps {
  query: string;
  onClearQuery: () => void;
  onSetQuery?: (q: string) => void;
  products: Product[];
  sellers: Seller[];
  liveSessions: LiveSession[];
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
  onSelectProduct,
  onSelectSeller,
  onOpenLiveRoom,
  onAddToCart
}) => {
  const [filterType, setFilterType] = useState<'all' | 'products' | 'makers' | 'streams'>('all');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const cleanQuery = query.trim().toLowerCase();

  const matchingProducts = cleanQuery
    ? products.filter(p =>
        p.name.toLowerCase().includes(cleanQuery) ||
        p.sellerName.toLowerCase().includes(cleanQuery) ||
        p.categoryLabel.toLowerCase().includes(cleanQuery) ||
        p.description.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingSellers = cleanQuery
    ? sellers.filter(s =>
        s.name.toLowerCase().includes(cleanQuery) ||
        s.tagline.toLowerCase().includes(cleanQuery) ||
        s.city.toLowerCase().includes(cleanQuery) ||
        s.province.toLowerCase().includes(cleanQuery) ||
        s.bio.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingStreams = cleanQuery
    ? liveSessions.filter(s =>
        s.title.toLowerCase().includes(cleanQuery) ||
        s.sellerName.toLowerCase().includes(cleanQuery) ||
        s.streamCategory.toLowerCase().includes(cleanQuery) ||
        s.sellerLocation.toLowerCase().includes(cleanQuery)
      )
    : [];

  const totalMatches = matchingProducts.length + matchingSellers.length + matchingStreams.length;

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const popularSearches = ['Marula', 'Leather', 'Sneakers', 'Ceramics', 'Cape Town', 'Johannesburg'];

  return (
    <div className="pb-16 pt-4 px-3 sm:px-6 max-w-7xl mx-auto space-y-8 w-full min-w-0 max-w-full">
      
      {/* Search Header Banner */}
      <div className="bg-[#14171f] border border-[#212633] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#0066ff] shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              Search results for <span className="text-[#0066ff]">"{query}"</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Found {totalMatches} {totalMatches === 1 ? 'match' : 'matches'} across products, makers, and live streams
          </p>
        </div>

        <button
          onClick={onClearQuery}
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#1c2230] hover:bg-[#252d40] text-slate-300 hover:text-white border border-[#2e374c] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Search</span>
        </button>
      </div>

      {/* Filter Chips Bar (When results exist) */}
      {totalMatches > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
          <button
            onClick={() => setFilterType('all')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              filterType === 'all'
                ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
                : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
            }`}
          >
            All Results ({totalMatches})
          </button>

          {matchingProducts.length > 0 && (
            <button
              onClick={() => setFilterType('products')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                filterType === 'products'
                  ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
                  : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
              }`}
            >
              Products ({matchingProducts.length})
            </button>
          )}

          {matchingSellers.length > 0 && (
            <button
              onClick={() => setFilterType('makers')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                filterType === 'makers'
                  ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
                  : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
              }`}
            >
              Makers ({matchingSellers.length})
            </button>
          )}

          {matchingStreams.length > 0 && (
            <button
              onClick={() => setFilterType('streams')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                filterType === 'streams'
                  ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
                  : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
              }`}
            >
              Live Streams ({matchingStreams.length})
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {totalMatches === 0 && (
        <div className="py-16 px-4 bg-[#14171f] rounded-2xl border border-[#212633] text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#0066ff]/10 border border-[#0066ff]/20 flex items-center justify-center text-[#0066ff] mx-auto">
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
                  className="px-3 py-1.5 rounded-lg bg-[#0c0e12] border border-[#212633] text-xs text-slate-300 hover:text-white hover:border-[#0066ff] transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClearQuery}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold transition-all shadow-md shadow-[#0066ff]/25 cursor-pointer"
            >
              Back to All Feeds
            </button>
          </div>
        </div>
      )}

      {/* 1. Live Streams Section */}
      {(filterType === 'all' || filterType === 'streams') && matchingStreams.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#212633] pb-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Live Streams ({matchingStreams.length})
            </h2>
          </div>

          {/* Single column on mobile: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0 max-w-full">
            {matchingStreams.map((session) => {
              const featured = products.find(p => p.id === session.featuredProductId);

              return (
                <div
                  key={session.id}
                  onClick={() => onOpenLiveRoom(session.id)}
                  className="bg-[#14171f] rounded-2xl border border-[#212633] overflow-hidden hover:border-[#0066ff]/60 transition-all cursor-pointer group flex flex-col justify-between shadow-xl w-full min-w-0 max-w-full"
                >
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full min-w-0 max-w-full bg-black overflow-hidden">
                    <img
                      src={session.coverImage}
                      alt={session.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Live
                      </span>
                      <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded font-mono flex items-center gap-1 border border-white/10">
                        <Users className="w-3 h-3 text-blue-400" />
                        {session.viewerCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#0066ff] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white translate-x-0.5" />
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
                          <MapPin className="w-2.5 h-2.5 text-red-400 shrink-0" />
                          <span className="truncate">{session.sellerLocation}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 min-w-0 w-full max-w-full">
                    <div className="space-y-1.5 min-w-0">
                      <span className="text-[11px] text-[#0066ff] font-semibold uppercase tracking-wider block">
                        {session.streamCategory}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-[#0066ff] transition-colors leading-snug break-words">
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
                        className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-md shadow-[#0066ff]/20 active:scale-95 cursor-pointer"
                      >
                        <span>Enter Stream</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. Makers Section */}
      {(filterType === 'all' || filterType === 'makers') && matchingSellers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#212633] pb-2">
            <Store className="w-4 h-4 text-[#0066ff]" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              South African Makers ({matchingSellers.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0 max-w-full">
            {matchingSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => onSelectSeller(seller.id)}
                className="bg-[#14171f] rounded-2xl border border-[#212633] p-4 sm:p-5 hover:border-[#0066ff]/60 transition-all cursor-pointer group flex flex-col justify-between shadow-lg w-full min-w-0 max-w-full"
              >
                <div className="space-y-3 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#212633] group-hover:border-[#0066ff] transition-colors shrink-0"
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
                      <h3 className="font-bold text-white text-base group-hover:text-[#0066ff] transition-colors truncate">
                        {seller.name}
                      </h3>
                      {seller.verifiedArtisan && (
                        <CheckCircle2 className="w-4 h-4 text-[#0066ff] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
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
                  <span className="text-[#0066ff] font-bold text-xs flex items-center gap-1">
                    Visit Atelier <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Products Section */}
      {(filterType === 'all' || filterType === 'products') && matchingProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#212633] pb-2">
            <ShoppingBag className="w-4 h-4 text-[#0066ff]" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Products ({matchingProducts.length})
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
                  className="group bg-[#14171f] rounded-2xl border border-[#212633] overflow-hidden hover:border-[#0066ff]/60 transition-all cursor-pointer flex flex-col justify-between shadow-lg relative min-w-0 w-full max-w-full"
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
                      <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-[#0066ff] transition-colors leading-snug break-words">
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
                              : 'bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-md shadow-[#0066ff]/20 active:scale-95'
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
      )}

    </div>
  );
};
