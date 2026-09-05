import { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { Plus, BookOpen, AlertCircle, Edit, Settings } from 'lucide-react';
import type { BundleData } from '../../../services/bundle.service';
import type { BundleType } from '../../../types/bundle.types';
import { bundleService } from '../../../services/bundle.service';
import { BundleFormModal } from '../components/BundleFormModal';
import { ModuleManagementModal } from '../components/ModuleManagementModal';

interface BundleManagementProps {
  type: BundleType;
  title: string;
}

export function BundleManagement({ type, title }: BundleManagementProps) {
  const [bundles, setBundles] = useState<BundleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<BundleData | null>(null);
  
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [managingModulesBundle, setManagingModulesBundle] = useState<BundleData | null>(null);

  const fetchBundles = async () => {
    try {
      setIsLoading(true);
      const data = await bundleService.getAllBundles(type);
      setBundles(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bundles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, [type]);

  const handleCreate = () => {
    setEditingBundle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (bundle: BundleData) => {
    setEditingBundle(bundle);
    setIsModalOpen(true);
  };

  const handleSaved = () => {
    setIsModalOpen(false);
    fetchBundles();
  };

  const handleManageModules = (bundle: BundleData) => {
    setManagingModulesBundle(bundle);
    setIsModuleModalOpen(true);
  };

  const handleModulesSaved = () => {
    setIsModuleModalOpen(false);
    fetchBundles();
  };

  return (
    <Container className="py-8">
      <PageHeader
        title={title}
        description={`Manage ${type.toLowerCase()} bundles, pricing, and interview modules.`}
      >
        <Button onClick={handleCreate} className="bg-brand-600 hover:bg-brand-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Create Bundle
        </Button>
      </PageHeader>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {bundles.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles found</h3>
              <p className="mb-6">Create a new {type.toLowerCase()} bundle to get started.</p>
              <Button onClick={handleCreate} className="bg-brand-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> Create Bundle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                    <th className="p-4 font-semibold text-gray-600">ID / Name</th>
                    <th className="p-4 font-semibold text-gray-600">Price</th>
                    <th className="p-4 font-semibold text-gray-600">Modules</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                    <th className="p-4 font-semibold text-gray-600">Visibility</th>
                    <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bundles.map((bundle) => (
                    <tr key={bundle._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{bundle.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{bundle.bundleId}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900">
                          {bundle.price > 0 ? `$${bundle.price}` : 'Free'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {bundle.modules?.length || 0} Modules
                        </div>
                      </td>
                      <td className="p-4">
                        {bundle.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bundle.visibility === 'PUBLIC' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {bundle.visibility}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleManageModules(bundle)}>
                            <Settings className="h-4 w-4 mr-2" /> Modules
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(bundle)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <BundleFormModal
          isOpen={isModalOpen}
          type={type}
          bundle={editingBundle || undefined}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaved}
        />
      )}

      {isModuleModalOpen && managingModulesBundle && (
        <ModuleManagementModal
          bundle={managingModulesBundle!}
          isOpen={isModuleModalOpen}
          onClose={() => setIsModuleModalOpen(false)}
          onUpdate={handleModulesSaved}
        />
      )}
    </Container>
  );
}
