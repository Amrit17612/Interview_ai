import { apiClient } from './api.client';
import type { AuthUser } from './auth.service';

export interface CreateOrderRequest {
  bundleId: string;
  bundleType: 'COMPANY' | 'DOMAIN';
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

export const paymentService = {
  createOrder: async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await apiClient.post<CreateOrderResponse>('/payments/create-order', data);
    return response.data;
  },

  verifyPayment: async (data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
    const response = await apiClient.post<VerifyPaymentResponse>('/payments/verify', data);
    return response.data;
  },
  
  getHistory: async () => {
    const response = await apiClient.get('/payments/history');
    return response.data;
  }
};
