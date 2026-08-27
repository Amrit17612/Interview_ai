import { Container } from '../../../components/ui/Container';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ROUTES } from '../../../constants/routes';

export function ComingSoon() {
  return (
    <Container className="py-12 flex justify-center items-center">
      <EmptyState 
        title="Coming Soon" 
        description="This feature is currently under development and will be available in a future update." 
        actionLabel="Return to Dashboard"
        actionPath={ROUTES.DASHBOARD}
      />
    </Container>
  );
}