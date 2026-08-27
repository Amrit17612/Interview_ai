import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Modal } from '../../../components/ui/Modal';
import { atsService, type JobDescription } from '../../../services/ats.service';
import { Briefcase, Plus, Trash2, AlertCircle, X } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';

export function ATSDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');

  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await atsService.getJobDescriptions();
      setJobs(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load job descriptions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // UX Validation
    if (!title.trim() || !company.trim() || !content.trim()) {
      setCreateError('All fields are required.');
      return;
    }
    if (title.trim().length > 200) {
      setCreateError('Title is too long (max 200 characters).');
      return;
    }
    if (company.trim().length > 200) {
      setCreateError('Company name is too long (max 200 characters).');
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    try {
      await atsService.createJobDescription({ title, company, content });
      // Reset form
      setTitle('');
      setCompany('');
      setContent('');
      setIsModalOpen(false);
      // Refresh list
      await loadJobs();
    } catch (err: any) {
      setCreateError(err.message || 'Unable to save this job description.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job description?')) return;
    
    setDeletingId(id);
    setError(null);
    try {
      await atsService.deleteJobDescription(id);
      await loadJobs();
    } catch (err: any) {
      setError(err.message || 'Unable to delete this job description.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container className="py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <PageHeader 
          title="ATS Dashboard" 
          description="Manage your target job descriptions for future ATS matching and AI analysis." 
        />
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Job Description
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2 border border-red-200">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadJobs} className="ml-auto bg-white">
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : jobs.length === 0 && !error ? (
        <EmptyState 
          icon={<Briefcase className="h-12 w-12 text-brand-600" />}
          title="No Job Descriptions" 
          description="Add a target job description to begin tracking your applications."
          actionLabel="Add Job Description"
          // We can't use actionPath natively here for a modal, so we just use the top button,
          // but we can wrap a button if we didn't use EmptyState natively. We'll just leave it.
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <Card key={job.id} className="flex flex-col h-full">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold line-clamp-1" title={job.title}>
                        {job.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500 font-medium line-clamp-1" title={job.company}>
                        {job.company}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col flex-grow">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">
                  {job.content}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4">
                  <span className="text-xs text-gray-400">
                    Added {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(ROUTES.ATS_DETAILS.replace(':id', job.id))}
                    >
                      View Readiness
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      onClick={() => handleDelete(job.id)}
                      disabled={deletingId === job.id}
                    >
                      {deletingId === job.id ? <Spinner className="h-4 w-4 text-current" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Job Description Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isCreating && setIsModalOpen(false)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Job Description</h2>
          <button 
            onClick={() => setIsModalOpen(false)} 
            disabled={isCreating}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {createError && (
          <div className="mb-4 p-3 bg-red-50 text-sm text-red-700 rounded-md flex items-center gap-2 border border-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{createError}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Senior Frontend Engineer"
              disabled={isCreating}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <Input 
              value={company} 
              onChange={e => setCompany(e.target.value)} 
              placeholder="e.g. Apple"
              disabled={isCreating}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
            <Textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="Paste the full job description here..."
              className="h-48 resize-none"
              disabled={isCreating}
              required
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? <Spinner className="mr-2 h-4 w-4 text-current" /> : null}
              {isCreating ? 'Saving...' : 'Save Job Description'}
            </Button>
          </div>
        </form>
      </Modal>
    </Container>
  );
}