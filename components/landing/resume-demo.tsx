"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Loader2, 
  CheckCircle2, 
  TrendingUp,
  Sparkles,
  ArrowRight 
} from 'lucide-react';

interface DemoResult {
  atsScore: number;
  strengths: string[];
  improvements: string[];
  keywords: string[];
}

const sampleResults: DemoResult[] = [
  {
    atsScore: 85,
    strengths: ['Clear structure', 'Relevant keywords', 'Quantifiable achievements'],
    improvements: ['Add more technical skills', 'Include certifications'],
    keywords: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
  },
  {
    atsScore: 72,
    strengths: ['Good experience section', 'Professional format'],
    improvements: ['Optimize for ATS keywords', 'Add metrics to achievements'],
    keywords: ['Python', 'Django', 'PostgreSQL', 'Docker'],
  },
];

export function ResumeDemo() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);

  const handleDemoAnalysis = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    // Симулируем анализ (2-3 секунды)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Случайный результат из примеров
    const randomResult = sampleResults[Math.floor(Math.random() * sampleResults.length)];
    setResult(randomResult);
    setIsAnalyzing(false);
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0b0b] text-white min-h-[600px] sm:min-h-[700px] flex items-center overflow-safe animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
      <div className="container-global max-w-3xl w-full">
        <div className="text-center mb-8 sm:mb-10 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50 mb-3 sm:mb-4">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-xs sm:text-sm text-neutral-300 font-medium">Try It Out</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 tracking-tight">
            See It In Action
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Paste a snippet of your resume to get instant AI-powered feedback
          </p>
        </div>

        <GlassCard className="w-full p-6 sm:p-7 lg:p-8 bg-neutral-950/50 backdrop-blur-lg border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.03)] rounded-xl transition-all duration-300">
          <div className="space-y-4">
            <div>
              <label htmlFor="demo-resume" className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                Resume Text <span className="text-neutral-500">(demo - 2-3 sentences)</span>
              </label>
              <Input
                id="demo-resume"
                type="text"
                placeholder="e.g. Built scalable apps in React/Node, led 5 devs, increased conversion by 30%..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="h-11 sm:h-12 text-sm bg-neutral-950/80 border border-neutral-700/50 text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:border-neutral-500/50"
                disabled={isAnalyzing}
              />
            </div>

            <Button
              onClick={handleDemoAnalysis}
              disabled={!resumeText.trim() || resumeText.trim().length < 50 || isAnalyzing}
              className="w-full h-10 sm:h-11 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900/50 text-white text-sm font-medium transition-all duration-200"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>

            {isAnalyzing && (
              <div className="mt-4 pt-4 border-t border-neutral-800/30">
                <div className="w-full bg-neutral-800/40 rounded-full h-2 overflow-hidden">
                  <div className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '90%' }} />
                </div>
                <p className="text-xs text-neutral-500 text-center mt-2">AI analyzing your resume...</p>
              </div>
            )}
          </div>

          {result && (
            <div className="mt-6 pt-6 border-t border-neutral-800/50 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white">Analysis Results</h3>
                <Badge className="bg-green-600/10 text-green-400 border border-green-500/30 shadow-sm px-2.5 py-1 text-xs rounded-md">
                  ATS Score: {result.atsScore}%
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-semibold text-green-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {result.strengths.map((strength, idx) => (
                      <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5 text-[10px]">•</span>
                        <span className="leading-relaxed">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-semibold text-amber-400 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Improvements
                  </h4>
                  <ul className="space-y-1.5">
                    {result.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5 text-[10px]">•</span>
                        <span className="leading-relaxed">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.keywords.length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-neutral-800/30">
                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-300">Detected Keywords</h4>
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {result.keywords.map((keyword, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-white/5 text-white border-white/10 text-[10px] sm:text-xs px-2 py-0.5 rounded shadow-sm"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-neutral-800/30 space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-neutral-800/50 hover:bg-neutral-900/50 text-xs sm:text-sm h-9 transition-colors duration-200"
                  onClick={() => {
                    setResult(null);
                    setResumeText('');
                  }}
                >
                  Try Another
                </Button>
                <Button
                  onClick={() => router.push('/dashboard?tab=resume-analysis')}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-9 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Full Resume Analysis
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {!result && !isAnalyzing && resumeText.trim().length < 50 && (
            <div className="mt-4 pt-4 border-t border-neutral-800/50">
              <p className="text-xs text-neutral-500 text-center leading-relaxed">
                This is a demo preview. For full AI-powered analysis with detailed insights,{' '}
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="text-neutral-300 hover:text-white underline underline-offset-2 font-medium"
                >
                  sign up
                </button>
                .
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  );
}

