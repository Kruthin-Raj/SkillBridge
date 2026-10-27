import { useState, useEffect } from 'react';

/**
 * Utility and hook to detect if SkillBridge is running inside the Desktop application.
 * @author = kruthinraj
 * @date = 2026-10-27
 */

export function checkIsDesktop() {
  if (typeof window === 'undefined') return false;

  // 1. Electron context bridge
  if (window.skillbridgeDesktop?.isDesktop) {
    return true;
  }

  // 2. Query param passed by desktop launcher
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('app') === 'desktop') {
      sessionStorage.setItem('skillbridge.isDesktop', 'true');
      return true;
    }
  } catch (_) {}

  // 3. Isolated session flag
  try {
    if (sessionStorage.getItem('skillbridge.isDesktop') === 'true') {
      return true;
    }
  } catch (_) {}

  // 4. Standalone window display mode (Edge/Chrome app mode)
  try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
  } catch (_) {}

  return false;
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => checkIsDesktop());

  useEffect(() => {
    setIsDesktop(checkIsDesktop());
  }, []);

  return isDesktop;
}
