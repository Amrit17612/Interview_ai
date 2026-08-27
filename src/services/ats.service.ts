import { apiClient } from './api.client';

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateJobDescriptionPayload {
  title: string;
  company: string;
  content: string;
}

export interface GetJobDescriptionsResponse {
  success: boolean;
  count: number;
  jobs: JobDescription[];
}

export interface GetJobDescriptionResponse {
  success: boolean;
  job: JobDescription;
}

export interface ReadinessSkill {
  skill: string;
  actionableSkillKey: string | null;
}

export interface RecommendedAction {
  action: string;
  title: string;
  description: string;
  targetSkill: string | null;
}

export interface JobReadinessResponse {
  readinessScore: number;
  readinessStatus: 'EXCELLENT' | 'STRONG' | 'MODERATE' | 'NEEDS_PREPARATION' | 'INSUFFICIENT_DATA';
  scoreBreakdown: {
    resumeMatch: number;
    interviewAlignment: number;
    weaknessRisk: number;
    practiceProgress: number;
  };
  matchedSkills: ReadinessSkill[];
  missingSkills: ReadinessSkill[];
  relevantStrengths: ReadinessSkill[];
  relevantWeaknesses: ReadinessSkill[];
  recommendedActions: RecommendedAction[];
  summary: string;
}

export interface GetJobReadinessApiResponse {
  success: boolean;
  data: JobReadinessResponse;
}

export const atsService = {
  getJobDescriptions: async (): Promise<JobDescription[]> => {
    const response = await apiClient.get<GetJobDescriptionsResponse>('/ats/jobs');
    return response.data.jobs;
  },

  getJobDescriptionById: async (id: string): Promise<JobDescription> => {
    const response = await apiClient.get<GetJobDescriptionResponse>(`/ats/jobs/${id}`);
    return response.data.job;
  },

  createJobDescription: async (data: CreateJobDescriptionPayload): Promise<JobDescription> => {
    const response = await apiClient.post<GetJobDescriptionResponse>('/ats/jobs', data);
    return response.data.job;
  },

  deleteJobDescription: async (id: string): Promise<void> => {
    await apiClient.delete(`/ats/jobs/${id}`);
  },

  getJobReadiness: async (id: string): Promise<JobReadinessResponse> => {
    const response = await apiClient.get<GetJobReadinessApiResponse>(`/ats/jobs/${id}/readiness`);
    return response.data.data;
  },
};
