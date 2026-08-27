import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { 
  InterviewSession, 
  InterviewQuestion
} from '../../../services/interview.service';
import { interviewService } from '../../../services/interview.service';

export interface InterviewContextState {
  session: InterviewSession | null;
  currentQuestion: InterviewQuestion | null;
  isLoading: boolean;
  isGeneratingQuestion: boolean;
  isSubmittingAnswer: boolean;
  isCompleting: boolean;
  error: string | null;
  
  // Actions
  loadSession: (id: string) => Promise<void>;
  generateNextQuestion: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  completeInterview: () => Promise<void>;
  retryReport: () => Promise<void>;
  clearError: () => void;
}

export const InterviewContext = createContext<InterviewContextState | undefined>(undefined);

export const InterviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState<boolean>(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadSession = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await interviewService.getInterviewById(id);
      setSession(data);
      if (data.questions && data.questions.length > 0) {
        setCurrentQuestion(data.questions[data.questions.length - 1]);
      } else {
        setCurrentQuestion(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateNextQuestion = useCallback(async () => {
    if (!session) return;
    setIsGeneratingQuestion(true);
    setError(null);
    try {
      const question = await interviewService.generateQuestion(session._id);
      setCurrentQuestion(question);
      // Optimistically update session's questions array to stay in sync
      setSession(prev => prev ? {
        ...prev,
        questions: [...prev.questions, question]
      } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to generate question');
    } finally {
      setIsGeneratingQuestion(false);
    }
  }, [session]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!session || !currentQuestion) return;
    setIsSubmittingAnswer(true);
    setError(null);
    try {
      const updatedQuestion = await interviewService.submitAnswer(session._id, answer);
      setCurrentQuestion(updatedQuestion);
      // Optimistically update the session's question list
      setSession(prev => {
        if (!prev) return null;
        const updatedQuestions = prev.questions.map(q => 
          q.index === updatedQuestion.index ? updatedQuestion : q
        );
        return { ...prev, questions: updatedQuestions };
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
      throw err;
    } finally {
      setIsSubmittingAnswer(false);
    }
  }, [session, currentQuestion]);

  const completeInterview = useCallback(async () => {
    if (!session) return;
    setIsCompleting(true);
    setError(null);
    try {
      const completedSession = await interviewService.completeInterview(session._id);
      setSession(completedSession);
    } catch (err: any) {
      setError(err.message || 'Failed to complete interview');
      throw err;
    } finally {
      setIsCompleting(false);
    }
  }, [session]);

  const retryReport = useCallback(async () => {
    if (!session) return;
    setIsCompleting(true);
    setError(null);
    try {
      const completedSession = await interviewService.retryReport(session._id);
      setSession(completedSession);
    } catch (err: any) {
      setError(err.message || 'Failed to retry report generation');
      throw err; // throw so UI can handle if needed
    } finally {
      setIsCompleting(false);
    }
  }, [session]);

  const value = {
    session,
    currentQuestion,
    isLoading,
    isGeneratingQuestion,
    isSubmittingAnswer,
    isCompleting,
    error,
    loadSession,
    generateNextQuestion,
    submitAnswer,
    completeInterview,
    retryReport,
    clearError
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
