"use client";

import { GlassCard } from '@/components/ui/glass-card';

const features = [
  {
    title: 'Job Red Flag Detection',
    description:
      'Identify problematic job postings, unrealistic requirements, and potential warning signs before applying.',
  },
  {
    title: 'ATS Compatibility Score',
    description:
      'Real-time analysis of your resume with ATS compatibility scoring and instant optimization recommendations.',
  },
  {
    title: 'AI Cover Letter Generator',
    description:
      'Generate personalized, ATS-optimized cover letters tailored to each job posting automatically.',
  },
  {
    title: 'Resume Optimization',
    description:
      'Get actionable recommendations to improve your resume based on job requirements and industry best practices.',
  },
  {
    title: 'Job Grade Assessment',
    description:
      'Automatically determine job level (Junior/Middle/Senior) even with vague or misleading titles.',
  },
  {
    title: 'Real-time Processing',
    description:
      'Instant analysis and optimization with lightning-fast AI processing.',
  },
  {
    title: 'Keyword Optimization',
    description:
      'Identify missing keywords and skills to maximize your chances of passing ATS filters.',
  },
  {
    title: 'Smart Recommendations',
    description:
      'Receive intelligent suggestions on skills to highlight, experience to emphasize, and improvements to make.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0b0b] text-white min-h-[600px] sm:min-h-[700px] flex items-center">
      <div className="container mx-auto max-w-7xl w-full">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 px-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">
            Powerful Features for Your Job Search
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to optimize your job applications and land your dream position.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {features.map((feature, index) => (
            <GlassCard
              key={index}
              className="p-5 sm:p-6 lg:p-7 bg-neutral-950/60 backdrop-blur-sm border border-neutral-800/50 rounded-lg hover:border-neutral-700/50 transition-all duration-300 h-full flex flex-col"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white leading-snug">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed flex-grow">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
