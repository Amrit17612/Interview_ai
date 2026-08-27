import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function ReferralProgram() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Referral Program" 
        description="Architecture module for ReferralProgram" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}