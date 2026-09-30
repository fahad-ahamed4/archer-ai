# 🤖 ARCHER AI — Mobile Jarvis Assistant

> A next-generation voice-controlled AI assistant inspired by Iron Man's JARVIS.
> Available on **Web**, **Windows (.exe)**, and **Android (.apk)** — same AI everywhere.
> Built with **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, **Electron**, and **Capacitor**.

![Archer AI](https://img.shields.io/badge/Archer_AI-v4.0_Aurora-00e5ff?style=for-the-badge)
![Platforms](https://img.shields.io/badge/Platforms-Web%20%7C%20Windows%20%7C%20Android-8b5cf6?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Electron](https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron)
![Capacitor](https://img.shields.io/badge/Capacitor-6-119EFF?style=flat-square&logo=capacitor)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Project Structure](#-project-structure)
4. [Prerequisites](#-prerequisites)
5. [Installation](#-installation)
6. [Running the App](#-running-the-app)
7. [Building Apps](#-building-apps)
8. [Auto-Build via GitHub Actions](#-auto-build-via-github-actions)
9. [Configuration](#-configuration)
10. [Voice Commands Reference](#-voice-commands-reference)
11. [Browser Support](#-browser-support)
12. [Troubleshooting](#-troubleshooting)
13. [License](#-license)

---

## 🌟 Overview

**Archer AI** is a personal AI friend — not just an assistant, but a companion. Built in the spirit of Tony Stark's JARVIS, it lives in a beautiful aurora-themed web app and responds to your voice in **Banglish** (Bangla in Roman script) — the natural way many Bangladeshis communicate online.

### 🌍 Available on 3 Platforms

| Platform | Format | How to Get |
|----------|--------|-----------|
| 🌐 **Web** | Next.js app | Run locally or deploy to Vercel |
| 💻 **Windows** | `.exe` installer | Download from [Releases](https://github.com/fahad-ahamed4/archer-ai/releases) or build locally |
| 📱 **Android** | `.apk` file | Download from [Releases](https://github.com/fahad-ahamed4/archer-ai/releases) or build locally |

All three platforms use the **same AI brain** — same commands, same voice, same Banglish responses.

### What Archer Can Do

- 🎙️ **Voice Recognition** — Continuous listening with auto-restart (Chrome/Edge)
- 🔊 **Natural Text-to-Speech** — Google/Microsoft natural voices
- 🧠 **LLM-Powered Knowledge** — Science, history, geography, famous people
- 📱 **30+ App Commands** — Open Instagram, WhatsApp, Spotify, Netflix, Gmail, GitHub, etc.
- 🧮 **Math Calculations** — "what is 10 times 5" → instant answer
- ⏰ **Time/Date/Day** — Always knows the current time
- 😄 **Entertainment** — Jokes, quotes, facts, proverbs, stories, shayari
- 📝 **Notes & Reminders** — Save quick notes via voice
- 🎮 **15+ Games** — Chess, Ludo, Snake, Tetris, GTA, PUBG, etc.
- 🎭 **2 Voice Personalities** — JARVIS (male) + FRIDAY (female)
- 🌍 **Multilingual** — Banglish primary, English + Hindi mixed

---

## ✨ Features

### 🎨 Visual Design — "Aurora Holographic" Theme
- Animated aurora gradient background (deep navy + violet/cyan/pink/gold)
- Glassmorphic cards with backdrop-blur
- **Cute SVG robot mascot** with 5 mood states (idle/listening/speaking/thinking/happy)
- Animated halo rings around mascot
- Smooth Framer Motion animations

### 🎙️ Voice Pipeline
- **STT**: Web Speech API (`bn-IN` recognition, continuous + auto-restart)
- **TTS**: Web Speech Synthesis with:
  - Google UK English Male/Female (preferred natural voices)
  - Chrome bug workaround (10s keep-alive)
  - Hard timeout fallback (no silent failures)
  - Race condition fix

### ⚡ Lightning Speed
- 0ms artificial delay for command responses
- 200ms reconnect timer
- Instant TTS start
- Concurrent message display + speak

### ♿ Accessibility
- `role="dialog"` + `aria-modal` for drawers
- Focus trap (Tab/Shift+Tab within drawers)
- Escape key closes drawers
- `prefers-reduced-motion` respected
- Mobile zoom enabled (WCAG 1.4.4)

### 🔒 Security
- Input length validation (1000 char max)
- History sanitization (prompt injection protection)
- LLM call timeout (15s AbortController)

---

## 📁 Project Structure

```
archer-ai/
├── client/                      # 🌐 Next.js web app (frontend + API routes)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── archer-chat/
│   │   │   │       └── route.ts        # LLM endpoint (Banglish)
│   │   │   ├── globals.css             # Aurora Holographic theme
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── archer-ai/
│   │   │   │   ├── archer-dashboard.tsx     # Main dashboard
│   │   │   │   ├── chat-history.tsx         # Chat drawer
│   │   │   │   ├── jarvis-mascot.tsx       # Cute robot mascot
│   │   │   │   ├── particle-orb.tsx        # Canvas particle orb
│   │   │   │   └── settings-drawer.tsx     # Settings + Download buttons
│   │   │   └── ui/                       # shadcn/ui components
│   │   ├── hooks/
│   │   │   └── use-archer-ai.ts          # Voice + chat state machine
│   │   └── lib/
│   │       ├── browser-support.ts        # Browser/OS detection
│   │       ├── db.ts
│   │       └── utils.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── eslint.config.mjs
│
├── server/                      # 🖥️ Optional standalone backend (Express)
│   ├── index.js                 # Express server with /api/archer-chat
│   ├── package.json
│   └── README.md
│
├── electron/                    # 💻 Windows .exe (Electron)
│   ├── main.cjs                 # Electron main process
│   ├── preload.cjs              # Secure contextBridge
│   ├── package.json             # electron-builder config
│   ├── assets/                  # App icon, etc.
│   └── README.md
│
├── android/                     # 📱 Android .apk (Capacitor)
│   ├── capacitor.config.ts      # Capacitor config
│   ├── package.json
│   └── README.md
│
├── .github/workflows/
│   └── build-release.yml        # 🚀 Auto-build for Windows + Android
│
├── package.json                 # Root package.json (workspaces)
├── README.md                    # This file
├── .gitignore
├── .env.example
├── Caddyfile                    # Gateway config (for production)
└── LICENSE
```

---

## ✅ Prerequisites

### For Web Development
1. **Node.js** ≥ 18.17 (Node 20+ recommended)
2. **Bun** (recommended) — `curl -fsSL https://bun.sh/install | bash`
3. **Modern browser** — Chrome or Edge for voice features

### For Windows (.exe) Build
1. All of the above
2. **Electron** dependencies (installed automatically via `bun install` in `electron/`)
3. For cross-platform builds on Linux/Mac, install **Wine** (for Windows target on non-Windows)

### For Android (.apk) Build
1. All web prerequisites
2. **Java JDK 17** (Android Studio ships with one)
3. **Android Studio** (latest version)
4. **Android SDK** (Platform 34, Build Tools 34.0.0)
5. **Gradle** (the wrapper from `cap add android` handles this)

---

## 📦 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/fahad-ahamed4/archer-ai.git
cd archer-ai
```

### Step 2: Install All Dependencies (Workspaces)

The project uses **Bun workspaces** — installing at the root installs everything:

```bash
bun install
```

This installs dependencies for:
- `client/` — Next.js app
- `server/` — Optional Express backend
- `electron/` — Electron desktop app
- `android/` — Capacitor Android wrapper

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` if needed:
```env
DATABASE_URL="file:./db/custom.db"
```

### Step 4: Initialize Database (Optional)

```bash
cd client && bun run db:push
cd ..
```

### Step 5: Run the Web App

```bash
bun run dev
```

The app will start on **http://localhost:3000**

### Step 6: Grant Microphone Permission

When you first click the mic button:
1. Chrome will prompt for microphone access
2. Click **"Allow"**
3. Start speaking — Archer will respond in Banglish

---

## 🚀 Running the App

### Web (Development)

```bash
bun run dev              # From root — runs Next.js dev server
# or
cd client && bun run dev
```

Visit **http://localhost:3000**

### Web (Production Build)

```bash
bun run build:web        # From root
cd client && bun start
```

### Windows Desktop App (Development)

In one terminal:
```bash
bun run dev:web         # Start Next.js dev server
```

In another terminal:
```bash
bun run dev:electron    # Launch Electron pointing to localhost:3000
```

### Windows Desktop App (Production Build)

```bash
# Set APP_URL to your deployed URL
export APP_URL=https://your-archer-app.vercel.app

# Build the .exe installer
bun run build:windows
```

The installer will be at `electron/dist/archer-ai-4.0.0-setup.exe`.

### Android App (Development)

```bash
# Make sure web app is running (or use deployed URL)
bun run dev:web

# Sync web assets
cd android && bun run sync

# Open in Android Studio for testing
bun run open
```

### Android App (Production Build)

```bash
# Set APP_URL to your deployed URL
export APP_URL=https://your-archer-app.vercel.app

# Build the APK
cd android && bun run build:apk
```

The APK will be at `android/archer-ai.apk`.

---

## 🏗️ Building Apps

### Build Everything

```bash
# Build web + Windows + Android
bun run build
```

### Individual Builds

| Command | What it does |
|---------|--------------|
| `bun run build:web` | Builds Next.js for web |
| `bun run build:windows` | Builds Windows .exe installer |
| `bun run build:apk` | Builds Android .apk |
| `bun run build:electron` | Builds Electron for current OS |
| `bun run build:android` | Builds Android via Capacitor |

### Clean Build Artifacts

```bash
bun run clean
```

---

## 🤖 Auto-Build via GitHub Actions

The project includes a GitHub Actions workflow at `.github/workflows/build-release.yml` that automatically builds Archer AI for Windows and Android.

### Triggers

The workflow runs on:
1. **Tag push** — Push a tag like `v4.0.0` to trigger a release build
2. **Manual dispatch** — Go to Actions → "Build & Release" → "Run workflow"

### How to Trigger a Build

#### Option 1: Tag-based release (recommended)

```bash
# Bump version in package.json files first
# Then create and push a tag:
git tag v4.0.0
git push origin v4.0.0
```

This triggers the workflow, builds everything, and creates a GitHub Release with download links.

#### Option 2: Manual dispatch

1. Go to https://github.com/fahad-ahamed4/archer-ai/actions/workflows/build-release.yml
2. Click **"Run workflow"**
3. Enter a version number (e.g., `4.0.0`)
4. Click **"Run workflow"**

### Workflow Steps

1. **Build Web** — Compiles the Next.js app
2. **Build Windows** — Uses `electron-builder` to create the `.exe` installer on `windows-latest`
3. **Build Android** — Uses Capacitor + Gradle to build the `.apk` on `ubuntu-latest`
4. **Upload to Releases** — Both `.exe` and `.apk` are uploaded to GitHub Releases

### Configuration Needed

Before the workflow runs, you need to update these files with your deployed URL:

1. `electron/main.cjs` — Replace `APP_URL` value
2. `android/capacitor.config.ts` — Replace `server.url`

Both should point to your deployed Archer AI web URL (e.g., on Vercel).

### Download from Releases

Once the workflow completes, downloads are available at:
- **Releases page**: https://github.com/fahad-ahamed4/archer-ai/releases
- **Workflow artifacts**: https://github.com/fahad-ahamed4/archer-ai/actions

The Settings drawer in the app also has download buttons that link directly to the latest release.

---

## ⚙️ Configuration

### Setting the Deployed URL

For Electron and Android apps to work, they need to know where your Archer AI web app is deployed.

#### For Electron (`electron/main.cjs`):
```javascript
const APP_URL = process.env.APP_URL || 'https://your-deployed-app.vercel.app';
```

#### For Android (`android/capacitor.config.ts`):
```typescript
server: {
  url: process.env.APP_URL || 'https://your-deployed-app.vercel.app',
  cleartext: true,
}
```

#### For GitHub Actions workflow:
The workflow sets `APP_URL=https://archer-ai.vercel.app` by default. Update this in `.github/workflows/build-release.yml` if your URL differs.

### Voice Settings

Open the **Settings** drawer (gear icon in app) to:
- Switch between **JARVIS** (male) and **FRIDAY** (female) voices
- Mute/unmute voice output
- View browser support status
- **Download apps** — Windows .exe and Android .apk buttons

### Customizing the LLM Persona

Edit `client/src/app/api/archer-chat/route.ts` and modify `ARCHER_SYSTEM_PROMPT`.

### Customizing Commands

Edit `client/src/hooks/use-archer-ai.ts`:
- `tryHandleCommand()` — Basic commands
- `tryHandleExtendedCommand()` — 30+ extended commands

---

## 🎤 Voice Commands Reference

### 📱 App Opening (25+ commands)
- "open facebook" / "open instagram" / "open whatsapp" / "open twitter"
- "open telegram" / "open snapchat" / "open linkedin" / "open reddit"
- "open pinterest" / "open spotify" / "open netflix" / "open amazon"
- "open flipkart" / "open daraz" / "open gmail" / "open outlook"
- "open maps" / "open github" / "open stack overflow"
- "open chatgpt" / "open gemini" / "open wikipedia" / "open translate"

### ⏰ Time, Date, Day
- "what is the time" → "Sir, ekhon somoy hocche 5:14 PM."
- "what is the date" → Full date with weekday
- "what is the day" → Day of week

### 🌤️ Weather
- "what is the weather today"

### 🧮 Math
- "what is 5 plus 3" → "Sir, 5 jog 3 hocche 8."
- "what is 10 times 5" → "Sir, 10 gun 5 hocche 50."
- "what is 100 minus 25" → "Sir, 100 biyog 25 hocche 75."
- "what is 20 divided by 4" → "Sir, 20 vag 4 hocche 5."

### 😄 Entertainment
- "tell me a joke" → Random Bangla joke
- "tell me a quote" → Famous person's quote
- "tell me a fact" → Interesting fact
- "tell me a proverb" → Bengali proverb
- "tell me a story" → Short story
- "tell me a shayari" → Shayari/poem

### 🎮 Games
- "play chess game" / "play ludo" / "play snake" / "play tetris"
- "play sudoku" / "play 2048" / "play motu patlu"
- "play gta" / "play pubg" / "play free fire"

### 📝 Notes & Reminders
- "note: buy milk tomorrow"
- "reminder: call mother"

### 🎵 Songs
- "play sunflower song" → Opens YouTube
- "একটা গান বাজাও" → Bangla command

### 🌍 General Knowledge (LLM)
Ask anything!
- "who is rabindranath tagore"
- "what is photosynthesis"
- "explain gravity"
- "what is artificial intelligence"

---

## 🌐 Browser Support

| Browser | Voice Input | Voice Output | Text Chat |
|---------|-------------|---------------|-----------|
| **Chrome (Desktop)** | ✅ Full | ✅ Full | ✅ |
| **Edge (Desktop)** | ✅ Full | ✅ Full | ✅ |
| **Chrome (Android)** | ✅ Full | ✅ Full | ✅ |
| **Firefox** | ❌ Limited | ✅ Full | ✅ |
| **Safari (Desktop)** | ❌ Limited | ✅ Full | ✅ |
| **Safari (iOS)** | ❌ No | ✅ Full | ✅ |

The app auto-detects browser support and shows a helpful banner.

---

## 🔧 Troubleshooting

### Voice Input Not Working
1. Use Chrome or Edge (best support)
2. Allow microphone: Click 🔒 icon → Site settings → Microphone → Allow
3. HTTPS required (or `http://localhost`)
4. Check microphone is connected

### TTS (Voice Output) Silent
1. Check Settings → Audio Output is not muted
2. Try switching voice (JARVIS → FRIDAY → back)
3. Refresh the page (Chrome TTS bug workaround)

### Build Errors

```bash
# Clear Next.js cache
rm -rf client/.next
bun run dev

# Reinstall dependencies
rm -rf node_modules client/node_modules
bun install
```

### Electron Build Fails

```bash
cd electron && rm -rf node_modules dist
bun install
bun run build:win
```

### Android Build Fails

```bash
cd android && rm -rf node_modules android
bun install
npx cap add android
bun run sync
bun run build:apk
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
- Tailwind CSS for styling
- All responses in Banglish (Bangla in Roman script)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

```
MIT License

Copyright (c) 2024 Archer AI Team

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
- **Bangladesh developer community** — For inspiring Banglish-first AI
- **shadcn/ui** — For the beautiful component library
- **Electron** — For cross-platform desktop apps
- **Capacitor** — For native mobile app wrapping
- **Z.ai** — For the LLM SDK that powers Archer's brain

---

## 📞 Contact

- **Repository**: https://github.com/fahad-ahamed4/archer-ai
- **Issues**: https://github.com/fahad-ahamed4/archer-ai/issues
- **Releases**: https://github.com/fahad-ahamed4/archer-ai/releases
- **Author**: Archer AI Team
- **Version**: v4.0 "Aurora"
- **Last Updated**: September 2024

> "Ami Archer AI, Tony sir amake baneyechhe. Ami sudhu ekta assistant noi, apnar bondhu, je apnar digital duniya te navigate korar jonno sob somoy ready. Boliye, ki sunte chan?"

---

**Made with 💚 in Bangladesh 🇧🇩**
