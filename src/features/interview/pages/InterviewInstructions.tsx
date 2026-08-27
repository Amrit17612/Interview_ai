import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function InterviewInstructions() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Interview Instructions" 
        description="Architecture module for InterviewInstructions" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}