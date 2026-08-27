import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function DomainHome() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Domain Home" 
        description="Architecture module for DomainHome" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}