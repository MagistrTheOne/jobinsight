"use client";

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Github } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || 'Registration failed');
        setIsLoading(false);
      } else {
        setSuccess(true);
        
        // После регистрации автоматически входим
        const signInResult = await authClient.signIn.email({
          email,
          password,
        });

        if (signInResult.error) {
          setError('Account created but sign in failed. Please sign in manually.');
          setIsLoading(false);
          setTimeout(() => {
            window.location.href = '/auth/signin';
          }, 2000);
        } else {
          // Redirect to checkout if coming from pricing page
          if (redirect === 'checkout') {
            const productId = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID || 'f61ce25c-5122-429f-8b2e-8c77d9380a84';
            window.location.href = `/api/checkout?products=${productId}`;
          } else {
            // Успешная регистрация и вход - редирект на dashboard
            window.location.href = '/dashboard';
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError('');
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: redirect === 'checkout' ? '/api/checkout' : '/dashboard',
      });
    } catch (err: any) {
      setError(err.message || 'OAuth sign in failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Sign up for JobInsight AI</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-400">
                Account created successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* OAuth Providers */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full bg-white text-gray-900 hover:bg-gray-100"
            >
              <Mail className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <Button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="w-full bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
            >
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-gray-400">Or sign up with email</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <a href="/auth/signin" className="text-blue-400 hover:text-blue-300 underline">
              Sign in
            </a>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
