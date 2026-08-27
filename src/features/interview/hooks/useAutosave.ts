import { useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'interviu_ai_draft_';
const MAX_LENGTH = 15000; // Safe upper bound to prevent quota exhaustion
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function pruneOldDrafts() {
  try {
    const keysToRemove: string[] = [];
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (!item) {
            keysToRemove.push(key);
            continue;
          }
          
          const parsed = JSON.parse(item);
          if (!parsed.savedAt || (now - new Date(parsed.savedAt).getTime() > SEVEN_DAYS_MS)) {
            keysToRemove.push(key);
          }
        } catch (e) {
          // Malformed JSON for our prefix
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (err) {
    console.warn('Failed to prune old drafts.', err);
  }
}

interface AutosaveProps {
  sessionId?: string;
  questionId?: string;
  answerText: string;
}

export function useAutosave({ sessionId, questionId, answerText }: AutosaveProps) {
  
  const getStorageKey = useCallback(() => {
    if (!sessionId || !questionId) return null;
    return `${STORAGE_PREFIX}${sessionId}_${questionId}`;
  }, [sessionId, questionId]);

  // Debounced save
  useEffect(() => {
    const key = getStorageKey();
    if (!key) return;

    const handler = setTimeout(() => {
      try {
        const trimmed = answerText.trim();
        if (trimmed === '') {
          localStorage.removeItem(key);
        } else {
          // Truncate safely if it exceeds massive limits
          const safeText = trimmed.length > MAX_LENGTH ? trimmed.substring(0, MAX_LENGTH) : trimmed;
          
          const payload = {
            sessionId,
            questionId,
            answerText: safeText,
            savedAt: new Date().toISOString()
          };
          localStorage.setItem(key, JSON.stringify(payload));
        }
      } catch (err) {
        console.warn('Autosave failed: localStorage may be restricted or full.', err);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [answerText, getStorageKey, sessionId, questionId]);

  // Retrieve draft
  const getDraft = useCallback((): string | null => {
    const key = getStorageKey();
    if (!key) return null;

    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.sessionId === sessionId && parsed.questionId === questionId) {
          return parsed.answerText;
        }
      }
    } catch (err) {
      console.warn('Failed to parse draft from localStorage.', err);
    }
    return null;
  }, [getStorageKey, sessionId, questionId]);

  const clearDraft = useCallback(() => {
    const key = getStorageKey();
    if (!key) return;
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn('Failed to clear draft.', err);
    }
  }, [getStorageKey]);

  return { getDraft, clearDraft };
}
