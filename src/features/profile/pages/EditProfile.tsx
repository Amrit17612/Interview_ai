import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function EditProfile() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Edit Profile" 
        description="Architecture module for EditProfile" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}