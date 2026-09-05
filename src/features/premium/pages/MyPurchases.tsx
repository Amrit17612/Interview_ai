import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useAccess } from '../hooks/useAccess';
import { BundleCard } from '../components/BundleCard';
import { ROUTES } from '../../../constants/routes';
import { motion } from 'framer-motion';
import { bundleService } from '../../../services/bundle.service';

export function MyPurchases() {
  const { purchasedBundles } = useAccess();
  const navigate = useNavigate();

  const [allBundles, setAllBundles] = useState<any[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bundleService.getPublicBundles().then(data => {
      setAllBundles(data.map(b => ({ ...b, id: b.bundleId })));
      setIsLoading(false);
    });
  }, []);

  // Combine both mock sets and filter by what the user actually owns
  const ownedBundles = useMemo(() => {
    return allBundles.filter(bundle => 
      purchasedBundles.some(
        owned => 
          owned.bundleId === bundle.id && 
          owned.bundleType.toLowerCase() === bundle.type.toLowerCase() &&
          owned.purchaseStatus === 'active'
      )
    );
  }, [purchasedBundles, allBundles]);

  const handlePreview = (_bundleId: string) => {
    // We can leave this as a no-op or reuse the start practice flow since they own it
  };

  const handleStartPracticing = (bundleId: string) => {
    const bundle = ownedBundles.find(b => b.id === bundleId);
    if (!bundle) return;
    
    if (bundle.type === 'company') {
      navigate(ROUTES.COMPANY_PACK_DETAILS.replace(':id', bundleId));
    } else {
      navigate(ROUTES.DOMAIN_PACK_DETAILS.replace(':id', bundleId));
    }
  };

  const handlePurchaseClick = (_bundleId: string) => {
    // Unnecessary since they are already purchased
  };

  return (
    <Container className="py-8 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
      >
        <PageHeader 
          title="My Purchases" 
          description="Access all your unlocked premium practice bundles here." 
        />
        
        {ownedBundles.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-gray-100 shadow-sm mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">You haven't purchased any bundles yet.</h3>
            <p className="text-gray-500 mb-6">Unlock premium company and domain packs to supercharge your prep.</p>
            <button 
              onClick={() => navigate(ROUTES.COMPANY_PACKS)}
              className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Browse Premium Bundles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
            {ownedBundles.map((bundle) => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                onPreviewClick={handlePreview}
                onStartPracticing={handleStartPracticing}
                onPurchaseClick={handlePurchaseClick}
              />
            ))}
          </div>
        )}
      </motion.div>
    </Container>
  );
}
