# ⚡ ADB Commander

A modern, cross-platform GUI for the Android Debug Bridge (ADB). Manage Android devices without touching the command line.

![Electron](https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square)

<p align="center">
  <img src="Cover Photo.png" alt="ADB Commander" width="800" />
</p>

---

## What is ADB Commander?

ADB Commander is a desktop application that provides a graphical interface for Android Debug Bridge operations. It automatically downloads ADB platform-tools on first launch—no manual setup required. Just plug in your device and go.

## Features

### 🔌 Device Management
- **Auto-detection** — Devices are detected automatically when connected via USB
- **Live monitoring** — Battery level, Android version, USB debug status update in real-time
- **Multi-device** — Switch between multiple connected devices from the sidebar

### 📦 Backup & Restore
- **File browser** — Browse your device's file system with a tree view
- **Pull files** — Back up files and folders from device to PC
- **Push files** — Restore or push files to any directory on the device

### ⚡ Quick Actions
- **Install APK** — Drag & drop or browse to install APK files
- **Screenshot** — Capture the current screen and save as PNG
- **Screen Record** — Record the screen with timed or manual stop mode

### 🔧 Power Tools
- **Package Manager** — List, disable, enable, or uninstall packages (no root required)
- **Input Events** — Send key events: volume up/down, power, home, back, recents
- **Reboot Options** — Reboot to system, recovery, bootloader, or fastboot
- **Push Files** — Push files to a specific directory on the device
- **Logcat** — Capture and view logcat output with tag filtering

### 🖥️ Console
- Full command log showing every ADB command executed by the app

---

## Installation

### Pre-built Binaries

Download the latest release for your platform from the [Releases](https://github.com/ShaptakNaskar/Adb-Cmd-Scripts/releases) page:

| Platform | File |
|---|---|
| Windows | `ADB-Commander-Setup-1.0.0.exe` (installer) or `ADB-Commander-1.0.0-portable.exe` |
| macOS (Intel) | `ADB-Commander-1.0.0-x64.dmg` |
| macOS (Apple Silicon) | `ADB-Commander-1.0.0-arm64.dmg` |
| Ubuntu / Debian | `adb-commander_1.0.0_amd64.deb` |
| Fedora / RHEL | `adb-commander-1.0.0.x86_64.rpm` |
| Linux (universal) | `ADB-Commander-1.0.0.AppImage` |

> **Note:** macOS builds are untested. If you encounter issues, please open an issue.

### Build from Source

Requires [Node.js](https://nodejs.org/) 18+ and npm.

```bash
git clone https://github.com/ShaptakNaskar/Adb-Cmd-Scripts.git
cd Adb-Cmd-Scripts
npm install
npm run dev
```

ADB platform-tools are downloaded automatically on first launch.

---

## Building for Distribution

```bash
# Build for your current platform
npm run build:win      # Windows (NSIS installer + portable)
npm run build:mac      # macOS (DMG for Intel + Apple Silicon)
npm run build:linux    # Linux (AppImage, deb, rpm, pacman)

# Build all Linux targets at once
npm run build:linux-all
```

Output goes to the `dist/` folder.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Electron](https://www.electronjs.org/) 28 |
| Frontend | [React](https://react.dev/) 18 + TypeScript |
| Bundler | [electron-vite](https://electron-vite.org/) (Vite-based) |
| UI Icons | [Lucide React](https://lucide.dev/) |
| ADB | Google [platform-tools](https://developer.android.com/tools/releases/platform-tools) (auto-downloaded) |

## Project Structure

```
├── src/
│   ├── main/               # Electron main process
│   │   ├── index.ts         # Window creation, IPC handlers
│   │   ├── adb/
│   │   │   ├── AdbService.ts    # Core ADB command execution
│   │   │   ├── DeviceMonitor.ts # Device polling & detection
│   │   │   └── FileBrowser.ts   # Device file system browsing
│   │   ├── binaries/
│   │   │   └── BinaryManager.ts # ADB binary download & management
│   │   └── utils/
│   │       ├── FilenameSanitizer.ts
│   │       └── LogService.ts
│   ├── preload/
│   │   └── index.ts         # Context bridge (IPC API)
│   └── renderer/            # React frontend
│       ├── App.tsx
│       ├── types.ts
│       ├── components/
│       │   ├── Welcome/      # Landing page
│       │   ├── Dashboard/    # Device list
│       │   ├── DeviceCard/   # Device info card
│       │   ├── BackupRestore/# File browser + backup/restore
│       │   ├── QuickActions/ # APK install, screenshot, screen record
│       │   ├── PowerTools/   # Package manager, key events, reboot, logcat
│       │   ├── Console/      # Command log viewer
│       │   ├── About/        # About page with links
│       │   ├── Sidebar/      # Navigation sidebar
│       │   ├── TitleBar/     # Custom title bar
│       │   └── Toast/        # Notification toasts
│       └── styles/
│           └── index.css     # Design system & global styles
├── electron.vite.config.ts
├── tsconfig.json
└── package.json
```

## Prerequisites for Android Devices

1. **Enable Developer Options** — Go to Settings → About Phone → tap Build Number 7 times
2. **Enable USB Debugging** — Settings → Developer Options → USB Debugging
3. **Connect via USB** — Plug in your device and accept the debugging prompt

---

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

© 2026 Sappy

---

## Links

- 🌐 [Website](https://sappy-dir.vercel.app/)
- 💻 [GitHub](https://github.com/ShaptakNaskar)
- 🎬 [YouTube](https://youtube.com/@BigSmokeYT)
- 📧 [Email](mailto:ddtectiv.ddip2017@gmail.com)
