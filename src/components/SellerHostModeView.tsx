import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Pause,
  Play,
  SkipForward,
  X,
  RotateCcw,
  AlertTriangle,
  Tag,
  Package,
  Clock,
  ShieldCheck,
  Send,
  Users,
  Heart,
  Volume2,
  VolumeX,
  CheckCircle2,
  Radio,
  ExternalLink,
  ChevronRight,
  Info,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { LiveSession, Product, Seller, LivePromotion, SalesCoachPrompt, LiveComment } from '../types';
import { buildSalesCoachQueue, getActivePromotionForProduct } from '../services/salesCoachQueue';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc 
} from 'firebase/firestore';

interface SellerHostModeViewProps {
  session: LiveSession;
  seller: Seller;
  products: Product[];
  promotions: LivePromotion[];
  onExitHostMode: () => void;
  onViewShopperLiveRoom: () => void;
  onSimulateOrderStockDecrement?: (productId: string) => void;
  onExpirePromotionNow?: (promoId: string) => void;
  onSwitchSession?: (sessionId: string) => void;
  comments?: LiveComment[];
  onAddComment?: (comment: LiveComment) => void;
  onDeleteComment?: (commentId: string) => void;
  moderatorSellerIds?: string[];
  onAppointModerator?: (sellerId: string) => void;
  onRevokeModerator?: (sellerId: string) => void;
  allSellers?: Seller[];
}

