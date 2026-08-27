import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function SkillSelection() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Skill Selection" 
        description="Architecture module for SkillSelection" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}