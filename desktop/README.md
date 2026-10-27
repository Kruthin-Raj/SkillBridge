# SkillBridge Desktop Application

This directory contains the desktop wrapper for SkillBridge.

## 🚀 Instant Quick Launch (.exe)
You can directly run `SkillBridge.exe` in this folder:
- Double-click `desktop/SkillBridge.exe`
- SkillBridge will immediately open in a dedicated, distraction-free desktop window with its own icon in the taskbar.
- Your session is isolated and persistent in `%LOCALAPPDATA%\SkillBridge`.

To recompile `SkillBridge.exe` at any time:
```bash
npm run build:quick
```

## 📦 Electron Installer (Optional)
If you want to package it as a full Electron `.exe` installer (with NSIS setup wizard and desktop shortcut creator):
1. Install dependencies:
   ```bash
   cd desktop
   npm install
   ```
2. Run in Electron during development:
   ```bash
   npm start
   ```
3. Build the Windows installer:
   ```bash
   npm run dist
   ```
   The `.exe` installer will be generated in `desktop/dist-electron/`.
