import { useState, useEffect } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import type { BundleData } from '../../../services/bundle.service';
import { X, Search, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '../../../services/api.client';

interface ModuleManagementModalProps {
  bundle: BundleData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ModuleManagementModal({ bundle, isOpen, onClose, onUpdate }: ModuleManagementModalProps) {
  const [modules, setModules] = useState<any[]>(bundle.modules || []);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setModules(bundle.modules || []);
      fetchTemplates();
    }
  }, [isOpen, bundle]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/interview-templates?status=PUBLISHED');
      if (res.data.success) {
        setAvailableTemplates(res.data.data.templates || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModule = (template: any) => {
    if (modules.find(m => m._id === template._id)) return;
    setModules([...modules, template]);
  };

  const handleRemoveModule = (index: number) => {
    const newModules = [...modules];
    newModules.splice(index, 1);
    setModules(newModules);
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newModules = [...modules];
      [newModules[index - 1], newModules[index]] = [newModules[index], newModules[index - 1]];
      setModules(newModules);
    } else if (direction === 'down' && index < modules.length - 1) {
      const newModules = [...modules];
      [newModules[index + 1], newModules[index]] = [newModules[index], newModules[index + 1]];
      setModules(newModules);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await apiClient.put(`/bundles/admin/${bundle.bundleId}/modules`, {
        modules: modules.map(m => m._id)
      });
      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save modules');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Modules: {bundle.name}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
        
        {/* Left Side: Current Modules */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2">Included Modules ({modules.length})</h3>
          
          {modules.length === 0 ? (
            <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">
              No modules added yet. Select from available templates.
            </div>
          ) : (
            <div className="space-y-2">
              {modules.map((module, idx) => (
                <div key={module._id || idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col space-y-1 mr-3 text-gray-400">
                      <button onClick={() => moveModule(idx, 'up')} disabled={idx === 0} className="hover:text-brand-600 disabled:opacity-30">▲</button>
                      <button onClick={() => moveModule(idx, 'down')} disabled={idx === modules.length - 1} className="hover:text-brand-600 disabled:opacity-30">▼</button>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{module.title || 'Untitled Module'}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {module.category || 'TECHNICAL'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveModule(idx)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg ml-2"
                    title="Remove Module"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Available Templates Library */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Available Templates</h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="text-center py-4 text-sm text-gray-500">Loading templates...</div>
            ) : availableTemplates
              .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(template => {
                const isAdded = modules.some(m => m._id === template._id);
                return (
                  <div key={template._id} className={`p-3 bg-white border rounded-lg shadow-sm flex items-center justify-between ${isAdded ? 'border-brand-200 opacity-60' : 'border-gray-200'}`}>
                    <div className="pr-3">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{template.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {template.category}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                          {template.difficulty}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={isAdded ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleAddModule(template)}
                      disabled={isAdded}
                      className="shrink-0 h-8 px-2"
                    >
                      {isAdded ? 'Added' : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                    </Button>
                  </div>
                );
            })}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-brand-600 text-white hover:bg-brand-700">
          {isSaving ? 'Saving...' : 'Save Module Order'}
        </Button>
      </div>
    </Dialog>
  );
}
