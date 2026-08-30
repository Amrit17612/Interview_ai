import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { interviewService, type InterviewConfiguration } from '../../../services/interview.service';
import { resumeService, type Resume } from '../../../services/resume.service';
import { atsService, type JobDescription } from '../../../services/ats.service';
import { ROUTES } from '../../../constants/routes';
import { useAuth } from '../../auth/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Network, 
  Users, 
  FileText, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ArrowRight,
  Building2
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

type InterviewType = 'TECHNICAL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'GENERAL';
type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

const TECHNICAL_TOPICS = ['Frontend', 'Backend', 'Full Stack', 'Data / Analytics', 'DevOps / Cloud'];
const SYSTEM_DESIGN_TOPICS = ['Fundamentals', 'APIs & Scalability', 'Distributed Systems', 'Architecture'];
const BEHAVIORAL_TOPICS = ['General / HR', 'Leadership', 'Communication', 'Conflict Resolution', 'Situational Questions'];

export function InterviewHome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetSkill = searchParams.get('targetSkill');
  const { user } = useAuth();

  // State
  const [type, setType] = useState<InterviewType>('TECHNICAL');
  const [domain, setDomain] = useState('Frontend');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('INTERMEDIATE');
  const [role, setRole] = useState<string>('');
  
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showResumeSelect, setShowResumeSelect] = useState(false);
  const [showJobSelect, setShowJobSelect] = useState(false);

  // Initialize from onboarding
  useEffect(() => {
    if (user?.onboarding) {
      if (user.onboarding.primaryTechnology) {
        setDomain(user.onboarding.primaryTechnology);
      }
      if (user.onboarding.difficulty) {
        const validDiffs = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
        if (validDiffs.includes(user.onboarding.difficulty.toUpperCase())) {
          setDifficulty(user.onboarding.difficulty.toUpperCase() as DifficultyLevel);
        }
      }
      if (user.onboarding.currentRole) {
        setRole(user.onboarding.currentRole);
      }
    }
  }, [user]);

  // Load contextual data
  useEffect(() => {
    const fetchContexts = async () => {
      setIsLoadingContext(true);
      try {
        const [resumesData, jobsData] = await Promise.all([
          resumeService.getResumes().catch(() => []),
          atsService.getJobDescriptions().catch(() => [])
        ]);
        setResumes(resumesData);
        setJobs(jobsData);
      } catch (err) {
        console.error('Failed to load optional context records', err);
      } finally {
        setIsLoadingContext(false);
      }
    };
    fetchContexts();
  }, []);

  // Handle Type Change -> Reset Domain
  const handleTypeChange = (newType: InterviewType) => {
    setType(newType);
    if (newType === 'TECHNICAL') setDomain(TECHNICAL_TOPICS[0]);
    else if (newType === 'SYSTEM_DESIGN') setDomain(SYSTEM_DESIGN_TOPICS[0]);
    else if (newType === 'BEHAVIORAL') setDomain(BEHAVIORAL_TOPICS[0]);
  };

  const handleCreate = async () => {
    if (!domain.trim()) {
      setError('Focus area is required');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const config: InterviewConfiguration = { 
        type, 
        domain, 
        difficulty, 
        ...(targetSkill ? { targetSkill } : {}),
        ...(role ? { role } : {})
      };
      
      const payload: any = { configuration: config };
      if (selectedResumeId) payload.resumeId = selectedResumeId;
      if (selectedJobId) payload.atsJobId = selectedJobId;

      const session = await interviewService.createInterview(payload);
      navigate(`${ROUTES.INTERVIEW_ACTIVE}?id=${session._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start interview');
      setIsCreating(false);
    }
  };

  const getTopicsForType = () => {
    switch(type) {
      case 'TECHNICAL': return TECHNICAL_TOPICS;
      case 'SYSTEM_DESIGN': return SYSTEM_DESIGN_TOPICS;
      case 'BEHAVIORAL': return BEHAVIORAL_TOPICS;
      default: return [];
    }
  };

  const selectedResumeName = resumes.find(r => r.id === selectedResumeId)?.originalFileName;
  const selectedJobName = jobs.find(j => j.id === selectedJobId)?.title;

  return (
    <Container className="py-8 max-w-4xl">
      <PageHeader 
        title="Start Interview" 
        description="Configure your personalized AI interview experience." 
      />
      
      {targetSkill && (
        <div className="mt-4 p-4 bg-brand-50 border border-brand-200 text-brand-800 rounded-xl flex items-center shadow-sm">
          <span className="font-semibold mr-2">🎯 Targeted Practice Mode:</span> 
          Focusing on <span className="ml-1 capitalize font-bold">{targetSkill}</span>
        </div>
      )}

      {user?.onboarding && (
        <p className="text-sm text-gray-500 mb-6 flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
          Defaulted to your onboarding preferences. You can change these anytime.
        </p>
      )}

      <div className="space-y-10">
        
        {/* 1. INTERVIEW TYPE */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4">What do you want to practice?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <button
              onClick={() => handleTypeChange('TECHNICAL')}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                type === 'TECHNICAL' 
                  ? 'border-brand-500 bg-brand-50/30 shadow-sm' 
                  : 'border-gray-200 hover:border-brand-200 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                type === 'TECHNICAL' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Technical</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Test your technical knowledge and problem-solving.</p>
            </button>

            <button
              onClick={() => handleTypeChange('SYSTEM_DESIGN')}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                type === 'SYSTEM_DESIGN' 
                  ? 'border-brand-500 bg-brand-50/30 shadow-sm' 
                  : 'border-gray-200 hover:border-brand-200 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                type === 'SYSTEM_DESIGN' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <Network className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">System Design</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Practice designing scalable systems and architectures.</p>
            </button>

            <button
              onClick={() => handleTypeChange('BEHAVIORAL')}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                type === 'BEHAVIORAL' 
                  ? 'border-brand-500 bg-brand-50/30 shadow-sm' 
                  : 'border-gray-200 hover:border-brand-200 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                type === 'BEHAVIORAL' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Behavioral</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Prepare for communication and real-world scenarios.</p>
            </button>

          </div>
        </section>

        {/* 2. FOCUS AREA */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Choose focus area</h3>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              {getTopicsForType().map(topic => (
                <button
                  key={topic}
                  onClick={() => setDomain(topic)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors border ${
                    domain === topic
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* 3. DIFFICULTY & ROLE */}
        <section className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Difficulty</h3>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level as DifficultyLevel)}
                  className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                    difficulty === level
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Target Role <span className="text-sm font-normal text-gray-500">(Optional)</span></h3>
            <p className="text-xs text-gray-500 mb-3">Helps tailor questions to the role you're preparing for.</p>
            <input 
              type="text" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className="w-full rounded-xl border-gray-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 bg-white"
            />
          </div>
        </section>

        {/* 4. PERSONALIZATION */}
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Add Context <span className="text-sm font-normal text-gray-500">(Optional)</span></h3>
            <p className="text-sm text-gray-500 mt-1">Personalize questions using your resume or target job description.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            
            {/* Resume Card */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setShowResumeSelect(!showResumeSelect)}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedResumeId ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 text-sm">Use My Resume</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedResumeId ? selectedResumeName : 'Select an uploaded resume'}
                    </p>
                  </div>
                </div>
                {showResumeSelect ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              <AnimatePresence>
                {showResumeSelect && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 bg-gray-50/50"
                  >
                    <div className="p-5">
                      {isLoadingContext ? (
                        <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
                          <Spinner className="w-4 h-4 mr-2" /> Loading...
                        </div>
                      ) : resumes.length > 0 ? (
                        <div className="space-y-2">
                          <button
                            onClick={() => { setSelectedResumeId(''); setShowResumeSelect(false); }}
                            className={`w-full text-left p-3 text-sm rounded-lg border ${!selectedResumeId ? 'border-brand-500 bg-brand-50 text-brand-900 font-medium' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                          >
                            Don't use a resume
                          </button>
                          {resumes.map(r => (
                            <button
                              key={r.id}
                              onClick={() => { setSelectedResumeId(r.id); setShowResumeSelect(false); }}
                              className={`w-full text-left p-3 text-sm rounded-lg border flex items-center justify-between ${selectedResumeId === r.id ? 'border-brand-500 bg-brand-50 text-brand-900 font-medium' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                            >
                              <span className="truncate pr-4">{r.originalFileName}</span>
                              {selectedResumeId === r.id && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-3">No resume uploaded yet.</p>
                          <NavLink to={ROUTES.RESUME_UPLOAD} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                            Upload a resume →
                          </NavLink>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Job Description Card */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setShowJobSelect(!showJobSelect)}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedJobId ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 text-sm">Use a Job Description</h4>
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px] sm:max-w-[220px]">
                      {selectedJobId ? selectedJobName : 'Select a saved job'}
                    </p>
                  </div>
                </div>
                {showJobSelect ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              <AnimatePresence>
                {showJobSelect && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 bg-gray-50/50"
                  >
                    <div className="p-5">
                      {isLoadingContext ? (
                        <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
                          <Spinner className="w-4 h-4 mr-2" /> Loading...
                        </div>
                      ) : jobs.length > 0 ? (
                        <div className="space-y-2">
                          <button
                            onClick={() => { setSelectedJobId(''); setShowJobSelect(false); }}
                            className={`w-full text-left p-3 text-sm rounded-lg border ${!selectedJobId ? 'border-brand-500 bg-brand-50 text-brand-900 font-medium' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                          >
                            Don't use a job description
                          </button>
                          {jobs.map(j => (
                            <button
                              key={j.id}
                              onClick={() => { setSelectedJobId(j.id); setShowJobSelect(false); }}
                              className={`w-full text-left p-3 text-sm rounded-lg border flex flex-col ${selectedJobId === j.id ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`font-medium ${selectedJobId === j.id ? 'text-brand-900' : 'text-gray-900'} truncate`}>{j.title}</span>
                                {selectedJobId === j.id && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                              </div>
                              <span className="text-xs text-gray-500 mt-1">{j.company}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-3">No job descriptions saved yet.</p>
                          <NavLink to={ROUTES.ATS} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                            Go to ATS tracking →
                          </NavLink>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </section>

        {/* 5. SUMMARY & SUBMIT */}
        <section className="bg-gray-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Code2 className="w-48 h-48" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-gray-700">
                Your Interview Configuration
              </span>
              
              <h2 className="text-2xl font-bold mb-2">
                You'll start a {type === 'SYSTEM_DESIGN' ? 'System Design' : type.charAt(0) + type.slice(1).toLowerCase()} interview focused on {domain} at {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()} level.
              </h2>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-400">
                {role && (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                    Targeting: <span className="text-gray-200 font-medium">{role}</span>
                  </div>
                )}
                {selectedResumeId && (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Resume Context: <span className="text-gray-200 font-medium">Included</span>
                  </div>
                )}
                {selectedJobId && (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    Job Context: <span className="text-gray-200 font-medium">Included</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded-lg">
                  {error}
                </div>
              )}
            </div>

            <Button 
              onClick={handleCreate} 
              disabled={isCreating}
              size="lg"
              className="w-full md:w-auto shrink-0 bg-white text-gray-900 hover:bg-gray-100 h-14 px-8 text-base shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {isCreating ? (
                <><Spinner className="mr-2 h-5 w-5 border-gray-900 border-t-transparent" /> Starting...</>
              ) : (
                <>Start Interview <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </Button>
          </div>
        </section>

        {/* Subtle Company CTA */}
        <div className="text-center pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Preparing for a specific company?</p>
          <NavLink 
            to={ROUTES.EXPLORE_PACKS} 
            className="inline-flex items-center text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors bg-white px-4 py-2 border border-gray-200 rounded-full shadow-sm hover:border-brand-200 hover:bg-brand-50"
          >
            <Building2 className="w-4 h-4 mr-2 text-gray-400" />
            Explore Company Bundles
          </NavLink>
        </div>

      </div>
    </Container>
  );
}