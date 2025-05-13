'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Auth provider initializing...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      } else {
        console.log('Session retrieved:', session ? 'Session exists' : 'No session');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log(`Signing in user: ${email}`);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      console.log('Sign in successful:', data.session ? 'Session created' : 'No session created');
      return { error: null };
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    console.log('Signing out user...');
    try {
      // First clear all related cookies
      document.cookie = 'sb-refresh-token=; path=/; max-age=0; samesite=lax';
      document.cookie = 'sb-access-token=; path=/; max-age=0; samesite=lax';
      document.cookie = 'sb-auth-token=; path=/; max-age=0; samesite=lax';
      document.cookie = 'dashboard_visited=; path=/; max-age=0; samesite=lax';
      document.cookie = 'auth_success=; path=/; max-age=0; samesite=lax';
      
      // Call Supabase signOut API
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out from all tabs/devices
      });
      
      if (error) {
        console.error('Error signing out from Supabase:', error);
        throw error;
      }
      
      // Force update local state even if we got an error
      setSession(null);
      setUser(null);
      
      console.log('Sign out successful');
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      
      // Force state update even on error
      setSession(null);
      setUser(null);
      
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 