"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, ArrowRight, Home } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutId = searchParams.get('checkout_id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Небольшая задержка для анимации
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <GlassCard className="p-8 sm:p-10 bg-neutral-950/60 backdrop-blur-md border border-neutral-800/50">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-900/20 border border-green-800/30 backdrop-blur-sm">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Payment Successful!
              </h1>
              <p className="text-base sm:text-lg text-neutral-400 leading-relaxed">
                Your Pro subscription is now active. Start using all premium features.
              </p>
            </div>

            {checkoutId && (
              <div className="pt-4 border-t border-neutral-800/50">
                <p className="text-xs text-neutral-500 font-mono break-all">
                  Checkout ID: {checkoutId}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full h-11 bg-neutral-800 hover:bg-neutral-700 text-white">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/landing" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full h-11 border-neutral-800/50 hover:bg-neutral-900/50"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-neutral-800/50">
              <p className="text-xs text-neutral-500 text-center">
                Need help? Contact support or check your email for the receipt.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

