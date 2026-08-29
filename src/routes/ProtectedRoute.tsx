import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES } from '../constants/routes';

interface ProtectedRouteProps {
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ requireOnboarding = true }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (user.role === 'admin' && location.pathname === ROUTES.DASHBOARD) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  if (requireOnboarding && !user.onboardingCompleted) {
    return <Navigate to={ROUTES.ONBOARDING_WELCOME} replace />;
  }

  if (!requireOnboarding && user.onboardingCompleted) {
    return <Navigate to={user.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
