import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { apiClient } from '../../../services/api.client';
import { Users, IndianRupee, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/admin/analytics/payments');
        if (response.data.success) {
          setStats(response.data.analytics);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Overview</h1>
          <p className="mt-2 text-lg text-gray-600">
            Welcome back, <span className="font-semibold text-brand-600">{user?.firstName}</span>.
          </p>
        </div>
        <div className="bg-brand-50 border border-brand-200 text-brand-800 px-4 py-2 rounded-lg flex items-center shadow-sm">
          <ShieldCheck className="h-5 w-5 mr-2 text-brand-600" />
          <span className="font-medium text-sm">Role: Administrator</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse h-32" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center"
          >
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Purchases</p>
              <h2 className="text-3xl font-bold text-gray-900">{stats?.totalPurchases || 0}</h2>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center"
          >
            <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Unique Purchasers</p>
              <h2 className="text-3xl font-bold text-gray-900">{stats?.uniqueUsers || 0}</h2>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center"
          >
            <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
              <h2 className="text-3xl font-bold text-gray-900">₹{stats?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</h2>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Bundles</h3>
          {stats?.bundleAnalytics?.length > 0 ? (
            <div className="space-y-4">
              {stats.bundleAnalytics.slice(0, 5).map((b: any) => (
                <div key={b._id} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{b._id}</p>
                    <p className="text-xs text-gray-500">{b.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-700">₹{b.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{b.count} sales</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No sales data yet.</p>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
          {stats?.recentTransactions?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTransactions.map((tx: any) => (
                <div key={tx._id} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-[200px]">
                      {tx.user?.email}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{tx.amount}</p>
                    <p className="text-xs text-gray-500">{tx.bundleId}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No transactions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
