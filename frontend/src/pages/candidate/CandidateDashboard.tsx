import { DashboardLayout } from '@/layouts/DashboardLayout';
import { FileText, Clock, Trophy, Settings } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/candidate', icon: <Trophy className="w-5 h-5" /> },
  { label: 'My Interviews', href: '/candidate/interviews', icon: <Clock className="w-5 h-5" /> },
  { label: 'Resume', href: '/candidate/resume', icon: <FileText className="w-5 h-5" /> },
  { label: 'Settings', href: '/candidate/settings', icon: <Settings className="w-5 h-5" /> },
];

export function CandidateDashboard() {
  return (
    <DashboardLayout sidebarItems={navItems} pageTitle="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder cards for phase 2 modules */}
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <h3 className="font-semibold text-ink mb-2">Upcoming Interviews</h3>
          <p className="text-ink-muted text-sm">Your scheduled interviews will appear here</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <h3 className="font-semibold text-ink mb-2">Recent Results</h3>
          <p className="text-ink-muted text-sm">Interview results and feedback will appear here</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <h3 className="font-semibold text-ink mb-2">Profile Strength</h3>
          <p className="text-ink-muted text-sm">Your profile completion status</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
