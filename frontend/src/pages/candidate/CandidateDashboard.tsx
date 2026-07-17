import { DashboardLayout } from '@/layouts/DashboardLayout';
import { FileText, Clock, Trophy, Settings, Briefcase } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { ResumeBuilder } from '@/features/resumes/components/ResumeBuilder';
import { InterviewLobby } from '@/features/interviews/components/InterviewLobby';
import { JobsList } from './JobsList';
import { JobDetails } from './JobDetails';

const navItems = [
  { label: 'Dashboard', href: '/candidate', icon: <Trophy className="w-5 h-5" /> },
  { label: 'Jobs', href: '/candidate/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'My Interviews', href: '/candidate/interviews', icon: <Clock className="w-5 h-5" /> },
  { label: 'Resume', href: '/candidate/resume', icon: <FileText className="w-5 h-5" /> },
  { label: 'Settings', href: '/candidate/settings', icon: <Settings className="w-5 h-5" /> },
];

import { useEffect, useState } from 'react';
import { apiClient as api } from '@/services/apiClient';

function CandidateDashboardContent() {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/applications/my-applications');
        setApplications(response.data.data.slice(0, 3)); // Show top 3
      } catch (error) {
        console.error('Failed to fetch applications', error);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-base-surface rounded-xl p-6 border border-base-border md:col-span-2">
        <h3 className="font-semibold text-ink mb-4">Recent Applications</h3>
        {applications.length === 0 ? (
          <p className="text-ink-muted text-sm">You haven't applied to any jobs yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900">{app.job?.title || 'Unknown Job'}</p>
                  <p className="text-sm text-neutral-500">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize 
                  ${app.status === 'applied' ? 'bg-red-100 text-red-800' : 
                    app.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' : 
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-6">
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <h3 className="font-semibold text-ink mb-2">Upcoming Interviews</h3>
          <p className="text-ink-muted text-sm">Your scheduled interviews will appear here</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <h3 className="font-semibold text-ink mb-2">Profile Strength</h3>
          <p className="text-ink-muted text-sm">Your profile completion status</p>
        </div>
      </div>
    </div>
  );
}

import { SettingsPage } from '@/pages/SettingsPage';

export function CandidateDashboard() {
  return (
    <DashboardLayout sidebarItems={navItems} pageTitle="Candidate Portal">
      <Routes>
        <Route path="/" element={<CandidateDashboardContent />} />
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/interviews" element={<InterviewLobby />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
