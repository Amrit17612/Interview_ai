import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function PersonalizedRoadmap() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Personalized Roadmap" 
        description="Architecture module for PersonalizedRoadmap" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}