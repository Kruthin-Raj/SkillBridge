import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On a page refresh the token is still in localStorage - ask the API who it belongs to.
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }

    api.auth
      .me()
      .then(({ user: me }) => setUser(me))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const requestOtp = useCallback((email) => api.auth.requestOtp(email), []);

  const verifyOtp = useCallback(async (email, code) => {
    const { token, user: me, isNewUser } = await api.auth.verifyOtp(email, code);
    tokenStore.set(token);
    setUser(me);
    return { isNewUser };
  }, []);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, requestOtp, verifyOtp, signOut }),
    [user, loading, requestOtp, verifyOtp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
