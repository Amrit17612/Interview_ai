import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { Plus, Users, FolderOpen, Calendar, Clock } from 'lucide-react';
import { apiClient } from '../../../services/api.client';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

interface Batch {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

export function BatchManagement() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [loginStartDate, setLoginStartDate] = useState('');
  const [loginStartTime, setLoginStartTime] = useState('');
  const [loginEndDate, setLoginEndDate] = useState('');
  const [loginEndTime, setLoginEndTime] = useState('');
  const [testDurationMinutes, setTestDurationMinutes] = useState('');
  const [forceStopAtEnd, setForceStopAtEnd] = useState(false);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<any>('/admin/batches');
      setBatches(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Ensure time strictly stays in HH:mm HTML format, even if browser fallback or paste emits AM/PM
  const handleTimeChange = (val: string, setter: (v: string) => void) => {
    if (!val) {
      setter('');
      return;
    }
    const match = val.match(/(\d{1,2}):(\d{2})(?:\s?(AM|PM))?/i);
    if (match) {
      let [_, h, m, ampm] = match;
      if (ampm) {
        let hours = parseInt(h, 10);
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        setter(`${hours.toString().padStart(2, '0')}:${m}`);
        return;
      }
    }
    setter(val);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      const payload: any = { name, description };
      if (scheduleEnabled) {
        if (!loginStartDate || !loginStartTime || !loginEndDate || !loginEndTime) {
          throw new Error('Please select both date and time for Login Window Start and End.');
        }
        
        const loginStartCombined = new Date(`${loginStartDate}T${loginStartTime}`);
        const loginEndCombined = new Date(`${loginEndDate}T${loginEndTime}`);

        payload.schedule = {
          enabled: true,
          loginStartAt: loginStartCombined.toISOString(),
          loginEndAt: loginEndCombined.toISOString(),
          testDurationMinutes: testDurationMinutes ? parseInt(testDurationMinutes) : null,
          forceStopAtEnd
        };
      } else {
        payload.schedule = { enabled: false };
      }

      await apiClient.post('/admin/batches', payload);
      
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setScheduleEnabled(false);
      setLoginStartDate('');
      setLoginStartTime('');
      setLoginEndDate('');
      setLoginEndTime('');
      setTestDurationMinutes('');
      setForceStopAtEnd(false);
      
      fetchBatches();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || error.message || 'Failed to create batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <PageHeader 
          title="Batches & Sections" 
          description="Manage student batches and assign interviews."
        />
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Create Batch
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>No batches found.</p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="mt-4">
              Create your first batch
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches.map((batch) => (
                  <tr key={batch._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{batch.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">{batch.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/admin/batches/${batch._id}`)}
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Open
                      </Button>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Batch</h2>
        <form onSubmit={handleCreateBatch} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label>
            <Input 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. CS Section A 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Internal notes about this batch..."
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="enableSchedule"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
              />
              <label htmlFor="enableSchedule" className="ml-2 block text-sm font-medium text-gray-700">
                Enable Interview Schedule
              </label>
            </div>

            {scheduleEnabled && (
              <div className="space-y-4 pl-6 border-l-2 border-brand-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Login Window Start *</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <Calendar className="w-3.5 h-3.5" /> Date
                        </label>
                        <Input 
                          type={loginStartDate ? "date" : "text"}
                          placeholder="DD/MM/YYYY"
                          onFocus={(e) => (e.currentTarget.type = "date")}
                          onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = "text"; }}
                          required={scheduleEnabled}
                          value={loginStartDate}
                          onChange={(e) => setLoginStartDate(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <Clock className="w-3.5 h-3.5" /> Time
                        </label>
                        <Input 
                          type="time" 
                          required={scheduleEnabled}
                          value={loginStartTime}
                          onChange={(e) => handleTimeChange(e.target.value, setLoginStartTime)}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Login Window End *</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <Calendar className="w-3.5 h-3.5" /> Date
                        </label>
                        <Input 
                          type={loginEndDate ? "date" : "text"}
                          placeholder="DD/MM/YYYY"
                          onFocus={(e) => (e.currentTarget.type = "date")}
                          onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = "text"; }}
                          required={scheduleEnabled}
                          value={loginEndDate}
                          onChange={(e) => setLoginEndDate(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <Clock className="w-3.5 h-3.5" /> Time
                        </label>
                        <Input 
                          type="time" 
                          required={scheduleEnabled}
                          value={loginEndTime}
                          onChange={(e) => handleTimeChange(e.target.value, setLoginEndTime)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Test Duration (Minutes, Optional)</label>
                  <Input 
                    type="number" 
                    min="1"
                    value={testDurationMinutes}
                    onChange={(e) => setTestDurationMinutes(e.target.value)}
                    placeholder="e.g. 60"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for untimed tests.</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="forceStopAtEnd"
                    checked={forceStopAtEnd}
                    onChange={(e) => setForceStopAtEnd(e.target.checked)}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                  />
                  <label htmlFor="forceStopAtEnd" className="ml-2 block text-xs text-gray-700">
                    Force submit test at Login Window End (even if duration is not finished)
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </Modal>
    </Container>
  );
}
