"use client";

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface InterviewPrepTabProps {
  applicationId?: string;
  jobTitle: string;
  company: string;
}

export function InterviewPrepTab({ applicationId, jobTitle, company }: InterviewPrepTabProps) {
  const [questions, setQuestions] = useState<string | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    setError(null);

    try {
      const response = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          jobDescription: `Позиция: ${jobTitle}\nКомпания: ${company}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      setQuestions(data.questions);
    } catch (err: any) {
      setError(err.message || 'Failed to generate questions');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!selectedQuestion || !userAnswer.trim()) {
      setError('Please select a question and provide an answer');
      return;
    }

    setIsEvaluating(true);
    setError(null);

    try {
      const response = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: selectedQuestion,
          answer: userAnswer,
          jobDescription: `Позиция: ${jobTitle}\nКомпания: ${company}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate answer');
      }

      setEvaluation(data.evaluation);
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate answer');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Parse questions from text (simple splitting)
  const parseQuestions = (text: string): string[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    return lines.filter(line => 
      line.trim().match(/^\d+[\.\)]/) || 
      line.trim().includes('?') ||
      line.trim().includes('Вопрос')
    );
  };

  const questionList = questions ? parseQuestions(questions) : [];

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-900/30 border-red-800/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Generate Questions Section */}
      <GlassCard>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center mb-1">
                <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                Interview Questions Generator
              </h3>
              <p className="text-sm text-gray-400">
                Generate practice questions based on the job description
              </p>
            </div>
            <Button
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions || !jobTitle || !company}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>

          {questions && (
            <div className="mt-4 p-4 bg-black/30 border border-white/10 rounded-lg">
              <Label className="text-white font-semibold mb-2 block">Generated Questions:</Label>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2 text-sm text-gray-300 whitespace-pre-wrap">
                  {questions}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Practice Answer Section */}
      {questions && (
        <GlassCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center mb-1">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
              Practice Your Answers
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Select a question, write your answer, and get AI feedback
            </p>

            <div className="space-y-3">
              <div>
                <Label className="text-white mb-2 block">Select Question:</Label>
                <ScrollArea className="h-[120px] border border-gray-700 rounded-lg p-3 bg-gray-900/50">
                  <div className="space-y-2">
                    {questionList.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedQuestion(q)}
                        className={`w-full text-left p-2 rounded text-sm transition-all ${
                          selectedQuestion === q
                            ? 'bg-blue-900/50 border border-blue-700 text-white'
                            : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {q.substring(0, 100)}{q.length > 100 ? '...' : ''}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {selectedQuestion && (
                <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <Label className="text-blue-300 text-sm font-semibold mb-1 block">Selected Question:</Label>
                  <p className="text-white text-sm">{selectedQuestion}</p>
                </div>
              )}

              <div>
                <Label htmlFor="answer" className="text-white mb-2 block">Your Answer:</Label>
                <Textarea
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Write your answer here... Use STAR method for behavioral questions (Situation, Task, Action, Result)"
                  rows={6}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              <Button
                onClick={handleEvaluateAnswer}
                disabled={isEvaluating || !selectedQuestion || !userAnswer.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Get AI Feedback
                  </>
                )}
              </Button>

              {evaluation && (
                <div className="mt-4 p-4 bg-black/30 border border-green-700/30 rounded-lg">
                  <Label className="text-green-300 font-semibold mb-2 block flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    AI Evaluation:
                  </Label>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">
                      {evaluation}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {!questions && (
        <GlassCard variant="muted">
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-500 opacity-50" />
            <p className="text-gray-400">
              Generate interview questions to start practicing
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

