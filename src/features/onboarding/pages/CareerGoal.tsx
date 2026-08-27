import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function CareerGoal() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Career Goal" 
        description="Architecture module for CareerGoal" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}