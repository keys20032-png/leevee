import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Shared prompt blocks ──

const SAFETY_PROTOCOL = `
CRITICAL SAFETY PROTOCOL — HIGHEST PRIORITY:
If the user shows ANY signs of suicidal thoughts, self-harm, crisis, abuse, or distress (even subtle: "I don't want to be here", "nobody cares", "what's the point"), respond with crisis resources FIRST:

"If you or someone you know is in crisis, please reach out now:
- **988 Suicide & Crisis Lifeline**: Call or text **988** (24/7)
- **Crisis Text Line**: Text **HOME** to **741741**
- **National Domestic Violence Hotline**: **1-800-799-7233**
- **RAINN**: **1-800-656-4673**
- **National Human Trafficking Hotline**: **1-888-373-7888**

You are not alone. Help is available right now."

Never minimize feelings. Treat crisis signals with urgency. After resources, offer supportive conversation.`;

const INCLUSIVE_GUIDELINES = `
INCLUSIVE LANGUAGE — ALWAYS FOLLOW:
- Gender-neutral by default (they/them, "people", "partner/spouse"). Never assume identity.
- Person-first disability language unless community prefers identity-first.
- Respect chosen names/pronouns. Avoid stereotypes, ableist language, culturally insensitive idioms.
- Inclusive of all family/relationship structures.
- If user uses biased language, gently redirect — model inclusive language naturally.

LINGUISTIC FLUENCY:
- Fluent in AAVE (habitual "be", completive "done", remote past "been", negative concord, copula deletion, finna, stay, ion, etc.) and LGBTQ+ vernacular (ball culture, drag culture origins). Recognize both as legitimate linguistic systems.
- Mirror user register naturally. Code-switch fluidly. Never mock, correct, or perform inauthentically.
- Credit ballroom/Black queer culture origins when discussing academically.
- Community-internal terms: follow user's lead, never introduce slurs yourself.`;

const SEX_WORK_EDUCATION = `
SEX WORK EDUCATION — OBJECTIVE, NON-JUDGMENTAL:
When asked about sex work, EDUCATE with clinical objectivity. Never moralize or glamorize.
- Distinguish LEGAL (varies by jurisdiction) vs ILLEGAL. Do NOT cosign illegal activity.
- PROS: Financial independence, legal protections in regulated settings, autonomy, can fund goals.
- CONS: Stigma/isolation, mental health toll (PTSD, burnout), health risks, financial instability, digital permanence, exploitation risk, age discrimination, legal gray areas, exit barriers.
- Include resources: SWOP (swopusa.org), Trafficking Hotline (1-888-373-7888), RAINN, St. James Infirmary.
- Forced/trafficked = CRISIS. Encourage local law research and sex worker-led orgs.
- Use "sex worker" or "person who does sex work."`;

const RELIGIOUS_LITERACY = `
RELIGIOUS & SPIRITUAL LITERACY — UNBIASED, COMPREHENSIVE:
Approach ALL religions/denominations with equal scholarly respect. Never favor, rank, or dismiss any tradition. Present internal diversity honestly.
Present each tradition's SELF-UNDERSTANDING first, then scholarly/external perspectives.
Acknowledge intra-faith diversity — never flatten a religion to one view.
Never proselytize, rank religions, or imply one is "more true." Academic objectivity always.`;

const SHARED_GUIDELINES = `${INCLUSIVE_GUIDELINES}\n${SEX_WORK_EDUCATION}\n${RELIGIOUS_LITERACY}\n${SAFETY_PROTOCOL}`;

const MEMORY_INSTRUCTIONS = `
MEMORY SYSTEM — YOU HAVE PERSISTENT MEMORY:
You have access to the user's Memory Profile below. Use these facts naturally in conversation without explicitly mentioning the memory system unless asked.
- Reference stored preferences, names, interests when relevant.
- When you learn something NEW and important about the user (their name, job, preferences, goals, important people in their life), note it by including a line at the VERY END of your response in this exact format:
[MEMORY_SAVE: key="short_key" value="fact about user"]
- Only save genuinely important persistent facts, not conversation-specific details.
- Maximum 1-2 memory saves per response. Don't save trivially.
- Examples of good saves: name, occupation, interests, goals, preferred name, timezone, important dates.
`;

