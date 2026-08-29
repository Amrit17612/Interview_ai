import { useState } from 'react';
import { paymentService } from '../../../services/payment.service';
import { loadRazorpay } from '../../../utils/loadRazorpay';
import { useAuth } from '../../auth/hooks/useAuth';

export const useCheckout = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { refreshUser } = useAuth();

  const handleCheckout = async (bundleId: string, bundleType: 'COMPANY' | 'DOMAIN') => {
    try {
      setIsProcessing(bundleId);

      // 1. Load Razorpay script
      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(null);
        return;
      }

      // 2. Create Order
      const order = await paymentService.createOrder({ bundleId, bundleType });
      if (!order.success) {
        alert('Failed to create order. Please try again.');
        setIsProcessing(null);
        return;
      }

      // 3. Initialize Checkout
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        alert('Payment configuration is missing. Please contact support.');
        setIsProcessing(null);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Interview AI',
        description: `Unlock ${bundleType === 'COMPANY' ? 'Company' : 'Domain'} Bundle`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            // 4. Verify Payment
            const verification = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verification.success) {
              // Refresh user context to update purchasedBundles instantly
              await refreshUser();
            } else {
              alert('Payment verification failed.');
            }
          } catch (error) {
            console.error(error);
            alert('Payment could not be verified. Please try again or contact support.');
          } finally {
            setIsProcessing(null);
          }
        },
        prefill: {
          name: 'Interview AI User',
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(null);
          }
        }
      };

      const rzp = new Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        console.error(response.error);
        alert('Payment failed. Please try again.');
        setIsProcessing(null);
      });

      rzp.open();

    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error processing payment. Please try again.');
      setIsProcessing(null);
    }
  };

  return {
    handleCheckout,
    isProcessing
  };
};
