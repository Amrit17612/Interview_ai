import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { interviewService } from '../../../services/interview.service';
import { resumeService, type Resume } from '../../../services/resume.service';
import { atsService, type JobDescription } from '../../../services/ats.service';
import { ROUTES } from '../../../constants/routes';

export function InterviewHome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetSkill = searchParams.get('targetSkill');

  const [type, setType] = useState<'BEHAVIORAL' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'GENERAL'>('TECHNICAL');
  const [domain, setDomain] = useState('Frontend');
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('INTERMEDIATE');
  const [company, setCompany] = useState<string>('');
  const [role, setRole] = useState<string>('');
  
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleCreate = async () => {
    if (!domain.trim()) {
      setError('Domain is required');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const payload: any = {
        configuration: { 
          type, 
          domain, 
          difficulty, 
          ...(targetSkill ? { targetSkill } : {}),
          ...(company ? { company } : {}),
          ...(role ? { role } : {})
        }
      };
      
      if (selectedResumeId) {
        payload.resumeId = selectedResumeId;
      }
      
      if (selectedJobId) {
        payload.atsJobId = selectedJobId;
      }

      const session = await interviewService.createInterview(payload);
      // Pass session ID to active interview route
      navigate(`${ROUTES.INTERVIEW_ACTIVE}?id=${session._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start interview');
      setIsCreating(false);
    }
  };

  return (
    <Container className="py-8 max-w-3xl">
      <PageHeader 
        title="Start a New Interview" 
        description="Configure your AI-powered interview session." 
      />
      
      {targetSkill && (
        <div className="mt-4 p-4 bg-brand-50 border border-brand-200 text-brand-800 rounded-xl flex items-center shadow-sm">
          <span className="font-semibold mr-2">🎯 Targeted Practice Mode:</span> 
          Focusing on <span className="ml-1 capitalize font-bold">{targetSkill}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 mt-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as any)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
            >
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="TECHNICAL">Technical</option>
              <option value="SYSTEM_DESIGN">System Design</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain / Topic</label>
            <input 
              type="text" 
              value={domain} 
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. React Frontend, Node.js, Product Management"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>

          <hr className="my-6 border-gray-100" />

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Company Context (Optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Tailor interview question emphasis to a specific company style.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Company</label>
                <select 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                >
                  <option value="">Generic Interview (No Company)</option>
                  <option value="GOOGLE">Google</option>
                  <option value="AMAZON">Amazon</option>
                  <option value="MICROSOFT">Microsoft</option>
                  <option value="META">Meta</option>
                  <option value="APPLE">Apple</option>
                  <option value="TCS">TCS</option>
                  <option value="INFOSYS">Infosys</option>
                  <option value="COGNIZANT">Cognizant</option>
                  <option value="ACCENTURE">Accenture</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                <input 
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer, Product Manager"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                />
                <p className="text-xs text-gray-500 mt-1">Helps prioritize questions relevant to your target position.</p>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-100" />
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Context Options (Optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Attach your resume or a target job description to personalize the interview AI context.</p>
          </div>

          {isLoadingContext ? (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Spinner className="h-4 w-4" /> <span>Loading your documents...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Resume</label>
                <select 
                  value={selectedResumeId} 
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                >
                  <option value="">-- None --</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.originalFileName} (Added {new Date(r.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Target Job Description</label>
                <select 
                  value={selectedJobId} 
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                >
                  <option value="">-- None --</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} at {j.company}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <Button 
            onClick={handleCreate} 
            disabled={isCreating}
            className="w-full sm:w-auto"
          >
            {isCreating ? 'Starting...' : 'Start Interview'}
          </Button>
        </div>
      </div>
    </Container>
  );
}