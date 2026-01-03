import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS (Browser pre-flight checks)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()
    if (!image) throw new Error('No image provided');

    const apiKey = Deno.env.get('MINDEE_API_KEY');
    
    // Debug Log: Check if key exists and length (Don't log the full key for security)
    console.log(`[DEBUG] API Key present: ${!!apiKey}`);
    if (apiKey) console.log(`[DEBUG] API Key length: ${apiKey.length}`);

    if (!apiKey) throw new Error('Missing MINDEE_API_KEY secret');

    // 3. Prepare Binary Data
    const base64Clean = image.includes(',') ? image.split(',')[1] : image;
    const binaryStr = atob(base64Clean);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });

    // 4. Construct FormData
    const formData = new FormData();
    formData.append('document', blob, 'receipt.jpg');

    console.log("[DEBUG] Sending request to Mindee...");
    
    const response = await fetch('https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey.trim()}`, // .trim() removes accidental spaces!
      },
      body: formData,
    });

    const data = await response.json();

    // 6. Handle Errors
    if (!response.ok) {
      console.error("[ERROR] Mindee Response:", JSON.stringify(data));
      throw new Error(`Mindee API: ${data.api_request?.error?.message || response.statusText}`);
    }

    const prediction = data.document?.inference?.prediction;
    const lineItems = prediction?.line_items || [];

    const cleanItems = lineItems.map((item: any) => ({
      name: item.description || "Item",
      price: item.total_amount || 0
    })).filter((i: any) => i.price > 0);

    console.log(`[DEBUG] Found ${cleanItems.length} items.`);

    return new Response(JSON.stringify({ items: cleanItems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("[CRITICAL ERROR]:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})