import { useEffect, useState } from 'react';
import { apiClient } from '../../../services/api.client';
import { Search, Loader2, X, Plus, Check } from 'lucide-react';

interface QuestionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (question: any) => void;
  selectedIds: Set<string>;
}

export function QuestionLibraryModal({ isOpen, onClose, onAddQuestion, selectedIds }: QuestionLibraryModalProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const fetchQuestions = async (p = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: p.toString(), limit: '10' });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (difficultyFilter) params.append('difficulty', difficultyFilter);

      const res = await apiClient.get(`/admin/questions?${params.toString()}`);
      if (res.data.success) {
        setQuestions(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setPage(res.data.pagination.page);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const delayDebounceFn = setTimeout(() => {
      fetchQuestions(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, typeFilter, difficultyFilter, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Questions from Library</h2>
            <p className="text-sm text-gray-500 mt-1">Select questions to add to your template.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500 bg-white"
            >
              <option value="">All Types (Topics)</option>
              <option value="TECHNICAL">Technical</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="SYSTEM_DESIGN">System Design</option>
              <option value="GENERAL">General</option>
            </select>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500 bg-white"
            >
              <option value="">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 relative min-h-[300px]">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm mb-4">{error}</div>}
          
          {loading && (
            <div className="absolute inset-0 bg-gray-50/80 z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[45%]">Question</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic/Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((q) => {
                  const isAdded = selectedIds.has(q._id);
                  return (
                    <tr key={q._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2" title={q.text}>{q.text}</div>
                        {q.tags?.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {q.tags.slice(0, 3).map((t: string) => (
                              <span key={t} className="inline-flex text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                {t}
                              </span>
                            ))}
                            {q.tags.length > 3 && (
                              <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                +{q.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex w-max items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                          {q.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex w-max items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border
                          ${q.difficulty === 'BEGINNER' ? 'bg-green-50 text-green-700 border-green-200' :
                            q.difficulty === 'INTERMEDIATE' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            q.difficulty === 'ADVANCED' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }
                        `}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          q.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          q.status === 'ARCHIVED' ? 'bg-gray-200 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isAdded ? (
                          <button disabled className="inline-flex items-center text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 cursor-not-allowed">
                            <Check className="h-3.5 w-3.5 mr-1" /> Added
                          </button>
                        ) : (
                          <button
                            onClick={() => onAddQuestion(q)}
                            className="inline-flex items-center text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-md text-xs font-medium border border-brand-200 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {questions.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No questions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchQuestions(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchQuestions(page + 1)}
                disabled={page === totalPages}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
