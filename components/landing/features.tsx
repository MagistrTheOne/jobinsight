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
