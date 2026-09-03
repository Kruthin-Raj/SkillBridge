import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, isProfileIncomplete } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import ImageModal from '../components/ImageModal';

const COLLEGE_DOMAIN = import.meta.env.VITE_COLLEGE_DOMAIN || 'apollouniversity.edu.in';

export default function Login() {
  const { loginWithPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorObj, setErrorObj] = useState(null);
  const [busy, setBusy] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorObj(null);
    setBusy(true);

    try {
      const { isNewUser } = await loginWithPassword(email, password);
      navigate(isNewUser ? '/profile/setup' : '/', { replace: true });
    } catch (err) {
      setErrorObj(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <h1 className="text-2xl font-bold">Sign in to SkillBridge</h1>
      <p className="mt-2 text-sm text-cw-text-2">
        Use your college email address. Only <strong>@{COLLEGE_DOMAIN}</strong> accounts can join.
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="label">
            College email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`yourname@${COLLEGE_DOMAIN}`}
            className="field"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <PasswordInput
            id="password"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        {errorObj && (
          <div role="alert" className="rounded-lg bg-red-50 p-4 border border-red-200">
            <p className="text-sm font-medium text-red-700">{errorObj.message}</p>
            {errorObj.details?.image_url && (
              <div className="mt-3">
                <p className="text-xs text-red-600 mb-1 font-semibold uppercase tracking-wider">Proof / Attachment</p>
                <img 
                  src={errorObj.details.image_url} 
                  alt="Block Reason" 
                  className="max-h-32 rounded border border-red-200 object-cover cursor-zoom-in"
                  onClick={() => setFullscreenImage(errorObj.details.image_url)}
                />
              </div>
            )}
          </div>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="font-medium text-freelance hover:underline">
            Forgot password?
          </Link>
          <Link to="/register" className="font-medium text-freelance hover:underline">
            New here? Register
          </Link>
        </div>
      </form>

      {fullscreenImage && (
        <ImageModal src={fullscreenImage} onClose={() => setFullscreenImage(null)} />
      )}
    </div>
  );
}
