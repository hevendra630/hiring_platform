import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, LogOut } from 'lucide-react';
import { toggleSidebar } from '@/store/uiSlice';
import { useLogout } from '@/features/auth/useAuth';
import { RootState } from '@/store/store';
import { LogoMark } from '@/components/ui/LogoMark';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: NavItem[];
}

export function Sidebar({ items }: SidebarProps) {
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  const logoutMutation = useLogout();

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-base-surface border-r border-base-border transition-all duration-200 z-40 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-border">
          {!sidebarCollapsed && <LogoMark variant="full" className="w-6 h-6" />}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 hover:bg-base-raised rounded-lg transition"
            title="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-ink" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive(item.href)
                  ? 'bg-primary text-white'
                  : 'text-ink hover:bg-base-raised'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-base-border p-4 space-y-2">
          {!sidebarCollapsed && (
            <div className="px-3 py-2 text-xs text-ink-muted">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs">{user?.email}</p>
            </div>
          )}
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-2 px-3 py-2 text-danger hover:bg-base-raised rounded-lg transition disabled:opacity-50 text-sm"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
