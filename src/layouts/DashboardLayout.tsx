import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';
import { ROUTES } from '../constants/routes';
import { 
  LayoutDashboard, 
  Video, 
  FileText, 
  User, 
  Menu,
  LogOut,
  BarChart,
  Map,
  Building,
  Code2,
  History,
  Medal,
  Settings,
  Shield,
  HelpCircle,
  Lock
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../features/auth/hooks/useAuth';
import { InterviewProvider } from '../features/interview/context/InterviewContext';

interface SidebarItem {
  name: string;
  path: string;
  icon: LucideIcon;
  isPremium?: boolean;
}

interface SidebarCategory {
  title: string;
  items: SidebarItem[];
}

const SIDEBAR_CATEGORIES: SidebarCategory[] = [
  {
    title: 'MAIN',
    items: [
      { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
      { name: 'Start Interview', path: ROUTES.INTERVIEW, icon: Video },
      { name: 'Resume Intelligence', path: ROUTES.RESUME, icon: FileText },
      { name: 'Reports & Analytics', path: ROUTES.PROGRESS_ANALYTICS, icon: BarChart },
      { name: 'Learning Roadmap', path: ROUTES.LEARNING_ROADMAP, icon: Map },
    ]
  },
  {
    title: 'PREMIUM PRACTICE',
    items: [
      { name: 'Company Bundles', path: ROUTES.COMPANY_PACKS, icon: Building, isPremium: true },
      { name: 'Domain Bundles', path: ROUTES.DOMAIN_PACKS, icon: Code2, isPremium: true },
    ]
  },
  {
    title: 'PROGRESS',
    items: [
      { name: 'Interview History', path: ROUTES.INTERVIEW_HISTORY, icon: History },
      { name: 'Achievements', path: ROUTES.ACHIEVEMENTS, icon: Medal },
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'Profile', path: ROUTES.PROFILE, icon: User },
      { name: 'Settings', path: ROUTES.SETTINGS_GENERAL, icon: Settings },
      { name: 'Privacy Center', path: ROUTES.PRIVACY_CENTER, icon: Shield },
      { name: 'Help & Support', path: ROUTES.HELP_CENTER, icon: HelpCircle },
    ]
  }
];

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Get user initials
  const initials = user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'ST' : 'ST';

  const renderNavCategories = (onItemClick?: () => void) => (
    <div className="flex-1 px-4 py-4 space-y-6">
      {SIDEBAR_CATEGORIES.map((category) => (
        <div key={category.title}>
          <h3 className="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            {category.title}
          </h3>
          <div className="space-y-1">
            {category.items.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onItemClick}
                className={({ isActive }) => cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-brand-50 text-brand-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0",
                    item.isPremium ? "text-amber-500" : ""
                  )} />
                  <span>{item.name}</span>
                </div>
                {item.isPremium && (
                  <Lock className="h-3.5 w-3.5 text-amber-500/70" />
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex z-[1030] sticky top-0 h-screen overflow-y-auto custom-scrollbar">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-brand-600 tracking-tight">Interviu AI</span>
        </div>
        <nav className="flex-1 flex flex-col">
          {renderNavCategories()}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[1040] bg-gray-900/50 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-[1050] w-64 transform flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:hidden flex overflow-y-auto',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-brand-600 tracking-tight">Interviu AI</span>
        </div>
        <nav className="flex-1 flex flex-col">
          {renderNavCategories(() => setIsMobileMenuOpen(false))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 z-[1020] sticky top-0">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden mr-2 -ml-2 text-gray-500"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="md:hidden text-lg font-bold text-brand-600 tracking-tight">IAI</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-sm font-medium text-brand-700">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-surface-50">
          <InterviewProvider>
            <Outlet />
          </InterviewProvider>
        </main>
      </div>
    </div>
  );
}
