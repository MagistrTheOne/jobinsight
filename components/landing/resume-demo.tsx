"use client";

import { useState } from 'react';
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
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [showDemo, setShowDemo] = useState(true);

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

  if (!showDemo) return null;

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0b0b] text-white">
      <div className="container mx-auto max-w-3xl">
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

        <GlassCard className="p-5 sm:p-6 lg:p-7 bg-neutral-950/60 backdrop-blur-md border border-neutral-800/50">
          <div className="space-y-4">
            <div>
              <label htmlFor="demo-resume" className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                Resume Text <span className="text-neutral-500">(demo - 2-3 sentences)</span>
              </label>
              <Input
                id="demo-resume"
                type="text"
                placeholder="e.g., Senior Software Engineer with 5+ years in React, Node.js, TypeScript..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="h-11 sm:h-12 text-sm bg-neutral-950/80 border border-neutral-700/50 text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:border-neutral-500/50"
                disabled={isAnalyzing}
              />
            </div>

            <Button
              onClick={handleDemoAnalysis}
              disabled={!resumeText.trim() || resumeText.trim().length < 50 || isAnalyzing}
              className="w-full h-10 sm:h-11 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900/50 text-white text-sm font-medium"
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
          </div>

          {result && (
            <div className="mt-6 pt-6 border-t border-neutral-800/50 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white">Analysis Results</h3>
                <Badge className="bg-green-900/30 text-green-400 border-green-800/50 px-2.5 py-1 text-xs">
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
                <div className="space-y-2.5 pt-3 border-t border-neutral-800/50">
                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-300">Detected Keywords</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords.map((keyword, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-neutral-900/50 text-neutral-300 border-neutral-700/50 text-[10px] sm:text-xs px-2 py-0.5"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-800/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-neutral-800/50 hover:bg-neutral-900/50 text-xs sm:text-sm h-9"
                  onClick={() => {
                    setResult(null);
                    setResumeText('');
                  }}
                >
                  Try Another
                </Button>
              </div>
            </div>
          )}

          {!result && !isAnalyzing && resumeText.trim().length < 50 && (
            <div className="mt-4 pt-4 border-t border-neutral-800/50">
              <p className="text-xs text-neutral-500 text-center leading-relaxed">
                This is a demo preview. For full AI-powered analysis with detailed insights,{' '}
                <button
                  onClick={() => setShowDemo(false)}
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

