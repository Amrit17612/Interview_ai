import { useEffect, useState } from 'react';
import { apiClient } from '../../../services/api.client';
import { Search, Loader2, Plus, Edit2, Archive, ArchiveRestore } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

export function InterviewTemplateLibrary() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchTemplates = async (p = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: p.toString(), limit: '15' });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (visibilityFilter) params.append('visibility', visibilityFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await apiClient.get(`/admin/interview-templates?${params.toString()}`);
      if (res.data.success) {
        setTemplates(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setPage(res.data.pagination.page);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTemplates(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, visibilityFilter, categoryFilter]);

  const toggleArchiveStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ARCHIVED' ? 'DRAFT' : 'ARCHIVED';
      await apiClient.patch(`/admin/interview-templates/${id}/status`, { status: newStatus });
      fetchTemplates(page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage fixed-question custom interview experiences.</p>
        </div>
        
        <button
          onClick={() => navigate(`${ROUTES.ADMIN_TEMPLATES}/new`)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 flex items-center shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </button>
      </div>

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
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
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500 bg-white"
        >
          <option value="">All Visibilities</option>
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
          <option value="BUNDLE_ONLY">Bundle Only</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500 bg-white"
        >
          <option value="">All Categories</option>
          <option value="TECHNICAL">Technical</option>
          <option value="BEHAVIORAL">Behavioral</option>
          <option value="SYSTEM_DESIGN">System Design</option>
          <option value="GENERAL">General</option>
        </select>
      </div>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Config</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status / Vis</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((t) => (
                <tr key={t._id} className={`hover:bg-gray-50 ${t.status === 'ARCHIVED' ? 'opacity-60 bg-gray-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {t.thumbnail && (
                        <img src={t.thumbnail} alt="" className="h-10 w-10 rounded-md object-cover mr-3 bg-gray-100" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{t.title}</div>
                        {t.domain && <div className="text-xs text-gray-500">{t.domain}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <div><span className="font-medium text-gray-800">Cat:</span> {t.category}</div>
                      <div><span className="font-medium text-gray-800">Diff:</span> {t.difficulty}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="font-bold text-gray-900">{t.questionCount}</span> questions
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        t.status === 'ARCHIVED' ? 'bg-gray-200 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.visibility === 'PUBLIC' ? 'bg-blue-50 text-blue-700' :
                        t.visibility === 'BUNDLE_ONLY' ? 'bg-purple-50 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.visibility}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => navigate(`${ROUTES.ADMIN_TEMPLATES}/${t._id}/edit`)}
                        className="text-brand-600 hover:text-brand-900 bg-brand-50 p-1.5 rounded-md hover:bg-brand-100 transition-colors"
                        title="Edit Template"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => toggleArchiveStatus(t._id, t.status)}
                        className="text-gray-500 hover:text-gray-900 bg-gray-100 p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                        title={t.status === 'ARCHIVED' ? 'Restore' : 'Archive'}
                      >
                        {t.status === 'ARCHIVED' ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No templates found matching your criteria.
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
                onClick={() => fetchTemplates(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchTemplates(page + 1)}
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
                    onClick={() => fetchTemplates(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchTemplates(page + 1)}
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
    </div>
  );
}
