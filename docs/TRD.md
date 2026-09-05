# 🔧 Nazar Battu — Technical Requirements Document (TRD)

> **Version**: 1.0  
> **Status**: Draft  
> **Last Updated**: 2026-09-04  
> **Maps to**: `/speckit.constitution` & `CORE_MEMORIES.md`

---

## 1. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Runtime** | Electron | 33.x+ | Transparent overlay window, system tray, IPC |
| **Build** | Vite | 6.x | HMR, fast ESM bundling for Electron renderer |
| **UI Framework** | React | 19.x | Component model for charm rendering + tray UI |
| **Language** | TypeScript | 5.7+ | Type safety across main/renderer/preload |
| **Physics** | Matter.js | 0.20.x | 2D rigid body physics, constraints, mouse interaction |
| **State** | Zustand | 5.x | Lightweight store for charm selection, audio toggles, coordinates |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS (minimal use — mostly canvas-based) |
| **Persistence** | electron-store | 10.x | JSON config persistence for user preferences |
| **Scaffolding** | electron-vite | Latest | Unified Vite config for main/preload/renderer processes |

---

## 2. Window Architecture

### 2.1 BrowserWindow Configuration

```typescript
// Main process — window creation
const mainWindow = new BrowserWindow({
  // --- Geometry: cover entire primary display work area ---
  x: primaryDisplay.workArea.x,
  y: primaryDisplay.workArea.y,
  width: primaryDisplay.workArea.width,
  height: primaryDisplay.workArea.height,

  // --- Transparency & Frameless ---
  transparent: true,        // Enables per-pixel alpha compositing
  frame: false,             // Remove window chrome (title bar, borders)
  hasShadow: false,         // No OS drop shadow on transparent window

  // --- Z-Order & Taskbar ---
  alwaysOnTop: true,        // Float above all other windows
  skipTaskbar: true,        // Don't show in taskbar / alt-tab
  focusable: false,         // Don't steal focus from user's active app

  // --- Security ---
  webPreferences: {
    preload: path.join(__dirname, 'preload.ts'),
    contextIsolation: true,   // Enforce context isolation
    nodeIntegration: false,   // No Node.js in renderer
    sandbox: true,            // Sandbox renderer process
  },
});

// --- Default: click-through with forwarded mouse events ---
mainWindow.setIgnoreMouseEvents(true, { forward: true });

// --- Additional window properties ---
mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); // macOS
mainWindow.setAlwaysOnTop(true, 'screen-saver'); // Highest z-level
```

### 2.2 Display Coordinate Mapping

```
┌──────────────────────── Primary Display ────────────────────────┐
│ ┌─────────────────── Work Area (excludes taskbar) ──────────┐   │
│ │ (workArea.x, workArea.y)                                   │   │
│ │                                                            │   │
│ │              ┌── Anchor Point ──┐                          │   │
│ │              │ (width/2, 0)     │                          │   │
│ │              │      ║          │                          │   │
│ │              │      ║ rope     │                          │   │
│ │              │      ║ chain    │                          │   │
│ │              │    ┌─╨─┐       │                          │   │
│ │              │    │🍋🌶│ charm  │                          │   │
│ │              │    └───┘       │                          │   │
│ │              └────────────────┘                          │   │
│ │                                                            │   │
│ │  Canvas fills entire work area (transparent background)    │   │
│ │  Only charm pixels are visible — everything else is α=0    │   │
│ └────────────────────────────────────────────────────────────┘   │
│ ┌── Taskbar ────────────────────────────────────────────────┐   │
│ │  [Tray Icon: 📿]                                          │   │
│ └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Coordinate Facts:**
- Window origin `(0, 0)` maps to `(workArea.x, workArea.y)` on screen
- Matter.js world coordinates match canvas/window coordinates 1:1
- Anchor point: `(window.innerWidth / 2, 0)` — top-center of work area
- Canvas uses `willReadFrequently: false` for GPU-accelerated compositing

---

## 3. IPC Mouse Pass-Through Architecture

### 3.1 The Three-State Machine

> **Source validation**: Architecture validated via `sequential-thinking` MCP (5-step reasoning chain) and `context7` Electron docs confirming `setIgnoreMouseEvents(ignore, { forward: true })` behavior on Windows/macOS.

```
                        ┌─────────────────┐
                        │   PASSTHROUGH   │ ← Default state
                        │ ignore = true    │
                        │ forward = true   │
                        └────────┬────────┘
                                 │
                    cursor enters hit-area
                    (IPC: set-interactive → true)
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  INTERACTIVE    │
                        │ ignore = false   │
                        └───┬─────────┬───┘
                            │         │
              mousedown on  │         │ cursor leaves hit-area
              charm body    │         │ (IPC: set-interactive → false)
                            │         │
                            ▼         ▼
                   ┌──────────┐   ┌─────────────────┐
                   │ DRAGGING │   │   PASSTHROUGH   │
                   │ ignore=  │   │ (return to      │
                   │ false    │   │  default)        │
                   │ locked   │   └─────────────────┘
                   └────┬─────┘
                        │
                   mouseup → fling
                   check cursor position
                        │
              ┌─────────┴─────────┐
              │                   │
         in hit-area         outside hit-area
              │                   │
              ▼                   ▼
        INTERACTIVE          PASSTHROUGH
