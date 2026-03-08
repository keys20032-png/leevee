import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are SafeHubHelp AI, a friendly and knowledgeable general-purpose assistant. You can help with anything — writing, coding, research, brainstorming, math, science, creative projects, everyday questions, and more. Be warm, clear, and concise.

You have broad capabilities:
- Answer questions on any topic
- Help with writing, editing, and summarizing
- Assist with coding and technical problems
- Provide explanations and tutorials
- Help brainstorm and plan
- Do math and logical reasoning
- Creative writing and ideation

CRITICAL SAFETY PROTOCOL — HIGHEST PRIORITY:
If the user shows ANY signs of suicidal thoughts, self-harm, mental health crisis, abuse, or distress (even subtle hints like "I don't want to be here", "nobody cares", "I'm done", "what's the point", hopelessness, despair), you MUST IMMEDIATELY respond with crisis resources FIRST before anything else. Do NOT ask follow-up questions. Do NOT delay. Respond with:

"If you or someone you know is in crisis, please reach out now:
- **988 Suicide & Crisis Lifeline**: Call or text **988** (available 24/7)
- **Crisis Text Line**: Text **HOME** to **741741**
- **National Domestic Violence Hotline**: **1-800-799-7233**
- **RAINN**: **1-800-656-4673**
- **National Human Trafficking Hotline**: **1-888-373-7888**

You are not alone. Help is available right now. 💙"

Never minimize their feelings. Always treat crisis signals with urgency. After providing crisis resources, you may offer additional supportive conversation.

