import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Users, Settings, BarChart3 } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

function AdminDashboardContent() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Total Users</p>
          <p className="text-3xl font-bold text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">0</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Candidates</p>
          <p className="text-3xl font-bold text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">0</p>
        </div>
        <div className="bg-base-surface rounded-xl p-6 border border-base-border">
          <p className="text-ink-muted text-sm mb-2">Recruiters</p>
          <p className="text-3xl font-bold text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">0</p>
        </div>
      </div>

      <div className="bg-base-surface rounded-xl p-6 border border-base-border">
        <h3 className="font-semibold text-ink mb-4">System Health</h3>
        <p className="text-ink-muted text-sm">System metrics and logs will appear here</p>
      </div>
    </>
  );
}

function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-base-surface rounded-xl border border-base-border">
      <h2 className="text-2xl font-bold text-ink mb-4">{title}</h2>
      <p className="text-ink-muted max-w-md">{description}</p>
      <div className="mt-8 px-4 py-2 bg-primary/10 text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] font-medium rounded-lg">
        Coming soon in Phase 2
      </div>
    </div>
  );
}

import { SettingsPage } from '@/pages/SettingsPage';

export function AdminDashboard() {
  return (
    <DashboardLayout sidebarItems={navItems} pageTitle="Admin Portal">
      <Routes>
        <Route path="/" element={<AdminDashboardContent />} />
        <Route path="/users" element={<PlaceholderPage title="User Management" description="View, edit, and suspend user accounts across the platform." />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
