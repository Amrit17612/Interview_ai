import { test, expect } from '@playwright/test';
import { mockAuthApis } from './helpers/mockAuthApis';
import { mockContextApis } from './helpers/mockContextApis';

test.describe('Sprint 21: ATS Job Readiness E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Standard mock setup
    await mockAuthApis(page);
    await mockContextApis(page);
  });

  test('Scenario 1: Dashboard Navigation', async ({ page }) => {
    await page.goto('/ats');
    // Verify Job Card renders
    await expect(page.getByText('Software Engineer')).toBeVisible();
    await expect(page.getByText('TechCorp')).toBeVisible();
    
    // View Readiness CTA navigation
    const readinessBtn = page.getByRole('button', { name: /View Readiness|Analyze|Details/i });
    await expect(readinessBtn).toBeVisible();
    await readinessBtn.click();
    
    await expect(page).toHaveURL(/.*\/ats\/jobs\/test-job$/);
  });

  test('Scenario 2: Excellent Readiness', async ({ page }) => {
    const readiness = {
      readinessScore: 92,
      readinessStatus: 'EXCELLENT',
      scoreBreakdown: { resumeMatch: 95, interviewAlignment: 90, weaknessRisk: 88, practiceProgress: 95 },
      matchedSkills: [
        { skill: 'React', actionableSkillKey: null },
        { skill: 'TypeScript', actionableSkillKey: null }
      ],
      missingSkills: [],
      relevantStrengths: [{ skill: 'Frontend Architecture', actionableSkillKey: null }],
      relevantWeaknesses: [],
      recommendedActions: [],
      summary: 'You are highly prepared for this role.'
    };
    await mockContextApis(page, { readiness });
    
    await page.goto('/ats/jobs/test-job');
    
    await expect(page.getByText('92')).toBeVisible();
    await expect(page.getByText(/Excellent/i)).toBeVisible();
    await expect(page.getByText('React', { exact: true })).toBeVisible();
    await expect(page.getByText('TypeScript', { exact: true })).toBeVisible();
    await expect(page.getByText('Frontend Architecture')).toBeVisible();
    await expect(page.getByText('You are highly prepared for this role.')).toBeVisible();
  });

  test('Scenario 3: Moderate / Needs Preparation', async ({ page }) => {
    const readiness = {
      readinessScore: 65,
      readinessStatus: 'NEEDS_PREPARATION',
      scoreBreakdown: { resumeMatch: 60, interviewAlignment: 70, weaknessRisk: 50, practiceProgress: 80 },
      matchedSkills: [],
      missingSkills: [],
      relevantStrengths: [],
      relevantWeaknesses: [],
      recommendedActions: [],
      summary: 'You need more preparation.'
    };
    await mockContextApis(page, { readiness });
    
    await page.goto('/ats/jobs/test-job');
    await expect(page.getByText(/Needs Preparation/i)).toBeVisible();
  });

  test('Scenario 4 & 5: Skill Analysis and Targeted Practice', async ({ page }) => {
    const readiness = {
      readinessScore: 70,
      readinessStatus: 'MODERATE',
      scoreBreakdown: { resumeMatch: 70, interviewAlignment: 70, weaknessRisk: 70, practiceProgress: 70 },
      matchedSkills: [{ skill: 'JavaScript', actionableSkillKey: null }],
      missingSkills: [{ skill: 'Docker', actionableSkillKey: 'docker' }],
      relevantStrengths: [{ skill: 'React', actionableSkillKey: null }],
      relevantWeaknesses: [{ skill: 'CI/CD', actionableSkillKey: 'cicd' }],
      recommendedActions: [],
      summary: 'Moderate fit.'
    };
    await mockContextApis(page, { readiness });
    
    await page.goto('/ats/jobs/test-job');
    
    await expect(page.getByText('JavaScript', { exact: true })).toBeVisible();
    await expect(page.getByText('Docker', { exact: true })).toBeVisible();
    await expect(page.getByText('React', { exact: true })).toBeVisible();
    await expect(page.getByText('CI/CD', { exact: true })).toBeVisible();
    
    // Practice CTA routing for actionable missing skill
    const practiceBtns = page.getByRole('button', { name: 'Practice' });
    // Assuming at least one practice button exists (for Docker or CI/CD)
    await expect(practiceBtns.first()).toBeVisible();
    
    // Click the first practice button and verify URL
    await practiceBtns.first().click();
    await expect(page).toHaveURL(/.*\/interviews\?targetSkill=/);
  });

  test('Scenario 6: Recommended Actions', async ({ page }) => {
    const readiness = {
      readinessScore: 50,
      readinessStatus: 'NEEDS_PREPARATION',
      scoreBreakdown: { resumeMatch: 50, interviewAlignment: 50, weaknessRisk: 50, practiceProgress: 50 },
      matchedSkills: [],
      missingSkills: [],
      relevantStrengths: [],
      relevantWeaknesses: [],
      recommendedActions: [
        { action: 'UPLOAD_RESUME', title: 'Update Resume', description: 'Your resume is missing key skills.', targetSkill: null },
        { action: 'PRACTICE_TARGET_SKILL', title: 'Practice System Design', description: 'Practice this missing skill.', targetSkill: 'system-design' }
      ],
      summary: 'Actions needed.'
    };
    await mockContextApis(page, { readiness });
    
    await page.goto('/ats/jobs/test-job');
    
    await expect(page.getByText('Update Resume')).toBeVisible();
    await expect(page.getByText('Practice System Design')).toBeVisible();
    
    // Test navigation
    const actionBtn = page.getByRole('button', { name: /Practice System Design|Practice/i }).first();
    await actionBtn.click();
    await expect(page).toHaveURL(/.*\/interviews\?targetSkill=system-design/);
  });

  test('Scenario 7: Insufficient Data', async ({ page }) => {
    const readiness = {
      readinessScore: 0,
      readinessStatus: 'INSUFFICIENT_DATA',
      scoreBreakdown: { resumeMatch: 0, interviewAlignment: 0, weaknessRisk: 0, practiceProgress: 0 },
      matchedSkills: [],
      missingSkills: [],
      relevantStrengths: [],
      relevantWeaknesses: [],
      recommendedActions: [],
      summary: 'Not enough data.'
    };
    await mockContextApis(page, { readiness });
    
    await page.goto('/ats/jobs/test-job');
    
    await expect(page.getByText(/Not enough data/i).first()).toBeVisible();
    // Numerical UI should not render (assuming scoreBreakdown is hidden)
    await expect(page.getByText('Score Breakdown')).not.toBeVisible();
  });

  test('Scenario 8: API Error', async ({ page }) => {
    await mockContextApis(page, { readinessError: true });
    await page.goto('/ats/jobs/test-job');
    
    await expect(page.getByText('Unable to load Job Readiness')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
    
    const backBtn = page.getByRole('button', { name: /Back to ATS/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expect(page).toHaveURL(/.*\/ats/);
  });
});
