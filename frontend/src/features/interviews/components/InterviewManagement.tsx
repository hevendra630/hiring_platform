import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { useMyInterviews, useScheduleInterview, Interview } from '../api/useInterviews';
import { useMyJobs } from '@/features/jobs/api/useJobs';
import { Loader2, Plus, Play, CheckCircle, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { InterviewAnalyticsModal } from './InterviewAnalyticsModal';

export function InterviewManagement() {
  const { data: interviews, isLoading } = useMyInterviews();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnalytics, setSelectedAnalytics] = useState<Interview | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-ink">Interview Pipeline</h2>
          <p className="text-ink-muted text-sm mt-1">Schedule and manage candidate interviews</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary shadow-neon text-white px-4 py-2 rounded-lg font-medium hover:bg-primary shadow-neon-hover transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Schedule Interview
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]" />
        </div>
      ) : interviews && interviews.length > 0 ? (
        <div className="bg-base-surface rounded-xl border border-base-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-base-background border-b border-base-border">
              <tr>
                <th className="px-6 py-4 font-medium text-ink-muted text-sm">Candidate</th>
                <th className="px-6 py-4 font-medium text-ink-muted text-sm">Role</th>
                <th className="px-6 py-4 font-medium text-ink-muted text-sm">Status</th>
                <th className="px-6 py-4 font-medium text-ink-muted text-sm">Type</th>
                <th className="px-6 py-4 font-medium text-ink-muted text-sm">Date & Time</th>
                <th className="px-6 py-4 font-medium text-ink-muted text-sm text-right">Score & Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-border">
              {interviews.map((interview) => (
                <tr key={interview._id} className="hover:bg-base-background/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-ink">{interview.candidate?.name || 'Unknown'}</p>
                    <p className="text-sm text-ink-muted">{interview.candidate?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-ink">{interview.job?.title || 'Unknown Role'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      interview.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                      interview.status === 'in_progress' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {interview.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-ink-muted capitalize flex items-center gap-2">
                      {interview.type === 'ai' && <Play className="w-4 h-4 text-purple-500" />}
                      {interview.type === 'coding' && <Code className="w-4 h-4 text-red-500" />}
                      {interview.type === 'combined' && <CheckCircle className="w-4 h-4 text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]" />}
                      {interview.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-ink-muted flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString() : 'Not set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {interview.status === 'completed' ? (
                      <div className="flex flex-col items-end gap-1">
                        {interview.overallScore !== undefined && (
                           <span className="font-bold text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">{interview.overallScore}/100</span>
                        )}
                        <button
                          onClick={() => setSelectedAnalytics(interview)}
                          className="text-xs text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> View Report
                        </button>
                      </div>
                    ) : (
                      <span className="text-ink-muted text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-base-surface rounded-xl border border-base-border">
          <h3 className="text-lg font-medium text-ink mb-2">No interviews scheduled</h3>
          <p className="text-ink-muted mb-6">Schedule an AI or coding interview for your candidates.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] font-medium hover:underline"
          >
            Schedule first interview
          </button>
        </div>
      )}

      {isModalOpen && <ScheduleModal onClose={() => setIsModalOpen(false)} />}
      
      {selectedAnalytics && (
        <InterviewAnalyticsModal
          interview={selectedAnalytics}
          onClose={() => setSelectedAnalytics(null)}
        />
      )}
    </div>
  );
}

// Simple Code icon since we missed importing it from lucide-react above
function Code(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
  )
}

function ScheduleModal({ onClose }: { onClose: () => void }) {
  const scheduleMutation = useScheduleInterview();
  const { data: jobs } = useMyJobs();
  const [formData, setFormData] = useState({
    candidate: '',
    job: '',
    type: 'combined',
    scheduledAt: '',
    durationMinutes: 45,
    difficulty: 'dynamic',
    tone: 'friendly'
  });

  const { data: applications, isLoading: isLoadingApps } = useQuery({
    queryKey: ['jobApplications', formData.job],
    queryFn: async () => {
      if (!formData.job) return [];
      const response = await apiClient.get(`/applications/job/${formData.job}`);
      return response.data.data;
    },
    enabled: !!formData.job,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await scheduleMutation.mutateAsync({
        candidate: formData.candidate,
        job: formData.job,
        type: formData.type,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        durationMinutes: formData.durationMinutes,
        aiPersona: {
          difficulty: formData.difficulty,
          tone: formData.tone
        }
      });
      toast.success('Interview scheduled successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to schedule interview');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-base-surface rounded-2xl w-full max-w-lg overflow-hidden border border-base-border shadow-2xl">
        <div className="p-6 border-b border-base-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-ink">Schedule Interview</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Select Job First</label>
            <select
              required
              className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary"
              value={formData.job}
              onChange={e => setFormData(f => ({ ...f, job: e.target.value, candidate: '' }))}
            >
              <option value="" disabled>-- Select a Job --</option>
              {jobs?.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Select Candidate</label>
            <select
              required
              disabled={!formData.job || isLoadingApps}
              className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary disabled:opacity-50"
              value={formData.candidate}
              onChange={e => setFormData(f => ({ ...f, candidate: e.target.value }))}
            >
              <option value="" disabled>
                {!formData.job ? '-- Select a Job First --' : isLoadingApps ? 'Loading candidates...' : '-- Select Candidate --'}
              </option>
              {applications?.map((app: any) => (
                <option key={app.candidate._id} value={app.candidate._id}>
                  {app.candidate.name} ({app.candidate.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Interview Type</label>
            <select
              className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary"
              value={formData.type}
              onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}
            >
              <option value="ai">AI Behavioral</option>
              <option value="coding">Technical Coding</option>
              <option value="combined">Combined (Full Loop)</option>
            </select>
          </div>

          {(formData.type === 'ai' || formData.type === 'combined') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-ink">AI Difficulty</label>
                <select
                  className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary"
                  value={formData.difficulty}
                  onChange={e => setFormData(f => ({ ...f, difficulty: e.target.value }))}
                >
                  <option value="easy">Easy / Junior</option>
                  <option value="dynamic">Dynamic (Adaptive)</option>
                  <option value="hard">Hard / Senior</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-ink">AI Tone</label>
                <select
                  className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary"
                  value={formData.tone}
                  onChange={e => setFormData(f => ({ ...f, tone: e.target.value }))}
                >
                  <option value="friendly">Friendly & Encouraging</option>
                  <option value="strict">Strict & Professional</option>
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Date & Time</label>
            <input
              type="datetime-local"
              required
              className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary"
              value={formData.scheduledAt}
              onChange={e => setFormData(f => ({ ...f, scheduledAt: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-base-border mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-ink-muted hover:text-ink font-medium transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={scheduleMutation.isPending}
              className="bg-primary shadow-neon text-white px-6 py-2 rounded-lg font-medium hover:bg-primary shadow-neon-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {scheduleMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
