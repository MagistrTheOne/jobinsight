"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { CheckoutButton } from "@/components/payments/checkout-button";
import { useTranslations } from "@/lib/i18n/use-translations";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    description: "Perfect for trying out our AI-powered job search tools.",
    features: [
      "5 job analyses per month",
      "3 resume optimizations",
      "Basic ATS compatibility check",
      "Cover letter generation",
      "History saved locally",
      "Basic chat with AI assistant",
      "Access to job search templates",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "50",
    period: "month",
    yearlyPrice: "480",
    description: "For serious job seekers who want unlimited access.",
    features: [
      "Unlimited job analyses",
      "Unlimited resume optimizations",
      "Advanced ATS compatibility scoring",
      "Priority AI processing",
      "Cloud history sync",
      "Job grade assessment",
      "Real-time optimization",
      "Email support",
      "Advanced chat features",
      "Resume builder with AI",
      "Salary negotiation assistant",
      "Priority customer support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and recruiters managing multiple candidates.",
    features: [
      "Everything in Pro",
      "Team collaboration tools",
      "Bulk processing",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "Custom AI training",
      "White-label solution",
      "Advanced analytics",
      "Priority phone support",
      "Custom reporting",
    ],
    cta: "Contact Sales",
  },
];

export function Pricing() {
  const { t } = useTranslations();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);

  const handleProClick = () => {
    if (!isAuthenticated) {
      router.push("/auth/signup?redirect=checkout");
      return;
    }
  };

  return (
    <section
      id="pricing"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0b0b] text-white pb-20"
    >
      <div className="max-w-7xl mx-auto w-full text-center mb-14">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
          {t('pricing.title')}
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
          {t('pricing.subtitle')}
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center p-1 bg-neutral-900/50 border border-neutral-700/50 rounded-full backdrop-blur-md">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 text-sm rounded-full transition ${
              !isYearly
                ? "bg-white/10 text-white shadow"
                : "text-neutral-400 hover:text-white"
            }`}
            >
              {t('pricing.monthly')}
            </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 text-sm rounded-full transition ${
              isYearly
                ? "bg-white/10 text-white shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
              {t('pricing.yearly')}
            <span className="ml-2 text-green-400 text-xs">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 2xl:gap-12 max-w-7xl mx-auto items-stretch">
        {plans.map((plan, index) => (
          <GlassCard
            key={index}
            className={`p-6 lg:p-8 rounded-xl border backdrop-blur-xl h-full flex flex-col transition ${
              index === 1
                ? "border-neutral-600/60 ring-1 ring-neutral-500/30 scale-[1.03]"
                : "border-neutral-800/40 hover:border-neutral-700/60"
            }`}
          >
            <div className="text-center mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                {plan.name}
              </h3>

              <div className="flex justify-center items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">
                  {plan.price === "Custom"
                    ? plan.price
                    : `$${index === 1 && isYearly ? plan.yearlyPrice : plan.price}`}
                </span>
                {plan.period && (
                  <span className="text-sm text-neutral-500">
                    /{index === 1 && isYearly ? "year" : plan.period}
                  </span>
                )}
              </div>

              <p className="text-neutral-400 text-sm leading-relaxed">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-2 text-sm text-neutral-300 grow">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-neutral-500 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {index === 1 ? (
                isAuthenticated ? (
                  <CheckoutButton
                    plan="pro"
                    billingCycle={isYearly ? "yearly" : "monthly"}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-white"
                  />
                ) : (
                  <Button
                    onClick={handleProClick}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-white"
                  >
                    {plan.cta}
                  </Button>
                )
              ) : (
                <Link href="/auth/signup">
                  <Button className="w-full bg-neutral-800/80 hover:bg-neutral-700 text-white">
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
