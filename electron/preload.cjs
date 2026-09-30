// =====================================================
// Archer AI - Electron Preload Script
// Secure bridge between renderer (web app) and main process
// =====================================================

const { contextBridge, ipcRenderer } = require('electron');

// Expose minimal API to the renderer process
contextBridge.exposeInMainWorld('archerDesktop', {
  // Get platform info
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  // Check if running inside Electron
  isDesktop: true,

  // Open URL in default browser
  openExternal: (url) => ipcRenderer.send('open-external', url),

  // App version
  appVersion: '4.0.0',
});
