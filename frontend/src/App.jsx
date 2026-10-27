import { Route, Routes, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Logo from './components/Logo';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Browse from './pages/Browse';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import Exchanges from './pages/Exchanges';
import ForgotPassword from './pages/ForgotPassword';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import PublicProfile from './pages/PublicProfile';
import Register from './pages/Register';
import SearchUsers from './pages/SearchUsers';
import About from './pages/About';
import Support from './pages/Support';
import AdminPanel from './pages/AdminPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Download from './pages/Download';
import { useIsDesktop } from './lib/isDesktop';

/**
 * Implementation file for App.
 * @author = kruthinraj
 * @date = 2026-08-22
 */

export default function App() {
  const isDesktop = useIsDesktop();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 pb-24 md:pb-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/download" element={<Download />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/users/:id" element={<PublicProfile />} />
          <Route path="/search" element={<SearchUsers />} />
          <Route
            path="/admin-kkr"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exchanges"
            element={
              <ProtectedRoute>
                <Exchanges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="mt-auto border-t border-cw-accent/10 bg-cw-surface/50 py-6 mb-16 md:mb-0">
        <div className="mx-auto max-w-5xl px-4 flex flex-wrap items-center justify-between gap-4 text-sm text-cw-text-3">
          <div className="flex items-center gap-2">
            <Logo size="xs" />
            <span className="font-semibold text-cw-text-1">SkillBridge</span>
            <span className="text-xs text-cw-text-3 hidden sm:inline">&bull; &copy; {new Date().getFullYear()} Campus Platform</span>
          </div>
          <div className="flex items-center gap-6">
            {!isDesktop && (
              <Link to="/download" className="hover:text-cw-text-1 text-cw-accent font-medium transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Windows App (.exe)</span>
              </Link>
            )}
            <Link to="/about" className="hover:text-cw-text-1 transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-cw-text-1 transition-colors">Privacy Policy</Link>
            <Link to="/support" className="hover:text-cw-text-1 transition-colors">Support</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Horizontal Navigation Dock / Tab Bar */}
      <MobileBottomNav />
    </div>
  );
}
