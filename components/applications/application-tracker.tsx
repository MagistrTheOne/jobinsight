"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Briefcase, 
  Calendar, 
  Building2, 
  ExternalLink,
  Filter,
  Star,
  StarOff,
  Plus,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { ApplicationDialog } from './application-dialog';

interface Application {
  id: string;
  title: string;
  company: string;
  status: 'saved' | 'applied' | 'viewed' | 'phone_screen' | 'interview' | 'technical_interview' | 'final_interview' | 'offer' | 'rejected' | 'withdrawn';
  appliedDate: string | null;
  applicationUrl: string | null;
  nextFollowUp: string | null;
  isFavorite: number;
  tags: string[] | null;
  salaryOffer: string | null;
  resumeVersion?: string | null;
  coverLetter?: string | null;
  notes?: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  saved: { label: 'Saved', color: 'text-neutral-400', bgColor: 'bg-neutral-800/50' },
  applied: { label: 'Applied', color: 'text-blue-400', bgColor: 'bg-blue-900/30' },
  viewed: { label: 'Viewed', color: 'text-purple-400', bgColor: 'bg-purple-900/30' },
  phone_screen: { label: 'Phone Screen', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30' },
  interview: { label: 'Interview', color: 'text-orange-400', bgColor: 'bg-orange-900/30' },
  technical_interview: { label: 'Technical', color: 'text-orange-500', bgColor: 'bg-orange-900/40' },
  final_interview: { label: 'Final Interview', color: 'text-pink-400', bgColor: 'bg-pink-900/30' },
  offer: { label: 'Offer', color: 'text-green-400', bgColor: 'bg-green-900/30' },
  rejected: { label: 'Rejected', color: 'text-red-400', bgColor: 'bg-red-900/30' },
  withdrawn: { label: 'Withdrawn', color: 'text-neutral-500', bgColor: 'bg-neutral-800/30' },
};

export function ApplicationTracker() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadApplications();
    loadStats();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter, searchQuery, favoriteOnly]);

  const loadApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/applications');
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications || []);
      } else {
        setError(data.error || 'Failed to load applications');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/applications?stats=true');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.title.toLowerCase().includes(query) ||
        app.company.toLowerCase().includes(query)
      );
    }

    // Favorite filter
    if (favoriteOnly) {
      filtered = filtered.filter(app => app.isFavorite === 1);
    }

    // Sort by appliedDate or createdAt
    filtered.sort((a, b) => {
      const dateA = a.appliedDate ? new Date(a.appliedDate).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.appliedDate ? new Date(b.appliedDate).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    setFilteredApplications(filtered);
  };

  const toggleFavorite = async (applicationId: string, currentFavorite: number) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentFavorite }),
      });
      if (response.ok) {
        await loadApplications();
        await loadStats();
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  const handleApplicationSaved = () => {
    loadApplications();
    loadStats();
    setIsDialogOpen(false);
    setSelectedApplication(null);
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.saved;
    return (
      <Badge className={`${config.bgColor} ${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getConversionRate = () => {
    if (!stats || !stats.byStatus) return 0;
    const applied = stats.byStatus.find((s: any) => s.status === 'applied')?.count || 0;
    const offers = stats.byStatus.find((s: any) => s.status === 'offer')?.count || 0;
    if (applied === 0) return 0;
    return ((offers / applied) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-12 animate-fade-in">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-sm text-neutral-400">Loading applications...</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassCard variant="muted">
            <div className="text-sm text-neutral-400 mb-1">Total Applications</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </GlassCard>
          <GlassCard variant="muted">
            <div className="text-sm text-neutral-400 mb-1">Applied</div>
            <div className="text-2xl font-bold text-blue-400">
              {stats.byStatus?.find((s: any) => s.status === 'applied')?.count || 0}
            </div>
          </GlassCard>
          <GlassCard variant="muted">
            <div className="text-sm text-neutral-400 mb-1">Interviews</div>
            <div className="text-2xl font-bold text-orange-400">
              {(stats.byStatus?.find((s: any) => s.status === 'interview')?.count || 0) +
               (stats.byStatus?.find((s: any) => s.status === 'technical_interview')?.count || 0) +
               (stats.byStatus?.find((s: any) => s.status === 'final_interview')?.count || 0)}
            </div>
          </GlassCard>
          <GlassCard variant="muted">
            <div className="text-sm text-neutral-400 mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold text-green-400">{getConversionRate()}%</div>
          </GlassCard>
        </div>
      )}

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-3 items-center w-full md:w-auto">
            <Input
              placeholder="Search by company or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white/30 focus:ring-1 focus:ring-white/10 backdrop-blur-sm"
            />
          </div>
          <div className="flex gap-3 items-center w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white hover:bg-white/15 backdrop-blur-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 backdrop-blur-xl border-white/10">
                <SelectItem value="all" className="text-white focus:bg-white/10">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="text-white focus:bg-white/10">{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={favoriteOnly ? 'default' : 'outline'}
              onClick={() => setFavoriteOnly(!favoriteOnly)}
              className={favoriteOnly ? 'bg-yellow-900/30 border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/40' : 'border-white/10 bg-white/5 hover:bg-white/10 text-white'}
            >
              <Star className={`h-4 w-4 ${favoriteOnly ? 'fill-current' : ''}`} />
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Applications List */}
      <GlassCard>
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {filteredApplications.length === 0 ? (
          <GlassCard className="py-12 animate-fade-in">
            <div className="text-center">
              <div className="p-4 rounded-full bg-linear-to-br from-blue-600/20 to-purple-600/20 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Briefcase className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No applications yet</h3>
              <p className="text-sm text-neutral-400 mb-6 max-w-md mx-auto">
                Start tracking your job search journey. Add your first application to see it here.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Add First Application
              </Button>
            </div>
          </GlassCard>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  onClick={() => handleApplicationClick(application)}
                  className="p-4 bg-black/40 border border-white/5 rounded-lg cursor-pointer hover:border-white/10 hover:bg-black/50 transition-all backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white text-lg truncate">
                          {application.title}
                        </h3>
                        {getStatusBadge(application.status)}
                        {application.isFavorite === 1 && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{application.company}</span>
                        </div>
                        {application.appliedDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(application.appliedDate), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        {application.nextFollowUp && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Clock className="h-3 w-3" />
                            <span>Follow-up: {format(new Date(application.nextFollowUp), 'MMM d')}</span>
                          </div>
                        )}
                        {application.salaryOffer && (
                          <div className="flex items-center gap-1 text-green-400">
                            <TrendingUp className="h-3 w-3" />
                            <span>{application.salaryOffer}</span>
                          </div>
                        )}
                      </div>
                      {application.tags && application.tags.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {application.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-neutral-800/50 border-neutral-700/50 text-neutral-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(application.id, application.isFavorite);
                        }}
                        className="text-neutral-400 hover:text-yellow-400"
                      >
                        {application.isFavorite === 1 ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                      {application.applicationUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(application.applicationUrl!, '_blank');
                          }}
                          className="text-neutral-400 hover:text-blue-400"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </GlassCard>

      {/* Application Dialog */}
      <ApplicationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        application={selectedApplication ? {
          id: selectedApplication.id,
          title: selectedApplication.title,
          company: selectedApplication.company,
          status: selectedApplication.status,
          appliedDate: selectedApplication.appliedDate,
          applicationUrl: selectedApplication.applicationUrl,
          resumeVersion: selectedApplication.resumeVersion || null,
          coverLetter: null,
          notes: null,
          salaryOffer: selectedApplication.salaryOffer,
          nextFollowUp: selectedApplication.nextFollowUp,
          isFavorite: selectedApplication.isFavorite,
          tags: selectedApplication.tags,
        } : null}
        onSaved={handleApplicationSaved}
      />
    </div>
  );
}

