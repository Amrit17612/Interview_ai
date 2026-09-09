import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import {
  AlertCircle, CheckCircle, FileText, BarChart, FileCheck,
  Target, ArrowRight, Sparkles, Clock, RefreshCw
} from 'lucide-react';
import { resumeService, type Resume } from '../../../services/resume.service';
import { ROUTES } from '../../../constants/routes';

// ─── Types ──────────────────────────────────────────────────────────────────

type AnalysisStage =
  | 'IDLE' | 'PARSING_RESUME' | 'EVALUATING_RESUME'
  | 'PARSING_JD' | 'MATCHING_ATS' | 'FINALIZING'
  | 'COMPLETED' | 'FAILED' | null | undefined;

type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | undefined;

// ─── Stage configuration ─────────────────────────────────────────────────────

interface StageInfo {
  key: AnalysisStage;
  label: string;
  description: string;
}

const RESUME_ONLY_STAGES: StageInfo[] = [
  { key: 'PARSING_RESUME',    label: 'Resume Parsing',       description: 'Extracting your skills, experience, and education...' },
  { key: 'EVALUATING_RESUME', label: 'Resume Quality Check', description: 'Checking grammar, action verbs, and weak bullet points...' },
  { key: 'FINALIZING',        label: 'Finalizing Results',   description: 'Preparing your personalized recommendations...' },
];

const RESUME_JD_STAGES: StageInfo[] = [
  { key: 'PARSING_RESUME',    label: 'Resume Parsing',       description: 'Extracting your skills, experience, and education...' },
  { key: 'EVALUATING_RESUME', label: 'Resume Quality Check', description: 'Checking grammar, action verbs, and weak bullet points...' },
  { key: 'PARSING_JD',        label: 'Job Description Analysis', description: 'Understanding the requirements of the job description...' },
  { key: 'MATCHING_ATS',      label: 'ATS Matching',         description: 'Comparing your resume with the job requirements...' },
  { key: 'FINALIZING',        label: 'Finalizing Results',   description: 'Preparing your personalized recommendations...' },
];

// ─── Progress percentage per stage ──────────────────────────────────────────

function getProgress(stage: AnalysisStage, hasJD: boolean): number {
  if (!stage || stage === 'IDLE')       return 5;
  if (stage === 'COMPLETED')            return 100;
  if (stage === 'FAILED')               return 0;
  if (hasJD) {
    const map: Record<string, number> = {
      PARSING_RESUME: 20, EVALUATING_RESUME: 42, PARSING_JD: 58, MATCHING_ATS: 76, FINALIZING: 92
    };
    return map[stage as string] ?? 5;
  }
  const map: Record<string, number> = {
    PARSING_RESUME: 25, EVALUATING_RESUME: 58, FINALIZING: 85
  };
  return map[stage as string] ?? 5;
}

// Which stages are DONE (i.e., the backend has moved past them)
function isStageCompleted(stageKey: AnalysisStage, currentStage: AnalysisStage, stages: StageInfo[]): boolean {
  if (currentStage === 'COMPLETED') return true;
  const currentIdx = stages.findIndex(s => s.key === currentStage);
  const checkIdx   = stages.findIndex(s => s.key === stageKey);
  return checkIdx !== -1 && currentIdx !== -1 && checkIdx < currentIdx;
}

function isStageActive(stageKey: AnalysisStage, currentStage: AnalysisStage): boolean {
  return stageKey === currentStage;
}

