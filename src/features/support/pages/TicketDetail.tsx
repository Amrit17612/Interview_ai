import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../../services/api.client';
import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { format } from 'date-fns';
import { ArrowLeft, Send } from 'lucide-react';

export function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyMsg, setReplyMsg] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await apiClient.get(`/support/${id}`);
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
      const res = await apiClient.post(`/support/${id}/reply`, { message: replyMsg });
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

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>;
  }

  if (!ticket) {
    return (
      <Container>
        <div className="py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket not found</h2>
          <Link to="/support" className="text-brand-600 hover:underline">Return to My Requests</Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-8">
        <Link to="/support" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Requests
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
                  {ticket.ticketId}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Created on {format(new Date(ticket.createdAt), 'MMM dd, yyyy h:mm a')} • {ticket.category}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
              ticket.status === 'CLOSED' ? 'bg-gray-200 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {ticket.status}
            </span>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap text-sm mb-6">{ticket.description}</p>
            
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Attachments</h3>
                <div className="flex gap-2">
                  {ticket.attachments.map((att: string, i: number) => (
                    <a key={i} href={(import.meta.env.VITE_API_URL || 'http://localhost:5000') + att} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">
                      Attachment {i + 1}
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
                <div key={i} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    msg.isAdmin ? 'bg-gray-100 text-gray-900 rounded-tl-none' : 'bg-brand-600 text-white rounded-tr-none'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap mb-1">{msg.message}</p>
                    <p className={`text-[10px] ${msg.isAdmin ? 'text-gray-500' : 'text-brand-200'}`}>
                      {msg.isAdmin ? 'Support Team' : 'You'} • {format(new Date(msg.createdAt), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
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
          )}
        </div>
      </div>
    </Container>
  );
}
