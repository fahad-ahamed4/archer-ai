"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Brain,
  MessageSquare,
  Ghost,
  Settings as SettingsIcon,
  Send,
  Activity,
  Radio,
  Sparkles,
  AlertTriangle,
  X,
  Power,
  Clock,
  Zap,
  Volume2,
} from "lucide-react";
import { ChatHistory } from "./chat-history";
import { SettingsDrawer } from "./settings-drawer";
import { JarvisMascot } from "./jarvis-mascot";
import { useArcherAI } from "@/hooks/use-archer-ai";
import { detectBrowser, getSupportMessage, type BrowserCapabilities } from "@/lib/browser-support";
import { cn } from "@/lib/utils";

type ModuleKey = "memory" | "chat" | "soul" | "setting";
type OrbState = "idle" | "listening" | "speaking" | "dreaming" | "processing";

interface ModuleConfig {
  key: ModuleKey;
  label: string;
  icon: React.ReactNode;
  color: "cyan" | "violet" | "pink" | "gold";
  description: string;
}

const MODULES: ModuleConfig[] = [
  {
    key: "memory",
    label: "MEMORY",
    icon: <Brain className="w-4 h-4" />,
    color: "cyan",
    description: "Long-term knowledge",
  },
  {
    key: "chat",
    label: "CHAT",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "pink",
    description: "Conversation",
  },
  {
    key: "soul",
    label: "SOUL",
    icon: <Ghost className="w-4 h-4" />,
    color: "violet",
    description: "Personality",
  },
  {
    key: "setting",
    label: "SETTING",
    icon: <SettingsIcon className="w-4 h-4" />,
    color: "gold",
    description: "Configuration",
  },
];

const COLOR_STYLES: Record<
  "cyan" | "violet" | "pink" | "gold",
  { text: string; bg: string; border: string; glow: string; line: string; hex: string }
> = {
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/50",
    glow: "glow-cyan",
    line: "#00e5ff",
    hex: "#00e5ff",
  },
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/50",
    glow: "glow-violet",
    line: "#8b5cf6",
    hex: "#8b5cf6",
  },
  pink: {
    text: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/50",
    glow: "glow-pink",
    line: "#ff3d9a",
    hex: "#ff3d9a",
  },
  gold: {
    text: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/50",
    glow: "glow-gold",
    line: "#ffd166",
    hex: "#ffd166",
  },
};

function formatOrbStateText(state: OrbState): string {
  const map: Record<OrbState, string> = {
    idle: "STANDBY",
    listening: "LISTENING",
    speaking: "SPEAKING",
    dreaming: "DREAMING",
    processing: "PROCESSING",
  };
  if (state === "idle") return map.idle;
  return `· ${map[state]} ·`;
}

