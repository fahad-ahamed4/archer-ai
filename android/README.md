# Archer AI Android (Capacitor)

This folder contains the Capacitor configuration to build Archer AI as an Android app (.apk).

## Prerequisites

1. **Android Studio** (latest version)
2. **Java JDK 17** (Android Studio ships with one)
3. **Android SDK** (Platform 34, Build Tools 34.0.0)
4. **Gradle** (use the wrapper that Capacitor generates)

## Quick Start

### Step 1: Build the Web App

The Android app loads the deployed Archer AI web URL (since the app uses API routes that can't be statically exported).

### Step 2: Update APP_URL

Edit `capacitor.config.ts` and replace the `server.url` with your deployed URL:

```typescript
server: {
  url: 'https://your-archer-app.vercel.app',
  cleartext: true,
}
```

### Step 3: Add Android Platform (first time only)

```bash
cd android
bun install
npx cap add android
```

### Step 4: Build the APK

```bash
# Sync web assets to Android project
bun run sync

# Build debug APK (unsigned)
bun run build:apk

# The APK will be at ../archer-ai.apk
```

### Step 5: Build Release APK (signed)

```bash
# Generate keystore (one-time)
keytool -genkey -v -keystore archer-release.keystore -alias archer -keyalg RSA -keysize 2048 -validity 10000

# Configure signing in android/app/build.gradle
# Then build:
bun run build:release
```

## Features

- Wraps the deployed Archer AI web app in a native Android shell
- App icon and splash screen
- Status bar customization (dark theme)
- Back button support
- Offline cache (via service worker in web app)
- Push notifications support (future)

## Manual APK Build (Alternative)

If you prefer to build manually with Android Studio:

```bash
cd android
npx cap open android  # Opens Android Studio
# In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

The APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Install APK on Device

```bash
# Enable USB debugging on your Android device
# Then:
adb install archer-ai.apk
```
