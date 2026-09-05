/**
 * Nazar Battu — Electron Main Process
 *
 * Creates a transparent, frameless, always-on-top BrowserWindow covering the
 * entire primary display work area. Default state: click-through with forwarded
 * mouse events so the renderer can hit-test while OS clicks pass through.
 *
 * Architecture: 3-state IPC mouse-event loop (PASSTHROUGH → INTERACTIVE → DRAGGING)
 * See docs/TRD.md §3 for full state machine documentation.
 */

import { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

// --- Global references (prevent GC) ---
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isDragging = false;

function createWindow(): void {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  mainWindow = new BrowserWindow({
    // Geometry: cover entire primary display work area
    x: workArea.x,
    y: workArea.y,
    width: workArea.width,
    height: workArea.height,

    // Transparency & frameless — no visible chrome, per-pixel alpha
    transparent: true,
    frame: false,
    hasShadow: false,

    // Z-order & taskbar — float above everything, invisible in alt-tab
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,

    // Prevent resize/move by user
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,

    // Security — strict isolation, no Node in renderer
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Default state: click-through with forwarded mouse events
  // forward: true → renderer still receives mousemove for hit-testing
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Highest z-level to float above windows
  if (process.platform === 'darwin') {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } else {
    mainWindow.setAlwaysOnTop(true);
  }

  // Diagnostics: forward renderer logs and load status
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer L${level}] ${message} (${sourceId}:${line})`);
  });
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Renderer Load Error ${errorCode}] ${errorDescription} (${validatedURL})`);
  });
  mainWindow.webContents.on('dom-ready', () => {
    console.log('[Renderer] DOM ready');
  });

  // Load the renderer
  if (process.env.ELECTRON_RENDERER_URL) {
    console.log(`[Main] Loading dev renderer: ${process.env.ELECTRON_RENDERER_URL}`);
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    console.log('[Main] Loading production renderer file');
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- IPC Handlers for the 3-state mouse-event loop ---

/**
 * Toggle mouse pass-through on the main window.
 * Called by renderer when cursor enters/leaves charm hit-area.
 */
ipcMain.on('charm:set-interactive', (_event, payload: { ignore: boolean; forward?: boolean }) => {
  if (!mainWindow || isDragging) return;

  if (payload.ignore) {
    mainWindow.setIgnoreMouseEvents(true, { forward: payload.forward ?? true });
  } else {
    mainWindow.setIgnoreMouseEvents(false);
  }
});

/**
 * Lock interactive state during drag operations.
 * Prevents accidental pass-through toggle while user is dragging the charm.
 */
ipcMain.on('charm:drag-start', () => {
  isDragging = true;
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(false);
  }
});

/**
 * Unlock drag state and resolve next mouse-event state.
 * If cursor is still in hit-area → stay interactive; otherwise → pass-through.
 */
ipcMain.on('charm:drag-end', (_event, payload: { cursorInHitArea: boolean }) => {
  isDragging = false;
  if (!mainWindow) return;

  if (!payload.cursorInHitArea) {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  }
});

interface AppSettings {
  activeCharmId: string;
  audioEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  activeCharmId: 'nimbu-mirchi',
  audioEnabled: true,
};

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'nazar-battu-settings.json');
}

function loadSettings(): AppSettings {
  try {
    const filePath = getSettingsPath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.log('[Main] Settings not found or corrupt, using defaults:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

let settings: AppSettings = DEFAULT_SETTINGS;

function saveSettings(update: Partial<AppSettings>): void {
  settings = { ...settings, ...update };
  try {
    const filePath = getSettingsPath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Main] Failed to persist settings:', err);
  }
}

// --- IPC Handlers for settings ---
ipcMain.handle('settings:get', () => {
  return settings;
});

ipcMain.on('settings:save', (_event, update: Partial<AppSettings>) => {
  saveSettings(update);
  updateTrayMenu();
});

// --- Emergency Dev Controls (Escape / Anchor double-click) ---
ipcMain.on('app:dev-action', (_event, payload: { action: 'toggle' | 'quit' | 'reset' }) => {
  console.log(`[Main] Emergency dev action: ${payload.action}`);
  if (payload.action === 'quit') {
    app.quit();
  } else if (payload.action === 'toggle') {
    if (mainWindow) {
      mainWindow.webContents.send('tray:toggle-visibility');
    }
  } else if (payload.action === 'reset') {
    if (mainWindow) {
      mainWindow.webContents.send('tray:reset-position');
    }
  }
});

// --- System Tray ---

function updateTrayMenu(): void {
  if (!tray) return;

  const charms = [
    { id: 'nimbu-mirchi', label: '🍋 Nimbu-Mirchi (Lemon & Chilies)' },
    { id: 'evil-eye', label: '🧿 Evil Eye (Nazar Boncuğu)' },
    { id: 'mahakal-mask', label: '👹 Mahakal Demon Mask' },
    { id: 'ghanta', label: '🔔 Ghanta (Temple Bell)' },
  ];

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Nazar Battu — Active',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Show / Hide Charm',
      click: () => {
        mainWindow?.webContents.send('tray:toggle-visibility');
      },
    },
    {
      label: 'Reset Position to Center',
      click: () => {
        mainWindow?.webContents.send('tray:reset-position');
      },
    },
    { type: 'separator' },
    {
      label: 'Select Charm',
      submenu: charms.map((c) => ({
        label: c.label,
        type: 'radio' as const,
        checked: settings.activeCharmId === c.id,
        click: () => {
          settings.activeCharmId = c.id;
          saveSettings({ activeCharmId: c.id });
          mainWindow?.webContents.send('tray:change-charm', { charmId: c.id });
          updateTrayMenu();
        },
      })),
    },
    {
      label: 'Sound Effects',
      type: 'checkbox' as const,
      checked: settings.audioEnabled,
      click: (item) => {
        settings.audioEnabled = item.checked;
        saveSettings({ audioEnabled: item.checked });
        mainWindow?.webContents.send('tray:toggle-audio', { enabled: item.checked });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit Nazar Battu',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function createTray(): void {
  // Generate 16x16 Nazar Battu talisman icon buffer for system tray
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);
  const center = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - center;
      const dy = y - center;
      const distSq = dx * dx + dy * dy;
      if (distSq <= 49) {
        if (distSq <= 4) {
          // Pupil (dark blue/black)
          buffer[idx] = 15;
          buffer[idx + 1] = 23;
          buffer[idx + 2] = 42;
          buffer[idx + 3] = 255;
        } else if (distSq <= 16) {
          // Iris (cyan/turquoise)
          buffer[idx] = 14;
          buffer[idx + 1] = 165;
          buffer[idx + 2] = 233;
          buffer[idx + 3] = 255;
        } else if (distSq <= 32) {
          // Sclera (white ring)
          buffer[idx] = 248;
          buffer[idx + 1] = 250;
          buffer[idx + 2] = 252;
          buffer[idx + 3] = 255;
        } else {
          // Deep blue outer ring
          buffer[idx] = 30;
          buffer[idx + 1] = 58;
          buffer[idx + 2] = 138;
          buffer[idx + 3] = 255;
        }
      }
    }
  }

  const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
  tray = new Tray(icon);
  tray.setToolTip('Nazar Battu — Desktop Charm');

  updateTrayMenu();

  // Double-click tray icon → toggle visibility
  tray.on('double-click', () => {
    mainWindow?.webContents.send('tray:toggle-visibility');
  });
}

// --- App Lifecycle ---

app.whenReady().then(() => {
  settings = loadSettings();
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
