import { apiClient } from './api.client';

export interface InterviewConfiguration {
  type: 'BEHAVIORAL' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'GENERAL';
  domain: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  targetSkill?: string | null;
  company?: string | null;
  role?: string | null;
}

export interface QuestionEvaluation {
  score: number;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
}

export interface InterviewQuestion {
  _id: string;
  index: number;
  text: string;
  userAnswer?: string;
  status: 'PENDING' | 'ANSWERED' | 'EVALUATED';
  evaluation?: QuestionEvaluation;
}

export interface FinalInterviewReport {
  overallScore: number;
  feedbackSummary: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
}

export interface InterviewSession {
  _id: string;
  user: string;
  resumeId: string | null;
  atsJobId: string | null;
  configuration: InterviewConfiguration;
  status: 'CONFIGURING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  questions: InterviewQuestion[];
  overallScore?: number;
  feedbackSummary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  reportStatus?: 'PENDING' | 'GENERATED' | 'FAILED';
  reportError?: string | null;
  createdAt: string;
  maxQuestions?: number;
  updatedAt: string;
  expiresAt?: string;
}

export interface InterviewStatsSummary {
  totalInterviews: number;
  completedInterviews: number;
  inProgressInterviews: number;
  abandonedInterviews: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
}

export interface DomainStat {
  domain: string;
  interviewCount: number;
  completedCount: number;
  averageScore: number | null;
}

export interface DifficultyStat {
  difficulty: string;
  interviewCount: number;
  completedCount: number;
  averageScore: number | null;
}

export interface TypeStat {
  type: string;
  interviewCount: number;
  completedCount: number;
  averageScore: number | null;
}

export interface SkillStat {
  skill: string;
  count: number;
  actionableSkillKey?: string | null;
}

export interface RecentPerformance {
  id: string;
  date: string;
  domain: string;
  difficulty: string;
  type: string;
  overallScore: number | null;
}

export interface ImprovementData {
  available: boolean;
  percentage: number | null;
  trend: 'UP' | 'DOWN' | 'FLAT';
  message: string;
}

export interface InterviewStatsData {
  summary: InterviewStatsSummary;
  domainStats: DomainStat[];
  difficultyStats: DifficultyStat[];
  typeStats: TypeStat[];
  skillAnalysis: {
    strengths: SkillStat[];
    weaknesses: SkillStat[];
  };
  recentPerformance: RecentPerformance[];
  improvementData: ImprovementData;
  recommendations: string[];
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InterviewHistoryResponse {
  interviews: InterviewSession[];
  pagination: PaginationMetadata;
}

export interface InterviewComparisonResponse {
  firstInterview: Partial<InterviewSession>;
  secondInterview: Partial<InterviewSession>;
  scoreAnalysis: {
    scoreDifference: number | null;
    percentageChange: number | null;
    trend: 'IMPROVED' | 'DECLINED' | 'STABLE' | 'INSUFFICIENT_COMPARABLE_DATA';
  };
  strengthComparison: {
    sharedStrengths: string[];
    newStrengths: string[];
  };
  weaknessComparison: {
    persistentWeaknesses: string[];
    resolvedWeaknesses: string[];
    newWeaknesses: string[];
  };
}

export interface RoadmapSkill {
  skill: string;
  actionableSkillKey: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  occurrences: number;
  trend: 'NEW' | 'PERSISTENT' | 'RESOLVED' | 'REGRESSING' | 'INSUFFICIENT_DATA';
}

export interface RoadmapCategoryFocus {
  type: string;
  reason: string;
  averageScore: number;
}

export interface RecommendedAction {
  action: 'TARGETED_PRACTICE' | 'PRACTICE_INTERVIEW_TYPE' | 'CONTINUE_CURRENT_PROGRESS' | 'COMPLETE_MORE_INTERVIEWS';
  targetSkill?: string;
  targetType?: string;
  reason: string;
}

export interface TargetedPracticeImpact {
  skill: string;
  previousAverage: number | null;
  targetedScore: number;
  message: string;
}

export interface InterviewRoadmapResponse {
  overallStatus: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'INSUFFICIENT_DATA';
  prioritySkills: RoadmapSkill[];
  improvingSkills: RoadmapSkill[];
  categoryFocus: RoadmapCategoryFocus | null;
  recommendedAction: RecommendedAction;
  targetedPracticeImpact: TargetedPracticeImpact[];
}

export interface InterviewAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const interviewService = {
  /**
   * Create a new interview session
   */
  async createInterview(payload: {
    resumeId?: string | null;
    atsJobId?: string | null;
    templateId?: string | null;
    configuration?: Partial<InterviewConfiguration>;
  }): Promise<InterviewSession> {
    const response = await apiClient.post<InterviewAPIResponse<InterviewSession>>('/interviews', payload);
    return response.data.data;
  },

