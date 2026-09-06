/**
 * Nazar Battu — Main Process
 *
 * Manages the frameless, transparent, always-on-top desktop overlay window.
 * Handles the 3-state mouse-event pass-through loop, system tray integration,
 * dynamic multi-talisman selector, and persistent settings.
 *
 * See docs/TRD.md §3 for the full architecture specification.
 */

import { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isDragging = false;
let isMenuOpen = false;

// --- Window Lifecycle ---

function createWindow(): void {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x, y, width, height } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    movable: false,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.platform === 'darwin') {
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    mainWindow.setAlwaysOnTop(true, 'floating');
  } else {
    // Standard always-on-top for Windows (screen-saver is suppressed by Windows DWM)
    mainWindow.setAlwaysOnTop(true);
  }

  // Initial state: passthrough mode (ignore clicks, forward cursor movements)
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

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
  if (!mainWindow || isDragging || isMenuOpen) return;

  if (payload.ignore) {
    mainWindow.setIgnoreMouseEvents(true, { forward: payload.forward ?? true });
  } else {
    mainWindow.setIgnoreMouseEvents(false);
  }
});

/**
 * Lock interactive state while floating menu is open.
 */
ipcMain.on('menu:set-open', (_event, open: boolean) => {
  isMenuOpen = open;
  if (!mainWindow) return;
  if (open) {
    mainWindow.setIgnoreMouseEvents(false);
  } else {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  }
});

/**
 * Lock interactive state during drag operations.
 */
ipcMain.on('charm:drag-start', () => {
  isDragging = true;
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(false);
  }
});

/**
 * Unlock drag state and resolve next mouse-event state.
 */
ipcMain.on('charm:drag-end', (_event, payload: { cursorInHitArea: boolean }) => {
  isDragging = false;
  if (!mainWindow) return;

  if (isMenuOpen) {
    mainWindow.setIgnoreMouseEvents(false);
    return;
  }

  if (!payload.cursorInHitArea) {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  }
});

interface AppSettings {
  activeCharmId: string;
  audioEnabled: boolean;
  positionLane: 'left' | 'center' | 'right';
}

const DEFAULT_SETTINGS: AppSettings = {
  activeCharmId: 'nimbu-mirchi',
  audioEnabled: true,
  positionLane: 'right', // Right as default!
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

// --- Auto-Launch on Windows Login ---
ipcMain.handle('autolaunch:get', () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.handle('autolaunch:set', (_event, enable: boolean) => {
  app.setLoginItemSettings({ openAtLogin: enable, openAsHidden: false });
  return app.getLoginItemSettings().openAtLogin;
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
    // Directly accessible talisman selection!
    ...charms.map((c) => ({
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
    { type: 'separator' },
    // Screen Position Lane
    {
      label: 'Screen Position',
      submenu: [
        {
          label: '⬅️ Left',
          type: 'radio' as const,
          checked: settings.positionLane === 'left',
          click: () => {
            settings.positionLane = 'left';
            saveSettings({ positionLane: 'left' });
            mainWindow?.webContents.send('tray:change-lane', { lane: 'left' });
            updateTrayMenu();
          },
        },
        {
          label: '⏺️ Center',
          type: 'radio' as const,
          checked: settings.positionLane === 'center',
          click: () => {
            settings.positionLane = 'center';
            saveSettings({ positionLane: 'center' });
            mainWindow?.webContents.send('tray:change-lane', { lane: 'center' });
            updateTrayMenu();
          },
        },
        {
          label: '➡️ Right (Default)',
          type: 'radio' as const,
          checked: settings.positionLane === 'right',
          click: () => {
            settings.positionLane = 'right';
            saveSettings({ positionLane: 'right' });
            mainWindow?.webContents.send('tray:change-lane', { lane: 'right' });
            updateTrayMenu();
          },
        },
      ],
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
    {
      label: 'Start on Windows Login',
      type: 'checkbox' as const,
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => {
        app.setLoginItemSettings({ openAtLogin: item.checked, openAsHidden: false });
      },
    },
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
      label: 'Quit Nazar Battu',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function createTray(): void {
  // Generate a crisp 16x16 icon programmatically
  const size = 16;
  const iconBuffer = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - size / 2 + 0.5;
      const dy = y - size / 2 + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 7) {
        // Deep blue outer rim
        iconBuffer[idx] = 0x1a;
        iconBuffer[idx + 1] = 0x23;
        iconBuffer[idx + 2] = 0x7e;
        iconBuffer[idx + 3] = 0xff;
      }
      if (dist <= 4.5) {
        // White ring
        iconBuffer[idx] = 0xff;
        iconBuffer[idx + 1] = 0xff;
        iconBuffer[idx + 2] = 0xff;
        iconBuffer[idx + 3] = 0xff;
      }
      if (dist <= 2.8) {
        // Turquoise iris
        iconBuffer[idx] = 0x02;
        iconBuffer[idx + 1] = 0x88;
        iconBuffer[idx + 2] = 0xd1;
        iconBuffer[idx + 3] = 0xff;
      }
      if (dist <= 1.2) {
        // Black pupil
        iconBuffer[idx] = 0x11;
        iconBuffer[idx + 1] = 0x11;
        iconBuffer[idx + 2] = 0x11;
        iconBuffer[idx + 3] = 0xff;
      }
    }
  }

  const icon = nativeImage.createFromBuffer(iconBuffer, {
    width: size,
    height: size,
  });

  tray = new Tray(icon);
  tray.setToolTip('Nazar Battu — Desktop Talisman');
  updateTrayMenu();
}

// --- App Lifecycle ---

if (process.platform === 'win32') {
  app.commandLine.appendSwitch('enable-transparent-visuals');
}

app.whenReady().then(() => {
  settings = loadSettings();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
