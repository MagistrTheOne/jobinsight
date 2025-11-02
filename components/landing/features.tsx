"use client";

import { GlassCard } from '@/components/ui/glass-card';

const features = [
  {
    title: 'HR Communication Autopilot',
    description:
      'AI-powered automatic email responses to HR. Analyze sentiment, detect intent, and generate professional replies automatically.',
  },
  {
    title: 'Application Pipeline Automation',
    description:
      'Automate your entire application pipeline with intelligent triggers and actions. Set rules and let AI handle the rest.',
  },
  {
    title: 'Salary Negotiation AI',
    description:
      'AI-powered salary negotiation assistant with market analysis, counter-offer generation, and strategic recommendations.',
  },
  {
    title: 'Application Tracking System',
    description:
      'Track all your job applications in one place with status management, follow-up reminders, and detailed statistics.',
  },
  {
    title: 'AI Follow-up & Thank You Emails',
    description:
      'Generate professional follow-up emails after applying and personalized thank you letters after interviews with AI assistance.',
  },
  {
    title: 'Interview Preparation & Practice',
    description:
      'AI-powered interview prep: generate practice questions, practice answers, and get real-time feedback on your responses.',
  },
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
    title: 'Multiple Resume Versions',
    description:
      'Manage different versions of your resume for different job types, with templates and optimization tracking.',
  },
  {
    title: 'Job Grade Assessment',
    description:
      'Automatically determine job level (Junior/Middle/Senior) even with vague or misleading titles.',
  },
  {
    title: 'Skills Gap Analysis',
    description:
      'Identify missing skills and get personalized recommendations to bridge the gap between your resume and job requirements.',
  },
  {
    title: 'Impact-Based Optimization',
    description:
      'Focus on impact, not just project count. Get AI-powered suggestions to showcase measurable results and achievements.',
  },
  {
    title: 'ATS Challenge Report',
    description:
      'Understand how ATS systems evaluate your resume and get insights to overcome automated filters effectively.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 lg:px-8 bg-[#0b0b0b] text-white min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex items-center">
      <div className="container mx-auto max-w-7xl w-full">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 tracking-tight px-2">
            Powerful Features for Your Job Search
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed px-3">
            Everything you need to optimize your job applications and land your dream position.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {features.map((feature, index) => (
            <GlassCard
              key={index}
              className="p-4 sm:p-5 md:p-6 lg:p-7 bg-neutral-950/60 backdrop-blur-sm border border-neutral-800/50 rounded-lg hover:border-neutral-700/50 transition-all duration-300 h-full flex flex-col"
            >
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1.5 sm:mb-2 md:mb-3 text-white leading-snug">
                {feature.title}
              </h3>
              <p className="text-[11px] sm:text-xs md:text-sm text-neutral-400 leading-relaxed flex-grow">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
