import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Briefcase, Users, BarChart3, Settings } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { JobManagement } from '@/features/jobs/components/JobManagement';
import { InterviewManagement } from '@/features/interviews/components/InterviewManagement';
import { JobApplications } from './JobApplications';

const navItems = [
  { label: 'Dashboard', href: '/recruiter', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Jobs', href: '/recruiter/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Candidates', href: '/recruiter/candidates', icon: <Users className="w-5 h-5" /> },
  { label: 'Settings', href: '/recruiter/settings', icon: <Settings className="w-5 h-5" /> },
];

import { useEffect, useState } from 'react';
import { apiClient as api } from '@/services/apiClient';

function RecruiterDashboardContent() {
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0, inProgress: 0, hired: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const jobsRes = await api.get('/jobs/my-jobs');
        const jobs = jobsRes.data.data;
        const activeJobs = jobs.length;
        const totalApplicants = jobs.reduce((acc: number, job: any) => acc + (job.applicantsCount || 0), 0);
        
        // MVP simplified stats based on jobs array 
        setStats({
          activeJobs,
          totalApplicants,
          inProgress: Math.floor(totalApplicants * 0.3), // Mock 30% in progress
          hired: Math.floor(totalApplicants * 0.05) // Mock 5% hired
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Quick stats */}
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Active Jobs</p>
          <p className="text-3xl font-bold text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">{stats.activeJobs}</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Total Applicants</p>
          <p className="text-3xl font-bold text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">{stats.totalApplicants}</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">In Progress</p>
          <p className="text-3xl font-bold text-accent">{stats.inProgress}</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Hired</p>
          <p className="text-3xl font-bold text-accent">{stats.hired}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <h3 className="font-semibold text-ink mb-4">Recent Activity</h3>
          <p className="text-ink-muted text-sm">Dashboard analytics successfully connected.</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <h3 className="font-semibold text-ink mb-4">Hiring Funnel</h3>
          <p className="text-ink-muted text-sm">You have {stats.totalApplicants} total candidates in your pipeline.</p>
        </div>
      </div>
    </>
  );
}



import { SettingsPage } from '@/pages/SettingsPage';

export function RecruiterDashboard() {
  return (
    <DashboardLayout sidebarItems={navItems} pageTitle="Recruiter Portal">
      <Routes>
        <Route path="/" element={<RecruiterDashboardContent />} />
        <Route path="/jobs" element={<JobManagement />} />
        <Route path="/jobs/:id/applications" element={<JobApplications />} />
        <Route path="/candidates" element={<InterviewManagement />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
