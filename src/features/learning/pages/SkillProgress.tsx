import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function SkillProgress() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Skill Progress" 
        description="Architecture module for SkillProgress" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}