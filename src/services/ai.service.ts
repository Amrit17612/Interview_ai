import { apiClient } from './api.client';

export type AIPromptId = 'TEST_CONNECTION';

export interface AIRequest {
  promptId: AIPromptId;
  payload?: Record<string, unknown>;
}

export interface AIResponseData {
  text: string;
}

export interface AIResponse {
  success: boolean;
  data: AIResponseData;
}

class AIService {
  /**
   * Generates an AI response from the secured backend endpoint.
   * 
   * The frontend does not provide API keys or model configurations. It only
   * requests generation based on a pre-approved backend promptId.
   * 
   * @param request - The validated AI request containing promptId and payload.
   * @returns A promise resolving to the generic AI text response.
   */
  async generate(request: AIRequest): Promise<AIResponseData> {
    // The backend uses a 15s Promise.race timeout for Gemini calls.
    // We override the default 10s frontend timeout to 20s to ensure the 
    // backend timeout natively resolves and returns the proper 503 safe error.
    const response = await apiClient.post<AIResponse>('/ai/generate', request, {
      timeout: 20000, 
    });
    return response.data.data;
  }
}

export const aiService = new AIService();
