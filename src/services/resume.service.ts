import { apiClient } from './api.client';

export interface Resume {
  id: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  parsingStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  parsedText?: string | null;
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
};
