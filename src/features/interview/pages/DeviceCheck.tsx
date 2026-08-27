import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function DeviceCheck() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Device Check" 
        description="Architecture module for DeviceCheck" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}