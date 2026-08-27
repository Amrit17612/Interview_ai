import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function InterviewAnalytics() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Interview Analytics" 
        description="Architecture module for InterviewAnalytics" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}