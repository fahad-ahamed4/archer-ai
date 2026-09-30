// =====================================================
// Archer AI - Standalone Backend Server (Optional)
// =====================================================
// This is an alternative standalone Node.js Express server that
// provides the same /api/archer-chat endpoint as the Next.js API route.
// Use this ONLY if you want to deploy the backend separately from
// the Next.js client (e.g., for desktop/mobile apps to call directly).
//
// Most users don't need this - just use the Next.js API routes.
// =====================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ZAI from 'z-ai-web-dev-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: '*' })); // In production: restrict origin
app.use(express.json({ limit: '1mb' }));

// Rate limiting (simple in-memory)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const last = rateLimit.get(ip) || { count: 0, reset: now };

  if (now > last.reset + RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, reset: now });
  } else {
    last.count++;
    rateLimit.set(ip, last);
  }

  if (last.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Rate limit exceeded', reply: 'Sir, ekhon onek request korechen. Ektar pore try korun.' });
  }
  next();
}

app.use(rateLimiter);

// === Banglish LLM Persona (same as Next.js API route) ===
const ARCHER_SYSTEM_PROMPT = `You are ARCHER AI — a personal AI friend crafted by "Tony sir". You speak in BANGLISH (Bangla in Roman script). Keep responses SHORT (1-3 sentences) since they will be spoken aloud via TTS. Use respectful words like "sir", "hukum", "bilkul". NEVER use Hindi words.`;

// === Chat endpoint ===
app.post('/api/archer-chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Message required',
        reply: 'Sir, mujhe samajh nahi aaya. Phir se boliye.',
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: 'Message too long',
        reply: 'Sir, message thoda chhota rakhiye.',
      });
    }

    const sanitizedHistory = Array.isArray(history)
      ? history
          .filter(
            (m) =>
              m &&
              typeof m.content === 'string' &&
              (m.role === 'user' || m.role === 'assistant') &&
              m.content.length < 1000
          )
          .slice(-8)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))
      : [];

    const conversationMessages = [
      { role: 'system', content: ARCHER_SYSTEM_PROMPT },
      ...sanitizedHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    let zai;
    try {
      zai = await ZAI.create();
    } catch (e) {
      console.error('ZAI SDK init failed:', e?.message);
      return res.status(503).json({
        error: 'AI service unavailable',
        reply: 'Sir, mera neural network is waqt offline hai.',
      });
    }

    let reply;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const completion = await zai.chat.completions.create({
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 180,
        thinking: { type: 'disabled' },
      });
      clearTimeout(timeout);

      reply =
        (completion?.choices?.[0]?.message?.content ?? '').trim() ||
        'Sir, mujhe is waqt samajh nahi aa raha.';
    } catch (e) {
      console.error('LLM call failed:', e?.message);
      return res.status(500).json({
        error: 'LLM call failed',
        reply: 'Sir, main is waqt process nahi kar paa raha.',
      });
    }

    res.json({ reply, ok: true });
  } catch (e) {
    console.error('Unexpected error:', e?.message);
    res.status(500).json({
      error: 'Internal error',
      reply: 'Sir, kuch garbar ho gaya.',
    });
  }
});

// === Health check ===
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'archer-ai-server',
    version: '4.0.0',
    timestamp: new Date().toISOString(),
  });
});

// === Root info ===
app.get('/', (req, res) => {
  res.json({
    name: 'Archer AI Server',
    version: '4.0.0',
    endpoints: ['/api/archer-chat', '/health'],
    docs: 'https://github.com/fahad-ahamed4/archer-ai',
  });
});

app.listen(PORT, () => {
  console.log(`[Archer AI Server] Running on http://localhost:${PORT}`);
  console.log(`[Archer AI Server] Health: http://localhost:${PORT}/health`);
});
