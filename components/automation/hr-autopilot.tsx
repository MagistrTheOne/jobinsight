"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Mail, 
  Zap, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailThread {
  id: string;
  applicationId: string;
  subject: string;
  fromEmail: string;
  toEmail: string;
  lastMessageDate: string;
  unreadCount: number;
  isAutomated: boolean;
  application?: {
    title: string;
    company: string;
    status: string;
  };
}

interface EmailMessage {
  id: string;
  threadId: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  isIncoming: boolean;
  isAutomated: boolean;
  aiSuggestion?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  intent?: string;
  needsResponse: boolean;
  createdAt: string;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  isActive: boolean;
  actions: any[];
}

export function HRAutopilot() {
  const [emailThreads, setEmailThreads] = useState<EmailThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('threads');

  useEffect(() => {
    loadEmailThreads();
    loadAutomationRules();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadThreadMessages(selectedThread.id);
    }
  }, [selectedThread]);

  const loadEmailThreads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/automation/email-threads');
      const data = await response.json();
      if (data.success) {
        setEmailThreads(data.threads || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load email threads');
    } finally {
      setIsLoading(false);
    }
  };

  const loadThreadMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/automation/email-threads/${threadId}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
    }
  };

  const loadAutomationRules = async () => {
    try {
      const response = await fetch('/api/automation/rules');
      const data = await response.json();
      if (data.success) {
        setAutomationRules(data.rules || []);
      }
    } catch (err: any) {
      console.error('Failed to load automation rules:', err);
    }
  };

  const handleGenerateAIResponse = async (message: EmailMessage) => {
    setIsGeneratingResponse(true);
    try {
      const response = await fetch('/api/automation/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          threadId: message.threadId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update message with AI suggestion
        setMessages(messages.map(m => 
          m.id === message.id 
            ? { ...m, aiSuggestion: data.suggestion, sentiment: data.sentiment, intent: data.intent }
            : m
        ));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI response');
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleSendAutoResponse = async (message: EmailMessage, suggestion: string) => {
    try {
      const response = await fetch('/api/automation/send-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          threadId: message.threadId,
          responseText: suggestion,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await loadThreadMessages(selectedThread!.id);
        await loadEmailThreads();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send response');
    }
  };

  const toggleAutomationRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/automation/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();
      if (data.success) {
        await loadAutomationRules();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle rule');
    }
  };

  const getIntentColor = (intent?: string) => {
    if (!intent) return 'bg-neutral-800/50';
    const colors: Record<string, string> = {
      interview_request: 'bg-green-900/30 text-green-300',
      rejection: 'bg-red-900/30 text-red-300',
      offer: 'bg-blue-900/30 text-blue-300',
      question: 'bg-yellow-900/30 text-yellow-300',
      follow_up: 'bg-purple-900/30 text-purple-300',
    };
    return colors[intent] || 'bg-neutral-800/50 text-neutral-300';
  };

  const getSentimentIcon = (sentiment?: string) => {
    if (sentiment === 'positive') return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (sentiment === 'negative') return <AlertCircle className="h-4 w-4 text-red-400" />;
    return <MessageSquare className="h-4 w-4 text-neutral-400" />;
  };

  return (
    <div className="space-y-6">
      <GlassCard variant="accent">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Bot className="mr-3 h-6 w-6 text-purple-500" />
              HR Communication Autopilot
            </h2>
            <p className="text-neutral-400 mt-1">
              AI-powered automatic email responses and HR communication management
            </p>
          </div>
          <Badge className="bg-linear-to-r from-purple-600 to-pink-600 border-0">
            <Zap className="h-3 w-3 mr-1" />
            BETA
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900/30 border-red-800/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}
      </GlassCard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border-white/5 backdrop-blur-xl">
          <TabsTrigger value="threads" className="text-neutral-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <Mail className="h-4 w-4 mr-2" />
            Email Threads
          </TabsTrigger>
          <TabsTrigger value="automation" className="text-neutral-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <Settings className="h-4 w-4 mr-2" />
            Automation Rules
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-neutral-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <TrendingUp className="h-4 w-4 mr-2" />
            Stats
          </TabsTrigger>
        </TabsList>

        {/* Email Threads Tab */}
        <TabsContent value="threads" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Threads List */}
            <div className="lg:col-span-1">
              <GlassCard>
                <h3 className="text-lg font-semibold text-white mb-4">Conversations</h3>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                ) : emailThreads.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400">
                    <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No email threads yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {emailThreads.map((thread) => (
                        <button
                          key={thread.id}
                          onClick={() => setSelectedThread(thread)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            selectedThread?.id === thread.id
                              ? 'bg-blue-900/30 border-blue-700/50 text-white'
                              : 'bg-black/40 border-white/5 text-neutral-300 hover:bg-black/50 hover:text-white hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{thread.application?.company || 'Unknown'}</p>
                              <p className="text-xs text-neutral-400 truncate">{thread.application?.title || thread.subject}</p>
                            </div>
                            {thread.unreadCount > 0 && (
                              <Badge className="bg-blue-600 text-white text-xs ml-2">
                                {thread.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-neutral-500">
                              {format(new Date(thread.lastMessageDate), 'MMM d')}
                            </span>
                            {thread.isAutomated && (
                              <Bot className="h-3 w-3 text-purple-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </GlassCard>
            </div>

            {/* Messages View */}
            <div className="lg:col-span-2">
              {selectedThread ? (
                <GlassCard>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedThread.application?.company}</h3>
                      <p className="text-sm text-neutral-400">{selectedThread.application?.title}</p>
                    </div>
                    <Badge className={getIntentColor(messages[0]?.intent)}>
                      {messages[0]?.intent || 'Unknown'}
                    </Badge>
                  </div>

                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-lg border ${
                            message.isIncoming
                              ? 'bg-black/40 border-white/5'
                              : 'bg-blue-900/20 border-blue-700/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">
                                {message.isIncoming ? 'From HR' : 'You'}
                              </span>
                              {message.isAutomated && (
                                <Badge variant="outline" className="text-xs border-purple-600 text-purple-400">
                                  <Bot className="h-3 w-3 mr-1" />
                                  Auto
                                </Badge>
                              )}
                              {message.sentiment && getSentimentIcon(message.sentiment)}
                            </div>
                            <span className="text-xs text-neutral-500">
                              {format(new Date(message.createdAt), 'MMM d, HH:mm')}
                            </span>
                          </div>

                          <p className="text-sm text-neutral-300 whitespace-pre-wrap mb-3">{message.body}</p>

                          {message.isIncoming && message.needsResponse && (
                            <div className="mt-4 p-3 bg-black/30 border border-yellow-700/30 rounded-lg">
                              {message.aiSuggestion ? (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <Label className="text-yellow-300 font-semibold text-sm flex items-center">
                                      <Sparkles className="h-4 w-4 mr-1" />
                                      AI Suggestion:
                                    </Label>
                                    <Button
                                      size="sm"
                                      onClick={() => handleSendAutoResponse(message, message.aiSuggestion!)}
                                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                                    >
                                      <Send className="h-3 w-3 mr-1" />
                                      Send
                                    </Button>
                                  </div>
                                  <p className="text-sm text-neutral-300 whitespace-pre-wrap">{message.aiSuggestion}</p>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => handleGenerateAIResponse(message)}
                                  disabled={isGeneratingResponse}
                                  variant="outline"
                                  className="w-full border-yellow-700 text-yellow-300 hover:bg-yellow-900/20"
                                >
                                  {isGeneratingResponse ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="mr-2 h-4 w-4" />
                                      Generate AI Response
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </GlassCard>
              ) : (
                <GlassCard>
                  <div className="text-center py-12 text-neutral-400">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to view messages</p>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Automation Rules Tab */}
        <TabsContent value="automation" className="space-y-4">
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Automation Rules</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Configure automatic actions based on triggers
                </p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Zap className="mr-2 h-4 w-4" />
                New Rule
              </Button>
            </div>

            <div className="space-y-3">
              {automationRules.map((rule) => (
                <GlassCard key={rule.id} variant="muted" className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{rule.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {rule.trigger}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-400">
                        {rule.actions.length} action(s) configured
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label className="text-sm text-neutral-300">Active</Label>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => toggleAutomationRule(rule.id, rule.isActive)}
                      />
                    </div>
                  </div>
                </GlassCard>
              ))}

              {automationRules.length === 0 && (
                <div className="text-center py-12 text-neutral-400">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No automation rules configured yet</p>
                  <p className="text-sm mt-2">Create rules to automate your HR communications</p>
                </div>
              )}
            </div>
          </GlassCard>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <GlassCard variant="muted" className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {emailThreads.length}
              </div>
              <div className="text-sm text-neutral-400">Total Threads</div>
            </GlassCard>
            <GlassCard variant="muted" className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {emailThreads.reduce((sum, t) => sum + t.unreadCount, 0)}
              </div>
              <div className="text-sm text-neutral-400">Unread Messages</div>
            </GlassCard>
            <GlassCard variant="muted" className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {emailThreads.filter(t => t.isAutomated).length}
              </div>
              <div className="text-sm text-neutral-400">Auto-Responded</div>
            </GlassCard>
            <GlassCard variant="muted" className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {automationRules.filter(r => r.isActive).length}
              </div>
              <div className="text-sm text-neutral-400">Active Rules</div>
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