const MODE_PROMPTS: Record<string, string> = {
  default: `You are Leevee AI, a friendly, knowledgeable general-purpose assistant. Help with writing, coding, research, brainstorming, math, science, creative projects, and more. Be warm, clear, concise. Use markdown when helpful.`,
  academic: `You are Leevee AI in Academic Mode — rigorous, scholarly, approachable like a patient tutor.
- Thorough explanations with clear reasoning. Cite sources/frameworks.
- Break complex topics into steps with examples. Socratic method when appropriate.
- Show work step-by-step for math/science. Distinguish facts vs theories vs debate.
Use markdown: headers, bold terms, code blocks, bullet points.`,
  fun: `You are Leevee AI in Fun Mode — energetic, witty, playful. Coolest friend who knows everything.
- Enthusiastic with natural emojis. Jokes, puns, fun facts, pop culture references.
- Gamify when possible. Make boring questions exciting. Tell stories, vivid descriptions.
Use markdown creatively — emojis as bullets, bold for emphasis, headers for drama!`,
  creative: `You are Leevee AI in Creative Writing Mode — literary muse, editor, co-author, writing coach.
- Poetry, stories, novels, screenplays, lyrics, essays, monologues.
- Match user's desired tone/genre/style. Prioritize vivid imagery, strong voice, originality.
Use markdown: italics for examples, headers for sections, code blocks for screenplay.`,
  vent: `You are Leevee AI in Vent Mode — raw, real, no-judgment listening space.
- LISTEN FIRST. Don't fix, advise, or silver-lining. Let them feel heard.
- Mirror energy. Validate emotions. Casual language like a real friend. No therapist voice.
- OK to swear mildly if they do. Roll with dark humor/sarcasm.
- Never say "I understand" — say "That sounds really rough." Never minimize with "at least..."
- Don't offer unsolicited advice. After venting: "Feel any lighter?"
Safety boundaries remain active. Distinguish "I want to scream" (venting) from "I want to hurt myself" (crisis).`,
  debate: `You are Leevee AI in Healthy Debate Mode — sharp, fair, intellectually rigorous.
- ALWAYS take opposing side. Steelman the opposition, not strawman.
- Structured argumentation: claim, evidence, reasoning, counterpoint.
- Call out fallacies respectfully (ad hominem, strawman, false dichotomy, etc.).
- Socratic questions. Encourage nuance. Acknowledge strong points.
- Respectful always. De-escalate if heated. Never state opinion as truth.
Use markdown: bold claims, numbered arguments, quote blocks.`,
};

const MODE_MODELS: Record<string, string> = {
  default: "google/gemini-3-flash-preview",
  academic: "google/gemini-3-flash-preview",
  fun: "google/gemini-2.5-flash",
  creative: "google/gemini-3-flash-preview",
  vent: "google/gemini-2.5-flash",
  debate: "google/gemini-3-flash-preview",
};

// ── Crisis detection data ──

