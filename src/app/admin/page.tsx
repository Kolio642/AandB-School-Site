'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Check if user is already authenticated on page load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClientComponentClient();
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log('User already logged in, redirecting to dashboard');
          // Force a full page load rather than client-side navigation
          window.location.replace('/admin/dashboard');
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };
    
    checkSession();
  }, []);

  // Handle redirect with auto-retry
  useEffect(() => {
    if (redirecting) {
      const redirectTimer = setTimeout(() => {
        // Force a full page reload to dashboard
        window.location.replace('/admin/dashboard');
        
        // Set up retry logic if we're still on the login page after 2 seconds
        const retryTimer = setTimeout(() => {
          if (window.location.pathname === '/admin' && retryCount < 3) {
            console.log(`Retry ${retryCount + 1}: Still on login page, retrying redirect...`);
            setRetryCount(prev => prev + 1);
            // Try a different approach on subsequent attempts
            if (retryCount === 1) {
              window.location.href = '/admin/dashboard';
            } else {
              // Last resort - full page reload with direct URL
              window.location.assign('/admin/dashboard');
            }
          }
        }, 2000);
        
        return () => clearTimeout(retryTimer);
      }, 800);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [redirecting, retryCount]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Sign in using the auth context
      const result = await signIn(data.email, data.password);
      
      if (result) {
        console.log('Login successful, preparing redirect...');
        // Cache buster parameter to avoid redirecting to a cached page
        const cacheBuster = new Date().getTime();
        document.cookie = `auth_redirect=${cacheBuster}; path=/`;
        setRedirecting(true);
      } else {
        setError('Authentication failed. Please check your credentials.');
        setIsLoading(false);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in';
      setError(errorMessage);
      setIsLoading(false);
    }
  }

  if (redirecting) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <h1 className="text-xl font-semibold">Redirecting to dashboard...</h1>
        <p className="text-muted-foreground mt-2">You will be redirected shortly.</p>
        {retryCount > 0 && (
          <div className="mt-6">
            <p className="text-amber-600">Redirect is taking longer than expected.</p>
            <Button 
              className="mt-2" 
              onClick={() => window.location.replace('/admin/dashboard')}
            >
              Click here to go to dashboard
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in-50">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@user.com"
                disabled={isLoading}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Only authorized administrators can access this area.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 