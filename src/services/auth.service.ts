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
  async register(data: any, firebaseToken: string, requestId?: string): Promise<AuthResponse> {
    if (!firebaseToken) { 
      throw new Error("authService.register received an empty Firebase token"); 
    }
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      firebaseToken: firebaseToken
    };
    
    console.log("[REGISTER SERVICE] Payload keys:", Object.keys(payload));
    console.log("[REGISTER SERVICE] Token exists:", Boolean(payload.firebaseToken));
    console.log("[REGISTER SERVICE] Token length:", payload.firebaseToken.length);
    
    const headers: Record<string, string> = { 
      "Content-Type": "application/json",
      "X-Login-Path": "FINAL-FIREBASE-FLOW"
    };
    if (requestId) headers['X-Debug-Request-ID'] = requestId;
    
    const response = await apiClient.post<AuthResponse>('/auth/register', payload, { headers });
    return response.data;
  },

  async login(firebaseToken: string, requestId?: string): Promise<AuthResponse> {
    if (!firebaseToken) { 
      throw new Error("authService.login received an empty Firebase token"); 
    }
    const payload = {
      firebaseToken: firebaseToken
    };
    
    console.log("[LOGIN SERVICE] Payload keys:", Object.keys(payload));
    console.log("[LOGIN SERVICE] Token exists:", Boolean(payload.firebaseToken));
    console.log("[LOGIN SERVICE] Token length:", payload.firebaseToken.length);
    
    const headers: Record<string, string> = { 
      "Content-Type": "application/json",
      "X-Login-Path": "FINAL-FIREBASE-FLOW"
    };
    if (requestId) headers['X-Debug-Request-ID'] = requestId;
    
    const response = await apiClient.post<AuthResponse>('/auth/login', payload, { headers });
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
