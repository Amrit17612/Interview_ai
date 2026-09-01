import { useState, useEffect } from 'react';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { 
  Map, Target, ArrowUpRight, ArrowDownRight, 
  Minus, RefreshCw, AlertCircle, Play, 
  TrendingUp, CheckCircle, Crosshair
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { interviewService, type InterviewRoadmapResponse } from '../../../services/interview.service';

export function LearningRoadmap() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<InterviewRoadmapResponse | null>(null);

  const fetchRoadmap = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await interviewService.getInterviewRoadmap();
      setRoadmapData(data);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load your learning roadmap.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'IMPROVING':
        return { text: "You're improving", icon: <TrendingUp className="h-5 w-5 text-green-500" />, bg: "bg-green-50", color: "text-green-700" };
      case 'DECLINING':
        return { text: "Your recent performance needs attention", icon: <ArrowDownRight className="h-5 w-5 text-red-500" />, bg: "bg-red-50", color: "text-red-700" };
      case 'STABLE':
        return { text: "Your performance is stable", icon: <Minus className="h-5 w-5 text-blue-500" />, bg: "bg-blue-50", color: "text-blue-700" };
      case 'INSUFFICIENT_DATA':
        return { text: "More interview data needed", icon: <AlertCircle className="h-5 w-5 text-amber-500" />, bg: "bg-amber-50", color: "text-amber-700" };
      default:
        return { text: "Status unknown", icon: <Minus className="h-5 w-5 text-gray-500" />, bg: "bg-gray-50", color: "text-gray-700" };
    }
  };

  if (isLoading) {
    return (
      <Container className="py-8 max-w-7xl">
        <PageHeader title="Learning Roadmap" description="Your personalized path to mastering the interview." />
        <div className="flex justify-center items-center h-64 mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <Spinner className="h-8 w-8 text-brand-600" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8 max-w-7xl">
        <PageHeader title="Learning Roadmap" description="Your personalized path to mastering the interview." />
        <div className="mt-8">
          <Card className="shadow-sm border-gray-100 bg-red-50/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{error}</h3>
              <Button onClick={fetchRoadmap} variant="outline" className="mt-4 bg-white border-red-200 text-red-700 hover:bg-red-50">
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  if (!roadmapData) return null;

  const { overallStatus, recommendedAction, prioritySkills, improvingSkills, categoryFocus, targetedPracticeImpact } = roadmapData;
  const statusDisplay = getStatusDisplay(overallStatus);
  const isInsufficient = overallStatus === 'INSUFFICIENT_DATA';

  if (isInsufficient) {
    return (
      <Container className="py-8 max-w-7xl">
        <PageHeader title="Learning Roadmap" description="Your personalized path to mastering the interview." />
        <div className="mt-8">
          <Card className="shadow-sm border-gray-100 bg-gray-50/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mb-6">
                <Map className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">More Interview Data Needed</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {recommendedAction?.reason || "Complete more interviews to gather enough data for personalized recommendations."}
              </p>
              <Button onClick={() => navigate(ROUTES.INTERVIEW)} className="bg-brand-600 hover:bg-brand-700 text-white">
                <Play className="mr-2 h-4 w-4" /> Start Interview
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  const renderTrend = (trend: string) => {
    switch (trend) {
      case 'NEW':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">New Weakness</span>;
      case 'PERSISTENT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Persistent</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Resolved</span>;
      case 'REGRESSING':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Regressing</span>;
      default:
        return null;
    }
  };

  const renderPriority = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <span className="text-xs font-bold text-red-600 uppercase tracking-wider">High Priority</span>;
      case 'MEDIUM':
        return <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Medium Priority</span>;
      case 'LOW':
        return <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Low Priority</span>;
      default:
        return null;
    }
  };

  return (
    <Container className="py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <PageHeader title="Learning Roadmap" description="Your personalized path to mastering the interview." />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overall Status and Recommendation */}
            <Card className="shadow-sm border-gray-100 bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className={`p-4 rounded-xl flex items-center justify-center ${statusDisplay.bg}`}>
                    {statusDisplay.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold uppercase tracking-wider mb-1 ${statusDisplay.color}`}>
                      {statusDisplay.text}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {recommendedAction.action.replace(/_/g, ' ')}
                      {recommendedAction.targetSkill ? `: ${recommendedAction.targetSkill}` : ''}
                      {recommendedAction.targetType ? `: ${recommendedAction.targetType}` : ''}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {recommendedAction.reason}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {recommendedAction.action === 'COMPLETE_MORE_INTERVIEWS' || recommendedAction.action === 'TARGETED_PRACTICE' || recommendedAction.action === 'PRACTICE_INTERVIEW_TYPE' ? (
                      <Button onClick={() => navigate(ROUTES.INTERVIEW)} className="w-full bg-brand-600 hover:bg-brand-700 text-white">
                        <Play className="mr-2 h-4 w-4" /> Start Practice
                      </Button>
                    ) : (
                      <Button onClick={() => navigate(ROUTES.INTERVIEW)} variant="outline" className="w-full bg-white">
                        Continue Practice
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Priority Skills */}
            {prioritySkills.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Target className="mr-2 h-5 w-5 text-brand-600" />
                  Focus Areas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prioritySkills.map((skill, idx) => (
                    <Card key={idx} className="shadow-sm border-gray-100 hover:border-brand-200 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <div>
                            {renderPriority(skill.priority)}
                            <h4 className="text-lg font-bold text-gray-900 mt-1 capitalize">{skill.skill}</h4>
                          </div>
                          {renderTrend(skill.trend)}
                        </div>
                        <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">{skill.reason}</p>
                        <div className="flex items-center text-xs text-gray-500 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                          <Map className="mr-1.5 h-3.5 w-3.5" />
                          Identified across {skill.occurrences} {skill.occurrences === 1 ? 'interview' : 'interviews'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Targeted Practice Impact */}
            {targetedPracticeImpact && targetedPracticeImpact.length > 0 && (
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Crosshair className="mr-2 h-5 w-5 text-indigo-600" />
                  Targeted Practice Impact
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {targetedPracticeImpact.map((impact, idx) => (
                    <Card key={idx} className="shadow-sm border-indigo-100 bg-indigo-50/30">
                      <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 capitalize">{impact.skill}</h4>
                          <p className="text-sm text-gray-600 mt-1">{impact.message}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {impact.previousAverage !== null && (
                            <div className="text-center bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
                              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Previous</p>
                              <p className="text-base font-bold text-gray-700">{impact.previousAverage}%</p>
                            </div>
                          )}
                          {impact.previousAverage !== null && <ArrowUpRight className="h-5 w-5 text-indigo-400" />}
                          <div className="text-center bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm">
                            <p className="text-[10px] text-indigo-600 font-medium uppercase tracking-wider">New Score</p>
                            <p className="text-base font-bold text-indigo-700">{impact.targetedScore}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Category Focus */}
            {categoryFocus && (
              <Card className="shadow-sm border-gray-100 border-t-4 border-t-orange-400 bg-gradient-to-b from-white to-orange-50/20">
                <CardHeader className="pb-2 border-b border-gray-50">
                  <CardTitle className="text-base flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                    Category Focus
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <h4 className="text-lg font-bold text-gray-900 capitalize mb-1">
                    {categoryFocus.type.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">{categoryFocus.reason}</p>
                  <div className="bg-orange-50 px-3 py-2 rounded-lg flex justify-between items-center border border-orange-100">
                    <span className="text-sm font-medium text-orange-800">Average Score</span>
                    <span className="font-bold text-orange-900">{categoryFocus.averageScore}%</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Improving Skills */}
            {improvingSkills.length > 0 && (
              <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-2 border-b border-gray-50">
                  <CardTitle className="text-base flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Skills You're Improving
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {improvingSkills.map((skill, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="p-2 bg-green-50 rounded-lg shrink-0">
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 capitalize">{skill.skill}</h4>
                        <p className="text-xs text-gray-500 mt-1">{skill.reason}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </motion.div>
    </Container>
  );
}
