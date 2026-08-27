import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function PrivacyPolicy() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Privacy Policy" 
        description="Architecture module for PrivacyPolicy" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}