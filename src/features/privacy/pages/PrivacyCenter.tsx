import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function PrivacyCenter() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Privacy Center" 
        description="Architecture module for PrivacyCenter" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}