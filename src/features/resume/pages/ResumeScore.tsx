import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function ResumeScore() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Resume Score" 
        description="Architecture module for ResumeScore" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}