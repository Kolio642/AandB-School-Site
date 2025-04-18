'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User; session: Session } | void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create Supabase client using the browser client from SSR package
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    let authListener: any = null;

    async function loadUserData() {
      try {
        console.log('Loading user session data...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }
        
        console.log('Session data loaded:', !!data.session);
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (e) {
        console.error('Unexpected error loading user data:', e);
      } finally {
        setIsLoading(false);
      }

      // Set up auth state change listener
      authListener = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state changed:', event, !!newSession);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            // Force refreshing the session to ensure cookies are properly set
            if (newSession) {
              try {
                await supabase.auth.getSession();
                console.log('Session refreshed after auth state change');
              } catch (error) {
                console.error('Error refreshing session:', error);
              }
            }
          } else if (event === 'SIGNED_OUT') {
            setSession(null);
            setUser(null);
          }
          
          setIsLoading(false);
        }
      );
    }

    loadUserData();

    return () => {
      console.log('Cleaning up auth listener');
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }
      
      if (!data.session) {
        console.error('No session returned after login');
        throw new Error('Login failed - no session created');
      }
      
      console.log('Successfully signed in, setting user and session');
      // Explicitly update state to ensure UI reflects the change
      setUser(data.user);
      setSession(data.session);
      
      // Force refresh session data to ensure cookies are properly set
      await supabase.auth.getSession();
      
      // Add a small delay to ensure session is fully set before redirecting
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return data;
    } catch (error) {
      console.error('Login process error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Clear state immediately regardless of API response
      setUser(null);
      setSession(null);
      
      // Force redirect to login page after signout
      window.location.href = '/admin';
    } catch (error) {
      console.error('Sign out process error:', error);
      // Still clear state even if there's an error
      setUser(null);
      setSession(null);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 