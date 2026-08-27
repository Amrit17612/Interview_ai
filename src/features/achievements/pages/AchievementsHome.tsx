import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function AchievementsHome() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Achievements Home" 
        description="Architecture module for AchievementsHome" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}