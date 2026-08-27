import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { interviewService, type InterviewComparisonResponse } from '../../../services/interview.service';
import { ROUTES } from '../../../constants/routes';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, CheckCircle2, Target, Zap, AlertCircle } from 'lucide-react';

export function InterviewComparison() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const firstId = searchParams.get('first');
  const secondId = searchParams.get('second');

  const [comparison, setComparison] = useState<InterviewComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firstId || !secondId) {
      setError('Two interview IDs are required for comparison.');
      setIsLoading(false);
      return;
    }

    const loadComparison = async () => {
      try {
        const data = await interviewService.compareInterviews(firstId, secondId);
        setComparison(data);
      } catch (err: any) {
        setError(err.message || 'Failed to compare interviews.');
      } finally {
        setIsLoading(false);
      }
    };

    loadComparison();
  }, [firstId, secondId]);

  if (isLoading) {
    return (
      <Container className="py-20 flex justify-center items-center">
        <Spinner className="h-8 w-8 text-primary" />
      </Container>
    );
  }

  if (error || !comparison) {
    return (
      <Container className="py-8">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200 mb-6">
          <AlertCircle className="h-5 w-5" />
          <span>{error || 'Comparison data not found.'}</span>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.INTERVIEW_HISTORY)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
      </Container>
    );
  }

  const { firstInterview, secondInterview, scoreAnalysis, strengthComparison, weaknessComparison } = comparison;

  return (
    <Container className="py-8 max-w-5xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.INTERVIEW_HISTORY)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <PageHeader 
          title="Interview Comparison" 
          description="Analyze your progression between two completed sessions." 
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-50 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">First Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold mb-1">{firstInterview.configuration?.domain}</div>
            <div className="text-sm text-gray-600 mb-3 capitalize">
              {firstInterview.configuration?.type.toLowerCase().replace('_', ' ')} • {firstInterview.configuration?.difficulty.toLowerCase()}
            </div>
            {firstInterview.configuration?.targetSkill && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Target: {firstInterview.configuration.targetSkill}
                </span>
              </div>
            )}
            <div className="text-3xl font-bold text-gray-900 mt-4">
              {firstInterview.overallScore ?? 'N/A'}%
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {new Date(firstInterview.createdAt!).toLocaleDateString()}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate(`${ROUTES.INTERVIEW_REPORT}?id=${firstInterview._id}`)}>
              View Report
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-brand-50 border-brand-200 shadow-sm flex flex-col justify-center items-center text-center">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-brand-600 mb-2 uppercase tracking-wider">Trend Analysis</div>
            <div className="flex justify-center items-center h-16 w-16 rounded-full bg-white shadow-sm mb-4 mx-auto">
              {scoreAnalysis.trend === 'IMPROVED' ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : scoreAnalysis.trend === 'DECLINED' ? (
                <TrendingDown className="h-8 w-8 text-red-500" />
              ) : (
                <Minus className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {scoreAnalysis.scoreDifference! > 0 ? '+' : ''}{scoreAnalysis.scoreDifference}% Score
            </div>
            {scoreAnalysis.percentageChange !== null && (
              <div className={`text-sm font-medium ${scoreAnalysis.percentageChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {scoreAnalysis.percentageChange > 0 ? '+' : ''}{scoreAnalysis.percentageChange.toFixed(1)}% Relative Change
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-brand-300 ring-1 ring-brand-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-500">Second Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold mb-1">{secondInterview.configuration?.domain}</div>
            <div className="text-sm text-gray-600 mb-3 capitalize">
              {secondInterview.configuration?.type.toLowerCase().replace('_', ' ')} • {secondInterview.configuration?.difficulty.toLowerCase()}
            </div>
            {secondInterview.configuration?.targetSkill && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Target: {secondInterview.configuration.targetSkill}
                </span>
              </div>
            )}
            <div className="text-3xl font-bold text-gray-900 mt-4">
              {secondInterview.overallScore ?? 'N/A'}%
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {new Date(secondInterview.createdAt!).toLocaleDateString()}
            </div>
            <Button variant="primary" size="sm" className="mt-4 w-full" onClick={() => navigate(`${ROUTES.INTERVIEW_REPORT}?id=${secondInterview._id}`)}>
              View Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Strengths */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" /> Strengths
          </h3>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">New Strengths Acquired</h4>
            {strengthComparison.newStrengths.length > 0 ? (
              <ul className="space-y-2">
                {strengthComparison.newStrengths.map(s => (
                  <li key={s} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-green-900 font-medium capitalize">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No new strengths identified in the second session.</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Consistent Strengths</h4>
            {strengthComparison.sharedStrengths.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {strengthComparison.sharedStrengths.map(s => (
                  <span key={s} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No overlapping strengths found.</p>
            )}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
            <Target className="h-5 w-5 mr-2 text-red-500" /> Areas for Improvement
          </h3>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Resolved Weaknesses</h4>
            {weaknessComparison.resolvedWeaknesses.length > 0 ? (
              <ul className="space-y-2">
                {weaknessComparison.resolvedWeaknesses.map(w => (
                  <li key={w} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-green-900 font-medium capitalize">{w}</span>
                    <span className="text-xs text-green-600 ml-auto flex items-center h-5">No longer listed</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No previous weaknesses were resolved.</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Persistent Weaknesses</h4>
            {weaknessComparison.persistentWeaknesses.length > 0 ? (
              <ul className="space-y-2">
                {weaknessComparison.persistentWeaknesses.map(w => (
                  <li key={w} className="flex items-start gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-orange-900 font-medium capitalize">{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No persistent weaknesses carried over.</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">New Weaknesses</h4>
            {weaknessComparison.newWeaknesses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {weaknessComparison.newWeaknesses.map(w => (
                  <span key={w} className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-medium capitalize">
                    {w}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No new weaknesses identified.</p>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
