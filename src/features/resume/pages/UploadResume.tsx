import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function UploadResume() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Upload Resume" 
        description="Architecture module for UploadResume" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}