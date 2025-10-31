"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/glass-card';
import { Card, CardContent } from '@/components/ui/card';
import { Loader as Loader2, Copy, Download } from 'lucide-react';
import { UserInfo } from '@/lib/types';

interface CoverLetterGeneratorProps {
  jobUrl?: string;
  jobContent?: string;
  onGenerate: (userInfo: UserInfo, url?: string, content?: string) => void;
  isLoading: boolean;
  generatedLetter?: string;
}

export function CoverLetterGenerator({ 
  jobUrl, 
  jobContent, 
  onGenerate, 
  isLoading, 
  generatedLetter 
}: CoverLetterGeneratorProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
    experience: '',
    skills: [],
    education: ''
  });

  const [skillsInput, setSkillsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsInput.split(',').map(skill => skill.trim()).filter(Boolean);
    onGenerate({ ...userInfo, skills }, jobUrl, jobContent);
  };

  const copyToClipboard = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {!generatedLetter ? (
        <GlassCard>
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-white">
                Generate ATS-Optimized Cover Letter
              </h2>
              <p className="text-gray-300">
                Provide your information to create a personalized cover letter
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    placeholder="e.g., BS Computer Science"
                    value={userInfo.education}
                    onChange={(e) => setUserInfo({ ...userInfo, education: e.target.value })}
                    className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Work Experience Summary</Label>
                <Textarea
                  id="experience"
                  placeholder="Briefly describe your relevant work experience..."
                  value={userInfo.experience}
                  onChange={(e) => setUserInfo({ ...userInfo, experience: e.target.value })}
                  className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Key Skills (comma-separated)</Label>
                <Textarea
                  id="skills"
                  placeholder="JavaScript, React, Node.js, Python, etc."
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                  rows={2}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                disabled={isLoading || !userInfo.name}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Cover Letter...
                  </>
                ) : (
                  'Generate Cover Letter'
                )}
              </Button>
            </form>
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">
                Your ATS-Optimized Cover Letter
              </h3>
              <div className="flex space-x-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800/50 border-gray-600/50"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  onClick={() => {
                    const element = document.createElement('a');
                    const file = new Blob([generatedLetter], { type: 'text/plain' });
                    element.href = URL.createObjectURL(file);
                    element.download = 'cover-letter.txt';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800/50 border-gray-600/50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono">
                  {generatedLetter}
                </pre>
              </CardContent>
            </Card>

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Generate Another Cover Letter
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}