export function ArcherDashboard() {
  const {
    orbState,
    chatMessages,
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
    voiceType,
    setVoiceType,
  } = useArcherAI();

  const [activeModule, setActiveModule] = useState<ModuleKey>("chat");
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [browserCaps, setBrowserCaps] = useState<BrowserCapabilities | null>(null);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);
  const [showSupportBanner, setShowSupportBanner] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const caps = detectBrowser();
    const timer = setTimeout(() => {
      setBrowserCaps(caps);
      setSupportMessage(getSupportMessage(caps));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowBootSequence(false), 2200);
    return () => clearTimeout(t);
  }, []);

  // Auto-switch active module based on orb state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (orbState === "listening") setActiveModule("memory");
      else if (orbState === "speaking") setActiveModule("chat");
      else if (orbState === "dreaming") setActiveModule("soul");
      else if (orbState === "processing") setActiveModule("setting");
    }, 0);
    return () => clearTimeout(timer);
  }, [orbState]);

  useEffect(() => {
    if (chatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatOpen]);

  const handleSubmit = useCallback(async () => {
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");
    await sendMessage(text);
  }, [textInput, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleModuleClick = (key: ModuleKey) => {
    setActiveModule(key);
    if (key === "chat") setChatOpen(true);
  };

  if (showBootSequence) {
    return <BootSequence />;
  }

  const activeModuleConfig = MODULES.find((m) => m.key === activeModule);
  const orbModuleColor = activeModuleConfig ? COLOR_STYLES[activeModuleConfig.color] : COLOR_STYLES.cyan;

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      {/* === AURORA BACKGROUND === */}
      <div className="absolute inset-0 aurora-bg pointer-events-none" />
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-50" />
      <div className="absolute inset-0 scanline pointer-events-none" />
      <div className="absolute inset-0 starfield pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-3 max-w-md mx-auto w-full">
        {/* === BROWSER SUPPORT BANNER === */}
        <AnimatePresence>
          {supportMessage && showSupportBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              role="alert"
              className="mb-2 px-3 py-2 rounded-xl glass border border-amber-400/40 flex items-start gap-2 text-[10px] text-amber-300"
            >
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="flex-1">{supportMessage}</span>
              <button
                onClick={() => setShowSupportBanner(false)}
                className="text-amber-400 hover:text-amber-300 flex-shrink-0"
                aria-label="Dismiss banner"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === HEADER === */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between gap-3 py-3 mb-2"
        >
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-2xl glass-strong flex items-center justify-center text-cyan-400 hover:bg-cyan-400/15 transition-all hover:scale-105 disabled:opacity-50"
            aria-label="History"
            title="History"
          >
            <Clock className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </button>

          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-cyan-400 glow-cyan"
            />
            <h1 className="text-foreground text-sm sm:text-base font-bold tracking-[0.35em]">
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                ARCHER AI
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-10 rounded-2xl glass-strong flex items-center justify-center text-cyan-400 hover:bg-cyan-400/15 transition-all hover:scale-105"
              aria-label="Open settings"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (ttsSupported && typeof window !== "undefined") {
                  try { window.speechSynthesis.cancel(); } catch {}
                }
                clearChat();
              }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white flex items-center justify-center hover:scale-105 transition-transform glow-cyan"
              aria-label="Reset conversation"
              title="Reset conversation"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </motion.header>

        {/* === CENTRAL STAGE === */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex-1 flex flex-col items-center justify-center min-h-[380px] py-6"
        >
          {/* Halo rings behind mascot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Outermost pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-72 h-72 rounded-full border border-cyan-400/30"
            />
            {/* Middle ring */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-60 h-60 rounded-full border border-violet-400/30"
            />
            {/* Innermost ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-56 h-56 rounded-full border-t-2 border-r-2 border-cyan-400/40"
              style={{ borderRadius: "50% 50% 50% 50% / 50% 50% 50% 50%" }}
            />
            {/* Rotating dots */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-64 h-64"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 glow-cyan" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-pink-400 glow-pink" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-400 glow-violet" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 glow-gold" />
            </motion.div>
          </div>

          {/* === LEFT MODULE STACK === */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
            {MODULES.map((m, i) => (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ModulePill
                  module={m}
                  active={activeModule === m.key}
                  onClick={() => handleModuleClick(m.key)}
                />
              </motion.div>
            ))}
          </div>

          {/* === CENTRAL MASCOT === */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex items-center justify-center"
          >
            <JarvisMascot
              mood={
                orbState === "listening"
                  ? "listening"
                  : orbState === "speaking"
                  ? "speaking"
                  : orbState === "processing" || orbState === "dreaming"
                  ? "thinking"
                  : "idle"
              }
              voiceType={voiceType}
              size={180}
            />
          </motion.div>

          {/* State text below mascot */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div
              className={cn(
                "text-[10px] sm:text-xs font-mono tracking-[0.4em] font-semibold transition-colors duration-300",
                orbState === "listening" && "text-cyan-400 text-glow-sm",
                orbState === "speaking" && "text-emerald-400 text-glow-sm",
                orbState === "dreaming" && "text-amber-400 text-glow-sm",
                orbState === "processing" && "text-cyan-400 text-glow-sm",
                orbState === "idle" && "text-muted-foreground/70"
              )}
            >
              {formatOrbStateText(orbState)}
            </div>
          </motion.div>

          {/* === CONTROL CLUSTER === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-4 mt-8"
          >
            {/* STOP button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isListening) stopListening();
                if (ttsSupported && typeof window !== "undefined") {
                  try { window.speechSynthesis.cancel(); } catch {}
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-500/15 border border-red-500/60 glow-red hover:bg-red-500/25 transition-colors"
              aria-label="Stop"
              title="Stop"
            >
              <span className="w-2.5 h-2.5 bg-red-400 rounded-sm" />
              <span className="text-red-300 font-mono font-bold text-[10px] tracking-widest">
                STOP
              </span>
            </motion.button>

            {/* Mic button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isListening) stopListening();
                else startListening();
              }}
              disabled={!micSupported || orbState === "speaking" || orbState === "processing"}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                isListening
                  ? "bg-red-500/25 border-2 border-red-500 glow-red animate-pulse-glow"
                  : "bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border-2 border-cyan-400 glow-cyan hover:from-cyan-400/30 hover:to-violet-500/30"
              )}
              aria-label={isListening ? "Stop listening" : "Start listening"}
              title={
                !micSupported
                  ? "Voice input requires Chrome/Edge"
                  : isListening
                  ? "Stop listening"
                  : "Tap to speak"
              }
            >
              {isListening ? (
                <Square className="w-5 h-5 text-red-400" fill="currentColor" />
              ) : (
                <Mic className="w-5 h-5 text-cyan-400" />
              )}
            </motion.button>

            {/* Mute toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMute}
              className={cn(
                "w-10 h-10 rounded-full glass-strong flex items-center justify-center transition-colors",
                isMuted
                  ? "text-red-400 border border-red-500/40"
                  : "text-cyan-400 hover:bg-cyan-400/15"
              )}
              aria-label={isMuted ? "Unmute voice" : "Mute voice"}
              title={isMuted ? "Unmute voice" : "Mute voice"}
            >
              {isMuted ? (
                <Volume2 className="w-4 h-4 opacity-50" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </motion.button>
          </motion.div>

          {/* Live transcript */}
          <AnimatePresence>
            {lastTranscript && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 max-w-xs text-center"
              >
                <div className="text-[10px] text-muted-foreground font-mono tracking-wider mb-1">
                  YOU SAID
                </div>
                <div className="text-sm text-foreground/90 italic px-3 py-2 rounded-xl glass border border-cyan-400/30">
                  &ldquo;{lastTranscript}&rdquo;
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="mt-3 px-3 py-2 rounded-xl glass border border-red-500/40 text-red-400 text-xs"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* === TEXT INPUT BAR === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-2"
        >
          <div className="relative flex items-end gap-2 px-4 py-3 rounded-2xl glass-strong holo-border focus-within:glow-cyan transition-all">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mb-1" aria-hidden="true" />
            <textarea
              ref={inputRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type to Archer..."
              rows={1}
              aria-label="Message to Archer"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 resize-none outline-none max-h-24"
              disabled={orbState === "processing"}
            />
            <button
              onClick={handleSubmit}
              disabled={!textInput.trim() || orbState === "processing"}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* === STATUS BAR === */}
        <footer className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/70 px-2 mb-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Radio className="w-2.5 h-2.5" aria-hidden="true" />
              SIGNAL OK
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-2.5 h-2.5" aria-hidden="true" />
              {orbState === "idle" ? "IDLE" : orbState.toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" aria-hidden="true" />
              {chatMessages.length} MSGS
            </span>
          </div>
          <div className="text-cyan-400/70">v4.0 · Aurora</div>
        </footer>
      </div>

      {/* === DRAWERS === */}
      <ChatHistory
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        onSend={(text) => {
          sendMessage(text);
          setChatOpen(true);
        }}
        onClear={clearChat}
      />

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        voiceType={voiceType}
        onVoiceChange={setVoiceType}
        isMuted={isMuted}
        onMuteToggle={toggleMute}
        browserCaps={browserCaps}
      />
    </div>
  );
}

// === MODULE PILL ===
function ModulePill({
  module,
  active,
  onClick,
}: {
  module: ModuleConfig;
  active: boolean;
  onClick: () => void;
}) {
  const styles = COLOR_STYLES[module.color];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-full border text-[10px] font-mono font-bold tracking-wider transition-all backdrop-blur-md",
        active
          ? cn(styles.text, styles.bg, styles.border, styles.glow)
          : "text-muted-foreground/60 bg-white/5 border-white/10"
      )}
    >
      <span className={cn("flex-shrink-0", active ? styles.text : "text-muted-foreground")}>
        {module.icon}
      </span>
      <span>{module.label}</span>
    </motion.button>
  );
}

// === BOOT SEQUENCE ===
function BootSequence() {
  const [lines, setLines] = useState<string[]>([]);
  const bootLines = [
    "> Initializing Archer OS v4.0...",
    "> Loading neural modules [OK]",
    "> Calibrating voice synthesis [OK]",
    "> Connecting to memory bank [OK]",
    "> Activating particle cortex [OK]",
    "> ARCHER AI ONLINE",
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setLines((prev) => [...prev, bootLines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 aurora-bg flex flex-col items-center justify-center p-6 z-50">
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <div className="absolute inset-0 scanline pointer-events-none" />

      {/* Center mascot */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8"
      >
        <JarvisMascot mood="thinking" size={140} />
      </motion.div>

      <div className="w-full max-w-sm space-y-1 font-mono text-[10px] sm:text-xs">
        {lines.map((line, i) => {
          if (typeof line !== "string") return null;
          const hasOK = line.includes("[OK]");
          const hasOnline = line.includes("ONLINE");
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "tracking-wider",
                hasOK && "text-cyan-400 text-glow-sm",
                hasOnline && "bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent text-sm font-bold",
                !hasOK && !hasOnline && "text-muted-foreground/70"
              )}
            >
              {line}
              {hasOnline && (
                <span className="inline-block w-2 h-3 bg-cyan-400 ml-2 animate-blink" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
