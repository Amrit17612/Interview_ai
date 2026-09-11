import { MOCK_COMPANY_BUNDLES, MOCK_DOMAIN_BUNDLES } from '../types/bundle.types';
import type { BundleType, BundleMetadata } from '../types/bundle.types';
import { apiClient } from './api.client';

// Map BundleMetadata to BundleData format used by components
const mapToBundleData = (bundle: BundleMetadata): BundleData => ({
  _id: bundle.id,
  bundleId: bundle.id,
  type: bundle.type.toUpperCase() as BundleType,
  name: bundle.name,
  description: bundle.description,
  category: bundle.category,
  price: bundle.price,
  originalPrice: bundle.originalPrice,
  features: bundle.features,
  iconType: bundle.iconType,
  isPopular: bundle.isPopular,
  active: true,
  visibility: 'PUBLIC',
  modules: [],
  interviewConfig: bundle.interviewConfig
});

export interface BundleData {
  _id: string;
  bundleId: string;
  type: BundleType;
  name: string;
  description?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  features: string[];
  iconType?: string;
  isPopular?: boolean;
  active: boolean;
  visibility: 'PUBLIC' | 'PRIVATE';
  modules: any[];
  interviewConfig?: any;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Remove localStorage entirely
// const STORAGE_KEY = 'interview_ai_custom_bundles';

const fetchBackendBundles = async (): Promise<BundleData[]> => {
  try {
    const res = await apiClient.get<{ customBundles: any[] }>('/bundles/custom');
    return (res.data.customBundles || []).map(b => ({
      ...b,
      _id: b.bundleId, // normalize IDs
      type: (b.type || 'COMPANY').toUpperCase() as BundleType
    }));
  } catch (error) {
    console.error('Failed to fetch backend custom bundles', error);
    return [];
  }
};

const deduplicateBundles = (bundles: BundleData[]): BundleData[] => {
  const seen = new Set<string>();
  return bundles.filter(b => {
    const key = b.bundleId || b._id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const bundleService = {
  // Student Portal
  getPublicBundles: async (): Promise<BundleData[]> => {
    const mocks = [...MOCK_COMPANY_BUNDLES, ...MOCK_DOMAIN_BUNDLES].map(mapToBundleData);
    const backendBundles = await fetchBackendBundles();
    return deduplicateBundles([...backendBundles, ...mocks]);
  },

  getBundleById: async (id: string): Promise<BundleData> => {
    const mocks = [...MOCK_COMPANY_BUNDLES, ...MOCK_DOMAIN_BUNDLES].map(mapToBundleData);
    const backendBundles = await fetchBackendBundles();
    const found = deduplicateBundles([...backendBundles, ...mocks]).find(b => b._id === id || b.bundleId === id);
    if (!found) throw new Error('Bundle not found');
    return found;
  },

  // Admin Portal
  getAllBundles: async (type?: string): Promise<BundleData[]> => {
    const mocks = [...MOCK_COMPANY_BUNDLES, ...MOCK_DOMAIN_BUNDLES].map(mapToBundleData);
    const backendBundles = await fetchBackendBundles();
    let all = deduplicateBundles([...backendBundles, ...mocks]);
    
    if (type) {
      all = all.filter(b => b.type.toUpperCase() === type.toUpperCase());
    }
    return all;
  },

  createBundle: async (data: Partial<BundleData>): Promise<BundleData> => {
    const customId = `custom_${Date.now()}`;
    const newBundle: BundleData = {
      ...data,
      _id: customId,
      bundleId: customId,
      type: data.type || 'COMPANY',
      name: data.name || '',
      description: data.description,
      category: data.category,
      price: data.price || 0,
      originalPrice: data.originalPrice,
      features: data.features || [],
      iconType: data.iconType || 'custom',
      active: data.active ?? true,
      visibility: data.visibility || 'PUBLIC',
      modules: data.modules || [],
      logo: data.logo,
      createdAt: new Date().toISOString()
    };

    // Sync to backend, passing full payload
    await bundleService.syncBundlePrice(newBundle);
    return newBundle;
  },

  updateBundle: async (id: string, data: Partial<BundleData>): Promise<BundleData> => {
    // First, fetch to ensure it exists
    const backendBundles = await fetchBackendBundles();
    const existing = backendBundles.find(b => b.bundleId === id || b._id === id);

    if (existing) {
      const updatedBundle = {
        ...existing,
        ...data,
        _id: existing._id,
        bundleId: existing.bundleId,
        updatedAt: new Date().toISOString()
      };

      if (id.startsWith('custom_')) {
        await bundleService.syncBundlePrice(updatedBundle);
      }
      return updatedBundle;
    }
    throw new Error('Cannot update mock bundles, or bundle not found');
  },

  setModules: async (id: string, moduleIds: string[]): Promise<BundleData> => {
    return bundleService.updateBundle(id, { modules: moduleIds.map(m => ({ _id: m })) });
  },

  syncBundlePrice: async (bundleData: BundleData): Promise<void> => {
    try {
      await apiClient.post('/admin/custom-bundle-prices', bundleData);
    } catch (error) {
      console.error('Failed to sync bundle price to backend', error);
      throw error;
    }
  },

  deactivateBundlePrice: async (bundleId: string): Promise<void> => {
    try {
      await apiClient.post('/admin/custom-bundle-prices', { bundleId, price: 0, active: false });
    } catch (error) {
      console.error('Failed to deactivate bundle price on backend', error);
      throw error;
    }
  },

  deleteBundle: async (id: string): Promise<void> => {
    if (!id.startsWith('custom_')) {
      throw new Error('Cannot delete predefined or mock bundles.');
    }
    // Deactivate on backend (preserves payment history but removes from public view)
    await bundleService.deactivateBundlePrice(id);
  }
};
