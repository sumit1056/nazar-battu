# Technical & System Constraints — Nazar Battu

## 1. Operating System Constraints
- **Windows**:
  - Requires `mainWindow.setIgnoreMouseEvents(true, { forward: true })` to receive `WM_MOUSEMOVE` while forwarding clicks.
  - System Tray requires a non-empty image buffer; 16x16 RGBA buffer is supplied.
  - Transparent windows on Windows require `transparent: true`, `frame: false`, and `hasShadow: false` to avoid black borders or DWM glitching.
- **macOS**:
  - Requires `mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })` to persist across Mission Control desktops.
  - `setAlwaysOnTop(true, 'screen-saver')` places the talisman above menu bars and full-screen spaces.

## 2. Performance & Display Constraints
- **Refresh Rates**: Fixed 60fps delta in physics runner prevents chain tearing or hyper-oscillation on 120Hz/144Hz/240Hz monitors.
- **HiDPI / Scaling**: `canvas.setAttribute('data-pixel-ratio', dpr)` synchronizes Matter.js mouse mapping with Retina/Windows scaling factors (100%, 125%, 150%, 200%).
- **Resource Footprint**: Target <2% CPU at idle and <80MB RAM in production release.

## 3. Security Constraints
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- All IPC is strictly typed and routed through `preload/index.ts`.
