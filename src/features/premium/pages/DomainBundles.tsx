import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { MOCK_DOMAIN_BUNDLES } from '../../../types/bundle.types';
import { BundleCard } from '../components/BundleCard';
import { motion } from 'framer-motion';
import { useCheckout } from '../hooks/useCheckout';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { CheckoutModal } from '../components/CheckoutModal';
import { useState } from 'react';

export function DomainBundles() {
  const { handleCheckout, isProcessing } = useCheckout();

  const navigate = useNavigate();

  const handlePreview = (bundleId: string) => {
    alert(`Preview modal for bundle: ${bundleId} would open here.`);
  };

  const handleStartPracticing = (bundleId: string) => {
    navigate(ROUTES.DOMAIN_PACK_DETAILS.replace(':id', bundleId));
  };

  const [checkoutBundle, setCheckoutBundle] = useState<any>(null);

  const handlePurchase = (bundleId: string) => {
    const bundle = MOCK_DOMAIN_BUNDLES.find(b => b.id === bundleId);
    if (bundle) {
      setCheckoutBundle(bundle);
    }
  };

  const confirmCheckout = (promoCode?: string, creditsToUse?: number) => {
    if (checkoutBundle) {
      handleCheckout(checkoutBundle.id, 'DOMAIN', promoCode, creditsToUse);
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
          title="Role-Specific Domain Bundles" 
          description="Deep technical preparation for specific engineering and product roles." 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {MOCK_DOMAIN_BUNDLES.map((bundle) => (
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
      </motion.div>

      {checkoutBundle && (
        <CheckoutModal 
          isOpen={!!checkoutBundle}
          onClose={() => setCheckoutBundle(null)}
          bundleId={checkoutBundle.id}
          bundleType="DOMAIN"
          bundleTitle={checkoutBundle.title}
          originalPrice={checkoutBundle.price.amount * 100} // converting INR to paise
          onConfirm={confirmCheckout}
          isProcessing={isProcessing === checkoutBundle.id}
        />
      )}
    </Container>
  );
}
