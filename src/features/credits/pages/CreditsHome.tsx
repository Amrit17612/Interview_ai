import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function CreditsHome() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Credits Home" 
        description="Architecture module for CreditsHome" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}