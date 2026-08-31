import { apiClient } from './api.client';
import type { AuthUser } from './auth.service';

export interface CreateOrderRequest {
  bundleId: string;
  bundleType: 'COMPANY' | 'DOMAIN';
  promoCode?: string;
  creditsToUse?: number;
}

export interface CreateOrderResponse {
  success: boolean;
  status: 'SUCCESS_ZERO_COST' | 'REQUIRES_PAYMENT';
  orderId?: string;
  amount?: number;
  currency?: string;
  message?: string;
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

export interface ValidatePromoResponse {
  success: boolean;
  discountAmount: number;
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

  validatePromo: async (promoCode: string, bundleId: string): Promise<ValidatePromoResponse> => {
    const response = await apiClient.get<ValidatePromoResponse>(`/payments/promo/validate?code=${encodeURIComponent(promoCode)}&bundleId=${encodeURIComponent(bundleId)}`);
    return response.data;
  },
  
  getHistory: async () => {
    const response = await apiClient.get('/payments/history');
    return response.data;
  },

  cancelOrder: async (orderId: string): Promise<any> => {
    const response = await apiClient.post('/payments/cancel', { orderId });
    return response.data;
  }
};
