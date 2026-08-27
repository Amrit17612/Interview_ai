import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function GeneralSettings() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="General Settings" 
        description="Architecture module for GeneralSettings" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}