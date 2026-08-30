import { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { Plus, Tag } from 'lucide-react';
import { apiClient } from '../../../services/api.client';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

interface PromoCode {
  _id: string;
  code: string;
  isActive: boolean;
  discountType: 'FIXED';
  discountValue: number;
  maxGlobalUsage: number | null;
  maxPerUserUsage: number | null;
  currentUsageCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export function PromoManagement() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [code, setCode] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [maxGlobalUsage, setMaxGlobalUsage] = useState('');
  const [maxPerUserUsage, setMaxPerUserUsage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const fetchPromos = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<{ promos: PromoCode[] }>('/admin/promos');
      setPromos(response.data.promos);
    } catch (error) {
      console.error('Failed to fetch promos:', error);
      alert('Failed to fetch promos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        code,
        discountValue: Number(discountValue),
        maxGlobalUsage: maxGlobalUsage ? Number(maxGlobalUsage) : null,
        maxPerUserUsage: maxPerUserUsage ? Number(maxPerUserUsage) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
      };

      await apiClient.post('/admin/promos', payload);
      setIsModalOpen(false);
      resetForm();
      fetchPromos();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to create promo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/admin/promos/${id}/status`, { isActive: !currentStatus });
      fetchPromos();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  const resetForm = () => {
    setCode('');
    setDiscountValue('');
    setMaxGlobalUsage('');
    setMaxPerUserUsage('');
    setExpiresAt('');
  };

  return (
    <Container className="py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <PageHeader 
          title="Promo Codes" 
          description="Create and manage discount codes for checkout."
        />
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Promo
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-700">Code</th>
                <th className="p-4 font-semibold text-gray-700">Discount (Paise)</th>
                <th className="p-4 font-semibold text-gray-700">Usage</th>
                <th className="p-4 font-semibold text-gray-700">Global Limit</th>
                <th className="p-4 font-semibold text-gray-700">User Limit</th>
                <th className="p-4 font-semibold text-gray-700">Expires</th>
                <th className="p-4 font-semibold text-gray-700">Status</th>
                <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">Loading promos...</td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">No promo codes found</td>
                </tr>
              ) : (
                promos.map(promo => (
                  <tr key={promo._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-brand-600" />
                      {promo.code}
                    </td>
                    <td className="p-4 text-gray-600 font-mono">{promo.discountValue}</td>
                    <td className="p-4 text-gray-600">{promo.currentUsageCount}</td>
                    <td className="p-4 text-gray-600">{promo.maxGlobalUsage || '∞'}</td>
                    <td className="p-4 text-gray-600">{promo.maxPerUserUsage || '∞'}</td>
                    <td className="p-4 text-gray-600">
                      {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-4">
                      {promo.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleStatus(promo._id, promo.isActive)}
                      >
                        {promo.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Create Promo Code</h3>
        <form onSubmit={handleCreatePromo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
            <Input 
              required
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. LAUNCH50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (in paise, 100 = ₹1)</label>
            <Input 
              type="number"
              required
              min="1"
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
              placeholder="e.g. 1000 for ₹10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Global Usage Limit (Optional)</label>
            <Input 
              type="number"
              min="1"
              value={maxGlobalUsage}
              onChange={e => setMaxGlobalUsage(e.target.value)}
              placeholder="Leave blank for unlimited"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per-User Usage Limit (Optional)</label>
            <Input 
              type="number"
              min="1"
              value={maxPerUserUsage}
              onChange={e => setMaxPerUserUsage(e.target.value)}
              placeholder="Leave blank for unlimited"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
            <Input 
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Promo'}
            </Button>
          </div>
        </form>
      </Modal>
    </Container>
  );
}
