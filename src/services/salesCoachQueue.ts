import { Product, Seller, LivePromotion, SalesCoachPrompt } from '../types';

export function getActivePromotionForProduct(
  productId: string,
  promotions: LivePromotion[]
): LivePromotion | null {
  const now = Date.now();
  return (
    promotions.find(
      (p) =>
        p.productId === productId &&
        p.isActive &&
        new Date(p.expiresAt).getTime() > now
    ) || null
  );
}

export function buildSalesCoachQueue(
  product: Product,
  seller: Seller,
  promotions: LivePromotion[]
): SalesCoachPrompt[] {
  const prompts: SalesCoachPrompt[] = [];

  // 1. Welcome & Introduction
  prompts.push({
    id: `prompt-welcome-${product.id}`,
    category: 'welcome',
    categoryLabel: 'Welcome & Introduction',
    title: 'Welcome Viewers & Introduce Product',
    body: `Sawubona and welcome into the studio! Today I'm showcasing our ${product.name}, handcrafted in our ${seller.city} workshop.`,
    guidanceTip: 'Smile warmly, look directly into the camera lens, and hold the product up at chest height.',
    sourceContext: `Seller: ${seller.name} (${seller.city}), Product: ${product.name}`,
    priority: 'normal',
    productId: product.id
  });

  // 2. Demonstration of Verified Features
  const featuresList = product.features && product.features.length > 0 
    ? product.features 
    : ['Authentic artisanal South African design'];
  
  const featureHighlight = featuresList.slice(0, 2).join('; and ');

  prompts.push({
    id: `prompt-demo-${product.id}`,
    category: 'demo',
    categoryLabel: 'Demonstration',
    title: 'Demonstrate Listing Features',
    body: `Let me show you the build up close. Key details: ${featureHighlight}. Notice the authentic finish and quality weight.`,
    guidanceTip: 'Hold the item 25cm from camera lens and tilt slowly so studio lighting catches the texture.',
    sourceContext: `Verified listing features: ${featuresList.slice(0, 2).join(', ')}`,
    priority: 'normal',
    productId: product.id
  });

  // 3. Viewer Engagement
  prompts.push({
    id: `prompt-engage-${product.id}`,
    category: 'engagement',
    categoryLabel: 'Viewer Engagement',
    title: 'Ask Viewers a Live Question',
    body: `Drop a comment in the chat: Which province are you watching from, and what questions do you have about this piece?`,
    guidanceTip: 'Glance at the live comments below and call out shoppers by name (e.g., Zandi, Lungile) when answering.',
    sourceContext: `Real-time chat interaction prompt for ${product.name}`,
    priority: 'normal',
    productId: product.id
  });

  // 4. Active Promotion (STRICTLY ONLY IF ACTIVE PROMOTION RECORD EXISTS AND HAS NOT EXPIRED)
  const activePromo = getActivePromotionForProduct(product.id, promotions);
  if (activePromo) {
    const expiryDate = new Date(activePromo.expiresAt);
    const timeString = expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const hoursLeft = Math.max(0, Math.round((expiryDate.getTime() - Date.now()) / 3600000));
    
    prompts.push({
      id: `prompt-promo-${activePromo.id}`,
      category: 'promotion',
      categoryLabel: 'Verified Active Promotion',
      title: 'Explain Active Promotion Terms',
      body: `We have a live broadcast special: ${activePromo.title}. Terms: ${activePromo.terms}${activePromo.promoPriceZAR ? ` (Special Price: R ${activePromo.promoPriceZAR.toLocaleString()})` : ''}. Valid until ${timeString}${hoursLeft > 0 ? ` (~${hoursLeft}h left)` : ''}!`,
      guidanceTip: 'Reassure shoppers that this verified promotion is automatically honored during today’s session.',
      sourceContext: `Verified Promotion #${activePromo.id}: "${activePromo.title}", Expires at ${timeString}`,
      priority: 'urgent',
      productId: product.id
    });
  }

  // 5. Stock Level Reminder (Accurate, dynamic reflection of current app stock)
  let stockMessage = '';
  let stockUrgency: 'normal' | 'urgent' = 'normal';

  if (product.stock <= 0) {
    stockMessage = `Quick notice for viewers: This batch of ${product.name} is now completely sold out! Thank you to everyone who ordered.`;
    stockUrgency = 'urgent';
  } else if (product.stock <= 3) {
    stockMessage = `Attention shoppers: We only have ${product.stock} units left in stock today! Once sold, the next batch takes weeks to handcraft.`;
    stockUrgency = 'urgent';
  } else {
    stockMessage = `We currently have ${product.stock} units available in this batch, dispatched in ${product.dispatchTime} via ${product.courierPartner}.`;
  }

  prompts.push({
    id: `prompt-stock-${product.id}-${product.stock}`,
    category: 'stock',
    categoryLabel: product.stock <= 3 ? 'Urgent Stock Alert' : 'Live Inventory Status',
    title: 'Share Current Stock Status',
    body: stockMessage,
    guidanceTip: 'Be transparent and calm on camera—genuine scarcity helps shoppers make confident decisions.',
    sourceContext: `Current verified inventory: ${product.stock} units available`,
    priority: stockUrgency,
    productId: product.id
  });

  // 6. Call to Action (Direct to Card & Buy Now)
  prompts.push({
    id: `prompt-cta-${product.id}`,
    category: 'cta',
    categoryLabel: 'Call to Action',
    title: 'Direct Viewers to Pinned Product Card',
    body: `Tap the pinned card right below this video to click 'Buy Now' or 'Add to Basket' for R ${product.priceZAR.toLocaleString()}. Nationwide courier is ready to dispatch.`,
    guidanceTip: 'Gesture downward with your hand toward the bottom of the screen to guide viewer taps.',
    sourceContext: `Verified price: R ${product.priceZAR.toLocaleString()}, Dispatch: ${product.dispatchTime}`,
    priority: 'normal',
    productId: product.id
  });

  // 7. Close & Transition
  prompts.push({
    id: `prompt-close-${product.id}`,
    category: 'close',
    categoryLabel: 'Wrap-up & Transition',
    title: 'Close Product & Move to Next Item',
    body: `Thank you for the love on the ${product.name}! Keep your orders coming in the basket, and let's move on to our next creation.`,
    guidanceTip: 'Take a sip of water, thank viewers in chat, and prepare the next item on your demonstration desk.',
    sourceContext: `End of showcase for ${product.name}`,
    priority: 'normal',
    productId: product.id
  });

  return prompts;
}
