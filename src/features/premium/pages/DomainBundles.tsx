import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { MOCK_DOMAIN_BUNDLES } from '../../../types/bundle.types';
import { BundleCard } from '../components/BundleCard';
import { motion } from 'framer-motion';

export function DomainBundles() {
  const handlePreview = (bundleId: string) => {
    alert(`Preview modal for bundle: ${bundleId} would open here.`);
  };

  const handlePurchase = (bundleId: string) => {
    alert(`Checkout flow for bundle: ${bundleId} would open here.`);
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
              onPurchaseClick={handlePurchase}
            />
          ))}
        </div>
      </motion.div>
    </Container>
  );
}
