# Archer AI Server (Optional Standalone Backend)

This is an **optional** standalone Node.js Express server that provides the same `/api/archer-chat` endpoint as the Next.js API routes.

## When to Use This

You typically **don't need this** — the Next.js client at `client/` already has built-in API routes that work great.

Use this only if you want to:
- Deploy the backend separately from the frontend
- Use a custom backend URL for Electron/Android apps
- Add custom middleware (auth, rate limiting, logging)
- Run a separate backend on a different server

## Quick Start

```bash
cd server
bun install
bun run dev  # starts on port 3001
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/archer-chat` | POST | Chat with Archer AI |
| `GET /health` | GET | Health check |
| `GET /` | GET | Server info |

## Configuration

Create a `.env` file:
```env
PORT=3001
# Z.ai SDK credentials (set up via Z.ai SDK config)
```

## Production Deployment

```bash
# Install dependencies
bun install --production

# Start server
bun run start

# Or use PM2 for process management
pm2 start index.js --name archer-ai-server
```

## Using with Electron/Android

If you're running this server, update the Electron and Android configs to point to your server URL instead of the Next.js deployment.

For Electron (`electron/main.cjs`):
```javascript
const APP_URL = 'http://your-server:3001';  // or HTTPS in prod
```

For Android (`android/capacitor.config.ts`):
```typescript
server: {
  url: 'http://your-server:3001',
  cleartext: true,
}
```

## Features

- Same Banglish LLM persona as Next.js API route
- Built-in rate limiting (30 req/min per IP)
- Input validation (1000 char max)
- History sanitization (prompt injection protection)
- 15s LLM call timeout
- Health check endpoint
- CORS enabled (restrict in production)
