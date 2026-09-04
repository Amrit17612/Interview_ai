import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { apiClient } from '../../../services/api.client';
import { Lock, PlayCircle, Clock, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

interface ExclusiveSession {
  _id: string;
  status: string;
  templateId: {
    _id: string;
    title: string;
    category: string;
    type: string;
    difficulty?: string;
    domain?: string;
  };
  batchId: {
    _id: string;
    name: string;
  };
}

export function ExclusiveInterviews() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [validatedData, setValidatedData] = useState<{
    token: string;
    template: any;
    batch: any;
  } | null>(null);
  
  const [sessions, setSessions] = useState<ExclusiveSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await apiClient.get<any>('/interview-templates/exclusive');
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch exclusive history', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    try {
      setIsVerifying(true);
      setValidationError('');
      setValidatedData(null);
      
      const res = await apiClient.post<any>('/interview-templates/validate-token', { token });
      if (res.data.success) {
        setValidatedData(res.data.data);
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Invalid or expired access token.';
      setValidationError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartInterview = async (templateId: string, accessToken?: string) => {
    try {
      setIsVerifying(true);
      const payload: any = {};
      if (accessToken) payload.token = accessToken;
      
      const res = await apiClient.post(`/interview-templates/${templateId}/start`, payload);
      
      if (res.data.success) {
        navigate(`/interviews/active?session=${res.data.data.sessionId}`);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to start interview.';
      setValidationError(msg);
      setIsVerifying(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'IN_PROGRESS': return <span className="text-amber-500 flex items-center text-sm font-medium"><Clock className="w-4 h-4 mr-1" /> In Progress</span>;
      case 'COMPLETED': return <span className="text-emerald-500 flex items-center text-sm font-medium"><CheckCircle2 className="w-4 h-4 mr-1" /> Completed</span>;
      default: return <span className="text-gray-500 flex items-center text-sm font-medium"><AlertTriangle className="w-4 h-4 mr-1" /> {status}</span>;
    }
  };

  return (
    <Container>
      <PageHeader 
        title="Exclusive Interviews" 
        description="Interviews assigned to you by your administrator." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border border-gray-100 shadow-premium bg-white">
            <h3 className="font-semibold text-lg flex items-center mb-4">
              <Key className="w-5 h-5 mr-2 text-primary" />
              Enter Access Token
            </h3>
            <form onSubmit={handleValidate} className="space-y-4">
              <Input
                placeholder="e.g. A1B2C3D4"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                disabled={isVerifying}
              />
              <Button type="submit" className="w-full" disabled={!token.trim() || isVerifying}>
                {isVerifying ? <Spinner className="w-5 h-5" /> : 'Validate Token'}
              </Button>
            </form>
            
            {validationError && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start">
                <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {validatedData && (
            <Card className="p-6 border-2 border-primary/20 bg-primary/5 shadow-premium">
              <div className="flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
                    New Assignment
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{validatedData.template.title}</h3>
                  <div className="text-sm text-gray-600 mb-4 space-y-1">
                    {validatedData.batch && <p>Batch: <span className="font-medium text-gray-900">{validatedData.batch.name}</span></p>}
                    <p>Category: {validatedData.template.category || 'General'}</p>
                    {validatedData.template.questionCount > 0 && <p>Questions: {validatedData.template.questionCount}</p>}
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => handleStartInterview(validatedData.template._id, validatedData.token)}
                className="mt-2"
                disabled={isVerifying}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Interview
              </Button>
            </Card>
          )}

          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900 border-b pb-2">Your Sessions</h3>
            {isLoadingHistory ? (
              <div className="flex justify-center p-8">
                <Spinner className="w-8 h-8 text-primary" />
              </div>
            ) : sessions.length === 0 ? (
              <Card className="p-12 border border-gray-100 border-dashed bg-gray-50 flex flex-col items-center justify-center text-center shadow-none">
                <Lock className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No exclusive interviews available.</h3>
                <p className="text-gray-500 mt-1 max-w-sm">
                  Enter an access token provided by your administrator to start an interview.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session._id} className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{session.templateId?.title || 'Unknown Template'}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          {session.batchId && <span>Batch: {session.batchId.name}</span>}
                          <span>Category: {session.templateId?.category || 'General'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 min-w-[120px]">
                        {getStatusDisplay(session.status)}
                        {session.status === 'IN_PROGRESS' && (
                          <Button size="sm" onClick={() => navigate(`/interviews/active?session=${session._id}`)}>
                            Resume
                          </Button>
                        )}
                        {session.status === 'COMPLETED' && (
                          <Button size="sm" variant="outline" onClick={() => navigate(`/interviews/report-details?session=${session._id}`)}>
                            View Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
