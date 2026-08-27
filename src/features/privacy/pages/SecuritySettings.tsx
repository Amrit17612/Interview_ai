import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function SecuritySettings() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Security Settings" 
        description="Architecture module for SecuritySettings" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}