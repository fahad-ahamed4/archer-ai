"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatMessage } from "@/components/archer-ai/chat-history";

type OrbState = "idle" | "listening" | "speaking" | "dreaming" | "processing";

interface Headline {
  id: string;
  title: string;
  source: string;
}

interface Task {
  id: string;
  text: string;
  done: boolean;
}

// Speech recognition type-safe shim
interface SpeechRecognitionResultLike {
  0: { transcript: string; confidence: number };
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionEventLike {
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
  resultIndex: number;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognitionLike };
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
  }
}

// === FIXED: Tasks match the TikTok video ===
const INITIAL_TASKS: Task[] = [
  { id: "t1", text: "upload video in YouTube", done: false },
];

// === FIXED: Bangla headlines ===
const INITIAL_HEADLINES: Headline[] = [
  {
    id: "h1",
    title: "OpenAI, Google, Meta - notun AI models",
    source: "AI Daily",
  },
  {
    id: "h2",
    title: "US-China AI race - notun progress",
    source: "TechWire",
  },
  {
    id: "h3",
    title: "Industry milestones & agent updates",
    source: "AI News",
  },
];

// === FIXED: Welcome message in Banglish (Bangla in Roman script) ===
const WELCOME_MESSAGE =
  "Hello sir, ami Archer AI, Tony sir baneyechhe. Ami sudhu ekta assistant noi, apnar bondhu, apnar digital duniya te navigate korar jonno amio somvorta ready. Boliye, ki korte pari apnar jonno?";

// Helpers
const uid = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

// === FIXED: Pick best natural-sounding voice ===
// Prefer Google natural voices (much more clear than default browser voices)
function pickBestVoice(voiceType: "jarvis" | "friday"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Always prefer English voices for romanized Bangla (matches video's Indian-English accent)
  const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));

  // === Voice preference list — Google natural voices are highest quality ===
  // JARVIS: deep, calm, male — prefer Google UK English Male (very natural)
  const malePreferences = [
    "Google UK English Male",
    "Microsoft Ravi",
    "Microsoft Guy",
    "Microsoft David",
    "Google US English",
    "Daniel",
    "Alex",
    "Arthur",
    "Oliver",
    "Rishi",
  ];
  // FRIDAY: light, clear, female — prefer Google UK English Female
  const femalePreferences = [
    "Google UK English Female",
    "Microsoft Neel",
    "Microsoft Zira",
    "Microsoft Hazel",
    "Google US English",
    "Samantha",
    "Victoria",
    "Karen",
  ];
  const preferredNames = voiceType === "jarvis" ? malePreferences : femalePreferences;

  // Try preferred names first
  for (const name of preferredNames) {
    const match = enVoices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
    if (match) return match;
  }

  // Fallback: any English voice
  if (enVoices.length > 0) {
    return enVoices[0];
  }

  // Last resort: any voice at all
  return voices[0] || null;
}

interface CommandResult {
  response: string;
  action?: "open_url" | "play_song" | "open_app" | "add_task" | "read_headlines";
  url?: string;
  task?: string;
}

