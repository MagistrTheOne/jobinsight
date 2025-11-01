"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Mail, MessageSquare, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InterviewPrepTab } from './interview-prep-tab';

interface Application {
  id?: string;
  title: string;
  company: string;
  status: string;
  appliedDate: string | null;
  applicationUrl: string | null;
  resumeVersion: string | null;
  coverLetter: string | null;
  notes: string | null;
  salaryOffer: string | null;
  nextFollowUp: string | null;
  isFavorite: number;
  tags: string[] | null;
}

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: Application | null;
  onSaved: () => void;
  defaultData?: {
    title?: string;
    company?: string;
    url?: string;
    jobAnalysis?: any;
  };
}

const STATUS_OPTIONS = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'interview', label: 'Interview' },
  { value: 'technical_interview', label: 'Technical Interview' },
  { value: 'final_interview', label: 'Final Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export function ApplicationDialog({
  open,
  onOpenChange,
  application,
  onSaved,
  defaultData,
}: ApplicationDialogProps) {
  const [formData, setFormData] = useState<Partial<Application>>({
    title: '',
    company: '',
    status: 'saved',
    appliedDate: null,
    applicationUrl: null,
    resumeVersion: null,
    coverLetter: null,
    notes: null,
    salaryOffer: null,
    nextFollowUp: null,
    isFavorite: 0,
    tags: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [followUpEmail, setFollowUpEmail] = useState<{ subject: string; body: string } | null>(null);
  const [thankYouEmail, setThankYouEmail] = useState<{ subject: string; body: string } | null>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (open) {
      if (application) {
        setFormData({
          ...application,
          appliedDate: application.appliedDate ? new Date(application.appliedDate).toISOString().split('T')[0] : null,
          nextFollowUp: application.nextFollowUp ? new Date(application.nextFollowUp).toISOString().split('T')[0] : null,
        });
        setTagsInput(application.tags?.join(', ') || '');
      } else {
        // New application with default data
        setFormData({
          title: defaultData?.title || '',
          company: defaultData?.company || '',
          status: 'saved',
          applicationUrl: defaultData?.url || null,
          appliedDate: null,
          resumeVersion: null,
          coverLetter: null,
          notes: null,
          salaryOffer: null,
          nextFollowUp: null,
          isFavorite: 0,
          tags: null,
        });
        setTagsInput('');
      }
      setError(null);
    }
  }, [open, application, defaultData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const payload = {
        ...formData,
        appliedDate: formData.appliedDate || null,
        nextFollowUp: formData.nextFollowUp || null,
        tags: tags.length > 0 ? tags : [],
        isFavorite: formData.isFavorite || 0,
      };

      const url = application?.id ? `/api/applications/${application.id}` : '/api/applications';
      const method = application?.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save application');
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFollowUp = async () => {
    if (!formData.title || !formData.company) {
      setError('Title and company are required to generate email');
      return;
    }

    setIsGeneratingEmail(true);
    setError(null);

    try {
      const response = await fetch('/api/email/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application?.id,
          customNotes: formData.notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email');
      }

      setFollowUpEmail(data.email);
    } catch (err: any) {
      setError(err.message || 'Failed to generate follow-up email');
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleGenerateThankYou = async () => {
    if (!formData.title || !formData.company) {
      setError('Title and company are required to generate email');
      return;
    }

    setIsGeneratingEmail(true);
    setError(null);

    try {
      const response = await fetch('/api/email/thank-you', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application?.id,
          interviewDate: formData.appliedDate || new Date().toISOString().split('T')[0],
          interviewType: formData.status === 'phone_screen' ? 'phone_screen' : 
                        formData.status === 'technical_interview' ? 'technical_interview' :
                        formData.status === 'final_interview' ? 'final_interview' : 'interview',
          notes: formData.notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email');
      }

      setThankYouEmail(data.email);
    } catch (err: any) {
      setError(err.message || 'Failed to generate thank you email');
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {application ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Track your job application status and details
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/40 border-white/5 backdrop-blur-xl">
            <TabsTrigger value="details" className="text-neutral-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
              Details
            </TabsTrigger>
            <TabsTrigger value="emails" className="text-neutral-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
              <Mail className="h-4 w-4 mr-2" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="interview" className="text-neutral-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
              <MessageSquare className="h-4 w-4 mr-2" />
              Interview Prep
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/30 border-red-800/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Job Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white/30 focus:ring-1 focus:ring-white/10 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white">Company *</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white/30 focus:ring-1 focus:ring-white/10 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">Status</Label>
              <Select
                value={formData.status || 'saved'}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/95 backdrop-blur-xl border-white/10">
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white focus:bg-white/10">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appliedDate" className="text-white">Applied Date</Label>
              <Input
                id="appliedDate"
                type="date"
                value={formData.appliedDate || ''}
                onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value || null })}
                className="bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white/30 focus:ring-1 focus:ring-white/10 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationUrl" className="text-white">Application URL</Label>
            <Input
              id="applicationUrl"
              type="url"
              value={formData.applicationUrl || ''}
              onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value || null })}
              placeholder="https://..."
              className="bg-gray-800/50 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryOffer" className="text-white">Salary Offer</Label>
              <Input
                id="salaryOffer"
                value={formData.salaryOffer || ''}
                onChange={(e) => setFormData({ ...formData, salaryOffer: e.target.value || null })}
                placeholder="$100k - $120k"
                className="bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white/30 focus:ring-1 focus:ring-white/10 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextFollowUp" className="text-white">Next Follow-up</Label>
              <Input
                id="nextFollowUp"
                type="date"
                value={formData.nextFollowUp || ''}
                onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value || null })}
                className="bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white/30 focus:ring-1 focus:ring-white/10 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-white">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="dream-job, remote, urgent"
              className="bg-gray-800/50 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
              rows={3}
              placeholder="Add any notes about this application..."
              className="bg-gray-800/50 border-gray-700 text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFavorite"
              checked={formData.isFavorite === 1}
              onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked ? 1 : 0 })}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-yellow-500 focus:ring-yellow-500"
            />
            <Label htmlFor="isFavorite" className="text-white cursor-pointer">
              Mark as favorite
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-white/10 text-neutral-300 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Application'
              )}
            </Button>
          </DialogFooter>
          </form>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Follow-up Email
                </h3>
                <p className="text-sm text-neutral-400">
                  Generate a professional follow-up email to send after applying
                </p>
                <Button
                  onClick={handleGenerateFollowUp}
                  disabled={isGeneratingEmail || !formData.title || !formData.company}
                  className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGeneratingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Generate Follow-up Email
                    </>
                  )}
                </Button>
                {followUpEmail && (
                  <div className="mt-4 p-4 bg-black/30 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white font-semibold">Subject:</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyEmail(followUpEmail.subject + '\n\n' + followUpEmail.body)}
                        className="text-neutral-400 hover:text-white"
                      >
                        {copiedEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input
                      value={followUpEmail.subject}
                      readOnly
                      className="bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white/30 backdrop-blur-sm mb-3"
                    />
                    <Label className="text-white font-semibold mb-2 block">Body:</Label>
                    <Textarea
                      value={followUpEmail.body}
                      readOnly
                      rows={10}
                      className="bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white/30 focus:ring-1 focus:ring-white/10 backdrop-blur-sm"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Thank You Email
                </h3>
                <p className="text-sm text-neutral-400">
                  Generate a thank you email to send after an interview
                </p>
                <Button
                  onClick={handleGenerateThankYou}
                  disabled={isGeneratingEmail || !formData.title || !formData.company}
                  className="bg-linear-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  {isGeneratingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Generate Thank You Email
                    </>
                  )}
                </Button>
                {thankYouEmail && (
                  <div className="mt-4 p-4 bg-black/30 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white font-semibold">Subject:</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyEmail(thankYouEmail.subject + '\n\n' + thankYouEmail.body)}
                        className="text-neutral-400 hover:text-white"
                      >
                        {copiedEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input
                      value={thankYouEmail.subject}
                      readOnly
                      className="bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white/30 backdrop-blur-sm mb-3"
                    />
                    <Label className="text-white font-semibold mb-2 block">Body:</Label>
                    <Textarea
                      value={thankYouEmail.body}
                      readOnly
                      rows={10}
                      className="bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white/30 focus:ring-1 focus:ring-white/10 backdrop-blur-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interview">
            <InterviewPrepTab 
              applicationId={application?.id}
              jobTitle={formData.title || ''}
              company={formData.company || ''}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

