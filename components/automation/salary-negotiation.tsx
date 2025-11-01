"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  Send, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Brain,
  Target,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SalaryNegotiation {
  id: string;
  applicationId: string;
  initialOffer?: string;
  targetSalary?: string;
  currentOffer?: string;
  marketAverage?: string;
  negotiationStage: 'initial' | 'counter_offered' | 'negotiating' | 'accepted' | 'declined';
  aiRecommendation?: string;
  counterOfferDraft?: string;
  notes?: string;
  application?: {
    title: string;
    company: string;
  };
}

interface Application {
  id: string;
  title: string;
  company: string;
  status: string;
}

export function SalaryNegotiationAI() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [negotiation, setNegotiation] = useState<SalaryNegotiation | null>(null);
  const [formData, setFormData] = useState({
    initialOffer: '',
    targetSalary: '',
    currentOffer: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (selectedApplication) {
      loadNegotiation(selectedApplication);
    }
  }, [selectedApplication]);

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/applications?status=offer');
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    }
  };

  const loadNegotiation = async (applicationId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/salary-negotiation/${applicationId}`);
      const data = await response.json();
      if (data.success && data.negotiation) {
        setNegotiation(data.negotiation);
        setFormData({
          initialOffer: data.negotiation.initialOffer || '',
          targetSalary: data.negotiation.targetSalary || '',
          currentOffer: data.negotiation.currentOffer || '',
        });
      } else {
        // Create new negotiation
        setNegotiation(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load negotiation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeMarket = async () => {
    if (!selectedApplication || !formData.targetSalary) {
      setError('Please select an application and enter target salary');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/salary-negotiation/analyze-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApplication,
          targetSalary: formData.targetSalary,
          initialOffer: formData.initialOffer,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNegotiation(prev => ({
          ...prev,
          marketAverage: data.marketAverage,
          aiRecommendation: data.recommendation,
        } as SalaryNegotiation));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze market');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCounterOffer = async () => {
    if (!selectedApplication || !formData.initialOffer || !formData.targetSalary) {
      setError('Please fill in initial offer and target salary');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/salary-negotiation/generate-counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApplication,
          initialOffer: formData.initialOffer,
          targetSalary: formData.targetSalary,
          marketAverage: negotiation?.marketAverage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNegotiation(prev => ({
          ...prev,
          counterOfferDraft: data.counterOffer,
          aiRecommendation: data.recommendation,
        } as SalaryNegotiation));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate counter-offer');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNegotiation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/salary-negotiation', {
        method: negotiation ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: negotiation?.id,
          applicationId: selectedApplication,
          ...formData,
          marketAverage: negotiation?.marketAverage,
          counterOfferDraft: negotiation?.counterOfferDraft,
          aiRecommendation: negotiation?.aiRecommendation,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await loadNegotiation(selectedApplication);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save negotiation');
    } finally {
      setIsLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      initial: 'bg-gray-800/50 text-gray-300',
      counter_offered: 'bg-blue-900/30 text-blue-300',
      negotiating: 'bg-yellow-900/30 text-yellow-300',
      accepted: 'bg-green-900/30 text-green-300',
      declined: 'bg-red-900/30 text-red-300',
    };
    return colors[stage] || colors.initial;
  };

  const selectedApp = applications.find(a => a.id === selectedApplication);

  return (
    <div className="space-y-6">
      <GlassCard variant="accent">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <DollarSign className="mr-3 h-6 w-6 text-green-500" />
              Salary Negotiation AI
            </h2>
            <p className="text-gray-400 mt-1">
              AI-powered salary negotiation assistant with market analysis and counter-offer generation
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 border-0">
            <Brain className="h-3 w-3 mr-1" />
            AI-POWERED
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900/30 border-red-800/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Negotiation Setup</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2 block">Select Application</Label>
              <Select value={selectedApplication} onValueChange={setSelectedApplication}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue placeholder="Choose an application with offer" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.company} - {app.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedApp && (
              <>
                <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <p className="text-sm text-blue-300 font-semibold">{selectedApp.company}</p>
                  <p className="text-xs text-gray-400">{selectedApp.title}</p>
                </div>

                <div>
                  <Label htmlFor="initialOffer" className="text-white mb-2 block">
                    Initial Offer (from HR)
                  </Label>
                  <Input
                    id="initialOffer"
                    value={formData.initialOffer}
                    onChange={(e) => setFormData({ ...formData, initialOffer: e.target.value })}
                    placeholder="$100,000"
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="targetSalary" className="text-white mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Your Target Salary
                  </Label>
                  <Input
                    id="targetSalary"
                    value={formData.targetSalary}
                    onChange={(e) => setFormData({ ...formData, targetSalary: e.target.value })}
                    placeholder="$120,000"
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="currentOffer" className="text-white mb-2 block">
                    Current Offer (if negotiating)
                  </Label>
                  <Input
                    id="currentOffer"
                    value={formData.currentOffer}
                    onChange={(e) => setFormData({ ...formData, currentOffer: e.target.value })}
                    placeholder="$110,000"
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAnalyzeMarket}
                    disabled={isGenerating || !formData.targetSalary}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Analyze Market
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleGenerateCounterOffer}
                    disabled={isGenerating || !formData.initialOffer || !formData.targetSalary}
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Counter
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  onClick={handleSaveNegotiation}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Negotiation'
                  )}
                </Button>
              </>
            )}
          </div>
        </GlassCard>

        {/* AI Recommendations Section */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Brain className="mr-2 h-5 w-5 text-purple-500" />
            AI Recommendations
          </h3>

          {negotiation && (
            <div className="space-y-4">
              {negotiation.negotiationStage && (
                <div className="flex items-center justify-between p-3 bg-black/30 border border-gray-700 rounded-lg">
                  <span className="text-sm text-gray-400">Negotiation Stage:</span>
                  <Badge className={getStageColor(negotiation.negotiationStage)}>
                    {negotiation.negotiationStage.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              )}

              {negotiation.marketAverage && (
                <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-blue-300 font-semibold flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Market Average
                    </Label>
                  </div>
                  <p className="text-2xl font-bold text-white">{negotiation.marketAverage}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Based on job title, location, and experience level
                  </p>
                </div>
              )}

              {negotiation.aiRecommendation && (
                <div className="p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                  <Label className="text-purple-300 font-semibold mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI Strategy Recommendation
                  </Label>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {negotiation.aiRecommendation}
                  </p>
                </div>
              )}

              {negotiation.counterOfferDraft && (
                <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-green-300 font-semibold flex items-center">
                      <Send className="h-4 w-4 mr-1" />
                      Counter-Offer Draft
                    </Label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-700 text-green-300 hover:bg-green-900/30"
                      onClick={() => navigator.clipboard.writeText(negotiation.counterOfferDraft!)}
                    >
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={negotiation.counterOfferDraft}
                    readOnly
                    rows={8}
                    className="bg-black/30 border-gray-700 text-white mt-2"
                  />
                </div>
              )}

              {!negotiation.marketAverage && !negotiation.aiRecommendation && !negotiation.counterOfferDraft && (
                <div className="text-center py-12 text-gray-400">
                  <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Analyze market or generate counter-offer to see AI recommendations</p>
                </div>
              )}
            </div>
          )}

          {!negotiation && selectedApplication && (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Fill in the form and click "Analyze Market" or "Generate Counter"</p>
            </div>
          )}

          {!selectedApplication && (
            <div className="text-center py-12 text-gray-400">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select an application with an offer to start negotiation</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

