import { useAuth } from '../../auth/hooks/useAuth';
import type { BundleType } from '../../../types/bundle.types';

export function useAccess() {
  const { user } = useAuth();

  const hasAccessToBundle = (bundleId: string, bundleType: BundleType): boolean => {
    if (!user || !user.purchasedBundles) return false;

    return user.purchasedBundles.some(
      (bundle) => 
        bundle.bundleId === bundleId && 
        bundle.bundleType.toLowerCase() === bundleType.toLowerCase() && 
        bundle.purchaseStatus === 'active'
    );
  };

  const getCredits = (): number => {
    return user?.credits || 0;
  };

  return {
    hasAccessToBundle,
    getCredits,
    purchasedBundles: user?.purchasedBundles || [],
  };
}
