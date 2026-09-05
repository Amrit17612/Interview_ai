import { useState, useEffect } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { BundleData } from '../../../services/bundle.service';
import type { BundleType } from '../../../types/bundle.types';
import { apiClient } from '../../../services/api.client';
import { Save, AlertCircle, X } from 'lucide-react';
import { getCategoryOptions } from '../../../constants/bundleCategories';

interface BundleFormModalProps {
  bundle?: BundleData; // if provided, editing
  type: BundleType; // whether creating a company or domain pack
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function BundleFormModal({ bundle, type, isOpen, onClose, onSave }: BundleFormModalProps) {
  const isEditing = !!bundle;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && bundle) {
        setName(bundle.name);
        setDescription(bundle.description || '');
        setCategory(bundle.category || '');
        setPrice(bundle.price || 0);
        setOriginalPrice(bundle.originalPrice || 0);
      } else {
        // reset form
        setName('');
        setDescription('');
        setCategory('');
        setPrice(0);
        setOriginalPrice(0);
      }
      setError(null);
    }
  }, [isOpen, isEditing, bundle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      name,
      description,
      category,
      price,
      originalPrice,
      type
    };

    try {
      if (isEditing && bundle) {
        await apiClient.put(`/bundles/admin/${bundle.bundleId}`, payload);
      } else {
        await apiClient.post('/bundles/admin', payload);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save bundle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">{isEditing ? `Edit ${type === 'company' || type === 'COMPANY' ? 'Company' : 'Domain'} Pack` : `Create ${type === 'company' || type === 'COMPANY' ? 'Company' : 'Domain'} Pack`}</h2>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Google SWE Prep"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-h-[100px]"
            placeholder="Describe what this preparation pack offers..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            required
          >
            <option value="" disabled>Select category</option>
            {getCategoryOptions(type.toUpperCase() as 'COMPANY' | 'DOMAIN').map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Current Price (in credits)"
            type="number"
            min="0"
            step="1"
            value={price.toString()}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
          <Input
            label="Original Price (optional)"
            type="number"
            min="0"
            step="1"
            value={originalPrice.toString()}
            onChange={(e) => setOriginalPrice(Number(e.target.value))}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-brand-600 text-white hover:bg-brand-700">
            {isSubmitting ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Pack</>}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
