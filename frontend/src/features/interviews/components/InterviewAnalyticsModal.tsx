import { useState } from 'react';
import { X, Bot, User, CheckCircle, Brain, Target, TrendingUp, Mail, Loader2, Copy } from 'lucide-react';
import { Interview } from '../api/useInterviews';
import { apiClient } from '@/services/apiClient';
import toast from 'react-hot-toast';

interface InterviewAnalyticsModalProps {
  interview: Interview;
  onClose: () => void;
}

export function InterviewAnalyticsModal({ interview, onClose }: InterviewAnalyticsModalProps) {
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftText, setDraftText] = useState('');

  const handleDraftEmail = async () => {
    setIsDrafting(true);
    try {
      const response = await apiClient.post(`/interviews/${interview._id}/draft-email`);
      setDraftText(response.data.data.draft);
      toast.success('Feedback email drafted!');
    } catch (error) {
      toast.error('Failed to draft email');
    } finally {
      setIsDrafting(false);
    }
  };

  const copyDraft = () => {
    navigator.clipboard.writeText(draftText);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-base-surface border border-base-border rounded-xl max-w-4xl w-full flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-border flex items-center justify-between sticky top-0 bg-base-surface z-10 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-ink">Interview Analytics</h2>
            <p className="text-sm text-ink-muted">
              {interview.job?.title} • {interview.candidate?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDraftEmail} 
              disabled={isDrafting || interview.status !== 'completed'}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium shadow-neon hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Draft Feedback
            </button>
            <button onClick={onClose} className="p-2 hover:bg-base-background rounded-lg text-ink-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Draft Email Section */}
          {draftText && (
            <div className="bg-base-background border border-primary/30 rounded-xl p-6 relative">
              <h3 className="text-lg font-bold text-ink mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Drafted Feedback Email
              </h3>
              <button 
                onClick={copyDraft}
                className="absolute top-4 right-4 p-2 hover:bg-base-surface rounded-lg text-ink-muted transition-colors flex items-center gap-1 text-sm"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <textarea 
                className="w-full h-48 bg-base-surface border border-base-border rounded-lg p-4 text-ink focus:outline-none focus:border-primary resize-y mt-2 font-mono text-sm"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
              />
            </div>
          )}

          {/* Summary / Score Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center col-span-1">
              <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center mb-3 bg-base-surface">
                <span className="text-3xl font-bold text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">
                  {interview.overallScore !== undefined ? `${interview.overallScore}` : '-'}
                </span>
              </div>
              <h3 className="font-bold text-ink">Overall Score</h3>
              <p className="text-sm text-ink-muted">Out of 100</p>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
               <div className="bg-base-background border border-base-border rounded-xl p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-ink mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-bold">Status</span>
                  </div>
                  <span className="capitalize text-lg">{interview.status.replace('_', ' ')}</span>
               </div>
               <div className="bg-base-background border border-base-border rounded-xl p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-ink mb-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <span className="font-bold">Interview Type</span>
                  </div>
                  <span className="capitalize text-lg">{interview.type}</span>
               </div>
               <div className="bg-base-background border border-base-border rounded-xl p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-ink mb-2">
                    <Target className="w-5 h-5 text-red-500" />
                    <span className="font-bold">Questions Asked</span>
                  </div>
                  <span className="text-lg">{(interview as any).turns?.length || 0} Turns</span>
               </div>
               <div className="bg-base-background border border-base-border rounded-xl p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-ink mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <span className="font-bold">Duration</span>
                  </div>
                  <span className="text-lg">{interview.durationMinutes} Minutes</span>
               </div>
            </div>
          </div>

          {/* Proctoring Events Section */}
          {(interview as any).proctoringEvents && (interview as any).proctoringEvents.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Proctoring Alerts
              </h3>
              <div className="space-y-3">
                {(interview as any).proctoringEvents.map((event: any, idx: number) => (
                  <div key={idx} className="bg-white border border-red-100 p-3 rounded-lg flex items-start gap-3 shadow-sm">
                    <div className="mt-0.5 text-red-500">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-800 text-sm">
                        {event.type.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-red-600 mt-0.5">{event.details}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript Section */}
          <div>
            <h3 className="text-xl font-bold text-ink mb-4 border-b border-base-border pb-2">Transcript & Breakdown</h3>
            {!(interview as any).turns || (interview as any).turns.length === 0 ? (
              <p className="text-ink-muted text-center py-8">No transcript available for this interview.</p>
            ) : (
              <div className="space-y-6">
                {(interview as any).turns.map((turn: any, idx: number, arr: any[]) => {
                  const aiQuestion = idx === 0 
                    ? 'Hello! I am your AI interviewer today. To get started, could you tell me about yourself?'
                    : arr[idx - 1].aiMessage || '(Question text not recorded)';

                  return (
                    <div key={idx} className="bg-base-background border border-base-border rounded-xl overflow-hidden">
                      <div className="bg-base-surface border-b border-base-border px-4 py-3 flex items-center justify-between">
                        <span className="font-semibold text-ink">Turn {idx + 1}</span>
                        <span className="bg-primary/10 text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] text-xs font-bold px-2 py-1 rounded-full">
                          Score: {turn.score}/10
                        </span>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {/* AI Question */}
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-ink-muted mb-1">AI Interviewer</p>
                            <div className="bg-base-surface border border-base-border p-3 rounded-xl rounded-tl-none">
                              <p className="text-ink">{aiQuestion}</p>
                            </div>
                          </div>
                        </div>

                        {/* Candidate Answer */}
                        <div className="flex gap-3 flex-row-reverse">
                          <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex-1 flex flex-col items-end">
                            <p className="text-sm font-semibold text-ink-muted mb-1">{interview.candidate?.name}</p>
                            <div className="bg-primary shadow-neon text-white p-3 rounded-xl rounded-tr-none max-w-2xl text-left">
                              <p className="whitespace-pre-wrap">{turn.candidateAnswer}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Detailed Feedback (if available) */}
                        {(turn.strengths?.length > 0 || turn.weaknesses?.length > 0) && (
                          <div className="mt-4 pt-4 border-t border-base-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {turn.strengths?.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-green-500 mb-1">Strengths</h4>
                                <ul className="list-disc pl-4 text-xs text-ink-muted">
                                  {turn.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                </ul>
                              </div>
                            )}
                            {turn.weaknesses?.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-orange-500 mb-1">Areas to Improve</h4>
                                <ul className="list-disc pl-4 text-xs text-ink-muted">
                                  {turn.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                      </div>
                    </div>
                  );
                })}
                
                {/* Final AI Message (Unanswered) */}
                {((interview as any).turns.length > 0 && (interview as any).turns[(interview as any).turns.length - 1].aiMessage) && (
                  <div className="bg-base-background border border-base-border rounded-xl overflow-hidden p-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink-muted mb-1">AI Interviewer (Final Message)</p>
                        <div className="bg-base-surface border border-base-border p-3 rounded-xl rounded-tl-none">
                          <p className="text-ink">{(interview as any).turns[(interview as any).turns.length - 1].aiMessage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
