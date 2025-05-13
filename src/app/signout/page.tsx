'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SignOutPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const performSignOut = async () => {
      try {
        console.log('Executing sign out process...');
        setStatus('loading');
        
        // Clear all auth cookies
        const cookies = [
          'sb-refresh-token',
          'sb-access-token',
          'sb-auth-token',
          'dashboard_visited',
          'auth_success'
        ];
        
        cookies.forEach(cookieName => {
          document.cookie = `${cookieName}=; path=/; max-age=0; samesite=lax`;
        });
        
        // Call Supabase sign out
        const { error } = await supabase.auth.signOut({
          scope: 'global' // Sign out from all tabs/devices
        });
        
        if (error) {
          throw error;
        }
        
        setStatus('success');
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1500);
        
      } catch (err: any) {
        console.error('Error during sign out process:', err);
        setStatus('error');
        setErrorMessage(err.message || 'An error occurred during sign out');
        
        // Redirect anyway after a delay
        setTimeout(() => {
          window.location.href = '/admin';
        }, 3000);
      }
    };
    
    performSignOut();
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
            <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
              Signing you out...
            </h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
              You have been signed out
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Redirecting you to the login page...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
              Sign out encountered an issue
            </h2>
            {errorMessage && (
              <p className="mt-2 text-center text-sm text-red-600">
                {errorMessage}
              </p>
            )}
            <p className="mt-2 text-center text-sm text-gray-600">
              Redirecting you anyway...
            </p>
          </>
        )}
      </div>
    </div>
  );
} 