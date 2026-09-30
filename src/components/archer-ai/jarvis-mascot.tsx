"use client";

import { useEffect, useState, useRef } from "react";

type Mood = "idle" | "listening" | "speaking" | "thinking" | "happy";

interface JarvisMascotProps {
  mood?: Mood;
  size?: number;
  voiceType?: "jarvis" | "friday";
}

/**
 * Cute robot mascot v2 — bigger, more detailed, more expressive.
 * Represents Archer AI's personality.
 */
export function JarvisMascot({ mood = "idle", size = 160, voiceType = "jarvis" }: JarvisMascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthFrame, setMouthFrame] = useState(0);
  const rafRef = useRef<number>(0);

  // Random blink every 2-5 seconds
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 3000;
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  // Mouth animation when speaking
  useEffect(() => {
    if (mood === "speaking") {
      const animate = () => {
        const now = Date.now();
        setMouthFrame(Math.floor((Math.sin(now / 70) + 1) * 2.5));
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafRef.current);
    }
    const t = setTimeout(() => setMouthFrame(0), 0);
    return () => clearTimeout(t);
  }, [mood]);

  // Mood-based colors — fresh palette matching new design
  const eyeColor = mood === "listening" ? "#00e5ff" : mood === "speaking" ? "#00ffa3" : mood === "thinking" ? "#ffd166" : "#00e5ff";
  const accentColor = mood === "listening" ? "#00e5ff" : mood === "speaking" ? "#00ffa3" : mood === "thinking" ? "#ffd166" : "#8b5cf6";
  const earColor = mood === "listening" ? "#00e5ff" : "#8b5cf6";
  const bodyGlow = mood === "listening" ? "rgba(0, 229, 255, 0.6)" : mood === "speaking" ? "rgba(0, 255, 163, 0.7)" : mood === "thinking" ? "rgba(255, 209, 102, 0.6)" : "rgba(139, 92, 246, 0.5)";

  // Mouth shapes (speaking animation)
  const mouthPaths = [
    "M -12 8 Q 0 8 12 8",
    "M -12 7 Q 0 10 12 7",
    "M -14 5 Q 0 14 14 5",
    "M -14 4 Q 0 18 14 4",
    "M -12 6 Q 0 12 12 6",
  ];
  const mouthPath = mood === "speaking" ? mouthPaths[mouthFrame % 5] : mood === "happy" ? "M -12 8 Q 0 22 12 8" : "M -8 8 Q 0 8 8 8";

  // Eye shape - JARVIS has round eyes, FRIDAY has slightly different (oval)
  const eyeShape = voiceType === "friday" ? "ellipse" : "circle";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 24px ${bodyGlow})`,
      }}
      role="img"
      aria-label={`Archer AI ${mood} mood, ${voiceType} voice`}
    >
      <svg viewBox="-80 -90 160 180" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* === Expanding rings when active === */}
        {(mood === "listening" || mood === "speaking" || mood === "thinking") && (
          <>
            <circle cx="0" cy="0" r="68" fill="none" stroke={accentColor} strokeWidth="1" opacity="0.4">
              <animate attributeName="r" values="60;75;60" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="75" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.2">
              <animate attributeName="r" values="70;85;70" dur="4s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* === Antenna with pulsing light === */}
        <line x1="0" y1="-70" x2="0" y2="-55" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
        <circle cx="0" cy="-73" r="4" fill={accentColor}>
          {(mood !== "idle") && (
            <animate attributeName="opacity" values="0.5;1;0.5" dur="0.8s" repeatCount="indefinite" />
          )}
          {mood === "idle" && (
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
          )}
        </circle>
        {/* Antenna glow */}
        <circle cx="0" cy="-73" r="8" fill={accentColor} opacity="0.2">
          {(mood !== "idle") && (
            <animate attributeName="r" values="6;12;6" dur="0.8s" repeatCount="indefinite" />
          )}
        </circle>

        {/* === Ears (sensors) === */}
        <g>
          <rect x="-62" y="-15" width="11" height="30" rx="5" fill="rgba(20, 22, 48, 0.8)" stroke={earColor} strokeWidth="1.5" />
          <circle cx="-57" cy="0" r="3" fill={earColor}>
            {mood === "listening" && (
              <animate attributeName="r" values="2.5;4;2.5" dur="0.5s" repeatCount="indefinite" />
            )}
            {mood === "idle" && (
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
            )}
          </circle>
          {/* Ear sensor lines */}
          <line x1="-65" y1="-8" x2="-58" y2="-8" stroke={earColor} strokeWidth="1" opacity="0.6" />
          <line x1="-65" y1="0" x2="-58" y2="0" stroke={earColor} strokeWidth="1" opacity="0.6" />
          <line x1="-65" y1="8" x2="-58" y2="8" stroke={earColor} strokeWidth="1" opacity="0.6" />
        </g>
        <g>
          <rect x="51" y="-15" width="11" height="30" rx="5" fill="rgba(20, 22, 48, 0.8)" stroke={earColor} strokeWidth="1.5" />
          <circle cx="57" cy="0" r="3" fill={earColor}>
            {mood === "listening" && (
              <animate attributeName="r" values="2.5;4;2.5" dur="0.5s" repeatCount="indefinite" />
            )}
            {mood === "idle" && (
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
            )}
          </circle>
          <line x1="58" y1="-8" x2="65" y2="-8" stroke={earColor} strokeWidth="1" opacity="0.6" />
          <line x1="58" y1="0" x2="65" y2="0" stroke={earColor} strokeWidth="1" opacity="0.6" />
          <line x1="58" y1="8" x2="65" y2="8" stroke={earColor} strokeWidth="1" opacity="0.6" />
        </g>

        {/* === Head (rounded square, holographic style) === */}
        <defs>
          <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a0c1f" />
            <stop offset="50%" stopColor="#1a1d3f" />
            <stop offset="100%" stopColor="#0a0c1f" />
          </linearGradient>
          <linearGradient id="foreheadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ff3d9a" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <rect
          x="-52"
          y="-55"
          width="104"
          height="104"
          rx="28"
          fill="url(#headGrad)"
          stroke={accentColor}
          strokeWidth="2.5"
        />
        {/* Holographic highlight on top */}
        <rect
          x="-46"
          y="-50"
          width="92"
          height="38"
          rx="20"
          fill="url(#foreheadGrad)"
          opacity="0.7"
        />

        {/* Forehead panel with LED indicators */}
        <rect x="-30" y="-44" width="60" height="10" rx="4" fill="#0a0c1f" stroke={accentColor} strokeWidth="1" opacity="0.85" />
        {/* Forehead LED lights (different pattern per mood) */}
        <circle cx="-22" cy="-39" r="1.5" fill={eyeColor}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" begin="0s" />
        </circle>
        <circle cx="-10" cy="-39" r="1.5" fill={eyeColor}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <circle cx="2" cy="-39" r="1.5" fill={eyeColor}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
        </circle>
        <circle cx="14" cy="-39" r="1.5" fill={eyeColor}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" begin="0.9s" />
        </circle>
        <circle cx="26" cy="-39" r="1.5" fill={eyeColor}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" begin="1.2s" />
        </circle>

        {/* === Eyes — bigger, more expressive === */}
        {/* Left eye socket */}
        <g>
          {isBlinking ? (
            <line x1="-30" y1="-10" x2="-12" y2="-10" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx="-21" cy="-10" rx="10" ry={voiceType === "friday" ? "13" : "12"} fill="#020617" stroke={eyeColor} strokeWidth="2" />
              {/* Iris with mood-based animation */}
              <circle cx="-21" cy="-10" r="6" fill={eyeColor}>
                {(mood === "listening" || mood === "speaking" || mood === "thinking") && (
                  <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
                )}
              </circle>
              {/* Pupil (darker center for depth) */}
              <circle cx="-21" cy="-10" r="3" fill="#000" opacity="0.6" />
              {/* Eye highlight (cute sparkle) */}
              <circle cx="-18" cy="-13" r="2" fill="white" />
              <circle cx="-23" cy="-7" r="1" fill="white" opacity="0.8" />
            </>
          )}
        </g>

        {/* Right eye */}
        <g>
          {isBlinking ? (
            <line x1="12" y1="-10" x2="30" y2="-10" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx="21" cy="-10" rx="10" ry={voiceType === "friday" ? "13" : "12"} fill="#020617" stroke={eyeColor} strokeWidth="2" />
              <circle cx="21" cy="-10" r="6" fill={eyeColor}>
                {(mood === "listening" || mood === "speaking" || mood === "thinking") && (
                  <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
                )}
              </circle>
              <circle cx="21" cy="-10" r="3" fill="#000" opacity="0.6" />
              <circle cx="24" cy="-13" r="2" fill="white" />
              <circle cx="19" cy="-7" r="1" fill="white" opacity="0.8" />
            </>
          )}
        </g>

        {/* === Mouth === */}
        {mood === "happy" ? (
          <path d="M -14 14 Q 0 28 14 14" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d={mouthPath} stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Cute cheeks (blush) when speaking/happy */}
        {(mood === "happy" || mood === "speaking") && (
          <>
            <ellipse cx="-34" cy="8" rx="5" ry="3" fill="#ff3d9a" opacity="0.45" />
            <ellipse cx="34" cy="8" rx="5" ry="3" fill="#ff3d9a" opacity="0.45" />
          </>
        )}

        {/* Chin LED */}
        <rect x="-6" y="35" width="12" height="3" rx="1.5" fill={eyeColor} opacity="0.7" />

        {/* === Neck connector === */}
        <rect x="-12" y="48" width="24" height="8" rx="3" fill="#0a0c1f" stroke={accentColor} strokeWidth="1" />

        {/* === Body (smaller, sleek) === */}
        <rect
          x="-40"
          y="55"
          width="80"
          height="22"
          rx="11"
          fill="url(#headGrad)"
          stroke={accentColor}
          strokeWidth="2"
        />

        {/* Body LED indicator (animated) */}
        <circle cx="0" cy="66" r="3" fill={eyeColor}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          {mood === "speaking" && (
            <animate attributeName="r" values="2;4;2" dur="0.6s" repeatCount="indefinite" />
          )}
        </circle>
        {/* Side body indicators */}
        <rect x="-30" y="63" width="6" height="6" rx="1" fill={accentColor} opacity="0.6" />
        <rect x="24" y="63" width="6" height="6" rx="1" fill={accentColor} opacity="0.6" />

        {/* === Floating particles around mascot when active === */}
        {(mood === "speaking" || mood === "thinking") && (
          <g opacity="0.7">
            <circle cx="-62" cy="-40" r="2" fill={eyeColor}>
              <animate attributeName="cy" values="-40;-55;-40" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="62" cy="-35" r="2" fill={eyeColor}>
              <animate attributeName="cy" values="-35;-50;-35" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="-58" cy="25" r="2" fill={eyeColor}>
              <animate attributeName="cy" values="25;40;25" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;0" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="58" cy="20" r="2" fill={eyeColor}>
              <animate attributeName="cy" values="20;35;20" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;0" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="-50" cy="-65" r="1.5" fill={accentColor}>
              <animate attributeName="cy" values="-65;-75;-65" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="-60" r="1.5" fill={accentColor}>
              <animate attributeName="cy" values="-60;-70;-60" dur="2.6s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* Floating sparkles when listening (sound waves) */}
        {mood === "listening" && (
          <g opacity="0.5">
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const baseR = 70;
              return (
                <circle
                  key={i}
                  cx={Math.cos(angle) * baseR}
                  cy={Math.sin(angle) * baseR}
                  r="2"
                  fill={earColor}
                >
                  <animate
                    attributeName="r"
                    values="1;3;1"
                    dur="0.6s"
                    repeatCount="indefinite"
                    begin={`${i * 0.1}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0.2;0.8;0.2"
                    dur="0.6s"
                    repeatCount="indefinite"
                    begin={`${i * 0.1}s`}
                  />
                </circle>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}
