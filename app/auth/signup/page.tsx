"use client";

import { Suspense, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Github } from 'lucide-react';

function SignUpContent() {
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
      const { data: signUpData, error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (signUpError) {
        setError(signUpError.message || 'Registration failed');
        setIsLoading(false);
        return;
      }

      if (!signUpData) {
        setError('Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      
      // После регистрации автоматически входим
      const { data: signInData, error: signInError } = await authClient.signIn.email({
        email,
        password,
      });

      if (signInError) {
        setError('Account created but sign in failed. Please sign in manually.');
        setIsLoading(false);
        setTimeout(() => {
          window.location.href = '/auth/signin';
        }, 2000);
        return;
      }

      if (signInData) {
        // Redirect to checkout if coming from pricing page
        if (redirect === 'checkout') {
          const productId = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID || 'f61ce25c-5122-429f-8b2e-8c77d9380a84';
          window.location.href = `/api/checkout?products=${productId}`;
        } else {
          // Успешная регистрация и вход - редирект на dashboard
          window.location.href = '/dashboard';
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
    
    // OAuth редирект происходит автоматически, поэтому обрабатываем через callbacks
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: redirect === 'checkout' ? '/api/checkout' : '/dashboard',
      }, {
        onError: (ctx) => {
          setError(ctx.error.message || 'OAuth sign in failed');
          setIsLoading(false);
        },
      });
      // Редирект произойдет автоматически при успехе
    } catch (err: any) {
      // Эта ошибка может не сработать, если произошел редирект
      setError(err.message || 'OAuth sign in failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-3 sm:p-4 md:p-6">
      <GlassCard className="w-full max-w-md">
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">Create Account</h1>
            <p className="text-sm sm:text-base text-gray-300">Sign up for JobInsight AI</p>
          </div>

          {error && (
            <Alert variant="destructive" className="py-2 sm:py-3">
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="py-2 sm:py-3">
              <AlertDescription className="text-xs sm:text-sm text-green-400">
                Account created successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* OAuth Providers */}
          <div className="space-y-2.5 sm:space-y-3">
            <Button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full h-10 sm:h-11 bg-white text-gray-900 hover:bg-gray-100 text-sm sm:text-base"
            >
              <Mail className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <Button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="w-full h-10 sm:h-11 bg-gray-900 text-white hover:bg-gray-800 border border-gray-700 text-sm sm:text-base"
            >
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-300">Or sign up with email</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name" className="text-white text-sm sm:text-base">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-10 sm:h-11 bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-white/50 text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-white text-sm sm:text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10 sm:h-11 bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-white/50 text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-white text-sm sm:text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-10 sm:h-11 bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-white/50 text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="confirmPassword" className="text-white text-sm sm:text-base">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-10 sm:h-11 bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-white/50 text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 sm:h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base"
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

          <div className="text-center text-xs sm:text-sm text-gray-300">
            Already have an account?{' '}
            <a href="/auth/signin" className="text-white hover:text-gray-200 underline font-medium">
              Sign in
            </a>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
