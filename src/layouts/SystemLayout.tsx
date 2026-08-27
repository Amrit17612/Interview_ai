
import { Outlet } from 'react-router-dom';

export function SystemLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
      <main className="w-full max-w-lg space-y-6">
        <Outlet />
      </main>
    </div>
  );
}
