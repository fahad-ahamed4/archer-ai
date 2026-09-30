# Archer AI Desktop (Electron)

This folder contains the Electron configuration to build Archer AI as a desktop application for **Windows (.exe)**, **macOS (.dmg)**, and **Linux (.AppImage)**.

## Quick Start

### Development
```bash
# Install dependencies (run from project root)
cd electron && bun install

# Make sure the Next.js client is running (in another terminal)
cd ../client && bun run dev

# Run Electron in dev mode (loads localhost:3000)
cd ../electron && bun run dev
```

### Production Build

```bash
# Set the deployed URL (replace with your deployment)
export APP_URL=https://your-archer-app.vercel.app

# Build for Windows (.exe)
cd electron && bun run build:win

# Build for macOS (.dmg)
bun run build:mac

# Build for Linux (.AppImage)
bun run build:linux

# Build for all platforms
bun run build:all
```

The installer will be in `electron/dist/`.

## Configuration

Update the `APP_URL` in `main.cjs` (or set as environment variable) to point to your deployed Archer AI web app:

```javascript
const APP_URL = process.env.APP_URL || 'https://your-archer-app.vercel.app';
```

## Features

- Loads the deployed web app in a native desktop window
- 480×900 default window size (mobile-style aspect ratio)
- External links open in default browser
- Custom menu bar with reload, zoom, and Help options
- Cross-platform builds (Windows, macOS, Linux)
- NSIS installer for Windows (with desktop shortcut)
