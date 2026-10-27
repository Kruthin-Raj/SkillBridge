import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, BASE_URL } from '../lib/api';
import { useIsDesktop } from '../lib/isDesktop';
import Logo from '../components/Logo';

/**
 * React page component for Multi-Platform Downloads (Windows, Android, iOS).
 * Elegant, native product showcase with official badges and zero annoying ads.
 * @author = kruthinraj
 * @date = 2026-10-27
 */

export default function Download() {
  const isDesktop = useIsDesktop();
  const [activePlatform, setActivePlatform] = useState('windows');
  const [downloadInfo, setDownloadInfo] = useState({
    version: '1.0.0',
    platforms: {
      windows: { size: '17.5 KB', available: true },
      android: { size: 'Preview APK', available: true },
      ios: { available: true },
    },
  });
  const [downloading, setDownloading] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // Auto-detect user's operating system on load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/android/.test(ua)) {
        setActivePlatform('android');
      } else if (/iphone|ipad|ipod/.test(ua)) {
        setActivePlatform('ios');
      } else {
        setActivePlatform('windows');
      }
    }

    api.download.getInfo()
      .then((data) => {
        if (data) setDownloadInfo((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  const handleDownloadWindows = () => {
    setDownloading(true);
    // Direct static CDN download from frontend public folder with API fallback
    const link = document.createElement('a');
    link.href = '/downloads/SkillBridge.exe';
    link.download = 'SkillBridge.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 2500);
  };

  const handleDownloadAndroid = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/downloads/SkillBridge.apk', { method: 'HEAD' });
      if (res.ok) {
        const link = document.createElement('a');
        link.href = '/downloads/SkillBridge.apk';
        link.download = 'SkillBridge.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setShowAndroidGuide(true);
      }
    } catch {
      setShowAndroidGuide(true);
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-16 animate-fade-in pb-16">
      {/* HERO SECTION */}
      <section className="text-center space-y-6 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cw-accent/10 border border-cw-accent/20 text-xs font-semibold text-cw-accent">
          <span>📱 Cross-Platform Suite</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cw-accent" />
          <span>v{downloadInfo.version || '1.0.0'}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-cw-text-1 tracking-tight font-serif leading-tight">
          SkillBridge for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cw-accent via-emerald-400 to-indigo-500">
            Every Device
          </span>
        </h1>

        <p className="text-base sm:text-lg text-cw-text-2 max-w-2xl mx-auto leading-relaxed">
          The verified campus peer freelancing &amp; skill exchange platform, designed to keep you connected from your desktop, phone, or tablet.
        </p>

        {isDesktop && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 max-w-md mx-auto">
            <span>✓</span>
            <span>You are currently using the SkillBridge Desktop Application.</span>
          </div>
        )}

        {/* PLATFORM SELECTOR TABS */}
        <div className="flex items-center justify-center pt-2">
          <div className="inline-flex p-1.5 rounded-2xl bg-cw-surface border border-cw-border shadow-sm gap-1.5">
            <button
              type="button"
              onClick={() => setActivePlatform('windows')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activePlatform === 'windows'
                  ? 'bg-cw-accent text-white shadow-md'
                  : 'text-cw-text-2 hover:text-cw-text-1 hover:bg-cw-bg-alt'
              }`}
            >
              <span>🪟</span>
              <span>Windows (.exe)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('android')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activePlatform === 'android'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-cw-text-2 hover:text-cw-text-1 hover:bg-cw-bg-alt'
              }`}
            >
              <span>🤖</span>
              <span>Android (APK &amp; Play Store)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('ios')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activePlatform === 'ios'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-cw-text-2 hover:text-cw-text-1 hover:bg-cw-bg-alt'
              }`}
            >
              <span>🍎</span>
              <span>iOS (App Store &amp; PWA)</span>
            </button>
          </div>
        </div>
      </section>

      {/* ACTIVE PLATFORM HERO CARD */}
      <section className="rounded-3xl border border-cw-border bg-cw-surface shadow-2xl p-6 sm:p-10 space-y-8">
        {/* WINDOWS TAB */}
        {activePlatform === 'windows' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-cw-accent uppercase tracking-wider">
                  <span>Windows 10 &amp; 11 (64-bit)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-cw-text-1 font-serif">
                  SkillBridge Desktop for Windows
                </h2>
                <p className="text-sm text-cw-text-2 max-w-lg leading-relaxed">
                  Fast, distraction-free campus freelancing right from your taskbar. No browser tab clutter and an isolated session that never forgets your login.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-cw-text-3 pt-1">
                  <span>✓ 1-Click Portable Executable</span>
                  <span>&bull;</span>
                  <span>Embedded Brand Icon</span>
                  <span>&bull;</span>
                  <span>17.5 KB Download</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                <a
                  href="/downloads/SkillBridge.exe"
                  download="SkillBridge.exe"
                  className="px-8 py-4 rounded-2xl bg-cw-accent hover:bg-cw-accent-mid text-white font-bold text-base shadow-xl shadow-cw-accent/25 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 text-center select-none"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download for Windows (.exe)</span>
                </a>

                <Link
                  to="/browse"
                  className="px-6 py-2.5 rounded-xl text-center text-xs text-cw-text-3 hover:text-cw-text-1 font-semibold hover:bg-cw-bg-alt transition-colors"
                >
                  Continue in Web Browser →
                </Link>
              </div>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-cw-border">
              <div className="p-4 rounded-xl bg-cw-bg-alt/60 border border-cw-border/60 text-xs space-y-1">
                <span className="text-xl">⚡</span>
                <p className="font-bold text-cw-text-1">Taskbar Instant Launch</p>
                <p className="text-cw-text-3 text-[11px]">Pin directly to Windows Taskbar for 1-click access anytime.</p>
              </div>
              <div className="p-4 rounded-xl bg-cw-bg-alt/60 border border-cw-border/60 text-xs space-y-1">
                <span className="text-xl">🔔</span>
                <p className="font-bold text-cw-text-1">Native Campus Alerts</p>
                <p className="text-cw-text-3 text-[11px]">Real-time popups for new student bids, matches, and chat.</p>
              </div>
              <div className="p-4 rounded-xl bg-cw-bg-alt/60 border border-cw-border/60 text-xs space-y-1">
                <span className="text-xl">🔒</span>
                <p className="font-bold text-cw-text-1">Persistent Session</p>
                <p className="text-cw-text-3 text-[11px]">Isolated profile storage that never logs you out accidentally.</p>
              </div>
            </div>
          </div>
        )}

        {/* ANDROID TAB */}
        {activePlatform === 'android' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <span>Android 8.0+ (Phones &amp; Tablets)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-cw-text-1 font-serif">
                  SkillBridge for Android
                </h2>
                <p className="text-sm text-cw-text-2 max-w-lg leading-relaxed">
                  Take campus peer freelancing on the go. Get instant lock-screen notifications, upload work screenshots straight from your phone, and chat on campus.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-cw-text-3 pt-1">
                  <span>✓ Standalone APK Package</span>
                  <span>&bull;</span>
                  <span>Google Play Store Ready</span>
                  <span>&bull;</span>
                  <span>Native Camera &amp; File Upload</span>
                </div>
              </div>

              {/* Android Action Buttons */}
              <div className="flex flex-col gap-3 w-full md:w-auto items-center md:items-end">
                <a
                  href="/downloads/SkillBridge.apk"
                  download="SkillBridge.apk"
                  onClick={handleDownloadAndroid}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 hover:-translate-y-0.5 select-none"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Android APK</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowAndroidGuide(!showAndroidGuide)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>⚡</span>
                  <span>{showAndroidGuide ? 'Hide Mobile Guide' : 'Instant 1-Tap Install (No APK Needed)'}</span>
                </button>
              </div>
            </div>

            {/* Android Setup Guide */}
            <div className="p-5 rounded-2xl bg-cw-bg-alt/50 border border-cw-border text-xs space-y-4">
              <h4 className="font-bold text-cw-text-1 flex items-center gap-2">
                <span>📱</span> Two Ways to Install on Android
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-cw-text-2">
                <div className="p-3.5 rounded-xl bg-cw-surface border border-cw-border space-y-1.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span>⚡</span> Option 1: Instant Chrome App (Fastest)
                  </span>
                  <p className="font-semibold text-cw-text-1">No file download required</p>
                  <p className="text-[11px] text-cw-text-3 leading-relaxed">
                    Open SkillBridge in Chrome on your phone, tap <strong>⋮ (Menu)</strong> → <strong>&ldquo;Install app&rdquo;</strong> (or <strong>&ldquo;Add to Home screen&rdquo;</strong>). It installs immediately with the SkillBridge icon and full-screen view.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-cw-surface border border-cw-border space-y-1.5">
                  <span className="font-bold text-cw-accent flex items-center gap-1.5">
                    <span>📦</span> Option 2: Standalone APK
                  </span>
                  <p className="font-semibold text-cw-text-1">Download &amp; Sideload</p>
                  <p className="text-[11px] text-cw-text-3 leading-relaxed">
                    Click <strong>&ldquo;Download Android APK&rdquo;</strong> above. Once downloaded, tap the file in your notifications or Files app, and choose <strong>&ldquo;Install&rdquo;</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IOS TAB */}
        {activePlatform === 'ios' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <span>Apple iOS (iPhone &amp; iPad)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-cw-text-1 font-serif">
                  SkillBridge for iPhone &amp; iPad
                </h2>
                <p className="text-sm text-cw-text-2 max-w-lg leading-relaxed">
                  Install SkillBridge directly on your iPhone without going through the App Store. Runs in full-screen standalone mode with the native app icon and zero browser bars.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-cw-text-3 pt-1">
                  <span>✓ 1-Tap Home Screen Install</span>
                  <span>&bull;</span>
                  <span>Full-Screen Standalone View</span>
                  <span>&bull;</span>
                  <span>Instant Updates</span>
                </div>
              </div>

              {/* iOS Action Buttons */}
              <div className="flex flex-col gap-3 w-full md:w-auto items-center md:items-end">
                <button
                  type="button"
                  onClick={() => setShowIosGuide(!showIosGuide)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
                >
                  <span>📲</span>
                  <span>{showIosGuide ? 'Hide Install Guide' : 'How to Install on iPhone'}</span>
                </button>
              </div>
            </div>

            {/* iOS Instant Web App Guide */}
            <div className="p-5 rounded-2xl bg-cw-bg-alt/50 border border-cw-border text-xs space-y-4">
              <h4 className="font-bold text-cw-text-1 flex items-center gap-2">
                <span>🍎</span> 3-Step Instant iPhone Setup (No App Store Needed)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-cw-text-2">
                <div className="p-3 rounded-xl bg-cw-surface border border-cw-border space-y-1">
                  <span className="font-bold text-cw-accent">Step 1</span>
                  <p className="font-semibold text-cw-text-1">Open in Safari</p>
                  <p className="text-[11px] text-cw-text-3">Open this website in Safari on your iPhone or iPad.</p>
                </div>
                <div className="p-3 rounded-xl bg-cw-surface border border-cw-border space-y-1">
                  <span className="font-bold text-cw-accent">Step 2</span>
                  <p className="font-semibold text-cw-text-1">Tap the Share Icon</p>
                  <p className="text-[11px] text-cw-text-3">Tap the Share button at the bottom of Safari (the square with an arrow pointing up).</p>
                </div>
                <div className="p-3 rounded-xl bg-cw-surface border border-cw-border space-y-1">
                  <span className="font-bold text-cw-accent">Step 3</span>
                  <p className="font-semibold text-cw-text-1">Add to Home Screen</p>
                  <p className="text-[11px] text-cw-text-3">Scroll down and tap &ldquo;Add to Home Screen&rdquo;, then tap &ldquo;Add&rdquo;. SkillBridge will appear as an app on your home screen!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* THREE PLATFORMS COMPARISON CARDS */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-cw-text-1 font-serif">
            One Unified Campus Account
          </h2>
          <p className="text-xs sm:text-sm text-cw-text-2 max-w-xl mx-auto">
            Your bids, listings, ratings, and wallet sync seamlessly across all your devices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Windows */}
          <div
            onClick={() => setActivePlatform('windows')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
              activePlatform === 'windows'
                ? 'bg-cw-surface border-cw-accent shadow-lg shadow-cw-accent/10 ring-2 ring-cw-accent/20'
                : 'bg-cw-surface/60 border-cw-border hover:border-cw-accent/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-cw-accent/10 text-cw-accent flex items-center justify-center text-xl font-bold">
              🪟
            </div>
            <h3 className="text-base font-bold text-cw-text-1">Windows (.exe)</h3>
            <p className="text-xs text-cw-text-2 leading-relaxed">
              Ideal for coding, design, heavy freelancing, and multitasking on multiple monitors.
            </p>
            <div className="pt-2 text-xs font-semibold text-cw-accent">
              {activePlatform === 'windows' ? '● Selected platform' : 'Click to view options →'}
            </div>
          </div>

          {/* Card 2: Android */}
          <div
            onClick={() => setActivePlatform('android')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
              activePlatform === 'android'
                ? 'bg-cw-surface border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                : 'bg-cw-surface/60 border-cw-border hover:border-emerald-500/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
              🤖
            </div>
            <h3 className="text-base font-bold text-cw-text-1">Android App</h3>
            <p className="text-xs text-cw-text-2 leading-relaxed">
              Get immediate push alerts between lectures, chat with clients, and accept peer gigs on campus.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {activePlatform === 'android' ? '● Selected platform' : 'Click to view options →'}
            </div>
          </div>

          {/* Card 3: iOS */}
          <div
            onClick={() => setActivePlatform('ios')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
              activePlatform === 'ios'
                ? 'bg-cw-surface border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                : 'bg-cw-surface/60 border-cw-border hover:border-indigo-500/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
              🍎
            </div>
            <h3 className="text-base font-bold text-cw-text-1">Apple iOS</h3>
            <p className="text-xs text-cw-text-2 leading-relaxed">
              Designed for Retina displays on iPhone &amp; iPad. Instant home-screen app with full gesture navigation.
            </p>
            <div className="pt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {activePlatform === 'ios' ? '● Selected platform' : 'Click to view options →'}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CALLOUT */}
      <section className="text-center pt-2 space-y-4">
        <p className="text-xs text-cw-text-3">
          Need technical assistance setting up on your device? Reach out to{' '}
          <Link to="/support" className="text-cw-accent font-medium hover:underline">
            Campus Support
          </Link>.
        </p>
      </section>
    </div>
  );
}
