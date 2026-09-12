import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../services/api.client';
import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';

export function CreateTicket() {
  const [type, setType] = useState<'BUG' | 'SUPPORT'>('BUG');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [file, setFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (data: any) => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('category', data.category);
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      
      if (type === 'BUG') {
        formData.append('severity', data.severity);
        formData.append('pageUrl', window.location.href);
        formData.append('browserInfo', navigator.userAgent);
      }

      if (file) {
        formData.append('attachment', file);
      }

      const res = await apiClient.post('/support', formData);

      if (res.data.success) {
        setSuccessMsg('Successfully submitted!');
        reset();
        setFile(null);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Create Support Request</h1>
        
        <div className="flex gap-4 mb-6">
          <button 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${type === 'BUG' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setType('BUG')}
          >
            Report a Bug
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${type === 'SUPPORT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setType('SUPPORT')}
          >
            Help & Support
          </button>
        </div>

        {successMsg && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">{successMsg}</div>}
        {errorMsg && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{errorMsg}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input 
              {...register('subject', { required: true })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                {...register('category')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {type === 'BUG' ? (
                  <>
                    <option value="Interview">Interview</option>
                    <option value="Resume">Resume</option>
                    <option value="Payment">Payment</option>
                    <option value="Bundle">Bundle</option>
                    <option value="Dashboard">Dashboard</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Account">Account</option>
                    <option value="Interview">Interview</option>
                    <option value="Resume">Resume</option>
                    <option value="Payment">Payment</option>
                    <option value="Bundles">Bundles</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
            </div>

            {type === 'BUG' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select 
                  {...register('severity')} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              {...register('description', { required: true })} 
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Please provide details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional screenshot/file)</label>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            Submit Request
          </Button>

        </form>
      </div>
    </Container>
  );
}
