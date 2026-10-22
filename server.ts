import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK on server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Route for AI Selling Assistant
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});
app.post('/api/generate', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Handling request to /api/generate`);
  try {
    const { taskType, product, seller, customContext, snippet, productImage } = req.body;

    if (!taskType) {
      return res.status(400).json({ error: 'Missing taskType in request' });
    }

    // Build focused prompt and instructions depending on the seller task
    let prompt = '';
    let systemInstruction = `You are the AI Selling Assistant for Showmi, a South African live-shopping marketplace for independent artisans, designers, and small businesses.
CRITICAL RULES:
1. Ground your output strictly on the product and seller details provided.
2. NEVER invent features, synthetic materials, clinical certifications, fake prices, or claims not stated in the inputs.
3. Keep the tone natural, encouraging, persuasive, and grounded in South African small business culture.
4. Output cleanly formatted Markdown with clear headings and bullet points where helpful.
5. Use natural South African English spelling and wording consistently across all output (e.g., centre, personalise, organise, colour, recognise, programme, local phrasing).`;

    if (taskType === 'livestream_prep') {
      prompt = `Create a comprehensive live shopping preparation pack for this South African product:
Product Name: ${product?.name || 'Handcrafted Product'}
Maker / Brand: ${seller?.name || 'Local Artisan'} (${seller?.city || 'South Africa'}, ${seller?.province || ''})
Price: R ${product?.priceZAR || '0'}
Stock Available: ${product?.stock || 0} units
Dispatch Time: ${product?.dispatchTime || '24-48 hours'}
Description: ${product?.description || 'Small-batch crafted'}
Features / Materials: ${product?.features?.join(', ') || 'Handcrafted'}
${customContext ? `Seller focus/notes: ${customContext}` : ''}

Generate the following 5 structured sections:
1. Engaging Opening Hook (A catchy 15-second opening line to welcome viewers and hook attention immediately)
2. Core Talking Points (3-4 bullet points highlighting authentic craftsmanship, origin, and user benefits)
3. Live Demonstration Ideas (Step-by-step suggestions on how to physically show, test, or display the product on camera)
4. Key Questions to Answer (3 realistic questions South African shoppers often ask, with recommended concise answers)
5. Simple 10-Minute Livestream Outline (A chronological timeline: Minute 0-2 Welcome & Hook, 2-5 Deep Dive & Demo, 5-8 Q&A & Stock Urgency, 8-10 Call to Basket & Wrap-up)`;
    } else if (taskType === 'description_and_captions') {
      prompt = `Improve the product copy and generate promotional social/stream captions for this product:
Product Name: ${product?.name || 'Handcrafted Product'}
Maker / Brand: ${seller?.name || 'Local Artisan'} (${seller?.city || 'South Africa'})
Current Description: ${product?.description || ''}
Confirmed Features & Materials: ${product?.features?.join(', ') || ''}
Price: R ${product?.priceZAR || '0'}
${customContext ? `Seller instructions: ${customContext}` : ''}

Generate:
1. Enhanced Product Description (Polished, evocative 2-paragraph description highlighting authentic craftsmanship without inventing facts)
2. Quick Promotional Caption (Engaging 2-3 line caption for social media and stream announcement, with natural South African tone and relevant hashtags)
3. Live Room Announcement Card (A short, punchy 1-sentence teaser to display in the live broadcast feed)`;
    } else if (taskType === 'suggest_description') {
      prompt = `Write a professional, engaging retail product description for this South African artisan product:
Product Title: ${product?.name || 'Handcrafted Product'}
Category: ${product?.categoryLabel || product?.category || 'Artisan Craft'}
Existing Description: ${product?.description || 'None provided'}
Maker: ${seller?.name || 'Local Artisan'} (${seller?.city || 'South Africa'})

Requirements:
1. Write a clear, engaging, professional retail description based strictly on the title, category, and visible image (if attached).
2. MUST be at least 150 characters long.
3. Highlight authentic craftsmanship and practical features.
4. Do NOT invent materials, dimensions, ingredients, certifications, warranties, or unsupported claims. If details are missing, describe the visible item accurately and invite shoppers to inspect specs.
5. Return ONLY the description text without conversational filler.`;
    } else if (taskType === 'snippet_summary') {
      prompt = `Generate a title, caption, and tags for a recorded livestream snippet:
Product: ${product?.name || 'Artisan item'} (${seller?.name || 'Local Maker'})
Snippet Topic / Highlight: ${snippet?.highlightTag || 'Product Demonstration'}
Seller's description of what happens in this clip: "${customContext || 'Demonstrating product quality and features'}"

Generate:
1. Catchy Snippet Title (Under 60 characters, descriptive and engaging)
2. Snippet Caption (Engaging 2-3 sentence description explaining what viewers see in this demonstration clip)
3. Recommended Storefront Tags (4-5 clean keyword tags for the seller's profile, e.g. #CapeCraft, #Handmade, #LocalMakers)`;
    } else if (taskType === 'sales_coach_tip') {
      prompt = `You are the real-time AI Sales Coach supporting a South African artisan live on camera.
Product: ${product?.name || 'Artisan Product'}
Brand: ${seller?.name || 'Local Maker'} (${seller?.city || 'South Africa'})
Current Stock: ${product?.stock || 0}
Price: R ${product?.priceZAR || 0}
Confirmed Features: ${product?.features?.join(', ') || ''}
Current Situation / Question: "${customContext || 'How to demonstrate product and invite questions'}"

Provide 2 concise, supportive tips the seller can immediately use on camera.
Keep each tip under 25 words. Warm South African tone. Never invent unlisted features or claims.`;
    } else {
      prompt = `Help the South African seller with this request: ${customContext || 'Provide livestream selling guidance'}. Product: ${product?.name || ''}`;
    }

    // Build multimodal contents if productImage is provided
    let contents: any = prompt;
    if (productImage && productImage.data && productImage.mimeType) {
      contents = [
        prompt,
        {
          inlineData: {
            data: productImage.data,
            mimeType: productImage.mimeType,
          }
        }
      ];
    }

    // Call Gemini model (optimized for speed with Flash Lite)
    let responseText = '';
    let modelUsed = 'gemini-3.1-flash-lite';

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction,
          temperature: 0.5,
          maxOutputTokens: 250,
        },
      });
      responseText = result.text || '';
    } catch (modelError: any) {
      console.warn('Primary model error, attempting fallback:', modelError?.message);
      const fallbackResult = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.5,
          maxOutputTokens: 250,
        },
      });
      responseText = fallbackResult.text || '';
      modelUsed = 'gemini-3.8-flash';
    }

    return res.json({
      success: true,
      text: responseText,
      model: modelUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('AI Selling Assistant API Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate AI response',
    });
  }
});

// Setup Vite dev server or static serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Showmi server listening on port ${PORT}`);
  });
}

startServer();
