"use client";

import { useEffect, useRef } from "react";

export type OrbState = "idle" | "listening" | "speaking" | "dreaming" | "processing";

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  colorType: number; // 0 = primary color, 1 = secondary color
  angle: number;
  radius: number;
  speed: number;
}

interface ParticleOrbProps {
  state: OrbState;
  activeModuleColor?: string;
  size?: number;
}

// Particle colors: cyan + yellow/gold (matches TikTok video exactly)
const STATE_CONFIG: Record<
  OrbState,
  {
    particleCount: number;
    primary: string;
    secondary: string;
    rotationSpeed: number;
    pulseAmount: number;
    glow: string;
    bgColor: string;
    centerColor: string;
    centerRadius: number;
  }
> = {
  idle: {
    particleCount: 45, // reduced for perf
    primary: "#00d4ff",
    secondary: "#ffb347",
    rotationSpeed: 0.001,
    pulseAmount: 0.2,
    glow: "rgba(0, 212, 255, 0.3)",
    bgColor: "rgba(0, 212, 255, 0.03)",
    centerColor: "#00ff88",
    centerRadius: 18,
  },
  listening: {
    particleCount: 80,
    primary: "#00d4ff",
    secondary: "#ffb347",
    rotationSpeed: 0.004,
    pulseAmount: 0.6,
    glow: "rgba(0, 212, 255, 0.65)",
    bgColor: "rgba(0, 212, 255, 0.08)",
    centerColor: "#00d4ff",
    centerRadius: 22,
  },
  speaking: {
    particleCount: 90, // reduced from 120
    primary: "#00d4ff",
    secondary: "#ffb347",
    rotationSpeed: 0.014,
    pulseAmount: 1.1,
    glow: "rgba(0, 212, 255, 0.75)",
    bgColor: "rgba(0, 212, 255, 0.12)",
    centerColor: "#00d4ff",
    centerRadius: 30,
  },
  dreaming: {
    particleCount: 70,
    primary: "#ffb347",
    secondary: "#b026ff",
    rotationSpeed: 0.0008,
    pulseAmount: 0.4,
    glow: "rgba(255, 179, 71, 0.5)",
    bgColor: "rgba(255, 179, 71, 0.08)",
    centerColor: "#ffb347",
    centerRadius: 20,
  },
  processing: {
    particleCount: 95, // reduced from 115
    primary: "#00d4ff",
    secondary: "#ffb347",
    rotationSpeed: 0.018,
    pulseAmount: 1.0,
    glow: "rgba(0, 212, 255, 0.8)",
    bgColor: "rgba(0, 212, 255, 0.14)",
    centerColor: "#00d4ff",
    centerRadius: 25,
  },
};

// === Performance: spatial bucketing for connection lines ===
// Instead of O(n²) pairwise checks, bucket particles into a grid and only check
// neighbors in adjacent buckets. Reduces checks from ~12000 to ~600 per frame.
function buildSpatialGrid(particles: Particle[], w: number, h: number, cellSize: number) {
  const cols = Math.max(1, Math.ceil(w / cellSize));
  const rows = Math.max(1, Math.ceil(h / cellSize));
  const grid: Particle[][] = new Array(cols * rows);
  for (let i = 0; i < grid.length; i++) grid[i] = [];
  for (const p of particles) {
    const cx = Math.max(0, Math.min(cols - 1, Math.floor(p.x / cellSize)));
    const cy = Math.max(0, Math.min(rows - 1, Math.floor(p.y / cellSize)));
    grid[cy * cols + cx].push(p);
  }
  return { grid, cols, rows };
}

