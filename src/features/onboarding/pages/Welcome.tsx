import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../auth/hooks/useAuth';
import { authService } from '../../../services/auth.service';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

export function Welcome() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    try {
      await authService.completeOnboarding();
      await refreshUser();
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-8">
      <PageHeader 
        title="Welcome" 
        description="Architecture module for Welcome" 
      />
      <div className="flex flex-col items-center justify-center space-y-6">
        <EmptyState 
          title="Pending Implementation" 
          description="This feature will be implemented in a future sprint." 
        />
        <Button onClick={handleCompleteOnboarding} disabled={isSubmitting}>
          {isSubmitting ? 'Completing...' : 'Simulate Onboarding Completion'}
        </Button>
      </div>
    </Container>
  );
}