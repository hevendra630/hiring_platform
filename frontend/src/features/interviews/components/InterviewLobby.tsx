import { useState } from 'react';
import { useMyInterviews, useUpdateInterviewStatus, Interview } from '../api/useInterviews';
import { Loader2, Play, CheckCircle, Calendar, Video, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { InterviewAnalyticsModal } from './InterviewAnalyticsModal';

export function InterviewLobby() {
  const { data: interviews, isLoading } = useMyInterviews();
  const updateStatusMutation = useUpdateInterviewStatus();
  const [selectedAnalytics, setSelectedAnalytics] = useState<Interview | null>(null);

  const navigate = useNavigate();

  const handleStartInterview = async (id: string, scheduledAt?: string) => {
    if (scheduledAt) {
      const now = new Date();
      const scheduled = new Date(scheduledAt);
      const diffMinutes = (scheduled.getTime() - now.getTime()) / (1000 * 60);
      if (diffMinutes > 5) {
        toast.error(`You cannot start this interview yet. It is scheduled for ${scheduled.toLocaleString()}`);
        return;
      }
    }

    try {
      await updateStatusMutation.mutateAsync({ id, status: 'in_progress' });
      toast.success('Interview started! Launching environment...');
      navigate(`/candidate/interviews/${id}/chat`);
    } catch (error) {
      toast.error('Failed to start interview');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">My Interviews</h2>
        <p className="text-ink-muted text-sm mt-1">Manage and join your scheduled interview sessions.</p>
      </div>

      {interviews && interviews.length > 0 ? (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <div key={interview._id} className="bg-base-surface p-6 rounded-xl border border-base-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-ink">{interview.job?.title || 'Unknown Role'}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      interview.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                      interview.status === 'in_progress' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {interview.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-ink-muted text-sm">{interview.company?.name || 'Company Name'} • {interview.durationMinutes} Minutes</p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <span className="text-sm font-medium text-ink flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]" />
                    {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString() : 'Not scheduled'}
                  </span>
                  <span className="text-sm font-medium text-ink flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]" />
                    {interview.type === 'ai' ? 'AI Behavioral' : interview.type === 'coding' ? 'Technical Coding' : 'Combined AI + Coding'}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-auto">
                {interview.status === 'scheduled' && (
                  <button
                    onClick={() => handleStartInterview(interview._id, interview.scheduledAt)}
                    disabled={updateStatusMutation.isPending}
                    className="w-full sm:w-auto bg-primary shadow-neon text-white px-6 py-2 rounded-lg font-medium hover:bg-primary shadow-neon-hover transition-colors flex items-center justify-center gap-2"
                  >
                    {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Join Interview
                  </button>
                )}
                {interview.status === 'in_progress' && (
                  <button
                    onClick={() => navigate(`/candidate/interviews/${interview._id}/chat`)}
                    className="w-full sm:w-auto bg-red-500 shadow-neon text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 shadow-neon transition-colors flex items-center justify-center gap-2"
                  >
                    Resume Interview
                  </button>
                )}
                {interview.status === 'completed' && (
                  <div className="flex flex-col items-center sm:items-end gap-2">
                    <span className="text-green-500 font-medium flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Completed
                    </span>
                    <button
                      onClick={() => setSelectedAnalytics(interview)}
                      className="text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] hover:text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]-hover text-sm font-medium flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" /> View Analytics
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-base-surface rounded-xl border border-base-border">
          <Calendar className="w-12 h-12 text-ink-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ink mb-2">No interviews scheduled</h3>
          <p className="text-ink-muted max-w-sm mx-auto">When recruiters schedule an interview with you, they will appear here.</p>
        </div>
      )}

      {selectedAnalytics && (
        <InterviewAnalyticsModal
          interview={selectedAnalytics}
          onClose={() => setSelectedAnalytics(null)}
        />
      )}
    </div>
  );
}
