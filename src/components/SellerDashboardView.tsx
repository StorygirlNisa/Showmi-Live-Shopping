import React, { useState, useEffect } from 'react';
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
  Clock,
  Layers,
  ChevronRight,
  Package,
  Plus,
  Trash2,
  Edit3,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Seller, Product, StreamSnippet, LivePromotion, Category } from '../types';
import { MobileSellerStudio } from './MobileSellerStudio';


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
  onAddProduct?: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
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
  onOpenLiveHostMode,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const currentSeller = sellers.find(s => s.id === currentSellerId) || sellers[0];
  const sellerProducts = products.filter(p => p.sellerId === currentSeller.id);
  const sellerSnippets = snippets.filter(s => s.sellerId === currentSeller.id);
  const activeSellerSnippets = sellerSnippets.filter(s => !s.isArchived && new Date(s.expiresAt).getTime() > Date.now());
  const archivedSellerSnippets = sellerSnippets.filter(s => s.isArchived || new Date(s.expiresAt).getTime() <= Date.now());

  // Active Tool Tab: 'prep' | 'copy' | 'snippet' | 'inventory'
  const [activeTab, setActiveTab] = useState<'prep' | 'copy' | 'snippet' | 'inventory'>('prep');

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

  // Product Inventory Management Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isAiGeneratingDesc, setIsAiGeneratingDesc] = useState<boolean>(false);
  const [aiDescError, setAiDescError] = useState<string | null>(null);

  const [productForm, setProductForm] = useState<{
    name: string;
    category: Category;
    categoryLabel: string;
    priceZAR: number;
    stock: number;
    image: string;
    description: string;
    featuresStr: string;
    dispatchTime: string;
    courierPartner: string;
  }>({
    name: '',
    category: 'ceramics',
    categoryLabel: 'Handmade Ceramics',
    priceZAR: 450,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    description: '',
    featuresStr: 'Handcrafted, Small batch, Local clay',
    dispatchTime: '24–48 hours',
    courierPartner: 'The Courier Guy'
  });

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

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

  // 1. Generate Livestream Prep
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
        const raw = data.text;
        const hookMatch = raw.match(/1[\.\)]\s*Engaging Opening Hook[\s\S]*?(?=2[\.\)]|$)/i);
        const pointsMatch = raw.match(/2[\.\)]\s*Core Talking Points[\s\S]*?(?=3[\.\)]|$)/i);
        const demoMatch = raw.match(/3[\.\)]\s*Live Demonstration Ideas[\s\S]*?(?=4[\.\)]|$)/i);
        const faqMatch = raw.match(/4[\.\)]\s*Key Questions[\s\S]*?(?=5[\.\)]|$)/i);
        const timelineMatch = raw.match(/5[\.\)]\s*Simple 10-Minute Livestream Outline[\s\S]*/i);

        setPrepResults({
          openingHook: hookMatch ? hookMatch[0].replace(/^1[\.\)]\s*Engaging Opening Hook:?\s*/i, '').trim() : `Sawubona and welcome to Showmi! Today from our ${currentSeller.city} workshop, we're unveiling our small-batch ${selectedProduct.name}.`,
          talkingPoints: pointsMatch ? pointsMatch[0].replace(/^2[\.\)]\s*Core Talking Points:?\s*/i, '').trim() : `• Small-batch handcrafted in ${currentSeller.city}.\n• Features: ${selectedProduct.features.join('; ')}.\n• Price: R ${selectedProduct.priceZAR.toLocaleString()}.`,
          demoSteps: demoMatch ? demoMatch[0].replace(/^3[\.\)]\s*Live Demonstration Ideas:?\s*/i, '').trim() : `1. Hold the item 30cm from camera.\n2. Demonstrate texture and weight.`,
          faqQuestions: faqMatch ? faqMatch[0].replace(/^4[\.\)]\s*Key Questions:?\s*/i, '').trim() : `Q: How quickly will my order arrive?\nA: Dispatched within ${selectedProduct.dispatchTime}.`,
          streamTimeline: timelineMatch ? timelineMatch[0].replace(/^5[\.\)]\s*Simple 10-Minute Livestream Outline:?\s*/i, '').trim() : `Min 0-2: Opening hook.\nMin 2-5: Live demo.\nMin 5-8: Live chat Q&A.\nMin 8-10: Call to action.`
        });
      } else {
        throw new Error(data.error || 'Server returned empty response');
      }
    } catch (err) {
      setPrepResults({
        openingHook: `Sawubona everyone! Welcome to Showmi live from our ${currentSeller.city} studio. Today I'm demonstrating our ${selectedProduct.name}!`,
        talkingPoints: `• Authentic artisan creation from ${currentSeller.name}.\n• Features: ${selectedProduct.features.slice(0, 3).join(', ')}.\n• Priced at R ${selectedProduct.priceZAR.toLocaleString()}.`,
        demoSteps: `1. Close-up: Show texture and detail.\n2. Scale & Durability demo.`,
        faqQuestions: `Q: Delivery time?\nA: Dispatched in ${selectedProduct.dispatchTime}.`,
        streamTimeline: `• 00:00 - 02:00: Welcome viewers.\n• 02:00 - 05:00: Show features.\n• 05:00 - 10:00: Q&A and Buy CTA.`
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
          improvedDescription: descMatch ? descMatch[0].replace(/^1[\.\)]\s*Enhanced Product Description:?\s*/i, '').trim() : `${selectedProduct.description}\n\nHandcrafted by ${currentSeller.name} in ${currentSeller.city}.`,
          socialCaption: captionMatch ? captionMatch[0].replace(/^2[\.\)]\s*Quick Promotional Caption:?\s*/i, '').trim() : `Discover the ${selectedProduct.name} handcrafted in ${currentSeller.city}. R ${selectedProduct.priceZAR.toLocaleString()}. #Showmi #MadeInSA`,
          streamTeaser: teaserMatch ? teaserMatch[0].replace(/^3[\.\)]\s*Live Room Announcement Card:?\s*/i, '').trim() : `Now showcasing: ${selectedProduct.name} · R ${selectedProduct.priceZAR.toLocaleString()}`
        });
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      setCopyResults({
        improvedDescription: `${selectedProduct.name} by ${currentSeller.name} (${currentSeller.city}).\n\n${selectedProduct.description}`,
        socialCaption: `Handmade in ${currentSeller.city} 🇿🇦: The ${selectedProduct.name} is now live on Showmi! R ${selectedProduct.priceZAR.toLocaleString()}.`,
        streamTeaser: `${selectedProduct.name} (R ${selectedProduct.priceZAR.toLocaleString()}) — Tap to inspect & buy.`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Generate Snippet Title, Caption & Tags
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
          title: titleMatch ? titleMatch[0].replace(/^1[\.\)]\s*Catchy Snippet Title:?\s*/i, '').trim().replace(/^"/, '').replace(/"$/, '') : `${selectedSnippet.highlightTag}: ${selectedProduct.name}`,
          caption: captionMatch ? captionMatch[0].replace(/^2[\.\)]\s*Snippet Caption:?\s*/i, '').trim() : `Watch live clip demonstrating ${selectedProduct.name}.`,
          tags: tagsMatch ? tagsMatch[0].replace(/^3[\.\)]\s*Recommended Storefront Tags:?\s*/i, '').trim() : `#${currentSeller.city.replace(/[^a-zA-Z]/g, '')} #ShowmiLive`
        });
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      setSnippetResults({
        title: `${selectedSnippet.highlightTag}: In-Studio Demo`,
        caption: `Live clip demonstrating ${selectedProduct.name} by ${currentSeller.name}.`,
        tags: `#Showmi #MadeInSA #${selectedProduct.category}`
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
    setAppliedNotification(`Published shoppable snippet for "${linkedProd.name}"!`);
    setTimeout(() => setAppliedNotification(null), 3500);
  };

  // Image File Upload Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setImageUploadError('Image file is too large. Maximum file size is 5MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        setProductForm(prev => ({ ...prev, image: base64String }));
      }
    };
    reader.onerror = () => {
      setImageUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // AI Suggest Description Assistant Handler (Multimodal)
  const handleAiSuggestDescription = async () => {
    if (!productForm.name.trim()) {
      setAiDescError('Please enter a product title first.');
      return;
    }

    setIsAiGeneratingDesc(true);
    setAiDescError(null);

    let attempts = 0;
    const maxAttempts = 2;
    let successText = '';

    while (attempts < maxAttempts && !successText) {
      attempts++;
      try {
        let productImagePayload = undefined;
        if (productForm.image && productForm.image.startsWith('data:')) {
          const match = productForm.image.match(/^data:(image\/[a-zA-Z+-]+);base64,(.+)$/);
          if (match) {
            productImagePayload = {
              mimeType: match[1],
              data: match[2]
            };
          }
        }

        const response = await fetch('/api/seller-ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskType: 'suggest_description',
            product: {
              name: productForm.name,
              category: productForm.category,
              categoryLabel: productForm.categoryLabel,
              description: productForm.description
            },
            seller: currentSeller,
            productImage: productImagePayload
          })
        });

        const data = await response.json();
        if (data.success && data.text) {
          const cleanText = data.text.trim();
          if (cleanText.length >= 150) {
            successText = cleanText;
          } else if (attempts === maxAttempts) {
            successText = cleanText;
          }
        }
      } catch (err) {
        console.warn('AI Suggest Description error:', err);
      }
    }

    setIsAiGeneratingDesc(false);

    if (successText) {
      setProductForm(prev => ({ ...prev, description: successText }));
    } else {
      setAiDescError('AI generation failed or produced a description under 150 characters. Please provide more details and try again.');
    }
  };

  // Product CRUD Handlers
  const handleOpenAddProductModal = () => {
    setEditingProductId(null);
    setImagePreviewUrl('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800');
    setImageUploadError(null);
    setAiDescError(null);
    setProductForm({
      name: '',
      category: 'ceramics',
      categoryLabel: 'Handmade Ceramics',
      priceZAR: 450,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
      description: '',
      featuresStr: 'Handcrafted, Small batch, Local clay',
      dispatchTime: '24–48 hours',
      courierPartner: 'The Courier Guy'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    const existingImg = prod.images[0] || '';
    setImagePreviewUrl(existingImg);
    setImageUploadError(null);
    setAiDescError(null);
    setProductForm({
      name: prod.name,
      category: prod.category,
      categoryLabel: prod.categoryLabel,
      priceZAR: prod.priceZAR,
      stock: prod.stock,
      image: existingImg,
      description: prod.description,
      featuresStr: prod.features.join(', '),
      dispatchTime: prod.dispatchTime,
      courierPartner: prod.courierPartner
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Product name is required');
      return;
    }
    if (productForm.priceZAR <= 0) {
      alert('Price must be greater than zero');
      return;
    }
    if (productForm.stock < 0) {
      alert('Stock cannot be negative');
      return;
    }

    const featuresList = productForm.featuresStr.split(',').map(f => f.trim()).filter(Boolean);

    if (editingProductId) {
      const existing = products.find(p => p.id === editingProductId);
      if (existing && onUpdateProduct) {
        const updated: Product = {
          ...existing,
          name: productForm.name.trim(),
          category: productForm.category,
          categoryLabel: productForm.categoryLabel,
          priceZAR: Number(productForm.priceZAR),
          stock: Number(productForm.stock),
          images: [productForm.image.trim() || existing.images[0]],
          description: productForm.description.trim(),
          features: featuresList.length > 0 ? featuresList : existing.features,
          dispatchTime: productForm.dispatchTime,
          courierPartner: productForm.courierPartner
        };
        onUpdateProduct(updated);
      }
    } else {
      if (onAddProduct) {
        const newProd: Product = {
          id: `prod-${Date.now()}`,
          sellerId: currentSeller.id,
          sellerName: currentSeller.name,
          sellerLocation: `${currentSeller.city}, ${currentSeller.province}`,
          name: productForm.name.trim(),
          category: productForm.category,
          categoryLabel: productForm.categoryLabel,
          priceZAR: Number(productForm.priceZAR),
          originalPriceZAR: Math.round(productForm.priceZAR * 1.15),
          stock: Number(productForm.stock),
          dispatchTime: productForm.dispatchTime,
          courierPartner: productForm.courierPartner,
          images: [productForm.image.trim() || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800'],
          description: productForm.description.trim(),
          features: featuresList.length > 0 ? featuresList : ['Handcrafted', 'Local artisan studio'],
          rating: 5.0,
          reviewCount: 1
        };
        onAddProduct(newProd);
      }
    }

    setIsProductModalOpen(false);
  };

  const handleAdjustStock = (prod: Product, delta: number) => {
    if (onUpdateProduct) {
      const newStock = Math.max(0, prod.stock + delta);
      onUpdateProduct({ ...prod, stock: newStock });
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-6 w-full min-w-0 overflow-x-hidden">
      
      {/* Desktop Dashboard View */}
      <div className="hidden md:block w-full min-w-0 space-y-6">
        {/* Top Banner and Navigation */}
        <div className="flex flex-col gap-4 pb-4 border-b border-[#212633] w-full min-w-0">
          <div className="flex items-center gap-3 w-full min-w-0">
            <button
              onClick={onBackToShopping}
              className="p-2 rounded-xl bg-[#14171f] text-slate-300 hover:text-white border border-[#212633] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-[#0066ff]/20 text-[#60a5fa] border border-[#0066ff]/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-[#0066ff]" />
                  Seller Studio
                </span>
                <span className="text-xs text-slate-400 font-mono truncate">
                  AI Selling Assistant & Inventory
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-1 break-words">
                Store Management & Co-Pilot
              </h1>
            </div>
          </div>

          {/* Managing Selector on a separate row underneath */}
          <div className="flex items-center gap-2 bg-[#14171f] p-2.5 rounded-xl border border-[#212633] w-full sm:w-fit min-w-0">
            <Store className="w-4 h-4 text-[#0066ff] ml-1 shrink-0" />
            <span className="text-xs text-slate-400 shrink-0">Managing:</span>
            <select
              value={currentSeller.id}
              onChange={(e) => onSelectSeller(e.target.value)}
              className="bg-[#0c0e12] border border-[#212633] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0066ff] w-full sm:w-auto truncate"
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
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 w-full min-w-0">
            <Check className="w-4 h-4 shrink-0" />
            <span className="break-words">{appliedNotification}</span>
          </div>
        )}

        {/* Mandatory Transparency & Governance Banner & Launch Live Host Mode */}
        <div className="p-4 rounded-2xl bg-[#14171f] border border-[#212633] flex flex-col gap-4 w-full min-w-0">
          <div className="flex items-start gap-2.5 w-full min-w-0">
            <AlertCircle className="w-4 h-4 text-[#0066ff] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-white block">Seller Responsibility & Transparency Notice:</span>
              <span className="text-slate-400 leading-relaxed text-xs block break-words mt-0.5">
                “AI-generated content is for guidance and inspiration only. Review all suggestions for accuracy before using them. You are responsible for the claims you make about your products.”
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#212633] w-full min-w-0">
            {onOpenLiveHostMode && currentSeller.currentLiveSessionId ? (
              <button
                onClick={() => onOpenLiveHostMode(currentSeller.currentLiveSessionId!)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Launch Live Host Mode</span>
              </button>
            ) : (
              <div />
            )}
            <div className="bg-[#0c0e12] px-3 py-2 rounded-xl text-[11px] text-slate-400 font-mono border border-[#212633] text-center sm:text-right shrink-0">
              Gemini 3.1 Flash Lite
            </div>
          </div>
        </div>

        {/* Main 4 Functional Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 -mx-2 sm:mx-0 px-2 sm:px-0 w-full min-w-0">
          <button
            onClick={() => setActiveTab('prep')}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
              activeTab === 'prep'
                ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
                : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Prep</span>
          </button>

          <button
            onClick={() => setActiveTab('copy')}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
              activeTab === 'copy'
                ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
                : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>

          <button
            onClick={() => setActiveTab('snippet')}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
              activeTab === 'snippet'
                ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
                : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Snippets</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
              activeTab === 'inventory'
                ? 'bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/20'
                : 'bg-[#14171f] text-slate-400 hover:text-white border border-[#212633]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory ({sellerProducts.length})</span>
          </button>
        </div>

        {/* TAB A: BEFORE GOING LIVE */}
        {activeTab === 'prep' && (
          <div className="flex flex-col w-full min-w-0 gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-5 w-full min-w-0">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500" />
                Select Product for Live Broadcast
              </h2>

              <div className="space-y-1.5 w-full min-w-0">
                <label className="text-xs text-slate-400 font-medium">Choose from your store's inventory:</label>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-none w-full">
                  {sellerProducts.map((p) => {
                    const isSelected = selectedProductId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProductId(p.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all w-full min-w-0 ${
                          isSelected
                            ? 'bg-[#0066ff]/15 border-[#0066ff] text-white'
                            : 'bg-[#0c0e12] border-[#212633] text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#212633] shrink-0 bg-black"
                        />
                        <span className="text-xs font-bold truncate flex-1">{p.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleGeneratePrep}
                disabled={isGenerating || !selectedProduct}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-[#0066ff] hover:bg-[#0052cc] text-white flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Livestream Prep Pack</span>
              </button>
            </div>

            <div className="w-full min-w-0 space-y-6">
              {prepResults.openingHook ? (
                <div className="space-y-5 w-full min-w-0">
                  <div className="p-5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-2 w-full min-w-0">
                    <span className="text-xs font-bold text-[#0066ff] uppercase">1. Opening Hook</span>
                    <textarea
                      rows={3}
                      value={prepResults.openingHook}
                      onChange={(e) => setPrepResults({ ...prepResults, openingHook: e.target.value })}
                      className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-2xl bg-[#14171f] border border-[#212633] text-center space-y-4 w-full min-w-0">
                  <Radio className="w-8 h-8 text-[#0066ff] mx-auto" />
                  <h3 className="text-base font-bold text-white">Live Broadcast Prep Assistant</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB B: DESCRIPTIONS & CAPTIONS */}
        {activeTab === 'copy' && (
          <div className="flex flex-col w-full min-w-0 gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-[#14171f] border border-[#212633] space-y-5 w-full min-w-0">
              <h2 className="text-sm font-bold text-white">Select Product to Enhance Copy</h2>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-none w-full">
                {sellerProducts.map((p) => {
                  const isSelected = selectedProductId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all w-full min-w-0 ${
                        isSelected
                          ? 'bg-[#0066ff]/15 border-[#0066ff] text-white'
                          : 'bg-[#0c0e12] border-[#212633] text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#212633] shrink-0 bg-black"
                      />
                      <span className="text-xs font-bold truncate flex-1">{p.name}</span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleGenerateCopy}
                disabled={isGenerating || !selectedProduct}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-[#0066ff] hover:bg-[#0052cc] text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Description & Captions</span>
              </button>
            </div>

            <div className="w-full min-w-0 space-y-6">
              {copyResults.improvedDescription ? (
                <div className="p-5 rounded-2xl bg-[#14171f] border border-[#212633] space-y-3 w-full min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#0066ff]">Enhanced Description</span>
                    <button onClick={handleApplyDescription} className="px-2.5 py-1 bg-emerald-700 text-white text-[11px] rounded-lg cursor-pointer">Apply to Store</button>
                  </div>
                  <textarea
                    rows={6}
                    value={copyResults.improvedDescription}
                    onChange={(e) => setCopyResults({ ...copyResults, improvedDescription: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-xs text-white"
                  />
                </div>
              ) : (
                <div className="p-12 rounded-2xl bg-[#14171f] border border-[#212633] text-center w-full min-w-0">
                  <p className="text-xs text-slate-400">Generate copy to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB C: SNIPPETS & ARCHIVE */}
        {activeTab === 'snippet' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Manage Snippets</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSnippetViewMode('active')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${snippetViewMode === 'active' ? 'bg-[#1e2330] text-white' : 'text-slate-400'}`}
                >Active</button>
                <button 
                  onClick={() => setSnippetViewMode('archive')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${snippetViewMode === 'archive' ? 'bg-[#1e2330] text-white' : 'text-slate-400'}`}
                >Archive</button>
              </div>
            </div>
            <div className="space-y-3">
              {(snippetViewMode === 'active' ? activeSellerSnippets : archivedSellerSnippets).map(snippet => (
                <div key={snippet.id} className="p-4 bg-[#14171f] rounded-2xl border border-[#212633] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={snippet.thumbnail} alt={snippet.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{snippet.title}</h4>
                      <p className="text-[10px] text-slate-400">{getTimeRemaining(snippet.expiresAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!snippet.isArchived && onArchiveSnippet && (
                      <button onClick={() => onArchiveSnippet(snippet.id)} className="p-2 bg-[#1e2330] rounded-lg text-slate-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB D: STORE INVENTORY & PRODUCTS MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#14171f] rounded-2xl border border-[#212633]">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0066ff]" />
                  Store Inventory Management ({sellerProducts.length} items)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add new products, adjust stock levels, update pricing, and manage listings for {currentSeller.name}.
                </p>
              </div>
              <button
                onClick={handleOpenAddProductModal}
                className="px-4 py-2.5 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#0066ff]/30 cursor-pointer active:scale-95 transition-transform shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {sellerProducts.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#14171f] border border-[#212633] text-center space-y-3">
                <Package className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Products in Store Inventory</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sellerProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-[#14171f] rounded-2xl border border-[#212633] p-4 flex flex-col justify-between space-y-4 shadow-lg group hover:border-[#0066ff]/50 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-16 h-16 rounded-xl object-cover border border-[#212633] shrink-0 bg-black"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-[#0066ff] font-bold uppercase tracking-wider block">
                            {prod.categoryLabel || prod.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold font-mono text-emerald-400">
                              R {prod.priceZAR.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1e2330]">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          prod.stock > 0 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-red-950 text-red-400 border border-red-500/30'
                        }`}>
                          {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#212633]">
                      <div className="flex items-center justify-between bg-[#0c0e12] p-2 rounded-xl border border-[#212633]">
                        <span className="text-[11px] text-slate-400 font-medium">Manage Stock:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(prod, -1)}
                            className="w-7 h-7 rounded-lg bg-[#181c25] text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-white">
                            {prod.stock}
                          </span>
                          <button
                            onClick={() => handleAdjustStock(prod, 1)}
                            className="w-7 h-7 rounded-lg bg-[#181c25] text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="py-2 px-3 rounded-xl bg-[#1e2430] hover:bg-[#283244] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#0066ff]" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete "${prod.name}" from inventory?`)) {
                              if (onDeleteProduct) onDeleteProduct(prod.id);
                            }
                          }}
                          className="py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Add / Edit Product Modal with Image Upload & AI Suggest Description */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171f] border border-[#212633] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#212633]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0066ff] flex items-center justify-center text-white font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingProductId ? 'Edit Product Listing' : 'Add New Product to Store'}
                  </h3>
                  <p className="text-xs text-slate-400">{currentSeller.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1e2330] hover:bg-[#283042] text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handmade Stoneware Coffee Mug"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-white focus:outline-none focus:border-[#0066ff]"
                />
              </div>

              {/* Native Image Upload File Input & Preview */}
              <div className="space-y-2 pt-1">
                <label className="font-semibold text-slate-300 block flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#0066ff]" />
                  Product Image (Upload from Device or Camera)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-[#0c0e12] border border-[#212633]">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Product Preview"
                      className="w-20 h-20 rounded-xl object-cover border border-[#212633] bg-black shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-[#14171f] border border-[#212633] flex items-center justify-center text-slate-500 shrink-0">
                      <Upload className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1e2330] file:text-white hover:file:bg-[#283042] file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400">
                      Supports JPEG, PNG, WebP up to 5MB. Converted to base64 for reliable persistent storage.
                    </p>
                    {imageUploadError && (
                      <p className="text-[11px] text-red-400 font-semibold">{imageUploadError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 block">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as Category;
                      const labels: Record<string, string> = {
                        beauty: 'Natural Beauty & Fynbos',
                        streetwear: 'Urban Streetwear',
                        leather: 'Handcrafted Leather',
                        ceramics: 'Handmade Ceramics',
                        pantry: 'Artisan Pantry & Food'
                      };
                      setProductForm({ ...productForm, category: cat, categoryLabel: labels[cat] || 'Artisan Craft' });
                    }}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-white focus:outline-none focus:border-[#0066ff]"
                  >
                    <option value="ceramics">Handmade Ceramics</option>
                    <option value="leather">Handcrafted Leather</option>
                    <option value="beauty">Natural Beauty & Fynbos</option>
                    <option value="streetwear">Urban Streetwear</option>
                    <option value="pantry">Artisan Pantry & Food</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 block">Price (ZAR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productForm.priceZAR}
                    onChange={(e) => setProductForm({ ...productForm, priceZAR: Number(e.target.value) })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#0066ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 block">Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#0066ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 block">Dispatch Time</label>
                  <input
                    type="text"
                    value={productForm.dispatchTime}
                    onChange={(e) => setProductForm({ ...productForm, dispatchTime: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-white focus:outline-none focus:border-[#0066ff]"
                  />
                </div>
              </div>

              {/* Description with AI Suggest Description Button */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 block">Description * (Min 150 chars)</label>
                  <button
                    type="button"
                    onClick={handleAiSuggestDescription}
                    disabled={isAiGeneratingDesc}
                    className="px-3 py-1.5 rounded-lg bg-[#0066ff]/20 hover:bg-[#0066ff]/30 text-[#60a5fa] border border-[#0066ff]/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                    title="Generate professional retail description using Gemini AI & image analysis"
                  >
                    {isAiGeneratingDesc ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analysing Image & Drafting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#0066ff]" />
                        <span>✨ AI Suggest Description</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={4}
                  required
                  placeholder="Describe materials, origin, and craftsmanship in detail..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-white focus:outline-none focus:border-[#0066ff] leading-relaxed"
                />
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`${productForm.description.length < 150 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {productForm.description.length} / 150 characters minimum
                  </span>
                  {aiDescError && (
                    <span className="text-red-400 font-semibold">{aiDescError}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Key Features (comma separated)</label>
                <input
                  type="text"
                  placeholder="Lead-free glaze, Dishwasher safe, Hand-thrown"
                  value={productForm.featuresStr}
                  onChange={(e) => setProductForm({ ...productForm, featuresStr: e.target.value })}
                  className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl p-3 text-white focus:outline-none focus:border-[#0066ff]"
                />
              </div>

              <div className="pt-4 border-t border-[#212633] flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#1e2330] hover:bg-[#283042] text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold transition-colors cursor-pointer shadow-lg shadow-[#0066ff]/30"
                >
                  {editingProductId ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Mobile Seller Studio View */}
      <div className="md:hidden w-full min-w-0 space-y-4">
        <MobileSellerStudio 
          seller={currentSeller}
          products={sellerProducts}
          snippets={sellerSnippets}
          onOpenLiveHostMode={onOpenLiveHostMode!}
          onUpdateProduct={onUpdateProduct!}
          onArchiveSnippet={onArchiveSnippet!}
        />
      </div>

    </div>
  );
};
