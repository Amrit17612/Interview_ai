import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function DifficultySelection() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Difficulty Selection" 
        description="Architecture module for DifficultySelection" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}