  /**
   * Get all interview sessions for the authenticated user (paginated)
   */
  async getInterviews(params?: Record<string, string | number>): Promise<InterviewHistoryResponse> {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    const response = await apiClient.get<InterviewAPIResponse<InterviewHistoryResponse>>(`/interviews${query}`);
    return response.data.data;
  },

  /**
   * Compare two completed interview sessions
   */
  async compareInterviews(first: string, second: string): Promise<InterviewComparisonResponse> {
    const response = await apiClient.get<InterviewAPIResponse<InterviewComparisonResponse>>(`/interviews/compare?first=${first}&second=${second}`);
    return response.data.data;
  },

  /**
   * Get historical interview stats
   */
  async getInterviewStats(): Promise<InterviewStatsData> {
    const response = await apiClient.get<InterviewAPIResponse<InterviewStatsData>>('/interviews/stats');
    return response.data.data;
  },

  /**
   * Get a specific interview session by ID
   */
  async getInterviewById(id: string): Promise<InterviewSession> {
    const response = await apiClient.get<InterviewAPIResponse<InterviewSession>>(`/interviews/${id}`);
    return response.data.data;
  },

  /**
   * Generate the next question for a session
   */
  async generateQuestion(id: string): Promise<InterviewQuestion> {
    // Note: To avoid silent backend timeouts killing the request, we pass a slightly larger 
    // timeout here if needed, but for now we rely on the backend resolving.
    // The backend uses a 15000ms timeout for the AI provider.
    const response = await apiClient.post<InterviewAPIResponse<InterviewQuestion>>(`/interviews/${id}/question`, {}, {
      timeout: 20000 // Ensure client doesn't drop connection before backend timeout triggers
    });
    return response.data.data;
  },

  /**
   * Submit an answer to the current pending question
   */
  async submitAnswer(id: string, answer: string): Promise<InterviewQuestion> {
    const response = await apiClient.post<InterviewAPIResponse<InterviewQuestion>>(`/interviews/${id}/answer`, { answer }, {
      timeout: 20000
    });
    return response.data.data;
  },

  /**
   * Complete the interview session and trigger the final report generation
   */
  async completeInterview(id: string): Promise<InterviewSession> {
    const response = await apiClient.post<InterviewAPIResponse<InterviewSession>>(`/interviews/${id}/complete`, {}, {
      timeout: 25000 // Final report takes the longest
    });
    return response.data.data;
  },

  /**
   * Retry the final report generation for a completed session
   */
  async retryReport(id: string): Promise<InterviewSession> {
    const response = await apiClient.post<InterviewAPIResponse<InterviewSession>>(`/interviews/${id}/retry-report`, {}, {
      timeout: 25000 // Final report takes the longest
    });
    return response.data.data;
  },

  /**
   * Get the personalized improvement roadmap
   */
  async getInterviewRoadmap(): Promise<InterviewRoadmapResponse> {
    const response = await apiClient.get<InterviewAPIResponse<InterviewRoadmapResponse>>('/interviews/roadmap');
    return response.data.data;
  }
};
