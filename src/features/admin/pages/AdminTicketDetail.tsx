import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../../services/api.client';
import { Button } from '../../../components/ui/Button';
import { format } from 'date-fns';
import { ArrowLeft, Send } from 'lucide-react';

export function AdminTicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyMsg, setReplyMsg] = useState('');
  const [replying, setReplying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await apiClient.get(`/api/admin/support/${id}`);
      if (res.data.success) {
        setTicket(res.data.ticket);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMsg.trim()) return;

    setReplying(true);
    try {
      const res = await apiClient.post(`/api/admin/support/${id}/reply`, { message: replyMsg });
      if (res.data.success) {
        setTicket(res.data.ticket);
        setReplyMsg('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await apiClient.put(`/api/admin/support/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setTicket(res.data.ticket);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>;
  }

  if (!ticket) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket not found</h2>
        <Link to="/admin/support" className="text-brand-600 hover:underline">Return to Support Center</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link to="/admin/support" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Support Center
        </Link>
        <div className="flex gap-2">
          <select 
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className={`text-sm font-medium rounded-md px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              ticket.status === 'RESOLVED' ? 'bg-green-50 text-green-700' : ''
            }`}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                    {ticket.ticketId}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {ticket.type} • {ticket.category}
                </p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap text-sm mb-6">{ticket.description}</p>
              
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Attachments</h3>
                  <div className="flex flex-wrap gap-2">
                    {ticket.attachments.map((att: string, i: number) => (
                      <a key={i} href={(import.meta.env.VITE_API_URL || 'http://localhost:5000') + att} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-brand-600 hover:bg-gray-100 transition-colors">
                        View Attachment {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-bold text-gray-900">Conversation</h2>
            </div>
            <div className="p-6 space-y-6">
              {ticket.messages.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">No replies yet.</p>
              ) : (
                ticket.messages.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.isAdmin ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-900 rounded-tl-none'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap mb-1">{msg.message}</p>
                      <p className={`text-[10px] ${msg.isAdmin ? 'text-brand-200' : 'text-gray-500'}`}>
                        {msg.isAdmin ? 'You (Admin)' : ticket.userId.firstName} • {format(new Date(msg.createdAt), 'MMM dd, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <form onSubmit={handleReply} className="flex gap-3">
                <input 
                  type="text" 
                  value={replyMsg}
                  onChange={(e) => setReplyMsg(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button type="submit" disabled={replying || !replyMsg.trim()} className="rounded-full px-6">
                  <Send className="w-4 h-4 mr-2" /> Send
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Student Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-gray-500">Name</span>
                <span className="font-medium text-gray-900">{ticket.userId?.firstName} {ticket.userId?.lastName}</span>
              </div>
              <div>
                <span className="block text-gray-500">Email</span>
                <span className="text-gray-900">{ticket.userId?.email}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Meta Data</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-gray-500">Created</span>
                <span className="text-gray-900">{format(new Date(ticket.createdAt), 'MMM dd, yyyy h:mm a')}</span>
              </div>
              {ticket.type === 'BUG' && ticket.severity && (
                <div>
                  <span className="block text-gray-500">Severity</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    ticket.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                    ticket.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.severity}
                  </span>
                </div>
              )}
              {ticket.pageUrl && (
                <div>
                  <span className="block text-gray-500">Page URL</span>
                  <a href={ticket.pageUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline break-all">
                    {ticket.pageUrl}
                  </a>
                </div>
              )}
              {ticket.browserInfo && (
                <div>
                  <span className="block text-gray-500">Browser</span>
                  <span className="text-gray-900 break-all">{ticket.browserInfo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
