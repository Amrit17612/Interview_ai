import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardContent } from '../../../components/ui/Card';
import { useAuth } from '../../auth/hooks/useAuth';
import { User, Mail } from 'lucide-react';

export function UserProfile() {
  const { user } = useAuth();

  return (
    <Container className="py-8 max-w-2xl">
      <PageHeader 
        title="User Profile" 
        description="Your personal information and account details." 
      />
      
      <Card className="mt-6 border-gray-100 shadow-sm">
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
            <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-700">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h2>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">Active Account</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-base text-gray-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Account Type</p>
                <p className="text-base text-gray-900 capitalize">{user?.role || 'user'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}