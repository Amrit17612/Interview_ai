import { apiClient } from './api.client';
import type { BundleType } from '../types/bundle.types';

// Extend the existing Bundle interface or create a new one to match DB
export interface BundleData {
  _id: string;
  bundleId: string;
  type: BundleType;
  name: string;
  description?: string;
  category?: string;
  price: number; // in USD
  originalPrice?: number;
  features: string[];
  iconType?: string;
  isPopular?: boolean;
  active: boolean;
  visibility: 'PUBLIC' | 'PRIVATE';
  modules: any[]; // InterviewTemplate array
  interviewConfig?: any; // Legacy
  createdAt?: string;
  updatedAt?: string;
}

export const bundleService = {
  // Student Portal
  getPublicBundles: async (): Promise<BundleData[]> => {
    const response = await apiClient.get('/bundles');
    return response.data.data;
  },

  getBundleById: async (id: string): Promise<BundleData> => {
    const response = await apiClient.get(`/bundles/${id}`);
    return response.data.data;
  },

  // Admin Portal
  getAllBundles: async (type?: string): Promise<BundleData[]> => {
    const response = await apiClient.get(`/bundles/admin/all${type ? `?type=${type}` : ''}`);
    return response.data.data;
  },

  createBundle: async (data: Partial<BundleData>): Promise<BundleData> => {
    const response = await apiClient.post('/bundles/admin', data);
    return response.data.data;
  },

  updateBundle: async (id: string, data: Partial<BundleData>): Promise<BundleData> => {
    const response = await apiClient.put(`/bundles/admin/${id}`, data);
    return response.data.data;
  },

  setModules: async (id: string, moduleIds: string[]): Promise<BundleData> => {
    const response = await apiClient.put(`/bundles/admin/${id}/modules`, { moduleIds });
    return response.data.data;
  }
};