function getStageMessage(stage: AnalysisStage, hasJD: boolean): string {
  const stages = hasJD ? RESUME_JD_STAGES : RESUME_ONLY_STAGES;
  return stages.find(s => s.key === stage)?.description ?? 'Initializing analysis...';
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

interface StepRowProps {
  info: StageInfo;
  status: 'done' | 'active' | 'pending';
}

function StepRow({ info, status }: StepRowProps) {
  return (
    <div className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 ${
      status === 'active'  ? 'bg-indigo-50 border border-indigo-200 shadow-sm'  :
      status === 'done'    ? 'bg-emerald-50 border border-emerald-100 opacity-90' :
                             'bg-gray-50 border border-gray-100 opacity-50'
    }`}>
      <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full">
        {status === 'done'   && <CheckCircle className="h-6 w-6 text-emerald-500" />}
        {status === 'active' && <Spinner className="h-5 w-5 text-indigo-500" />}
        {status === 'pending'&& <div className="h-5 w-5 rounded-full border-2 border-gray-300" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${
          status === 'done'   ? 'text-emerald-700' :
          status === 'active' ? 'text-indigo-700'  : 'text-gray-400'
        }`}>{info.label}</p>
        {status === 'active' && (
          <p className="text-xs text-indigo-500 mt-0.5">{info.description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 2500;
const SAFETY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function ResumeAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Separate initial-fetch state from analysis-in-progress state
  const [isFetching, setIsFetching]         = useState(true);   // initial GET request
  const [resumeData, setResumeData]         = useState<Partial<Resume> | null>(null);
  const [fetchError, setFetchError]         = useState<string | null>(null);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const [actionError, setActionError]       = useState<string | null>(null);
  const [safetyTimedOut, setSafetyTimedOut] = useState(false);

  // Polling refs (never stale-close over state)
  const pollTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingRef      = useRef(false); // prevent overlapping requests

  const clearTimers = useCallback(() => {
    if (pollTimerRef.current)   { clearTimeout(pollTimerRef.current);   pollTimerRef.current = null; }
    if (safetyTimerRef.current) { clearTimeout(safetyTimerRef.current); safetyTimerRef.current = null; }
  }, []);

  // ── Poll handler ──────────────────────────────────────────────────────────
  const schedulePoll = useCallback(() => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = setTimeout(async () => {
      if (!id || pollingRef.current) return;
      pollingRef.current = true;
      try {
        const data = await resumeService.getResumeAnalysis(id);
        setResumeData(data.analysis);
        const s = data.analysis.analysisStatus;
        if (s === 'PROCESSING' || s === 'PENDING') {
          schedulePoll(); // continue polling
        } else {
          clearTimers(); // stop on COMPLETED or FAILED
        }
      } catch {
        // If a poll fails, just retry rather than hard-erroring
        schedulePoll();
      } finally {
        pollingRef.current = false;
      }
    }, POLL_INTERVAL_MS);
  }, [id, clearTimers]);

  // ── Initial data fetch ────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setIsFetching(true);
    setFetchError(null);

    resumeService.getResumeAnalysis(id)
      .then(data => {
        setResumeData(data.analysis);
        // If already PROCESSING when we first load, start polling immediately
        if (data.analysis.analysisStatus === 'PROCESSING' || data.analysis.analysisStatus === 'PENDING') {
          schedulePoll();
          // Safety timeout: if still running after 5 min, warn but don't cancel the job
          safetyTimerRef.current = setTimeout(() => {
            setSafetyTimedOut(true);
          }, SAFETY_TIMEOUT_MS);
        }
      })
      .catch(err => {
        setFetchError(err.message || 'Failed to load resume analysis.');
      })
      .finally(() => setIsFetching(false));

    return () => clearTimers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Start analysis ────────────────────────────────────────────────────────
  const startAnalysis = async () => {
    if (!id) return;
    setIsStartingAnalysis(true);
    setActionError(null);
    setSafetyTimedOut(false);
    try {
      await resumeService.analyzeResume(id);
      // Optimistically show PROCESSING immediately
      setResumeData(prev => ({
        ...(prev ?? {}),
        analysisStatus: 'PROCESSING',
        analysisStage: 'IDLE'
      }));
      schedulePoll();
      safetyTimerRef.current = setTimeout(() => {
        setSafetyTimedOut(true);
      }, SAFETY_TIMEOUT_MS);
    } catch (err: any) {
      setActionError(err.message || 'Failed to start analysis.');
    } finally {
      setIsStartingAnalysis(false);
    }
  };

  // ─── Derived state ────────────────────────────────────────────────────────
  const status = resumeData?.analysisStatus as AnalysisStatus;
  const stage  = resumeData?.analysisStage  as AnalysisStage;
  const hasJD  = Boolean(resumeData?.analyzedJobId);
  const stages = hasJD ? RESUME_JD_STAGES : RESUME_ONLY_STAGES;
  const progress = getProgress(stage, hasJD);

  // ─── Render: Initial fetch loading ───────────────────────────────────────
  if (isFetching) {
    return (
      <Container className="py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-200 blur-2xl rounded-full opacity-60" />
          <Spinner className="h-12 w-12 text-indigo-600 relative" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Retrieving Your Resume...</h2>
        <p className="text-gray-500 text-sm">Loading your analysis data from our servers.</p>
      </Container>
    );
  }

  // ─── Render: Initial fetch error ──────────────────────────────────────────
  if (fetchError) {
    return (
      <Container className="py-8">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center text-center max-w-lg mx-auto">
          <AlertCircle className="h-12 w-12 mb-4 text-red-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Could Not Load Analysis</h3>
          <p className="text-gray-600 mb-6 text-sm">{fetchError}</p>
          <Button onClick={() => navigate(ROUTES.RESUME)}>Return to Dashboard</Button>
        </div>
      </Container>
    );
  }

  // ─── Render: Not started / start screen ──────────────────────────────────
  if (!status || status === 'PENDING') {
    return (
      <Container className="py-8 max-w-3xl">
        <PageHeader
          title="Resume Intelligence"
          description="Analyze your resume using AI — ATS scoring, grammar, weak bullets, and personalized suggestions."
        />

        {actionError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {actionError}
          </div>
        )}

        <Card className="mt-8">
          <CardContent className="p-10 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Resume Analysis</h3>
            <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
              Our AI will extract your resume structure, score quality, flag grammar and weak bullets, and — if you provide a job description — generate a live ATS compatibility score.
            </p>

            <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-10">
              {[
                { icon: FileText,  label: 'Parse Resume' },
                { icon: FileCheck, label: 'Score Quality' },
                { icon: BarChart,  label: 'ATS Matching' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Icon className="h-5 w-5 text-indigo-500" />
                  <span className="text-xs font-medium text-gray-600 text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={startAnalysis}
              disabled={isStartingAnalysis}
              className="w-full sm:w-auto min-w-[200px]"
            >
              {isStartingAnalysis ? (
                <><Spinner className="mr-2 h-5 w-5" /> Starting...</>
              ) : (
                <>Start Deep Analysis <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>

          </CardContent>
        </Card>
      </Container>
    );
  }

  // ─── Render: AI processing progress screen ────────────────────────────────
  if (status === 'PROCESSING') {
    const currentStageMessage = getStageMessage(stage, hasJD);
    const progressClamped = Math.min(Math.max(progress, 5), 99); // never show 100 until done

    return (
      <Container className="py-12 max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI Analysis in Progress
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Analyzing Your Resume</h2>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            {currentStageMessage}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">Progress</span>
            <span className="text-sm font-semibold text-indigo-600">{progressClamped}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressClamped}%` }}
            />
          </div>
        </div>

        {/* Step list */}
        <div className="space-y-2 mb-8">
          {stages.map(info => {
            const done   = isStageCompleted(info.key, stage, stages);
            const active = isStageActive(info.key, stage);
            return (
              <StepRow
                key={info.key}
                info={info}
                status={done ? 'done' : active ? 'active' : 'pending'}
              />
            );
          })}
        </div>

        {/* Safety timeout warning */}
        {safetyTimedOut && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Analysis is taking longer than expected.</p>
              <p className="text-xs text-amber-600 mt-1">The analysis may still be running in the background. You can refresh to check for updates.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3 mr-2" /> Refresh
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          This usually takes 15–30 seconds. Do not close this page.
        </p>
      </Container>
    );
  }

  // ─── Render: FAILED screen ────────────────────────────────────────────────
  if (status === 'FAILED') {
    return (
      <Container className="py-8 max-w-2xl">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-10 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Analysis Couldn't Complete</h3>
          <p className="text-gray-600 mb-8 max-w-sm">
            Something went wrong while analyzing your resume. This can happen if the AI provider is temporarily unavailable.
          </p>
          {actionError && (
            <p className="text-sm text-red-600 bg-red-100 px-4 py-2 rounded-lg mb-6">{actionError}</p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(ROUTES.RESUME)}>Back to Resumes</Button>
            <Button onClick={startAnalysis} disabled={isStartingAnalysis}>
              {isStartingAnalysis ? <><Spinner className="mr-2 h-4 w-4" /> Starting...</> : 'Try Again'}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  // ─── Render: COMPLETED results ────────────────────────────────────────────
  return (
    <Container className="py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-medium mb-3">
            <CheckCircle className="h-3.5 w-3.5" /> Analysis Complete
          </div>
          <PageHeader
            title="Analysis Dashboard"
            description="Review your AI-generated resume intelligence report."
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.RESUME)}>Back to Resumes</Button>
          <Button onClick={startAnalysis} disabled={isStartingAnalysis}>
            {isStartingAnalysis ? <><Spinner className="mr-2 h-4 w-4" /> Starting...</> : 'Re-analyze'}
          </Button>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1 border-l-4 border-l-indigo-500">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Resume Quality Score</h3>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-gray-900">{resumeData?.qualityScore ?? 0}</span>
              <span className="text-gray-400 mb-1 text-lg">/ 100</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">Based on readability, impact, and structure.</p>
          </CardContent>
        </Card>

        {resumeData?.analyzedJobId ? (
          <Card className="md:col-span-1 border-l-4 border-l-emerald-500">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">ATS Compatibility</h3>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-gray-900">{resumeData?.atsScore ?? 0}</span>
                <span className="text-gray-400 mb-1 text-lg">/ 100</span>
              </div>
              <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1 font-medium">
                <CheckCircle className="h-3 w-3" /> Matched against Job Description
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="md:col-span-1 bg-gray-50 border-dashed border-2">
            <CardContent className="p-6 flex flex-col justify-center items-center h-full text-center">
              <Target className="h-6 w-6 text-gray-400 mb-2" />
              <h3 className="text-sm font-medium text-gray-700 mb-1">No JD Selected</h3>
              <p className="text-xs text-gray-500 mb-3">Add a Job Description for an ATS score.</p>
              <Button variant="outline" size="sm" disabled>Select Job</Button>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Grammar Issues',  count: resumeData?.contentAnalysis?.grammarIssues?.length,  color: 'bg-amber-100 text-amber-800' },
                { label: 'Weak Bullets',    count: resumeData?.contentAnalysis?.weakBullets?.length,    color: 'bg-red-100 text-red-800' },
                { label: 'Repeated Verbs',  count: resumeData?.contentAnalysis?.repeatedVerbs?.length,  color: 'bg-blue-100 text-blue-800' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                    {count || 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Weak Bullets */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Impact & Bullet Quality
            </h3>
            {(resumeData?.contentAnalysis?.weakBullets?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {resumeData!.contentAnalysis!.weakBullets.map((bullet: any, idx: number) => (
                  <Card key={idx} className="border-red-100 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">Original</p>
                        <p className="text-sm text-gray-700 bg-red-50 p-2.5 rounded-lg line-through decoration-red-300 decoration-2">
                          "{bullet.original}"
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-red-600">Issue: {bullet.problem}</p>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">Suggested Rewrite</p>
                        <p className="text-sm text-emerald-800 bg-emerald-50 p-2.5 border border-emerald-100 rounded-lg">
                          "{bullet.suggestion}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="p-4 text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  No weak bullets detected. Great job quantifying your impact!
                </CardContent>
              </Card>
            )}
          </div>

          {/* Grammar */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-amber-500" />
              Grammar & Spelling
            </h3>
            {(resumeData?.contentAnalysis?.grammarIssues?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {resumeData!.contentAnalysis!.grammarIssues.map((issue: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-red-500 line-through mb-1">{issue.original}</p>
                        <p className="text-sm text-emerald-600 font-medium">{issue.suggestion}</p>
                      </div>
                      <div className="w-1/3 pl-4 border-l border-gray-100 flex items-center">
                        <p className="text-xs text-gray-500">{issue.issue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="p-4 text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  No grammar or spelling issues detected.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Parsed Structure */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Parsed Structure
            </h3>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-4">How an ATS parser reads your resume:</p>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase">Name</span>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {resumeData?.structuredData?.personal?.name || 'Not Found'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase">Email</span>
                      <p className="text-sm text-gray-700 mt-0.5 truncate">
                        {resumeData?.structuredData?.personal?.email || '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase">Phone</span>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {resumeData?.structuredData?.personal?.phone || '—'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase">Technical Skills</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(resumeData?.structuredData?.skills?.technical?.length ?? 0) > 0 ? (
                        resumeData!.structuredData!.skills!.technical.map((skill: string, i: number) => (
                          <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">None detected</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase">
                      Experience ({resumeData?.structuredData?.experience?.length || 0} roles)
                    </span>
                    <ul className="mt-2 space-y-1.5">
                      {resumeData?.structuredData?.experience?.map((exp: any, i: number) => (
                        <li key={i} className="text-sm">
                          <span className="font-medium text-gray-900">{exp.title}</span>
                          {exp.company && <span className="text-gray-500"> at {exp.company}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Repeated Verbs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart className="h-5 w-5 text-purple-500" />
              Repeated Action Verbs
            </h3>
            {(resumeData?.contentAnalysis?.repeatedVerbs?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resumeData!.contentAnalysis!.repeatedVerbs.map((verbItem: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-900">"{verbItem.verb}"</span>
                      <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {verbItem.count}×
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1.5">Try instead:</p>
                    <div className="flex flex-wrap gap-1">
                      {verbItem.alternatives?.slice(0, 3).map((alt: string, i: number) => (
                        <span key={i} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200">
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="p-4 text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Good vocabulary! No overly repeated action verbs.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}