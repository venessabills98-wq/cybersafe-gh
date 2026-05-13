import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        setAdmin({
          id: s.user.id,
          email: s.user.email,
          role: s.user.app_metadata?.role || 'user',
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        setAdmin({
          id: s.user.id,
          email: s.user.email,
          role: s.user.app_metadata?.role || 'user',
        });
      } else {
        setAdmin(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAdmin(null);
  }, []);

  const token = session?.access_token || null;
  const isAuthenticated = !!session;

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