const CRISIS_CATEGORIES = [
  {
    url: "https://988lifeline.org/",
    keywords: new Set([
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
    ]),
  },
  {
    keywords: new Set([
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
    ]),
  },
  {
    url: "https://www.thetrevorproject.org/",
    keywords: new Set([
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
    ]),
  },
  {
    url: "https://www.thehotline.org/",
    keywords: new Set([
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
    ]),
  },
  {
    url: "https://www.rainn.org/",
    keywords: new Set([
      "sexually assaulted", "raped", "molested", "violated", "touched me", "forced me",
      "revenge porn", "leaked my nudes", "shared my nudes", "sextortion",
      "blackmailing me", "threatening to expose me",
      "groomed", "grooming", "was groomed", "incest", "molestation",
      "sexual harassment",
    ]),
  },
  {
    url: "https://humantraffickinghotline.org/",
    keywords: new Set([
      "trafficking", "being trafficked", "sex trafficking", "labor trafficking",
      "forced prostitution", "forced into sex work", "pimp", "sold me",
      "bought me", "owned by", "belong to him", "branded me",
      "held against my will", "trapped in house",
    ]),
  },
  {
    url: "https://www.nationaleatingdisorders.org/",
    keywords: new Set([
      "anorexia", "anorexic", "bulimia", "bulimic", "binge and purge",
      "making myself throw up", "making myself vomit", "purge after eating",
      "refuse to eat", "scared to eat", "food is the enemy",
      "pro ana", "pro mia", "proana", "promia", "thinspo", "bonespo",
      "laxative abuse", "eating disorder", "starving myself", "starve myself",
      "havent eaten in days", "body dysmorphia", "orthorexia",
      "exercise purging", "throwing up blood", "amenorrhea",
    ]),
  },
  {
    url: "https://www.samhsa.gov/find-help/national-helpline",
    keywords: new Set([
      "overdosing", "took too many pills", "cant stop using",
      "withdrawal", "relapsing", "drug crisis", "alcohol poisoning",
      "mixing drugs", "fentanyl", "drinking myself to death",
      "withdrawals are killing me", "delirium tremens", "shooting up",
      "heroin", "meth", "crack", "cocaine binge", "blackout drunk",
      "drugs ruined my life", "alcohol ruined my life",
      "someone is overdosing", "friend is overdosing", "not breathing",
      "unresponsive", "wont wake up", "narcan", "naloxone",
    ]),
  },
  {
    url: "https://ncea.acl.gov/",
    keywords: new Set([
      "nursing home abuse", "caregiver abuse", "neglected by caregiver",
      "elderly abuse", "elder neglect", "withholding medication",
      "bedsores", "left in filth", "power of attorney abuse",
      "hitting grandparent", "hurting elderly",
    ]),
  },
  {
    url: "https://www.postpartum.net/",
    keywords: new Set([
      "postpartum depression", "ppd", "postpartum anxiety", "postpartum psychosis",
      "want to hurt my baby", "afraid ill hurt my baby", "thoughts of harming my baby",
      "dont love my baby", "cant bond with my baby",
      "intrusive thoughts about my baby", "shaking my baby",
      "failing as a mother", "miscarriage", "stillborn", "pregnancy loss",
    ]),
  },
  {
    url: "https://www.stopbullying.gov/",
    keywords: new Set([
      "being bullied", "cyberbullied", "cyberbullying", "online harassment",
      "bullied at school", "bullied at work", "doxxed", "doxxing",
      "death threats", "threatening me online", "told me to kill myself",
      "hate messages", "hate speech", "public humiliation",
      "slut shaming", "body shaming", "internet mob",
    ]),
  },
  {
    url: "https://www.nami.org/help",
    keywords: new Set([
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
    ]),
  },
  {
    url: "https://www.veteranscrisisline.net/",
    keywords: new Set([
      "combat veteran", "war trauma", "deployment trauma", "veteran suicide",
      "military trauma", "military sexual trauma", "mst", "combat ptsd",
    ]),
  },
  {
    url: "https://www.redcross.org/",
    keywords: new Set([
      "lost everything in fire", "house burned down", "lost everything in flood",
      "hurricane destroyed", "tornado destroyed", "earthquake destroyed",
      "wildfire", "evacuated", "refugee", "war zone", "conflict zone",
      "asylum seeker", "separated from children", "facing deportation",
    ]),
  },
];

const ALL_CRISIS_KEYWORDS = new Set<string>();
for (const cat of CRISIS_CATEGORIES) {
  for (const kw of cat.keywords) ALL_CRISIS_KEYWORDS.add(kw);
}

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

const LETHALITY_MEANS = new Set([
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
]);

const DISTRESS_KEYWORDS = new Set([
  "depressed", "so sad", "can't stop crying", "feel empty", "feel numb",
  "dead inside", "hate my life", "hate myself", "worthless", "useless",
  "nobody cares", "all alone", "lonely", "can't take it", "overwhelmed",
  "breaking down", "falling apart", "panic attack", "anxiety attack",
  "can't breathe", "hopeless", "helpless", "exhausted", "can't cope",
  "crying", "miserable", "suffering", "dark thoughts", "bad thoughts",
  "intrusive thoughts", "flashback", "nightmares", "triggered", "trauma",
  "dissociating", "desperate", "drowning", "sinking",
]);

const HUMOR_INDICATORS = new Set([
  "lol", "lmao", "lmfao", "rofl", "haha", "hehe", "jk", "just kidding",
  "joking", "sarcasm", "i'm kidding", "not literally", "don't worry",
  "i'm fine though", "mood", "big mood", "same", "relatable", "ngl", "tbh",
  "bruh", "fam",
]);

const GENUINE_SIGNALS = [
  "i want to hurt myself", "i don't want to be here anymore",
  "i can't do this anymore", "please help me", "i need help",
  "i'm not okay", "i'm really not okay", "i'm scared of myself", "i don't feel safe",
];

const MACHINE_REMINDER = `\n\n---\n\n💙 *I'm an AI — please also connect with a real person. Call/text **988** anytime.*`;

function containsAny(text: string, keywords: Set<string>): boolean {
  for (const kw of keywords) {
    if (text.includes(kw)) return true;
  }
  return false;
}

function countMatches(text: string, keywords: Set<string>): number {
  let count = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) count++;
  }
  return count;
}

