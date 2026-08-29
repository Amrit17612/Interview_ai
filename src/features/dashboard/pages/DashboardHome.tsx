import { useState, useEffect } from 'react';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { 
  Play, FileText, Sparkles, Briefcase, AlertCircle, Video, Clock, BarChart3, 
  TrendingUp, TrendingDown, Minus, CheckCircle, RefreshCw, Star, Lightbulb, Target, Trophy
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/hooks/useAuth';
import { resumeService, type Resume } from '../../../services/resume.service';
import { atsService, type JobDescription } from '../../../services/ats.service';
import { interviewService, type InterviewStatsData } from '../../../services/interview.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ImprovementRoadmap } from '../components/ImprovementRoadmap';

export function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [stats, setStats] = useState<InterviewStatsData | null>(null);
  
  const location = useLocation();
  const [successMsg] = useState<string | null>((location.state as any)?.message || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resumesData, jobsData, statsData] = await Promise.all([
        resumeService.getResumes().catch(() => []),
        atsService.getJobDescriptions().catch(() => []),
        interviewService.getInterviewStats()
      ]);
      
      setResumes(resumesData);
      setJobs(jobsData);
      setStats(statsData);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInterviewClick = (id: string) => {
    navigate(`${ROUTES.INTERVIEW_REPORT}?id=${id}`);
  };

  const getGreeting = () => {
    if (user?.firstName) {
      return `Good morning, ${user.firstName}`;
    }
    return "Welcome back";
  };

  const getRecommendedAction = () => {
    if (resumes.length === 0) {
      return {
        title: "Upload Resume",
        description: "You haven't uploaded a resume yet. Let's start by adding your resume to establish a baseline.",
        icon: FileText,
        route: ROUTES.RESUME,
        buttonText: "Upload Resume"
      };
    }
    if (jobs.length === 0) {
      return {
        title: "Add Job Description",
        description: "You have a resume, but no target job descriptions. Add a job description to focus your preparation.",
        icon: Briefcase,
        route: ROUTES.ATS,
        buttonText: "Add Job Description"
      };
    }
    return {
      title: "Practice Interview",
      description: "Your documents are ready. Start a practice interview to test your readiness.",
      icon: Play,
      route: ROUTES.INTERVIEW,
      buttonText: "Start Interview"
    };
  };

  const recommendedAction = getRecommendedAction();

  if (isLoading) {
    return (
      <Container className="py-8 max-w-7xl flex justify-center items-center h-64">
        <Spinner className="h-8 w-8 text-brand-600" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center p-12 bg-red-50/50 rounded-xl border border-red-100">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{error}</h2>
          <Button onClick={fetchData} variant="outline" className="mt-4 bg-white border-red-200 text-red-700 hover:bg-red-50">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      </Container>
    );
  }

  if (!stats) return null;

  // Empty state for new users
  if (stats.summary.totalInterviews === 0) {
    return (
      <Container className="py-8 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="w-full">
              {successMsg && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-start gap-3 shadow-sm">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">{successMsg}</p>
                  </div>
                </div>
              )}
              <PageHeader 
                title={getGreeting()} 
                description="Welcome to Interviu AI. Start your interview preparation journey." 
              />
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="border-brand-100 bg-brand-50/30 shadow-sm mb-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-brand-900">
                  <Sparkles className="mr-2 h-5 w-5 text-brand-600" />
                  Recommended Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 font-medium">{recommendedAction.title}</p>
                <p className="text-gray-600 mb-4 text-sm">
                  {recommendedAction.description}
                </p>
                <NavLink to={recommendedAction.route}>
                  <Button className="bg-brand-600 hover:bg-brand-700 text-white">
                    <recommendedAction.icon className="mr-2 h-4 w-4" /> {recommendedAction.buttonText}
                  </Button>
                </NavLink>
              </CardContent>
            </Card>

            <EmptyState 
              title="No interview data yet" 
              description="Complete your first interview to start tracking your progress and unlocking analytics." 
              actionLabel="Start Interview"
              actionPath={ROUTES.INTERVIEW}
            />
          </div>
        </motion.div>
      </Container>
    );
  }

  // Format data for chart (reverse recentPerformance to chronological)
  const chartData = [...stats.recentPerformance]
    .reverse()
    .filter(p => p.overallScore !== null)
    .map(p => ({
      date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: p.overallScore,
      domain: p.domain
    }));

  const getTrendIcon = (trend: string) => {
    if (trend === 'UP') return <TrendingUp className="h-5 w-5" />;
    if (trend === 'DOWN') return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'UP') return "bg-green-50 text-green-600";
    if (trend === 'DOWN') return "bg-red-50 text-red-600";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <Container className="py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
          <div className="w-full sm:w-auto">
            {successMsg && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-start gap-3 shadow-sm">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">{successMsg}</p>
                </div>
              </div>
            )}
            <PageHeader 
              title={getGreeting()} 
              description="Here's your comprehensive interview progress analytics." 
            />
          </div>
          <NavLink to={ROUTES.INTERVIEW} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto shadow-sm bg-brand-600 hover:bg-brand-700 text-white">
              <Play className="mr-2 h-4 w-4" /> Start Interview
            </Button>
          </NavLink>
        </div>

        {/* 1. PERSONALIZED IMPROVEMENT ROADMAP */}
        <ImprovementRoadmap />

        {/* 2. PERFORMANCE SUMMARY (6 Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-center items-center text-center">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-full mb-2">
                <Video className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.summary.totalInterviews}</h3>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-center items-center text-center">
              <div className="p-2 bg-green-50 text-green-600 rounded-full mb-2">
                <CheckCircle className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Completed</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.summary.completedInterviews}</h3>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-center items-center text-center">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-full mb-2">
                <Target className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Average Score</p>
              <h3 className="text-xl font-bold text-brand-700">
                {stats.summary.averageScore !== null ? `${stats.summary.averageScore}%` : <span className="text-sm text-gray-400 font-normal">--</span>}
              </h3>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-center items-center text-center">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-full mb-2">
                <Trophy className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Highest Score</p>
              <h3 className="text-xl font-bold text-gray-900">
                {stats.summary.highestScore !== null ? `${stats.summary.highestScore}%` : <span className="text-sm text-gray-400 font-normal">--</span>}
              </h3>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100 col-span-2 sm:col-span-1 lg:col-span-2">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-center items-center text-center h-full">
              {stats.improvementData.available ? (
                <>
                  <div className={`p-2 rounded-full mb-2 ${getTrendColor(stats.improvementData.trend)}`}>
                    {getTrendIcon(stats.improvementData.trend)}
                  </div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Improvement Trend</p>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    {stats.improvementData.percentage! > 0 ? '+' : ''}{stats.improvementData.percentage}%
                  </h3>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gray-100 text-gray-400 rounded-full mb-2">
                    <Minus className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Improvement Trend</p>
                  <h3 className="text-sm font-medium text-gray-400 text-center max-w-[150px]">
                    {stats.improvementData.message || "Insufficient Data"}
                  </h3>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 2. SCORE TREND VISUALIZATION */}
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-gray-500" />
              Chronological Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-[280px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any, _name: any, props: any) => [`${value}%`, props.payload.domain || 'Score']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#0ea5e9' }} 
                    activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                <TrendingUp className="h-8 w-8 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">No completed interviews yet</p>
                <p className="text-xs">Scores will appear here as you complete interviews.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3, 4. PERFORMANCE BY CATEGORY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Difficulty Stats */}
          <Card className="shadow-sm border-gray-100 flex flex-col h-[260px]">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-base font-semibold">By Difficulty</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1 overflow-y-auto pr-2">
              {stats.difficultyStats.length > 0 ? (
                <div className="space-y-4">
                  {stats.difficultyStats.map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">{stat.difficulty.toLowerCase()}</div>
                        <div className="text-xs text-gray-500">{stat.completedCount} completed</div>
                      </div>
                      <div className="text-right">
                        {stat.averageScore !== null ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            stat.averageScore >= 80 ? 'bg-green-100 text-green-800' : 
                            stat.averageScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {stat.averageScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">--</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center mt-8">No data.</p>
              )}
            </CardContent>
          </Card>

          {/* Type Stats */}
          <Card className="shadow-sm border-gray-100 flex flex-col h-[260px]">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-base font-semibold">By Interview Type</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1 overflow-y-auto pr-2">
              {stats.typeStats.length > 0 ? (
                <div className="space-y-4">
                  {stats.typeStats.map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">{stat.type.replace('_', ' ').toLowerCase()}</div>
                        <div className="text-xs text-gray-500">{stat.completedCount} completed</div>
                      </div>
                      <div className="text-right">
                        {stat.averageScore !== null ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            stat.averageScore >= 80 ? 'bg-green-100 text-green-800' : 
                            stat.averageScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {stat.averageScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">--</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center mt-8">No data.</p>
              )}
            </CardContent>
          </Card>

          {/* Domain Stats */}
          <Card className="shadow-sm border-gray-100 flex flex-col h-[260px]">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-base font-semibold">By Domain</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1 overflow-y-auto pr-2">
              {stats.domainStats.length > 0 ? (
                <div className="space-y-4">
                  {stats.domainStats.slice(0, 5).map((domain, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="truncate max-w-[140px]" title={domain.domain}>
                        <div className="text-sm font-medium text-gray-900 truncate">{domain.domain}</div>
                        <div className="text-xs text-gray-500">{domain.completedCount} completed</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {domain.averageScore !== null ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            domain.averageScore >= 80 ? 'bg-green-100 text-green-800' : 
                            domain.averageScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {domain.averageScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">--</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center mt-8">No data.</p>
              )}
            </CardContent>
          </Card>

        </div>

        {/* 5, 6. INSIGHTS (Strengths & Weaknesses) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-lg flex items-center text-green-700">
                <Star className="mr-2 h-5 w-5" />
                Strongest Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {stats.skillAnalysis.strengths.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.skillAnalysis.strengths.slice(0, 5).map((skill, idx) => (
                    <div key={idx} className="bg-green-50 border border-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center shadow-sm">
                      <span className="capitalize">{skill.skill}</span>
                      <span className="ml-2 bg-green-200 text-green-900 text-xs px-1.5 py-0.5 rounded-full">
                        {skill.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recurring strengths identified yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-lg flex items-center text-red-700">
                <AlertCircle className="mr-2 h-5 w-5" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {stats.skillAnalysis.weaknesses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.skillAnalysis.weaknesses.slice(0, 5).map((skill, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-xl text-sm font-medium flex flex-col justify-between shadow-sm flex-1 min-w-[140px]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="capitalize">{skill.skill}</span>
                        <span className="bg-red-200 text-red-900 text-xs px-2 py-1 rounded-full">
                          {skill.count}
                        </span>
                      </div>
                      {skill.actionableSkillKey && (
                        <button
                          onClick={() => navigate(`${ROUTES.INTERVIEW}?targetSkill=${skill.actionableSkillKey}`)}
                          className="mt-1 flex items-center justify-center text-xs bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-lg transition-colors"
                        >
                          Practice This Skill
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recurring weaknesses identified yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 7. RECOMMENDATIONS & HISTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border-gray-100 lg:col-span-2">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-lg flex items-center text-brand-900">
                <Lightbulb className="mr-2 h-5 w-5 text-brand-500 fill-brand-100" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {stats.recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {stats.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start p-3 bg-brand-50/40 border border-brand-100/50 rounded-lg">
                      <Sparkles className="h-4 w-4 text-brand-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-800 font-medium leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center p-6 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                  <p className="text-sm text-gray-500">Complete more interviews to receive personalized insights.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-3 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Interviews</CardTitle>
                <NavLink to={ROUTES.INTERVIEW_HISTORY} className="text-sm text-brand-600 font-medium hover:text-brand-700">View All</NavLink>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {stats.recentPerformance.length === 0 ? (
                <p className="text-sm text-gray-500 text-center mt-4">No history.</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentPerformance.slice(0, 4).map((session) => (
                    <div 
                      key={session.id} 
                      onClick={() => handleInterviewClick(session.id)}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-colors flex justify-between items-center"
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-gray-900 text-sm truncate">{session.domain}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" /> {new Date(session.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {session.overallScore !== null ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {session.overallScore}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </motion.div>
    </Container>
  );
}