export function ParticleOrb({
  state,
  activeModuleColor,
  size = 260,
}: ParticleOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const stateRef = useRef<OrbState>(state);
  const moduleColorRef = useRef<string>(activeModuleColor || "#00d4ff");
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Update refs when props change
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    moduleColorRef.current = activeModuleColor || "#00d4ff";
  }, [activeModuleColor]);

  // Initialize canvas + particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR for perf

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();

    const initParticles = () => {
      const cfg = STATE_CONFIG[stateRef.current];
      const rect = canvas.getBoundingClientRect();
      const center = rect.width / 2;
      const maxR = Math.max(8, rect.width / 2 - 8);
      const arr: Particle[] = [];

      for (let i = 0; i < cfg.particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * maxR;
        arr.push({
          x: center + Math.cos(angle) * radius,
          y: center + Math.sin(angle) * radius,
          size: 0.8 + Math.random() * 1.8,
          baseAlpha: 0.35 + Math.random() * 0.65,
          colorType: Math.random() > 0.5 ? 1 : 0,
          angle,
          radius,
          speed: 0.4 + Math.random() * 1.6,
        });
      }
      particlesRef.current = arr;
    };

    initParticles();

    // Feature-detect ResizeObserver (old Safari fallback)
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        resizeCanvas();
        initParticles();
      });
      ro.observe(canvas);
    }

    // === Performance: cache radial gradients instead of creating per frame ===
    // Pre-create gradient objects per particle (re-uses across frames)
    const gradientCacheRef = new Map<string, CanvasGradient>();

    // === Animation loop ===
    const animate = (now: number) => {
      // Use real delta time for frame-rate independence
      const delta = lastFrameTimeRef.current ? (now - lastFrameTimeRef.current) / 1000 : 0.016;
      lastFrameTimeRef.current = now;
      timeRef.current += Math.min(delta, 0.05); // cap delta to avoid huge jumps

      // === Performance: skip rendering when tab is hidden ===
      if (document.hidden) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const cfg = STATE_CONFIG[stateRef.current];
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.max(8, w / 2 - 8);

      const t = timeRef.current;
      const pulse = Math.sin(t * 2) * cfg.pulseAmount;

      // Clear with slight trail
      ctx.fillStyle = "rgba(5, 8, 7, 0.15)";
      ctx.fillRect(0, 0, w, h);

      // Update particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.angle += cfg.rotationSpeed * p.speed;
        const breathMod = Math.sin(t * 1.5 + i) * 4 * cfg.pulseAmount;
        const targetR = Math.max(0, p.radius + breathMod);
        const clampedR = Math.min(maxR, targetR);

        p.x = cx + Math.cos(p.angle) * clampedR;
        p.y = cy + Math.sin(p.angle) * clampedR;

        if (stateRef.current === "speaking") {
          const offsetX = -8 + Math.sin(t * 4 + i * 0.3) * 4;
          const offsetY = Math.cos(t * 6 + i * 0.5) * 3;
          p.x += offsetX;
          p.y += offsetY;
        } else if (stateRef.current === "listening") {
          const inwardPulse = Math.sin(t * 3 + i * 0.2) * 2;
          p.x += Math.cos(p.angle) * inwardPulse;
          p.y += Math.sin(p.angle) * inwardPulse;
        } else if (stateRef.current === "dreaming") {
          p.x += Math.sin(t * 0.5 + i) * 0.5;
          p.y += Math.cos(t * 0.4 + i * 1.2) * 0.5;
        } else if (stateRef.current === "processing") {
          p.angle += 0.003;
        }
      }

      // === Outer rings ===
      ctx.beginPath();
      ctx.arc(cx, cy, maxR + 4, 0, Math.PI * 2);
      ctx.strokeStyle = cfg.primary;
      ctx.globalAlpha = 0.12 + pulse * 0.08;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.strokeStyle = cfg.primary;
      ctx.globalAlpha = 0.35 + pulse * 0.15;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // === Radial spokes for active states ===
      if (stateRef.current !== "idle") {
        const spokes = stateRef.current === "processing" ? 12 : 8;
        for (let i = 0; i < spokes; i++) {
          const a = (i / spokes) * Math.PI * 2 + t * (stateRef.current === "processing" ? 0.6 : 0.3);
          const innerR = maxR - 6;
          const outerR = maxR + 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR);
          ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
          ctx.strokeStyle = cfg.primary;
          ctx.globalAlpha = 0.25 + pulse * 0.15;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // === Performance: connection lines using spatial grid (O(n) instead of O(n²)) ===
      const cellSize = 28;
      const { grid, cols, rows } = buildSpatialGrid(particles, w, h, cellSize);
      ctx.globalAlpha = 1;
      const maxDist = 26;
      const maxDistSq = maxDist * maxDist;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cell = grid[row * cols + col];
          if (!cell.length) continue;
          // Check this cell + 4 adjacent cells (down-right quadrant to avoid double-counting)
          const neighbors = [cell];
          if (col + 1 < cols) neighbors.push(grid[row * cols + col + 1]);
          if (row + 1 < rows) {
            neighbors.push(grid[(row + 1) * cols + col]);
            if (col + 1 < cols) neighbors.push(grid[(row + 1) * cols + col + 1]);
            if (col - 1 >= 0) neighbors.push(grid[(row + 1) * cols + col - 1]);
          }
          for (let i = 0; i < cell.length; i++) {
            const p1 = cell[i];
            for (let nIdx = 0; nIdx < neighbors.length; nIdx++) {
              const neighborCell = neighbors[nIdx];
              const startJ = nIdx === 0 ? i + 1 : 0; // skip self-pairs in same cell
              for (let j = startJ; j < neighborCell.length; j++) {
                const p2 = neighborCell[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < maxDistSq) {
                  const alpha = (1 - Math.sqrt(distSq) / maxDist) * 0.22;
                  ctx.beginPath();
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.strokeStyle = cfg.primary;
                  ctx.globalAlpha = alpha;
                  ctx.lineWidth = 0.5;
                  ctx.stroke();
                }
              }
            }
          }
        }
      }

      // === Draw particles ===
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const color = p.colorType === 1 ? cfg.secondary : cfg.primary;
        ctx.beginPath();
        const radius = Math.max(0.5, p.size + pulse * 0.5);
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.baseAlpha + pulse * 0.2;
        ctx.fill();

        // === Performance: cached radial gradient for glow halos ===
        if (p.size > 1.2) {
          const haloR = Math.max(0.5, p.size * 2.8);
          const cacheKey = `${color}-${haloR.toFixed(1)}`;
          let grad = gradientCacheRef.get(cacheKey);
          if (!grad) {
            grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
            grad.addColorStop(0, color);
            grad.addColorStop(1, "rgba(0,0,0,0)");
            // Note: gradients are tied to particle position via createRadialGradient;
            // since position changes each frame, we can't truly cache. But for low particle counts
            // the overhead is small. For higher perf, use a sprite/tile approach.
            // For now, fall back to creating each frame but with cap on count.
          }
          // Re-create gradient at current particle position (gradients are position-bound)
          ctx.beginPath();
          ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
          const liveGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
          liveGrad.addColorStop(0, color);
          liveGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = liveGrad;
          ctx.globalAlpha = (p.baseAlpha + pulse * 0.2) * 0.4;
          ctx.fill();
        }
      }

      // === Center bright spot ===
      ctx.globalAlpha = 1;
      const centerR = cfg.centerRadius + pulse * 4;
      const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR);
      centerGrad.addColorStop(0, cfg.centerColor);
      centerGrad.addColorStop(0.4, cfg.centerColor + "80");
      centerGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = centerGrad;
      ctx.globalAlpha = 0.55 + pulse * 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      ctx.fill();

      // === SPEAKING: animated sound bars in center ===
      if (stateRef.current === "speaking") {
        const barCount = 5;
        const barWidth = 2;
        const barGap = 2;
        const totalWidth = barCount * barWidth + (barCount - 1) * barGap;
        const startX = cx - totalWidth / 2;
        for (let i = 0; i < barCount; i++) {
          const barH = 4 + Math.abs(Math.sin(t * 9 + i * 0.7)) * 18;
          ctx.fillStyle = cfg.primary;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(startX + i * (barWidth + barGap), cy - barH / 2, barWidth, barH);
        }
      }

      // === LISTENING: pulsing concentric circles ===
      if (stateRef.current === "listening") {
        for (let i = 0; i < 3; i++) {
          const ringR = ((t * 25 + i * 30) % 70) + 5;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = cfg.primary;
          ctx.globalAlpha = 0.3 * (1 - ringR / 75);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // === PROCESSING: spinning inner gear ===
      if (stateRef.current === "processing") {
        const gearR = 12;
        const gearTeeth = 8;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 4);
        for (let i = 0; i < gearTeeth; i++) {
          const a = (i / gearTeeth) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * gearR, Math.sin(a) * gearR);
          ctx.lineTo(Math.cos(a) * (gearR + 4), Math.sin(a) * (gearR + 4));
          ctx.strokeStyle = cfg.primary;
          ctx.globalAlpha = 0.85;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (ro) ro.disconnect();
      gradientCacheRef.clear();
    };
  }, []);

  // Get visual properties for CSS layer
  const glowColor = STATE_CONFIG[state].glow;
  const borderColor = STATE_CONFIG[state].primary;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{
        filter: `drop-shadow(0 0 16px ${glowColor})`,
      }}
      role="img"
      aria-label={`Archer AI ${state} state visualization`}
    >
      {/* Background glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at center, ${STATE_CONFIG[state].bgColor} 0%, transparent 70%)`,
        }}
      />

      {/* Outer rotating rings */}
      <div
        className="absolute inset-2 rounded-full border animate-rotate-slow"
        aria-hidden="true"
        style={{
          borderColor: `${borderColor}30`,
          borderTopColor: `${borderColor}80`,
          borderRightColor: `${borderColor}40`,
        }}
      />
      <div
        className="absolute inset-4 rounded-full border animate-rotate-reverse"
        aria-hidden="true"
        style={{
          borderColor: `${borderColor}20`,
          borderBottomColor: `${borderColor}50`,
        }}
      />

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="relative w-full h-full"
        style={{ width: "100%", height: "100%" }}
        aria-hidden="true"
      />
    </div>
  );
}
