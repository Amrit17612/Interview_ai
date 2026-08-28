import { apiClient } from './api.client';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  onboardingCompleted: boolean;
  emailVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  warning?: string;
  user?: AuthUser;
}

export const authService = {
  async register(data: any, token: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', { ...data, firebaseToken: token });
    return response.data;
  },

  async login(token: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', { firebaseToken: token });
    return response.data;
  },

  async logout(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/logout');
    return response.data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>('/auth/me');
    return response.data;
  },

  async verifyEmail(token: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/verify-email', { token });
    return response.data;
  },

  async resendVerification(email: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/resend-verification', { email });
    return response.data;
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(data: any): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/reset-password', data);
    return response.data;
  },

  async completeOnboarding(): Promise<AuthResponse> {
    const response = await apiClient.patch<AuthResponse>('/auth/onboarding');
    return response.data;
  },
};
