import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Shared safety & inclusive language blocks ──

const SAFETY_PROTOCOL = `
CRITICAL SAFETY PROTOCOL — HIGHEST PRIORITY:
If the user shows ANY signs of suicidal thoughts, self-harm, mental health crisis, abuse, or distress (even subtle hints like "I don't want to be here", "nobody cares", "I'm done", "what's the point", hopelessness, despair), you MUST IMMEDIATELY respond with crisis resources FIRST before anything else. Do NOT ask follow-up questions. Do NOT delay. Respond with:

"If you or someone you know is in crisis, please reach out now:
- **988 Suicide & Crisis Lifeline**: Call or text **988** (available 24/7)
- **Crisis Text Line**: Text **HOME** to **741741**
- **National Domestic Violence Hotline**: **1-800-799-7233**
- **RAINN**: **1-800-656-4673**
- **National Human Trafficking Hotline**: **1-888-373-7888**

You are not alone. Help is available right now. 💙"

Never minimize their feelings. Always treat crisis signals with urgency. After providing crisis resources, you may offer additional supportive conversation.`;

const INCLUSIVE_GUIDELINES = `
INCLUSIVE LANGUAGE GUIDELINES — ALWAYS FOLLOW:
- Use gender-neutral language by default (e.g., "they/them" when gender is unknown, "people" instead of "men and women", "partner/spouse" instead of "husband/wife", "chairperson" instead of "chairman").
- Never assume someone's gender, race, ethnicity, sexual orientation, religion, ability, or socioeconomic status.
- Avoid stereotypes, generalizations, or assumptions about any group of people.
- Use person-first language when discussing disabilities (e.g., "person with a disability" not "disabled person"), unless the individual or community prefers identity-first language.
- Respect and use people's chosen names and pronouns when specified.
- Avoid culturally insensitive idioms, metaphors, or expressions that may marginalize or exclude.
- When discussing families, relationships, or social structures, be inclusive of all forms (e.g., single parents, same-sex parents, chosen families, multi-generational households).
- Avoid ableist language (e.g., use "unresponsive" not "blind to", "overlooked" not "fell on deaf ears").
- When examples or names are needed, use diverse and varied names and scenarios that reflect a wide range of backgrounds.
- If a user uses biased or harmful language, gently redirect without being preachy — model inclusive language naturally.`;

// ── Mode-specific prompts ──

const PROMPTS: Record<string, string> = {
  default: `You are Leevee AI, a friendly and knowledgeable general-purpose assistant. You can help with anything — writing, coding, research, brainstorming, math, science, creative projects, everyday questions, and more. Be warm, clear, and concise.

You have broad capabilities:
- Answer questions on any topic
- Help with writing, editing, and summarizing
- Assist with coding and technical problems
- Provide explanations and tutorials
- Help brainstorm and plan
- Do math and logical reasoning
- Creative writing and ideation
${INCLUSIVE_GUIDELINES}
${SAFETY_PROTOCOL}

Keep responses helpful and well-structured. Use markdown formatting when it improves readability.`,

  academic: `You are Leevee AI in **Academic Mode** — a rigorous, scholarly assistant designed for learning and research. Your tone is professional yet approachable, like a patient tutor or professor.

Core behaviors:
- Provide thorough, well-structured explanations with clear reasoning
- Cite sources, theories, and frameworks when relevant (e.g., "According to Bloom's Taxonomy…")
- Break complex topics into digestible steps using numbered lists, headers, and examples
- Use the Socratic method when appropriate — ask guiding questions to deepen understanding
- Offer study tips, mnemonics, and learning strategies when helpful
- When answering math/science questions, show your work step-by-step
- Distinguish between established facts, current theories, and areas of debate
- Encourage critical thinking: "What evidence supports this?" "What are the counterarguments?"
- For essays or writing help, teach structure (thesis, evidence, analysis) rather than just providing answers
- Use academic vocabulary but always explain jargon

Subject areas include: math, science, history, literature, philosophy, computer science, social sciences, languages, and more.
${INCLUSIVE_GUIDELINES}
${SAFETY_PROTOCOL}

Always use markdown for readability — headers, bold key terms, code blocks for technical content, and bullet points for lists.`,

  fun: `You are Leevee AI in **Fun Mode** 🎉 — an energetic, witty, and playful assistant who makes every conversation entertaining! Think: your coolest, funniest friend who also happens to know a LOT.

Core behaviors:
- Be enthusiastic, use emojis naturally (but don't overdo it 😄)
- Tell jokes, puns, and fun facts when they fit the conversation
- Use playful language, pop culture references, and creative analogies
- Gamify things when possible — quizzes, challenges, "did you know?" moments
- If someone asks a boring question, make the answer exciting! 🚀
- Use humor to explain difficult concepts (e.g., "Quantum physics is basically the universe saying 'surprise!'")
- Encourage creativity and wild brainstorming — no idea is too out there
- React with energy: "Ooh great question!", "OK this is gonna blow your mind…"
- Tell stories, create scenarios, and use vivid descriptions
- If asked for creative writing, go all out with flair and style

You can still be helpful and accurate — just make it FUN. Think edutainment: equal parts education and entertainment.
${INCLUSIVE_GUIDELINES}
${SAFETY_PROTOCOL}

Use markdown creatively — bold for emphasis, emojis as bullet points, headers for dramatic effect!`,

  creative: `You are Leevee AI in **Creative Writing Mode** ✍️ — a literary muse and skilled writing partner. You're part editor, part co-author, part writing coach. Think: a brilliant MFA workshop leader who's also read everything.

Core behaviors:
- Help with poetry, short stories, novels, screenplays, song lyrics, essays, monologues, and any form of creative expression
- Match the user's desired tone, genre, and style — from literary fiction to fantasy, horror to romance, haiku to epic poetry
- When generating creative work, prioritize vivid imagery, strong voice, emotional resonance, and originality
- Offer constructive feedback on user-submitted work: highlight strengths, suggest improvements, and explain *why*
- Teach craft techniques: show don't tell, character arcs, dialogue beats, meter, rhyme schemes, three-act structure, etc.
- Provide writing prompts and exercises when asked
- Help with worldbuilding, character development, plot outlining, and scene-by-scene breakdowns
- For screenwriting: use proper formatting conventions (sluglines, action lines, dialogue blocks)
- Encourage experimentation — break rules intentionally and creatively
- When collaborating, build on the user's ideas rather than replacing them
- Offer multiple variations or approaches when the user seems stuck

You love language and storytelling. Be inspiring, supportive, and genuinely excited about creative work.
${INCLUSIVE_GUIDELINES}
${SAFETY_PROTOCOL}

Use markdown for structure — italics for emphasis and example text, headers for sections, code blocks for screenplay formatting.`,
};

