# 📿 Nazar Battu (नज़र बट्टू)

> **Interactive, physics-driven desktop companion for Windows & macOS to ward off the evil eye.**  
> Inspired by *Lucky Dangle*. Built with Electron, Vite, React 19, and Matter.js.

---

## ✨ Features

- **🎐 Organic Physics-Based Cord**: Simulated with 8+ multi-joint constraint links for fluid pendulum swaying and inertia.
- **🌶️ Authentic Multi-Layer Nimbu-Mirchi**:
  - 7 individually articulated green chilies pierced horizontally across the sacred cord with organic tilt jitter.
  - Glossy yellow lemon at the base.
  - Black charcoal (*koyla*) hanging underneath to absorb *buri nazar*.
  - Sacred braided cord with golden thread stitches and protective glass evil eye beads.
- **🧿 Multi-Talisman Modular Architecture**:
  - **Nimbu-Mirchi**: Traditional lemon, 7 chilies, and charcoal.
  - **Evil Eye (Nazar Boncuğu)**: Mediterranean cobalt glass amulet on a braided steel cord.
  - **Mahakal Demon Mask**: Ferocious guardian face on a sacred vermilion thread.
- **🔔 Authentic Audio Experience**:
  - Real bronze temple bell chime (`ghanta-ring.wav`) on tap / grab.
  - Web Audio harmonic dual-sine synthesizer fallback (zero latency, offline).
- **🪟 Transparent Desktop Overlay**:
  - Frameless, always-on-top transparent `BrowserWindow`.
  - Smart 3-state mouse loop (`PASSTHROUGH` → `INTERACTIVE` → `DRAGGING`) ensuring full OS click-through when not interacting with the talisman.
- **🎛️ System Tray & Dev Controls**:
  - Windows system tray icon with talisman selection, audio toggle, and visibility controls.
  - `Esc`: Emergency toggle between interactive and click-through.
  - `Shift + Esc`: Emergency exit.

---

## 🛠️ Tech Stack

- **Runtime**: [Electron 33](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/)
- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Physics Engine**: [Matter.js 0.20](https://brm.io/matter-js/)
- **State Management**: [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Audio**: Web Audio API + PCM WAV asset pipeline

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm / pnpm / yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/sumit1056/nazar-battu.git
cd nazar-battu

# Install dependencies
npm install

# Start the interactive desktop dev environment
npm run dev
```

### Build & Package
```bash
# Typecheck
npm run typecheck

# Production build
npm run build
```

---

## 📜 Documentation

Full architectural documentation is available in the [`/docs`](file:///docs/) folder:
- [`docs/PRD.md`](file:///docs/PRD.md) — Product Requirements Document
- [`docs/TRD.md`](file:///docs/TRD.md) — Technical Architecture & IPC Protocols
- [`docs/DECISIONS.md`](file:///docs/DECISIONS.md) — Architectural Decision Records
- [`docs/FLOW.md`](file:///docs/FLOW.md) — Event Loops & State Transitions
- [`docs/ARCHITECTURE.md`](file:///docs/ARCHITECTURE.md) — Modular Component Hierarchy
- [`docs/CONSTRAINTS.md`](file:///docs/CONSTRAINTS.md) — Performance & Compatibility Guards
