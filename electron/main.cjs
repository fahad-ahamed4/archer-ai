// =====================================================
// Archer AI - Electron Main Process
// Loads the deployed Archer AI web app inside a desktop window
// =====================================================

const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

// =====================================================
// CONFIG - Update APP_URL after deploying the Next.js app
// =====================================================
const APP_URL = process.env.APP_URL || 'https://archer-ai.vercel.app';
const DEV_URL = process.env.DEV_URL || 'http://localhost:3000';
const isDev = process.env.NODE_ENV === 'development' || !!process.env.DEV_URL;

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 900,
    minWidth: 360,
    minHeight: 640,
    title: 'Archer AI',
    backgroundColor: '#030410',
    show: false,
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    // Remove menu bar for cleaner look
    autoHideMenuBar: true,
  });

  // Load the deployed web app (or localhost in dev)
  const url = isDev ? DEV_URL : APP_URL;
  console.log(`[Archer AI] Loading URL: ${url}`);
  mainWindow.loadURL(url);

  // Show window when ready (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Open external links (https://) in default browser
  // But allow our own app URLs to navigate internally
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (targetUrl.startsWith(APP_URL) || targetUrl.startsWith(DEV_URL)) {
      return { action: 'allow' };
    }
    shell.openExternal(targetUrl);
    return { action: 'deny' };
  });

  // Handle navigation: only allow same-origin, external goes to browser
  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (targetUrl.startsWith(APP_URL) || targetUrl.startsWith(DEV_URL)) {
      return; // allow
    }
    event.preventDefault();
    shell.openExternal(targetUrl);
  });

  // Set application menu (minimal)
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Archer AI',
          click: () => {
            shell.openExternal('https://github.com/fahad-ahamed4/archer-ai');
          },
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/fahad-ahamed4/archer-ai/issues');
          },
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// =====================================================
// App lifecycle
// =====================================================
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // macOS: re-create window when dock icon is clicked and no other windows open
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // macOS: apps stay active until user quits explicitly
  if (process.platform !== 'darwin') app.quit();
});

// Security: prevent new windows from creating non-sandboxed contexts
app.on('web-contents-created', (event, contents) => {
  contents.on('will-attach-webview', (event, webPreferences) => {
    delete webPreferences.preload;
    webPreferences.sandbox = true;
  });
});

// Log unhandled errors
process.on('uncaughtException', (error) => {
  console.error('[Archer AI] Uncaught exception:', error);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Archer AI] Unhandled rejection:', reason);
});