export const SellerHostModeView: React.FC<SellerHostModeViewProps> = ({
  session,
  seller,
  products,
  promotions,
  onExitHostMode,
  onViewShopperLiveRoom,
  onSimulateOrderStockDecrement,
  onExpirePromotionNow,
  onSwitchSession,
  comments,
  onAddComment,
  onDeleteComment,
  moderatorSellerIds = [],
  onAppointModerator,
  onRevokeModerator,
  allSellers = []
}) => {
  // Real-time metadata and comments from Firestore
  const [sessionMetadata, setSessionMetadata] = useState<LiveSession>(session);
  const [firestoreComments, setFirestoreComments] = useState<LiveComment[]>([]);
  const activeComments = comments || firestoreComments;

  // 1. Sync Session Metadata (Pinned Product, Moderator UIDs, etc.)
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'live_sessions', session.id), (snapshot) => {
      if (snapshot.exists()) {
        setSessionMetadata(snapshot.data() as LiveSession);
      }
    });
    return () => unsubscribe();
  }, [session.id]);

  // 2. Sync Comments
  useEffect(() => {
    const q = query(
      collection(db, 'live_sessions', session.id, 'comments'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: LiveComment[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          ...data,
          id: doc.id,
          timestamp: data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
        } as LiveComment);
      });
      setFirestoreComments(list);
    });
    return () => unsubscribe();
  }, [session.id]);

  // Available products for this host session
  const sessionProducts = useMemo(() => {
    const list: Product[] = [];
    const featured = products.find(p => p.id === sessionMetadata.featuredProductId);
    if (featured) list.push(featured);

    (sessionMetadata.additionalProductIds || []).forEach(id => {
      const extra = products.find(p => p.id === id);
      if (extra && !list.some(p => p.id === extra.id)) {
        list.push(extra);
      }
    });

    // Also include any other products by this seller if list is small
    products
      .filter(p => p.sellerId === seller.id && !list.some(item => item.id === p.id))
      .forEach(p => list.push(p));

    return list;
  }, [products, sessionMetadata, seller]);

  // Currently showcased product by host
  const [selectedProductId, setSelectedProductId] = useState<string>(
    sessionMetadata.featuredProductId || sessionProducts[0]?.id || ''
  );

  useEffect(() => {
    if (sessionMetadata.featuredProductId) {
      setSelectedProductId(sessionMetadata.featuredProductId);
    }
  }, [sessionMetadata.featuredProductId]);

  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || sessionProducts[0];
  }, [products, selectedProductId, sessionProducts]);

  // Active verified promotion for active product
  const activePromo = useMemo(() => {
    if (!activeProduct) return null;
    return getActivePromotionForProduct(activeProduct.id, promotions);
  }, [activeProduct, promotions]);

  // Prompt Queue State
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [dismissedPromptIds, setDismissedPromptIds] = useState<string[]>([]);
  const [showQueueDetails, setShowQueueDetails] = useState(false);

  // AI On-Demand Coaching tip state
  const [isRequestingAiTip, setIsRequestingAiTip] = useState(false);
  const [aiCoachTip, setAiCoachTip] = useState<string | null>(null);

  // Host camera & audio simulation
  const [isMuted, setIsMuted] = useState(true);
  const [viewerCount, setViewerCount] = useState(session.viewerCount);
  const [localComments, setLocalComments] = useState<LiveComment[]>(session.initialComments || []);
  const [hostReplyText, setHostReplyText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [isModeratorModalOpen, setIsModeratorModalOpen] = useState(false);

  // Re-build prompt queue whenever active product, stock, or promotions change
  const rawPrompts = useMemo(() => {
    if (!activeProduct) return [];
    return buildSalesCoachQueue(activeProduct, seller, promotions);
  }, [activeProduct, seller, promotions]);

  // Filter out dismissed prompts for active display
  const activeQueue = useMemo(() => {
    return rawPrompts.filter(p => !dismissedPromptIds.includes(p.id));
  }, [rawPrompts, dismissedPromptIds]);

  // Safe active prompt
  const currentPrompt: SalesCoachPrompt | undefined = activeQueue[currentPromptIndex] || activeQueue[0];

  // Dismissed prompts list for restore
  const dismissedPrompts = useMemo(() => {
    return rawPrompts.filter(p => dismissedPromptIds.includes(p.id));
  }, [rawPrompts, dismissedPromptIds]);

  // Reset prompt index when product changes
  useEffect(() => {
    setCurrentPromptIndex(0);
  }, [selectedProductId]);

  // Automated viewer chat simulation for host practice
  useEffect(() => {
    const automatedComments = [
      { userName: 'Zandi K.', text: 'Does it feel lightweight in the hand?' },
      { userName: 'Lungile M.', text: 'Love this color! How soon can you dispatch?' },
      { userName: 'Kobus V.', text: 'Is nationwide courier door-to-door?' }
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < automatedComments.length) {
        const item = automatedComments[idx];
        const newMsg: LiveComment = {
          id: `host-chat-${session.id}-${idx}-${Date.now()}`,
          userName: item.userName,
          text: item.text,
          timestamp: 'Just now'
        };
        if (onAddComment) {
          onAddComment(newMsg);
        } else {
          setLocalComments(prev => [...prev, newMsg]);
        }
        idx = (idx + 1) % automatedComments.length;
        setViewerCount(v => v + Math.floor(Math.random() * 5) - 2);
      }
    }, 14000);

    return () => clearInterval(interval);
  }, [session.id, onAddComment]);

  // Controls
  const handleNextPrompt = () => {
    if (activeQueue.length <= 1) return;
    setCurrentPromptIndex(prev => (prev + 1) % activeQueue.length);
  };

  const handleDismissPrompt = (promptId: string) => {
    setDismissedPromptIds(prev => [...prev, promptId]);
    if (currentPromptIndex >= activeQueue.length - 1) {
      setCurrentPromptIndex(0);
    }
  };

  const handleReopenDismissed = () => {
    setDismissedPromptIds([]);
    setCurrentPromptIndex(0);
  };

  const handleRestoreSinglePrompt = (promptId: string) => {
    setDismissedPromptIds(prev => prev.filter(id => id !== promptId));
  };

  const handleTogglePause = () => {
    setIsQueuePaused(prev => !prev);
  };

  // Host sends comment reply
  const handleHostSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostReplyText.trim()) return;

    const newComment: LiveComment = {
      id: `host-msg-${session.id}-${Date.now()}`,
      userName: `${seller.name} (Host)`,
      text: hostReplyText.trim(),
      timestamp: 'Just now',
      isHost: true,
      senderSellerId: seller.id
    };

    if (onAddComment) {
      onAddComment(newComment);
    } else {
      setLocalComments(prev => [...prev, newComment]);
    }
    setHostReplyText('');
  };

  const handleConfirmDelete = (commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(commentId);
    } else {
      setLocalComments(prev => prev.filter(item => item.id !== commentId));
    }
    setDeletingCommentId(null);
  };

  // AI Coach On-Demand guidance request
  const handleAskAiCoach = async (contextQuestion: string) => {
    if (!activeProduct) return;
    setIsRequestingAiTip(true);
    try {
      const response = await fetch('/api/seller-ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'sales_coach_tip',
          product: activeProduct,
          seller,
          customContext: contextQuestion
        })
      });

      const data = await response.json();
      if (data.success && data.text) {
        setAiCoachTip(data.text);
      } else {
        throw new Error(data.error || 'No AI tip returned');
      }
    } catch (e) {
      // Grounded fallback
      setAiCoachTip(
        `• Keep the ${activeProduct.name} at chest level and maintain friendly eye contact with the lens.\n• Remind viewers of your verified R ${activeProduct.priceZAR.toLocaleString()} price and direct dispatch from ${seller.city}.`
      );
    } finally {
      setIsRequestingAiTip(false);
    }
  };

  // Product Pinning (Firestore)
  const handlePinProduct = async (productId: string) => {
    setSelectedProductId(productId);
    try {
      await updateDoc(doc(db, 'live_sessions', session.id), {
        featuredProductId: productId
      });
    } catch (error) {
      console.error("Failed to pin product:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0c10] text-slate-100 flex flex-col justify-between relative pb-12">
      
      {/* 1. Host Mode Security & Privacy Top Bar */}
      <div className="sticky top-0 z-40 bg-[#121620] border-b border-[#212633] px-3 sm:px-6 py-2.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Privacy Indicator Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={onExitHostMode}
              className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit Studio
            </button>

            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Private Seller Host Mode</span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-200 uppercase font-mono">
                Host Only
              </span>
            </div>
          </div>

          {/* Demonstration Notice */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 bg-black/40 px-3 py-1 rounded-md border border-white/5">
            <Info className="w-3.5 h-3.5 text-[#0066ff]" />
            <span>Demonstration broadcast — Camera feed and viewers are simulated.</span>
          </div>

          {/* Privacy Verification Toggle: Shopper View */}
          <div className="flex items-center gap-2">
            <button
              onClick={onViewShopperLiveRoom}
              className="px-3 py-1.5 rounded-lg bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#0066ff]/20 transition-all cursor-pointer"
              title="Test privacy by checking public shopper view"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View as Public Shopper</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Grid: Left = Camera Monitor & Chat | Right = AI Sales Coach Live Panel */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN (lg:col-span-5): Host Camera Monitor & Live Chat */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Live Broadcast Monitor Card */}
          <div className="bg-[#141720] border border-[#212633] rounded-3xl p-3.5 space-y-3 shadow-xl relative overflow-hidden">
            
            <div className="flex items-center justify-between text-xs pb-1 border-b border-[#212633]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="font-bold uppercase tracking-wider text-red-400">On Air (Host Feed)</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-400" />
                  {viewerCount.toLocaleString()} watching
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400 fill-current" />
                  842
                </span>
              </div>
            </div>

            {/* Video Frame Canvas Simulation */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-[#262c3a] flex items-center justify-center">
              <img
                src={session.coverImage}
                alt={session.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-85"
              />
              
              {/* Overlay: Camera Viewfinder Reticle */}
              <div className="absolute inset-4 border border-white/15 pointer-events-none rounded-lg flex flex-col justify-between p-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400/80 bg-black/50 px-2 py-0.5 rounded w-fit">
                  <span>1080p · 30fps · AUDIO OK</span>
                </div>
                <div className="text-center text-[10px] font-mono text-white/50 bg-black/40 px-2 py-0.5 rounded mx-auto">
                  Center Frame for Demonstration
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 bg-black/50 px-2 py-0.5 rounded w-fit">
                  <span>Showmi Host Camera</span>
                </div>
              </div>

              {/* Mute/Audio Preview Control */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full border border-white/10 hover:bg-black cursor-pointer"
                title={isMuted ? 'Unmute preview' : 'Mute preview'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Bottom Tag: Currently Showcasing Badge */}
              {activeProduct && (
                <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={activeProduct.images[0]}
                      alt={activeProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Shopper Focus</p>
                      <p className="text-xs text-white font-bold truncate">{activeProduct.name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-bold text-white">R {activeProduct.priceZAR.toLocaleString()}</p>
                    <p className="text-[10px] font-mono text-emerald-400">{activeProduct.stock} in stock</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Switcher for Host Presentation */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Product to Showcase:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sessionProducts.map(prod => (
                  <button
                    key={prod.id}
                    onClick={() => handlePinProduct(prod.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      prod.id === activeProduct?.id
                        ? 'bg-[#0066ff]/20 border-[#0066ff] text-white shadow-sm shadow-[#0066ff]/20'
                        : 'bg-[#1a1f2b] border-[#262c3a] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate leading-tight">{prod.name}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>R {prod.priceZAR.toLocaleString()}</span>
                        <span className={prod.stock <= 3 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                          {prod.stock} left
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Host Live Chat & Viewer Q&A Feed */}
          <div className="bg-[#141720] border border-[#212633] rounded-3xl p-3.5 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#212633] pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Live Viewer Chat Stream
              </span>
              <div className="flex items-center gap-2">
                {/* Host Moderator Appointment Button */}
                <button
                  type="button"
                  onClick={() => setIsModeratorModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#19BFFF]/15 hover:bg-[#19BFFF]/25 text-[#19BFFF] border border-[#19BFFF]/30 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Appoint Showpreneurs as chat moderators"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Moderators ({moderatorSellerIds.length})</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeComments.length} comments
                </span>
              </div>
            </div>

            {/* Active Moderator Chips */}
            {moderatorSellerIds.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5 pb-1 border-b border-[#212633]/50">
                <span className="text-[10px] text-slate-400 font-medium">Active Mods:</span>
                {moderatorSellerIds.map(modId => {
                  const modSeller = allSellers.find(s => s.id === modId);
                  return (
                    <span
                      key={modId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold"
                    >
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{modSeller?.name || modId}</span>
                      <button
                        type="button"
                        onClick={() => onRevokeModerator && onRevokeModerator(modId)}
                        className="text-slate-400 hover:text-red-400 ml-0.5 cursor-pointer text-xs"
                        title={`Revoke ${modSeller?.name || modId}`}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="h-44 overflow-y-auto space-y-2 pr-1 scrollbar-none text-xs">
              {activeComments.slice(-6).map(c => (
                <div
                  key={c.id}
                  className={`p-2 rounded-xl relative group ${
                    c.isHost
                      ? 'bg-amber-950/40 border border-amber-600/30 text-amber-200'
                      : c.isModerator
                      ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-200'
                      : 'bg-[#0c0e12] border border-[#212633] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className={`font-bold flex items-center gap-1 ${
                      c.isHost ? 'text-amber-400' : c.isModerator ? 'text-emerald-400' : 'text-blue-400'
                    }`}>
                      {c.isModerator && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                      {c.userName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono">{c.timestamp}</span>
                      {deletingCommentId !== c.id && (
                        <button
                          type="button"
                          onClick={() => setDeletingCommentId(c.id)}
                          className="text-[10px] text-red-400 hover:text-red-300 underline opacity-75 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove message"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-white text-xs">{c.text}</p>

                  {/* Confirmation banner */}
                  {deletingCommentId === c.id && (
                    <div className="mt-2 pt-2 border-t border-red-500/30 bg-red-950/30 p-2 rounded-lg flex items-center justify-between gap-2">
                      <span className="text-[10px] text-red-300 font-medium">Remove message?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDeletingCommentId(null)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(c.id)}
                          className="px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-500 text-[10px] font-bold cursor-pointer"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Host Chat Reply Form */}
            <form onSubmit={handleHostSendComment} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Reply to chat as host..."
                value={hostReplyText}
                onChange={e => setHostReplyText(e.target.value)}
                className="flex-1 min-h-[44px] bg-[#0c0e12] border border-[#262c3a] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066ff]"
              />
              <button
                type="submit"
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center justify-center cursor-pointer shrink-0 active:scale-95"
                title="Send reply"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (lg:col-span-7): Private AI Sales Coach Panel */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* REQUIRED DISCLAIMER BANNER */}
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-3 shadow-md">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-200/90 leading-relaxed">
              <p className="font-semibold text-amber-300 mb-0.5">AI Sales Coach Guidance Notice</p>
              “AI-generated content is for guidance and inspiration only. Review all suggestions for accuracy before using them. You are responsible for the claims you make about your products.”
            </div>
          </div>

          {/* Real-time Data Synchronization Strip (Stock & Promotion status) */}
          {activeProduct && (
            <div className="bg-[#141720] border border-[#212633] rounded-2xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Product & Stock Status Card */}
              <div className="bg-[#0c0e12] border border-[#212633] p-2.5 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Package className="w-3 h-3 text-blue-400" />
                    Verified Inventory
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    activeProduct.stock <= 0
                      ? 'bg-red-500/20 text-red-400'
                      : activeProduct.stock <= 3
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {activeProduct.stock} units available
                  </span>
                </div>
                <p className="text-white font-bold truncate">{activeProduct.name}</p>
                <p className="text-slate-400 text-[11px]">
                  R {activeProduct.priceZAR.toLocaleString()} · Dispatched in {activeProduct.dispatchTime}
                </p>

                {/* Stock test button */}
                {onSimulateOrderStockDecrement && (
                  <button
                    onClick={() => onSimulateOrderStockDecrement(activeProduct.id)}
                    className="mt-1 text-[10px] text-blue-400 hover:text-blue-300 underline font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <span>⚡ Simulate 1 Order (Test Stock Decrement)</span>
                  </button>
                )}
              </div>

              {/* Promotion Status Card */}
              <div className="bg-[#0c0e12] border border-[#212633] p-2.5 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-purple-400" />
                    Promotion Status
                  </span>
                  {activePromo ? (
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      ACTIVE OFFER
                    </span>
                  ) : (
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-mono">
                      NO ACTIVE PROMO
                    </span>
                  )}
                </div>

                {activePromo ? (
                  <>
                    <p className="text-white font-bold truncate text-[11px]">{activePromo.title}</p>
                    <p className="text-purple-300 text-[10px] leading-tight">
                      Expires: {new Date(activePromo.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {onExpirePromotionNow && (
                      <button
                        onClick={() => onExpirePromotionNow(activePromo.id)}
                        className="mt-1 text-[10px] text-red-400 hover:text-red-300 underline font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <span>✕ Expire Promo Now (Test Rule)</span>
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-slate-400 text-[11px] leading-tight pt-1">
                    No active promotion records exist for this item. Promotion alerts are withheld.
                  </p>
                )}
              </div>

            </div>
          )}

          {/* MAIN PROMPT CARD: Large, high contrast, readable by a presenter on a phone */}
          <div className={`bg-[#161a24] border-2 rounded-3xl p-5 shadow-2xl relative transition-all ${
            currentPrompt?.priority === 'urgent'
              ? 'border-amber-500/80 shadow-amber-500/10'
              : 'border-[#0066ff]/60 shadow-[#0066ff]/10'
          }`}>
            
            {/* Header: Step Number, Category Badge, Pause Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  currentPrompt?.category === 'stock'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : currentPrompt?.category === 'promotion'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : currentPrompt?.category === 'demo'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentPrompt?.categoryLabel || 'Live Prompt'}
                </span>

                {isQueuePaused && (
                  <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                    <Pause className="w-3 h-3" />
                    QUEUE PAUSED
                  </span>
                )}
              </div>

              <div className="text-slate-400 font-mono text-xs">
                Prompt {activeQueue.length > 0 ? currentPromptIndex + 1 : 0} of {activeQueue.length}
              </div>
            </div>

            {/* Main Prompt Content: Highly readable on camera */}
            {currentPrompt ? (
              <div className="py-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">
                  {currentPrompt.title}
                </h3>

                {/* Spoken Prompt / Camera Phrasing */}
                <div className="bg-[#0d1017] border border-[#262c3a] p-4 rounded-2xl">
                  <p className="text-base sm:text-lg font-medium text-white leading-relaxed tracking-wide">
                    {currentPrompt.body}
                  </p>
                </div>

                {/* Guidance Tip / Body Language Reminder */}
                {currentPrompt.guidanceTip && (
                  <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-950/30 border border-blue-500/20 px-3 py-2 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span><strong>Presenter Tip:</strong> {currentPrompt.guidanceTip}</span>
                  </div>
                )}

                {/* Listing Data Grounding Badge */}
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Grounding: {currentPrompt.sourceContext}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">All prompts in this queue completed!</p>
                <p className="text-xs">Reopen dismissed prompts below to rehearse again or switch products.</p>
              </div>
            )}

            {/* SELLER QUEUE CONTROLS: Next, Dismiss, Pause/Resume, Restore */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              
              {/* Left Action Buttons: Dismiss & Pause */}
              <div className="flex items-center gap-2 flex-wrap">
                {currentPrompt && (
                  <button
                    onClick={() => handleDismissPrompt(currentPrompt.id)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                    title="Dismiss this prompt from queue"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>
                )}

                <button
                  onClick={handleTogglePause}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
                    isQueuePaused
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={isQueuePaused ? 'Resume live queue' : 'Pause queue'}
                >
                  {isQueuePaused ? (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume Queue</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Queue</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Action: Next Prompt */}
              <div className="flex items-center gap-2 flex-wrap ml-auto">
                {dismissedPrompts.length > 0 && (
                  <button
                    onClick={handleReopenDismissed}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#1e2433] hover:bg-[#283042] text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                    <span>Reopen ({dismissedPrompts.length})</span>
                  </button>
                )}

                <button
                  onClick={handleNextPrompt}
                  disabled={activeQueue.length <= 1}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeQueue.length <= 1
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-lg shadow-[#0066ff]/30 cursor-pointer active:scale-95'
                  }`}
                >
                  <span>Next Prompt</span>
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Collapsible Queue Overview & Dismissed History */}
          <div className="bg-[#141720] border border-[#212633] rounded-2xl p-4 space-y-3 shadow-lg">
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowQueueDetails(!showQueueDetails)}
                className="text-xs font-bold text-white flex items-center gap-2 hover:text-[#0066ff] cursor-pointer"
              >
                <span>Queue Schedule ({activeQueue.length} Active, {dismissedPrompts.length} Dismissed)</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showQueueDetails ? 'rotate-90' : ''}`} />
              </button>

              <span className="text-[11px] text-slate-400 font-mono">
                {activeProduct?.name}
              </span>
            </div>

            {showQueueDetails && (
              <div className="space-y-3 pt-2 border-t border-[#212633]">
                {/* Active upcoming prompts */}
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Upcoming Prompts:
                  </p>
                  {activeQueue.map((prompt, index) => (
                    <div
                      key={prompt.id}
                      onClick={() => setCurrentPromptIndex(index)}
                      className={`p-2 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        index === currentPromptIndex
                          ? 'bg-[#0066ff]/20 border border-[#0066ff] text-white font-bold'
                          : 'bg-[#0c0e12] border border-[#212633] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono shrink-0">
                          {index + 1}
                        </span>
                        <span className="truncate">{prompt.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">
                        {prompt.category}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Dismissed prompts drawer */}
                {dismissedPrompts.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#212633]">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Dismissed Prompts (Click to restore):
                    </p>
                    {dismissedPrompts.map(prompt => (
                      <div
                        key={prompt.id}
                        className="p-2 rounded-xl text-xs bg-[#0c0e12]/60 border border-[#212633] text-slate-400 flex items-center justify-between gap-2"
                      >
                        <span className="line-through truncate">{prompt.title}</span>
                        <button
                          onClick={() => handleRestoreSinglePrompt(prompt.id)}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-mono underline shrink-0 cursor-pointer"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* On-Demand AI Sales Coach Quick Assist (Gemini Integration) */}
          <div className="bg-[#141720] border border-[#212633] rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0066ff]" />
                On-Demand AI Coach Advice (Camera Support)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Optional Assistant
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Need a quick confidence boost or ideas on camera? Tap a scenario below to generate grounded suggestions:
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAskAiCoach("The viewers are quiet in chat. What engaging question can I ask right now about this product?")}
                disabled={isRequestingAiTip}
                className="px-2.5 py-1.5 rounded-lg bg-[#1a1f2c] hover:bg-[#252c3e] border border-[#262c3a] text-slate-300 hover:text-white text-xs cursor-pointer disabled:opacity-50"
              >
                💬 Quiet Chat Prompt
              </button>

              <button
                onClick={() => handleAskAiCoach("I feel nervous on camera. Give me a 10-second grounding breathing and transition tip.")}
                disabled={isRequestingAiTip}
                className="px-2.5 py-1.5 rounded-lg bg-[#1a1f2c] hover:bg-[#252c3e] border border-[#262c3a] text-slate-300 hover:text-white text-xs cursor-pointer disabled:opacity-50"
              >
                🧘 Camera Confidence Tip
              </button>

              <button
                onClick={() => handleAskAiCoach(`How should I explain the R ${activeProduct?.priceZAR.toLocaleString()} price point transparently?`)}
                disabled={isRequestingAiTip}
                className="px-2.5 py-1.5 rounded-lg bg-[#1a1f2c] hover:bg-[#252c3e] border border-[#262c3a] text-slate-300 hover:text-white text-xs cursor-pointer disabled:opacity-50"
              >
                💰 Explain Artisan Value
              </button>
            </div>

            {/* AI Generated Tip Display */}
            {isRequestingAiTip && (
              <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#212633] text-xs text-blue-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                <span>Generating grounded coaching tip via Gemini...</span>
              </div>
            )}

            {aiCoachTip && !isRequestingAiTip && (
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-slate-200 space-y-1 relative">
                <div className="flex items-center justify-between text-[10px] text-blue-400 font-bold uppercase">
                  <span>AI Coach Real-time Tip</span>
                  <button
                    onClick={() => setAiCoachTip(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="whitespace-pre-line leading-relaxed text-xs">
                  {aiCoachTip}
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Host Moderator Management Modal */}
      {isModeratorModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#171A21] border border-[#242936] rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsModeratorModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#19BFFF]" />
                Appoint Moderators
              </h3>
              <p className="text-xs text-slate-400">
                Search and appoint fellow makers to moderate your chat and keep the stream safe.
              </p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-none">
              {(allSellers || []).filter(s => s.id !== seller.id).map(s => {
                const isMod = moderatorSellerIds.includes(s.id);
                return (
                  <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0D1018] border border-[#242936]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-400">{s.city}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (isMod) {
                          onRevokeModerator && onRevokeModerator(s.id);
                        } else {
                          onAppointModerator && onAppointModerator(s.id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isMod
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                          : 'bg-[#19BFFF] text-[#0D1018] hover:bg-[#00AEEF]'
                      }`}
                    >
                      {isMod ? <X className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                      <span>{isMod ? 'Revoke' : 'Appoint'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setIsModeratorModalOpen(false)}
              className="w-full py-3 bg-[#242936] hover:bg-[#2d3343] text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
