import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COLLEGE_DOMAIN = import.meta.env.VITE_COLLEGE_DOMAIN || 'apollouniversity.edu.in';

export default function Register() {
  const { requestOtp, register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deliveredByEmail, setDeliveredByEmail] = useState(true);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const result = await requestOtp(email);
      setDeliveredByEmail(result.deliveredByEmail);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      await register(email, password, code.trim());
      navigate('/profile/setup', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="mx-auto max-w-md animate-fade-in">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-cw-text-2">
          We sent a 6-digit code to <strong>{email}</strong>.
        </p>

        {deliveredByEmail === false && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Development mode: the email was not actually sent. Look for the code in the
            terminal running the backend.
          </p>
        )}

        <form onSubmit={handleVerify} className="card mt-6 space-y-4">
          <div>
            <label htmlFor="code" className="label">
              6-digit code
            </label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="field text-center text-2xl tracking-[0.5em]"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy || code.length !== 6} className="btn-primary w-full">
            {busy ? 'Creating account…' : 'Verify and create account'}
          </button>

          <button
            type="button"
            onClick={() => { setStep('form'); setCode(''); setError(''); }}
            className="btn-ghost w-full"
          >
            ← Go back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-2 text-sm text-cw-text-2">
        Only <strong>@{COLLEGE_DOMAIN}</strong> email addresses can register — verified students only.
      </p>

      <form onSubmit={handleSendOtp} className="card mt-6 space-y-4">
        <div>
          <label htmlFor="reg-email" className="label">College email</label>
          <input
            id="reg-email"
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
          <label htmlFor="reg-password" className="label">Password</label>
          <input
            id="reg-password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="reg-confirm" className="label">Confirm password</label>
          <input
            id="reg-confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className="field"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Sending code…' : 'Send verification code'}
        </button>

        <p className="text-center text-sm text-cw-text-3">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-freelance hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
