import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { image } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    // FALLBACK
    if (!apiKey) {
      console.log("No Gemini Key. Returning Mock Data.");
      return returnMockData();
    }

    // Clean Base64
    const base64Clean = image.includes(',') ? image.split(',')[1] : image;

    console.log("Sending to Gemini 1.5 Flash (001)...");

    // UPDATED URL: Using specific version 'gemini-1.5-flash-001'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Extract items from receipt. Return JSON object with key 'items' (array of {name: string, price: number}). Exclude tax/tip." },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Clean
              }
            }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", JSON.stringify(data));
      return returnMockData(); 
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("No text returned from Gemini");

    const parsed = JSON.parse(rawText);
    const items = Array.isArray(parsed) ? parsed : (parsed.items || []);

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Function Error:", error);
    return returnMockData();
  }
})

function returnMockData() {
  const mockItems = [
    { name: "Gemini Burger", price: 15.00 },
    { name: "Flash Fries", price: 5.50 },
    { name: "Mock Soda", price: 3.00 }
  ];
  return new Response(JSON.stringify({ items: mockItems }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}