import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Sidebar } from '../components/layout/Sidebar';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: NavItem[];
  pageTitle?: string;
}

export function DashboardLayout({ children, sidebarItems, pageTitle }: DashboardLayoutProps) {
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);

  return (
    <div className="flex h-screen bg-base">
      <Sidebar items={sidebarItems} />

      <main className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {pageTitle && (
          <div className="border-b border-base-border p-4">
            <h1 className="text-2xl font-bold font-display text-ink">{pageTitle}</h1>
          </div>
        )}
        <div className="overflow-auto h-[calc(100vh-64px)] p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
