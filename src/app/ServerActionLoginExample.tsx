'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

// Server Actions are imported from a separate file
// This would be the import for your server actions
// import { loginWithEmail } from './auth-actions';

export default function ServerActionLoginExample() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // This function will be a server action in your actual implementation
  // Since we're having linter issues with the actual file, we'll define a mock version
  async function serverLoginAction(formData: FormData) {
    'use server';
    
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }
    
    try {
      // Here you would authenticate with your backend
      console.log('Login attempt:', { email });
      
      // Mock a successful login
      if (email === 'admin@example.com' && password === 'password123') {
        return { success: true, user: { email } };
      } else {
        return { error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Failed to sign in. Please try again.' };
    }
  }

  // Client-side handler for form submission
  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(false);
    
    startTransition(async () => {
      try {
        // Call the server action
        const result = await serverLoginAction(formData);
        
        if ('error' in result && result.error) {
          setError(result.error);
        } else if ('success' in result) {
          setSuccess(true);
          // Redirect to dashboard after successful login
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 1000);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      }
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login with Server Actions</h2>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm border border-red-200 mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 p-4 rounded-md text-green-700 text-sm border border-green-200 mb-4">
          Login successful! Redirecting to dashboard...
        </div>
      )}
      
      <form 
        action={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="admin@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="password123"
          />
        </div>
        
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
        >
          {isPending ? (
            <>
              <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </div>
  );
} 