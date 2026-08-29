import { useEffect, useState } from 'react';
import { apiClient } from '../../../services/api.client';
import { Search, Loader2, Plus, Edit2, Archive, ArchiveRestore, Download, Upload, CheckCircle, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { ImportReviewModal } from './ImportReviewModal';

export function QuestionLibrary() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Bulk Operations & Import
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchQuestions = async (p = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: p.toString(), limit: '15' });
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
    const delayDebounceFn = setTimeout(() => {
      fetchQuestions(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, typeFilter, difficultyFilter]);

  const toggleArchiveStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ARCHIVED' ? 'DRAFT' : 'ARCHIVED';
      await apiClient.patch(`/admin/questions/${id}/status`, { status: newStatus });
      fetchQuestions(page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(questions.map(q => q._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkStatus = async (status: string) => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to change ${selectedIds.size} questions to ${status}?`)) return;
    try {
      setBulkLoading(true);
      const res = await apiClient.post('/admin/questions/bulk/status', {
        questionIds: Array.from(selectedIds),
        status
      });
      if (res.data.success) {
        setSelectedIds(new Set());
        fetchQuestions(page);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Bulk status update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkTags = async () => {
    if (selectedIds.size === 0) return;
    const tagStr = window.prompt('Enter tags to add (comma separated):');
    if (!tagStr) return;
    const tags = tagStr.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length === 0) return;

    try {
      setBulkLoading(true);
      const res = await apiClient.post('/admin/questions/bulk/tags', {
        questionIds: Array.from(selectedIds),
        tags
      });
      if (res.data.success) {
        setSelectedIds(new Set());
        fetchQuestions(page);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Bulk tag update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      const res = await apiClient.get(`/admin/questions/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `questions_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert('Failed to export questions');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Library</h1>
          <p className="text-sm text-gray-500 mt-1">Manage reusable questions for templates and mock interviews.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center border-r"
            >
              <Upload className="h-4 w-4 mr-2 text-gray-500" />
              Import
            </button>
            <div className="relative group flex">
              <button
                disabled={isExporting}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2 text-gray-500" />
                {isExporting ? 'Exporting...' : 'Export ▼'}
              </button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-100 hidden group-hover:block z-20">
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">CSV</button>
                <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">JSON</button>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate(`${ROUTES.ADMIN_QUESTIONS}/new`)}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 flex items-center shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
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
          <option value="">All Types</option>
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

      {selectedIds.size > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center text-brand-800">
            <span className="font-bold mr-2">{selectedIds.size}</span> questions selected
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleBulkStatus('ACTIVE')} disabled={bulkLoading} className="text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-300 px-3 py-1.5 rounded flex items-center shadow-sm">
              <CheckCircle className="h-3 w-3 mr-1" /> Publish Active
            </button>
            <button onClick={() => handleBulkStatus('ARCHIVED')} disabled={bulkLoading} className="text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded flex items-center shadow-sm">
              <Archive className="h-3 w-3 mr-1" /> Archive
            </button>
            <button onClick={handleBulkTags} disabled={bulkLoading} className="text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-brand-50 hover:text-brand-700 px-3 py-1.5 rounded flex items-center shadow-sm">
              <Tag className="h-3 w-3 mr-1" /> Add Tags
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    onChange={handleSelectAll}
                    checked={questions.length > 0 && selectedIds.size === questions.length}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%]">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((q) => (
                <tr key={q._id} className={`hover:bg-gray-50 ${q.status === 'ARCHIVED' ? 'opacity-60 bg-gray-50/50' : ''} ${selectedIds.has(q._id) ? 'bg-brand-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      checked={selectedIds.has(q._id)}
                      onChange={() => handleSelectOne(q._id)}
                    />
                  </td>
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
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex w-max items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                        {q.type}
                      </span>
                      <span className={`inline-flex w-max items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border
                        ${q.difficulty === 'BEGINNER' ? 'bg-green-50 text-green-700 border-green-200' :
                          q.difficulty === 'INTERMEDIATE' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          q.difficulty === 'ADVANCED' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }
                      `}>
                        {q.difficulty}
                      </span>
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(q.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => navigate(`${ROUTES.ADMIN_QUESTIONS}/${q._id}/edit`)}
                        className="text-brand-600 hover:text-brand-900 bg-brand-50 p-1.5 rounded-md hover:bg-brand-100 transition-colors"
                        title="Edit Question"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => toggleArchiveStatus(q._id, q.status)}
                        className="text-gray-500 hover:text-gray-900 bg-gray-100 p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                        title={q.status === 'ARCHIVED' ? 'Restore' : 'Archive'}
                      >
                        {q.status === 'ARCHIVED' ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No questions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchQuestions(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchQuestions(page + 1)}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => fetchQuestions(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchQuestions(page + 1)}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showImportModal && (
        <ImportReviewModal 
          onClose={() => setShowImportModal(false)} 
          onSuccess={() => {
            fetchQuestions(1);
            setStatusFilter('DRAFT'); // Automatically filter to see new imports
          }} 
        />
      )}
    </div>
  );
}
