import { Router } from 'express';
import path from 'path';
import fs from 'fs';

/**
 * Route handler for multi-platform downloads (Windows, Android, iOS).
 * @author = kruthinraj
 * @date = 2026-10-27
 */

const router = Router();

router.get('/info', (_req, res) => {
  const downloadsDir = path.resolve(process.cwd(), 'public', 'downloads');
  const exePath = path.join(downloadsDir, 'SkillBridge.exe');
  const apkPath = path.join(downloadsDir, 'SkillBridge.apk');

  let exeSize = '17.5 KB';
  let exeExists = false;
  if (fs.existsSync(exePath)) {
    exeExists = true;
    const stats = fs.statSync(exePath);
    exeSize = `${(stats.size / 1024).toFixed(1)} KB`;
  }

  let apkSize = 'Preview APK';
  let apkExists = false;
  if (fs.existsSync(apkPath)) {
    apkExists = true;
    const stats = fs.statSync(apkPath);
    apkSize = `${(stats.size / (1024 * 1024)).toFixed(1)} MB`;
  }

  res.json({
    version: '1.0.0',
    platforms: {
      windows: {
        name: 'Windows Desktop (.exe)',
        version: '1.0.0',
        platform: 'Windows 10 / 11 (64-bit)',
        filename: 'SkillBridge.exe',
        size: exeSize,
        available: exeExists,
        downloadUrl: '/api/download/windows',
      },
      android: {
        name: 'Android App (.apk & Play Store)',
        version: '1.0.0',
        platform: 'Android 8.0+ (Oreo and higher)',
        filename: 'SkillBridge.apk',
        size: apkSize,
        available: apkExists,
        downloadUrl: '/api/download/android',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.skillbridge.app',
      },
      ios: {
        name: 'Apple iOS (iPhone & iPad)',
        version: '1.0.0',
        platform: 'iOS 15.0 and higher',
        available: true,
        appStoreUrl: 'https://apps.apple.com/app/skillbridge/id123456789',
        testFlightUrl: 'https://testflight.apple.com/join/skillbridge',
      },
    },
  });
});

router.get('/windows', (_req, res) => {
  const exePath = path.resolve(process.cwd(), 'public', 'downloads', 'SkillBridge.exe');
  
  if (!fs.existsSync(exePath)) {
    return res.status(404).json({
      error: 'Windows desktop installer is currently unavailable. Please build it or use the web app.',
    });
  }

  res.download(exePath, 'SkillBridge.exe', (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: 'Failed to download Windows desktop app' });
    }
  });
});

router.get('/android', (_req, res) => {
  const apkPath = path.resolve(process.cwd(), 'public', 'downloads', 'SkillBridge.apk');
  
  if (fs.existsSync(apkPath)) {
    return res.download(apkPath, 'SkillBridge.apk', (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ error: 'Failed to download Android APK' });
      }
    });
  }

  // If APK binary is not compiled yet, respond with helpful guide
  res.status(200).json({
    status: 'building',
    message: 'SkillBridge Android APK can be generated via Capacitor using "npm run cap:build:android" or installed via Google Play Store.',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.skillbridge.app',
  });
});

export default router;
