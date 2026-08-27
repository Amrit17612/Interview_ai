import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function CompanySelection() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Company Selection" 
        description="Architecture module for CompanySelection" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}