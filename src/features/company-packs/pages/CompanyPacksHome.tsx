import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function CompanyPacksHome() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Company Packs Home" 
        description="Architecture module for CompanyPacksHome" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}