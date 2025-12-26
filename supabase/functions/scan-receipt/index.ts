import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Import the official SDK via NPM specifier
import * as mindee from "npm:mindee@4" 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()
    if (!image) throw new Error('No image provided');

    // 1. Initialize Mindee Client
    // It automatically reads 'MINDEE_API_KEY' from Deno.env
    const mindeeClient = new mindee.Client({
      apiKey: Deno.env.get('MINDEE_API_KEY')
    });

    // 2. Prepare the File
    // Convert Base64 back to a buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Load the document (Mindee SDK accepts Buffer/Uint8Array)
    const inputSource = mindeeClient.docFromBuffer(bytes, "receipt.jpg");

    // 3. Parse the Receipt (Using the specific API product)
    const apiResponse = await mindeeClient.parse(
      mindee.product.ReceiptV5,
      inputSource
    );

    // 4. Extract Items
    // The SDK gives us a clean object structure
    const prediction = apiResponse.document.inference.prediction;
    const lineItems = prediction.lineItems || [];

    const cleanItems = lineItems.map((item: any) => ({
      name: item.description || "Item",
      price: item.totalAmount || 0
    })).filter((i: any) => i.price > 0);

    return new Response(JSON.stringify({ items: cleanItems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Scanning Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Scan failed" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})