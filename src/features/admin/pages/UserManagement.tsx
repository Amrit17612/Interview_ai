import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../services/api.client';
import { Search, Loader2, UserPlus, Eye, ArrowLeft } from 'lucide-react';
import { ManualGrantModal } from '../components/ManualGrantModal';

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [searchEmail, setSearchEmail] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Details view
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Modals
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [grantTargetUser, setGrantTargetUser] = useState<any | null>(null);

  const fetchUsers = async (p = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: p.toString(), limit: '10' });
      if (searchEmail) params.append('email', searchEmail);
      if (roleFilter) params.append('role', roleFilter);

      const res = await apiClient.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setPage(res.data.pagination.page);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchEmail, roleFilter]);

  const viewDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/users/${id}`);
      if (res.data.success) {
        setSelectedUser(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const openGrantModal = (user: any) => {
    setGrantTargetUser(user);
    setIsGrantModalOpen(true);
  };

  const handleGrantSuccess = () => {
    setIsGrantModalOpen(false);
    setGrantTargetUser(null);
    if (selectedUser) {
      viewDetails(selectedUser._id);
    } else {
      fetchUsers(page);
    }
  };

  if (selectedUser) {
    return (
      <div className="space-y-6 pb-12">
        <button 
          onClick={() => setSelectedUser(null)}
          className="flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to list
        </button>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</h2>
              <p className="text-gray-500">{selectedUser.email}</p>
            </div>
            <div className="flex gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedUser.role}
              </span>
              <button
                onClick={() => openGrantModal(selectedUser)}
                className="bg-brand-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-brand-700 flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-1" /> Grant Bundle
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500">Joined Date</p>
              <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="font-bold text-lg text-brand-700">₹{selectedUser.totalSpent}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500">Bundles Owned</p>
              <p className="font-medium">{selectedUser.purchasedBundles?.length || 0}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">Purchased Bundles</h3>
            {selectedUser.purchasedBundles?.length > 0 ? (
              <div className="space-y-3">
                {selectedUser.purchasedBundles.map((b: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div>
                      <p className="font-bold text-gray-900">{b.bundleId}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(b.purchasedAt).toLocaleDateString()} • {b.bundleType} • 
                        <span className={`ml-1 font-medium ${b.source === 'ADMIN_GRANT' ? 'text-purple-600' : 'text-green-600'}`}>
                          Source: {b.source || 'PAYMENT'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        {b.purchaseStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No bundles purchased yet.</p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3">Transaction History</h3>
            {selectedUser.purchaseHistory?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedUser.purchaseHistory.map((tx: any) => (
                      <tr key={tx._id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {tx.bundleId}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          ₹{tx.amount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {tx.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No transactions found.</p>
            )}
          </div>

          <div className="mt-8 mb-4">
            <h3 className="text-lg font-bold mb-3">Interview Sessions</h3>
            {selectedUser.interviewSessions?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Domain</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedUser.interviewSessions.map((session: any) => (
                      <tr key={session._id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(session.createdAt).toLocaleDateString()} {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {session.configuration?.type} / {session.configuration?.domain}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : session.status === 'ABANDONED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {session.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          <Link to={`/admin/security/session/${session._id}`} className="text-brand-600 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-md transition-colors inline-block">
                            View Violations
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No interview sessions found.</p>
            )}
          </div>
        </div>

        {isGrantModalOpen && grantTargetUser && (
          <ManualGrantModal 
            user={grantTargetUser} 
            onClose={() => { setIsGrantModalOpen(false); setGrantTargetUser(null); }}
            onSuccess={handleGrantSuccess}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
          >
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundles</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{u.firstName} {u.lastName}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.purchasedBundles?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => openGrantModal(u)}
                        className="text-brand-600 hover:text-brand-900"
                        title="Manual Grant"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => viewDetails(u._id)}
                        className="text-gray-500 hover:text-gray-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchUsers(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(page + 1)}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => fetchUsers(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchUsers(page + 1)}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isGrantModalOpen && grantTargetUser && !selectedUser && (
        <ManualGrantModal 
          user={grantTargetUser} 
          onClose={() => { setIsGrantModalOpen(false); setGrantTargetUser(null); }}
          onSuccess={handleGrantSuccess}
        />
      )}
    </div>
  );
}
