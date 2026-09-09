import { useState, useEffect } from 'react';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardContent } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';
import { Medal, PlayCircle, Target, Award, CheckCircle, Star, Sparkles, Trophy, Flame, Zap, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { userService } from '../../../services/user.service';
import { Button } from '../../../components/ui/Button';

// Icon mapper
const ICON_MAP: Record<string, any> = {
  PlayCircle,
  Target,
  Award,
  Medal,
  CheckCircle,
  Star,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  TrendingUp,
  CheckCircle2: CheckCircle
};

export function Achievements() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getAchievements();
      setData(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load achievements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  if (isLoading) {
    return (
      <Container className="py-8 max-w-7xl flex justify-center items-center h-[50vh]">
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
          <Button onClick={fetchAchievements} variant="outline" className="mt-4 bg-white border-red-200 text-red-700 hover:bg-red-50">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      </Container>
    );
  }

  if (!data) return null;

  const { achievements, stats } = data;
  const unlocked = achievements.filter((a: any) => a.unlocked);
  const locked = achievements.filter((a: any) => !a.unlocked);

  return (
    <Container className="py-8 max-w-7xl space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
      >
        <PageHeader 
          title="Achievements & Badges" 
          description="Track your milestones and show off your interview readiness." 
        />
        
        {/* SUMMARY SECTION */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 mb-8">
          <Card className="shadow-sm border-brand-100 bg-brand-50/30">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center">
              <p className="text-xs font-medium text-brand-600 mb-1">Unlocked</p>
              <h3 className="text-2xl font-bold text-brand-700">
                {stats.unlockedCount} / {achievements.length}
              </h3>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center">
              <p className="text-xs font-medium text-gray-500 mb-1">Current Streak</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}</h3>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center">
              <p className="text-xs font-medium text-gray-500 mb-1">Longest Streak</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.longestStreak} {stats.longestStreak === 1 ? 'day' : 'days'}</h3>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center">
              <p className="text-xs font-medium text-gray-500 mb-1">Total Interviews</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.totalInterviews}</h3>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center">
              <p className="text-xs font-medium text-gray-500 mb-1">Highest Score</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.highestScore}%</h3>
            </CardContent>
          </Card>
        </div>

        {/* UNLOCKED ACHIEVEMENTS */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Medal className="h-5 w-5 mr-2 text-brand-600" />
            Unlocked Achievements
          </h2>
          
          {unlocked.length === 0 ? (
            <Card className="shadow-sm border-gray-100 bg-gray-50/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Achievements Yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  You haven't unlocked any achievements yet. Keep practicing, maintaining your streak, and improving your scores to earn badges.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlocked.map((a: any) => {
                const IconComponent = ICON_MAP[a.icon] || Medal;
                return (
                  <Card key={a.id} className="shadow-sm border-brand-100 bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                    <CardContent className="p-5 flex items-start gap-4 z-10">
                      <div className="h-12 w-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-sm">{a.name}</h4>
                          <span className="bg-brand-50 text-brand-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            Unlocked
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 leading-relaxed">{a.description}</p>
                        <p className="text-[11px] font-medium text-brand-600">
                          Unlocked on {new Date(a.unlockedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* LOCKED ACHIEVEMENTS */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center text-gray-400">
            <CheckCircle className="h-5 w-5 mr-2" />
            Locked Achievements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
            {locked.map((a: any) => {
              const IconComponent = ICON_MAP[a.icon] || Medal;
              const percent = Math.min(100, Math.round((a.progress / (a.target || 1)) * 100));
              
              return (
                <Card key={a.id} className="shadow-sm border-gray-200 bg-gray-50">
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-gray-200 text-gray-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-700 text-sm">{a.name}</h4>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{a.description}</p>
                      </div>
                    </div>
                    
                    {a.target !== null && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[11px] font-medium text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{a.progress} / {a.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-gray-400 h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
      </motion.div>
    </Container>
  );
}
