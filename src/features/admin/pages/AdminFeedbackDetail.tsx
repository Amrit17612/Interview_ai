import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../services/api.client';
import { Loader2, ArrowLeft, Star, Clock, User, FileText, Activity } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';

interface FeedbackDetail {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  session: {
    _id: string;
    configuration: {
      domain: string;
      type: string;
      difficulty: string;
    };
    status: string;
    overallScore: number | null;
    createdAt: string;
  };
  overallExperience: number;
  questionQuality: number;
  skillTesting: number;
  additionalSuggestions: string;
  createdAt: string;
}

export function AdminFeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchFeedbackDetail();
  }, [id]);

  const fetchFeedbackDetail = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/feedback/admin/${id}`);
      if (response.data.success) {
        setFeedback(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load feedback details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-12 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-4" />
        <p className="text-gray-500">Loading feedback details...</p>
      </Container>
    );
  }

  if (error || !feedback) {
    return (
      <Container className="py-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
          <p className="mb-4">{error || 'Feedback not found'}</p>
          <Button onClick={() => navigate(ROUTES.ADMIN_FEEDBACK)}>Return to List</Button>
        </div>
      </Container>
    );
  }

  const getAvgRating = () => {
    return ((feedback.overallExperience + feedback.questionQuality + feedback.skillTesting) / 3).toFixed(1);
  };

  const getReportStatus = () => {
    if (feedback.session.status !== 'COMPLETED') return 'Incomplete';
    if (feedback.session.overallScore === null) return 'Generating';
    return 'Generated';
  };

  const renderStars = (value: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= value ? 'fill-brand-500 text-brand-500' : 'fill-transparent text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Container className="py-8 max-w-4xl">
      <div className="mb-6">
        <button 
          onClick={() => navigate(ROUTES.ADMIN_FEEDBACK)}
          className="text-gray-500 hover:text-gray-900 inline-flex items-center text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Feedback List
        </button>
      </div>

      <PageHeader 
        title="Feedback Details" 
        description={`Submitted on ${new Date(feedback.createdAt).toLocaleString()}`} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        
        {/* Left Column - Meta Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center mb-4">
              <User className="w-4 h-4 mr-2" /> Candidate Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{feedback.user.firstName} {feedback.user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 truncate">{feedback.user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center mb-4">
              <FileText className="w-4 h-4 mr-2" /> Interview Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Domain</p>
                <p className="font-medium text-gray-900">{feedback.session.configuration?.domain || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Difficulty</p>
                <p className="text-gray-900">{feedback.session.configuration?.difficulty || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Started At</p>
                <p className="text-gray-900">{new Date(feedback.session.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center mb-4">
              <Activity className="w-4 h-4 mr-2" /> System Status
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Report Status</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  getReportStatus() === 'Generated' ? 'bg-green-100 text-green-800' :
                  getReportStatus() === 'Generating' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getReportStatus()}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session ID</p>
                <p className="text-xs text-gray-400 truncate">{feedback.session._id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Feedback Data */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Ratings Summary</h3>
              <div className="text-right">
                <span className="text-3xl font-bold text-brand-600">{getAvgRating()}</span>
                <span className="text-gray-500 ml-1">/ 5.0</span>
                <p className="text-xs text-gray-400 uppercase font-medium tracking-wide">Average</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Overall Platform Experience</h4>
                  <p className="text-sm text-gray-500">How was the interface and the flow?</p>
                </div>
                {renderStars(feedback.overallExperience)}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Quality of Questions</h4>
                  <p className="text-sm text-gray-500">Were they clear and relevant?</p>
                </div>
                {renderStars(feedback.questionQuality)}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">How Well It Tested Your Skills</h4>
                  <p className="text-sm text-gray-500">Did it reflect real-world scenarios?</p>
                </div>
                {renderStars(feedback.skillTesting)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-400" /> Additional Suggestions
            </h3>
            {feedback.additionalSuggestions ? (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap border border-gray-100">
                {feedback.additionalSuggestions}
              </div>
            ) : (
              <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-100">
                No additional suggestions provided by candidate.
              </p>
            )}
          </div>
        </div>

      </div>
    </Container>
  );
}
