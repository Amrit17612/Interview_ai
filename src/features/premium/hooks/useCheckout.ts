import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../../services/payment.service';
import { loadRazorpay } from '../../../utils/loadRazorpay';
import { useAuth } from '../../auth/hooks/useAuth';
import { ROUTES } from '../../../constants/routes';

export const useCheckout = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { refreshUser } = useAuth();

  const handleCheckout = async (bundleId: string, bundleType: 'COMPANY' | 'DOMAIN', promoCode?: string, creditsToUse?: number) => {
    try {
      setIsProcessing(bundleId);

      // 1. Create Order
      const order = await paymentService.createOrder({ bundleId, bundleType, promoCode, creditsToUse });
      if (!order.success) {
        alert(order.message || 'Failed to create order. Please try again.');
        setIsProcessing(null);
        return;
      }

      if (order.status === 'SUCCESS_ZERO_COST') {
        await refreshUser();
        alert('Successfully claimed using promo/credits!');
        setIsProcessing(null);
        navigate(ROUTES.MY_PURCHASES);
        return;
      }

      // 2. Load Razorpay script
      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        alert('Razorpay SDK failed to load. Are you online?');
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
              navigate(ROUTES.MY_PURCHASES);
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
          ondismiss: async () => {
            if (order.orderId) {
              await reconcilePayment(order.orderId);
            } else {
              setIsProcessing(null);
            }
          }
        }
      };

      const reconcilePayment = async (orderId: string, maxAttempts = 3) => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const result = await paymentService.cancelOrder(orderId);
            
            if (result.paymentStatus === 'SUCCESS') {
              await refreshUser();
              setIsProcessing(null);
              // Close any open modals and navigate
              const rzpContainers = document.querySelectorAll('.razorpay-container');
              rzpContainers.forEach(container => container.remove());
              navigate(ROUTES.MY_PURCHASES);
              return;
            }
            
            if (result.paymentStatus === 'FAILED') {
              alert('Payment failed. You can try again.');
              setIsProcessing(null);
              return;
            }

            // PROCESSING or CREATED -> wait and poll
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            }
          } catch (err) {
            console.error("Reconciliation error", err);
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            }
          }
        }
        
        // Timeout
        alert('Payment is being verified. Please check your purchases shortly. Do not pay again.');
        setIsProcessing(null);
      };

      const rzp = new Razorpay(options);
      
      rzp.on('payment.failed', async (response: any) => {
        console.error(response.error);
        if (order.orderId) {
          await reconcilePayment(order.orderId);
        } else {
          alert('Payment failed. Please try again.');
          setIsProcessing(null);
        }
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
