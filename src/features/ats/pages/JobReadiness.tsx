import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { atsService, type JobReadinessResponse, type ReadinessSkill, type RecommendedAction } from '../../../services/ats.service';
import { ROUTES } from '../../../constants/routes';
import { AlertCircle, ArrowLeft, Briefcase, CheckCircle2, Target, AlertTriangle, ShieldAlert } from 'lucide-react';

export function JobReadiness() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [readiness, setReadiness] = useState<JobReadinessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReadiness();
  }, [id]);

  const loadReadiness = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await atsService.getJobReadiness(id);
      setReadiness(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load job readiness details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-20 flex justify-center items-center">
        <Spinner className="h-8 w-8 text-primary" />
      </Container>
    );
  }

  if (error || !readiness) {
    return (
      <Container className="py-8">
        <Button variant="ghost" onClick={() => navigate(ROUTES.ATS)} className="mb-6 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to ATS Dashboard
        </Button>
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-100 rounded-lg max-w-2xl mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load Job Readiness</h2>
          <p className="text-gray-600 mb-6">{error || "The job description could not be found or is inaccessible."}</p>
          <Button onClick={loadReadiness} variant="outline">Retry</Button>
        </div>
      </Container>
    );
  }

  // Mappings
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800 border-green-200';
      case 'STRONG': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'NEEDS_PREPARATION': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'INSUFFICIENT_DATA': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
      case 'STRONG': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'MODERATE': return <Target className="h-5 w-5 text-yellow-600" />;
      case 'NEEDS_PREPARATION': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'INSUFFICIENT_DATA': return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default: return null;
    }
  };

  const renderSkillBadge = (s: ReadinessSkill, colorClass: string) => {
    return (
      <div key={s.skill} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 p-2 rounded border border-gray-100 bg-gray-50">
        <span className={`text-sm font-medium ${colorClass}`}>{s.skill}</span>
        {s.actionableSkillKey && (
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs py-1 h-auto"
            onClick={() => navigate(`${ROUTES.INTERVIEW}?targetSkill=${encodeURIComponent(s.actionableSkillKey as string)}`)}
          >
            Practice
          </Button>
        )}
      </div>
    );
  };

  const renderAction = (action: RecommendedAction, idx: number) => {
    let onClickHandler = undefined;
    let buttonLabel = undefined;
    
    if (action.action === 'UPLOAD_RESUME') {
      onClickHandler = () => navigate(ROUTES.RESUME_UPLOAD);
      buttonLabel = 'Upload Resume';
    } else if (action.action === 'COMPLETE_MORE_INTERVIEWS') {
      onClickHandler = () => navigate(ROUTES.INTERVIEW);
      buttonLabel = 'Start Practice';
    } else if (action.action === 'PRACTICE_TARGET_SKILL' || action.action === 'REVIEW_PERSISTENT_WEAKNESS') {
      if (action.targetSkill) {
        onClickHandler = () => navigate(`${ROUTES.INTERVIEW}?targetSkill=${encodeURIComponent(action.targetSkill as string)}`);
        buttonLabel = 'Practice Skill';
      }
    } else if (action.action === 'IMPROVE_RESUME_SKILL') {
       onClickHandler = () => navigate(ROUTES.RESUME);
       buttonLabel = 'Update Resume';
    } else if (action.action === 'READY_TO_APPLY') {
       onClickHandler = () => navigate(ROUTES.ATS);
       buttonLabel = 'Return to Jobs';
    }

    return (
      <Card key={idx} className="bg-white shadow-sm border-gray-200 h-full">
        <CardContent className="p-4 flex flex-col h-full">
          <div className="font-semibold text-gray-900 mb-1">{action.title}</div>
          <div className="text-sm text-gray-600 mb-4 flex-grow">{action.description}</div>
          {onClickHandler && buttonLabel && (
            <Button size="sm" onClick={onClickHandler} className="w-full mt-auto">
              {buttonLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container className="py-8">
      <Button variant="ghost" onClick={() => navigate(ROUTES.ATS)} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to ATS Dashboard
      </Button>

      <PageHeader 
        title="Job Readiness Report" 
        description="Deterministic analysis of your resume and interview history against this job." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Left Column: Hero & Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center overflow-hidden border-0 shadow-md ring-1 ring-gray-200">
            <div className={`py-6 border-b ${getStatusColor(readiness.readinessStatus)}`}>
              <div className="flex justify-center mb-2">
                {getStatusIcon(readiness.readinessStatus)}
              </div>
              <div className="text-4xl font-bold tracking-tight">
                {readiness.readinessScore}
                <span className="text-xl font-medium opacity-60">/100</span>
              </div>
              <div className="text-sm font-semibold mt-1 tracking-wider uppercase opacity-80">
                {readiness.readinessStatus.replace('_', ' ')}
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                {readiness.summary}
              </p>
            </CardContent>
          </Card>

          {readiness.readinessStatus !== 'INSUFFICIENT_DATA' && (
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-lg">Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Resume Match (50%)</span>
                  <span className="font-semibold text-gray-900">+{readiness.scoreBreakdown.resumeMatch}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Interview Alignment (30%)</span>
                  <span className="font-semibold text-gray-900">+{readiness.scoreBreakdown.interviewAlignment}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Practice Progress (20%)</span>
                  <span className="font-semibold text-gray-900">+{readiness.scoreBreakdown.practiceProgress}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                  <span className="text-red-600 flex items-center gap-1">
                    <ShieldAlert className="h-4 w-4" /> Weakness Risk
                  </span>
                  <span className="font-semibold text-red-600">-{readiness.scoreBreakdown.weaknessRisk}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Skills & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Insufficient Data View */}
          {readiness.readinessStatus === 'INSUFFICIENT_DATA' ? (
             <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-100 rounded-lg text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Insufficient Data</h3>
              <p className="text-gray-600 mb-4">{readiness.summary}</p>
              <Button onClick={() => navigate(ROUTES.ATS)}>Return to Jobs</Button>
             </div>
          ) : (
            <>
              {/* Recommendations */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {readiness.recommendedActions.map((action, i) => renderAction(action, i))}
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <Card>
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-base text-green-700">Matched Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {readiness.matchedSkills.length > 0 ? (
                      readiness.matchedSkills.map(s => renderSkillBadge(s, 'text-green-800'))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No exact skill matches found.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-base text-gray-700">Missing Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {readiness.missingSkills.length > 0 ? (
                      readiness.missingSkills.map(s => renderSkillBadge(s, 'text-gray-700'))
                    ) : (
                      <p className="text-sm text-gray-500 italic">All required skills matched.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-base text-emerald-700">Relevant Strengths</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {readiness.relevantStrengths.length > 0 ? (
                      readiness.relevantStrengths.map(s => renderSkillBadge(s, 'text-emerald-800'))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No interview strengths aligned with this job.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-base text-red-700">Relevant Weaknesses</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {readiness.relevantWeaknesses.length > 0 ? (
                      readiness.relevantWeaknesses.map(s => renderSkillBadge(s, 'text-red-800'))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No interview weaknesses pose a risk.</p>
                    )}
                  </CardContent>
                </Card>

              </div>
            </>
          )}

        </div>
      </div>
    </Container>
  );
}
