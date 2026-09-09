import { apiClient } from './api.client';

export interface WalletTransaction {
  _id: string;
  amount: number;
  type: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  relatedBundle?: string;
}

export interface WalletHistoryResponse {
  success: boolean;
  count: number;
  data: WalletTransaction[];
}

export const userService = {
  async getWalletHistory(): Promise<WalletHistoryResponse> {
    const response = await apiClient.get<WalletHistoryResponse>('/user/credits/history');
    return response.data;
  },

  async updateProfile(data: { firstName?: string; lastName?: string }): Promise<{ success: boolean; user: any; message?: string }> {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  },

  async getAchievements(): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.get('/user/achievements');
    return response.data;
  }
};
