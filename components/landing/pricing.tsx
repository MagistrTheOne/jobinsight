"use client";

import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

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
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '9',
    period: 'month',
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
    ],
    cta: 'Contact Sales',
  },
];

export function Pricing() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleProClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=checkout');
      return;
    }
    // Redirect to checkout with product ID
    const productId = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID || 'f61ce25c-5122-429f-8b2e-8c77d9380a84';
    window.location.href = `/api/checkout?products=${productId}`;
  };

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0b0b] text-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 px-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that works best for your job search.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <GlassCard
              key={index}
              className={`p-6 sm:p-7 lg:p-8 bg-neutral-950/60 backdrop-blur-sm border rounded-lg h-full flex flex-col transition-all duration-300 ${
                index === 1
                  ? 'border-neutral-700/50 lg:scale-105 lg:shadow-xl'
                  : 'border-neutral-800/50 hover:border-neutral-700/50'
              }`}
            >
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-white">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                    {plan.price === 'Custom' ? plan.price : `$${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-sm sm:text-base text-neutral-500">/{plan.period}</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed px-2">{plan.description}</p>
              </div>

              <ul className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-8 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 sm:gap-3">
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-neutral-300 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {index === 1 ? (
                <Button
                  onClick={handleProClick}
                  className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium transition-all bg-neutral-800 hover:bg-neutral-700 text-white mt-auto"
                >
                  {plan.cta}
                </Button>
              ) : (
                <Link href="/auth/signup" className="mt-auto">
                  <Button className={`w-full h-10 sm:h-11 text-sm sm:text-base font-medium transition-all ${
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
