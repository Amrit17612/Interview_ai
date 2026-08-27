import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function ReportBug() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Report Bug" 
        description="Architecture module for ReportBug" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}