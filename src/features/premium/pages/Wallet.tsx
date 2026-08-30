import { useEffect, useState } from 'react';
import { Container } from '../../../components/ui/Container';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Coins, Plus, Minus, Receipt, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { userService, type WalletTransaction } from '../../../services/user.service';
import { useNavigate } from 'react-router-dom';

export const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const credits = user?.credits || 0;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await userService.getWalletHistory();
        if (response.success) {
          setTransactions(response.data);
        } else {
          setError('Failed to fetch wallet history');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching wallet history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'EARN_SIGNUP': return 'Signup Bonus';
      case 'EARN_INTERVIEW': return 'Interview Completion Reward';
      case 'EARN_PURCHASE': return 'Purchase Reward';
      case 'SPEND_PURCHASE': return 'Credits Used for Purchase';
      case 'ADMIN_ADJUSTMENT': return 'Admin Credit Adjustment';
      default: return 'Transaction';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Container className="py-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet & Credits</h1>
          <p className="text-gray-500">Manage your credits and view transaction history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Wallet Balance Card */}
        <Card className="md:col-span-1 shadow-sm border-brand-100 bg-brand-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-brand-900 flex items-center">
              <Coins className="mr-2 h-4 w-4 text-brand-600" />
              Wallet Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-brand-900">{credits}</span>
              <span className="text-sm font-medium text-brand-700 mt-1">Credits</span>
            </div>
            <div className="mt-6 pt-4 border-t border-brand-200">
              <p className="text-xs text-brand-600 font-medium">1 Credit = ₹1.00</p>
              <p className="text-xs text-brand-500 mt-1">Credits can be applied during checkout for zero-cost or discounted access.</p>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Receipt className="h-5 w-5 mr-2 text-gray-500" />
            Credit Activity
          </h2>

          {loading ? (
            <div className="flex justify-center p-8 bg-white rounded-xl border border-gray-100">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3 text-gray-400">
                <Receipt className="h-6 w-6" />
              </div>
              <p className="text-gray-900 font-medium">No activity yet</p>
              <p className="text-gray-500 text-sm mt-1">Your credit transaction history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isEarn = tx.amount > 0;
                return (
                  <div key={tx._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                    <div className="flex gap-4 items-start">
                      <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${isEarn ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {isEarn ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getTransactionTypeLabel(tx.type)}
                        </p>
                        {tx.relatedBundle && (
                          <p className="text-sm text-gray-600 mt-0.5">{tx.relatedBundle}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 font-medium">
                          <span>{formatDate(tx.createdAt)}</span>
                          <span>•</span>
                          <span>Balance: {tx.balanceAfter} Credits</span>
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold whitespace-nowrap ${isEarn ? 'text-green-600' : 'text-gray-900'}`}>
                      {isEarn ? '+' : ''}{tx.amount} Credits
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};
