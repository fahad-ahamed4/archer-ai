import type { CapacitorConfig } from '@capacitor/cli';

// =====================================================
// Archer AI - Android (Capacitor) Configuration
// =====================================================

const config: CapacitorConfig = {
  appId: 'com.archer.ai',
  appName: 'Archer AI',
  // Web assets location (we'll use remote URL since we have API routes)
  webDir: '../client/out',
  // Use deployed URL as the primary source (since app uses API routes)
  server: {
    // UPDATE THIS to your deployed Archer AI URL
    url: process.env.APP_URL || 'https://archer-ai.vercel.app',
    cleartext: true,
  },
  android: {
    backgroundColor: '#030410',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#030410',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'LARGE',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#030410',
      overlaysWebView: false,
    },
    App: {
      // Restart on tap after backgrounding
      killOnTap: false,
    },
  },
  // iOS not configured (Android only for now)
  ios: undefined,
};

export default config;
