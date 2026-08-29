import { useState, useRef } from 'react';
import { apiClient } from '../../../services/api.client';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportReviewModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportReviewModal({ onClose, onSuccess }: ImportReviewModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setPreview(null);
      setError(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    
    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10MB limit.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await apiClient.post('/api/admin/questions/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        setPreview(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to preview file');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview || preview.validCount === 0) return;
    try {
      setLoading(true);
      
      // Extract only the valid rows to send back
      const validRows = preview.rows.filter((r: any) => r.isValid);
      
      const res = await apiClient.post('/api/admin/questions/import/confirm', {
        questions: validRows
      });
      
      if (res.data.success) {
        alert(res.data.message);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm import');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Import Questions</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!preview ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-1">Supported Formats:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>CSV / XLSX:</strong> Should contain columns for text, type, difficulty (Optional: description, tags, expectedPoints). Max 500 rows.</li>
                  <li><strong>PDF:</strong> AI will attempt to extract structured technical questions from the text. Max 15 pages.</li>
                </ul>
              </div>

              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 font-medium mb-1">Click to select a file</p>
                <p className="text-sm text-gray-500">or drag and drop here (Max 10MB)</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
                  onChange={handleFileChange}
                />
              </div>

              {file && (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-brand-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                </div>
              )}

              {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
              
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handlePreview} 
                  disabled={!file || loading}
                  className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Preview Import'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-1">Total Rows</p>
                  <p className="text-2xl font-bold text-gray-900">{preview.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                  <p className="text-sm text-green-600 mb-1">Valid (Will Import)</p>
                  <p className="text-2xl font-bold text-green-700">{preview.validCount}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                  <p className="text-sm text-red-600 mb-1">Errors / Duplicates</p>
                  <p className="text-2xl font-bold text-red-700">{preview.errorCount}</p>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question Text</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type/Diff</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.rows.map((row: any, i: number) => (
                        <tr key={i} className={row.isValid ? 'bg-white' : 'bg-red-50/30'}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {row.isValid ? (
                              <span className="flex items-center text-green-600 text-xs font-bold uppercase"><CheckCircle className="w-3 h-3 mr-1" /> Valid</span>
                            ) : (
                              <div className="flex flex-col">
                                <span className="flex items-center text-red-600 text-xs font-bold uppercase"><AlertCircle className="w-3 h-3 mr-1" /> Error</span>
                                <span className="text-[10px] text-red-500 mt-1 truncate max-w-[120px]" title={row.errors.join(', ')}>{row.errors.join(', ')}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate" title={row.text}>
                            {row.text || <span className="text-gray-400 italic">Missing Text</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {row.type} • {row.difficulty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setPreview(null)} 
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100"
                >
                  Back
                </button>
                <button 
                  onClick={handleConfirm} 
                  disabled={loading || preview.validCount === 0}
                  className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
                >
                  {loading ? 'Importing...' : `Import ${preview.validCount} Drafts`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
