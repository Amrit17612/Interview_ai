import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { apiClient } from '../../../services/api.client';
import { Users, IndianRupee, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ totalUsers: number, totalRevenue: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/api/admin/dashboard');
        if (response.data.success) {
          setStats(response.data.stats);
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
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
              <h2 className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</h2>
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
              <h2 className="text-3xl font-bold text-gray-900">₹{stats?.totalRevenue?.toLocaleString() || 0}</h2>
            </div>
          </motion.div>
        </div>
      )}

      {/* Placeholder for future modules */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 1 Active</h3>
        <p className="text-gray-500 max-w-2xl mx-auto">
          The Admin Control Center foundation is live. Role-based security and layout architecture have been established. Commerce analytics, question management, and custom interviews will be activated in upcoming phases.
        </p>
      </div>
    </div>
  );
}
