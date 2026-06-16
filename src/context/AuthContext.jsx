import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);

  // rehydrate session from JWT on first load
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('fitnex_token');
      if (token) {
        const verified = await authService.verifyToken();
        if (verified) {
          setUser(verified);
        }
      }
      setLoadingContext(false);
    };

    init();

    // safety timeout so we never block the app forever
    const timeout = setTimeout(() => setLoadingContext(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  const login = useCallback(async (email, password) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const result = await authService.signup(name, email, password);
    return result;
  }, []);

  const verifyOTP = useCallback(async (email, code) => {
    const loggedInUser = await authService.verifyOTP(email, code);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  if (loadingContext) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
