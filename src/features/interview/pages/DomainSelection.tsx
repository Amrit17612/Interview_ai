import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function DomainSelection() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Domain Selection" 
        description="Architecture module for DomainSelection" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}