import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { AlertCircle, CheckCircle, FileText, BarChart, FileCheck, Target, ArrowRight } from 'lucide-react';
import { resumeService, type Resume } from '../../../services/resume.service';
import { ROUTES } from '../../../constants/routes';

export function ResumeAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [resumeData, setResumeData] = useState<Partial<Resume> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);

  const fetchAnalysis = async () => {
    if (!id) return;
    try {
      const data = await resumeService.getResumeAnalysis(id);
      setResumeData(data.analysis);
      
      // Keep polling if processing
      if (data.analysis.analysisStatus === 'PROCESSING' || data.analysis.analysisStatus === 'PENDING') {
        setTimeout(fetchAnalysis, 3000);
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load resume analysis.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const startAnalysis = async () => {
    if (!id) return;
    setIsStartingAnalysis(true);
    setError(null);
    try {
      // Currently not passing jobId from here. Job matching could be added later.
      await resumeService.analyzeResume(id);
      // Change local state to processing to show loader
      setResumeData(prev => prev ? { ...prev, analysisStatus: 'PROCESSING' } : { analysisStatus: 'PROCESSING' });
      // Start polling
      setTimeout(fetchAnalysis, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to start analysis.');
    } finally {
      setIsStartingAnalysis(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner className="h-10 w-10 text-primary mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Analysis...</h2>
        <p className="text-gray-500">Retrieving your resume data.</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg flex flex-col items-center text-center max-w-lg mx-auto border border-red-100">
          <AlertCircle className="h-10 w-10 mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Analysis Error</h3>
          <p className="mb-6">{error}</p>
          <Button onClick={() => navigate(ROUTES.RESUME)}>Return to Dashboard</Button>
        </div>
      </Container>
    );
  }

  const status = resumeData?.analysisStatus;

  if (status === 'PENDING' || status === 'FAILED' || !status) {
    return (
      <Container className="py-8 max-w-3xl">
        <PageHeader 
          title="Resume Intelligence" 
          description="Analyze your resume using AI to get an ATS compatibility score, grammar checks, and weak bullet improvements." 
        />
        
        <Card className="mt-8 text-center py-12">
          <CardContent className="flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <BarChart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Run AI Analysis</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              We'll parse your resume, score its quality, identify formatting issues, and suggest improvements for weak action verbs and bullet points.
            </p>
            <Button 
              size="lg" 
              onClick={startAnalysis} 
              disabled={isStartingAnalysis}
              className="w-full sm:w-auto"
            >
              {isStartingAnalysis ? (
                <><Spinner className="mr-2 h-5 w-5" /> Starting Analysis...</>
              ) : (
                <>Start Deep Analysis <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
            {status === 'FAILED' && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-md">
                The previous analysis attempt failed. You can try again.
              </p>
            )}
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (status === 'PROCESSING') {
    return (
      <Container className="py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
          <Spinner className="h-16 w-16 text-primary relative" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">AI is Analyzing Your Resume</h2>
        <p className="text-gray-500 max-w-md text-center text-lg">
          This usually takes 10 to 20 seconds. We're extracting structure, scoring quality, and finding improvements.
        </p>
        <div className="mt-12 w-full max-w-md bg-gray-100 rounded-full h-2 overflow-hidden">
          <div className="bg-primary h-full animate-[pulse_2s_ease-in-out_infinite] w-full origin-left scale-x-50"></div>
        </div>
      </Container>
    );
  }

  // COMPLETED STATE
  return (
    <Container className="py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <PageHeader 
          title="Analysis Dashboard" 
          description="Review your AI-generated resume intelligence report." 
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.RESUME)}>Back to Resumes</Button>
          <Button onClick={startAnalysis}>Re-analyze</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1 border-l-4 border-l-primary">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Resume Quality Score</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">{resumeData?.qualityScore || 0}</span>
              <span className="text-gray-500 mb-1">/ 100</span>
            </div>
            <p className="text-xs text-gray-500 mt-4">Based on readability, impact, and structure.</p>
          </CardContent>
        </Card>

        {resumeData?.analyzedJobId ? (
          <Card className="md:col-span-1 border-l-4 border-l-emerald-500">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">ATS Compatibility</h3>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{resumeData?.atsScore || 0}</span>
                <span className="text-gray-500 mb-1">/ 100</span>
              </div>
              <p className="text-xs text-emerald-600 mt-4 flex items-center gap-1 font-medium">
                <CheckCircle className="h-3 w-3" /> Matched against Job Description
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="md:col-span-1 bg-gray-50 border-dashed border-2">
            <CardContent className="p-6 flex flex-col justify-center items-center h-full text-center">
              <Target className="h-6 w-6 text-gray-400 mb-2" />
              <h3 className="text-sm font-medium text-gray-700 mb-1">No JD Selected</h3>
              <p className="text-xs text-gray-500 mb-3">Compare against a job description for an ATS score.</p>
              {/* Future feature: open JD selection modal */}
              <Button variant="outline" size="sm" disabled>Select Job</Button>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Grammar Issues</span>
                <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {resumeData?.contentAnalysis?.grammarIssues?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weak Bullets</span>
                <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {resumeData?.contentAnalysis?.weakBullets?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Repeated Verbs</span>
                <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {resumeData?.contentAnalysis?.repeatedVerbs?.length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* WEAK BULLETS */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Impact & Bullet Quality
            </h3>
            {resumeData?.contentAnalysis?.weakBullets?.length > 0 ? (
              <div className="space-y-4">
                {resumeData.contentAnalysis.weakBullets.map((bullet: any, idx: number) => (
                  <Card key={idx} className="border-red-100 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-2">Original Text:</p>
                      <p className="text-sm font-medium text-gray-800 bg-red-50 p-2 rounded line-through decoration-red-300 decoration-2 mb-3">"{bullet.original}"</p>
                      
                      <p className="text-sm text-red-600 font-medium mb-3">Issue: {bullet.problem}</p>
                      
                      <p className="text-sm text-gray-500 mb-2">Suggested Rewrite:</p>
                      <p className="text-sm font-medium text-emerald-800 bg-emerald-50 p-2 border border-emerald-100 rounded">"{bullet.suggestion}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="p-4 text-emerald-800 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> No weak bullets detected. Great job quantifying your impact!
                </CardContent>
              </Card>
            )}
          </div>

          {/* GRAMMAR */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-amber-500" />
              Grammar & Spelling
            </h3>
            {resumeData?.contentAnalysis?.grammarIssues?.length > 0 ? (
              <div className="space-y-3">
                {resumeData.contentAnalysis.grammarIssues.map((issue: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
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
                <CardContent className="p-4 text-emerald-800 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> No grammar or spelling issues detected.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* STRUCTURED EXTRACTION PREVIEW */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Parsed Structure
            </h3>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 mb-4">Here is how the ATS reads your resume data:</p>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Name</span>
                    <p className="font-medium">{resumeData?.structuredData?.personal?.name || 'Not Found'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Email</span>
                      <p className="text-sm">{resumeData?.structuredData?.personal?.email || 'Not Found'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Phone</span>
                      <p className="text-sm">{resumeData?.structuredData?.personal?.phone || 'Not Found'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Technical Skills</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {resumeData?.structuredData?.skills?.technical?.length > 0 ? (
                        resumeData.structuredData.skills.technical.map((skill: string, i: number) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">None detected</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Experience ({resumeData?.structuredData?.experience?.length || 0} roles)</span>
                    <ul className="mt-1 space-y-2">
                      {resumeData?.structuredData?.experience?.map((exp: any, i: number) => (
                        <li key={i} className="text-sm">
                          <span className="font-medium text-gray-900">{exp.title}</span> at <span className="text-gray-600">{exp.company}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* REPEATED VERBS */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart className="h-5 w-5 text-purple-500" />
              Repeated Action Verbs
            </h3>
            {resumeData?.contentAnalysis?.repeatedVerbs?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resumeData.contentAnalysis.repeatedVerbs.map((verbItem: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">"{verbItem.verb}"</span>
                      <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{verbItem.count} uses</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Try instead:</p>
                    <div className="flex flex-wrap gap-1">
                      {verbItem.alternatives?.slice(0, 3).map((alt: string, i: number) => (
                        <span key={i} className="text-[11px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">{alt}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="p-4 text-emerald-800 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Good vocabulary! No overly repeated action verbs.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}