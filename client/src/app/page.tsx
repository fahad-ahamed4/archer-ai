"use client";

import { useEffect, useState } from "react";
import { ArcherDashboard } from "@/components/archer-ai/archer-dashboard";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use a microtask to avoid cascading render warning
    Promise.resolve().then(() => setMounted(true));
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch — return a stable shell first
    return (
      <main className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <div className="text-primary text-glow text-xs tracking-[0.4em] animate-pulse">
          INITIALIZING...
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <ArcherDashboard />
    </main>
  );
}
