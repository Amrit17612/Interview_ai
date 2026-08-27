import { describe, it, expect } from 'vitest';
import { validateLibrary, auditLibrary } from '../../server/src/utils/validateLibrary.js';
import questionLibrary from '../../server/src/data/questionLibrary.json';

describe('Question Library Validation', () => {
  it('should validate the library structure without errors', () => {
    expect(() => validateLibrary(questionLibrary)).not.toThrow();
  });

  it('should have zero structural failures', () => {
    const report = auditLibrary(questionLibrary);
    expect(report.errors.length).toBe(0);
  });

  it('should have zero duplicate IDs', () => {
    const report = auditLibrary(questionLibrary);
    expect(report.stats.duplicateIds).toBe(0);
  });

  it('should have zero broken references', () => {
    const report = auditLibrary(questionLibrary);
    expect(report.stats.brokenReferences).toBe(0);
  });

  it('should have zero circular references', () => {
    const report = auditLibrary(questionLibrary);
    expect(report.stats.circularReferences).toBe(0);
  });
  
  it('should run semantic similarity check without throwing', () => {
    const report = auditLibrary(questionLibrary);
    // Semantic similarity warnings may exist, but we do not blindly expect zero. 
    // We just verify it executes successfully.
    expect(Array.isArray(report.warnings)).toBe(true);
  });
});
