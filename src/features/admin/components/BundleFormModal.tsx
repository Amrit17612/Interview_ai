import { useState, useEffect } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { bundleService, type BundleData } from '../../../services/bundle.service';
import type { BundleType } from '../../../types/bundle.types';
import { Save, AlertCircle, X, Plus, Trash2 } from 'lucide-react';
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
  const [features, setFeatures] = useState<string[]>([]);
  const [logo, setLogo] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (isEditing && bundle) {
        setName(bundle.name);
        setDescription(bundle.description || '');
        setCategory(bundle.category || '');
        setPrice(bundle.price || 0);
        setOriginalPrice(bundle.originalPrice || 0);
        setFeatures(bundle.features || []);
        setLogo(bundle.logo || '');
      } else {
        // reset form
        setName('');
        setDescription('');
        setCategory('');
        setPrice(0);
        setOriginalPrice(0);
        setFeatures([]);
        setLogo('');
      }
      setError(null);
    }
  }, [isOpen, isEditing, bundle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const cleanedFeatures = features.map(f => f.trim()).filter(f => f.length > 0);

    const payload = {
      name,
      description,
      category,
      price,
      originalPrice,
      type,
      features: cleanedFeatures,
      logo
    };

    try {
      let savedBundleId = '';
      
      if (isEditing && bundle) {
        savedBundleId = bundle.bundleId || bundle._id;
        await bundleService.updateBundle(savedBundleId, payload);
      } else {
        const newBundle = await bundleService.createBundle(payload);
        savedBundleId = newBundle.bundleId || newBundle._id;
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save bundle.');
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Logo (Optional)</label>
          {logo ? (
            <div className="flex items-center gap-4 mt-2 mb-2">
              <img src={logo} alt="Bundle Logo" className="h-12 w-12 object-contain rounded bg-gray-50 border border-gray-200" />
              <Button type="button" variant="outline" size="sm" onClick={() => setLogo('')}>
                Remove Logo
              </Button>
            </div>
          ) : (
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setLogo(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          )}
        </div>

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

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Features</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFeatures([...features, ''])}
              className="text-xs py-1 h-7"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Feature
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  label=""
                  value={feature}
                  onChange={(e) => {
                    const newF = [...features];
                    newF[idx] = e.target.value;
                    setFeatures(newF);
                  }}
                  placeholder={`Feature ${idx + 1}`}
                  className="flex-grow mb-0"
                />
                <button
                  type="button"
                  onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {features.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-2 bg-gray-50 rounded border border-dashed border-gray-200">
                No features added yet.
              </p>
            )}
          </div>
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
