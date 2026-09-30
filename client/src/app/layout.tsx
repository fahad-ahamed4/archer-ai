import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "ARCHER AI — Mobile Jarvis Assistant",
  description:
    "Archer AI: A next-generation mobile Jarvis-style AI assistant. Voice-controlled, multilingual (Bangla/English/Hindi), with neon cyberpunk HUD UI.",
  keywords: [
    "Archer AI",
    "Jarvis",
    "AI Assistant",
    "Iron Man",
    "Mobile AI",
    "Voice Assistant",
    "Bangla AI",
    "Cyberpunk UI",
  ],
  authors: [{ name: "Archer AI" }],
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23050807' stroke='%2300ff88' stroke-width='3'/%3E%3Ctext x='50' y='62' font-size='38' text-anchor='middle' fill='%2300ff88' font-family='monospace'%3EA%3C/text%3E%3C/svg%3E",
  },
  openGraph: {
    title: "ARCHER AI — Mobile Jarvis Assistant",
    description:
      "Voice-controlled AI assistant with neon cyberpunk HUD. Bangla/English/Hindi support.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow user zoom for accessibility (WCAG 1.4.4)
  maximumScale: 5,
  userScalable: true,
  themeColor: "#00ff88",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