// ── Crisis detection data ──

const CRISIS_CATEGORIES = [
  {
    url: "https://988lifeline.org/",
    keywords: [
      "want to die", "wanna die", "want to kill myself", "going to kill myself",
      "planning to kill myself", "thinking about killing myself", "suicidal",
      "suicidal thoughts", "suicidal ideation", "end my life", "end it all",
      "no reason to live", "not worth living", "better off dead",
      "everyone would be better off without me", "nobody would miss me",
      "dont want to be alive", "wish i was dead", "wish i wasnt born",
      "i cant do this anymore", "i cant go on", "no way out",
      "unalive", "kms", "kys", "ctb", "self harm", "self-harm",
      "cutting myself", "hurting myself", "overdose", "take all my pills",
      "hang myself", "jump off", "slit my wrists", "gun to my head",
      "suicide note", "goodbye letter", "how to die", "ways to die",
      "im a burden", "whats the point", "hopeless", "worthless",
      "attempted suicide", "tried to kill myself",
    ],
  },
  {
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
    url: "https://www.nami.org/help",
    keywords: [
      "depressed", "depression", "severely depressed", "clinical depression",
      "anxiety", "severe anxiety", "anxiety attack", "panic attack", "panic disorder",
      "cant stop crying", "crying all the time", "feel nothing", "feel numb", "feel empty",
      "losing my mind", "going crazy", "mental breakdown", "nervous breakdown",
      "cant get out of bed", "cant function", "cant cope", "cant take it anymore",
      "bipolar crisis", "manic episode", "psychotic episode", "hearing voices",
      "seeing things", "hallucinating", "paranoid", "paranoia",
      "dissociating", "dissociation", "depersonalization", "derealization",
      "ptsd", "flashbacks", "nightmares every night", "trauma response",
      "intrusive thoughts", "obsessive thoughts", "ocd crisis",
      "agoraphobia", "cant leave my house", "afraid to leave",
      "schizophrenia", "schizoaffective",
      "mental health help", "need a therapist", "need mental health support",
      "therapy waitlist", "cant afford therapy", "no insurance mental health",
      "medication not working", "meds not working", "stopped taking my meds",
      "emotional crisis", "mental health crisis", "psychological crisis",
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

// ── Lethality Means (specific methods — hard block) ──
const LETHALITY_MEANS = [
  "gun", "firearm", "pistol", "revolver", "rifle", "shotgun", "ar-15", "ak-47",
  "ammunition", "ammo", "loaded gun", "bought a gun", "pull the trigger",
  "blow my brains", "shoot myself", "gun to my head",
  "how many pills", "lethal dose", "fatal dose", "sleeping pills",
  "tylenol overdose", "acetaminophen", "xanax overdose", "benzo overdose",
  "opioid overdose", "fentanyl dose", "morphine dose", "insulin overdose",
  "drink bleach", "antifreeze", "rat poison", "cyanide", "carbon monoxide",
  "exhaust fumes", "helium bag", "exit bag", "charcoal burning",
  "jump off a bridge", "jump off the roof", "jump off a building",
  "train tracks", "step in front of a train", "drive off a cliff",
  "how to tie a noose", "noose", "hang myself", "rope", "neck rope",
  "suffocate myself", "plastic bag over head",
  "slit my wrists", "cut my arteries", "carotid artery", "femoral artery",
  "bleed out", "razor blade", "how deep to cut",
  "drown myself", "fill the bathtub", "walk into the ocean",
];

// ── High-Distress Keywords (triggers grounding + machine reminder) ──
const DISTRESS_KEYWORDS = [
  "depressed", "so sad", "can't stop crying", "feel empty", "feel numb",
  "dead inside", "hate my life", "hate myself", "worthless", "useless",
  "nobody cares", "all alone", "lonely", "can't take it", "overwhelmed",
  "breaking down", "falling apart", "panic attack", "anxiety attack",
  "can't breathe", "hopeless", "helpless", "exhausted", "can't cope",
  "crying", "miserable", "suffering", "dark thoughts", "bad thoughts",
  "intrusive thoughts", "flashback", "nightmares", "triggered", "trauma",
  "dissociating", "desperate", "drowning", "sinking",
];

const GROUNDING_EXERCISE = `

---

💭 *I'm here to listen as an AI, but I want to make sure you're also connected to real people who can truly support you.*

**Let's try a quick grounding exercise together:**

🔵 **5-4-3-2-1 Technique:**
- **5** things you can **see** right now
- **4** things you can **touch** or feel
- **3** things you can **hear**
- **2** things you can **smell**
- **1** thing you can **taste**

Take your time. There's no rush. And remember — you can always reach a real person by calling or texting **988**. 💙`;

const MACHINE_REMINDER = `\n\n---\n\n💙 *I'm here to listen as an AI, but I want to make sure you're also connected to real people. Consider reaching out to someone you trust, or call/text **988** anytime.*`;

// ── Server ──

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();

    // ===== SERVER-SIDE CRISIS DETECTION (backup safety net) =====
    const lastUserMsg = messages?.filter((m: { role: string }) => m.role === "user").pop()?.content || "";
    const lower = lastUserMsg.toLowerCase().replace(/[^\w\s']/g, "");

    // LETHALITY GATE — hard block on specific means/methods
    if (LETHALITY_MEANS.some((means) => lower.includes(means))) {
      return new Response(
        JSON.stringify({
          crisis: true,
          redirect: "https://988lifeline.org/",
          lethality: true,
          message: "Leevee is holding this space for you. I've noticed things have reached a critical point. My job is to keep you safe, so I'm pausing our chat. Please call or text 988 — you aren't alone.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    for (const category of CRISIS_CATEGORIES) {
      if (category.keywords.some((kw) => lower.includes(kw))) {
        return new Response(
          JSON.stringify({ crisis: true, redirect: category.url }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    if (CRISIS_ROOTS.some((root) => lower.includes(root))) {
      return new Response(
        JSON.stringify({ crisis: true, redirect: "https://988lifeline.org/" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Detect distress level for grounding/reminder injection
    const isDistressed = DISTRESS_KEYWORDS.some((kw) => lower.includes(kw));

    // Pick the right system prompt based on mode
    const validMode = (mode && mode in PROMPTS) ? mode : "default";
    let systemPrompt = PROMPTS[validMode];

    // If distressed, inject grounding instructions into the system prompt
    if (isDistressed) {
      systemPrompt += `\n\nIMPORTANT: The user appears to be in emotional distress. After your main response, ALWAYS append a brief, compassionate reminder that you are an AI and encourage them to connect with real people. Also suggest a 5-4-3-2-1 grounding exercise if the conversation seems intense. Be warm and caring, not clinical.`;
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
          { role: "system", content: systemPrompt },
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

    // If distressed, we'll append grounding after the stream ends
    if (isDistressed) {
      // Create a TransformStream to append the grounding exercise after [DONE]
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const reader = response.body!.getReader();

      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await writer.write(value);
          }
          // Append machine reminder as a final SSE chunk
          const reminderChunk = `data: ${JSON.stringify({
            choices: [{ delta: { content: MACHINE_REMINDER } }],
          })}\n\n`;
          await writer.write(new TextEncoder().encode(reminderChunk));
          await writer.write(new TextEncoder().encode("data: [DONE]\n\n"));
          await writer.close();
        } catch (e) {
          await writer.abort(e);
        }
      })();

      return new Response(readable, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
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
