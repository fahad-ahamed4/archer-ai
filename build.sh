#!/bin/bash
# =====================================================
# Archer AI - Build Script (Z.ai compatible)
# =====================================================
# Builds the Next.js app from client/ folder, then
# places the standalone output at the root .next/
# so Z.ai's deploy system can find server.js
# =====================================================

set -e

PROJECT_ROOT="/home/z/my-project"
CLIENT_DIR="$PROJECT_ROOT/client"

echo "🚀 Building Archer AI from $CLIENT_DIR..."

cd "$CLIENT_DIR" || exit 1

# Set env
export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=production

# Build the Next.js app
echo "📦 Building Next.js..."
bun run build

# Verify standalone output was generated
if [ ! -d ".next/standalone" ]; then
    echo "❌ Build failed: standalone output not generated"
    exit 1
fi

# Find server.js (it may be nested in standalone/client/server.js)
SERVER_JS=""
if [ -f ".next/standalone/server.js" ]; then
    SERVER_JS=".next/standalone/server.js"
elif [ -f ".next/standalone/client/server.js" ]; then
    SERVER_JS=".next/standalone/client/server.js"
fi

if [ -z "$SERVER_JS" ]; then
    echo "❌ Build failed: server.js not found in standalone output"
    exit 1
fi

echo "✓ Found server.js at: $SERVER_JS"

# Clean root .next
echo "🧹 Cleaning root .next..."
rm -rf "$PROJECT_ROOT/.next"

# Copy .next folder from client/ to root/
echo "📁 Copying .next to project root..."
cp -r "$CLIENT_DIR/.next" "$PROJECT_ROOT/.next"

# Fix nested standalone/client/ → standalone/
# When Next.js builds a project inside a subdirectory, it preserves the path
# structure in standalone output. So we have standalone/client/server.js
# but Z.ai expects standalone/server.js at root level.
if [ -d "$PROJECT_ROOT/.next/standalone/client" ]; then
    echo "🔧 Fixing nested standalone structure..."
    STANDALONE_DIR="$PROJECT_ROOT/.next/standalone"

    # Move contents of standalone/client/ up one level
    cd "$STANDALONE_DIR" || exit 1

    # Copy/move client subfolder contents to standalone root
    # Use cp + rm to avoid issues with moving folders that may have name conflicts
    cp -rf client/* . 2>/dev/null || true
    cp -rf client/.* . 2>/dev/null || true
    rm -rf client

    echo "✓ Moved standalone/client/* up to standalone/"
fi

# Verify final structure
if [ -f "$PROJECT_ROOT/.next/standalone/server.js" ]; then
    echo "✅ server.js is at root .next/standalone/server.js"
else
    echo "❌ server.js NOT found at root .next/standalone/server.js"
    ls -la "$PROJECT_ROOT/.next/standalone/" 2>/dev/null
    exit 1
fi

# Ensure public folder exists at root for standalone server
if [ ! -d "$PROJECT_ROOT/public" ]; then
    mkdir -p "$PROJECT_ROOT/public"
fi

# Copy client/public/* to root public/ (for static assets)
if [ -d "$CLIENT_DIR/public" ]; then
    echo "📁 Copying public assets to root..."
    cp -rf "$CLIENT_DIR/public/"* "$PROJECT_ROOT/public/" 2>/dev/null || true
fi

# Also copy .next/static to root if not already there
if [ -d "$CLIENT_DIR/.next/static" ] && [ ! -d "$PROJECT_ROOT/.next/static" ]; then
    cp -rf "$CLIENT_DIR/.next/static" "$PROJECT_ROOT/.next/static"
fi

echo ""
echo "🎉 Build complete!"
echo "📍 Standalone server at: $PROJECT_ROOT/.next/standalone/server.js"
echo "📍 Static assets at: $PROJECT_ROOT/.next/static/"
echo "📍 Public folder at: $PROJECT_ROOT/public/"
