import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES } from '../constants/routes';

export function GuestRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  if (user) {
    if (!user.onboardingCompleted) {
      return <Navigate to={ROUTES.ONBOARDING_WELCOME} replace />;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
