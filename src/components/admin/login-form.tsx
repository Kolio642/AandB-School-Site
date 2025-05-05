import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log('Attempting to sign in...');
      
      // Use the raw Supabase client for direct access to the session
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (authError) {
        console.error('Sign in error:', authError);
        setError(`Authentication failed: ${authError.message}`);
        return;
      }
      
      if (!authData.session) {
        console.error('No session returned from Supabase');
        setError('Authentication failed: No session returned');
        return;
      }
      
      console.log('Authentication successful, session established');
      
      // Get session info for debugging
      let expiresInfo = 'unknown';
      try {
        if (authData.session.expires_at) {
          expiresInfo = new Date(authData.session.expires_at * 1000).toLocaleString();
        }
      } catch (e) {
        console.error('Error formatting expires date:', e);
      }
      
      setDebugInfo(`Auth successful. Session expires: ${expiresInfo}`);
      
      // Set success marker cookie to help with auth state transitions
      document.cookie = 'auth_success=true; max-age=60; path=/';
      
      // Wait a moment to ensure cookies are set
      setTimeout(() => {
        // Force hard navigation to dashboard instead of client-side routing
        window.location.href = '/admin/dashboard';
      }, 500);
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      setError('An unexpected error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          {...register('email')}
          type="email"
          autoComplete="email"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password">Password</label>
        <Input
          id="password"
          {...register('password')}
          type="password"
          autoComplete="current-password"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {debugInfo && !error && (
        <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
          {debugInfo}
        </div>
      )}
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
} 