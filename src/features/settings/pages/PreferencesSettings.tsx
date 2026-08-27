import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function PreferencesSettings() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="Preferences Settings" 
        description="Architecture module for PreferencesSettings" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}