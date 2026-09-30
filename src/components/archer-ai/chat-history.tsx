"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Trash2, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  spoken?: boolean;
}

interface ChatHistoryProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onClear?: () => void;
}

export function ChatHistory({ open, onClose, messages, onSend, onClear }: ChatHistoryProps) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Auto-scroll only if user is near the bottom
  const autoScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      // Focus input after animation
      const t = setTimeout(() => inputRef.current?.focus(), 350);
      autoScroll();
      return () => clearTimeout(t);
    } else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus?.();
    }
  }, [open, autoScroll]);

  useEffect(() => {
    autoScroll();
  }, [messages, autoScroll]);

  // === Accessibility: Escape to close + focus trap ===
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      // Simple focus trap: keep Tab within drawer
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

  const handleSubmit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — keyboard accessible */}
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
            aria-label="Chat with Archer AI"
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
                    ARCHER AI
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {messages.length} messages · Online
                  </div>
                </div>
              </div>
              <button
                onClick={onClear}
                disabled={messages.length <= 1}
                className="w-8 h-8 rounded-md hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-md hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center mb-4 box-glow">
                    <Bot className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-sm text-foreground mb-1 font-medium">
                    Hello, I am Archer
                  </div>
                  <div className="text-xs text-muted-foreground max-w-xs">
                    I am not just an assistant — I am your friend. Speak or type
                    anything in Bangla, English, or Hindi.
                  </div>
                  <div className="mt-4 text-[10px] text-primary/60 font-mono">
                    Try: &quot;Hello Archer&quot;, &quot;ভাই কেমন আছ?&quot;, &quot;একটা গান বাজাও&quot;
                  </div>
                </div>
              ) : (
                messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
              )}
            </div>

            {/* Input */}
            <div className="border-t border-primary/20 p-3 glassmorphic">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Message Archer..."
                  rows={1}
                  className="flex-1 bg-background/60 border border-primary/30 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-primary/60 focus:box-glow transition-all max-h-24"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 box-glow"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[9px] text-muted-foreground mt-1 text-center font-mono">
                Press ENTER to send · SHIFT+ENTER for newline
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-2 items-end", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border",
          isUser
            ? "bg-orange-400/15 border-orange-400/50"
            : "bg-primary/15 border-primary/50 box-glow"
        )}
      >
        {isUser ? (
          <User className="w-3 h-3 text-orange-400" />
        ) : (
          <Bot className="w-3 h-3 text-primary" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2",
          isUser
            ? "bg-orange-400/10 border border-orange-400/30 text-foreground"
            : "bg-primary/10 border border-primary/30 text-foreground"
        )}
      >
        <div className="text-[10px] text-muted-foreground mb-0.5 font-mono">
          {isUser ? "YOU" : "ARCHER"} · {time}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}
