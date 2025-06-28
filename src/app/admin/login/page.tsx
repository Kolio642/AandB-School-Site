'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, LogIn } from 'lucide-react';
import Link from 'next/link';

// Login form schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { user, isLoading, signIn } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!isLoading && user) {
      console.log('User already authenticated, redirecting to dashboard...');
      router.push('/admin/dashboard');
    }
  }, [user, isLoading, router]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
      });
      
      // Redirect to dashboard
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-md w-16 h-16 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-md">
            A&B
          </div>
          <h1 className="text-3xl font-extrabold text-center text-gray-900">
            Admin Portal
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage the A&B School website
          </p>
        </div>
        
        <Card className="w-full shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@example.com"
                    className={`pr-2 ${errors.email ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm font-medium text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`pr-2 ${errors.password ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm font-medium text-red-500">{errors.password.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-10 mt-6" 
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>Sign in</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-4">
            <Link 
              href="/bg" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Back to Website
            </Link>
            <p className="text-sm text-muted-foreground">
              A&B School Admin
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 