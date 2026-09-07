import { MOCK_COMPANY_BUNDLES, MOCK_DOMAIN_BUNDLES } from '../types/bundle.types';
import type { BundleType, BundleMetadata } from '../types/bundle.types';

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
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'interview_ai_custom_bundles';

const getLocalBundles = (): BundleData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalBundles = (bundles: BundleData[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bundles));
};

export const bundleService = {
  // Student Portal
  getPublicBundles: async (): Promise<BundleData[]> => {
    const mocks = [...MOCK_COMPANY_BUNDLES, ...MOCK_DOMAIN_BUNDLES].map(mapToBundleData);
    const locals = getLocalBundles().filter(b => b.active && b.visibility === 'PUBLIC');
    return [...mocks, ...locals];
  },

  getBundleById: async (id: string): Promise<BundleData> => {
    const mocks = [...MOCK_COMPANY_BUNDLES, ...MOCK_DOMAIN_BUNDLES].map(mapToBundleData);
    const locals = getLocalBundles();
    const found = [...locals, ...mocks].find(b => b._id === id || b.bundleId === id);
    if (!found) throw new Error('Bundle not found');
    return found;
  },

  // Admin Portal
  getAllBundles: async (type?: string): Promise<BundleData[]> => {
    const mocks = [...MOCK_COMPANY_BUNDLES, ...MOCK_DOMAIN_BUNDLES].map(mapToBundleData);
    const locals = getLocalBundles();
    let all = [...locals, ...mocks];
    if (type) {
      all = all.filter(b => b.type.toUpperCase() === type.toUpperCase());
    }
    return all;
  },

  createBundle: async (data: Partial<BundleData>): Promise<BundleData> => {
    const newBundle: BundleData = {
      _id: `custom_${Date.now()}`,
      bundleId: data.bundleId || `custom_${Date.now()}`,
      type: data.type || 'company',
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
      createdAt: new Date().toISOString(),
      ...data
    };
    
    const locals = getLocalBundles();
    saveLocalBundles([newBundle, ...locals]);
    return newBundle;
  },

  updateBundle: async (id: string, data: Partial<BundleData>): Promise<BundleData> => {
    const locals = getLocalBundles();
    const idx = locals.findIndex(b => b._id === id || b.bundleId === id);
    
    if (idx !== -1) {
      locals[idx] = { ...locals[idx], ...data, updatedAt: new Date().toISOString() };
      saveLocalBundles(locals);
      return locals[idx];
    }
    throw new Error('Cannot update mock bundles, or bundle not found');
  },

  setModules: async (id: string, moduleIds: string[]): Promise<BundleData> => {
    return bundleService.updateBundle(id, { modules: moduleIds.map(m => ({ _id: m })) });
  }
};
