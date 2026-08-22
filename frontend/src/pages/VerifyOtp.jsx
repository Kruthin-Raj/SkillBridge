import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtp() {
  const { state } = useLocation();
  const { verifyOtp, requestOtp } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  // Landing here directly (refresh, bookmark) means we have no email to verify.
  if (!state?.email) return <Navigate to="/login" replace />;

  const { email, deliveredByEmail } = state;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const { isNewUser } = await verifyOtp(email, code.trim());
      navigate(isNewUser ? '/profile' : '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    try {
      await requestOtp(email);
      setNotice('A new code is on its way.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Enter your code</h1>
      <p className="mt-2 text-sm text-slate-600">
        We sent a 6-digit code to <strong>{email}</strong>.
      </p>

      {/* In development MAIL_DRIVER=console, so the code never leaves the server. */}
      {deliveredByEmail === false && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Development mode: the email was not actually sent. Look for the code in the
          terminal running the backend.
        </p>
      )}

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
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
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="field text-center text-2xl tracking-[0.5em]"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>
        )}

        <button type="submit" disabled={busy || code.length !== 6} className="btn-primary w-full">
          {busy ? 'Verifying…' : 'Verify and continue'}
        </button>

        <button type="button" onClick={handleResend} className="btn-ghost w-full">
          Send a new code
        </button>
      </form>
    </div>
  );
}
