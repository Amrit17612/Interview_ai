import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { MOCK_COMPANY_BUNDLES } from '../../../types/bundle.types';
import { BundleCard } from '../components/BundleCard';
import { motion } from 'framer-motion';
import { useCheckout } from '../hooks/useCheckout';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

export function CompanyBundles() {
  const { handleCheckout, isProcessing } = useCheckout();

  const navigate = useNavigate();

  const handlePreview = (bundleId: string) => {
    alert(`Preview modal for bundle: ${bundleId} would open here.`);
  };

  const handleStartPracticing = (bundleId: string) => {
    navigate(ROUTES.COMPANY_PACK_DETAILS.replace(':id', bundleId));
  };

  const handlePurchase = (bundleId: string) => {
    handleCheckout(bundleId, 'COMPANY');
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {MOCK_COMPANY_BUNDLES.map((bundle) => (
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
    </Container>
  );
}
