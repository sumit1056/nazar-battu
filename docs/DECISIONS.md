# Architecture & Design Decisions (ADR) — Nazar Battu

## ADR-001: 3-State Mouse Passthrough Loop
- **Context**: An interactive desktop overlay must allow users to work normally (click text editors, browser buttons, etc.) without the overlay blocking their clicks, while still allowing hover breeze effects and grabbing the charm.
- **Decision**: Implemented a 3-state state machine (`PASSTHROUGH` → `INTERACTIVE` → `DRAGGING`). In `PASSTHROUGH`, `mainWindow.setIgnoreMouseEvents(true, { forward: true })` forwards mouse movements to the renderer for breeze calculations without intercepting OS clicks. When cursor enters the charm hit-area AABB, `setIgnoreMouseEvents(false)` enables interactions. During drag, mouse capture is locked.
- **Consequences**: Flawless desktop coexistence with 0 impact on underlying apps.

## ADR-002: Programmatic Canvas2D Rendering vs Bitmap Images
- **Context**: Charms could be pre-rendered PNGs/SVGs or programmatic Canvas2D code.
- **Decision**: Implemented programmatic Canvas2D rendering for all charms (`nimbu-mirchi`, `evil-eye`, `mahakal-mask`).
- **Consequences**: Zero external asset loading latency, infinite HiDPI scalability, per-pixel procedural lighting, and customizable cord colors.

## ADR-003: Web Audio API Synthesis over Audio Assets
- **Context**: Sound effects for chimes and whooshes require assets or procedural generation.
- **Decision**: Procedural Web Audio API sound generator using oscillators, noise buffers, and bandpass filter sweeps.
- **Consequences**: Zero audio files bundled, zero disk I/O, perfectly scaled pitch/amplitude based on physics velocity.

## ADR-004: Filesystem-Based Settings Persistence over ESM Modules
- **Context**: `electron-store` v10 is pure ESM which causes require() mismatch in Electron CommonJS main process.
- **Decision**: Native `node:fs` JSON persistence in `app.getPath('userData')`.
- **Consequences**: 100% reliable, zero external dependencies, robust across all build configurations.
