import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function CompanyReadiness() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Company Readiness" 
        description="Architecture module for CompanyReadiness" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}