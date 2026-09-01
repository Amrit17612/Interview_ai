import { useState, useEffect } from 'react';
import { Container } from '../../../components/ui/Container';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { 
  Play, Sparkles, AlertCircle, Video, BarChart3, 
  CheckCircle, RefreshCw, Target, 
  Flame, Coins, Award, Compass, ShieldCheck, Map
} from 'lucide-react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { useAuth } from '../../auth/hooks/useAuth';
import { resumeService } from '../../../services/resume.service';
import { atsService } from '../../../services/ats.service';
import { interviewService, type InterviewStatsData, type InterviewRoadmapResponse } from '../../../services/interview.service';
import { apiClient } from '../../../services/api.client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<InterviewStatsData | null>(null);
  const [roadmap, setRoadmap] = useState<InterviewRoadmapResponse | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  
  const location = useLocation();
  const [successMsg] = useState<string | null>((location.state as any)?.message || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [, , statsData, roadmapData, templatesData] = await Promise.all([
        resumeService.getResumes().catch(() => []),
        atsService.getJobDescriptions().catch(() => []),
        interviewService.getInterviewStats(),
        interviewService.getInterviewRoadmap().catch(() => null),
        apiClient.get('/api/interview-templates').then(res => res.data.data).catch(() => [])
      ]);
      
      setStats(statsData);
      setRoadmap(roadmapData);
      setTemplates(templatesData);
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
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    if (user?.firstName) {
      return `Good ${timeOfDay}, ${user.firstName}`;
    }
    return `Good ${timeOfDay}`;
  };

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

  // Format data for chart (reverse recentPerformance to chronological)
  const chartData = [...stats.recentPerformance]
    .reverse()
    .filter(p => p.overallScore !== null)
    .map(p => ({
      chartKey: p.id,
      date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: p.overallScore,
      domain: p.domain
    }));

  const credits = user?.credits || 0;
  const hasInterviews = stats.summary.totalInterviews > 0;

  return (
    <Container className="py-6 max-w-7xl space-y-6">
      
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-start gap-3 shadow-sm">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="font-medium text-green-800">{successMsg}</p>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {getGreeting()} 👋
          </h1>
          <p className="text-gray-500 mt-1">Let's crack your dream job together.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to={ROUTES.CREDITS} className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors cursor-pointer">
            <Coins className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xs text-amber-700 font-medium leading-none">Credits</p>
              <p className="text-sm font-bold text-amber-900 leading-none mt-1">{credits}</p>
            </div>
          </Link>
          <NavLink to={ROUTES.INTERVIEW}>
            <Button className="shadow-sm bg-brand-600 hover:bg-brand-700 text-white">
              <Play className="mr-2 h-4 w-4" /> Start Practice
            </Button>
          </NavLink>
        </div>
      </div>

      {/* PRIMARY DASHBOARD METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-full mb-2">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Overall Readiness</p>
            <h3 className="text-lg font-bold text-brand-700">
              {hasInterviews && stats.summary.averageScore ? `${Math.round(stats.summary.averageScore * 0.9)}%` : '--'}
            </h3>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-full mb-2">
              <Video className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Interviews Taken</p>
            <h3 className="text-lg font-bold text-gray-900">{stats.summary.completedInterviews}</h3>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-green-50 text-green-600 rounded-full mb-2">
              <Target className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Average Score</p>
            <h3 className="text-lg font-bold text-gray-900">
              {stats.summary.averageScore !== null ? `${stats.summary.averageScore}%` : '--'}
            </h3>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-full mb-2">
              <Flame className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Practice Streak</p>
            <h3 className="text-lg font-bold text-gray-400 text-sm mt-1">No data</h3>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-full mb-2">
              <Award className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Achievements</p>
            <h3 className="text-lg font-bold text-gray-400 text-sm mt-1">Locked</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Overview Graph */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-2 border-b border-gray-50">
              <CardTitle className="text-base flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-gray-500" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-[280px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="chartKey" tickFormatter={(value) => chartData.find(d => d.chartKey === value)?.date || value} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip labelFormatter={(label) => chartData.find(d => d.chartKey === label)?.date || label} contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <BarChart3 className="h-8 w-8 mb-3 opacity-50" />
                  <p className="text-sm">Complete interviews to see your progress trends.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Continue Practice / Today's Goal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm border-brand-100 bg-brand-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-brand-900 flex items-center">
                  <Compass className="mr-2 h-4 w-4 text-brand-600" />
                  Today's Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.summary.inProgressInterviews > 0 ? (
                  <>
                    <p className="text-sm text-brand-800 mb-4 font-medium">Complete your in-progress mock interview</p>
                    <div className="w-full bg-brand-200 rounded-full h-2 mb-2">
                      <div className="bg-brand-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                    <p className="text-xs text-brand-600 text-right">Resume progress</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-brand-800 mb-4 font-medium">Complete 1 practice mock interview</p>
                    <div className="w-full bg-brand-200 rounded-full h-2 mb-2">
                      <div className="bg-brand-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="text-xs text-brand-600 text-right">0/1 completed</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                  <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                  Smart Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recommendations.length > 0 ? (
                  <p className="text-sm text-gray-700">{stats.recommendations[0]}</p>
                ) : (
                  <p className="text-sm text-gray-500">Upload your resume and complete a mock interview to get AI recommendations.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weak Areas */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-base flex items-center text-red-700">
                <AlertCircle className="mr-2 h-5 w-5" />
                Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {stats.skillAnalysis.weaknesses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.skillAnalysis.weaknesses.slice(0, 4).map((skill, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-100 text-red-800 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center">
                      <span className="capitalize">{skill.skill}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Complete more interviews to identify weak areas.</p>
              )}
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Featured Templates */}
          <Card className="shadow-sm border-gray-100 border-2 border-brand-100 bg-gradient-to-b from-white to-brand-50/20">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-base flex items-center text-brand-800">
                <Sparkles className="mr-2 h-5 w-5 text-brand-500" />
                Featured Interviews
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {templates.length > 0 ? (
                <div className="space-y-3">
                  {templates.slice(0, 3).map(t => (
                    <div key={t._id} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{t.title}</h4>
                          <div className="flex gap-2 text-xs text-gray-500 mt-1">
                            <span>{t.difficulty}</span>
                            <span>•</span>
                            <span>{t.questionCount || 0} Qs</span>
                          </div>
                        </div>
                        {t.isLocked ? (
                          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">Locked</span>
                        ) : (
                          <button 
                            onClick={async () => {
                              try {
                                const res = await apiClient.post(`/api/interview-templates/${t._id}/start`);
                                navigate(`${ROUTES.INTERVIEW_ACTIVE}?id=${res.data.data.sessionId}`);
                              } catch (err) {
                                alert('Failed to start template');
                              }
                            }}
                            className="text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-1.5 rounded transition-colors"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">No featured templates available.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Personalized Roadmap */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-base flex items-center">
                <Map className="mr-2 h-5 w-5 text-gray-500" />
                Learning Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {roadmap && roadmap.prioritySkills.length > 0 ? (
                <div className="space-y-4">
                  {roadmap.prioritySkills.slice(0, 2).map((skill, idx) => (
                    <div className="flex gap-3" key={idx}>
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${idx === 0 ? 'bg-brand-100' : 'bg-gray-100'}`}>
                        <div className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-brand-600' : 'bg-gray-300'}`}></div>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${idx === 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                          Focus: {skill.skill}
                        </p>
                        {idx === 0 && (
                          <p className="text-xs text-gray-500 mt-1">{skill.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-full mb-3">
                    <Map className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Roadmap generation in progress</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Complete more interviews to generate your personalized plan.</p>
                </div>
              )}

              <Button variant="outline" className="w-full mt-4 bg-white" onClick={() => navigate(ROUTES.LEARNING_ROADMAP)}>
                View Full Roadmap
              </Button>
            </CardContent>
          </Card>

          {/* Recent Interviews */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-3 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Interviews</CardTitle>
                <NavLink to={ROUTES.INTERVIEW_HISTORY} className="text-sm text-brand-600 font-medium hover:text-brand-700">View All</NavLink>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {stats.recentPerformance.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No history yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentPerformance.slice(0, 3).map((session) => (
                    <div 
                      key={session.id} 
                      onClick={() => handleInterviewClick(session.id)}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors flex justify-between items-center"
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-gray-900 text-sm truncate">{session.domain}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(session.date).toLocaleDateString()}
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
      </div>
    </Container>
  );
}