import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { Plus, ArrowLeft, Copy, Check, Ban } from 'lucide-react';
import { apiClient } from '../../../services/api.client';
import { Modal } from '../../../components/ui/Modal';
import jsPDF from 'jspdf';

interface AccessToken {
  _id: string;
  code: string;
  templateId: {
    _id: string;
    title: string;
    difficulty: string;
    status: string;
  };
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface Batch {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  tokens?: AccessToken[];
}

export function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const fetchBatchDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<any>(`/admin/batches/${id}`);
      setBatch(response.data.data);
    } catch (error) {
      console.error('Failed to fetch batch details:', error);
      navigate('/admin/batches');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get<any>('/admin/interview-templates');
      // Only allow assigning ACTIVE templates
      setTemplates((response.data.templates || []).filter((t: any) => t.status === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBatchDetails();
    }
  }, [id]);

  const handleOpenAssignModal = () => {
    fetchTemplates();
    setIsModalOpen(true);
  };

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    
    try {
      setIsSubmitting(true);
      await apiClient.post(`/admin/batches/${id}/tokens`, { templateId: selectedTemplate });
      setIsModalOpen(false);
      setSelectedTemplate('');
      fetchBatchDetails(); // Refresh to see the new token
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to generate token');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTokenStatus = async (tokenId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'revoke' : 'reactivate'} this token?`)) return;
    try {
      await apiClient.patch(`/admin/tokens/${tokenId}/status`, { isActive: !currentStatus });
      fetchBatchDetails();
    } catch (error) {
      console.error('Failed to update token status:', error);
      alert('Failed to update token status');
    }
  };

  const fetchResults = async (templateId: string) => {
    try {
      setLoadingResults(true);
      setLeaderboardModalOpen(true);
      setLeaderboardData(null);
      const res = await apiClient.get(`/admin/batches/${id}/results/${templateId}`);
      setLeaderboardData(res.data.data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to fetch results');
      setLeaderboardModalOpen(false);
    } finally {
      setLoadingResults(false);
    }
  };

  const exportPDF = () => {
    if (!leaderboardData) return;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Interviu AI - Batch Interview Ranking", 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Batch Name: ${leaderboardData.batch}`, 14, 30);
    doc.text(`Interview/Test: ${leaderboardData.template}`, 14, 37);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 44);
    
    // Table Header
    let y = 55;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Rank', 14, y);
    doc.text('Student', 28, y);
    doc.text('Email', 75, y);
    doc.text('Score', 135, y);
    doc.text('Completed At', 155, y);
    doc.text('Violations', 185, y, { align: 'center' });
    
    doc.setLineWidth(0.2);
    doc.line(14, y + 2, 196, y + 2);
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    
    if (!leaderboardData.results || leaderboardData.results.length === 0) {
      doc.text("No students have completed this interview yet.", 14, y);
    } else {
      leaderboardData.results.forEach((row: any) => {
        doc.text(row.rank.toString(), 14, y);
        doc.text(row.studentName.substring(0, 22), 28, y);
        doc.text(row.email.substring(0, 28), 75, y);
        doc.text(`${row.score}`, 135, y);
        
        const dateStr = new Date(row.completedAt).toLocaleDateString();
        const timeStr = new Date(row.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        doc.text(`${dateStr} ${timeStr}`, 155, y);
        
        doc.text(row.securityViolations.toString(), 185, y, { align: 'center' });
        y += 8;
        
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    }
    
    const safeBatch = leaderboardData.batch.replace(/[^a-z0-9]/gi, '_');
    const safeTemplate = leaderboardData.template.replace(/[^a-z0-9]/gi, '_');
    doc.save(`${safeBatch}-${safeTemplate}-Ranking.pdf`);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <Container className="py-8 max-w-7xl">
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      </Container>
    );
  }

  if (!batch) return null;

  return (
    <Container className="py-8 max-w-7xl">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/admin/batches')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Batches
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{batch.name}</h1>
          <p className="text-gray-500 mt-1">{batch.description || 'No description provided'}</p>
        </div>
        <Button onClick={handleOpenAssignModal} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Assign Interview
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Assigned Interviews & Tokens</h2>
        </div>
        
        {(!batch.tokens || batch.tokens.length === 0) ? (
          <div className="p-12 text-center text-gray-500">
            <p>No interviews assigned yet.</p>
            <Button onClick={handleOpenAssignModal} variant="outline" className="mt-4">
              Assign an Interview
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Token</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batch.tokens.map((token) => (
                  <tr key={token._id} className={!token.isActive ? "bg-gray-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{token.templateId?.title || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{token.templateId?.difficulty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <code className={`px-2 py-1 rounded text-sm font-bold tracking-wider ${token.isActive ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                          {token.code}
                        </code>
                        {token.isActive && (
                          <button 
                            onClick={() => copyToClipboard(token.code)}
                            className="ml-2 text-gray-400 hover:text-gray-700 transition-colors"
                            title="Copy Code"
                          >
                            {copiedCode === token.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${token.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {token.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(token.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-4 items-center">
                        <button
                          onClick={() => fetchResults(token.templateId._id)}
                          className="text-brand-600 hover:text-brand-900 font-semibold"
                        >
                          View Results
                        </button>
                        {token.isActive ? (
                          <button 
                            onClick={() => handleToggleTokenStatus(token._id, token.isActive)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Revoke
                          </button>
                        ) : (
                          <span className="w-16"></span> // Placeholder for alignment
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Assign Interview & Generate Token</h2>
        <form onSubmit={handleGenerateToken} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Interview Template *</label>
            <select
              required
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
            >
              <option value="">-- Choose an active interview --</option>
              {templates.map(t => (
                <option key={t._id} value={t._id}>{t.title} ({t.difficulty})</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Assigning an interview will generate a unique access token for this batch. Students will need this token to start the interview.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedTemplate}>
              {isSubmitting ? 'Generating...' : 'Generate Token'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Leaderboard Modal */}
      <Modal
        isOpen={leaderboardModalOpen}
        onClose={() => setLeaderboardModalOpen(false)}
        className="max-w-5xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Interview Leaderboard</h2>
          {leaderboardData && leaderboardData.results?.length > 0 && (
            <Button onClick={exportPDF} size="sm" className="flex items-center">
              Export Ranking PDF
            </Button>
          )}
        </div>

        {loadingResults ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : !leaderboardData ? (
          <div className="p-8 text-center text-red-500">Failed to load results.</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Batch Name</p>
                <p className="font-semibold text-gray-900">{leaderboardData.batch}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Interview / Test</p>
                <p className="font-semibold text-gray-900">{leaderboardData.template}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {leaderboardData.results.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No students have completed this interview yet.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Security Violations</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaderboardData.results.map((row: any) => (
                        <tr key={row.sessionId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                            #{row.rank}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.studentName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {row.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-brand-600">
                            {row.score}%
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(row.completedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                            <button 
                              onClick={() => navigate(`/admin/security/session/${row.sessionId}`)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                row.securityViolations > 0 
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                              title="View Security Audit"
                            >
                              {row.securityViolations}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Container>
  );
}
