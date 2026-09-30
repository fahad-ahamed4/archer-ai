"use client";

/**
 * Browser capability detection for Archer AI
 * Detects what features are supported and provides fallback messaging
 */

export interface BrowserCapabilities {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  webkitSpeechRecognition: boolean;
  isIOS: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  isChrome: boolean;
  isEdge: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  browserName: string;
  osName: string;
  recommendedBrowser: string | null;
  unsupportedReason: string | null;
}

export function detectBrowser(): BrowserCapabilities {
  if (typeof window === "undefined") {
    return {
      speechRecognition: false,
      speechSynthesis: false,
      webkitSpeechRecognition: false,
      isIOS: false,
      isSafari: false,
      isFirefox: false,
      isChrome: false,
      isEdge: false,
      isAndroid: false,
      isMobile: false,
      browserName: "unknown",
      osName: "unknown",
      recommendedBrowser: null,
      unsupportedReason: "Server-side render",
    };
  }

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid || /Mobi|Mobile/i.test(ua);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua) || /Version\/[\d.]+.*Safari/.test(ua);
  const isFirefox = /Firefox|FxiOS/i.test(ua);
  const isChrome = /Chrome|CriOS/i.test(ua) && !/Edg/i.test(ua);
  const isEdge = /Edg/i.test(ua);

  // SpeechRecognition support: Chrome/Edge only (NOT Safari/Firefox/iOS)
  const hasWebkitSR = !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  // iOS Safari has very limited support and tends to fail silently
  const recognitionBlockedByIOS = isIOS && isSafari;
  const speechRecognition = hasWebkitSR && !recognitionBlockedByIOS;

  const speechSynthesis = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance !== "undefined";

  let browserName = "Unknown";
  if (isEdge) browserName = "Microsoft Edge";
  else if (isChrome && isIOS) browserName = "Chrome on iOS";
  else if (isChrome) browserName = "Google Chrome";
  else if (isFirefox && isIOS) browserName = "Firefox on iOS";
  else if (isFirefox) browserName = "Mozilla Firefox";
  else if (isSafari && isIOS) browserName = "Safari on iOS";
  else if (isSafari) browserName = "Safari";
  else if (isIOS) browserName = "iOS Browser";

  let osName = "Unknown";
  if (isIOS) osName = "iOS";
  else if (isAndroid) osName = "Android";
  else if (/Windows/i.test(ua)) osName = "Windows";
  else if (/Macintosh|MacIntel/i.test(ua)) osName = "macOS";
  else if (/Linux/i.test(ua)) osName = "Linux";

  let recommendedBrowser: string | null = null;
  let unsupportedReason: string | null = null;

  if (!speechRecognition) {
    if (isIOS || isSafari) {
      recommendedBrowser = "Google Chrome on iOS";
      unsupportedReason = "Safari and iOS don't support voice input. Install Chrome on your iPhone/iPad to use voice.";
    } else if (isFirefox) {
      recommendedBrowser = "Google Chrome or Microsoft Edge";
      unsupportedReason = "Firefox doesn't support voice input. Please use Chrome or Edge.";
    } else {
      recommendedBrowser = "Google Chrome or Microsoft Edge";
      unsupportedReason = "This browser doesn't support voice input. Please use Chrome or Edge.";
    }
  }

  return {
    speechRecognition,
    speechSynthesis,
    webkitSpeechRecognition: hasWebkitSR,
    isIOS,
    isSafari,
    isFirefox,
    isChrome,
    isEdge,
    isAndroid,
    isMobile,
    browserName,
    osName,
    recommendedBrowser,
    unsupportedReason,
  };
}

/**
 * Get user-friendly browser support message
 */
export function getSupportMessage(caps: BrowserCapabilities): string | null {
  if (!caps.speechRecognition && !caps.speechSynthesis) {
    return "Your browser doesn't support voice features. Use Chrome or Edge for full voice support. Text chat still works.";
  }
  if (!caps.speechRecognition) {
    return "Voice input needs Chrome/Edge. Text chat & AI voice output work fine.";
  }
  if (!caps.speechSynthesis) {
    return "Voice output not supported. Voice input & text chat work normally.";
  }
  return null;
}
