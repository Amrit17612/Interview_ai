import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function ResumeSuggestions() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Resume Suggestions" 
        description="Architecture module for ResumeSuggestions" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}