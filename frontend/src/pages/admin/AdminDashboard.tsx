import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Users, Settings, BarChart3 } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

export function AdminDashboard() {
  return (
    <DashboardLayout sidebarItems={navItems} pageTitle="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Total Users</p>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Candidates</p>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Recruiters</p>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>
      </div>

      <div className="bg-base-surface rounded-xl p-6 border border-base-border">
        <h3 className="font-semibold text-ink mb-4">System Health</h3>
        <p className="text-ink-muted text-sm">System metrics and logs will appear here</p>
      </div>
    </DashboardLayout>
  );
}
