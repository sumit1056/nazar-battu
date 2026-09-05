# 📿 Nazar Battu (नज़र बट्टू) — Desktop Screen Talisman

<p align="center">
  <img src="src/renderer/src/assets/charms/nazar.png" width="130" alt="Nazar Battu Logo" />
</p>

<p align="center">
  <b>An interactive, physics-driven desktop companion for Windows & macOS that dangles from your screen to ward off the evil eye (buri nazar).</b>
</p>

<p align="center">
  <a href="https://github.com/sumit1056/nazar-battu/releases/latest/download/Nazar-Battu-Portable.exe">
    <img src="https://img.shields.io/badge/⬇️_Download_for_Windows-Portable_(.exe)-2ea44f?style=for-the-badge&logo=windows&logoColor=white" alt="Download Windows Portable" />
  </a>
  <a href="https://github.com/sumit1056/nazar-battu/releases/latest/download/Nazar-Battu-Setup.exe">
    <img src="https://img.shields.io/badge/⬇️_Download_Installer-Setup_(.exe)-0078D4?style=for-the-badge&logo=windows&logoColor=white" alt="Download Windows Setup" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-blue?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/Electron-33.0-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Physics-Verlet%20Integration-orange?style=flat-square" alt="Physics" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## ⚡ Quick Download (No Installation Required)

Click the link below to download the single standalone executable. Double-click it, and the talisman immediately drops from the top of your screen:

👉 **[Download Nazar-Battu-Portable.exe (Direct Link)](https://github.com/sumit1056/nazar-battu/releases/latest/download/Nazar-Battu-Portable.exe)**  
*(100% standalone, no installation, no admin rights, no Node.js required).*

Prefer a standard Windows setup with Start Menu and Desktop shortcuts?  
👉 **[Download Nazar-Battu-Setup.exe](https://github.com/sumit1056/nazar-battu/releases/latest/download/Nazar-Battu-Setup.exe)**

---

## 💡 The Story Behind the Product

In Indian culture and across many ancient traditions worldwide, protective talismans are hung at entrance doors, shops, trucks, and workspaces to deflect negative energy (*buri nazar*) and bring prosperity. The most iconic of these is the **Nimbu-Mirchi** (a fresh yellow lemon pierced with seven sharp green chilies and a chunk of black charcoal).

**Nazar Battu** brings this centuries-old tradition into the digital age as a lightweight, floating screen talisman:
* It dangles naturally from the top border of your screen with silky pendulum physics.
* You can swat it, drag it, flick it with your mouse, or let it sway gently in the digital breeze while you code or work.
* It features a smart click-through engine: you can click through empty transparent space without interrupting any background apps, IDEs, or games.
* Right-click the charm at any time to switch talismans, change screen alignment, or toggle auto-start.

---

## 🧿 The Talisman Collection

| Talisman | Cultural Heritage | Aesthetics & Beads | Audio Signature |
| :--- | :--- | :--- | :--- |
| **🍋 Nimbu-Mirchi** | Traditional Indian guardian hung on vehicles and homes | 7 horizontally threaded chilies with organic tilt, glossy lemon, and charcoal (*koyla*) at the base | Gentle acoustic wood & thread resonance |
| **🧿 Evil Eye (Nazar)** | Mediterranean & Middle Eastern protective amulet | Deep cobalt blue glass eye with alternating pearl white and amulet beads | Crisp crystal glass clink |
| **👹 Mahakal Demon Mask** | Ancient Indian guardian face (*Drishti Bommai*) | Fierce protector face suspended on sacred vermilion (*sindoor*) cord with brass beads | Deep bronze gong strike |
| **🔔 Ghanta (Temple Bell)** | Sacred Indian brass temple bell (*Ghanti*) | Intricate carved brass bell hanging on heavy 24k gold lacquer beads | Resonant sacred brass bell chime |

---

## 🎮 Features & How to Use

* **🖱️ On-Screen Context Menu (Right-Click)**: Right-click directly on the talisman to open a sleek, native-style menu.
* **↔️ Screen Alignment**: Place your talisman on the **Right** (default), **Center**, or **Left** of your screen.
* **🚀 Run on Startup**: Toggle `Run on Startup` in the right-click menu so your desktop is guarded automatically every time your PC turns on.
* **🎐 12-Particle Verlet Rope Simulation**: Realistic cord inertia, Gauss-Seidel distance constraints, and harmonic ambient sway.
* **💨 Cursor Repulsion & Wind-Flicks**: The rope physically bows away when your cursor approaches, and rapid cursor flicks inject kinetic wind velocity into the talisman.
* **🪟 Smart Mouse Raycaster (60 FPS)**: The window is 100% transparent. Only the talisman itself captures mouse clicks; clicking anywhere else clicks directly through to your desktop or background windows.
* **🔊 Acoustic Audio Feedback**: Unique physical sound effects for every talisman, with instant mute toggle.

---

## ⌨️ Shortcuts Cheatsheet

| Action | Control | Result |
| :--- | :--- | :--- |
| **Open Menu** | **Right-Click** on charm | Opens on-screen settings menu |
| **Drag / Swat** | **Left-Click & Drag** | Pull and release the talisman |
| **Emergency Toggle** | `Escape` | Toggles mouse pass-through / interaction |
| **Emergency Quit** | `Shift + Escape` | Closes Nazar Battu immediately |

---

## 🛠️ Tech Stack & Architecture

* **Framework**: [Electron 33](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/)
* **Renderer**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + HTML5 2D Canvas
* **Physics Engine**: Custom 12-point Verlet Integration engine with Gauss-Seidel relaxation
* **Audio Engine**: Web Audio API + PCM WAV audio pipeline
* **State Management**: [Zustand 5](https://zustand-demo.pmnd.rs/)
* **Packaging**: [electron-builder](https://www.electron.build/) (NSIS + Portable x64)

---

## 👨‍💻 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/sumit1056/nazar-battu.git
cd nazar-battu

# 2. Install dependencies
npm install

# 3. Start local development mode
npm run dev

# 4. Build standalone Windows executables
npm run build:win
```

---

## 📄 License
MIT © [Sumit](https://github.com/sumit1056)
