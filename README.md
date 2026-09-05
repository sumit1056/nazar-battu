# 📿 Nazar Battu (नज़र बट्टू)

> **Interactive, physics-driven desktop companion for Windows & macOS to ward off the evil eye.**  
> Inspired by *Lucky Dangle*. Built with Electron, Vite, React 19, and Verlet Integration Physics.

---

## 📦 Download & Installation

Nazar Battu is designed to be completely hassle-free for anyone to use—**no terminal, no Node.js, and no technical knowledge required**.

### Option 1: Portable Executable (Recommended — Zero Installation)
1. Download **`Nazar-Battu-Portable.exe`** from the [GitHub Releases](https://github.com/sumit1056/nazar-battu/releases) page (or locate it inside your `dist/` folder).
2. Double-click **`Nazar-Battu-Portable.exe`**.
3. The talisman will immediately drop from the top of your screen and start dangling!
   * *Note: Portable mode runs standalone and leaves no traces on your system. You can even run it straight from a USB flash drive.*

### Option 2: Standard Windows Installer
1. Download **`Nazar-Battu-Setup.exe`**.
2. Double-click the installer.
3. Nazar Battu will be installed to your computer, adding:
   * A **Desktop Shortcut**
   * A **Windows Start Menu** entry
   * Persistent System Tray icon

### Option 3: Run from Unpacked Folder
If you built the app locally, you can also directly double-click:
```
dist/win-unpacked/Nazar-Battu.exe
```

---

## ✨ Features & Talismans

### 🍋 1. Nimbu-Mirchi (Lemon & Chilies)
* **7 Horizontally Pierced Chilies**: Authentically threaded across the sacred cord with alternating organic tilts and natural curvature.
* **Glossy Lemon & Charcoal**: Golden lemon at the base paired with raw black charcoal (*koyla*) underneath to absorb *buri nazar*.
* **Sacred Beads**: Golden thread knots and glass amulet beads along the cord.
* **Audio**: Gentle acoustic thread-and-wood resonance on tap.

### 🧿 2. Evil Eye (Nazar Boncuğu)
* **Mediterranean Cobalt Glass**: High-resolution deep blue glass talisman designed to reflect negative energy.
* **Protective Beads**: Alternating pearl white and evil eye glass cord beads.
* **Audio**: Crisp, delicate crystal glass clink.

### 👹 3. Mahakal Demon Mask (Drishti Bommai)
* **Indian Guardian Mask**: Fierce traditional demon face on a sacred vermilion (*sindoor*) thread.
* **Sacred Beads**: Polished brass beads and protective black-and-gold beads.
* **Audio**: Resonant bronze gong strike.

### 🔔 4. Ghanta (Indian Temple Bell)
* **Authentic Brass Temple Bell**: Intricately carved temple ghanta hanging on heavy 24k gold lacquer beads.
* **Audio**: Pure resonant brass bell chime (`ghanta-ring.wav`).

---

## 🎮 How to Control Nazar Battu

| Action | Shortcut / Control | Result |
| :--- | :--- | :--- |
| **Open Menu** | **Right-Click** on the talisman | Opens the compact on-screen settings menu |
| **Flick / Pull** | **Left-Click & Drag** | Pull the cord or swat the charm across the screen |
| **Change Charm** | Context Menu or Tray | Switch between Nimbu-Mirchi, Evil Eye, Mahakal, or Ghanta |
| **Change Lane** | Context Menu (`Left` / `Mid` / `Right`) | Repositions the anchor to your preferred screen side (**Right is default**) |
| **Auto-Start** | Context Menu (`🚀 Run on Startup`) | Automatically starts Nazar Battu whenever your PC turns on |
| **Mute Sound** | Context Menu (`🔊 Sound Effects`) | Toggle bell and chime sounds on or off |
| **Emergency Toggle** | Press `Escape` | Toggles mouse pass-through / interaction |
| **Emergency Quit** | Press `Shift + Escape` | Closes the companion application |

---

## 🛠️ Developer Setup & Local Build

If you want to modify the source code or build the executables yourself:

### Prerequisites
* **Node.js 20+**
* **npm** or **pnpm**

### Quickstart
```bash
# 1. Clone the repository
git clone https://github.com/sumit1056/nazar-battu.git
cd nazar-battu

# 2. Install dependencies
npm install

# 3. Start development mode with hot-reload
npm run dev
```

### Packaging Windows Executables (.exe)
```bash
# Compile and build both Portable (.exe) and Installer (.exe) into dist/
npm run build:win
```
The compiled binaries will be placed in the `dist/` directory:
* `dist/Nazar-Battu-Portable.exe` — Standalone portable app
* `dist/Nazar-Battu-Setup.exe` — Windows setup installer
* `dist/win-unpacked/Nazar-Battu.exe` — Pre-extracted standalone folder

---

## 🏛️ Architecture & Physics

* **Verlet Integration Physics Engine**: 12-particle constraint model with Gauss-Seidel distance relaxation, zero-springiness cord damping (`0.98`), and dual-sine ambient air currents.
* **Cursor Repulsion & Momentum Injection**: The cord physically bows away when your mouse cursor approaches within 40px, and rapid mouse sweeps inject wind-gust kinetic velocity into the talisman.
* **Transparent Pass-Through Engine**: 60 FPS raycaster dynamically toggles OS mouse pass-through (`setIgnoreMouseEvents(true, { forward: true })`) so you can freely click desktop windows behind the empty space while retaining full interaction on the talisman.

---

## 📜 License
MIT © [Sumit](https://github.com/sumit1056)
