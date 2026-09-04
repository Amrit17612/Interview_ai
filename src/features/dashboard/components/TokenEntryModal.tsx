import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface TokenEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (token: string) => Promise<void>;
  title?: string;
}

export function TokenEntryModal({ isOpen, onClose, onSubmit, title = "Enter Access Token" }: TokenEntryModalProps) {
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onSubmit(token.trim().toUpperCase());
      setToken('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to start interview.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setToken('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-4">
            This interview is restricted to a specific batch. Please enter the access token provided by your instructor.
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
          <Input 
            required 
            value={token} 
            onChange={(e) => {
              setToken(e.target.value.toUpperCase());
              setError(null);
            }} 
            placeholder="e.g. A9F2B1CD"
            disabled={isSubmitting}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !token.trim()}>
            {isSubmitting ? 'Verifying...' : 'Start Interview'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
