"use client";

import { GlassCard } from '@/components/ui/glass-card';

const featureSections = [
  {
    title: 'AI-Powered Resume Tools',
    subtitle: 'Optimize your resume with advanced AI analysis',
    features: [
      {
        title: 'ATS Compatibility Score',
        description:
          'Real-time analysis of your resume with ATS compatibility scoring and instant optimization recommendations.',
      },
      {
        title: 'Resume Optimization',
        description:
          'Get actionable recommendations to improve your resume based on job requirements and industry best practices.',
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
        title: 'Multiple Resume Versions',
        description:
          'Manage different versions of your resume for different job types, with templates and optimization tracking.',
      },
      {
        title: 'ATS Challenge Report',
        description:
          'Understand how ATS systems evaluate your resume and get insights to overcome automated filters effectively.',
      },
    ],
  },
  {
    title: 'Job Search Automation',
    subtitle: 'Streamline your entire job application process',
    features: [
      {
        title: 'Application Tracking System',
        description:
          'Track all your job applications in one place with status management, follow-up reminders, and detailed statistics.',
      },
      {
        title: 'Application Pipeline Automation',
        description:
          'Automate your entire application pipeline with intelligent triggers and actions. Set rules and let AI handle the rest.',
      },
      {
        title: 'AI Cover Letter Generator',
        description:
          'Generate personalized, ATS-optimized cover letters tailored to each job posting automatically.',
      },
      {
        title: 'AI Follow-up & Thank You Emails',
        description:
          'Generate professional follow-up emails after applying and personalized thank you letters after interviews with AI assistance.',
      },
      {
        title: 'Job Red Flag Detection',
        description:
          'Identify problematic job postings, unrealistic requirements, and potential warning signs before applying.',
      },
      {
        title: 'Job Grade Assessment',
        description:
          'Automatically determine job level (Junior/Middle/Senior) even with vague or misleading titles.',
      },
    ],
  },
  {
    title: 'Communication & Negotiation',
    subtitle: 'Professional communication tools powered by AI',
    features: [
      {
        title: 'HR Communication Autopilot',
        description:
          'AI-powered automatic email responses to HR. Analyze sentiment, detect intent, and generate professional replies automatically.',
      },
      {
        title: 'Salary Negotiation AI',
        description:
          'AI-powered salary negotiation assistant with market analysis, counter-offer generation, and strategic recommendations.',
      },
      {
        title: 'Interview Preparation & Practice',
        description:
          'AI-powered interview prep: generate practice questions, practice answers, and get real-time feedback on your responses.',
      },
    ],
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
        <div className="text-center mb-16 sm:mb-20 lg:mb-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Powerful Features for Your Job Search
          </h2>
          <p className="mt-4 text-sm sm:text-base md:text-lg lg:text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Everything you need to optimize your job applications and land your dream position.
          </p>
        </div>

        <div className="space-y-16 sm:space-y-20 lg:space-y-24">
          {featureSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-8 sm:space-y-10 lg:space-y-12">
              {/* Section Header */}
              <div className="text-center">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                  {section.title}
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-neutral-400 max-w-2xl mx-auto">
                  {section.subtitle}
                </p>
                <div className="mt-4 sm:mt-6 w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-neutral-600 to-transparent mx-auto" />
              </div>

              {/* Features Grid */}
              <div className="grid gap-responsive-md grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {section.features.map((feature, featureIndex) => (
                  <GlassCard
                    key={`${sectionIndex}-${featureIndex}`}
                    className="w-full p-6 sm:p-7 lg:p-8 flex flex-col justify-between border border-white/10 bg-white/5 backdrop-blur-lg rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.03)] hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                  >
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white leading-tight">
                        {feature.title}
                      </h4>
                      <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
