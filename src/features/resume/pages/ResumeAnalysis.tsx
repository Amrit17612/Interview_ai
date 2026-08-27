import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function ResumeAnalysis() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Resume Analysis" 
        description="Architecture module for ResumeAnalysis" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}