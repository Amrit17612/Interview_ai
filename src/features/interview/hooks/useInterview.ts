import { useContext } from 'react';
import { InterviewContext } from '../context/InterviewContext';
import type { InterviewContextState } from '../context/InterviewContext';

export const useInterview = (): InterviewContextState => {
  const context = useContext(InterviewContext);
  
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  
  return context;
};
