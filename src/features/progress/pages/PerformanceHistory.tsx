import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function PerformanceHistory() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Performance History" 
        description="Architecture module for PerformanceHistory" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}