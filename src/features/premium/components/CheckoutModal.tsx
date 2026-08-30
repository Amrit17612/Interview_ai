import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { paymentService } from '../../../services/payment.service';
import { useAuth } from '../../auth/hooks/useAuth';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundleId: string;
  bundleType: 'COMPANY' | 'DOMAIN';
  bundleTitle: string;
  originalPrice: number; // in paise
  onConfirm: (promoCode?: string, creditsToUse?: number) => void;
  isProcessing: boolean;
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  bundleId, 
  bundleType, 
  bundleTitle, 
  originalPrice, 
  onConfirm,
  isProcessing
}: CheckoutModalProps) {
  const { user } = useAuth();
  
  const availableCredits = user?.credits || 0;
  
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | undefined>(undefined);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState<number>(0);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  
  const [creditsInput, setCreditsInput] = useState<string>('0');

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    try {
      setIsValidatingPromo(true);
      setPromoError('');
      setPromoSuccess('');
      
      const response = await paymentService.validatePromo(promoCodeInput.trim(), bundleId);
      if (response.success) {
        setAppliedPromo(promoCodeInput.trim());
        setPromoDiscountAmount(response.discountAmount);
        setPromoSuccess('Promo code applied successfully!');
      } else {
        setPromoError('Invalid promo code');
      }
    } catch (error: any) {
      setAppliedPromo(undefined);
      setPromoDiscountAmount(0);
      setPromoError(error.response?.data?.message || 'Failed to validate promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleClearPromo = () => {
    setPromoCodeInput('');
    setAppliedPromo(undefined);
    setPromoDiscountAmount(0);
    setPromoSuccess('');
    setPromoError('');
  };

  // Calculation Math
  const discountedSubtotal = Math.max(0, originalPrice - promoDiscountAmount);
  
  let parsedCredits = parseInt(creditsInput, 10);
  if (isNaN(parsedCredits) || parsedCredits < 0) parsedCredits = 0;
  
  const maxCreditsCanUse = Math.floor(Math.min(discountedSubtotal, availableCredits * 100) / 100);
  
  // Constrain credit usage for display
  if (parsedCredits > maxCreditsCanUse) {
    parsedCredits = maxCreditsCanUse;
  }
  
  const creditsValueInPaise = parsedCredits * 100;
  const finalPayableAmount = Math.max(0, discountedSubtotal - creditsValueInPaise);

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
  };

  const handleSubmit = () => {
    onConfirm(appliedPromo, parsedCredits);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Secure Checkout</h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{bundleTitle}</h3>
          <p className="text-gray-500 text-sm">{bundleType === 'COMPANY' ? 'Company Preparation Bundle' : 'Domain Preparation Bundle'}</p>
        </div>

        {/* Promo Code Section */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <label className="block text-sm font-medium text-gray-700">Promo Code (Optional)</label>
          <div className="flex gap-2">
            <Input 
              value={promoCodeInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPromoCodeInput(e.target.value.toUpperCase())}
              placeholder="Enter code"
              disabled={!!appliedPromo || isValidatingPromo}
            />
            {appliedPromo ? (
              <Button type="button" variant="secondary" onClick={handleClearPromo}>
                Remove
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={handleApplyPromo} disabled={!promoCodeInput || isValidatingPromo}>
                {isValidatingPromo ? 'Checking...' : 'Apply'}
              </Button>
            )}
          </div>
          {promoError && <p className="text-red-600 text-sm mt-1">{promoError}</p>}
          {promoSuccess && <p className="text-green-600 text-sm mt-1">{promoSuccess}</p>}
        </div>

        {/* Credits Section */}
        <div className="bg-amber-50 p-4 rounded-lg space-y-3 border border-amber-100">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-amber-900">Wallet Credits (Optional)</label>
            <span className="text-sm font-bold text-amber-700">Available: {availableCredits}</span>
          </div>
          <p className="text-xs text-amber-700">1 Credit = ₹1.00</p>
          <div className="flex items-center gap-3">
            <Input 
              type="number"
              min="0"
              max={maxCreditsCanUse}
              value={creditsInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreditsInput(e.target.value)}
              disabled={availableCredits === 0 || discountedSubtotal === 0}
              className="max-w-[120px]"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setCreditsInput(maxCreditsCanUse.toString())}
              disabled={availableCredits === 0 || discountedSubtotal === 0}
            >
              Use Max ({maxCreditsCanUse})
            </Button>
          </div>
        </div>

        {/* Breakdown */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Original Price</span>
            <span>{formatCurrency(originalPrice)}</span>
          </div>
          
          {promoDiscountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Promo Discount</span>
              <span>-{formatCurrency(promoDiscountAmount)}</span>
            </div>
          )}
          
          {creditsValueInPaise > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Credits Applied</span>
              <span>-{formatCurrency(creditsValueInPaise)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total Payable</span>
            <span>{formatCurrency(finalPayableAmount)}</span>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="w-full">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isProcessing} 
            className="w-full"
          >
            {isProcessing ? 'Processing...' : finalPayableAmount === 0 ? 'Claim for Free' : `Pay ${formatCurrency(finalPayableAmount)}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
