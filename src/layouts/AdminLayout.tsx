import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { authService } from '../services/auth.service';
import { ROUTES } from '../constants/routes';
import { 
  LayoutDashboard, 
  CreditCard, 
  ShoppingBag, 
  BarChart, 
  BookOpen,
  PlusSquare,
  Users,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X,
  Lock,
  Tag,
  MessageSquare
} from 'lucide-react';
import { Container } from '../components/ui/Container';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2 text-brand-600 font-bold ml-auto">
              <Lock className="h-5 w-5" />
              <span>Admin Control Center</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Container className="max-w-7xl mx-auto">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuSections: { title: string, items: { name: string, icon: any, href: string, disabled?: boolean }[] }[] = [
    {
      title: 'ADMIN OVERVIEW',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, href: ROUTES.ADMIN_DASHBOARD },
      ],
    },
    {
      title: 'COMMERCE',
      items: [
        { name: 'Payments', icon: CreditCard, href: '/admin/payments' },
        { name: 'Promos', icon: Tag, href: '/admin/promos' },
        { name: 'Purchases', icon: ShoppingBag, href: '/admin/purchases', disabled: true },
        { name: 'Bundle Analytics', icon: BarChart, href: '/admin/bundle-analytics', disabled: true },
      ],
    },
    {
      title: 'CONTENT',
      items: [
        { name: 'Company Bundles', icon: BookOpen, href: ROUTES.ADMIN_COMPANY_BUNDLES },
        { name: 'Domain Bundles', icon: BookOpen, href: ROUTES.ADMIN_DOMAIN_BUNDLES },
        { name: 'Question Library', icon: BookOpen, href: ROUTES.ADMIN_QUESTIONS },
        { name: 'Interview Templates', icon: Settings, href: ROUTES.ADMIN_TEMPLATES },
        { name: 'Custom Interviews', icon: PlusSquare, href: '/admin/custom-interviews', disabled: true },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Users', icon: Users, href: '/admin/users' },
        { name: 'Batches', icon: Users, href: '/admin/batches' },
        { name: 'Feedback', icon: MessageSquare, href: ROUTES.ADMIN_FEEDBACK },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Audit Logs', icon: ShieldAlert, href: '/admin/audit-logs' },
        { name: 'Settings', icon: Settings, href: '/admin/settings', disabled: true },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <span className="text-xl font-bold text-gray-900 flex items-center">
          <span className="text-brand-600 mr-2">Interviu</span>Admin
        </span>
        <button onClick={onClose} className="lg:hidden text-gray-500">
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-8">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                if (item.disabled) {
                  return (
                    <div 
                      key={item.name} 
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed opacity-60"
                      title="Coming soon in Phase 2+"
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </div>
                  );
                }
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end
                    onClick={() => onClose()} // Close mobile sidebar on click
                    className={({ isActive }) => `
                      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive 
                        ? 'bg-brand-50 text-brand-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
