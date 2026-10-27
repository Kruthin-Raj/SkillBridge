import { Router } from 'express';
import path from 'path';
import fs from 'fs';

/**
 * Route handler for desktop downloads.
 * @author = kruthinraj
 * @date = 2026-10-27
 */

const router = Router();

router.get('/info', (_req, res) => {
  const exePath = path.resolve(process.cwd(), 'public', 'downloads', 'SkillBridge.exe');
  let size = '5.6 KB';
  let exists = false;

  if (fs.existsSync(exePath)) {
    exists = true;
    const stats = fs.statSync(exePath);
    size = `${(stats.size / 1024).toFixed(1)} KB`;
  }

  res.json({
    version: '1.0.0',
    platform: 'Windows 10 / 11 (64-bit)',
    filename: 'SkillBridge.exe',
    size,
    available: exists,
    downloadUrl: '/api/download/windows',
  });
});

router.get('/windows', (_req, res) => {
  const exePath = path.resolve(process.cwd(), 'public', 'downloads', 'SkillBridge.exe');
  
  if (!fs.existsSync(exePath)) {
    return res.status(404).json({
      error: 'Desktop installer is currently being built. Please try again in a moment or run the web app.',
    });
  }

  res.download(exePath, 'SkillBridge.exe', (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: 'Failed to download desktop app' });
    }
  });
});

export default router;
