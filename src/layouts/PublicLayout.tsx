import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../components/ui/PublicNavbar';
import { PublicFooter } from '../components/ui/PublicFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col font-sans">
      <PublicNavbar />
      <main className="flex-grow pt-16 flex flex-col">
        {/* pt-16 ensures content starts below the fixed navbar */}
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