```

### 3.2 IPC Channel Definitions

| Channel | Direction | Payload | Purpose |
|---------|-----------|---------|---------|
| `charm:set-interactive` | Renderer → Main | `{ ignore: boolean, forward?: boolean }` | Toggle mouse pass-through |
| `charm:drag-start` | Renderer → Main | `void` | Lock interactive mode during drag |
| `charm:drag-end` | Renderer → Main | `{ cursorInHitArea: boolean }` | Unlock and resolve next state |
| `tray:toggle-visibility` | Main → Renderer | `{ visible: boolean }` | Show/hide charm from tray menu |
| `tray:change-charm` | Main → Renderer | `{ charmId: string }` | Swap active charm from tray menu |

### 3.3 Preload Script (Context Bridge)

```typescript
// preload.ts — Secure IPC bridge
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer → Main: toggle mouse pass-through
  setInteractive: (ignore: boolean, options?: { forward: boolean }) =>
    ipcRenderer.send('charm:set-interactive', { ignore, ...options }),

  // Renderer → Main: drag lifecycle
  notifyDragStart: () => ipcRenderer.send('charm:drag-start'),
  notifyDragEnd: (cursorInHitArea: boolean) =>
    ipcRenderer.send('charm:drag-end', { cursorInHitArea }),

  // Main → Renderer: listen for tray commands
  onToggleVisibility: (callback: (visible: boolean) => void) =>
    ipcRenderer.on('tray:toggle-visibility', (_e, data) => callback(data.visible)),
  onChangeCharm: (callback: (charmId: string) => void) =>
    ipcRenderer.on('tray:change-charm', (_e, data) => callback(data.charmId)),
});
```

### 3.4 Main Process IPC Handlers

```typescript
// main.ts — IPC handler setup
ipcMain.on('charm:set-interactive', (event, { ignore, forward }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  if (ignore) {
    win.setIgnoreMouseEvents(true, { forward: forward ?? true });
  } else {
    win.setIgnoreMouseEvents(false);
  }
});

let isDragging = false;

ipcMain.on('charm:drag-start', (event) => {
  isDragging = true;
  // Ensure window stays interactive during drag
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.setIgnoreMouseEvents(false);
});

