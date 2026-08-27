import { useState, useEffect, useRef } from 'react';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { resumeService, type Resume } from '../../../services/resume.service';
import { FileText, Upload, Trash2, AlertCircle, X, CheckCircle, XCircle } from 'lucide-react';

export function ResumeDashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [viewTextModalOpen, setViewTextModalOpen] = useState(false);
  const [selectedResumeText, setSelectedResumeText] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [selectedResumeFileName, setSelectedResumeFileName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadResumes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resumeService.getResumes();
      setResumes(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load your resumes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // UX Validation
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isValidExtension = extension === 'pdf' || extension === 'docx';

    if (!validTypes.includes(file.type) && !isValidExtension) {
      setUploadError('Invalid file type. Please upload a PDF or DOCX file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File is too large. Maximum size is 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      await resumeService.uploadResume(file);
      await loadResumes();
    } catch (err: any) {
      setUploadError(err.message || 'Resume upload failed. Please check the file type and size.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    
    setDeletingId(id);
    setUploadError(null);
    try {
      await resumeService.deleteResume(id);
      await loadResumes();
    } catch (err: any) {
      setUploadError(err.message || 'Unable to delete this resume.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewText = async (id: string, fileName: string) => {
    setSelectedResumeFileName(fileName);
    setSelectedResumeText(null);
    setViewTextModalOpen(true);
    setIsLoadingText(true);
    try {
      const data = await resumeService.getResumeById(id);
      setSelectedResumeText(data.parsedText || '');
    } catch {
      setSelectedResumeText(null);
    } finally {
      setIsLoadingText(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderParsingStatus = (status?: string) => {
    if (status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
          <CheckCircle className="h-3 w-3" />
          Parsed Successfully
        </span>
      );
    }
    if (status === 'FAILED') {
      return (
        <div className="flex flex-col gap-1 mt-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-md border border-red-200 self-start">
            <XCircle className="h-3 w-3" />
            Parsing Failed
          </span>
          <span className="text-xs text-red-600">Unable to extract readable text from this file.</span>
        </div>
      );
    }
    if (status === 'PROCESSING' || status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
          <Spinner className="h-3 w-3 text-blue-600" />
          Parsing resume...
        </span>
      );
    }
    return null;
  };

  return (
    <Container className="py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <PageHeader 
          title="Resume Dashboard" 
          description="Manage your resumes for ATS analysis and AI mock interviews." 
        />
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            className="hidden" 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
          >
            {isUploading ? <Spinner className="mr-2 h-4 w-4 text-current" /> : <Upload className="mr-2 h-4 w-4" />}
            {isUploading ? 'Uploading & Parsing...' : 'Upload Resume'}
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2 border border-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2 border border-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadResumes} className="ml-auto bg-white">
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : resumes.length === 0 && !error ? (
        <EmptyState 
          icon={<FileText className="h-12 w-12 text-brand-600" />}
          title="No Resumes Uploaded" 
          description="Upload your first resume in PDF or DOCX format (max 5MB) to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(resume => (
            <Card key={resume.id} className="flex flex-col">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base font-semibold truncate" title={resume.originalFileName}>
                        {resume.originalFileName}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col mt-auto gap-4">
                <div className="flex flex-col gap-2 items-start">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    {formatFileSize(resume.fileSize)} • {resume.fileType.includes('pdf') || resume.originalFileName.toLowerCase().endsWith('pdf') ? 'PDF' : 'DOCX'}
                  </span>
                  {renderParsingStatus(resume.parsingStatus)}
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  {resume.parsingStatus === 'COMPLETED' ? (
                    <Button variant="outline" size="sm" onClick={() => handleViewText(resume.id, resume.originalFileName)}>
                      View Text
                    </Button>
                  ) : (
                    <div />
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    onClick={() => handleDelete(resume.id)}
                    disabled={deletingId === resume.id}
                  >
                    {deletingId === resume.id ? <Spinner className="h-4 w-4 text-current" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Extracted Text Modal */}
      <Modal isOpen={viewTextModalOpen} onClose={() => setViewTextModalOpen(false)} className="max-w-3xl w-full">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Extracted Text</h3>
            <p className="text-sm text-gray-500 line-clamp-1">{selectedResumeFileName}</p>
          </div>
          <button 
            onClick={() => setViewTextModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 min-h-[200px] max-h-[60vh] overflow-y-auto font-mono text-sm text-gray-700 whitespace-pre-wrap">
          {isLoadingText ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-gray-500">
              <Spinner className="h-6 w-6 text-primary mb-2" />
              <p>Loading extracted text...</p>
            </div>
          ) : (selectedResumeText && selectedResumeText.trim().length > 0) ? (
            selectedResumeText
          ) : selectedResumeText === null ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-red-500">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>Unable to load the extracted text. Please try again later.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-gray-500">
              <FileText className="h-8 w-8 mb-2 opacity-50" />
              <p>No readable text was extracted from this resume.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => setViewTextModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </Container>
  );
}