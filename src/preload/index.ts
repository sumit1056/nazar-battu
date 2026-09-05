/**
 * Nazar Battu — Preload Script (Context Bridge)
 *
 * Exposes a minimal, typed API surface from the main process to the renderer
 * via contextBridge. This is the ONLY communication channel between processes.
 *
 * Security: contextIsolation=true, nodeIntegration=false, sandbox=true
 * See docs/TRD.md §3.3 for IPC channel definitions.
 */

import { contextBridge, ipcRenderer } from 'electron';

// --- Type definitions for the exposed API ---
export interface ElectronAPI {
  /** Toggle mouse pass-through on the main window */
  setInteractive: (ignore: boolean, options?: { forward: boolean }) => void;

  /** Notify main process that a drag operation has started */
  notifyDragStart: () => void;

  /** Notify main process that a drag operation has ended */
  notifyDragEnd: (cursorInHitArea: boolean) => void;

  /** Listen for tray toggle-visibility events */
  onToggleVisibility: (callback: () => void) => void;

  /** Listen for tray change-charm events */
  onChangeCharm: (callback: (charmId: string) => void) => void;

  /** Listen for tray reset-position events */
  onResetPosition: (callback: () => void) => void;

  /** Listen for tray audio-toggle events */
  onToggleAudio: (callback: (enabled: boolean) => void) => void;

  /** Retrieve persisted settings from main process */
  getSettings: () => Promise<{ activeCharmId: string; audioEnabled: boolean }>;

  /** Save settings to main process */
  saveSettings: (settings: Partial<{ activeCharmId: string; audioEnabled: boolean }>) => void;

  /** Emergency dev action (Escape / double click anchor) */
  emergencyDevAction: (action: 'toggle' | 'quit' | 'reset') => void;

  /** Remove all listeners for a specific channel */
  removeAllListeners: (channel: string) => void;
}

// --- Expose the API to the renderer ---
contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer → Main: toggle mouse pass-through
  setInteractive: (ignore: boolean, options?: { forward: boolean }): void => {
    ipcRenderer.send('charm:set-interactive', { ignore, ...options });
  },

  // Renderer → Main: drag lifecycle notifications
  notifyDragStart: (): void => {
    ipcRenderer.send('charm:drag-start');
  },
  notifyDragEnd: (cursorInHitArea: boolean): void => {
    ipcRenderer.send('charm:drag-end', { cursorInHitArea });
  },

  // Main → Renderer: listen for tray commands
  onToggleVisibility: (callback: () => void): void => {
    ipcRenderer.on('tray:toggle-visibility', () => callback());
  },
  onChangeCharm: (callback: (charmId: string) => void): void => {
    ipcRenderer.on('tray:change-charm', (_e, data: { charmId: string }) => callback(data.charmId));
  },
  onResetPosition: (callback: () => void): void => {
    ipcRenderer.on('tray:reset-position', () => callback());
  },
  onToggleAudio: (callback: (enabled: boolean) => void): void => {
    ipcRenderer.on('tray:toggle-audio', (_e, data: { enabled: boolean }) => callback(data.enabled));
  },

  // Settings
  getSettings: (): Promise<{ activeCharmId: string; audioEnabled: boolean }> => {
    return ipcRenderer.invoke('settings:get');
  },
  saveSettings: (settings: Partial<{ activeCharmId: string; audioEnabled: boolean }>): void => {
    ipcRenderer.send('settings:save', settings);
  },

  // Emergency dev control
  emergencyDevAction: (action: 'toggle' | 'quit' | 'reset'): void => {
    ipcRenderer.send('app:dev-action', { action });
  },

  // Cleanup helper
  removeAllListeners: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel);
  },
} satisfies ElectronAPI);