ipcMain.on('charm:drag-end', (event, { cursorInHitArea }) => {
  isDragging = false;
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  if (!cursorInHitArea) {
    win.setIgnoreMouseEvents(true, { forward: true });
  }
});
```

### 3.5 Race Condition Mitigations

| Issue | Solution |
|-------|----------|
| Rapid toggle at hit-area edge | 10px hysteresis padding around bounding box |
| Multiple IPC calls per frame | Throttle to max 1 call per `requestAnimationFrame` (16ms) |
| Drag escapes hit-area | `isDragging` flag locks interactive state until mouseup |
| `forward: true` unreliable on macOS | Fallback: poll screen cursor position via `screen.getCursorScreenPoint()` at 60fps |

### 3.6 Platform-Specific Notes

#### Windows
- `forward: true` uses `WS_EX_TRANSPARENT` extended window style — reliable on Windows 10+
- `alwaysOnTop` with `'screen-saver'` level avoids z-order fights with fullscreen apps
- DPI awareness: use `screen.getPrimaryDisplay().scaleFactor` for coordinate mapping

#### macOS
- `forward: true` requires the app process to have event tap permissions
- On first launch, show a dialog explaining why accessibility permissions may be needed
- `setVisibleOnAllWorkspaces(true)` ensures charm persists across Mission Control spaces
- `hasShadow: false` is critical — macOS adds shadows to transparent windows by default

#### Linux (Experimental)
- X11: generally works with compositing managers (Picom, Compton)
- Wayland: `setIgnoreMouseEvents` is **not supported** — transparent click-through is not possible
- Mark as experimental/unsupported in Phase 1

---

## 4. 2D Rope Physics (Matter.js)

### 4.1 Physics World Configuration

```typescript
// Physics constants
const PHYSICS_CONFIG = {
  gravity: { x: 0, y: 1.5 },           // Slightly stronger than default for snappy feel
  airFriction: 0.04,                     // Damping to prevent perpetual swing
  ROPE_SEGMENT_COUNT: 4,                 // Number of constraint chain links
  ROPE_SEGMENT_LENGTH: 30,               // Pixels between each link
  ROPE_STIFFNESS: 0.9,                   // Constraint stiffness (0-1)
  ROPE_DAMPING: 0.05,                    // Constraint damping
  CHARM_MASS: 5,                         // Mass of the talisman body
  AMBIENT_FORCE_MAX: 0.0005,             // Max ambient sway force
  BREEZE_FORCE_MULTIPLIER: 0.002,        // Hover breeze force scaling
  BREEZE_RADIUS: 200,                    // Proximity radius in pixels
} as const;
```

### 4.2 Constraint Chain Structure

```
Anchor (static, invisible)
  ┃  position: (screenWidth/2, 0)
  ┃  isStatic: true
  ┃
  ╠══ Constraint #1 (stiffness: 0.9, length: 30px)
  ┃
  ○ Link Body #1 (circle, r=2, invisible, mass=0.1)
  ┃
  ╠══ Constraint #2
  ┃
  ○ Link Body #2 (circle, r=2, invisible, mass=0.1)
  ┃
  ╠══ Constraint #3
  ┃
  ○ Link Body #3 (circle, r=2, invisible, mass=0.1)
  ┃
  ╠══ Constraint #4 (to charm body)
  ┃
  ┌─────────────┐
  │  Charm Body  │  Matter.js composite:
  │  (Composite)  │  - Main body (rectangle, visible)
  │   🍋🌶🌶🌶   │  - Collision group for hit-testing
  │   🌶🌶🌶🌶   │  - Rendered via SVG/Canvas overlay
  └─────────────┘
```

### 4.3 Mouse Constraint for Grab-and-Fling

```typescript
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: Mouse.create(canvas),
  constraint: {
    stiffness: 0.2,          // Soft constraint for natural drag feel
    damping: 0.1,            // Smooth out rapid cursor movements
    render: { visible: false },
  },
  // Only interact with charm body (not rope links)
  collisionFilter: {
    category: CHARM_CATEGORY,
    mask: CHARM_CATEGORY,
  },
});
```

### 4.4 Hover Breeze Force Calculation

```typescript
function applyBreezeForce(cursorPos: Vector, charmBody: Body): void {
  const dx = charmBody.position.x - cursorPos.x;
  const dy = charmBody.position.y - cursorPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > PHYSICS_CONFIG.BREEZE_RADIUS || distance < 10) return;

  // Inverse distance scaling — stronger when closer
  const strength = (1 - distance / PHYSICS_CONFIG.BREEZE_RADIUS)
                   * PHYSICS_CONFIG.BREEZE_FORCE_MULTIPLIER;

  // Normalize direction vector and apply force
  const force = {
    x: (dx / distance) * strength,
    y: (dy / distance) * strength * 0.3, // Reduced vertical component
  };

  Body.applyForce(charmBody, charmBody.position, force);
}
```

---

## 5. Asset & Rendering Pipeline

### 5.1 Rendering Strategy

| Approach | Decision | Rationale |
|----------|----------|-----------|
| Canvas vs SVG | **HTML5 Canvas** (primary) | Better performance for 60fps physics sync; direct pixel control |
| SVG overlay | Used for static charm artwork | Scalable vectors; CSS transform syncs with Matter.js body |
| Rendering loop | `requestAnimationFrame` | Synced to display refresh; paused when charm hidden |

### 5.2 Charm Asset Architecture

```typescript
// Charm interface — all charms implement this
interface CharmDefinition {
  id: string;
  name: string;
  description: string;

