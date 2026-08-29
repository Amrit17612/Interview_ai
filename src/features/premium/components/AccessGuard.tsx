import React from 'react';
import { useAccess } from '../hooks/useAccess';
import type { BundleType } from '../../../types/bundle.types';
import { Lock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface AccessGuardProps {
  bundleId: string;
  bundleType: BundleType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnlockRequest?: () => void;
  price?: number;
}

export function AccessGuard({ 
  bundleId, 
  bundleType, 
  children, 
  fallback, 
  onUnlockRequest,
  price 
}: AccessGuardProps) {
  const { hasAccessToBundle } = useAccess();
  
  const hasAccess = hasAccessToBundle(bundleId, bundleType);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 shadow-sm border border-amber-200">
          <Lock className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Content Locked</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          You need to unlock this bundle to access its premium features, mocks, and analysis.
        </p>
        {onUnlockRequest && (
          <Button 
            onClick={onUnlockRequest}
            className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-medium"
          >
            Unlock Now {price ? `for $${price}` : ''}
          </Button>
        )}
      </div>
      <div className="opacity-30 pointer-events-none select-none filter blur-sm transition-all">
        {children}
      </div>
    </div>
  );
}
