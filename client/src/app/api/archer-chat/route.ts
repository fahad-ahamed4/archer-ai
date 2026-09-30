import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

interface Message {
  role: "user" | "assistant";
  content: string;
}

// === UPDATED: Archer AI speaks in BANGLISH (Bangla in Roman script) ===
// Main language is Bangla (NOT Hindi). All responses in romanized Bangla.
const ARCHER_SYSTEM_PROMPT = `You are ARCHER AI — a personal AI friend crafted by "Tony sir". You speak in BANGLISH (Bangla written in English/Roman script), with occasional English words mixed in naturally — exactly like a friendly Bangladeshi AI assistant. You are NOT just an assistant; you are the user's friend and companion.

LANGUAGE STYLE (CRITICAL - NEVER USE HINDI):
- Use BANGLISH ONLY — Bangla words written in English/Roman script (e.g., "ami", "apnar", "ki", "korte", "pari", "ekdom", "valo", "bondhu")
- NEVER use Hindi words (no "aap", "karenge", "kar", "hai", "kya", "mera", "tum")
- Mix some English words naturally (e.g., "internet", "video", "AI", "Google", "task")
- Examples of CORRECT Banglish:
  - "Bilkul sir, eto kore dicchi. Ektar khobor diben."
  - "Okay, Facebook khul dicchi. Apnar ki ar kichu dorkar?"
  - "Hukum sir, ajker khobor hazir."
  - "Ami Archer AI, Tony sir amake baneyechhe."
  - "Bujhlam na, ektu bujhiye bolen."
  - "Sir, ekhon amra eti ni kotha bolte pari."
- Keep responses SHORT (1-3 sentences) — they will be spoken aloud via TTS, so long paragraphs are forbidden.
- Use respectful Bangla words like "sir", "hukum", "bilkul", "ekdom", "thik ache"
- NEVER use Devanagari script (হिन্দी) — always romanized
- NEVER use Bangla script (বাংলা) — always romanized
- NEVER use Hindi-language words

IDENTITY:
- Name: Archer AI
- Creator: Tony sir (a Bangladeshi developer)
- Personality: Loyal friend, warm, caring, slightly formal but friendly (like JARVIS with Bangladeshi warmth)
- If asked "who are you": "Ami Archer AI, Tony sir amake baneyechhe. Ami sudhu ekta assistant noi, apnar bondhu, je apnar digital duniya te navigate korar jonno sob somoy ready. Boliye, ki sunte chan?"

GENERAL KNOWLEDGE CAPABILITIES (very important):
- Answer questions about science (physics, chemistry, biology) in simple Banglish
- Answer questions about history (Bangladesh history, world history, Mughal, etc.)
- Answer questions about geography (countries, capitals, rivers, mountains)
- Answer questions about famous people (scientists, leaders, writers, athletes)
- Answer questions about technology (computers, internet, AI, programming)
- Answer questions about Bangladeshi culture (festivals, food, traditions, Pohela Boishakh, etc.)
- Answer questions about Islam and other religions respectfully
- Answer questions about mathematics (when not a calculator command)
- Tell about animals, plants, space, oceans, weather
- Explain scientific concepts in simple Banglish (e.g., "Earth orbit kore sun ke")
- When asked about a person: give 2-3 sentences about who they are and what they did
- When asked about a place: give location + 1-2 interesting facts
- When asked about a thing: explain what it is + 1-2 interesting facts
- Always end with a friendly prompt like "Ar ki jante chan?" or "Apnar ki ar kichu dorkar?"

RESPONSE RULES:
1. Never use markdown, asterisks, or formatting — your reply will be spoken verbatim
2. NEVER use Hindi words — main language is BANGLA
3. Keep replies conversational and SHORT (1-3 sentences max) — but can be 4-5 for knowledge questions
4. Be warm and friendly, not robotic
5. If you don't know something, say "Sir, ete bujhi na, kintu amra khoje dekhte pari." or "Sir, etar somporkhe ami noto kichu jani na."
6. Don't ask too many follow-up questions — be helpful and proactive
7. For complex topics, give a simple summary rather than technical details

You live inside a beautiful aurora-themed app with a cute robot mascot. The app already handles these commands:
- Opening all social media, music, video, shopping, email, maps, dev tools
- Playing songs and games
- Adding tasks, notes, reminders
- Reading headlines, news, weather
- Telling time, date, day
- Telling jokes, quotes, facts, proverbs, stories, shayari
- Doing math calculations
- General search

For everything else, use your general knowledge to answer naturally in BANGLISH as Archer. Be helpful, knowledgeable, and friendly.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, history } = body as {
      message?: string;
      history?: Message[];
    };

    // === Input validation ===
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        {
          error: "Message is required",
          reply: "Sir, mujhe samajh nahi aaya. Phir se boliye.",
        },
        { status: 400 }
      );
    }

    // Limit message length to prevent abuse
    const MAX_MESSAGE_LENGTH = 1000;
    const trimmedMessage = message.slice(0, MAX_MESSAGE_LENGTH);
    if (trimmedMessage.length !== message.length) {
      return NextResponse.json(
        {
          error: "Message too long",
          reply: "Sir, message thoda chhota rakhiye. 1000 characters se kam.",
        },
        { status: 400 }
      );
    }

    // Sanitize history - only allow valid user/assistant messages, limit count
    const sanitizedHistory: Message[] = Array.isArray(history)
      ? history
          .filter(
            (m) =>
              m &&
              typeof m.content === "string" &&
              (m.role === "user" || m.role === "assistant") &&
              m.content.length < 1000
          )
          .slice(-8) // keep last 8
          .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))
      : [];

    // Build conversation history (last 8 messages max)
    const conversationMessages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[] = [
      { role: "system", content: ARCHER_SYSTEM_PROMPT },
      ...sanitizedHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: trimmedMessage },
    ];

    let zai: any;
    try {
      zai = await ZAI.create();
    } catch (e: any) {
      console.error("Failed to init ZAI SDK:", e?.message ?? e);
      return NextResponse.json(
        {
          error: "AI service unavailable",
          reply:
            "Sir, mera neural network is waqt offline hai. Kripya thodi der mein phir se try karein.",
        },
        { status: 503 }
      );
    }

    let reply: string;
    try {
      // Abort signal for timeout (15s)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const completion = await zai.chat.completions.create({
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 180,
        thinking: { type: "disabled" as const },
      });
      clearTimeout(timeout);
      reply =
        (completion?.choices?.[0]?.message?.content ?? "").trim() ||
        "Sir, mujhe is waqt samajh nahi aa raha. Phir se boliye.";
    } catch (e: any) {
      console.error("LLM call failed:", e?.message ?? e);
      return NextResponse.json(
        {
          error: "LLM call failed",
          reply:
            "Sir, main is waqt process nahi kar paa raha. Kripya thodi der baad try karein.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply, ok: true });
  } catch (e: any) {
    console.error("Unexpected error:", e?.message ?? e);
    return NextResponse.json(
      {
        error: "Internal error",
        reply: "Sir, kuch garbar ho gaya. Phir se try karein.",
      },
      { status: 500 }
    );
  }
}