  // Physics
  bodyShape: 'rectangle' | 'circle' | 'vertices';
  bodyDimensions: { width: number; height: number };
  mass: number;
  ropeAttachOffset: { x: number; y: number }; // Offset from body center to rope attach point

  // Rendering
  render: (ctx: CanvasRenderingContext2D, body: Matter.Body) => void;
  hitAreaPadding: number; // Extra padding around body for hit-testing
}
```

### 5.3 Nimbu-Mirchi Charm (Default)

The default charm is a composite of:
- **Thread**: Thin line from rope endpoint to lemon
- **Lemon (Nimbu)**: Yellow ellipse at the top
- **Chilies (Mirchi)**: 7 green curved shapes hanging below the lemon
- All elements rotate and translate as a single unit synced to the Matter.js body

```
        ║ (rope)
        │ (thread)
       🍋 (lemon — yellow ellipse)
      /│\
     🌶🌶🌶 (chilies — green curves)
     🌶🌶🌶
      🌶
```

---

## 6. Zustand State Architecture

```typescript
interface NazarBattuStore {
  // Charm state
  activeCharmId: string;
  availableCharms: CharmDefinition[];
  setActiveCharm: (id: string) => void;

  // Visibility
  isVisible: boolean;
  toggleVisibility: () => void;

  // Physics state (read by renderer)
  charmPosition: { x: number; y: number };
  charmAngle: number;
  updateCharmTransform: (pos: { x: number; y: number }, angle: number) => void;

  // Interaction state
  interactionState: 'passthrough' | 'interactive' | 'dragging';
  setInteractionState: (state: 'passthrough' | 'interactive' | 'dragging') => void;

  // Audio (Phase 2)
  audioEnabled: boolean;
  toggleAudio: () => void;

