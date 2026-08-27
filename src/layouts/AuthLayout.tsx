
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-premium ring-1 ring-gray-100">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center">
            <span className="text-xl font-bold text-brand-600">IAI</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-500">Please sign in to continue</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
