import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function CompanyPackDetails() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Company Pack Details" 
        description="Architecture module for CompanyPackDetails" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}