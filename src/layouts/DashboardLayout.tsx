import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';
import { ROUTES } from '../constants/routes';
import { 
  LayoutDashboard, 
  Video, 
  FileText, 
  ScanSearch, 
  User, 
  Menu,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../features/auth/hooks/useAuth';
import { InterviewProvider } from '../features/interview/context/InterviewContext';

const SIDEBAR_ITEMS = [
  { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Interview', path: ROUTES.INTERVIEW, icon: Video },
  { name: 'Resume', path: ROUTES.RESUME, icon: FileText },
  { name: 'ATS', path: ROUTES.ATS, icon: ScanSearch },
  { name: 'Profile', path: ROUTES.PROFILE, icon: User }
];

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Get user initials
  const initials = user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'ST' : 'ST';

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex z-[1030] sticky top-0 h-screen overflow-y-auto">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-brand-600 tracking-tight">Interviu AI</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
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
        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
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
