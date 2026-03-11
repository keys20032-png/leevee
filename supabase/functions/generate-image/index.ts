import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Blocked keyword categories for prompt safety
const BLOCKED_PATTERNS = [
  // Violence / gore
  /\b(gore|gory|dismember|mutilat|decapitat|bloodbath|massacre|torture|brutally?\s+kill|graphic\s+violence)\b/i,
  // Explicit / sexual content
  /\b(nude|naked|nsfw|pornograph|explicit\s+sex|hentai|erotic|genitali?a|sexual\s+act)\b/i,
  // Self-harm / suicide imagery
  /\b(self[- ]?harm|cutting\s+(myself|wrist)|slit\s+wrist|hanging\s+(myself|yourself)|suicid(e|al)\s+image)\b/i,
  // Hate symbols / extremism
  /\b(swastika|nazi|white\s+supremac|kkk|hate\s+symbol|extremist|terrorist\s+attack)\b/i,
  // Child exploitation (absolute block)
  /\b(child\s+porn|cp\b|minor\s+nude|underage\s+sex|pedophil)\b/i,
  // Drug manufacturing
  /\b(meth\s+lab|cook(ing)?\s+meth|drug\s+manufactur|how\s+to\s+make\s+(drugs|meth|crack))\b/i,
  // Weapons of mass destruction
  /\b(bomb\s+making|build\s+a\s+bomb|bioweapon|chemical\s+weapon)\b/i,
];

function isPromptUnsafe(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(lower)) {
      return "This prompt contains content that violates our safety guidelines. Please try a different description.";
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, sourceImage } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: "A prompt is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Safety check: block harmful prompts before calling the AI
    const safetyBlock = isPromptUnsafe(prompt);
    if (safetyBlock) {
      return new Response(JSON.stringify({ error: safetyBlock, safety: true }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // AI-powered safety check for nuanced/borderline prompts
    const moderationResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "user",
            content: `You are a content safety classifier. Analyze this image generation prompt and reply ONLY with "SAFE" or "UNSAFE: [brief reason]". Block prompts requesting: nudity, sexual content, graphic violence, gore, self-harm, hate symbols, child exploitation, weapons/bomb making, drug manufacturing, or realistic depictions of real public figures in compromising situations. Be strict but allow fantasy/artistic content that isn't explicit.\n\nPrompt: "${prompt.trim()}"`,
          },
        ],
      }),
    });

    if (moderationResp.ok) {
      const modData = await moderationResp.json();
      const modResult = modData.choices?.[0]?.message?.content || "";
      if (modResult.toUpperCase().startsWith("UNSAFE")) {
        const reason = modResult.slice(7).trim() || "This content violates our safety guidelines.";
        return new Response(JSON.stringify({ error: reason, safety: true }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Build message content: text-only for generation, multimodal for editing
    const safePrompt = sourceImage
      ? prompt.trim()
      : `Create a safe, appropriate image: ${prompt.trim()}. Do not include any violent, explicit, hateful, or harmful content.`;

    const userContent = sourceImage
      ? [
          { type: "text", text: safePrompt },
          { type: "image_url", image_url: { url: sourceImage } },
        ]
      : safePrompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Image generation failed." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const text = message?.content || "";
    const images = message?.images?.map((img: { image_url: { url: string } }) => img.image_url.url) || [];

    return new Response(JSON.stringify({ text, images }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});