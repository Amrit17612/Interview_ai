import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../services/api.client';
import { format } from 'date-fns';

export function SupportCenter() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', type: '' });

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.type) params.append('type', filter.type);

      const res = await apiClient.get(`/api/admin/support?${params.toString()}`);
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
        <div className="flex gap-4">
          <select 
            value={filter.type} 
            onChange={e => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Types</option>
            <option value="BUG">Bug Reports</option>
            <option value="SUPPORT">Support Requests</option>
          </select>
          <select 
            value={filter.status} 
            onChange={e => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">Ticket</th>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No tickets found.
                  </td>
                </tr>
              )}
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/admin/support/${ticket._id}`} className="text-brand-600 hover:underline font-medium">
                      {ticket.ticketId}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">{ticket.type} - {ticket.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{ticket.userId?.firstName} {ticket.userId?.lastName}</div>
                    <div className="text-xs text-gray-500">{ticket.userId?.email}</div>
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={ticket.subject}>
                    {ticket.subject}
                    {ticket.severity !== 'LOW' && ticket.type === 'BUG' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        {ticket.severity}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
