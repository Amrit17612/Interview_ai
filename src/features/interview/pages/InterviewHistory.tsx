import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { interviewService, type InterviewSession, type PaginationMetadata } from '../../../services/interview.service';
import { ROUTES } from '../../../constants/routes';
import { Video, AlertCircle, Play, FileText, Clock, Search, ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';

export function InterviewHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Pagination State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');

  // Comparison State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadSessions = async (currentPage = page) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page: currentPage, limit: 12 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (type) params.type = type;
      if (difficulty) params.difficulty = difficulty;

      const response = await interviewService.getInterviews(params);
      setSessions(response.interviews || []);
      setPagination(response.pagination || null);
    } catch (err: any) {
      setError(err.message || 'Unable to load interview history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, type, difficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadSessions(1);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length < 2) return [...prev, id];
      return prev;
    });
  };

  const handleAction = (session: InterviewSession) => {
    if (session.status === 'COMPLETED') {
      navigate(`${ROUTES.INTERVIEW_REPORT}?id=${session._id}`);
    } else if (session.status === 'IN_PROGRESS') {
      navigate(`${ROUTES.INTERVIEW_ACTIVE}?id=${session._id}`);
    } else {
      navigate(ROUTES.INTERVIEW);
    }
  };

  return (
    <Container className="py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <PageHeader 
          title="Interview History" 
          description="Review your past AI mock interviews and analytics." 
        />
        <Button onClick={() => navigate(ROUTES.INTERVIEW)}>
          <Play className="mr-2 h-4 w-4" /> Start New Interview
        </Button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by domain or target skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </form>
        
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 bg-white">
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ABANDONED">Abandoned</option>
        </select>
        
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 bg-white">
          <option value="">All Types</option>
          <option value="TECHNICAL">Technical</option>
          <option value="BEHAVIORAL">Behavioral</option>
          <option value="SYSTEM_DESIGN">System Design</option>
          <option value="GENERAL">General</option>
        </select>

        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 bg-white">
          <option value="">All Difficulties</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
          <option value="EXPERT">Expert</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2 border border-red-200">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => loadSessions(page)} className="ml-auto bg-white">
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : sessions.length === 0 && !error ? (
        <EmptyState 
          icon={<Video className="h-12 w-12 text-brand-600" />}
          title="No Interviews Found" 
          description="Try adjusting your filters or start a new mock interview."
          actionLabel="Start Interview"
          actionPath={ROUTES.INTERVIEW}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => {
              const isSelected = selectedIds.includes(session._id);
              const canSelect = isSelected || selectedIds.length < 2;
              const isCompleted = session.status === 'COMPLETED';

              return (
                <Card 
                  key={session._id} 
                  className={`flex flex-col h-full transition-colors relative ${isSelected ? 'border-brand-500 ring-1 ring-brand-500' : 'hover:border-brand-300'}`}
                >
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-50 rounded-lg">
                          <Video className="h-5 w-5 text-brand-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold line-clamp-1 pr-6">
                            {session.configuration.domain}
                          </CardTitle>
                          <p className="text-sm text-gray-500 capitalize">
                            {session.configuration.type.toLowerCase().replace('_', ' ')} • {session.configuration.difficulty.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      
                      {isCompleted && (
                        <button 
                          onClick={() => toggleSelection(session._id)}
                          disabled={!canSelect}
                          className={`absolute top-4 right-4 p-1 rounded-md transition-colors ${isSelected ? 'text-brand-600' : 'text-gray-300 hover:text-gray-500'} ${!canSelect && !isSelected ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title={isSelected ? 'Deselect for comparison' : 'Select for comparison (Max 2)'}
                        >
                          {isSelected ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6" />}
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 flex flex-col flex-grow">
                    {session.configuration.targetSkill && (
                      <div className="mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                          🎯 Targeted: {session.configuration.targetSkill}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        {isCompleted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Score: {session.overallScore ?? 'N/A'}%
                          </span>
                        ) : session.status === 'IN_PROGRESS' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {session.status.toLowerCase()}
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        variant={isCompleted ? 'outline' : 'primary'}
                        size="sm" 
                        onClick={() => handleAction(session)}
                      >
                        {isCompleted ? (
                          <><FileText className="mr-2 h-4 w-4" /> Report</>
                        ) : session.status === 'IN_PROGRESS' ? (
                          <><Play className="mr-2 h-4 w-4" /> Resume</>
                        ) : 'Start New'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={!pagination.hasPreviousPage}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0">
                      Page {page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {selectedIds.length === 2 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <span className="font-medium text-sm">2 Interviews Selected for Comparison</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-transparent border-gray-600 hover:bg-gray-800 text-white hover:text-white" onClick={() => setSelectedIds([])}>
              Cancel
            </Button>
            <Button size="sm" className="bg-brand-500 hover:bg-brand-600 text-white border-0" onClick={() => navigate(`${ROUTES.INTERVIEW_COMPARE}?first=${selectedIds[0]}&second=${selectedIds[1]}`)}>
              Compare Selected
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}
