import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { 
  TrendingUp, TrendingDown, Minus, Map, AlertCircle, 
  Target, Lightbulb, RefreshCw, Activity, ArrowRight, Zap, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { interviewService, type InterviewRoadmapResponse } from '../../../services/interview.service';

export function ImprovementRoadmap() {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<InterviewRoadmapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await interviewService.getInterviewRoadmap();
      setRoadmap(data);
    } catch (err: any) {
      console.error('Failed to load roadmap:', err);
      setError('Your improvement roadmap could not be loaded right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-sm border-gray-100 bg-gray-50/30">
        <CardContent className="p-8 flex flex-col justify-center items-center">
          <Spinner className="h-8 w-8 text-brand-600 mb-4" />
          <p className="text-sm text-gray-500 font-medium">Analyzing your interview history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-gray-100 bg-red-50/30">
        <CardContent className="p-6 flex flex-col justify-center items-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
          <p className="text-sm text-gray-700 font-medium mb-4">{error}</p>
          <Button onClick={fetchRoadmap} variant="outline" size="sm" className="bg-white text-gray-600">
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!roadmap) return null;

  // Don't show roadmap if insufficient data completely
  if (roadmap.overallStatus === 'INSUFFICIENT_DATA' && roadmap.prioritySkills.length === 0 && roadmap.improvingSkills.length === 0) {
    return null; // The dashboard's empty state or general recommendations will handle the new user flow.
  }

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'IMPROVING':
        return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', label: 'Improving', message: 'Your recent performance is trending upwards.' };
      case 'DECLINING':
        return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100', label: 'Needs Focus', message: 'Your performance has dipped recently. Time to practice!' };
      case 'STABLE':
        return { icon: Minus, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Stable', message: 'Your performance is consistently stable.' };
      default:
        return { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Not Enough Data', message: 'Complete more interviews to track overall trends.' };
    }
  };

  const statusInfo = getStatusInfo(roadmap.overallStatus);
  const StatusIcon = statusInfo.icon;

  const handleActionClick = () => {
    if (roadmap.recommendedAction.action === 'TARGETED_PRACTICE' && roadmap.recommendedAction.targetSkill) {
      navigate(`${ROUTES.INTERVIEW}?targetSkill=${encodeURIComponent(roadmap.recommendedAction.targetSkill)}`);
    } else {
      navigate(ROUTES.INTERVIEW);
    }
  };

  return (
    <div className="space-y-6">
      {/* Roadmap Header & Overall Status */}
      <Card className="shadow-sm border-brand-100 bg-gradient-to-br from-white to-brand-50/50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Map className="h-5 w-5 text-brand-600" />
                <h2 className="text-xl font-bold text-gray-900">Your Improvement Roadmap</h2>
              </div>
              <p className="text-sm text-gray-600 max-w-xl">
                Personalized action plan based on your historical interview performance and skill trends.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm min-w-[240px]">
              <div className={`p-3 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                <StatusIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Trend</p>
                <p className={`font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Priorities & Focus */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Priority Skills */}
          <Card className="shadow-sm border-gray-100 h-full">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-lg flex items-center text-gray-900">
                <Target className="mr-2 h-5 w-5 text-red-500" />
                Priority Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {roadmap.prioritySkills.length > 0 ? (
                <div className="space-y-4">
                  {roadmap.prioritySkills.map((skill, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 capitalize text-base">{skill.skill}</h4>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                            skill.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                            skill.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {skill.priority} Priority
                          </span>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                            skill.trend === 'PERSISTENT' ? 'bg-purple-100 text-purple-700' :
                            skill.trend === 'NEW' ? 'bg-blue-100 text-blue-700' :
                            skill.trend === 'REGRESSING' ? 'bg-rose-100 text-rose-700' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {skill.trend}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{skill.reason}</p>
                        <p className="text-xs text-gray-400 font-medium">Seen in {skill.occurrences} interview{skill.occurrences !== 1 ? 's' : ''}</p>
                      </div>
                      
                      {skill.actionableSkillKey && (
                        <div className="sm:text-right flex-shrink-0 mt-2 sm:mt-0">
                          <Button 
                            onClick={() => navigate(`${ROUTES.INTERVIEW}?targetSkill=${encodeURIComponent(skill.actionableSkillKey!)}`)}
                            size="sm" 
                            className="bg-brand-600 hover:bg-brand-700 text-white w-full sm:w-auto"
                          >
                            <Zap className="mr-2 h-4 w-4" /> Practice This Skill
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-900 font-medium mb-1">No Priority Weaknesses</p>
                  <p className="text-sm text-gray-500">You don't have any recurring actionable weaknesses right now.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Actions, Category Focus, Improvements, Impact */}
        <div className="space-y-6">
          
          {/* Next Recommended Action */}
          <Card className="shadow-sm border-brand-200 bg-brand-50/40">
            <CardHeader className="pb-3 border-b border-brand-100/50">
              <CardTitle className="text-lg flex items-center text-brand-900">
                <Lightbulb className="mr-2 h-5 w-5 text-brand-600" />
                Next Recommended Action
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col">
              <div className="flex-1 mb-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {roadmap.recommendedAction.action === 'TARGETED_PRACTICE' ? 'Targeted Practice' :
                   roadmap.recommendedAction.action === 'PRACTICE_INTERVIEW_TYPE' ? 'Focus on Category' :
                   roadmap.recommendedAction.action === 'COMPLETE_MORE_INTERVIEWS' ? 'Gather More Data' :
                   'Keep Up the Good Work'}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">{roadmap.recommendedAction.reason}</p>
              </div>
              <Button onClick={handleActionClick} className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-sm">
                {roadmap.recommendedAction.action === 'TARGETED_PRACTICE' ? 'Practice Target Skill' : 'Start Interview'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Category Focus */}
          {roadmap.categoryFocus && (
            <Card className="shadow-sm border-orange-100 bg-orange-50/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Recommended Category Focus</h4>
                    <p className="text-sm text-gray-700 capitalize font-medium mt-1 mb-1">{roadmap.categoryFocus.type.replace('_', ' ').toLowerCase()}</p>
                    <p className="text-xs text-gray-600">{roadmap.categoryFocus.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Improving Skills */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                Improving Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {roadmap.improvingSkills.length > 0 ? (
                <ul className="space-y-3">
                  {roadmap.improvingSkills.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{skill.skill}</p>
                        <p className="text-xs text-gray-500">{skill.reason}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  No clear improving skill patterns yet. Keep practicing to build your progress history.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Targeted Practice Impact */}
          {roadmap.targetedPracticeImpact.length > 0 && (
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-3 border-b border-gray-50">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-purple-500" />
                  Targeted Practice Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-4">
                  {roadmap.targetedPracticeImpact.map((impact, idx) => (
                    <li key={idx} className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                      <p className="text-sm font-semibold text-gray-900 capitalize mb-1">{impact.skill}</p>
                      <p className="text-xs text-gray-700 leading-relaxed mb-2">{impact.message}</p>
                      {impact.previousAverage !== null ? (
                        <div className="flex items-center text-xs font-medium text-gray-500">
                          <span>Prev Avg: {impact.previousAverage}%</span>
                          <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                          <span className="text-purple-700 font-bold">Targeted: {impact.targetedScore}%</span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Not enough historical data for a baseline comparison.</p>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
