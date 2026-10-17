import React from 'react';
import { LiveSession, Product } from '../types';
import { Radio, Users, Play, MapPin, Sparkles, ArrowRight } from 'lucide-react';

interface LiveStreamsListViewProps {
  liveSessions: LiveSession[];
  products: Product[];
  onOpenLiveRoom: (sessionId: string) => void;
}

export const LiveStreamsListView: React.FC<LiveStreamsListViewProps> = ({
  liveSessions,
  products,
  onOpenLiveRoom
}) => {
  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Live Shopping Broadcasts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time interactive shopping streams broadcasting across South Africa
          </p>
        </div>

        <div className="bg-[#14171f] border border-[#212633] px-3.5 py-1.5 rounded-xl text-xs text-slate-300 font-mono">
          Demonstration Mode · Live Q&A Active
        </div>
      </div>

      {/* Broadcasts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveSessions.map((session) => {
          const featured = products.find(p => p.id === session.featuredProductId);

          return (
            <div
              key={session.id}
              onClick={() => onOpenLiveRoom(session.id)}
              className="bg-[#14171f] rounded-2xl border border-[#212633] overflow-hidden hover:border-[#0066ff]/60 transition-all cursor-pointer group flex flex-col justify-between shadow-xl"
            >
              <div className="relative aspect-[16/10] bg-black overflow-hidden">
                <img
                  src={session.coverImage}
                  alt={session.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                    Live
                  </span>
                  <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded font-mono flex items-center gap-1 border border-white/10">
                    <Users className="w-3 h-3 text-blue-400" />
                    {session.viewerCount.toLocaleString()}
                  </span>
                </div>

                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-slate-300 text-[10px] px-2 py-0.5 rounded border border-white/10 font-mono">
                  Demo
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#0066ff] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                  <img
                    src={session.sellerAvatar}
                    alt={session.sellerName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-white/60 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {session.sellerName}
                    </p>
                    <p className="text-[10px] text-slate-300 flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5 text-red-400" />
                      {session.sellerLocation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-[#0066ff] font-semibold">
                    {session.streamCategory}
                  </span>
                  <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-[#0066ff] transition-colors">
                    {session.title}
                  </h3>
                </div>

                {featured && (
                  <div className="p-2.5 rounded-xl bg-[#0c0e12] border border-[#212633] flex items-center justify-between">
                    <div className="min-w-0 pr-2">
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

                <div className="pt-2 border-t border-[#212633] flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Tap to join interactive room</span>
                  <span className="text-[#0066ff] font-bold flex items-center gap-1">
                    Enter Stream <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
