"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mic2,
  Volume2,
  VolumeX,
  Bot,
  User,
  Check,
  Activity,
  Download,
  Monitor,
  Smartphone,
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BrowserCapabilities } from "@/lib/browser-support";
import {
  useLatestRelease,
  formatFileSize,
  formatReleaseDate,
  GITHUB_RELEASES_PAGE,
  GITHUB_ACTIONS_URL,
} from "@/hooks/use-latest-release";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  voiceType: "jarvis" | "friday";
  onVoiceChange: (v: "jarvis" | "friday") => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  browserCaps: BrowserCapabilities | null;
}

export function SettingsDrawer({
  open,
  onClose,
  voiceType,
  onVoiceChange,
  isMuted,
  onMuteToggle,
  browserCaps,
}: SettingsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const {
    release,
    loading,
    hasWindowsBuild,
    hasAndroidBuild,
    windowsAsset,
    androidAsset,
    refetch,
  } = useLatestRelease();

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      // Focus first interactive element after animation
      const t = setTimeout(() => {
        const first = drawerRef.current?.querySelector<HTMLElement>("button, [href], input, textarea, select, [tabindex]");
        first?.focus();
      }, 350);
      return () => clearTimeout(t);
    } else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus?.();
    }
  }, [open]);

  // === Escape to close + focus trap ===
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            role="dialog"
            aria-modal="true"
            aria-label="Archer AI Settings"
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 flex flex-col bg-background border-l border-primary/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 glassmorphic">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-mono font-bold tracking-wider text-primary text-glow-sm">
                    SETTINGS
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Archer AI System Config
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-md hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                aria-label="Close settings"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* === VOICE TYPE === */}
              <section>
                <h3 className="text-[10px] font-mono font-bold tracking-widest text-primary mb-3 flex items-center gap-1.5">
                  <Mic2 className="w-3 h-3" aria-hidden="true" />
                  AI VOICE TYPE
                </h3>
                <div
                  role="radiogroup"
                  aria-label="Voice personality"
                  className="grid grid-cols-2 gap-2"
                >
                  <VoiceOption
                    label="JARVIS"
                    description="Deep, calm, male"
                    icon={<Bot className="w-4 h-4" />}
                    active={voiceType === "jarvis"}
                    onClick={() => onVoiceChange("jarvis")}
                  />
                  <VoiceOption
                    label="FRIDAY"
                    description="Light, female"
                    icon={<User className="w-4 h-4" />}
                    active={voiceType === "friday"}
                    onClick={() => onVoiceChange("friday")}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Switch anytime — Archer will respond with the selected voice personality.
                </p>
              </section>

              {/* === AUDIO === */}
              <section>
                <h3 className="text-[10px] font-mono font-bold tracking-widest text-primary mb-3 flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3" aria-hidden="true" />
                  AUDIO OUTPUT
                </h3>
                <button
                  onClick={onMuteToggle}
                  role="switch"
                  aria-checked={!isMuted}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-md border transition-colors",
                    isMuted
                      ? "bg-red-500/10 border-red-500/40 text-red-400"
                      : "bg-primary/5 border-primary/30 text-primary hover:bg-primary/10"
                  )}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                  )}
                  <div className="flex-1 text-left ml-2">
                    <div className="text-xs font-mono font-bold">
                      {isMuted ? "MUTED" : "VOICE ON"}
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      {isMuted ? "Archer will only reply in text" : "Archer speaks responses aloud"}
                    </div>
                  </div>
                </button>
              </section>

              {/* === BROWSER SUPPORT === */}
              {browserCaps && (
                <section>
                  <h3 className="text-[10px] font-mono font-bold tracking-widest text-primary mb-3 flex items-center gap-1.5">
                    <Activity className="w-3 h-3" aria-hidden="true" />
                    SYSTEM INFO
                  </h3>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <InfoRow label="Browser" value={browserCaps.browserName} />
                    <InfoRow label="OS" value={browserCaps.osName} />
                    <InfoRow
                      label="Voice Input"
                      value={browserCaps.speechRecognition ? "SUPPORTED" : "NOT SUPPORTED"}
                      status={browserCaps.speechRecognition ? "good" : "bad"}
                    />
                    <InfoRow
                      label="Voice Output"
                      value={browserCaps.speechSynthesis ? "SUPPORTED" : "NOT SUPPORTED"}
                      status={browserCaps.speechSynthesis ? "good" : "bad"}
                    />
                  </div>
                  {browserCaps.unsupportedReason && (
                    <div
                      role="alert"
                      className="mt-3 px-3 py-2 rounded-md bg-orange-500/10 border border-orange-500/40 text-orange-400 text-[10px]"
                    >
                      <strong>
                        <span aria-hidden="true">⚠ </span>Notice:
                      </strong>{" "}
                      {browserCaps.unsupportedReason}
                    </div>
                  )}
                </section>
              )}

              {/* === DOWNLOAD APPS === */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-mono font-bold tracking-widest text-primary flex items-center gap-1.5">
                    <Download className="w-3 h-3" aria-hidden="true" />
                    DOWNLOAD APPS
                  </h3>
                  <button
                    onClick={refetch}
                    disabled={loading}
                    className="text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors"
                    aria-label="Refresh release info"
                    title="Check for new releases"
                  >
                    <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                  </button>
                </div>

                {/* Loading state */}
                {loading && (
                  <div className="flex items-center justify-center gap-2 py-6 text-[10px] text-muted-foreground font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Checking for releases...</span>
                  </div>
                )}

                {/* Release available — show direct download buttons */}
                {!loading && release && (
                  <>
                    <div className="mb-2 px-3 py-1.5 rounded-md bg-primary/5 border border-primary/20 text-[9px] text-muted-foreground">
                      <span className="text-primary font-mono font-bold">{release.tagName}</span>
                      {release.publishedAt && (
                        <span className="ml-2 flex items-center gap-1">
                          <Clock className="w-2 h-2" aria-hidden="true" />
                          {formatReleaseDate(release.publishedAt)}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Windows download */}
                      {hasWindowsBuild && windowsAsset ? (
                        <a
                          href={windowsAsset.browser_download_url}
                          download
                          className="group flex flex-col items-center gap-1 p-3 rounded-lg border border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/15 hover:border-cyan-400/60 transition-all"
                          aria-label={`Download ${windowsAsset.name}`}
                          title={`Download ${windowsAsset.name} (${formatFileSize(windowsAsset.size)})`}
                        >
                          <div className="w-9 h-9 rounded-full bg-cyan-400/15 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                            <Monitor className="w-5 h-5" />
                          </div>
                          <div className="text-[11px] font-mono font-bold tracking-wider text-cyan-300">
                            WINDOWS
                          </div>
                          <div className="text-[9px] text-muted-foreground text-center">
                            {formatFileSize(windowsAsset.size)}
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-cyan-400 mt-0.5">
                            <Download className="w-2.5 h-2.5" />
                            <span>Download .exe</span>
                          </div>
                        </a>
                      ) : (
                        <div className="flex flex-col items-center gap-1 p-3 rounded-lg border border-muted/30 bg-muted/5 text-muted-foreground/70">
                          <div className="w-9 h-9 rounded-full bg-muted/15 flex items-center justify-center">
                            <Monitor className="w-5 h-5 opacity-50" />
                          </div>
                          <div className="text-[11px] font-mono font-bold tracking-wider">
                            WINDOWS
                          </div>
                          <div className="text-[9px] text-center">Not in this release</div>
                        </div>
                      )}

                      {/* Android download */}
                      {hasAndroidBuild && androidAsset ? (
                        <a
                          href={androidAsset.browser_download_url}
                          download
                          className="group flex flex-col items-center gap-1 p-3 rounded-lg border border-pink-400/30 bg-pink-400/5 hover:bg-pink-400/15 hover:border-pink-400/60 transition-all"
                          aria-label={`Download ${androidAsset.name}`}
                          title={`Download ${androidAsset.name} (${formatFileSize(androidAsset.size)})`}
                        >
                          <div className="w-9 h-9 rounded-full bg-pink-400/15 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div className="text-[11px] font-mono font-bold tracking-wider text-pink-300">
                            ANDROID
                          </div>
                          <div className="text-[9px] text-muted-foreground text-center">
                            {formatFileSize(androidAsset.size)}
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-pink-400 mt-0.5">
                            <Download className="w-2.5 h-2.5" />
                            <span>Download .apk</span>
                          </div>
                        </a>
                      ) : (
                        <div className="flex flex-col items-center gap-1 p-3 rounded-lg border border-muted/30 bg-muted/5 text-muted-foreground/70">
                          <div className="w-9 h-9 rounded-full bg-muted/15 flex items-center justify-center">
                            <Smartphone className="w-5 h-5 opacity-50" />
                          </div>
                          <div className="text-[11px] font-mono font-bold tracking-wider">
                            ANDROID
                          </div>
                          <div className="text-[9px] text-center">Not in this release</div>
                        </div>
                      )}
                    </div>

                    {/* View all releases link */}
                    <a
                      href={GITHUB_RELEASES_PAGE}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 text-center text-[10px] text-muted-foreground hover:text-primary transition-colors underline"
                    >
                      View all releases on GitHub →
                    </a>
                  </>
                )}

                {/* No release yet — show trigger build prompt */}
                {!loading && !release && (
                  <>
                    <div className="grid grid-cols-2 gap-2 opacity-50">
                      <div className="flex flex-col items-center gap-1 p-3 rounded-lg border border-cyan-400/20 bg-cyan-400/5">
                        <div className="w-9 h-9 rounded-full bg-cyan-400/15 flex items-center justify-center text-cyan-400">
                          <Monitor className="w-5 h-5" />
                        </div>
                        <div className="text-[11px] font-mono font-bold tracking-wider text-cyan-300">
                          WINDOWS
                        </div>
                        <div className="text-[9px] text-muted-foreground text-center">
                          .exe installer
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1 p-3 rounded-lg border border-pink-400/20 bg-pink-400/5">
                        <div className="w-9 h-9 rounded-full bg-pink-400/15 flex items-center justify-center text-pink-400">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="text-[11px] font-mono font-bold tracking-wider text-pink-300">
                          ANDROID
                        </div>
                        <div className="text-[9px] text-muted-foreground text-center">
                          .apk file
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 px-3 py-2 rounded-md bg-amber-400/10 border border-amber-400/40 text-[10px] text-amber-300 flex items-start gap-2">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="flex-1">
                        <div className="font-mono font-bold mb-0.5">NO BUILDS YET</div>
                        <p className="leading-relaxed mb-2">
                          No official builds have been released yet. You can trigger
                          an automatic build via GitHub Actions.
                        </p>
                        <a
                          href={GITHUB_ACTIONS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 font-mono text-[9px] transition-colors"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          Trigger Build
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {/* Same AI note */}
                <div className="mt-2 text-[9px] text-muted-foreground/70 text-center italic">
                  Windows & Android apps use the same AI as this website
                </div>
              </section>

              {/* === ABOUT === */}
              <section>
                <h3 className="text-[10px] font-mono font-bold tracking-widest text-primary mb-3 flex items-center gap-1.5">
                  <Bot className="w-3 h-3" aria-hidden="true" />
                  ABOUT ARCHER
                </h3>
                <div className="px-3 py-2.5 rounded-md bg-primary/5 border border-primary/20 text-[11px] text-foreground/80 leading-relaxed">
                  Archer AI v4.0 Aurora — a personal AI friend crafted by Tony sir.
                  Voice-controlled, multilingual (Bangla/English/Hindi), with the
                  Aurora Holographic theme inspired by Iron Man&apos;s JARVIS.
                  <br /><br />
                  Available on Web, Windows, and Android — same AI, same commands,
                  same voice — everywhere.
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function VoiceOption({
  label,
  description,
  icon,
  active,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={active}
      aria-label={`${label} — ${description}`}
      className={cn(
        "flex flex-col items-center gap-1 p-3 rounded-md border transition-all",
        active
          ? "bg-primary/15 border-primary/60 box-glow"
          : "bg-background/40 border-white/10 hover:border-primary/30"
      )}
    >
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-1", active ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground")}>
        {icon}
      </div>
      <div className={cn("text-[10px] font-mono font-bold tracking-wider", active ? "text-primary" : "text-foreground/70")}>
        {label}
      </div>
      <div className="text-[9px] text-muted-foreground text-center">{description}</div>
      {active && <Check className="w-3 h-3 text-primary" aria-hidden="true" />}
    </button>
  );
}

function InfoRow({
  label,
  value,
  status = "neutral",
}: {
  label: string;
  value: string;
  status?: "good" | "bad" | "neutral";
}) {
  const colorClass =
    status === "good"
      ? "text-primary"
      : status === "bad"
      ? "text-red-400"
      : "text-foreground/80";
  return (
    <div className="flex items-center justify-between px-2 py-1 rounded bg-white/5">
      <span className="text-muted-foreground">{label}</span>
      <span className={colorClass}>{value}</span>
    </div>
  );
}
