import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, BASE_URL } from '../lib/api';
import { useIsDesktop } from '../lib/isDesktop';
import Logo from '../components/Logo';

/**
 * React page component for Desktop App Downloads.
 * Clean, elegant presentation without annoying banner ads.
 * @author = kruthinraj
 * @date = 2026-10-27
 */

export default function Download() {
  const isDesktop = useIsDesktop();
  const [downloadInfo, setDownloadInfo] = useState({
    version: '1.0.0',
    platform: 'Windows 10 / 11 (64-bit)',
    filename: 'SkillBridge.exe',
    size: '5.6 KB',
    available: true,
  });
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.download.getInfo()
      .then((data) => {
        if (data) setDownloadInfo((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    // Trigger direct file download
    window.location.href = `${BASE_URL}/api/download/windows`;
    setTimeout(() => setDownloading(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-16 animate-fade-in pb-12">
      {/* HERO SECTION */}
      <section className="text-center space-y-6 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cw-accent/10 border border-cw-accent/20 text-xs font-semibold text-cw-accent">
          <span>💻 Official Desktop Release</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cw-accent" />
          <span>v{downloadInfo.version}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-cw-text-1 tracking-tight font-serif leading-tight">
          SkillBridge for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cw-accent to-emerald-400">Windows</span>
        </h1>

        <p className="text-base sm:text-lg text-cw-text-2 max-w-2xl mx-auto leading-relaxed">
          The verified campus peer freelancing &amp; skill exchange platform, now available as a dedicated, high-performance desktop application.
        </p>

        {isDesktop && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 max-w-md mx-auto">
            <span>✓</span>
            <span>You are currently using the SkillBridge Desktop Application (v{downloadInfo.version}).</span>
          </div>
        )}

        {/* PRIMARY CTA & DETAILS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cw-accent hover:bg-cw-accent-mid text-white font-bold text-base shadow-lg shadow-cw-accent/20 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{downloading ? 'Starting Download…' : 'Download for Windows (.exe)'}</span>
          </button>

          <Link
            to="/browse"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-cw-surface hover:bg-cw-bg-alt border border-cw-border text-cw-text-1 font-semibold text-sm transition-colors text-center"
          >
            Continue in Browser →
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-cw-text-3 pt-1">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Portable Executable (No Admin Rights Needed)
          </span>
          <span>&bull;</span>
          <span>Windows 10 / 11 (64-bit)</span>
          <span>&bull;</span>
          <span>Fast Download ({downloadInfo.size})</span>
        </div>
      </section>

      {/* DESKTOP WINDOW MOCKUP PREVIEW */}
      <section className="relative rounded-2xl border border-cw-border bg-cw-surface shadow-2xl overflow-hidden group">
        {/* Native-style Window Titlebar */}
        <div className="bg-cw-bg-alt px-4 py-2.5 border-b border-cw-border flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <Logo size="xs" />
            <span className="text-xs font-semibold text-cw-text-2">SkillBridge Desktop</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-cw-text-3">
            <div className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <div className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
          </div>
        </div>

        {/* Mock Window Content */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-cw-surface to-cw-bg-alt/40 space-y-4">
          <div className="flex items-center justify-between border-b border-cw-border/60 pb-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-cw-text-1">Dedicated Campus Workspace</h3>
              <p className="text-xs text-cw-text-3">
                No browser tabs, no search bar clutter, zero social media distraction.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ● Connected to Campus Hub
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-cw-bg border border-cw-border/80 text-xs space-y-1">
              <span className="text-lg">⚡</span>
              <p className="font-semibold text-cw-text-1">Taskbar Instant Launch</p>
              <p className="text-cw-text-3 text-[11px]">Pin directly to Windows Taskbar for 1-click access.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-cw-bg border border-cw-border/80 text-xs space-y-1">
              <span className="text-lg">🔔</span>
              <p className="font-semibold text-cw-text-1">Real-time Campus Alerts</p>
              <p className="text-cw-text-3 text-[11px]">Desktop notifications for offers, bids, and chat.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-cw-bg border border-cw-border/80 text-xs space-y-1">
              <span className="text-lg">🔒</span>
              <p className="font-semibold text-cw-text-1">Persistent Login</p>
              <p className="text-cw-text-3 text-[11px]">Safe, isolated profile session that stays remembered.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY USE DESKTOP (FEATURES GRID) */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-cw-text-1 font-serif">
            Built for Students &amp; Freelancers
          </h2>
          <p className="text-xs sm:text-sm text-cw-text-2 max-w-xl mx-auto">
            Everything you love about SkillBridge, enhanced with desktop ergonomics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-cw-surface border border-cw-border space-y-2 hover:border-cw-accent/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-cw-accent/10 text-cw-accent flex items-center justify-center text-lg font-bold">
              ⚡
            </div>
            <h3 className="text-sm font-bold text-cw-text-1">Instant 1-Click Launch</h3>
            <p className="text-xs text-cw-text-2 leading-relaxed">
              No need to open your browser, find your bookmarks, or type the URL. Double click the icon on your desktop or press your Windows key to launch in milliseconds.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cw-surface border border-cw-border space-y-2 hover:border-cw-accent/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg font-bold">
              🔔
            </div>
            <h3 className="text-sm font-bold text-cw-text-1">Always-on Campus Notifications</h3>
            <p className="text-xs text-cw-text-2 leading-relaxed">
              Receive timely desktop popups when someone bids on your listing, accepts your skill exchange, or messages your project team.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cw-surface border border-cw-border space-y-2 hover:border-cw-accent/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-lg font-bold">
              🎯
            </div>
            <h3 className="text-sm font-bold text-cw-text-1">Dedicated Clean Window</h3>
            <p className="text-xs text-cw-text-2 leading-relaxed">
              Zero tab clutter. Keep SkillBridge open on a second monitor or side-by-side with your code editor or study notes while you work.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cw-surface border border-cw-border space-y-2 hover:border-cw-accent/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold">
              🔒
            </div>
            <h3 className="text-sm font-bold text-cw-text-1">Isolated &amp; Secure Session</h3>
            <p className="text-xs text-cw-text-2 leading-relaxed">
              The desktop app runs in its own isolated user profile. Clearing your general browser cookies or cache will never log you out of SkillBridge.
            </p>
          </div>
        </div>
      </section>

      {/* 3-STEP QUICK SETUP */}
      <section className="p-6 sm:p-8 rounded-2xl bg-cw-surface border border-cw-border space-y-6">
        <h3 className="text-lg font-bold text-cw-text-1 text-center font-serif">
          How to Get Started in 30 Seconds
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="w-7 h-7 rounded-full bg-cw-accent/15 text-cw-accent text-xs font-bold inline-flex items-center justify-center">
              1
            </span>
            <h4 className="text-sm font-semibold text-cw-text-1">Download SkillBridge.exe</h4>
            <p className="text-xs text-cw-text-2">
              Click the download button above to save the lightweight executable file to your computer.
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <span className="w-7 h-7 rounded-full bg-cw-accent/15 text-cw-accent text-xs font-bold inline-flex items-center justify-center">
              2
            </span>
            <h4 className="text-sm font-semibold text-cw-text-1">Run and Pin to Taskbar</h4>
            <p className="text-xs text-cw-text-2">
              Double-click the file to run. Right-click the icon in your Windows Taskbar and choose <strong>&ldquo;Pin to Taskbar&rdquo;</strong>.
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <span className="w-7 h-7 rounded-full bg-cw-accent/15 text-cw-accent text-xs font-bold inline-flex items-center justify-center">
              3
            </span>
            <h4 className="text-sm font-semibold text-cw-text-1">Sign in with College Email</h4>
            <p className="text-xs text-cw-text-2">
              Log in once with your student email and enjoy distraction-free campus freelancing.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER CALLOUT */}
      <section className="text-center pt-2 space-y-4">
        <p className="text-xs text-cw-text-3">
          Need help with the desktop app? Reach out anytime via{' '}
          <Link to="/support" className="text-cw-accent font-medium hover:underline">
            Campus Support
          </Link>.
        </p>
      </section>
    </div>
  );
}