  // Settings
  ropeLength: number;       // User-configurable rope length
  swayIntensity: number;    // Ambient sway strength (0-1)
}
```

---

## 7. Process Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       MAIN PROCESS                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Window Mgr   │  │  Tray Mgr    │  │  IPC Handlers    │  │
│  │              │  │              │  │                  │  │
│  │ - Create     │  │ - Icon       │  │ - set-interactive│  │
│  │ - Position   │  │ - Context    │  │ - drag-start     │  │
│  │ - Ignore     │  │   Menu       │  │ - drag-end       │  │
│  │   Mouse      │  │ - Events     │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              electron-store (persistence)             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ Context Bridge (preload.ts)
                           │ IPC channels only — no Node.js
┌──────────────────────────┴──────────────────────────────────┐
│                     RENDERER PROCESS                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ React App    │  │ Physics Eng  │  │  Canvas Renderer │  │
│  │              │  │              │  │                  │  │
│  │ - Charm      │  │ - Matter.js  │  │ - drawCharm()    │  │
│  │   Component  │  │ - Rope chain │  │ - drawRope()     │  │
│  │ - Hit-test   │  │ - Mouse      │  │ - rAF loop       │  │
│  │   Logic      │  │   Constraint │  │ - Sync with      │  │
│  │ - Zustand    │  │ - Breeze     │  │   physics bodies │  │
│  │   Store      │  │   Forces     │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Directory Structure

```
nazar-battu/
├── docs/                          # Pre-vibecoding documentation
│   ├── PRD.md                     # Product Requirements
│   ├── TRD.md                     # Technical Requirements (this file)
│   └── IMPLEMENTATION_PLAN.md     # Phased execution plan
├── electron.vite.config.ts        # Vite config for main/preload/renderer
├── package.json
├── tsconfig.json
├── src/
│   ├── main/                      # Electron main process
│   │   ├── index.ts               # App entry, window creation, tray setup
│   │   ├── ipc-handlers.ts        # IPC message handlers
│   │   ├── tray.ts                # System tray creation & menu
│   │   └── store.ts               # electron-store persistence
│   ├── preload/                   # Preload scripts
│   │   └── index.ts               # contextBridge API exposure
│   └── renderer/                  # React renderer
│       ├── index.html             # Entry HTML (transparent body)
│       ├── src/
│       │   ├── main.tsx           # React entry point
│       │   ├── App.tsx            # Root component
│       │   ├── components/
│       │   │   ├── CharmCanvas.tsx # Canvas rendering + physics loop
│       │   │   └── TrayToggle.tsx  # Floating mini-toggle button
│       │   ├── physics/
│       │   │   ├── engine.ts      # Matter.js engine setup
│       │   │   ├── rope.ts        # Rope chain constraint builder
│       │   │   ├── breeze.ts      # Hover breeze force calculator
│       │   │   └── types.ts       # Physics type definitions
│       │   ├── charms/
│       │   │   ├── index.ts       # Charm registry
│       │   │   ├── nimbu-mirchi.ts # Default charm definition + renderer
│       │   │   └── types.ts       # CharmDefinition interface
│       │   ├── store/
│       │   │   └── useStore.ts    # Zustand store definition
│       │   ├── hooks/
│       │   │   ├── usePhysics.ts  # Physics engine lifecycle hook
│       │   │   └── useHitTest.ts  # Mouse hit-testing hook
│       │   └── styles/
│       │       └── index.css      # Tailwind + transparent body styles
│       └── public/
│           └── tray-icon.png      # System tray icon asset
├── resources/                     # Build-time assets (icons, installers)
│   ├── icon.ico                   # Windows app icon
│   └── icon.icns                  # macOS app icon
└── KNOWLEDGE/                     # SDD living documents
    ├── SPEC.md
    ├── CORE_MEMORIES.md
    └── AUDIT_LOG.md
```

---

## 9. Security Model

| Principle | Implementation |
|-----------|---------------|
| Context Isolation | `contextIsolation: true` — renderer cannot access Node.js |
| No Node Integration | `nodeIntegration: false` — no `require()` in renderer |
| Sandboxed Renderer | `sandbox: true` — OS-level process sandbox |
| Preload Bridge | `contextBridge.exposeInMainWorld()` — minimal, typed API surface |
| No Remote Module | `@electron/remote` not installed — all communication via IPC |
| No External Network | App makes zero network requests — fully offline |
| CSP Header | Strict Content-Security-Policy preventing inline scripts |

---

## 10. Performance Budget

| Metric | Budget | Measurement Method |
|--------|--------|--------------------|
| JS Bundle (renderer) | < 500KB gzipped | Vite build output |
| First Contentful Paint | < 500ms | Electron `ready-to-show` event |
| Physics tick | < 2ms per frame | `performance.now()` delta |
| Canvas render | < 4ms per frame | `performance.now()` delta |
| IPC round-trip | < 1ms | Main process timestamp delta |
| Idle CPU | < 2% | Task Manager / Activity Monitor |
| RSS Memory | < 80MB | Process memory reporting |

---

## 11. Dependencies (Exact)

```json
{
  "dependencies": {
    "matter-js": "^0.20.0",
    "zustand": "^5.0.0",
    "electron-store": "^10.0.0"
  },
  "devDependencies": {
    "electron": "^33.0.0",
    "electron-vite": "^3.0.0",
    "vite": "^6.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "@types/matter-js": "^0.19.0"
  }
}
```