// === FIXED: All responses in Banglish (Bangla in Roman script) — NOT Hindi ===
function tryHandleCommand(text: string): CommandResult | null {
  const lower = text.toLowerCase().trim();

  // === GREETING ===
  if (/(hello|hi|হ্যালো|হাই|নমস্কার|আসসালাম|salam|hey)/i.test(lower) && /(how are you|কেমন আছ|কি খবর|kemon acho|ki khobor)/i.test(lower)) {
    return {
      response: "Hello sir, ami ekdom valo achi. Apnar khobor ki? Boliye, ki korte pari apnar jonno?",
    };
  }
  if (/(hello|hi|হ্যালো|হাই|নমস্কার|আসসালাম|salam|hey)/i.test(lower) && lower.length < 25) {
    return {
      response: "Hello sir! Ami ekdom valo achi. Apnar ki dorkar? Boliye.",
    };
  }

  // === SUNFLOWER SONG ===
  if (/(sunflower)/i.test(lower) && /(song|gana|গান|baje|play|চালা|বাজা|বাজাও)/i.test(lower)) {
    return {
      response: "Bilkul, sunflower gaan bajey dicchi. Sune tar apnar ki mone hoy bolben.",
      action: "play_song",
      url: "https://www.youtube.com/results?search_query=sunflower+song",
    };
  }

  // === GENERIC SONG ===
  if (/(গান|গানটা|song|music|gaan|gana)/i.test(lower) && /(বাজা|play|চালা|baje|চালান|বাজাও|বাজান)/i.test(lower)) {
    const songRegex = /(?:play|বাজা|বাজাও|বাজান|চালা|চালাও|চালান|baje|sunflower)\s+(?:song|গান|gaan|gana|music|ত\w+)?\s*([\w\u0980-\u09FF\u0900-\u097F\s]{2,30})?/i;
    const m = lower.match(songRegex);
    let songName = (m?.[1] ?? "").trim();
    const genericWords = ["song", "gaan", "gana", "গান", "music", "the", "a", "an", "একটা", "একটি", "আমার", "কি", "তোমার", "কোনো", "ekta"];
    songName = songName
      .split(/\s+/)
      .filter((w) => w && !genericWords.includes(w.toLowerCase()))
      .join(" ")
      .trim();
    const finalSong = songName || "trending bangla songs";
    const replySong = songName || "ekta gaan";
    return {
      response: `Bilkul, ${replySong} bajey dicchi. Sune tar apnar ki mone hoy bolben.`,
      action: "play_song",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(finalSong)}`,
    };
  }

  // === FACEBOOK ===
  if (/(facebook|এফবি|fb|ফেসবুক|ফেইসবুক)/i.test(lower) && /(open|খোল|খোলো|on|app|চালু|kar)/i.test(lower)) {
    return {
      response: "Thik ache, Facebook khol dicchi.",
      action: "open_app",
      url: "https://www.facebook.com",
    };
  }

  // === YOUTUBE ===
  if (/(youtube|ইউটিউব|ইউটুব)/i.test(lower) && /(open|খোল|upload|video|চালু)/i.test(lower)) {
    return {
      response: "Bilkul, YouTube khol dicchi. Apni video upload korte parben.",
      action: "open_url",
      url: "https://www.youtube.com",
    };
  }

  // === INTERNET/GOOGLE ===
  if (/(google|search|ইন্টারনেট|internet|ইন্টরনেট|net)/i.test(lower) && /(open|খোল|search)/i.test(lower)) {
    return {
      response: "Okay, internet khol dicchi. Apni jekichu search korte parben.",
      action: "open_url",
      url: "https://www.google.com",
    };
  }

  // === ADD TIKTOK UPLOAD TASK ===
  if (/(tiktok|টিকটক|task|কাজ|কর্ম)/i.test(lower) && /(upload|video|task|আপলোড|ভিডিও|কাজ)/i.test(lower)) {
    return {
      response: "Okay sir, TikTok e video upload korar task add kore dicchi. Ami etar joldi complete korbo.",
      action: "add_task",
      task: "upload video in TikTok",
    };
  }

  // === TODAY'S HEADLINES (in Banglish) ===
  if (/(today|headlines|headline|আজকের|খবর|সমাচার|news|তাজা|ajker)/i.test(lower) && /(headline|headlines|খবর|news|তাজা|দেখাও|do|দাও)/i.test(lower)) {
    return {
      response:
        "Hukum sir, ajker AI headlines hazir. Boro companies jemon OpenAI, Google, aur Meta er dike theke notun models aur research er khobor asche. Saat e America aur China er moddhe AI power e notun progress hobeche. Industry te lagatai milestones aur agent updates asche.",
      action: "read_headlines",
    };
  }

  // === WHO ARE YOU (in Banglish) ===
  if (/(who are you|তুমি কে|আপনি কে|কে আপনি|what.*you|your name|তোমার নাম|archer.*about|archer ke bare|বলতো তুমি|apni ke|tumi ke)/i.test(lower)) {
    return {
      response:
        "Ami Archer AI, Tony sir amake baneyechhe. Ami sudhu ekta assistant noi, apnar bondhu, je apnar digital duniya te navigate korar jonno sob somoy ready. Boliye, ki sunte chan?",
    };
  }

  // === GAMES — specific games matched BEFORE Motu Patlu ===
  if (/\b(play|খেল|খেলো)\s+(chess|dama|carrom|ludo|puzzle|snake|tetris|sudoku|memory|2048|gta|free\s*fire|pubg|candy|crush|minecraft|fortnite)\b/i.test(lower)) {
    const gameMatch = lower.match(/\b(?:play|খেল|খেলো)\s+(chess|dama|carrom|ludo|puzzle|snake|tetris|sudoku|memory|2048|gta|free\s*fire|pubg|candy|crush|minecraft|fortnite)\b/i);
    const game = gameMatch?.[1] || "game";
    return {
      response: `Bilkul, ${game} game khul dicchi! Enjoy korun.`,
      action: "open_url",
      url: `https://www.google.com/search?q=play+${encodeURIComponent(game)}+game+online`,
    };
  }

  // === MOTU PATLU GAME — only if motu/patlu explicitly mentioned ===
  if (/(motu|patlu|মটু|পটলু)/i.test(lower)) {
    return {
      response: "Bilkul, Motu Patlu game choley dicchi! Ar apni jodi onno kichu ni kotha bolte chan, bolen.",
      action: "open_url",
      url: "https://www.google.com/search?q=play+motu+patlu+game+online",
    };
  }

  return null;
}

