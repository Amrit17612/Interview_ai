import { useState } from 'react';
import { X, Loader2, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../../services/api.client';
import { MOCK_COMPANY_BUNDLES, MOCK_DOMAIN_BUNDLES } from '../../../types/bundle.types';

interface Props {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManualGrantModal({ user, onClose, onSuccess }: Props) {
  const [bundleId, setBundleId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundleId) {
      setError('Please select a bundle');
      return;
    }
    if (!reason || reason.trim().length < 5) {
      setError('A valid reason (min 5 characters) is mandatory.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.post(`/api/admin/users/${user._id}/grant-bundle`, {
        bundleId,
        reason: reason.trim()
      });
      
      if (res.data.success) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to grant bundle. Ensure they don\'t already own it.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Manual Bundle Grant</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-6 flex items-start text-sm">
            <ShieldAlert className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
            <p>
              You are manually granting <span className="font-bold">{user.email}</span> free access to a bundle. 
              This action will be permanently recorded in the Audit Log.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form id="grant-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Bundle</label>
              <select
                value={bundleId}
                onChange={(e) => setBundleId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-brand-500 focus:border-brand-500 bg-white"
                disabled={loading}
              >
                <option value="">-- Choose a bundle --</option>
                <optgroup label="Company Bundles">
                  {MOCK_COMPANY_BUNDLES.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Domain Bundles">
                  {MOCK_DOMAIN_BUNDLES.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mandatory Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Complimentary access for support ticket #1234"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-brand-500 focus:border-brand-500"
                disabled={loading}
                required
                minLength={5}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a clear reason for the audit trail. (Min 5 chars)
              </p>
            </div>
          </form>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="grant-form"
            disabled={loading || !bundleId || reason.length < 5}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Processing...
              </>
            ) : (
              'Confirm Grant'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
