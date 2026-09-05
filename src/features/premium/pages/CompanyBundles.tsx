import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { BundleCard } from '../components/BundleCard';
import { motion } from 'framer-motion';
import { useCheckout } from '../hooks/useCheckout';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { CheckoutModal } from '../components/CheckoutModal';
import { useState, useEffect } from 'react';
import { bundleService } from '../../../services/bundle.service';

export function CompanyBundles() {
  const { handleCheckout, isProcessing } = useCheckout();
  const navigate = useNavigate();
  
  const [bundles, setBundles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bundleService.getPublicBundles().then(data => {
      const companyBundles = data
        .filter(b => b.type === 'COMPANY')
        .map(b => ({ ...b, id: b.bundleId })); // Map bundleId to id for compatibility
      setBundles(companyBundles);
      setIsLoading(false);
    });
  }, []);

  const handlePreview = (bundleId: string) => {
    alert(`Preview modal for bundle: ${bundleId} would open here.`);
  };

  const handleStartPracticing = (bundleId: string) => {
    navigate(ROUTES.COMPANY_PACK_DETAILS.replace(':id', bundleId));
  };

  const [checkoutBundle, setCheckoutBundle] = useState<any>(null);

  const handlePurchase = (bundleId: string) => {
    const bundle = bundles.find(b => b.id === bundleId);
    if (bundle) {
      setCheckoutBundle(bundle);
    }
  };

  const confirmCheckout = (promoCode?: string, creditsToUse?: number) => {
    if (checkoutBundle) {
      handleCheckout(checkoutBundle.id, 'COMPANY', promoCode, creditsToUse);
    }
  };

  return (
    <Container className="py-8 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
      >
        <PageHeader 
          title="Company Preparation Bundles" 
          description="Master the exact interview formats, rubrics, and behavioral expectations of top tech companies." 
        />
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
            {bundles.map((bundle) => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                onPreviewClick={handlePreview}
                onStartPracticing={handleStartPracticing}
                onPurchaseClick={handlePurchase}
                isProcessing={isProcessing === bundle.id}
              />
            ))}
          </div>
        )}
      </motion.div>

      {checkoutBundle && (
        <CheckoutModal 
          isOpen={!!checkoutBundle}
          onClose={() => setCheckoutBundle(null)}
          bundleId={checkoutBundle.id}
          bundleType="COMPANY"
          bundleTitle={checkoutBundle.name}
          originalPrice={checkoutBundle.price * 100} // assuming price is in INR, convert to paise
          onConfirm={confirmCheckout}
          isProcessing={isProcessing === checkoutBundle.id}
        />
      )}
    </Container>
  );
}
