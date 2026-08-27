import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function ProfileSetup() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Profile Setup" 
        description="Architecture module for ProfileSetup" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}