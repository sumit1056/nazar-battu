# 📿 Nazar Battu — Product Requirements Document (PRD)

> **Version**: 1.0  
> **Status**: Draft  
> **Last Updated**: 2026-09-04  
> **Author**: AI Partner (Antigravity) + User

---

## 1. Problem Statement

Desktop environments are utilitarian and emotionally sterile. Users who value cultural symbols, playful aesthetics, or ambient companionship have no lightweight way to bring a persistent, physics-based charm to their screen. Existing "desktop pets" are bloated, non-transparent, and lack authentic physics.

**Nazar Battu** fills this gap: a transparent, always-on-top desktop companion that dangles a culturally-inspired talisman (nimbu-mirchi, evil eye bead, etc.) from the top of the screen with real 2D physics — bouncing, swinging, and reacting to cursor movement.

---

## 2. Target Personas

| Persona | Description |
|---------|-------------|
| **Cultural Enthusiast** | Values the "nazar" (evil eye protection) tradition; wants a digital nimbu-mirchi on screen |
| **Desktop Customizer** | Loves aesthetic tweaks, desktop widgets, and personalizing their workspace |
| **Casual User** | Wants a fun, non-intrusive companion that responds to mouse movement |

---

## 3. Core Experience Loop

```
┌─────────────────────────────────────────────────────────┐
│  1. IDLE: Charm dangles gently with ambient sway        │
│     └─ Subtle pendulum oscillation + gravity settling   │
│                                                         │
│  2. HOVER BREEZE: Cursor passes near the charm          │
│     └─ Proximity-based force pushes charm (like wind)   │
│     └─ No click interception — OS clicks pass through   │
│                                                         │
│  3. GRAB & FLING: Cursor enters hit-area, user grabs    │
│     └─ MouseConstraint attaches body to cursor          │
│     └─ On release, charm flings with momentum           │
│     └─ Realistic damping brings charm back to rest      │
│                                                         │
│  4. CHARM SWAP: User selects a different talisman       │
│     └─ System tray menu or floating toggle              │
│     └─ Swap animation transitions between charms        │
│                                                         │
│  5. SYSTEM TRAY: Background control panel               │
│     └─ Toggle visibility, swap charms, adjust settings  │
│     └─ Quit application                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Functional Requirements

### 4.1 Physics & Rendering

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Charm dangles from a top-center anchor via a 3-4 segment constraint chain | P0 |
| FR-02 | Charm body responds to gravity with realistic pendulum physics | P0 |
| FR-03 | Idle state includes subtle ambient oscillation (simulated micro-breeze) | P1 |
| FR-04 | Air friction / damping prevents perpetual motion | P0 |
| FR-05 | Canvas/SVG rendering matches Matter.js body position and rotation in real-time | P0 |

### 4.2 User Interactions

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-06 | **Hover Breeze**: Cursor proximity (within ~200px) applies a gentle force to the charm body | P1 |
| FR-07 | **Grab**: Mousedown on charm hit-area attaches a MouseConstraint for dragging | P0 |
| FR-08 | **Fling**: Mouseup releases the constraint, transferring accumulated velocity | P0 |
| FR-09 | **Cursor passthrough**: All mouse events pass through to OS by default | P0 |
| FR-10 | **Interactive toggle**: Only the charm hit-area and tray toggle intercept mouse events | P0 |

### 4.3 Charm System

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11 | Default charm: Nimbu-Mirchi (lemon + 7 green chilies on a thread) | P0 |
| FR-12 | Modular charm system: SVG/Canvas placeholder that maps to Matter.js composite body | P0 |
| FR-13 | Charm selection persisted across sessions via `electron-store` or equivalent | P1 |
| FR-14 | Future charms: Evil Eye bead, Hamsa Hand, Dreamcatcher (Phase 2+) | P2 |

### 4.4 System Tray Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-15 | System tray icon with context menu | P0 |
| FR-16 | Tray menu items: Show/Hide, Charm Selection submenu, Settings, Quit | P0 |
| FR-17 | Optional floating mini-toggle button near the charm for quick show/hide | P1 |
| FR-18 | Double-click tray icon toggles charm visibility | P1 |

### 4.5 Audio (Phase 2)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-19 | Optional ambient chime on charm swing beyond threshold | P2 |
| FR-20 | Subtle "clink" sound on fling release | P2 |
| FR-21 | Audio toggle in tray menu and Zustand state | P2 |

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | CPU usage at idle | < 2% |
| NFR-02 | Memory footprint | < 80MB RSS |
| NFR-03 | Startup time | < 2 seconds to first render |
| NFR-04 | Frame rate | Stable 60fps during interaction |
| NFR-05 | Platform support | Windows 10+ (primary), macOS 12+ (secondary) |
| NFR-06 | No visible window chrome or background | Fully transparent overlay |
| NFR-07 | Zero interference with normal desktop usage | Click-through by default |

---

## 6. User Stories

### US-01: Idle Dangling
> **As a** user, **I want** the charm to dangle naturally from the top of my screen **so that** it feels like a real physical object hanging from my monitor.

**Acceptance Criteria:**
- Charm hangs from top-center with visible rope/thread segments
- Pendulum physics with gravity and damping
- Settles to rest within 3-5 seconds of disturbance

### US-02: Hover Breeze
> **As a** user, **I want** the charm to gently sway when my cursor passes nearby **so that** it feels alive and reactive without being intrusive.

**Acceptance Criteria:**
- Force applied proportional to cursor proximity (inverse distance)
- Force direction pushes charm away from cursor
- No mouse event interception during breeze interaction
- Effect radius: ~200px from charm center

### US-03: Grab & Fling
> **As a** user, **I want** to grab the charm with my mouse and fling it **so that** I can play with it when I'm bored.

**Acceptance Criteria:**
- Cursor changes to `grab` on hover over charm hit-area
- Cursor changes to `grabbing` during drag
- Release transfers velocity — charm swings and settles
- Charm cannot be dragged off-screen; constrained by anchor chain

### US-04: Transparent Pass-Through
> **As a** user, **I want** the charm to not interfere with my normal desktop usage **so that** I can click on windows, taskbar, and apps below the overlay.

**Acceptance Criteria:**
- Default state: all clicks pass through to OS
- Only charm body bounding box and tray toggle intercept clicks
- Toggling is seamless with no perceptible delay

### US-05: System Tray Control
> **As a** user, **I want** to control the charm from the system tray **so that** I can show/hide it, change charms, or quit without hunting for a window.

**Acceptance Criteria:**
- Tray icon visible in system tray (Windows) / menu bar (macOS)
- Right-click context menu with: Show/Hide, Charms submenu, Quit
- Settings persist across app restarts

---

## 7. Out of Scope (Phase 1)

- ❌ Multi-monitor support (uses primary display only)
- ❌ 3D rendering or WebGL shaders
- ❌ Network features or analytics
- ❌ Auto-update mechanism
- ❌ Linux support (experimental only)
- ❌ Custom user-uploaded charm assets
- ❌ Audio/sound effects (deferred to Phase 2)

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| First-time setup to visible charm | < 30 seconds |
| Idle CPU consumption | < 2% |
| User can grab and fling within | 1 second of intent |
| Zero click-through failures during normal desktop use | 100% pass-through reliability |

---

## 9. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| `setIgnoreMouseEvents` platform inconsistencies | High | Validated via Context7 docs; hysteresis padding on hit-areas |
| Matter.js performance on large displays | Medium | Limit physics world to charm bounding region; throttle engine |
| Electron memory overhead | Medium | Disable Node integration in renderer; minimize IPC frequency |
| macOS accessibility permissions for forwarding | Medium | Show permissions dialog on first launch; document in README |