// === EXPANDED CAPABILITY: 30+ NEW COMMANDS ===
function tryHandleExtendedCommand(text: string): CommandResult | null {
  const lower = text.toLowerCase().trim();

  // === SOCIAL MEDIA APPS ===
  if (/(instagram|insta|ইনস্টাগ্রাম|instagram)/i.test(lower) && /(open|খোল|খুল|খোলো|on|app|চালু)/i.test(lower)) {
    return {
      response: "Thik ache, Instagram khul dicchi.",
      action: "open_app",
      url: "https://www.instagram.com",
    };
  }
  if (/(twitter|tweet|টুইটার|x\.com)/i.test(lower) && /(open|খোল|খুল|খোলো|on|app|চালু)/i.test(lower)) {
    return {
      response: "Okay, Twitter/X khul dicchi.",
      action: "open_app",
      url: "https://www.x.com",
    };
  }
  if (/(whatsapp|হোয়াটসঅ্যাপ|whats app)/i.test(lower) && /(open|খোল|খুল|খোলো|on|app|চালু|message)/i.test(lower)) {
    return {
      response: "Thik ache, WhatsApp khul dicchi.",
      action: "open_app",
      url: "https://web.whatsapp.com",
    };
  }
  if (/(telegram|টেলিগ্রাম)/i.test(lower) && /(open|খোল|খুল|খোলো|on|app|চালু)/i.test(lower)) {
    return {
      response: "Okay, Telegram khul dicchi.",
      action: "open_app",
      url: "https://web.telegram.org",
    };
  }
  if (/(snapchat|স্ন্যাপচ্যাট)/i.test(lower) && /(open|খোল|খুল|খোলো|on|app|চালু)/i.test(lower)) {
    return {
      response: "Thik ache, Snapchat khul dicchi.",
      action: "open_app",
      url: "https://www.snapchat.com",
    };
  }
  if (/(linkedin|লিঙ্কডইন)/i.test(lower) && /(open|খোল|খুল|খোলো|on|app|চালু)/i.test(lower)) {
    return {
      response: "Okay, LinkedIn khul dicchi.",
      action: "open_app",
      url: "https://www.linkedin.com",
    };
  }
  if (/(reddit|রেডিট)/i.test(lower) && /(open|খোল|খুল|খোলো|on|app|চালু)/i.test(lower)) {
    return {
      response: "Thik ache, Reddit khul dicchi.",
      action: "open_app",
      url: "https://www.reddit.com",
    };
  }
  if (/(pinterest|পিন্টারেস্ট)/i.test(lower) && /(open|খোল|খুল|খোলো|on|app|চালু)/i.test(lower)) {
    return {
      response: "Okay, Pinterest khul dicchi.",
      action: "open_app",
      url: "https://www.pinterest.com",
    };
  }

  // === MUSIC STREAMING ===
  if (/(spotify|স্পটিফাই)/i.test(lower)) {
    return {
      response: "Bilkul, Spotify khul dicchi. Apni gan sunte parben.",
      action: "open_app",
      url: "https://open.spotify.com",
    };
  }
  if (/(apple music|apple মিউজিক)/i.test(lower)) {
    return {
      response: "Thik ache, Apple Music khul dicchi.",
      action: "open_app",
      url: "https://music.apple.com",
    };
  }
  if (/(youtube music|ইউটিউব মিউজিক)/i.test(lower)) {
    return {
      response: "Okay, YouTube Music khul dicchi.",
      action: "open_app",
      url: "https://music.youtube.com",
    };
  }
  if (/(soundcloud|সাউন্ডক্লাউড)/i.test(lower)) {
    return {
      response: "Bilkul, SoundCloud khul dicchi.",
      action: "open_app",
      url: "https://soundcloud.com",
    };
  }

  // === VIDEO STREAMING ===
  if (/(netflix|নেটফ্লিক্স)/i.test(lower)) {
    return {
      response: "Thik ache, Netflix khul dicchi. Movie enjoy korun!",
      action: "open_app",
      url: "https://www.netflix.com",
    };
  }
  if (/(amazon prime|prime video|আমেজন প্রাইম)/i.test(lower)) {
    return {
      response: "Okay, Amazon Prime Video khul dicchi.",
      action: "open_app",
      url: "https://www.primevideo.com",
    };
  }
  if (/(disney|ডিজনি|hotstar)/i.test(lower)) {
    return {
      response: "Bilkul, Disney+ Hotstar khul dicchi.",
      action: "open_app",
      url: "https://www.hotstar.com",
    };
  }

  // === SHOPPING ===
  if (/(amazon|আমেজন|আমাজন)/i.test(lower) && /(open|খোল|khul)/i.test(lower)) {
    return {
      response: "Thik ache, Amazon khul dicchi. Shopping korun!",
      action: "open_app",
      url: "https://www.amazon.com",
    };
  }
  if (/(flipkart|ফ্লিপকার্ট)/i.test(lower)) {
    return {
      response: "Okay, Flipkart khul dicchi.",
      action: "open_app",
      url: "https://www.flipkart.com",
    };
  }
  if (/(daraz|দারাজ)/i.test(lower)) {
    return {
      response: "Bilkul, Daraz khul dicchi. Bangladesh e shopping korun!",
      action: "open_app",
      url: "https://www.daraz.com.bd",
    };
  }
  if (/(ebay|ইবে)/i.test(lower)) {
    return {
      response: "Thik ache, eBay khul dicchi.",
      action: "open_app",
      url: "https://www.ebay.com",
    };
  }
  if (/(chaldal|চলদল)/i.test(lower)) {
    return {
      response: "Okay, Chaldal khul dicchi. Groceries order korun.",
      action: "open_app",
      url: "https://www.chaldal.com",
    };
  }

  // === EMAIL ===
  if (/(gmail|জিমেইল|email|ইমেইল|mail|মেইল)/i.test(lower) && /(open|খোল|খুল|compose|new|write|লেখ|পাঠা)/i.test(lower)) {
    return {
      response: "Bilkul, Gmail khul dicchi. Apni email pathate parben.",
      action: "open_app",
      url: "https://mail.google.com",
    };
  }
  if (/(outlook|আউটলুক|hotmail)/i.test(lower)) {
    return {
      response: "Thik ache, Outlook khul dicchi.",
      action: "open_app",
      url: "https://outlook.live.com",
    };
  }

  // === MAPS & LOCATION ===
  if (/(map|ম্যাপ|location|লোকেশন|where am i|আমি কোথায়|direction|দিক)/i.test(lower) && /(open|খোল|show|দেখাও|find|খুঁজ)/i.test(lower)) {
    return {
      response: "Okay, Google Maps khul dicchi. Location khuje ber korbo.",
      action: "open_app",
      url: "https://maps.google.com",
    };
  }

  // === DEVELOPER TOOLS ===
  if (/(github|গিটহাব|গিট)/i.test(lower)) {
    return {
      response: "Bilkul, GitHub khul dicchi. Code ta dekhun.",
      action: "open_app",
      url: "https://github.com",
    };
  }
  if (/(stack overflow|স্ট্যাক ওভারফ্লো)/i.test(lower)) {
    return {
      response: "Thik ache, Stack Overflow khul dicchi.",
      action: "open_app",
      url: "https://stackoverflow.com",
    };
  }
  if (/(chatgpt|chat gpt|চ্যাটজিপিটি|চ্যাটgpt)/i.test(lower)) {
    return {
      response: "Okay, ChatGPT khul dicchi.",
      action: "open_app",
      url: "https://chat.openai.com",
    };
  }
  if (/(gemini|জেমিনি|google ai)/i.test(lower)) {
    return {
      response: "Bilkul, Google Gemini khul dicchi.",
      action: "open_app",
      url: "https://gemini.google.com",
    };
  }

  // === KNOWLEDGE & SEARCH ===
  if (/(wikipedia|উইকিপিডিয়া)/i.test(lower) && /(open|খোল|search|look up|খুঁজ)/i.test(lower)) {
    return {
      response: "Thik ache, Wikipedia khul dicchi.",
      action: "open_app",
      url: "https://www.wikipedia.org",
    };
  }
  if (/(translate|অনুবাদ|translate)/i.test(lower)) {
    return {
      response: "Okay, Google Translate khul dicchi. Apni jekichu translate korte parben.",
      action: "open_app",
      url: "https://translate.google.com",
    };
  }

  // === MATH CALCULATIONS — PUT FIRST so it doesn't conflict with time/date ===
  // Match patterns like "what is 5 plus 3" or "calculate 5 + 3" or "5 times 3"
  const mathMatch = lower.match(/(?:what(?:'s| is)|calculate|compute|how much is|ki hocche)\s*(\d+(?:\.\d+)?)\s*(plus|minus|divided by|times|multiplied by|x|\+|\-|\*|\/)\s*(\d+(?:\.\d+)?)/i);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2].toLowerCase();
    const b = parseFloat(mathMatch[3]);
    let result: number;
    let opStr: string;
    switch (op) {
      case "plus": case "+":
        result = a + b; opStr = "jog";
        break;
      case "minus": case "-":
        result = a - b; opStr = "biyog";
        break;
      case "times": case "multiplied by": case "x": case "*":
        result = a * b; opStr = "gun";
        break;
      case "divided by": case "/":
        if (b === 0) {
          return {
            response: "Sir, 0 diye vag kora jay na. Onno number try korun.",
          };
        }
        result = a / b; opStr = "vag";
        break;
      default:
        return null;
    }
    const finalResult = Number.isInteger(result) ? result.toString() : result.toFixed(2);
    return {
      response: `Sir, ${a} ${opStr} ${b} hocche ${finalResult}.`,
    };
  }

  // === TIME & DATE — made more specific to avoid false matches ===
  if (/\b(what\s+(?:is\s+the\s+)?time|what\s+time|কয়টা\s*বাজে|কি বাজে|কত সময়|somoy ki|somoy koto|time koto)\b/i.test(lower)) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    const timeStr = `${h12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    return {
      response: `Sir, ekhon somoy hocche ${timeStr}.`,
    };
  }
  if (/\b(what\s+(?:is\s+(?:the|today'?s)?)?\s*date|today'?s date|কত তারিখ|কি তারিখ|আজকে কত|tarikh koto|tarikh ki)\b/i.test(lower)) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return {
      response: `Sir, ajker tarikh ${dateStr}.`,
    };
  }
  if (/\b(what\s+(?:is\s+(?:the|today'?s)?)?\s*day|today'?s day|what\s+day|কি বার|কোন দিন|kon din|ki bar|aj ki bar)\b/i.test(lower)) {
    const now = new Date();
    const day = now.toLocaleDateString("en-US", { weekday: "long" });
    return {
      response: `Sir, aj ${day} bar.`,
    };
  }

  // === WEATHER — made more specific ===
  if (/\b(weather|আবহাওয়া|তাপমাত্রা|temperature)\b/i.test(lower) && !/app|open|খোল/i.test(lower)) {
    return {
      response: "Sir, weather update dekhte Google Weather khul dicchi.",
      action: "open_url",
      url: "https://www.google.com/search?q=weather+today",
    };
  }

  // === JOKES / QUOTES / FACTS / PROVERBS ===
  if (/(joke|জোক|মজা|funny|হাসির|hasir|tin tar)/i.test(lower) && /(tell|বল|say|একটা|one|a)/i.test(lower)) {
    const jokes = [
      "Sir, ekta jokes suniye: Proffessor student ke bollo, 'Tomar naam ki?' Student: 'Sir, nam holo nam.' Proffessor: 'Tumi nam baad! Tarpor tomar naam ki?'",
      "Ekta manush hospital e gelo, doctor: 'Ki problem?' Manush: 'Doctor, ami kichu mone rakhite pari na.' Doctor: 'Tarpor eita kobe theke hocche?' Manush: 'Kobe theke ki?'",
      "Cheler baba: 'Beta, porashar somoy phone chara aar ki koro?' Chele: 'Baba, somoy geley ghumiye pori.'",
      "Teacher: 'Tumi ki kal school e chile?' Student: 'Na sir, ami toh aaj school e.'",
      "Maa: 'Beta, roga khao?' Chele: 'Na maa, peta bhar.' Maa: 'Tahole toh aar porer bar khete parbe na!' Chele: 'Tahole ami aibar aratio kheye nilam!'",
    ];
    return {
      response: jokes[Math.floor(Math.random() * jokes.length)],
    };
  }
  if (/(quote|উক্তি|বানী|quote|inspirational|motivational)/i.test(lower) && /(tell|বল|say|একটা|one|a|some)/i.test(lower)) {
    const quotes = [
      "Sir, ekta Sundor Ukti: 'Sotti ebong prostutoti holo jiboner shrestho neyti.' - Mahatma Gandhi",
      "Sir, 'Sadhonai siddhi.' - Rabindranath Tagore",
      "Sir, 'Bishwas e bishonno hoy.' - Swami Vivekananda",
      "Sir, 'Bolo jabe, koro jabe, ghuchbe take.' - Swami Vivekananda",
      "Sir, 'Manusher jonno bhalobasha e soi prothom dhormo.' - Lalon Shah",
      "Sir, 'Jibon ek ti chhara gan, take gan giye sono.' - Rabindranath Tagore",
    ];
    return {
      response: quotes[Math.floor(Math.random() * quotes.length)],
    };
  }
  if (/(fact|তথ্য|interesting fact|random fact)/i.test(lower) && /(tell|বল|say|একটা|one|a|some)/i.test(lower)) {
    const facts = [
      "Sir, ekta interesting fact: Octopus er 3ti hridoy ache. Ekta main hridoy, aar dita branch kore gill-relation e.",
      "Sir, did you know? Honey kaboi porto nei. 3000 bosor purono honey o khaoa jay.",
      "Sir, ekta fact: Shirajuddawla er kache chilo esob khal shippo, jetar dur 100km.",
      "Sir, sandhya tara ektai, kintu she ti bohu door e, amra take alada alada dekhi due to atmospheric refraction.",
      "Sir, banana ekti berry (fruit), kintu strawberry noy. Strawberry ti 'aggregate fruit' ba 'accessory fruit'.",
    ];
    return {
      response: facts[Math.floor(Math.random() * facts.length)],
    };
  }
  if (/(proverb|প্রবাদ|বাক্য|বাণী|bangla proverb|বাংলা প্রবাদ)/i.test(lower) && /(tell|বল|say|একটা|one|a|some)/i.test(lower)) {
    const proverbs = [
      "Sir, ekta Bangla Proverb: 'Aai bai kathal gela, bai to kholbe na.' - mane, boro baper kotha.",
      "Sir: 'Bhera bhashle koi, shantir kalei khai.' - shantir bhasha.",
      "Sir: 'Tin tin bhai, ekta matro.' - bhul kotha, karon tin bhai alada alada.",
      "Sir: 'Chor machere koi na, koi churi kore na.' - khub chena proverb.",
      "Sir: 'Kala bhajar shai, tuje bhalo khai.' - lok 际 kotha.",
    ];
    return {
      response: proverbs[Math.floor(Math.random() * proverbs.length)],
    };
  }
  if (/(story|গল্প|একটা গল্প|tell me a story|golpo)/i.test(lower) && /(tell|বল|say|একটা|one|a)/i.test(lower)) {
    const stories = [
      "Sir, ekta choto golpo: Ekta harti o ekta kachu bondhu chilo. Ekdin harti bolo, 'Ami tomar ghare jabo.' Kachu bolo, 'Esso, kintu tomar ghare thakbe na.'",
      "Sir, ekta choto golpo: Akbar badshah er songe Birbal chilo. Akbar bollo, 'Birbal, prithivir sobcheye srestho manush ke?' Birbal bollo, 'Jahapana, she je dan kore, sukh pabe.' Akbar bollo, 'Tahole tumi?' Birbal hasiye bollo, 'Na jahapana, ami toh boli na, ami chai na.'",
      "Sir, ekta choto golpo: Ekta kumir chilo. She bollo, 'Ami onek kosto peyechi.' Ekta bird bolo, 'Keno?' Kumir kandey bollo, 'Ami onek choto holeychi, kintu amar bondhu ra amake thik korei dey na.'",
    ];
    return {
      response: stories[Math.floor(Math.random() * stories.length)],
    };
  }
  if (/(shayari|শায়রি|poem|কবিতা|kobita)/i.test(lower) && /(tell|বল|say|একটা|one|a|some)/i.test(lower)) {
    const shayaris = [
      "Sir, ekta shayari: 'Chokher jole bhese gelo, moner kotha boli na. Kotha bola sohoj, kintu mon ke bojha kothin.'",
      "Sir, ekta shayari: 'Ami tomar moner kotha jani na, kintu tomar chokher jole venge pran. Tomar hashi te, amar jibon.'",
      "Sir, ekta shayari: 'Bondhu, tumi bondhu, tumi bondhu hao. Bondhu hao, na holey chere dao.'",
      "Sir, ekta shayari: 'Bhalobasha ekta shopno, shopno te bhalobasha, bhalobasha te shopno, ekmon te.'",
    ];
    return {
      response: shayaris[Math.floor(Math.random() * shayaris.length)],
    };
  }

  // === GENERAL SEARCH ===
  if (/(search|খুঁজ|find|payda|search for)/i.test(lower) && !/(app|open|খোল|google|youtube|facebook|instagram|whatsapp|twitter|spotify|netflix|amazon|flipkart|daraz|gmail|maps|github|chatgpt|gemini|wikipedia|translate)/i.test(lower)) {
    // Extract search query
    const queryMatch = lower.match(/(?:search(?:\s+for)?|খুঁজ|find|payda)\s+(?:for\s+)?(.+)/i);
    const query = queryMatch?.[1]?.trim() || text;
    return {
      response: `Bilkul sir, '${query}' er jonno Google search kore dicchi.`,
      action: "open_url",
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    };
  }
  if (/(youtube te|youtube te|youtube e)/i.test(lower) && /(search|খুঁজ|find|dekhao|দেখাও)/i.test(lower)) {
    const queryMatch = lower.match(/(?:youtube\s*(?:te|e|on))\s*(?:search|খুঁজ|find|dekhao|দেখাও)\s+(?:for\s+)?(.+)/i);
    const query = queryMatch?.[1]?.trim() || "trending videos";
    return {
      response: `Thik ache sir, YouTube te '${query}' khul dicchi.`,
      action: "play_song",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    };
  }

  // === NOTES & REMINDERS ===
  if (/(note|নোট|likho|likh|লেখ|take a note|write down|remember this)/i.test(lower) && !/(open|app|khul)/i.test(lower)) {
    const noteMatch = lower.match(/(?:note|নোট|likho|likh|লেখ|take a note|write down|remember this)\s*:?\s*(.+)/i);
    const note = noteMatch?.[1]?.trim() || "note";
    return {
      response: `Sir, ekta note add kore dicchi: '${note}'. Ami mone rakhbo.`,
      action: "add_task",
      task: `Note: ${note}`,
    };
  }
  if (/(reminder|রিমাইন্ডার|mone kor|remember to)/i.test(lower) && !/(open|app|khul)/i.test(lower)) {
    const reminderMatch = lower.match(/(?:reminder|রিমাইন্ডার|mone kor|remember to)\s*:?\s*(?:to\s+)?(.+)/i);
    const reminder = reminderMatch?.[1]?.trim() || "reminder";
    return {
      response: `Okay sir, '${reminder}' er jonno reminder set kore dicchi.`,
      action: "add_task",
      task: `Reminder: ${reminder}`,
    };
  }

  // === NEWS ===
  if (/(news|খবর|samachar|তাজা খবর)/i.test(lower) && !/(headline|today|headlines)/i.test(lower)) {
    return {
      response: "Sir, notun khobor Google News e khul dicchi.",
      action: "open_url",
      url: "https://news.google.com",
    };
  }

  return null;
}

export function useArcherAI() {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "assistant",
      content: WELCOME_MESSAGE,
      timestamp: Date.now(),
      spoken: false,
    },
  ]);
  const [headlines] = useState<Headline[]>(INITIAL_HEADLINES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [error, setError] = useState<string>("");

  // === FIXED: Voice type with proper hydration ===
  const [voiceType, setVoiceType] = useState<"jarvis" | "friday" | null>(null);
  const voiceTypeRef = useRef<"jarvis" | "friday">("jarvis");
  const isMutedRef = useRef(isMuted);
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef<string>("");
  const chatMessagesRef = useRef(chatMessages);
  const shouldListenRef = useRef(false);
  const manualStopRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const permissionRequestedRef = useRef(false);

  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

  // Hydrate voice type from localStorage
  useEffect(() => {
    let saved: "jarvis" | "friday" = "jarvis";
    try {
      const stored = localStorage.getItem("archer-voice-type");
      if (stored === "friday" || stored === "jarvis") saved = stored;
    } catch {}
    const t = setTimeout(() => {
      setVoiceType(saved);
      voiceTypeRef.current = saved;
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (voiceType === null) return;
    voiceTypeRef.current = voiceType;
    try {
      localStorage.setItem("archer-voice-type", voiceType);
    } catch {}
  }, [voiceType]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Feature detection
  const micSupported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const ttsSupported =
    typeof window !== "undefined" && !!window.speechSynthesis;

  // Load TTS voices
  useEffect(() => {
    if (!ttsSupported) return;
    const load = () => {
      window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener?.("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", load);
    };
  }, [ttsSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {}
      if (ttsSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, []);

  // === TEXT-TO-SPEECH — FIXED: clearer voice, better pitch for understanding ===
  const speak = useCallback(
    (text: string, opts?: { onEnd?: () => void; onStart?: () => void }) => {
      // Cleanup any previous timeout/keep-alive
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }

      if (!ttsSupported || isMutedRef.current || !text.trim()) {
        opts?.onEnd?.();
        return;
      }
      try {
        window.speechSynthesis.cancel();

        // Wait briefly after cancel (Chrome race condition fix)
        setTimeout(() => {
          try {
            const utter = new SpeechSynthesisUtterance(text);

            // === FIXED: Pick best natural-sounding voice ===
            const voice = pickBestVoice(voiceTypeRef.current);
            if (voice) {
              utter.voice = voice;
              utter.lang = voice.lang;
            } else {
              utter.lang = "en-US";
            }

            // === FIXED: Voice settings for CLARITY ===
            // JARVIS: not too deep (0.95 instead of 0.85) for clarity, rate 0.95 (slightly slower)
            // FRIDAY: pitch 1.1 (not too high), rate 1.0
            if (voiceTypeRef.current === "jarvis") {
              utter.rate = 0.95;  // slightly slower = clearer
              utter.pitch = 0.95;  // not too deep
              utter.volume = 1.0;
            } else {
              utter.rate = 1.0;
              utter.pitch = 1.1;
              utter.volume = 1.0;
            }

            let started = false;
            let ended = false;

            const safeEnd = () => {
              if (ended) return;
              ended = true;
              if (speakTimeoutRef.current) {
                clearTimeout(speakTimeoutRef.current);
                speakTimeoutRef.current = null;
              }
              if (keepAliveRef.current) {
                clearInterval(keepAliveRef.current);
                keepAliveRef.current = null;
              }
              setOrbState("idle");
              opts?.onEnd?.();
            };

            utter.onstart = () => {
              started = true;
              setOrbState("speaking");
              opts?.onStart?.();

              // Chrome bug workaround: keep speech alive
              keepAliveRef.current = setInterval(() => {
                if (window.speechSynthesis.speaking) {
                  window.speechSynthesis.pause();
                  window.speechSynthesis.resume();
                } else {
                  if (keepAliveRef.current) {
                    clearInterval(keepAliveRef.current);
                    keepAliveRef.current = null;
                  }
                }
              }, 10000);

              // Hard timeout
              const estimatedMs = Math.min(30000, Math.max(3000, text.length * 80 + 3000));
              speakTimeoutRef.current = setTimeout(() => {
                if (!ended) {
                  try {
                    window.speechSynthesis.cancel();
                  } catch {}
                  safeEnd();
                }
              }, estimatedMs);
            };

            utter.onend = safeEnd;
            utter.onerror = (e: any) => {
              console.warn("Archer TTS error:", e?.error || "unknown");
              safeEnd();
            };

            // If onstart never fires within 1.5s, force start state
            const startFallback = setTimeout(() => {
              if (!started && !ended) {
                setOrbState("speaking");
                opts?.onStart?.();
              }
            }, 1500);

            const origOnEnd = utter.onend;
            const origOnError = utter.onerror;
            utter.onend = (ev) => {
              clearTimeout(startFallback);
              origOnEnd?.call(utter, ev);
            };
            utter.onerror = (ev) => {
              clearTimeout(startFallback);
              origOnError?.call(utter, ev);
            };

            window.speechSynthesis.speak(utter);
          } catch (e) {
            console.error("Archer TTS speak() failed:", e);
            setOrbState("idle");
            opts?.onEnd?.();
          }
        }, 80);
      } catch (e) {
        console.error("Archer TTS setup failed:", e);
        setOrbState("idle");
        opts?.onEnd?.();
      }
    },
    [ttsSupported]
  );

  // === SPEECH-TO-TEXT — FIXED: Bangla language for STT ===
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!micSupported) {
      setError("Voice input requires Chrome or Edge browser. See Settings → System Info.");
      return;
    }
    setError("");
    finalTranscriptRef.current = "";
    setLastTranscript("");
    shouldListenRef.current = true;
    manualStopRef.current = false;

    // Permission pre-flight
    if (!permissionRequestedRef.current && navigator.mediaDevices?.getUserMedia) {
      permissionRequestedRef.current = true;
      navigator.mediaDevices
        ?.getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((t) => t.stop());
          actualStartRec();
        })
        .catch((err) => {
          console.warn("Mic permission denied:", err);
          if (err?.name === "NotAllowedError") {
            setError("Microphone access denied. Please allow it in your browser settings.");
          } else if (err?.name === "NotFoundError") {
            setError("No microphone found. Please connect a microphone.");
          } else {
            setError(`Microphone error: ${err?.message || "unknown"}`);
          }
          shouldListenRef.current = false;
          setIsListening(false);
        });
    } else {
      actualStartRec();
    }

    function actualStartRec() {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return;
      try {
        recognitionRef.current?.abort();
      } catch {}
      const rec: SpeechRecognitionLike = new SR();
      recognitionRef.current = rec;

      // === FIXED: bn-IN for Bangla recognition ===
      rec.lang = "bn-IN";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        setOrbState("listening");
      };

      rec.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) final += res[0].transcript;
          else interim += res[0].transcript;
        }
        if (final) {
          finalTranscriptRef.current = final;
        }
        setLastTranscript(final || interim);
      };

      rec.onerror = (e: { error: string }) => {
        console.warn("SpeechRecognition error:", e.error);
        if (e.error === "no-speech") {
          return;
        }
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setIsListening(false);
          setOrbState("idle");
          shouldListenRef.current = false;
          manualStopRef.current = true;
          setError("Microphone access denied. Click the 🔒 icon in your browser address bar to allow.");
        } else if (e.error === "aborted") {
          // Silent
        } else if (e.error === "network") {
          setError("Network error during voice recognition. Check your connection.");
          setIsListening(false);
          setOrbState("idle");
        } else if (e.error === "audio-capture") {
          setError("No microphone detected. Connect a microphone.");
          setIsListening(false);
          setOrbState("idle");
          shouldListenRef.current = false;
        } else {
          console.warn("Unknown SR error, will auto-restart:", e.error);
        }
      };

      rec.onend = () => {
        if (shouldListenRef.current && !manualStopRef.current) {
          // Process any final transcript first
          const transcript = finalTranscriptRef.current.trim();
          if (transcript) {
            finalTranscriptRef.current = "";
            setLastTranscript("");
            handleUserInputRef.current(transcript, { fromVoice: true });
          }
          // Brief delay then restart (Chrome needs this)
          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(() => {
            try {
              if (shouldListenRef.current && !manualStopRef.current) {
                rec.start();
              }
            } catch (e) {
              try {
                rec.abort();
              } catch {}
              setTimeout(() => {
                if (shouldListenRef.current && !manualStopRef.current) {
                  try {
                    rec.start();
                  } catch {}
                }
              }, 100);
            }
          }, 200); // === FIXED: 200ms (was 300ms) for faster reconnect ===
        } else {
          setIsListening(false);
          const transcript = finalTranscriptRef.current.trim();
          if (transcript) {
            handleUserInputRef.current(transcript, { fromVoice: true });
          } else {
            setOrbState("idle");
          }
        }
      };

      try {
        rec.start();
        setIsListening(true);
        setOrbState("listening");
      } catch (e: any) {
        console.warn("Failed to start recognition:", e?.message);
        if (!e?.message?.includes("already started")) {
          setIsListening(false);
          setOrbState("idle");
          setError("Failed to start microphone. Try again.");
          shouldListenRef.current = false;
        }
      }
    }
  }, [micSupported]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    manualStopRef.current = true;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {}
    setIsListening(false);
    setOrbState("idle");
  }, []);

  // === FIXED: handleUserInput with LIGHTNING SPEED ===
  const handleUserInputRef = useRef<(text: string, opts?: { fromVoice?: boolean }) => Promise<void>>(async () => {});

  const handleUserInput = useCallback(
    async (text: string, opts?: { fromVoice?: boolean }) => {
      setError("");
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, userMsg]);

      // Try hard-coded command first (basic + extended)
      const cmd = tryHandleCommand(text) || tryHandleExtendedCommand(text);
      if (cmd) {
        // === FIXED: NO artificial delay — lightning speed ===
        // (Was 250ms before; now 0ms)
        setOrbState("processing");

        // Handle add_task action
        if (cmd.action === "add_task" && cmd.task) {
          setTasks((prev) => [...prev, { id: uid(), text: cmd.task!, done: false }]);
        }

        // === FIXED: Immediately show message AND speak ===
        const aiMsg: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: cmd.response,
          timestamp: Date.now(),
          spoken: !isMuted,
        };
        setChatMessages((prev) => [...prev, aiMsg]);

        // === LIGHTNING: Speak immediately (no delay) ===
        speak(cmd.response, {
          onEnd: () => {
            if (cmd.url) {
              try {
                window.open(cmd.url, "_blank", "noopener,noreferrer");
              } catch {}
            }
          },
        });
        return;
      }

      // Otherwise hit the LLM API endpoint
      setOrbState("processing");
      try {
        const res = await fetch("/api/archer-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: chatMessagesRef.current,
          }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        const reply: string = data.reply ?? "Bujhlam na, abar bolen.";
        const aiMsg: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
          spoken: !isMuted,
        };
        setChatMessages((prev) => [...prev, aiMsg]);
        speak(reply);
      } catch (e) {
        const fallback =
          "Sir, ekhon amar neural network sathe connection totoye galo. Ektar por abar try korun.";
        const aiMsg: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: fallback,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, aiMsg]);
        speak(fallback);
        setOrbState("idle");
      }
    },
    [isMuted, speak]
  );

  // Keep handleUserInputRef in sync (handleUserInput is recreated when isMuted or speak change)
  useEffect(() => {
    const t = setTimeout(() => { handleUserInputRef.current = handleUserInput; }, 0); return () => clearTimeout(t);
  }, [handleUserInput]);

  const sendMessage = useCallback(
    async (text: string) => {
      await handleUserInput(text, { fromVoice: false });
    },
    [handleUserInput]
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const addTask = useCallback((text: string) => {
    setTasks((prev) => [...prev, { id: uid(), text, done: false }]);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && ttsSupported) {
        try {
          window.speechSynthesis.cancel();
          setOrbState("idle");
        } catch {}
      }
      return next;
    });
  }, [ttsSupported]);

  const clearChat = useCallback(() => {
    if (ttsSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setChatMessages([
      {
        id: uid(),
        role: "assistant",
        content: WELCOME_MESSAGE,
        timestamp: Date.now(),
      },
    ]);
    setOrbState("idle");
  }, [ttsSupported]);

  return {
    orbState,
    chatMessages,
    headlines,
    tasks,
    toggleTask,
    addTask,
    sendMessage,
    startListening,
    stopListening,
    isListening,
    isMuted,
    toggleMute,
    lastTranscript,
    clearChat,
    micSupported,
    ttsSupported,
    error,
    voiceType: voiceType ?? "jarvis",
    setVoiceType: (v: "jarvis" | "friday") => setVoiceType(v),
  };
}