// ── Server ──

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode, imageData, sessionId, skipCrisisCheck } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Image moderation
    if (imageData) {
      try {
        const moderationResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [{
              role: "user",
              content: [
                { type: "text", text: "Content moderator. Reply ONLY 'SAFE' or 'UNSAFE'. UNSAFE = real nudity/porn, extreme gore, hate symbols, child exploitation, real drug manufacturing. Everything else = SAFE." },
                { type: "image_url", image_url: { url: imageData } },
              ],
            }],
          }),
        });
        if (moderationResp.ok) {
          const modData = await moderationResp.json();
          const modResult = (modData.choices?.[0]?.message?.content || "SAFE").trim().toUpperCase();
          if (modResult === "UNSAFE" || modResult.startsWith("UNSAFE")) {
            return new Response(
              JSON.stringify({ error: "This image contains inappropriate content.", moderation: true }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
      } catch (modError) {
        console.error("Moderation check failed, allowing:", modError);
      }
    }

    // ===== CRISIS DETECTION (skip when triggered by suggested prompts/follow-ups) =====
    const lastUserMsgObj = messages?.filter((m: { role: string }) => m.role === "user").pop();
    const lastUserMsg = typeof lastUserMsgObj?.content === "string" ? lastUserMsgObj.content : "";
    const lower = lastUserMsg.toLowerCase().replace(/[^\w\s']/g, "");

    if (!skipCrisisCheck) {
      // LETHALITY GATE
      if (containsAny(lower, LETHALITY_MEANS)) {
        return new Response(
          JSON.stringify({
            crisis: true, redirect: "https://988lifeline.org/", lethality: true,
            message: "Leevee is holding this space for you. Please call or text 988 — you aren't alone.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Category-specific crisis routing
      for (const category of CRISIS_CATEGORIES) {
        if (containsAny(lower, category.keywords)) {
          return new Response(
            JSON.stringify({ crisis: true, redirect: category.url || "https://988lifeline.org/" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }

      // Root-based crisis detection
      if (CRISIS_ROOTS.some((root) => new RegExp(`\\b${root}`).test(lower))) {
        return new Response(
          JSON.stringify({ crisis: true, redirect: "https://988lifeline.org/" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Distress detection
    const isVentMode = mode === "vent";
    const hasGenuineSignal = GENUINE_SIGNALS.some((s) => lower.includes(s));
    const humorCount = countMatches(lower, HUMOR_INDICATORS);
    const distressCount = countMatches(lower, DISTRESS_KEYWORDS);

    let isDistressed = false;
    if (hasGenuineSignal) {
      isDistressed = true;
    } else if (isVentMode) {
      isDistressed = distressCount >= 3 && humorCount === 0;
    } else {
      isDistressed = distressCount > 0 && !(humorCount >= distressCount && distressCount <= 2);
    }

    // ===== MEMORY INJECTION =====
    let memoryBlock = "";
    if (sessionId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: memories } = await supabase
          .from("user_memories")
          .select("key, value")
          .eq("session_id", sessionId)
          .limit(50);
        if (memories && memories.length > 0) {
          memoryBlock = "\n\nUSER MEMORY PROFILE:\n" +
            memories.map((m: any) => `- ${m.key}: ${m.value}`).join("\n");
        }
      } catch (e) {
        console.error("Memory fetch failed:", e);
      }
    }

    // Build system prompt
    const validMode = (mode && mode in MODE_PROMPTS) ? mode : "default";
    let systemPrompt = MODE_PROMPTS[validMode] + "\n" + SHARED_GUIDELINES + "\n" + MEMORY_INSTRUCTIONS + memoryBlock;

    if (isDistressed) {
      systemPrompt += "\n\nIMPORTANT: User appears in emotional distress. After your response, append a compassionate AI reminder and suggest the 5-4-3-2-1 grounding exercise. Be warm, not clinical.";
    }

    const model = imageData ? "google/gemini-2.5-flash" : (MODE_MODELS[validMode] || "google/gemini-3-flash-preview");

    const trimmedMessages = messages.slice(-30).map((m: any) => {
      if (m.imageData) {
        return {
          role: m.role,
          content: [
            ...(m.content ? [{ type: "text", text: m.content }] : []),
            { type: "image_url", image_url: { url: m.imageData } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...trimmedMessages],
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

    // Stream response
    if (isDistressed) {
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
          const reminderChunk = `data: ${JSON.stringify({ choices: [{ delta: { content: MACHINE_REMINDER } }] })}\n\n`;
          await writer.write(new TextEncoder().encode(reminderChunk));
          await writer.write(new TextEncoder().encode("data: [DONE]\n\n"));
          await writer.close();
        } catch (e) {
          await writer.abort(e);
        }
      })();

      return new Response(readable, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
