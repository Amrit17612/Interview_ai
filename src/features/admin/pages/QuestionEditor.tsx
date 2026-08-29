import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../services/api.client';
import { ArrowLeft, Save, Loader2, Plus, X, Search, AlertCircle, AlertTriangle } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';

export function QuestionEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('TECHNICAL');
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [status, setStatus] = useState('DRAFT');
  
  // Array states
  const [companies, setCompanies] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [expectedPoints, setExpectedPoints] = useState<string[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);

  // Search followups
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (isNew) return;

    const fetchQuestion = async () => {
      try {
        const res = await apiClient.get(`/admin/questions/${id}`);
        const q = res.data.data;
        setText(q.text || '');
        setDescription(q.description || '');
        setType(q.type || 'TECHNICAL');
        setDifficulty(q.difficulty || 'INTERMEDIATE');
        setStatus(q.status || 'DRAFT');
        setCompanies(q.companies || []);
        setDomains(q.domains || []);
        setRoles(q.roles || []);
        setTags(q.tags || []);
        setExpectedPoints(q.expectedPoints || []);
        setFollowUps(q.followUps || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch question');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id, isNew]);

  // Search debouncer
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const searchFollowUps = async () => {
      try {
        const res = await apiClient.get(`/admin/questions?search=${encodeURIComponent(searchQuery)}&limit=5`);
        // Filter out self and already added
        const results = res.data.data.filter((q: any) => 
          q._id !== id && !followUps.some(f => f._id === q._id)
        );
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      }
    };

    const delay = setTimeout(searchFollowUps, 500);
    return () => clearTimeout(delay);
  }, [searchQuery, id, followUps]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return setError('Question text is required');

    setSaving(true);
    setError(null);
    try {
      const payload = {
        text,
        description,
        type,
        difficulty,
        status,
        companies,
        domains,
        roles,
        tags,
        expectedPoints: expectedPoints.filter(p => p.trim() !== ''),
        followUps: followUps.map(f => f._id)
      };

      if (isNew) {
        await apiClient.post('/admin/questions', payload);
      } else {
        await apiClient.put(`/admin/questions/${id}`, payload);
      }
      navigate(ROUTES.ADMIN_QUESTIONS);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const ArrayInput = ({ label, items, setItems, placeholder }: any) => {
    const [input, setInput] = useState('');
    const add = () => {
      if (input.trim() && !items.includes(input.trim())) {
        setItems([...items, input.trim()]);
        setInput('');
      }
    };
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder={placeholder}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
          />
          <button type="button" onClick={add} className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item: string) => (
            <span key={item} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
              {item}
              <button type="button" onClick={() => setItems(items.filter((i: string) => i !== item))} className="ml-1.5 text-brand-500 hover:text-brand-800">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(ROUTES.ADMIN_QUESTIONS)} className="mr-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Create New Question' : 'Edit Question'}</h1>
            <p className="text-sm text-gray-500 mt-1">{isNew ? 'Draft a new question for the library' : `ID: ${id}`}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start text-sm">
          <AlertCircle className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content (Left Col) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Core Content</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-brand-500 focus:border-brand-500"
                placeholder="E.g., Design a rate limiter for a distributed API."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Context / Description (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-brand-500 focus:border-brand-500 text-sm"
                placeholder="Additional instructions or scenario context..."
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Expected Answer Points</label>
                <button type="button" onClick={() => setExpectedPoints([...expectedPoints, ''])} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center">
                  <Plus className="h-3 w-3 mr-1" /> Add Point
                </button>
              </div>
              <div className="space-y-2">
                {expectedPoints.map((point, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={point}
                      onChange={e => {
                        const newPts = [...expectedPoints];
                        newPts[idx] = e.target.value;
                        setExpectedPoints(newPts);
                      }}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                      placeholder={`Point ${idx + 1}`}
                    />
                    <button type="button" onClick={() => setExpectedPoints(expectedPoints.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 p-2 rounded-md hover:bg-gray-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {expectedPoints.length === 0 && <p className="text-sm text-gray-500 italic">No expected points defined.</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Follow-Up Questions</h3>
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg flex items-start text-sm mb-4">
              <AlertTriangle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
              <p>Adding follow-ups creates a directed graph. The backend strictly prevents cycles (e.g. A → B → C → A) upon save.</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500"
                placeholder="Search to add existing questions as follow-ups (min 3 chars)..."
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                  {searchResults.map(res => (
                    <div key={res._id} className="p-3 hover:bg-gray-50 border-b border-gray-100 flex justify-between items-center group">
                      <div className="text-sm text-gray-900 line-clamp-1">{res.text}</div>
                      <button 
                        type="button"
                        onClick={() => {
                          setFollowUps([...followUps, res]);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded font-medium"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 mt-4">
              {followUps.map(f => (
                <div key={f._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{f.text}</p>
                    <p className="text-xs text-gray-500">{f.type} • {f.difficulty}</p>
                  </div>
                  <button type="button" onClick={() => setFollowUps(followUps.filter(x => x._id !== f._id))} className="text-gray-400 hover:text-red-500 p-1.5 rounded bg-white border border-gray-200 hover:border-red-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Taxonomy (Right Col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="TECHNICAL">Technical</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="SYSTEM_DESIGN">System Design</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Taxonomy</h3>
            <ArrayInput label="Companies" items={companies} setItems={setCompanies} placeholder="E.g., Google" />
            <ArrayInput label="Domains" items={domains} setItems={setDomains} placeholder="E.g., Frontend" />
            <ArrayInput label="Roles" items={roles} setItems={setRoles} placeholder="E.g., Software Engineer" />
            <ArrayInput label="Tags" items={tags} setItems={setTags} placeholder="E.g., react, hooks" />
          </div>
        </div>
      </form>
      
      {/* Footer Sticky Save */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:left-64 z-40 flex justify-end">
        <button
          type="button"
          onClick={() => navigate(ROUTES.ADMIN_QUESTIONS)}
          className="mr-3 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 flex items-center shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {isNew ? 'Create Question' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
