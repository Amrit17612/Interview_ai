import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function CookiePolicy() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Cookie Policy" 
        description="Architecture module for CookiePolicy" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}