import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../services/api.client';
import { ShieldAlert, ArrowLeft, Loader2, Users, AlertTriangle } from 'lucide-react';

export function AdminBatchSecurity() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        const res = await apiClient.get(`/security/admin/batch/${id}`);
        if (res.data?.success && res.data.data) {
          setData(res.data.data);
        } else {
          setError('No security data found for this batch.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load batch security data.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBatchData();
  }, [id]);

  if (loading) return (
    <Container className="py-8 text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" />
    </Container>
  );

  if (error || !data) return (
    <Container className="py-8">
      <div className="text-center p-8 bg-white rounded-xl border border-red-100 shadow-sm text-red-500">
        <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
        <p className="font-medium text-lg">{error || 'Batch security data not available.'}</p>
        <Link to="/admin/dashboard" className="text-brand-600 hover:underline mt-4 block">Return to Dashboard</Link>
      </div>
    </Container>
  );

  return (
    <Container className="py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
      
      <PageHeader 
        title="Batch Security Analytics" 
        description={`Aggregated proctoring metrics for Batch ID: ${id}`} 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-slate-500">Total Candidates</div>
            <div className="text-2xl font-bold text-slate-800">{data.totalCandidates}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-slate-500">With Violations</div>
            <div className="text-2xl font-bold text-slate-800">{data.candidatesWithViolations}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-slate-500">Total Violations</div>
            <div className="text-2xl font-bold text-slate-800">{data.totalViolations}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
            <div className="font-bold text-lg">~</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Avg Violations</div>
            <div className="text-2xl font-bold text-slate-800">
              {data.totalCandidates ? (data.totalViolations / data.totalCandidates).toFixed(1) : 0}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-8 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Candidate Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">Candidate</th>
                <th className="p-4 font-medium">Session ID</th>
                <th className="p-4 font-medium text-center">Violations</th>
                <th className="p-4 font-medium text-center">Warnings</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {data.audits?.map((audit: any) => (
                <tr key={audit._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{audit.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">{audit.user?.email || 'N/A'}</div>
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-xs">{audit.session?._id || 'N/A'}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                      audit.violationCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {audit.violationCount || 0}
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-600">{audit.warningCount || 0}</td>
                  <td className="p-4 text-right">
                    <Link to={`/admin/security/session/${audit.session?._id}`}>
                      <Button variant="outline" size="sm">View Audit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {(!data.audits || data.audits.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No sessions found in this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
