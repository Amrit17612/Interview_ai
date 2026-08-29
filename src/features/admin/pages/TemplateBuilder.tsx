import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../services/api.client';
import { ROUTES } from '../../../constants/routes';
import { Save, ArrowLeft, X, ArrowUp, ArrowDown } from 'lucide-react';

export function TemplateBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Template Data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [category, setCategory] = useState('TECHNICAL');
  const [domain, setDomain] = useState('');
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [targetBundleId, setTargetBundleId] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [tags, setTags] = useState('');

  // Selected Questions Array
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);

  // Search State for Question Library
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/admin/interview-templates/${id}`);
      if (res.data.success) {
        const t = res.data.data;
        setTitle(t.title);
        setDescription(t.description || '');
        setThumbnail(t.thumbnail || '');
        setCategory(t.category);
        setDomain(t.domain || '');
        setDifficulty(t.difficulty);
        setVisibility(t.visibility);
        setTargetBundleId(t.targetBundleId || '');
        setEstimatedDuration(t.estimatedDuration || '');
        setStatus(t.status);
        setTags(t.tags ? t.tags.join(', ') : '');
        setSelectedQuestions(t.questions || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchQuestions = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      // Fetch ACTIVE/DRAFT questions
      const res = await apiClient.get(`/api/admin/questions?search=${encodeURIComponent(searchQuery)}&limit=10`);
      if (res.data.success) {
        // Filter out already selected
        const selectedIds = new Set(selectedQuestions.map(q => typeof q === 'string' ? q : q._id));
        setSearchResults(res.data.data.filter((q: any) => !selectedIds.has(q._id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const addQuestion = (q: any) => {
    setSelectedQuestions([...selectedQuestions, q]);
    setSearchResults(searchResults.filter(res => res._id !== q._id));
  };

  const removeQuestion = (index: number) => {
    const newArr = [...selectedQuestions];
    newArr.splice(index, 1);
    setSelectedQuestions(newArr);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selectedQuestions.length - 1) return;

    const newArr = [...selectedQuestions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newArr[index];
    newArr[index] = newArr[swapIndex];
    newArr[swapIndex] = temp;
    setSelectedQuestions(newArr);
  };

  const handleSave = async () => {
    if (!title.trim()) return setError('Title is required');
    if (visibility === 'BUNDLE_ONLY' && !targetBundleId) return setError('Target Bundle is required for BUNDLE_ONLY visibility');
    if (selectedQuestions.length === 0) return setError('At least one question is required');

    try {
      setSaving(true);
      setError(null);
      
      const payload = {
        title,
        description,
        thumbnail,
        category,
        domain,
        difficulty,
        visibility,
        targetBundleId: visibility === 'BUNDLE_ONLY' ? targetBundleId : null,
        estimatedDuration,
        status,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        questions: selectedQuestions.map(q => typeof q === 'string' ? q : q._id)
      };

      if (isEditing) {
        await apiClient.put(`/api/admin/interview-templates/${id}`, payload);
      } else {
        const res = await apiClient.post('/api/admin/interview-templates', payload);
        navigate(`${ROUTES.ADMIN_TEMPLATES}/${res.data.data._id}/edit`, { replace: true });
      }
      
      alert('Template saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(ROUTES.ADMIN_TEMPLATES)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Template' : 'Create Template'}</h1>
            <p className="text-sm text-gray-500">{title || 'Untitled Template'}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Info</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-brand-500 focus:ring-brand-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-brand-500 focus:ring-brand-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Thumbnail URL</label>
              <input type="text" value={thumbnail} onChange={e => setThumbnail(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm" placeholder="https://..." />
            </div>
            {thumbnail && (
              <img src={thumbnail} alt="Thumbnail preview" className="h-24 w-full object-cover rounded-md bg-gray-100" />
            )}
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Configuration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm">
                  <option value="TECHNICAL">Technical</option>
                  <option value="BEHAVIORAL">Behavioral</option>
                  <option value="SYSTEM_DESIGN">System Design</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm">
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Domain / Topic</label>
              <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. Frontend React" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Visibility</label>
              <select value={visibility} onChange={e => setVisibility(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm">
                <option value="PRIVATE">Private (Drafts/Internal)</option>
                <option value="PUBLIC">Public (All Users)</option>
                <option value="BUNDLE_ONLY">Bundle Only (Premium)</option>
              </select>
            </div>

            {visibility === 'BUNDLE_ONLY' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Bundle *</label>
                <select value={targetBundleId} onChange={e => setTargetBundleId(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm">
                  <option value="">Select Bundle...</option>
                  <option value="interview_prep_bundle">Interview Prep Bundle</option>
                  <option value="system_design_bundle">System Design Bundle</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active (Published)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Questions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="font-semibold text-gray-900">
                Selected Questions <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-xs ml-2">{selectedQuestions.length}</span>
              </h3>
            </div>

            {/* Selected Questions List */}
            <div className="space-y-3 mb-8">
              {selectedQuestions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 border border-dashed rounded-lg text-gray-500 text-sm">
                  No questions selected. Add some below.
                </div>
              ) : (
                selectedQuestions.map((q, idx) => (
                  <div key={typeof q === 'string' ? q : q._id} className="flex items-start bg-white border rounded-lg p-3 shadow-sm group">
                    <div className="flex flex-col items-center mr-3 space-y-1">
                      <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                      <div className="flex flex-col border border-gray-200 rounded overflow-hidden">
                        <button onClick={() => moveQuestion(idx, 'up')} disabled={idx === 0} className="p-1 bg-gray-50 hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                        <button onClick={() => moveQuestion(idx, 'down')} disabled={idx === selectedQuestions.length - 1} className="p-1 bg-gray-50 border-t hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{typeof q === 'string' ? `Question ID: ${q}` : q.text}</p>
                      {typeof q !== 'string' && (
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-600">{q.type}</span>
                          <span className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-600">{q.difficulty}</span>
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeQuestion(idx)} className="ml-2 p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Question Search */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Add Questions from Library</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search questions by text..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchQuestions()}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <button onClick={handleSearchQuestions} disabled={searching} className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium">
                  {searching ? '...' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto pr-2 border rounded-md p-2 bg-gray-50">
                  {searchResults.map(res => (
                    <div key={res._id} className="flex items-center justify-between p-3 bg-white border rounded shadow-sm">
                      <div className="flex-1 pr-4">
                        <p className="text-sm text-gray-800 line-clamp-2">{res.text}</p>
                        <div className="flex gap-2 mt-1 text-[10px] text-gray-500">
                          <span>{res.type}</span>
                          <span>•</span>
                          <span>{res.difficulty}</span>
                        </div>
                      </div>
                      <button onClick={() => addQuestion(res)} className="bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-1.5 rounded text-xs font-medium flex-shrink-0">
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
