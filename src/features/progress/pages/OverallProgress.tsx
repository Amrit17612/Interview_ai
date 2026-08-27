import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function OverallProgress() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Overall Progress" 
        description="Architecture module for OverallProgress" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}