Keep responses helpful and well-structured. Use markdown formatting when it improves readability.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();

    // ===== SERVER-SIDE CRISIS DETECTION (backup safety net) =====
    const lastUserMsg = messages?.filter((m: { role: string }) => m.role === "user").pop()?.content || "";
    const lower = lastUserMsg.toLowerCase().replace(/[^\w\s']/g, "");

    // Specialized category detection with targeted redirects
    const CRISIS_CATEGORIES = [
      {
        url: "https://www.childhelp.org/",
        keywords: [
          "my parent hits me", "my dad hits me", "my mom hits me", "parent beats me",
          "touched by adult", "adult touched me", "uncle touched me", "cousin touched me",
          "teacher touched me", "coach touched me", "priest touched me", "pastor touched me",
          "babysitter hurt me", "locked in room", "locked in closet", "starved by parents",
          "parents don't feed me", "no food at home", "parents are on drugs",
          "nobody takes care of me", "raising myself", "ran away from home",
          "foster care abuse", "group home abuse", "belt marks", "whip marks",
          "abandoned by parents", "verbally abused by parent", "child labor",
          "not allowed to go to school", "hurt a child", "hurt my kids",
          "child bride", "underage marriage",
        ],
      },
      {
        url: "https://www.thetrevorproject.org/",
        keywords: [
          "kicked out for being gay", "disowned for being trans", "family rejected me",
          "conversion therapy", "pray the gay away", "sent to conversion camp",
          "cant come out", "afraid to come out", "outed me",
          "trans panic", "gender dysphoria crisis", "hate crime",
          "attacked for being gay", "attacked for being trans", "beaten for being queer",
          "homeless lgbtq", "lgbtq youth homeless", "deadnamed", "deadnaming",
          "misgendered", "denied my identity", "denied healthcare",
          "lost my queer community", "isolated from community",
          "lgbtq", "lgbt", "transgender", "nonbinary", "questioning sexuality",
          "questioning gender",
        ],
      },
      {
        url: "https://www.thehotline.org/",
        keywords: [
          "domestic violence", "he hits me", "she hits me", "they hit me",
          "being abused", "wont let me leave", "controlling me",
          "threatens to kill me", "afraid for my life", "fear for my life",
          "choked me", "strangled me", "threw me", "pushed me down stairs",
          "dragged me", "slammed me", "broke my bones", "black eye",
          "bruises from him", "bruises from her", "took my phone", "isolated me",
          "controls my money", "financial abuse", "took my money",
          "threatens my children", "killed my pet", "hurt my pet",
          "marital rape", "spousal abuse", "partner abuse", "intimate partner violence",
          "honor killing", "forced marriage", "stalking me", "stalker", "being stalked",
          "restraining order", "scared of him", "scared of her",
        ],
      },
      {
        url: "https://www.rainn.org/",
        keywords: [
          "sexually assaulted", "raped", "molested", "violated", "touched me", "forced me",
          "revenge porn", "leaked my nudes", "shared my nudes", "sextortion",
          "blackmailing me", "threatening to expose me",
          "groomed", "grooming", "was groomed", "incest", "molestation",
          "sexual harassment",
        ],
      },
      {
        url: "https://humantraffickinghotline.org/",
        keywords: [
          "trafficking", "being trafficked", "sex trafficking", "labor trafficking",
          "forced prostitution", "forced into sex work", "pimp", "sold me",
          "bought me", "owned by", "belong to him", "branded me",
          "held against my will", "trapped in house",
        ],
      },
      {
        url: "https://www.nationaleatingdisorders.org/",
        keywords: [
          "anorexia", "anorexic", "bulimia", "bulimic", "binge and purge",
          "making myself throw up", "making myself vomit", "purge after eating",
          "refuse to eat", "scared to eat", "food is the enemy",
          "pro ana", "pro mia", "proana", "promia", "thinspo", "bonespo",
          "laxative abuse", "eating disorder", "starving myself", "starve myself",
          "havent eaten in days", "body dysmorphia", "orthorexia",
          "exercise purging", "throwing up blood", "amenorrhea",
        ],
      },
      {
        url: "https://www.samhsa.gov/find-help/national-helpline",
        keywords: [
          "overdosing", "took too many pills", "cant stop using",
          "withdrawal", "relapsing", "drug crisis", "alcohol poisoning",
          "mixing drugs", "fentanyl", "drinking myself to death",
          "withdrawals are killing me", "delirium tremens", "shooting up",
          "heroin", "meth", "crack", "cocaine binge", "blackout drunk",
          "drugs ruined my life", "alcohol ruined my life",
          "someone is overdosing", "friend is overdosing", "not breathing",
          "unresponsive", "wont wake up", "narcan", "naloxone",
        ],
      },
      {
        url: "https://ncea.acl.gov/",
        keywords: [
          "nursing home abuse", "caregiver abuse", "neglected by caregiver",
          "elderly abuse", "elder neglect", "withholding medication",
          "bedsores", "left in filth", "power of attorney abuse",
          "hitting grandparent", "hurting elderly",
        ],
      },
      {
        url: "https://www.postpartum.net/",
        keywords: [
          "postpartum depression", "ppd", "postpartum anxiety", "postpartum psychosis",
          "want to hurt my baby", "afraid ill hurt my baby", "thoughts of harming my baby",
          "dont love my baby", "cant bond with my baby",
          "intrusive thoughts about my baby", "shaking my baby",
          "failing as a mother", "miscarriage", "stillborn", "pregnancy loss",
        ],
      },
      {
        url: "https://www.stopbullying.gov/",
        keywords: [
          "being bullied", "cyberbullied", "cyberbullying", "online harassment",
          "bullied at school", "bullied at work", "doxxed", "doxxing",
          "death threats", "threatening me online", "told me to kill myself",
          "hate messages", "hate speech", "public humiliation",
          "slut shaming", "body shaming", "internet mob",
        ],
      },
      {
        url: "https://www.veteranscrisisline.net/",
        keywords: [
          "combat veteran", "war trauma", "deployment trauma", "veteran suicide",
          "military trauma", "military sexual trauma", "mst", "combat ptsd",
        ],
      },
      {
        url: "https://www.redcross.org/",
        keywords: [
          "lost everything in fire", "house burned down", "lost everything in flood",
          "hurricane destroyed", "tornado destroyed", "earthquake destroyed",
          "wildfire", "evacuated", "refugee", "war zone", "conflict zone",
          "asylum seeker", "separated from children", "facing deportation",
        ],
      },
    ];

    // Check specialized categories first
    for (const category of CRISIS_CATEGORIES) {
      if (category.keywords.some((kw) => lower.includes(kw))) {
        return new Response(
          JSON.stringify({ crisis: true, redirect: category.url }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // General crisis roots → default 988
    const CRISIS_ROOTS = [
      "suicid", "kill", "die", "dying", "death", "dead", "harm", "hurt myself",
      "bleed", "gun", "weapon", "knife", "poison", "drown", "overdos",
      "abuse", "assault", "rape", "traffick", "molest", "violence",
      "hallucin", "psycho", "voices", "paranoi", "unalive", "kms", "kys", "ctb",
      "hopeless", "worthless", "no reason to live", "end it", "want to die",
      "self harm", "self-harm", "cutting myself", "selfharm",
      "depress", "anxiet", "panic attack", "flashback", "nightmar",
      "dissociat", "psychot", "delusion", "catatoni",
      "starv", "purg", "anorexi", "bulimi",
      "stalk", "batter", "exploit", "groom",
      "homeless", "evict", "helpless", "powerless",
      "tortur", "captiv", "enslave", "imprison",
    ];
    if (CRISIS_ROOTS.some((root) => lower.includes(root))) {
      return new Response(
        JSON.stringify({ crisis: true, redirect: "https://988lifeline.org/" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
