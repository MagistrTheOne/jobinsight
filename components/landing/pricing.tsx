"use client";

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { CheckoutButton } from '@/components/payments/checkout-button';

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'forever',
    description: 'Perfect for trying out our AI-powered job search tools.',
    features: [
      '5 job analyses per month',
      '3 resume optimizations',
      'Basic ATS compatibility check',
      'Cover letter generation',
      'History saved locally',
      'Basic chat with AI assistant',
      'Access to job search templates',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '50',
    period: 'month',
    yearlyPrice: '480',
    description: 'For serious job seekers who want unlimited access.',
    features: [
      'Unlimited job analyses',
      'Unlimited resume optimizations',
      'Advanced ATS compatibility scoring',
      'Priority AI processing',
      'Cloud history sync',
      'Job grade assessment',
      'Real-time optimization',
      'Email support',
      'Advanced chat features',
      'Resume builder with AI',
      'Salary negotiation assistant',
      'Priority customer support',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and recruiters managing multiple candidates.',
    features: [
      'Everything in Pro',
      'Team collaboration tools',
      'Bulk processing',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'Custom AI training',
      'White-label solution',
      'Advanced analytics',
      'Priority phone support',
      'Custom reporting',
    ],
    cta: 'Contact Sales',
  },
];

export function Pricing() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);

  const handleProClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=checkout');
      return;
    }
    // Payment method selection will be handled by CheckoutButton component
  };

  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 lg:px-8 bg-[#0b0b0b] text-white min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex items-center">
      <div className="container mx-auto max-w-7xl w-full">
        <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16 px-2 sm:px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 tracking-tight px-1 sm:px-2">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed px-2 sm:px-3 mb-4 sm:mb-6 md:mb-8">
            Choose the plan that works best for your job search.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-0.5 sm:p-1 bg-neutral-900/50 backdrop-blur-xl border border-neutral-700/50 rounded-full mb-4 sm:mb-6">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                !isYearly
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                isYearly
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="hidden sm:inline ml-1 px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                Save 20%
              </span>
              <span className="sm:hidden ml-1 text-xs text-green-400">20%↓</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 2xl:gap-10 max-w-responsive-7xl mx-auto px-2 sm:px-0">
          {plans.map((plan, index) => (
            <GlassCard
              key={index}
              className={`p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 bg-linear-to-br from-neutral-950/80 via-neutral-900/60 to-neutral-950/80 backdrop-blur-xl border rounded-lg xl:rounded-xl h-full flex flex-col transition-all duration-300 shadow-xl xl:shadow-2xl ${
                index === 1
                  ? 'border-neutral-600/60 md:scale-105 md:shadow-xl xl:shadow-2xl md:shadow-blue-500/10 ring-1 ring-neutral-500/20'
                  : 'border-neutral-800/40 hover:border-neutral-700/60 hover:shadow-lg hover:shadow-white/5'
              }`}
            >
              <div className="text-center mb-4 sm:mb-5 md:mb-6 lg:mb-8">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-1.5 sm:mb-2 md:mb-3 text-white">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
                  <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
                    {plan.price === 'Custom' ? plan.price : `$${index === 1 && isYearly ? plan.yearlyPrice : plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-[10px] sm:text-xs md:text-sm lg:text-base text-neutral-500">
                      /{index === 1 && isYearly ? 'year' : plan.period}
                    </span>
                  )}
                </div>
                {index === 1 && isYearly && (
                  <div className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30 mb-1.5 sm:mb-2">
                    <span className="hidden sm:inline">Save $120 per year</span>
                    <span className="sm:hidden">Save $120/yr</span>
                  </div>
                )}
                <p className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm text-neutral-400 leading-relaxed px-1 sm:px-2">{plan.description}</p>
              </div>

              <ul className="space-y-1 sm:space-y-1.5 md:space-y-2 lg:space-y-2.5 mb-4 sm:mb-5 md:mb-6 lg:mb-8 grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3">
                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-neutral-500 mt-0.5 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm text-neutral-300 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {index === 1 ? (
                <div className="mt-auto">
                  {isAuthenticated ? (
                    <CheckoutButton plan="pro" billingCycle={isYearly ? 'yearly' : 'monthly'} className="w-full h-8 sm:h-9 md:h-10 lg:h-11 text-[10px] sm:text-xs md:text-sm lg:text-base font-medium transition-all bg-neutral-800 hover:bg-neutral-700 text-white" />
                  ) : (
                    <Button
                      onClick={handleProClick}
                      className="w-full h-8 sm:h-9 md:h-10 lg:h-11 text-[10px] sm:text-xs md:text-sm lg:text-base font-medium transition-all bg-neutral-800 hover:bg-neutral-700 text-white"
                    >
                      {plan.cta}
                    </Button>
                  )}
                </div>
              ) : (
                <Link href="/auth/signup" className="mt-auto">
                  <Button className={`w-full h-8 sm:h-9 md:h-10 lg:h-11 text-[10px] sm:text-xs md:text-sm lg:text-base font-medium transition-all ${
                    'bg-neutral-800/80 hover:bg-neutral-700 text-white'
                  }`}>
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
