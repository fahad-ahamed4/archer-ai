# 🤖 ARCHER AI — Mobile Jarvis Assistant

> A next-generation voice-controlled AI assistant inspired by Iron Man's JARVIS.
> Built with **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, **shadcn/ui**,
> and powered by the **Z.ai LLM SDK**.

![Archer AI](https://img.shields.io/badge/Archer_AI-v4.0_Aurora-00e5ff?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSIjMDBlNWZmIiBzdHJva2Utd2lkdGg9IjMiLz48dGV4dCB4PSI1MCIgeT0iNjIiIGZvbnQtc2l6ZT0iMzgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMGU1ZmYiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiPkE8L3RleHQ+PC9zdmc+)

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-New_York-000000?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Prerequisites](#-prerequisites)
5. [Installation](#-installation)
6. [Configuration](#-configuration)
7. [Running the App](#-running-the-app)
8. [Project Structure](#-project-structure)
9. [Voice Commands Reference](#-voice-commands-reference)
10. [Browser Support](#-browser-support)
11. [Troubleshooting](#-troubleshooting)
12. [Contributing](#-contributing)
13. [License](#-license)

---

## 🌟 Overview

**Archer AI** is a personal AI friend — not just an assistant, but a companion. Built in the spirit of Tony Stark's JARVIS, it lives in a beautiful aurora-themed web app and responds to your voice in **Banglish** (Bangla in Roman script) — the natural way many Bangladeshis communicate online.

The app speaks with two distinct personalities:
- 🤵 **JARVIS** — Deep, calm, male voice (default)
- 💃 **FRIDAY** — Light, clear, female voice

### What Archer Can Do

- 🎙️ **Voice Recognition** — Continuous listening with auto-restart (Chrome/Edge)
- 🔊 **Natural Text-to-Speech** — Uses Google/Microsoft natural voices
- 🧠 **General Knowledge** — Ask about science, history, geography, famous people
- 📱 **30+ App Commands** — Open Instagram, WhatsApp, Spotify, Netflix, Gmail, GitHub, etc.
- 🧮 **Math Calculations** — "what is 10 times 5" → instant answer
- ⏰ **Time/Date/Day** — Always knows the current time
- 🌤️ **Weather** — Pulls current weather
- 😄 **Entertainment** — Jokes, quotes, facts, proverbs, stories, shayari
- 📝 **Notes & Reminders** — Save quick notes via voice
- 🎮 **Games** — Chess, Ludo, Tetris, Snake, GTA, PUBG, Free Fire, etc.
- 🌍 **Multilingual** — Bangla + English + Hindi (Banglish primary)

---

## ✨ Features

### 🎨 Visual Design — "Aurora Holographic" Theme
- Animated aurora gradient background (deep navy + violet/cyan/pink/gold)
- Glassmorphic cards with backdrop-blur
- Starfield drift particles
- **Cute SVG robot mascot** with 5 mood states (idle/listening/speaking/thinking/happy)
- Animated halo rings around mascot
- Smooth Framer Motion entrance animations
- Custom particle canvas (optional, in `particle-orb.tsx`)

### 🎙️ Voice Pipeline
- **Speech-to-Text**: Web Speech API (`bn-IN` recognition)
- **Text-to-Speech**: Web Speech Synthesis with:
  - Google UK English Male/Female (preferred)
  - Microsoft natural voices (fallback)
  - Chrome bug workaround (10s keep-alive)
  - Hard timeout fallback (no silent failures)
  - Race condition fix (80ms delay after cancel)

### ⚡ Lightning Speed
- 0ms artificial delay for command responses
- 200ms reconnect timer (was 300ms)
- Instant TTS start
- Concurrent message display + speak

### 🎭 2 Voice Personalities
- **JARVIS**: pitch 0.95, rate 0.95 (deep but clear)
- **FRIDAY**: pitch 1.1, rate 1.0 (light and clear)
- Persisted in `localStorage`

### ♿ Accessibility
- `role="dialog"` + `aria-modal` for drawers
- Focus trap (Tab/Shift+Tab within drawers)
- Escape key closes drawers
- `prefers-reduced-motion` respected
- `aria-label` on all controls
- Mobile zoom enabled (WCAG 1.4.4)
- `aria-live` for dynamic messages

### 🔒 Security
- Input length validation (1000 char max)
- History sanitization (prompt injection protection)
- LLM call timeout (15s AbortController)
- Body size limit

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui (New York) |
| **UI Components** | Lucide icons, Framer Motion |
| **Database** | Prisma ORM (SQLite) |
| **AI Backend** | z-ai-web-dev-sdk |
| **Voice Input** | Web Speech API (SpeechRecognition) |
| **Voice Output** | Web Speech API (SpeechSynthesis) |
| **State Management** | React hooks + refs |
| **Linting** | ESLint 9 |
| **Package Manager** | Bun (recommended) or npm/yarn |

---

## ✅ Prerequisites

Before installing, make sure you have:

1. **Node.js** ≥ 18.17 (Node 20+ recommended)
   ```bash
   node --version
   ```

2. **Bun** (recommended) or npm/yarn/pnpm
   ```bash
   # Install Bun (fastest)
   curl -fsSL https://bun.sh/install | bash
   
   # Or use npm
   npm install -g npm@latest
   ```

3. **A modern browser** for voice features:
   - **Google Chrome** (recommended) — full voice support
   - **Microsoft Edge** — full voice support
   - Firefox, Safari, iOS — text chat works, voice limited

4. **Z.ai SDK API access** — The app uses `z-ai-web-dev-sdk` which needs to be configured.

---

## 📦 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/archer-ai.git
cd archer-ai
```

### Step 2: Install Dependencies

**With Bun (recommended — fastest):**
```bash
bun install
```

**With npm:**
```bash
npm install
```

**With pnpm:**
```bash
pnpm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# .env
DATABASE_URL="file:./db/custom.db"
```

> 💡 **Note**: The Z.ai SDK reads its credentials from environment configuration.
> Make sure your environment has the SDK credentials available (typically via
> `ZAI_API_KEY` or a `.z-ai-config` file — see Z.ai SDK docs for details).

### Step 4: Initialize the Database (Optional — only if using Prisma features)

```bash
bun run db:push
# or
npx prisma db push --accept-data-loss
```

### Step 5: Start the Development Server

```bash
bun run dev
# or
npm run dev
```

The app will start on **http://localhost:3000**

### Step 6: Grant Microphone Permission

When you first click the mic button:
1. Chrome will prompt for microphone access
2. Click **"Allow"**
3. Start speaking — Archer will respond in Banglish

---

## ⚙️ Configuration

### Voice Type Settings

Open the **Settings** drawer (gear icon top-right) to:
- Switch between **JARVIS** (male) and **FRIDAY** (female) voices
- Mute/unmute voice output
- View browser support status

### Browser Support Detection

The app auto-detects your browser and OS, showing a helpful banner if voice features are limited.

### Customizing the LLM Persona

Edit `src/app/api/archer-chat/route.ts` and modify the `ARCHER_SYSTEM_PROMPT` constant to change Archer's personality, language style, or behavior.

### Customizing Commands

All hardcoded commands live in `src/hooks/use-archer-ai.ts`:
- `tryHandleCommand()` — Basic commands (greetings, songs, who-are-you)
- `tryHandleExtendedCommand()` — 30+ extended commands (apps, math, jokes, etc.)

To add a new command:
```typescript
if (/your-regex-here/i.test(lower)) {
  return {
    response: "Bilkul, eto kore dicchi.",
    action: "open_url",  // optional: "open_url" | "play_song" | "open_app" | "add_task"
    url: "https://example.com",  // required if action is open_url/play_song/open_app
  };
}
```

---

## 🚀 Running the App

### Development Mode

```bash
bun run dev
```

### Production Build

```bash
bun run build
bun run start
```

### Lint Check

```bash
bun run lint
```

### Database Operations

```bash
bun run db:push      # Push schema changes
bun run db:generate  # Regenerate Prisma client
bun run db:migrate   # Create migration
bun run db:reset     # Reset database
```

---

## 📁 Project Structure

```
archer-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── archer-chat/
│   │   │       └── route.ts          # LLM API endpoint (Banglish persona)
│   │   ├── globals.css               # Aurora Holographic theme
│   │   ├── layout.tsx                # Root layout + metadata
│   │   └── page.tsx                  # Home page (dashboard mount)
│   ├── components/
│   │   ├── archer-ai/
│   │   │   ├── archer-dashboard.tsx # Main dashboard UI (Aurora theme)
│   │   │   ├── chat-history.tsx     # Slide-in chat drawer
│   │   │   ├── jarvis-mascot.tsx    # Cute SVG robot mascot (5 moods)
│   │   │   ├── particle-orb.tsx     # Canvas particle orb (legacy)
│   │   │   └── settings-drawer.tsx  # Voice switch + browser info
│   │   └── ui/                       # shadcn/ui components
│   ├── hooks/
│   │   ├── use-archer-ai.ts          # Voice + chat state machine (main logic)
│   │   ├── use-mobile.ts             # Mobile detection
│   │   └── use-toast.ts              # Toast notifications
│   └── lib/
│       ├── browser-support.ts        # Browser/OS detection
│       ├── db.ts                     # Prisma client
│       └── utils.ts                  # Tailwind cn() helper
├── prisma/
│   └── schema.prisma                 # Database schema
├── public/                           # Static assets
├── .env                              # Environment variables (NOT committed)
├── .env.example                      # Example env file
├── .gitignore
├── README.md                         # This file
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── eslint.config.mjs
└── components.json                    # shadcn/ui config
```

---

## 🎤 Voice Commands Reference

### 📱 App Opening Commands

| Say this | Archer responds |
|----------|----------------|
| "open facebook" | "Okay, Facebook app khol dicchi." |
| "open instagram" | "Thik ache, Instagram khul dicchi." |
| "open whatsapp" | "Thik ache, WhatsApp khul dicchi." |
| "open twitter" | "Okay, Twitter/X khul dicchi." |
| "open telegram" | "Okay, Telegram khul dicchi." |
| "open snapchat" | "Thik ache, Snapchat khul dicchi." |
| "open linkedin" | "Okay, LinkedIn khul dicchi." |
| "open reddit" | "Thik ache, Reddit khul dicchi." |
| "open pinterest" | "Okay, Pinterest khul dicchi." |

### 🎵 Music & Video

| Command | Response |
|---------|----------|
| "open spotify" | "Bilkul, Spotify khul dicchi." |
| "open apple music" | "Thik ache, Apple Music khul dicchi." |
| "open youtube music" | "Okay, YouTube Music khul dicchi." |
| "open soundcloud" | "Bilkul, SoundCloud khul dicchi." |
| "open netflix" | "Thik ache, Netflix khul dicchi." |
| "open amazon prime" | "Okay, Amazon Prime Video khul dicchi." |
| "open disney" | "Bilkul, Disney+ Hotstar khul dicchi." |

### 🛒 Shopping

| Command | Response |
|---------|----------|
| "open amazon" | "Thik ache, Amazon khul dicchi." |
| "open flipkart" | "Okay, Flipkart khul dicchi." |
| "open daraz" | "Bilkul, Daraz khul dicchi." |
| "open ebay" | "Thik ache, eBay khul dicchi." |
| "open chaldal" | "Okay, Chaldal khul dicchi." |

### 📧 Email & Dev Tools

| Command | Response |
|---------|----------|
| "open gmail" | "Bilkul, Gmail khul dicchi." |
| "open outlook" | "Thik ache, Outlook khul dicchi." |
| "open maps" | "Okay, Google Maps khul dicchi." |
| "open github" | "Bilkul, GitHub khul dicchi." |
| "open stack overflow" | "Thik ache, Stack Overflow khul dicchi." |
| "open chatgpt" | "Okay, ChatGPT khul dicchi." |
| "open gemini" | "Bilkul, Google Gemini khul dicchi." |
| "open wikipedia" | "Thik ache, Wikipedia khul dicchi." |
| "open translate" | "Okay, Google Translate khul dicchi." |

### ⏰ Time, Date, Day

| Command | Response |
|---------|----------|
| "what is the time" | "Sir, ekhon somoy hocche 5:14 PM." |
| "what is the date" | "Sir, ajker tarikh Monday, September 30, 2024." |
| "what is the day" | "Sir, aj Monday bar." |

### 🌤️ Weather

| Command | Response |
|---------|----------|
| "what is the weather today" | Opens Google Weather |

### 🧮 Math

| Command | Response |
|---------|----------|
| "what is 5 plus 3" | "Sir, 5 jog 3 hocche 8." |
| "what is 10 times 5" | "Sir, 10 gun 5 hocche 50." |
| "what is 100 minus 25" | "Sir, 100 biyog 25 hocche 75." |
| "what is 20 divided by 4" | "Sir, 20 vag 4 hocche 5." |

### 😄 Entertainment

| Command | Response |
|---------|----------|
| "tell me a joke" | Random Bangla joke |
| "tell me a quote" | Famous person's quote |
| "tell me a fact" | Interesting fact |
| "tell me a proverb" | Bengali proverb |
| "tell me a story" | Short story |
| "tell me a shayari" | Shayari/poem |

### 🎮 Games

| Command | Response |
|---------|----------|
| "play chess game" | "Bilkul, chess game khul dicchi!" |
| "play ludo" | "Bilkul, ludo game khul dicchi!" |
| "play motu patlu" | "Bilkul, Motu Patlu game choley dicchi!" |
| "play snake" / "tetris" / "sudoku" / "2048" / etc. | Game opens |

### 📝 Notes & Reminders

| Command | Response |
|---------|----------|
| "note: buy milk tomorrow" | "Sir, ekta note add kore dicchi: 'buy milk tomorrow'." |
| "reminder: call mother" | "Okay sir, 'call mother' er jonno reminder set kore dicchi." |

### 🎵 Songs

| Command | Response |
|---------|----------|
| "play sunflower song" | "Bilkul, sunflower gaan bajey dicchi." |
| "একটা গান বাজাও" (Bangla) | "Bilkul, ekta gaan chala diya." |

### 🌍 General Knowledge (LLM-powered)

Ask anything! Examples:
- "who is rabindranath tagore"
- "what is photosynthesis"
- "tell me about bangladesh history"
- "who is albert einstein"
- "explain gravity"
- "what is artificial intelligence"

---

## 🌐 Browser Support

| Browser | Voice Input | Voice Output | Text Chat | Notes |
|---------|-------------|---------------|-----------|-------|
| **Chrome (Desktop)** | ✅ Full | ✅ Full | ✅ | Best experience |
| **Edge (Desktop)** | ✅ Full | ✅ Full | ✅ | Full support |
| **Chrome (Android)** | ✅ Full | ✅ Full | ✅ | Mobile-optimized |
| **Firefox** | ❌ Limited | ✅ Full | ✅ | Text chat works |
| **Safari (Desktop)** | ❌ Limited | ✅ Full | ✅ | No voice input |
| **Safari (iOS)** | ❌ No | ✅ Full | ✅ | Install Chrome on iOS |
| **Any browser** | — | — | ✅ | Text chat always works |

The app shows a banner explaining limitations on unsupported browsers.

---

## 🔧 Troubleshooting

### Voice Input Not Working

1. **Check browser**: Use Chrome or Edge (best support)
2. **Allow microphone**: Click 🔒 icon in address bar → Site settings → Microphone → Allow
3. **HTTPS required**: Voice APIs only work on HTTPS or `http://localhost`
4. **No mic detected**: Connect a microphone to your device
5. **Try refresh**: Sometimes the Web Speech API needs a page reload

### TTS (Voice Output) Silent

1. **Check Settings drawer**: Ensure voice is not muted
2. **Switch voice**: Try JARVIS → FRIDAY → back to JARVIS
3. **Chrome bug**: The app has a 10-second keep-alive workaround, but if TTS still fails:
   - Refresh the page
   - Check system volume
   - Try a different voice in Settings

### LLM Not Responding

1. Check internet connection
2. The LLM endpoint has a 15-second timeout — long questions may fail
3. Check browser console for errors

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
bun run dev

# Reinstall dependencies
rm -rf node_modules
bun install
```

### TypeScript Errors

```bash
bun run lint
```

### Database Issues

```bash
# Reset database
bun run db:reset

# Push fresh schema
bun run db:push
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Functional components with hooks
- Tailwind CSS for styling (no inline styles unless dynamic)
- shadcn/ui for component primitives
- All responses in Banglish (Bangla in Roman script)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

```
MIT License

Copyright (c) 2024 Archer AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Iron Man / JARVIS** — Inspiration from the Marvel Cinematic Universe
- **Tony Stark** — For showing us what a personal AI friend could be
- **OpenAI, Google, Anthropic** — For pushing AI accessibility forward
- **Bangladesh developer community** — For inspiring Banglish-first AI
- **shadcn/ui** — For the beautiful component library
- **Z.ai** — For the LLM SDK that powers Archer's brain

---

## 📞 Contact

- **Author**: Archer AI Team
- **Created by**: Tony Sir
- **Version**: v4.0 "Aurora"
- **Last Updated**: September 2024

> "Ami Archer AI, Tony sir amake baneyechhe. Ami sudhu ekta assistant noi, apnar bondhu, je apnar digital duniya te navigate korar jonno sob somoy ready. Boliye, ki sunte chan?"

---

**Made with 💚 in Bangladesh 🇧🇩**
