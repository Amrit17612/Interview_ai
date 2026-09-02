import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../services/api.client';
import { ShieldAlert, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

export function AdminSecurityAudit() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await apiClient.get(`/security/admin/session/${id}`);
        if (res.data?.success && res.data.data) {
          setAudit(res.data.data);
        } else {
          setError('No security audit found for this session.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load security audit.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAudit();
  }, [id]);

  if (loading) return (
    <Container className="py-8 text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" />
    </Container>
  );

  if (error || !audit) return (
    <Container className="py-8">
      <div className="text-center p-8 bg-white rounded-xl border border-red-100 shadow-sm text-red-500">
        <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
        <p className="font-medium text-lg">{error || 'Security audit not available.'}</p>
        <Link to="/admin/dashboard" className="text-brand-600 hover:underline mt-4 block">Return to Dashboard</Link>
      </div>
    </Container>
  );

  return (
    <Container className="py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
      
      <PageHeader 
        title="Security Audit & Proctoring Log" 
        description={`Session ID: ${audit.session?._id || id}`} 
      />

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Candidate Details</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-500">Name:</span> {audit.user?.name || 'Unknown'}</p>
              <p><span className="text-slate-500">Email:</span> {audit.user?.email || 'Unknown'}</p>
              <p><span className="text-slate-500">Interview Status:</span> {audit.session?.status || 'Unknown'}</p>
              <p><span className="text-slate-500">Date:</span> {new Date(audit.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-800">{audit.violationCount || 0}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Violations</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                <div className="text-2xl font-bold text-amber-700">{audit.warningCount || 0}</div>
                <div className="text-xs text-amber-600 uppercase tracking-wide">Warnings</div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Tab Switches</span><span className="font-semibold">{audit.tabSwitchCount || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Focus Loss</span><span className="font-semibold">{audit.focusLossCount || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Copy Attempts</span><span className="font-semibold">{audit.copyAttemptCount || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Cut/Paste Attempts</span><span className="font-semibold">{(audit.cutAttemptCount || 0) + (audit.pasteAttemptCount || 0)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Right Clicks</span><span className="font-semibold">{audit.rightClickCount || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">No Face</span><span className="font-semibold">{audit.noFaceCount || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Multiple Faces</span><span className="font-semibold">{audit.multipleFaceCount || 0}</span></div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-500" /> Event Timeline
            </h3>
            
            {audit.events && audit.events.length > 0 ? (
              <div className="space-y-6">
                {audit.events.map((event: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        event.severity === 'HIGH' ? 'bg-red-500' :
                        event.severity === 'MEDIUM' ? 'bg-amber-500' :
                        event.severity === 'LOW' ? 'bg-blue-500' : 'bg-slate-300'
                      }`} />
                      {index < audit.events.length - 1 && <div className="w-px h-full bg-slate-200 my-1" />}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-800">{event.type}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          event.severity === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' :
                          event.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>{event.severity}</span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {new Date(event.timestamp).toLocaleTimeString()} - {new Date(event.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                <p className="text-slate-600 font-medium">No security violations recorded.</p>
                <p className="text-slate-400 text-sm mt-1">The candidate completed the interview without triggering any alerts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
