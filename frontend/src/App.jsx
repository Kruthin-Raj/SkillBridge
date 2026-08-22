import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Browse from './pages/Browse';
import CreateListing from './pages/CreateListing';
import Exchanges from './pages/Exchanges';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import VerifyOtp from './pages/VerifyOtp';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerifyOtp />} />
          <Route path="/listings/:id" element={<ListingDetail />} />

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
    </div>
  );
}
