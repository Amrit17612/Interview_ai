import { apiClient } from './api.client';

export interface Resume {
  id: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  parsingStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  parsedText?: string | null;
  analysisStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  analysisStage?: 'IDLE' | 'PARSING_RESUME' | 'EVALUATING_RESUME' | 'PARSING_JD' | 'MATCHING_ATS' | 'FINALIZING' | 'COMPLETED' | 'FAILED' | null;
  lastAnalyzedAt?: string | null;
  analyzedJobId?: string | null;
  structuredData?: any;
  atsScore?: number | null;
  generalAtsScore?: number | null;
  jdMatchScore?: number | null;
  analysisMode?: 'GENERAL_ATS' | 'JD_ATS';
  qualityScore?: number | null;
  atsBreakdown?: any;
  contentAnalysis?: any;
  consistencyIssues?: any[];
  formattingIssues?: any[];
  jdAnalysis?: any;
  createdAt: string;
  updatedAt?: string;
}

export interface GetResumesResponse {
  success: boolean;
  count: number;
  resumes: Resume[];
}

export interface GetResumeResponse {
  success: boolean;
  resume: Resume;
}

export const resumeService = {
  getResumes: async (): Promise<Resume[]> => {
    const response = await apiClient.get<GetResumesResponse>('/resumes');
    return response.data.resumes;
  },

  getResumeById: async (id: string): Promise<Resume> => {
    const response = await apiClient.get<GetResumeResponse>(`/resumes/${id}`);
    return response.data.resume;
  },

  uploadResume: async (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append('resume', file); // Field name must match backend 'upload.single("resume")'

    // Let Axios set the proper Content-Type boundary
    const response = await apiClient.post<{ success: boolean; resume: Resume }>('/resumes', formData);
    return response.data.resume;
  },

  deleteResume: async (id: string): Promise<void> => {
    await apiClient.delete(`/resumes/${id}`);
  },

  analyzeResume: async (id: string, jobId?: string): Promise<{ success: boolean; message: string; analysisStatus: string }> => {
    const response = await apiClient.post(`/resumes/${id}/analyze`, { jobId });
    return response.data;
  },

  getResumeAnalysis: async (id: string): Promise<{ success: boolean; analysis: Partial<Resume> }> => {
    const response = await apiClient.get(`/resumes/${id}/analysis`);
    return response.data;
  }
};
