import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { 
  BarChart3, 
  AlertCircle, 
  RefreshCw, 
  Lock, 
  TrendingUp, 
  Target, 
  Award, 
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { interviewService, type InterviewStatsData } from '../../../services/interview.service';
import { ROUTES } from '../../../constants/routes';

export function ReportsAnalytics() {
  const [stats, setStats] = useState<InterviewStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await interviewService.getInterviewStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Unable to load your analytics right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container className="py-8 max-w-7xl">
        <PageHeader 
          title="Reports & Analytics" 
          description="Deep dive into your performance metrics across all interviews." 
        />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="mt-8 h-[400px] bg-gray-100 rounded-xl animate-pulse" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8 max-w-7xl">
        <PageHeader 
          title="Reports & Analytics" 
          description="Deep dive into your performance metrics across all interviews." 
        />
        <div className="mt-8 flex flex-col items-center justify-center p-12 bg-red-50/50 rounded-xl border border-red-100">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{error}</h2>
          <Button onClick={fetchStats} variant="outline" className="mt-4 bg-white border-red-200 text-red-700 hover:bg-red-50">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      </Container>
    );
  }

  if (!stats) return null;

  const completedCount = stats.summary.completedInterviews || 0;
  const isLocked = completedCount < 3;

  if (isLocked) {
    return (
      <Container className="py-8 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
        >
          <PageHeader 
            title="Reports & Analytics" 
            description="Deep dive into your performance metrics across all interviews." 
          />
          
          <div className="mt-8">
            <Card className="shadow-sm border-gray-100 bg-gray-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mb-6">
                  <Lock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Analytics Locked</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Complete at least 3 practice interviews to unlock your detailed analytics dashboard.
                </p>
                
                <div className="w-full max-w-sm mb-8">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-brand-600">{completedCount} / 3 interviews completed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-brand-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${(completedCount / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <Link to={ROUTES.INTERVIEW}>
                  <Button className="shadow-sm bg-brand-600 hover:bg-brand-700 text-white">
                    Start Practice Interview <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </Container>
    );
  }

  // Analytics Data Prep
  const recentCompleted = [...stats.recentPerformance]
    .filter(p => p.overallScore !== null);
  
  const latestScore = recentCompleted.length > 0 ? recentCompleted[0].overallScore : null;

  const chartData = [...recentCompleted]
    .reverse()
    .map(p => ({
      chartKey: p.id,
      date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: p.overallScore,
      domain: p.domain
    }));

  const domainChartData = [...stats.domainStats]
    .filter(d => d.averageScore !== null)
    .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
    .slice(0, 5)
    .map(d => ({
      name: d.domain,
      score: d.averageScore
    }));

  return (
    <Container className="py-8 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <PageHeader 
          title="Reports & Analytics" 
          description="Deep dive into your performance metrics across all interviews." 
        />
        
        {/* OVERALL PERFORMANCE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-5 flex flex-col justify-center items-center text-center">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-full mb-3">
                <BarChart3 className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Completed</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.summary.completedInterviews}</h3>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-5 flex flex-col justify-center items-center text-center">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-full mb-3">
                <Target className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Average Score</p>
              <h3 className="text-2xl font-bold text-brand-700">
                {stats.summary.averageScore !== null ? `${stats.summary.averageScore}%` : '--'}
              </h3>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-5 flex flex-col justify-center items-center text-center">
              <div className="p-2 bg-amber-50 text-amber-500 rounded-full mb-3">
                <Award className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Best Score</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.summary.highestScore !== null ? `${stats.summary.highestScore}%` : '--'}
              </h3>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-5 flex flex-col justify-center items-center text-center">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-full mb-3">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Latest Score</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {latestScore !== null ? `${latestScore}%` : '--'}
              </h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PERFORMANCE TREND */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-2 border-b border-gray-50">
              <CardTitle className="text-base flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-gray-500" />
                Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 h-[300px]">
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
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Insufficient data for trend analysis.
                </div>
              )}
            </CardContent>
          </Card>

          {/* DOMAIN PERFORMANCE */}
          {domainChartData.length > 0 && (
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-2 border-b border-gray-50">
                <CardTitle className="text-base flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-gray-500" />
                  Performance by Domain
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainChartData} margin={{ top: 10, right: 10, bottom: 25, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                      {domainChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* STRENGTHS AND WEAKNESSES */}
        {(stats.skillAnalysis.strengths.length > 0 || stats.skillAnalysis.weaknesses.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.skillAnalysis.strengths.length > 0 && (
              <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-3 border-b border-gray-50">
                  <CardTitle className="text-base flex items-center text-green-700">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                    Top Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {stats.skillAnalysis.strengths.slice(0, 5).map((skill, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 capitalize">{skill.skill}</span>
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                        {skill.count} {skill.count === 1 ? 'mention' : 'mentions'}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {stats.skillAnalysis.weaknesses.length > 0 && (
              <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-3 border-b border-gray-50">
                  <CardTitle className="text-base flex items-center text-orange-700">
                    <Zap className="mr-2 h-5 w-5 text-orange-500" />
                    Recurring Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {stats.skillAnalysis.weaknesses.slice(0, 5).map((skill, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 capitalize">{skill.skill}</span>
                      <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full font-medium">
                        {skill.count} {skill.count === 1 ? 'mention' : 'mentions'}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
      </motion.div>
    </Container>
  );
}
