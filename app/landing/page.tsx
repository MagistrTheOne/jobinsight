"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LandingNav } from '@/components/landing/nav';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { ResumeDemo } from '@/components/landing/resume-demo';
import { Pricing } from '@/components/landing/pricing';
import { Footer } from '@/components/landing/footer';
import { SectionDivider } from '@/components/landing/section-divider';
import { useAuthStore } from '@/store/auth-store';

export default function LandingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const action = searchParams.get('action');

  // Redirect to dashboard only if there's an action parameter
  useEffect(() => {
    if (isAuthenticated && action) {
      if (action === 'job') {
        router.push('/dashboard?tab=job-analysis');
      } else if (action === 'resume') {
        router.push('/dashboard?tab=resume-analysis');
      }
    }
  }, [isAuthenticated, action, router]);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <LandingNav />
      <Hero />
      <SectionDivider />
      <Features />
      <SectionDivider />
      <ResumeDemo />
      <SectionDivider />
      <Pricing />
      <Footer />
    </div>
  );
}

