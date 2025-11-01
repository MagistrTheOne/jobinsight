"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  Settings, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Mail,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AutomationAction {
  id: string;
  trigger: string;
  action: string;
  status: 'pending' | 'completed' | 'failed';
  executedAt?: string;
  result?: string;
}

interface PipelineRule {
  id: string;
  name: string;
  trigger: string;
  conditions: any;
  actions: string[];
  isActive: boolean;
}

export function PipelineAutomation() {
  const [rules, setRules] = useState<PipelineRule[]>([]);
  const [recentActions, setRecentActions] = useState<AutomationAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRules();
    loadRecentActions();
  }, []);

  const loadRules = async () => {
    try {
      const response = await fetch('/api/automation/pipeline-rules');
      const data = await response.json();
      if (data.success) {
        setRules(data.rules || []);
      }
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentActions = async () => {
    try {
      const response = await fetch('/api/automation/recent-actions');
      const data = await response.json();
      if (data.success) {
        setRecentActions(data.actions || []);
      }
    } catch (err) {
      console.error('Failed to load recent actions:', err);
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/automation/pipeline-rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();
      if (data.success) {
        await loadRules();
      }
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const getTriggerIcon = (trigger: string) => {
    const icons: Record<string, any> = {
      status_change: <CheckCircle2 className="h-4 w-4" />,
      email_received: <Mail className="h-4 w-4" />,
      follow_up_due: <Clock className="h-4 w-4" />,
      offer_received: <CheckCircle2 className="h-4 w-4" />,
    };
    return icons[trigger] || <Zap className="h-4 w-4" />;
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      send_email: 'bg-blue-900/30 text-blue-300',
      update_status: 'bg-green-900/30 text-green-300',
      create_reminder: 'bg-yellow-900/30 text-yellow-300',
      generate_response: 'bg-purple-900/30 text-purple-300',
    };
    return colors[action] || 'bg-neutral-800/50 text-neutral-300';
  };

  return (
    <div className="space-y-6">
      <GlassCard variant="accent">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Zap className="mr-3 h-6 w-6 text-yellow-500" />
              Pipeline Automation
            </h2>
            <p className="text-neutral-400 mt-1">
              Automate your job application pipeline with intelligent triggers and actions
            </p>
          </div>
          <Badge className="bg-linear-to-r from-yellow-600 to-orange-600 border-0">
            <Settings className="h-3 w-3 mr-1" />
            AUTO
          </Badge>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation Rules */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Automation Rules</h3>
            <Button className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Settings className="mr-2 h-4 w-4" />
              New Rule
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No automation rules configured</p>
              <p className="text-sm mt-2">Create rules to automate your application pipeline</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <GlassCard key={rule.id} variant="muted" className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTriggerIcon(rule.trigger)}
                        <h4 className="font-semibold text-white">{rule.name}</h4>
                      </div>
                      <p className="text-xs text-neutral-400 mb-2">When: {rule.trigger.replace('_', ' ')}</p>
                      <div className="flex flex-wrap gap-2">
                        {rule.actions.map((action, idx) => (
                          <Badge key={idx} className={`${getActionBadge(action)} text-xs`}>
                            {action.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <Label className="text-sm text-neutral-300">Active</Label>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => toggleRule(rule.id, rule.isActive)}
                      />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Recent Actions */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-6">Recent Actions</h3>

          {recentActions.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No recent automation actions</p>
              <p className="text-sm mt-2">Actions will appear here when rules are triggered</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {recentActions.map((action) => (
                <div
                  key={action.id}
                  className="p-3 bg-black/40 border border-white/5 rounded-lg backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${
                          action.status === 'completed' 
                            ? 'bg-green-900/30 text-green-300'
                            : action.status === 'failed'
                            ? 'bg-red-900/30 text-red-300'
                            : 'bg-yellow-900/30 text-yellow-300'
                        } text-xs`}>
                          {action.status}
                        </Badge>
                        <span className="text-sm font-semibold text-white">
                          {action.action.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">Trigger: {action.trigger}</p>
                      {action.result && (
                        <p className="text-xs text-neutral-500 mt-1">{action.result}</p>
                      )}
                    </div>
                    {action.executedAt && (
                      <span className="text-xs text-neutral-500">
                        {new Date(action.executedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Default Rules Suggestions */}
      <GlassCard variant="muted">
        <h3 className="text-lg font-semibold text-white mb-4">Suggested Automation Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-black/40 border border-white/5 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-blue-400" />
              <h4 className="font-semibold text-white">Auto Follow-up</h4>
            </div>
            <p className="text-sm text-neutral-400">
              Send follow-up email 7 days after applying if no response
            </p>
          </div>

          <div className="p-4 bg-black/40 border border-white/5 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <h4 className="font-semibold text-white">Status Updates</h4>
            </div>
            <p className="text-sm text-neutral-400">
              Update status when HR views application or sends email
            </p>
          </div>

          <div className="p-4 bg-black/40 border border-white/5 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-yellow-400" />
              <h4 className="font-semibold text-white">Interview Prep</h4>
            </div>
            <p className="text-sm text-neutral-400">
              Generate interview questions when status changes to "Interview"
            </p>
          </div>

          <div className="p-4 bg-black/40 border border-white/5 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-400" />
              <h4 className="font-semibold text-white">Reminders</h4>
            </div>
            <p className="text-sm text-neutral-400">
              Create reminders for follow-ups based on nextFollowUp date
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

