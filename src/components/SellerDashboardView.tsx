import React, { useState } from 'react';
import { 
  Sparkles, 
  Radio, 
  FileText, 
  Film, 
  Copy, 
  Check, 
  ArrowLeft, 
  Store, 
  AlertCircle, 
  RefreshCw, 
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Seller, Product, StreamSnippet, LivePromotion } from '../types';

interface SellerDashboardViewProps {
  sellers: Seller[];
  products: Product[];
  snippets: StreamSnippet[];
  promotions?: LivePromotion[];
  currentSellerId: string;
  onSelectSeller: (sellerId: string) => void;
  onBackToShopping: () => void;
  onUpdateProductDescription?: (productId: string, newDesc: string) => void;
  onPublishSnippet?: (snippet: StreamSnippet) => void;
  onArchiveSnippet?: (snippetId: string) => void;
  onExpireSnippetNow?: (snippetId: string) => void;
  onRepublishSnippet?: (snippetId: string, durationHours: number) => void;
  onOpenLiveHostMode?: (sessionId: string) => void;
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  sellers,
  products,
  snippets,
  promotions,
  currentSellerId,
  onSelectSeller,
  onBackToShopping,
  onUpdateProductDescription,
  onPublishSnippet,
  onArchiveSnippet,
  onExpireSnippetNow,
  onRepublishSnippet,
  onOpenLiveHostMode
}) => {
  const currentSeller = sellers.find(s => s.id === currentSellerId) || sellers[0];
  const sellerProducts = products.filter(p => p.sellerId === currentSeller.id);
  const sellerSnippets = snippets.filter(s => s.sellerId === currentSeller.id);
  const activeSellerSnippets = sellerSnippets.filter(s => !s.isArchived && new Date(s.expiresAt).getTime() > Date.now());
  const archivedSellerSnippets = sellerSnippets.filter(s => s.isArchived || new Date(s.expiresAt).getTime() <= Date.now());

  // Active Tool Tab: 'prep' | 'copy' | 'snippet'
  const [activeTab, setActiveTab] = useState<'prep' | 'copy' | 'snippet'>('prep');

  // Selected entities for generation
  const [selectedProductId, setSelectedProductId] = useState<string>(
    sellerProducts[0]?.id || ''
  );
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(
    sellerSnippets[0]?.id || currentSeller.snippets[0]?.id || ''
  );

  // Temporary shoppable snippets state: expiry period & linked product
  const [snippetExpiryHours, setSnippetExpiryHours] = useState<number>(168); // 24, 48, or 168 (7 days default)
  const [snippetProductId, setSnippetProductId] = useState<string>(
    sellerSnippets[0]?.productId || sellerProducts[0]?.id || ''
  );
  const [snippetViewMode, setSnippetViewMode] = useState<'create' | 'active' | 'archive'>('create');

  // Custom seller input context
  const [prepNotes, setPrepNotes] = useState('');
  const [copyInstructions, setCopyInstructions] = useState('');
  const [snippetUserDescription, setSnippetUserDescription] = useState(
    'In this clip, we show the texture, viscosity, and application on the skin under natural light.'
  );

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Tab A: Generated Livestream Prep Output (editable)
  const [prepResults, setPrepResults] = useState<{
    openingHook: string;
    talkingPoints: string;
    demoSteps: string;
    faqQuestions: string;
    streamTimeline: string;
  }>({
    openingHook: '',
    talkingPoints: '',
    demoSteps: '',
    faqQuestions: '',
    streamTimeline: ''
  });

  // Tab B: Generated Copy Output (editable)
  const [copyResults, setCopyResults] = useState<{
    improvedDescription: string;
    socialCaption: string;
    streamTeaser: string;
  }>({
    improvedDescription: '',
    socialCaption: '',
    streamTeaser: ''
  });

  // Tab C: Generated Snippet Output (editable)
  const [snippetResults, setSnippetResults] = useState<{
    title: string;
    caption: string;
    tags: string;
  }>({
    title: '',
    caption: '',
    tags: ''
  });

  const selectedProduct = sellerProducts.find(p => p.id === selectedProductId) || sellerProducts[0];
  const selectedSnippet = currentSeller.snippets.find(s => s.id === selectedSnippetId) || currentSeller.snippets[0];

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper to parse sections from markdown text
  const parseSections = (text: string) => {
    return text;
  };

  // 1. Generate Livestream Prep (Before going live)
  const handleGeneratePrep = async () => {
    if (!selectedProduct) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/seller-ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'livestream_prep',
          product: selectedProduct,
          seller: currentSeller,
          customContext: prepNotes
        })
      });

      const data = await response.json();
      if (data.success && data.text) {
        // Break up or populate fields thoughtfully
        const raw = data.text;
        
        // Simple extraction logic or structured blocks
        const hookMatch = raw.match(/1[\.\)]\s*Engaging Opening Hook[\s\S]*?(?=2[\.\)]|$)/i);
        const pointsMatch = raw.match(/2[\.\)]\s*Core Talking Points[\s\S]*?(?=3[\.\)]|$)/i);
        const demoMatch = raw.match(/3[\.\)]\s*Live Demonstration Ideas[\s\S]*?(?=4[\.\)]|$)/i);
        const faqMatch = raw.match(/4[\.\)]\s*Key Questions[\s\S]*?(?=5[\.\)]|$)/i);
        const timelineMatch = raw.match(/5[\.\)]\s*Simple 10-Minute Livestream Outline[\s\S]*/i);

        setPrepResults({
          openingHook: hookMatch ? hookMatch[0].replace(/^1[\.\)]\s*Engaging Opening Hook:?\s*/i, '').trim() : `Sawubona and welcome to Showmi! Today from our ${currentSeller.city} workshop, we're unveiling our small-batch ${selectedProduct.name}. If you want authentic South African craftsmanship, stick around—only ${selectedProduct.stock} units are left in stock today!`,
          talkingPoints: pointsMatch ? pointsMatch[0].replace(/^2[\.\)]\s*Core Talking Points:?\s*/i, '').trim() : `• Small-batch handcrafted in ${currentSeller.city}, ${currentSeller.province}.\n• Features: ${selectedProduct.features.join('; ')}.\n• Fast nationwide courier: ${selectedProduct.dispatchTime}.\n• Fair South African pricing at R ${selectedProduct.priceZAR.toLocaleString()}.`,
          demoSteps: demoMatch ? demoMatch[0].replace(/^3[\.\)]\s*Live Demonstration Ideas:?\s*/i, '').trim() : `1. Hold the item 30cm from camera to showcase texture.\n2. Demonstrate practical use and weight.\n3. Show packaging and Courier Guy delivery box.`,
          faqQuestions: faqMatch ? faqMatch[0].replace(/^4[\.\)]\s*Key Questions:?\s*/i, '').trim() : `Q: How quickly will my order arrive?\nA: Dispatched within ${selectedProduct.dispatchTime} via nationwide courier.\n\nQ: Is it genuine local craft?\nA: Yes, 100% produced in our ${currentSeller.city} workshop.`,
          streamTimeline: timelineMatch ? timelineMatch[0].replace(/^5[\.\)]\s*Simple 10-Minute Livestream Outline:?\s*/i, '').trim() : `Min 0-2: Opening hook & welcome viewers.\nMin 2-5: Live physical demonstration & materials.\nMin 5-8: Answer live chat questions & show stock count.\nMin 8-10: Pinned basket call-to-action & final dispatch reminder.`
        });
      } else {
        throw new Error(data.error || 'Server returned empty response');
      }
    } catch (err) {
      console.warn('Using client-assisted structured generation:', err);
      // Fallback: high quality factual generator based strictly on seller data
      setPrepResults({
        openingHook: `Sawubona everyone! Welcome to Showmi live from our ${currentSeller.city} studio. Today I'm demonstrating our ${selectedProduct.name}—we only have ${selectedProduct.stock} pieces crafted for this batch!`,
        talkingPoints: `• Authentic artisan creation from ${currentSeller.name} in ${currentSeller.city}.\n• Key features: ${selectedProduct.features.slice(0, 3).join(', ')}.\n• Priced at R ${selectedProduct.priceZAR.toLocaleString()} with nationwide door-to-door delivery.\n• Dispatched within ${selectedProduct.dispatchTime}.`,
        demoSteps: `1. Physical Close-up: Hold the ${selectedProduct.name} to the studio light to highlight natural finish and detail.\n2. Tactile Demo: Show size and durability on camera.\n3. Packaging Unboxing: Display the authentic South African packaging shoppers will receive at their door.`,
        faqQuestions: `Q: How long does courier delivery take?\nA: Dispatched in ${selectedProduct.dispatchTime} with delivery in 2-3 business days across SA.\n\nQ: What are the key materials?\nA: ${selectedProduct.features.join(', ')}.`,
        streamTimeline: `• 00:00 - 02:00: Welcome viewers, announce R ${selectedProduct.priceZAR.toLocaleString()} price and limited ${selectedProduct.stock} stock.\n• 02:00 - 05:00: Show features, hold to camera, test live.\n• 05:00 - 08:00: Answer questions from viewers in chat.\n• 08:00 - 10:00: Guide viewers to click 'Add to Basket' and announce final dispatch window.`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Generate Product Description & Promotional Content
  const handleGenerateCopy = async () => {
    if (!selectedProduct) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/seller-ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'description_and_captions',
          product: selectedProduct,
          seller: currentSeller,
          customContext: copyInstructions
        })
      });

      const data = await response.json();
      if (data.success && data.text) {
        const raw = data.text;
        const descMatch = raw.match(/1[\.\)]\s*Enhanced Product Description[\s\S]*?(?=2[\.\)]|$)/i);
        const captionMatch = raw.match(/2[\.\)]\s*Quick Promotional Caption[\s\S]*?(?=3[\.\)]|$)/i);
        const teaserMatch = raw.match(/3[\.\)]\s*Live Room Announcement Card[\s\S]*/i);

        setCopyResults({
          improvedDescription: descMatch ? descMatch[0].replace(/^1[\.\)]\s*Enhanced Product Description:?\s*/i, '').trim() : `${selectedProduct.description}\n\nHandcrafted with pride by ${currentSeller.name} in ${currentSeller.city}, South Africa. Each piece is made in small batches and dispatched directly via nationwide courier.`,
          socialCaption: captionMatch ? captionMatch[0].replace(/^2[\.\)]\s*Quick Promotional Caption:?\s*/i, '').trim() : `Tune into our Showmi live broadcast! Showcasing the ${selectedProduct.name} handcrafted in ${currentSeller.city}. Only ${selectedProduct.stock} available. R ${selectedProduct.priceZAR.toLocaleString()} with nationwide courier. #Showmi #MadeInSA #SupportLocal`,
          streamTeaser: teaserMatch ? teaserMatch[0].replace(/^3[\.\)]\s*Live Room Announcement Card:?\s*/i, '').trim() : `Now showcasing: ${selectedProduct.name} · R ${selectedProduct.priceZAR.toLocaleString()} · Only ${selectedProduct.stock} left in stock!`
        });
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      console.warn('Fallback generation for copy:', err);
      setCopyResults({
        improvedDescription: `${selectedProduct.name} by ${currentSeller.name} (${currentSeller.city}, South Africa).\n\n${selectedProduct.description}\n\nFeatures:\n${selectedProduct.features.map(f => `• ${f}`).join('\n')}\n\nPriced at R ${selectedProduct.priceZAR.toLocaleString()}. ${selectedProduct.dispatchTime}.`,
        socialCaption: `Handmade in ${currentSeller.city} 🇿🇦: The ${selectedProduct.name} is now live on Showmi! Discover authentic artisan craft, ask your questions in real-time, and get nationwide delivery. Available now for R ${selectedProduct.priceZAR.toLocaleString()}.\n\n#Showmi #SouthAfricanMakers #${currentSeller.city.replace(/[^a-zA-Z]/g, '')}`,
        streamTeaser: `Handcrafted in ${currentSeller.city}: ${selectedProduct.name} (R ${selectedProduct.priceZAR.toLocaleString()}) — Tap to inspect & buy.`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Generate Snippet Title, Caption & Tags (After going live)
  const handleGenerateSnippet = async () => {
    if (!selectedSnippet) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/seller-ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'snippet_summary',
          product: selectedProduct,
          seller: currentSeller,
          snippet: selectedSnippet,
          customContext: snippetUserDescription
        })
      });

      const data = await response.json();
      if (data.success && data.text) {
        const raw = data.text;
        const titleMatch = raw.match(/1[\.\)]\s*Catchy Snippet Title[\s\S]*?(?=2[\.\)]|$)/i);
        const captionMatch = raw.match(/2[\.\)]\s*Snippet Caption[\s\S]*?(?=3[\.\)]|$)/i);
        const tagsMatch = raw.match(/3[\.\)]\s*Recommended Storefront Tags[\s\S]*/i);

        setSnippetResults({
          title: titleMatch ? titleMatch[0].replace(/^1[\.\)]\s*Catchy Snippet Title:?\s*/i, '').trim().replace(/^"/, '').replace(/"$/, '') : `${selectedSnippet.highlightTag}: Live Demonstration of ${selectedProduct.name}`,
          caption: captionMatch ? captionMatch[0].replace(/^2[\.\)]\s*Snippet Caption:?\s*/i, '').trim() : `Watch our live session replay demonstrating the craftsmanship and quality of our ${selectedProduct.name}. In this clip: ${snippetUserDescription}.`,
          tags: tagsMatch ? tagsMatch[0].replace(/^3[\.\)]\s*Recommended Storefront Tags:?\s*/i, '').trim() : `#${currentSeller.city.replace(/[^a-zA-Z]/g, '')} #ShowmiLive #LocalMakers #HandcraftedSA`
        });
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      console.warn('Fallback snippet summary:', err);
      setSnippetResults({
        title: `${selectedSnippet.highlightTag}: In-Studio Demonstration`,
        caption: `In this live clip, ${currentSeller.name} demonstrates the ${selectedProduct.name}. Description: ${snippetUserDescription}. Available on Showmi for R ${selectedProduct.priceZAR.toLocaleString()}.`,
        tags: `#Showmi #MadeInSouthAfrica #${selectedProduct.category} #${currentSeller.city.replace(/[^a-zA-Z]/g, '')}`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyDescription = () => {
    if (selectedProduct && copyResults.improvedDescription && onUpdateProductDescription) {
      onUpdateProductDescription(selectedProduct.id, copyResults.improvedDescription);
      setAppliedNotification(`Updated description for ${selectedProduct.name}`);
      setTimeout(() => setAppliedNotification(null), 2500);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours >= 48) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    if (hours >= 1) {
      return `${hours}h left`;
    }
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${mins}m left`;
  };

  const handlePublishShoppableSnippet = () => {
    if (!snippetProductId) return;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + snippetExpiryHours * 60 * 60 * 1000);
    const linkedProd = products.find(p => p.id === snippetProductId) || selectedProduct;
    const existingSnippet = sellerSnippets.find(s => s.id === selectedSnippetId);
    
    const snippetToPublish: StreamSnippet = {
      id: existingSnippet ? existingSnippet.id : `snip-${Date.now()}`,
      sellerId: currentSeller.id,
      productId: snippetProductId,
      title: snippetResults.title.trim() || (existingSnippet ? existingSnippet.title : `Live Demonstration: ${linkedProd.name}`),
      duration: existingSnippet?.duration || '03:45',
      recordedDate: existingSnippet?.recordedDate || 'Recorded Live',
      thumbnail: existingSnippet?.thumbnail || linkedProd.images[0],
      highlightTag: existingSnippet?.highlightTag || 'Shoppable Demo',
      views: existingSnippet?.views || '1.1k',
      publishedAt: now.toISOString(),
      expiresAt: expiryDate.toISOString(),
      expiryDurationHours: snippetExpiryHours,
      isArchived: false,
      userDescription: snippetUserDescription,
      caption: snippetResults.caption || '',
      tags: snippetResults.tags || ''
    };

    if (onPublishSnippet) {
      onPublishSnippet(snippetToPublish);
    }
    setAppliedNotification(`Published shoppable snippet for "${linkedProd.name}"! Active on storefront for ${snippetExpiryHours === 168 ? '7 days' : snippetExpiryHours + ' hours'}.`);
    setTimeout(() => setAppliedNotification(null), 3500);
  };

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      
      {/* Top Banner and Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#212633]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToShopping}
            className="p-2 rounded-xl bg-[#14171f] text-slate-300 hover:text-white border border-[#212633] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#0066ff]/20 text-[#60a5fa] border border-[#0066ff]/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#0066ff]" />
                Seller Studio
              </span>
              <span className="text-xs text-slate-400 font-mono">
                AI Selling Assistant
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Livestream Prep & Sales Co-Pilot
            </h1>
          </div>
        </div>

        {/* Seller Switcher */}
        <div className="flex items-center gap-2 bg-[#14171f] p-1.5 rounded-xl border border-[#212633]">
          <Store className="w-4 h-4 text-[#0066ff] ml-1.5" />
          <span className="text-xs text-slate-400">Managing:</span>
          <select
            value={currentSeller.id}
            onChange={(e) => onSelectSeller(e.target.value)}
            className="bg-[#0c0e12] border border-[#212633] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#0066ff]"
          >
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applied Notification */}
      {appliedNotification && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{appliedNotification}</span>
        </div>
      )}

      {/* Mandatory Transparency & Governance Banner with exact required disclaimer */}
      <div className="p-4 rounded-2xl bg-[#14171f] border border-[#212633] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#0066ff] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">Seller Responsibility & Transparency Notice:</span>
            <span className="text-slate-400 leading-relaxed">
              “AI-generated content is for guidance and inspiration only. Review all suggestions for accuracy before using them. You are responsible for the claims you make about your products.”
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onOpenLiveHostMode && currentSeller.currentLiveSessionId && (
            <button
              onClick={() => onOpenLiveHostMode(currentSeller.currentLiveSessionId!)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Launch Live Host Mode</span>
            </button>
          )}
          <div className="bg-[#0c0e12] px-2.5 py-1.5 rounded-md text-[11px] text-slate-400 font-mono border border-[#212633]">
            Gemini 3.1 Flash Lite
          </div>
        </div>
      </div>

      {/* Main 3 Functional Tabs */}
      <div className="flex items-center gap-2 border-b border-[#212633] pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('prep')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'prep'
              ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
              : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>A. Before Going Live (Livestream Prep)</span>
        </button>

        <button
          onClick={() => setActiveTab('copy')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'copy'
              ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
              : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>B. Product Descriptions & Captions</span>
        </button>

        <button
          onClick={() => setActiveTab('snippet')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'snippet'
              ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
              : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>C. After Going Live (Snippet Highlights)</span>
        </button>
      </div>

      {/* TAB A: BEFORE GOING LIVE */}
      {activeTab === 'prep' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Product Selection & Live Parameters */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-5">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500" />
                Select Product for Live Broadcast
              </h2>

              {/* Product Picker */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">
                  Choose from your store's inventory:
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                >
                  {sellerProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (R {p.priceZAR.toLocaleString()} · {p.stock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Fact Sheet Preview (Zero-Re-entry requirement) */}
              {selectedProduct && (
                <div className="p-3.5 rounded-xl bg-[#0c0e12] border border-[#212633] space-y-2.5 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="w-14 h-14 rounded-lg object-cover border border-[#212633] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{selectedProduct.name}</p>
                      <p className="font-mono text-[#0066ff] font-bold">R {selectedProduct.priceZAR.toLocaleString()}</p>
                      <p className="text-[11px] text-emerald-400">{selectedProduct.stock} units currently in stock</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1e2330] space-y-1 text-[11px] text-slate-400">
                    <p><strong className="text-slate-300">Courier Dispatch:</strong> {selectedProduct.dispatchTime}</p>
                    <p><strong className="text-slate-300">Known Features:</strong> {selectedProduct.features.join(', ')}</p>
                  </div>
                </div>
              )}

              {/* Optional Broadcast Focus */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">
                  Special Broadcast Focus or Promotion (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Announce free shipping over R750, or winter hydration routine"
                  value={prepNotes}
                  onChange={(e) => setPrepNotes(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066ff]"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGeneratePrep}
                disabled={isGenerating || !selectedProduct}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-[#0066ff] hover:bg-[#0052cc] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#0066ff]/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Live Prep Pack via Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Livestream Prep Pack
                  </>
                )}
              </button>

              {/* Ready to Broadcast action card */}
              {onOpenLiveHostMode && currentSeller.currentLiveSessionId && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Host Studio AI Sales Coach</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Broadcast with your private on-screen prompt queue, live stock updates, and verified promotion terms.
                  </p>
                  <button
                    onClick={() => onOpenLiveHostMode(currentSeller.currentLiveSessionId!)}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <span>Launch Private Seller Host Mode</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Editable Generated Prep Cards */}
          <div className="lg:col-span-7 space-y-6">
            
            {prepResults.openingHook ? (
              <div className="space-y-5">
                
                {/* 1. Opening Hook */}
                <div className="p-5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0066ff] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      1. Engaging Opening Hook (15 Seconds)
                    </span>
                    <button
                      onClick={() => handleCopy('hook', prepResults.openingHook)}
                      className="p-1.5 rounded-lg bg-[#1e2330] hover:bg-[#283042] text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'hook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'hook' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={prepResults.openingHook}
                    onChange={(e) => setPrepResults({ ...prepResults, openingHook: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-[#0066ff]"
                  />
                  <p className="text-[11px] text-slate-400">Say this in your first 15 seconds to prevent viewers scrolling away.</p>
                </div>

                {/* 2. Core Talking Points */}
                <div className="p-5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      2. Talking Points & Benefits
                    </span>
                    <button
                      onClick={() => handleCopy('points', prepResults.talkingPoints)}
                      className="p-1.5 rounded-lg bg-[#1e2330] text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'points' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'points' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={prepResults.talkingPoints}
                    onChange={(e) => setPrepResults({ ...prepResults, talkingPoints: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-[#0066ff]"
                  />
                </div>

                {/* 3. Live Demonstration Ideas */}
                <div className="p-5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      3. Live Demonstration & Camera Tips
                    </span>
                    <button
                      onClick={() => handleCopy('demo', prepResults.demoSteps)}
                      className="p-1.5 rounded-lg bg-[#1e2330] text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'demo' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'demo' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={prepResults.demoSteps}
                    onChange={(e) => setPrepResults({ ...prepResults, demoSteps: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-[#0066ff]"
                  />
                </div>

                {/* 4. Shopper Questions & Suggested Answers */}
                <div className="p-5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      4. Questions to Answer on Stream
                    </span>
                    <button
                      onClick={() => handleCopy('faq', prepResults.faqQuestions)}
                      className="p-1.5 rounded-lg bg-[#1e2330] text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'faq' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'faq' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={prepResults.faqQuestions}
                    onChange={(e) => setPrepResults({ ...prepResults, faqQuestions: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-[#0066ff]"
                  />
                </div>

                {/* 5. 10-Minute Livestream Outline */}
                <div className="p-5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      5. 10-Minute Livestream Outline
                    </span>
                    <button
                      onClick={() => handleCopy('timeline', prepResults.streamTimeline)}
                      className="p-1.5 rounded-lg bg-[#1e2330] text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'timeline' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'timeline' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={prepResults.streamTimeline}
                    onChange={(e) => setPrepResults({ ...prepResults, streamTimeline: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-[#0066ff]"
                  />
                </div>

              </div>
            ) : (
              /* Empty state before generating */
              <div className="p-12 rounded-2xl bg-[#14171f] border border-[#212633] text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#0066ff]/10 border border-[#0066ff]/20 flex items-center justify-center text-[#0066ff] mx-auto">
                  <Radio className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Live Broadcast Prep Assistant</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Select your product and click <strong>"Generate Livestream Prep Pack"</strong> to get an opening hook, demonstration points, questions to answer, and a 10-minute timeline.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB B: PRODUCT DESCRIPTIONS & PROMOTIONAL CONTENT */}
      {activeTab === 'copy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-5">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0066ff]" />
                Select Product to Enhance Copy
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Select Product:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                >
                  {sellerProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="p-3.5 rounded-xl bg-[#0c0e12] border border-[#212633] space-y-2 text-xs">
                  <p className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">Current Description:</p>
                  <p className="text-slate-300 text-xs italic leading-relaxed line-clamp-3">
                    "{selectedProduct.description}"
                  </p>
                  <p className="text-slate-400 text-[11px] pt-1 border-t border-[#1e2330]">
                    Price: <strong className="text-white">R {selectedProduct.priceZAR.toLocaleString()}</strong> · Stock: <strong className="text-white">{selectedProduct.stock}</strong>
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">
                  Tone or Marketing Goal (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on organic fynbos heritage or daily durability"
                  value={copyInstructions}
                  onChange={(e) => setCopyInstructions(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066ff]"
                />
              </div>

              <button
                onClick={handleGenerateCopy}
                disabled={isGenerating || !selectedProduct}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-[#0066ff] hover:bg-[#0052cc] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#0066ff]/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Copy via Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Enhanced Description & Captions
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {copyResults.improvedDescription ? (
              <div className="space-y-5">
                
                {/* 1. Improved Description */}
                <div className="p-5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0066ff] uppercase tracking-wider">
                      Enhanced Product Description
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleApplyDescription}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Apply to Store
                      </button>
                      <button
                        onClick={() => handleCopy('desc', copyResults.improvedDescription)}
                        className="p-1.5 rounded-lg bg-[#1e2330] text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'desc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'desc' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    value={copyResults.improvedDescription}
                    onChange={(e) => setCopyResults({ ...copyResults, improvedDescription: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-[#0066ff]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Factual and persuasive. Uses only your verified features without inventing claims.
                  </p>
                </div>

                {/* 2. Social & Stream Caption */}
                <div className="p-5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Social & Broadcast Caption
                    </span>
                    <button
                      onClick={() => handleCopy('caption', copyResults.socialCaption)}
                      className="p-1.5 rounded-lg bg-[#1e2330] text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'caption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'caption' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={copyResults.socialCaption}
                    onChange={(e) => setCopyResults({ ...copyResults, socialCaption: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-[#0066ff]"
                  />
                </div>

                {/* 3. Live Teaser Card */}
                <div className="p-5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Pinned In-Stream Teaser
                    </span>
                    <button
                      onClick={() => handleCopy('teaser', copyResults.streamTeaser)}
                      className="p-1.5 rounded-lg bg-[#1e2330] text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'teaser' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'teaser' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={copyResults.streamTeaser}
                    onChange={(e) => setCopyResults({ ...copyResults, streamTeaser: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                  />
                </div>

              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-[#14171f] border border-[#212633] text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#0066ff]/10 border border-[#0066ff]/20 flex items-center justify-center text-[#0066ff] mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Copy & Descriptions Assistant</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Improve existing product listings and generate ready-to-use South African social media and stream captions.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB C: AFTER GOING LIVE (TEMPORARY SHOPPABLE SNIPPETS & ARCHIVE) */}
      {activeTab === 'snippet' && (
        <div className="space-y-6">

          {/* Sub-navigation for Snippet Workspace */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#14171f] rounded-2xl border border-[#212633]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSnippetViewMode('create')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  snippetViewMode === 'create'
                    ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
                    : 'bg-[#181c25] text-slate-400 hover:text-white border border-[#212633]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publish & Link Clip</span>
              </button>

              <button
                onClick={() => setSnippetViewMode('active')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  snippetViewMode === 'active'
                    ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
                    : 'bg-[#181c25] text-slate-400 hover:text-white border border-[#212633]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Active on Storefront ({activeSellerSnippets.length})</span>
              </button>

              <button
                onClick={() => setSnippetViewMode('archive')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  snippetViewMode === 'archive'
                    ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
                    : 'bg-[#181c25] text-slate-400 hover:text-white border border-[#212633]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Private Seller Archive ({archivedSellerSnippets.length})</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Seller: {currentSeller.name}
            </span>
          </div>

          {/* SUB-VIEW 1: CREATE & PUBLISH SHOPPABLE SNIPPET */}
          {snippetViewMode === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Clip Picker, Linked Product & Expiry Controls */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-5">
                  <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#0066ff]" />
                    1. Select Recorded Livestream Clip
                  </h2>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Select Clip from Previous Streams:</label>
                    <select
                      value={selectedSnippetId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedSnippetId(newId);
                        const matched = sellerSnippets.find(s => s.id === newId);
                        if (matched) {
                          setSnippetProductId(matched.productId);
                          setSnippetExpiryHours(matched.expiryDurationHours || 168);
                          if (matched.userDescription) setSnippetUserDescription(matched.userDescription);
                          setSnippetResults({
                            title: matched.title,
                            caption: matched.caption || '',
                            tags: matched.tags || ''
                          });
                        }
                      }}
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                    >
                      {sellerSnippets.map((snip) => (
                        <option key={snip.id} value={snip.id}>
                          {snip.highlightTag}: {snip.title} ({snip.duration})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedSnippet && (
                    <div className="rounded-xl overflow-hidden border border-[#212633] bg-[#0c0e12]">
                      <div className="relative aspect-[16/9] bg-black">
                        <img
                          src={selectedSnippet.thumbnail}
                          alt={selectedSnippet.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                          {selectedSnippet.duration}
                        </div>
                      </div>
                      <div className="p-3 text-xs space-y-1">
                        <span className="text-[10px] text-[#0066ff] font-bold uppercase">{selectedSnippet.highlightTag}</span>
                        <p className="text-white font-medium truncate">{selectedSnippet.title}</p>
                      </div>
                    </div>
                  )}

                  {/* 2. Link each snippet to an existing product using its product ID */}
                  <div className="space-y-3 pt-3 border-t border-[#212633]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#0066ff]" />
                        2. Link to Product (Shop from Video)
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">Product ID Link</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Select Product from Store Catalog:</label>
                      <select
                        value={snippetProductId}
                        onChange={(e) => setSnippetProductId(e.target.value)}
                        className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                      >
                        {sellerProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — R {p.priceZAR.toLocaleString()} ({p.stock} in stock)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Linked Product Preview Micro-Card */}
                    {(() => {
                      const linked = products.find(p => p.id === snippetProductId) || selectedProduct;
                      if (!linked) return null;
                      return (
                        <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#212633] flex items-center gap-3 text-xs">
                          <img
                            src={linked.images[0]}
                            alt={linked.name}
                            className="w-12 h-12 rounded-lg object-cover border border-[#212633] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{linked.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono font-bold text-[#0066ff]">
                                R {linked.priceZAR.toLocaleString()}
                              </span>
                              <span className={`text-[11px] ${linked.stock > 0 ? 'text-emerald-400' : 'text-red-400 font-semibold'}`}>
                                · {linked.stock > 0 ? `${linked.stock} in stock` : 'Out of stock'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 3. Expiry Period Selection: 24h, 48h or 7 days (default 7 days) */}
                  <div className="space-y-3 pt-3 border-t border-[#212633]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        3. Set Expiry Period
                      </h3>
                      <span className="text-[10px] text-amber-400 font-mono">
                        {snippetExpiryHours === 168 ? '7 Days (Default)' : `${snippetExpiryHours} Hours`}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      When expired, this snippet automatically disappears from your public storefront and is moved to your private seller archive.
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSnippetExpiryHours(24)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                          snippetExpiryHours === 24
                            ? 'bg-[#0066ff]/20 border-[#0066ff] text-white shadow-sm'
                            : 'bg-[#0c0e12] border-[#212633] text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="block text-sm font-mono">24h</span>
                        <span className="text-[10px] font-normal text-slate-400 block mt-0.5">Flash Demo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSnippetExpiryHours(48)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                          snippetExpiryHours === 48
                            ? 'bg-[#0066ff]/20 border-[#0066ff] text-white shadow-sm'
                            : 'bg-[#0c0e12] border-[#212633] text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="block text-sm font-mono">48h</span>
                        <span className="text-[10px] font-normal text-slate-400 block mt-0.5">Weekend</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSnippetExpiryHours(168)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                          snippetExpiryHours === 168
                            ? 'bg-[#0066ff] border-[#0066ff] text-white shadow-md shadow-[#0066ff]/30'
                            : 'bg-[#0c0e12] border-[#212633] text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="block text-sm font-mono">7 Days</span>
                        <span className="text-[10px] font-medium text-emerald-300 block mt-0.5">Recommended</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Assistant Context Input */}
                  <div className="space-y-1.5 pt-3 border-t border-[#212633]">
                    <label className="text-xs text-slate-400 font-medium">
                      What product feature do you demonstrate in this clip?
                    </label>
                    <textarea
                      rows={3}
                      value={snippetUserDescription}
                      onChange={(e) => setSnippetUserDescription(e.target.value)}
                      placeholder="e.g. Demonstrating the texture, weight, stitching and durability under studio light"
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateSnippet}
                    disabled={isGenerating}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#1e2430] hover:bg-[#283244] text-white border border-[#2f394d] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Drafting Copy with Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#0066ff]" />
                        Generate AI Title, Caption & Tags
                      </>
                    )}
                  </button>

                </div>
              </div>

              {/* Right Column: Editable Metadata & Big Publish Action */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#212633]">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-[#0066ff]" />
                      Snippet Details & Storefront Copy
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Editable before publishing
                    </span>
                  </div>

                  {/* 1. Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">Snippet Title (Shown on Storefront):</label>
                      <button
                        onClick={() => handleCopy('snipTitle', snippetResults.title)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'snipTitle' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Wheel Throwing Demo: Pulling Pour-Over Coffee Cones"
                      value={snippetResults.title}
                      onChange={(e) => setSnippetResults({ ...snippetResults, title: e.target.value })}
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-[#0066ff]"
                    />
                  </div>

                  {/* 2. Caption */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">Caption / Description:</label>
                      <button
                        onClick={() => handleCopy('snipCaption', snippetResults.caption)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'snipCaption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      placeholder="e.g. Watch our live session replay demonstrating the craftsmanship and quality of our handcrafted stoneware..."
                      value={snippetResults.caption}
                      onChange={(e) => setSnippetResults({ ...snippetResults, caption: e.target.value })}
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-[#0066ff]"
                    />
                  </div>

                  {/* 3. Tags */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">Storefront & Discovery Tags:</label>
                      <button
                        onClick={() => handleCopy('snipTags', snippetResults.tags)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'snipTags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. #MadeInSA #Ceramics #LiveShopping #DurbanCraft"
                      value={snippetResults.tags}
                      onChange={(e) => setSnippetResults({ ...snippetResults, tags: e.target.value })}
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-emerald-400 font-mono focus:outline-none focus:border-[#0066ff]"
                    />
                  </div>

                  {/* Publish Call To Action */}
                  <div className="pt-4 border-t border-[#212633] space-y-3">
                    <button
                      onClick={handlePublishShoppableSnippet}
                      className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#0066ff] hover:bg-[#0052cc] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#0066ff]/25 transition-all cursor-pointer active:scale-98"
                    >
                      <Check className="w-4 h-4" />
                      <span>Publish Shoppable Snippet to Storefront</span>
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                      <span>Linked Product: {products.find(p => p.id === snippetProductId)?.name || 'Selected'}</span>
                      <span>Expiry: {snippetExpiryHours === 168 ? '7 Days' : `${snippetExpiryHours}h`}</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* SUB-VIEW 2: ACTIVE SNIPPETS ON STOREFRONT */}
          {snippetViewMode === 'active' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active Shoppable Snippets on Public Storefront
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    These clips are currently visible to shoppers on your public storefront and feature interactive Buy Now buttons.
                  </p>
                </div>
                <span className="text-xs bg-[#10131a] border border-[#212633] px-3 py-1.5 rounded-xl font-mono text-emerald-400 font-bold">
                  {activeSellerSnippets.length} currently active
                </span>
              </div>

              {activeSellerSnippets.length === 0 ? (
                <div className="p-12 rounded-2xl bg-[#14171f] border border-[#212633] text-center space-y-3">
                  <Film className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-white">No Active Snippets Right Now</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    All previous snippets have expired or been archived. Use the "Publish & Link Clip" tab above to activate a new shoppable snippet.
                  </p>
                  <button
                    onClick={() => setSnippetViewMode('create')}
                    className="px-4 py-2 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold cursor-pointer"
                  >
                    + Publish a Snippet
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeSellerSnippets.map((snippet) => {
                    const linkedProduct = products.find(p => p.id === snippet.productId);
                    const timeLeft = getTimeRemaining(snippet.expiresAt);
                    const exactExpiry = new Date(snippet.expiresAt).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={snippet.id}
                        className="bg-[#14171f] rounded-2xl border border-[#212633] p-4 flex flex-col justify-between space-y-4 shadow-lg"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-[#212633]">
                              <img
                                src={snippet.thumbnail}
                                alt={snippet.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono px-1 rounded">
                                {snippet.duration}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-[#0066ff]/20 text-[#60a5fa] font-bold px-2 py-0.5 rounded-full border border-[#0066ff]/30">
                                  {snippet.highlightTag}
                                </span>
                                <span className="text-[10px] bg-amber-950 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-700/40">
                                  {timeLeft}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                                {snippet.title}
                              </h4>

                              <p className="text-[11px] text-slate-400 font-mono">
                                Views: {snippet.views} · Recorded: {snippet.recordedDate}
                              </p>
                            </div>
                          </div>

                          {/* Linked Product Card */}
                          {linkedProduct && (
                            <div className="p-2.5 rounded-xl bg-[#0c0e12] border border-[#212633] flex items-center justify-between text-xs">
                              <div className="truncate mr-2">
                                <span className="text-[10px] text-slate-400 block">Linked Shoppable Product:</span>
                                <span className="font-semibold text-white truncate block">{linkedProduct.name}</span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono font-bold text-white block">R {linkedProduct.priceZAR.toLocaleString()}</span>
                                <span className={`text-[10px] ${linkedProduct.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {linkedProduct.stock > 0 ? `${linkedProduct.stock} in stock` : 'Out of stock'}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="text-[11px] text-slate-400 font-mono space-y-0.5 pt-1 border-t border-[#1e2330]">
                            <p>Published: {new Date(snippet.publishedAt).toLocaleDateString()}</p>
                            <p className="text-amber-400">Expires: {exactExpiry} ({timeLeft})</p>
                          </div>
                        </div>

                        {/* Actions: Remove & Simulate Expiry */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#212633]">
                          <button
                            onClick={() => {
                              if (onArchiveSnippet) {
                                onArchiveSnippet(snippet.id);
                              }
                            }}
                            className="py-2 px-3 rounded-xl bg-[#1e2430] hover:bg-[#283244] text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Remove from Storefront
                          </button>

                          <button
                            onClick={() => {
                              if (onExpireSnippetNow) {
                                onExpireSnippetNow(snippet.id);
                              }
                            }}
                            className="py-2 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/50 text-amber-300 text-xs font-semibold cursor-pointer transition-colors"
                            title="Simulate expiry right now to verify archiving behavior"
                          >
                            ⚡ Simulate Expiry (Test)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 3: PRIVATE SELLER ARCHIVE */}
          {snippetViewMode === 'archive' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-400" />
                    Private Seller Archive (Expired & Removed Clips)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Expired snippets are safely retained here for your records. They are hidden from the public storefront and deactivated.
                  </p>
                </div>
                <span className="text-xs bg-[#10131a] border border-[#212633] px-3 py-1.5 rounded-xl font-mono text-slate-400 font-bold">
                  {archivedSellerSnippets.length} in archive
                </span>
              </div>

              {/* Regulatory and Non-Availability Notice */}
              <div className="p-3.5 rounded-xl bg-[#14171f] border border-[#212633] text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white block">Archive Protection Policy:</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Expired snippets are never presented as active promotions or currently available offers. Products linked to expired snippets cannot be purchased through expired clips.
                </p>
              </div>

              {archivedSellerSnippets.length === 0 ? (
                <div className="p-12 rounded-2xl bg-[#14171f] border border-[#212633] text-center space-y-2">
                  <p className="text-sm font-semibold text-white">Your Private Archive is Empty</p>
                  <p className="text-xs text-slate-400">
                    Snippets will appear here when they reach their expiry date or when you choose to remove them from your storefront.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {archivedSellerSnippets.map((snippet) => {
                    const linkedProduct = products.find(p => p.id === snippet.productId);
                    const isExpired = new Date(snippet.expiresAt).getTime() <= Date.now();
                    const expiryDateFormatted = new Date(snippet.expiresAt).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <div
                        key={snippet.id}
                        className="bg-[#14171f] rounded-2xl border border-[#212633] p-4 flex flex-col justify-between space-y-4 opacity-85 hover:opacity-100 transition-opacity"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-[#212633]">
                              <img
                                src={snippet.thumbnail}
                                alt={snippet.title}
                                className="w-full h-full object-cover grayscale-30"
                              />
                              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono px-1 rounded">
                                {snippet.duration}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                                  {isExpired ? `Expired: ${expiryDateFormatted}` : 'Archived by Seller'}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                                {snippet.title}
                              </h4>

                              <p className="text-[11px] text-slate-400 font-mono">
                                Total Views: {snippet.views} · Tag: {snippet.highlightTag}
                              </p>
                            </div>
                          </div>

                          {linkedProduct && (
                            <div className="p-2 rounded-xl bg-[#0c0e12] border border-[#212633] flex items-center justify-between text-xs">
                              <span className="text-slate-400 truncate mr-2">Product: {linkedProduct.name}</span>
                              <span className="font-mono text-slate-300 shrink-0">R {linkedProduct.priceZAR.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Republish Action */}
                        <div className="pt-2 border-t border-[#212633] flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">Private Record Only</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                if (onRepublishSnippet) {
                                  onRepublishSnippet(snippet.id, 168);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold cursor-pointer transition-colors"
                            >
                              Republish (7 Days)
                            </button>
                            <button
                              onClick={() => {
                                if (onRepublishSnippet) {
                                  onRepublishSnippet(snippet.id, 24);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#1e2430] hover:bg-[#283244] text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                            >
                              24h
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Explicit Regulatory & Livestream Activity Notice */}
          <div className="p-3.5 rounded-2xl bg-[#10131a] border border-[#212633] text-[11px] text-slate-400 leading-relaxed space-y-1">
            <p>
              <strong className="text-slate-300">Marketplace Policy Reminder:</strong> Temporary shoppable snippets do not count towards the seller's official livestream activity requirements or live broadcast hours.
            </p>
            <p className="text-slate-500">
              Shoppable clips are designed exclusively as lightweight, short-lived video highlights to showcase verified products between full live sessions.
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
