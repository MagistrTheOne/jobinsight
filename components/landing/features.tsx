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
    <section
      id="features"
      aria-label="Job seeker AI features"
      className="w-full py-responsive-lg bg-[#0b0b0b] text-white overflow-safe"
    >
      <div className="container-global w-full max-w-responsive-7xl mx-auto">
        <div className="text-center mb-14 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Powerful Features for Your Job Search
          </h2>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to optimize your job applications and land your dream position.
          </p>
        </div>

        <div className="grid gap-responsive-md grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {features.map((feature, index) => (
            <GlassCard
              key={index}
              className="w-full p-5 md:p-6 flex flex-col justify-between border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:shadow-[0_0_12px_rgba(255,255,255,0.05)] hover:border-white/20 transition-all duration-300 hover:scale-[1.015]"
            >
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
