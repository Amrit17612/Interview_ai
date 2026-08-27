import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function InterviewType() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Interview Type" 
        description="Architecture module for InterviewType" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}