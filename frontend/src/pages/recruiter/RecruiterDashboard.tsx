import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Briefcase, Users, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/recruiter', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Jobs', href: '/recruiter/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Candidates', href: '/recruiter/candidates', icon: <Users className="w-5 h-5" /> },
  { label: 'Settings', href: '/recruiter/settings', icon: <Settings className="w-5 h-5" /> },
];

export function RecruiterDashboard() {
  return (
    <DashboardLayout sidebarItems={navItems} pageTitle="Recruiter Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Quick stats */}
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Active Jobs</p>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Total Applicants</p>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">In Progress</p>
          <p className="text-3xl font-bold text-accent">0</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Hired</p>
          <p className="text-3xl font-bold text-accent">0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <h3 className="font-semibold text-ink mb-4">Recent Candidates</h3>
          <p className="text-ink-muted text-sm">New applicants will appear here</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <h3 className="font-semibold text-ink mb-4">Hiring Funnel</h3>
          <p className="text-ink-muted text-sm">Candidate pipeline analytics will appear here</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
