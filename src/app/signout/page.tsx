'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    async function signOutProcess() {
      try {
        console.log('Signout page: Signing out user');
        
        // Clear all auth cookies
        document.cookie = 'sb-refresh-token=; path=/; max-age=0; samesite=lax';
        document.cookie = 'sb-access-token=; path=/; max-age=0; samesite=lax';
        document.cookie = 'supabase-auth-token=; path=/; max-age=0; samesite=lax';
        document.cookie = 'dashboard_visited=; path=/; max-age=0; samesite=lax';
        document.cookie = 'auth_success=; path=/; max-age=0; samesite=lax';
        
        // Try to sign out via Supabase
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out from Supabase:', error);
        }
        
        console.log('Signout page: Redirecting to login');
        
        // Use a short timeout to ensure cookies are properly cleared
        setTimeout(() => {
          // Use direct navigation to avoid caching issues
          window.location.href = '/admin';
        }, 500);
      } catch (error) {
        console.error('Error during sign out:', error);
        // Redirect even if there was an error
        window.location.href = '/admin';
      }
    }
    
    signOutProcess();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Signing out...</p>
      </div>
    </div>
  );
} 