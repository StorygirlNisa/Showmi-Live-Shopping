import React from 'react';
import { X, CheckCircle, Info, Zap, Shield, Smartphone, Globe, AlertTriangle } from 'lucide-react';

interface SetupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemoData?: () => void;
}

export const SetupInfoModal: React.FC<SetupInfoModalProps> = ({ isOpen, onClose, onResetDemoData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14171f] border border-[#212633] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        <div className="flex items-center justify-between pb-4 border-b border-[#212633]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0066ff] flex items-center justify-center font-bold text-white text-sm">
              S
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Showmi Architecture & Free Setup Guide
              </h2>
              <p className="text-xs text-slate-400">Plain English overview for non-technical founders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2330] hover:bg-[#283042] text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Working Status */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Fully Working Free Prototype — Zero Setup or Coding Needed</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Everything you see in this app (browsing products, watching simulated live video streams, typing in live chat, reacting with floating hearts, navigating seller storefronts, adding to basket, and testing simulated checkout) runs <strong>100% free with no paid services, no API keys, and no backend servers required</strong>.
          </p>
        </div>

        {/* The 5 Implemented Core Screens */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">The 5 Core Screens Implemented:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#212633]">
              <strong className="text-white block mb-1">1. Discover Page</strong>
              <span className="text-slate-400">Hero live broadcast, categories, local South African makers, and featured items in ZAR.</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#212633]">
              <strong className="text-white block mb-1">2. Product Detail Page</strong>
              <span className="text-slate-400">High-res photography, Rand pricing, stock counters, dispatch times, and nationwide courier estimates.</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#212633]">
              <strong className="text-white block mb-1">3. Seller Storefront</strong>
              <span className="text-slate-400">Maker biography, location in SA, catalog, and recorded previous livestream video snippets.</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#212633]">
              <strong className="text-white block mb-1">4. Live Shopping Room</strong>
              <span className="text-slate-400">Simulated video stream, live chat with reply simulation, floating reaction hearts, and 1-tap in-stream checkout.</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#212633]">
              <strong className="text-white block mb-1">5. Basket & Checkout Preview</strong>
              <span className="text-slate-400">Provincial address form (Gauteng, Western Cape, KZN, etc.), delivery selection, and simulated Ozow/Capitec Pay confirmation.</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#0066ff]/40">
              <strong className="text-white block mb-1">6. Seller Studio (AI Selling Assistant)</strong>
              <span className="text-slate-400">Generates livestream talking points, opening hooks, demonstration tips, enhanced product descriptions, and snippet captions using Google Gemini.</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0e12] border border-emerald-500/40">
              <strong className="text-white block mb-1">7. AI Sales Coach (Private Seller Host Mode)</strong>
              <span className="text-slate-400">Private on-camera prompts for hosts (welcome, demo, live chat questions, verified promotions, real-time stock alerts, and buy CTA). Controls to advance, dismiss, pause/resume, and reopen prompts.</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0e12] border border-purple-500/40">
              <strong className="text-white block mb-1">8. Temporary Shoppable Snippets</strong>
              <span className="text-slate-400">Short recorded clips linked to products with Buy Now, 24h/48h/7d expiry, automatic storefront removal upon expiration, and private seller archive retention.</span>
            </div>
          </div>
        </div>

        {/* Free vs Paid Services Future Roadmap (Plain English) */}
        <div className="space-y-3 pt-2 border-t border-[#212633]">
          <h3 className="text-sm font-bold text-white">When You Are Ready to Launch for Real:</h3>
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-[#0066ff] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Real Live Video Broadcasting:</strong>
                <p className="text-slate-400 mt-0.5">
                  Currently uses simulated video previews. For real-time camera broadcasting from creators' phones, platforms typically connect to free tiers of services like <em>Livepeer</em>, <em>Cloudflare Stream</em>, or <em>Mux</em>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Real South African Payments:</strong>
                <p className="text-slate-400 mt-0.5">
                  Currently uses safe simulated payments. In South Africa, you can sign up for free merchant accounts with <strong>PayFast</strong>, <strong>Yoco</strong>, or <strong>Ozow</strong> (they charge a small ~2.5% transaction fee only when an actual sale occurs—no upfront monthly subscription).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Courier Integration:</strong>
                <p className="text-slate-400 mt-0.5">
                  <strong>The Courier Guy</strong> (via ShipLogic / Courier Guy API) and <strong>Pargo</strong> provide free developer access to generate real waybills and automated tracking links.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          {onResetDemoData && (
            <button
              onClick={() => {
                onResetDemoData();
                onClose();
              }}
              className="px-4 py-3 rounded-xl bg-[#1e2330] hover:bg-[#283244] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset Demo Data
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Got It, Start Exploring Showmi
          </button>
        </div>

      </div>
    </div>
  );
};
