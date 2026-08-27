import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function NotificationsSettings() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Notifications Settings" 
        description="Architecture module for NotificationsSettings" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}