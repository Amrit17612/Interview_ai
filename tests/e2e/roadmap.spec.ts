import { test, expect } from '@playwright/test';
import { mockAuthApis } from './helpers/mockAuthApis';
import { mockContextApis } from './helpers/mockContextApis';
import { mockDashboardApis } from './helpers/mockDashboardApis';

test.describe('Sprint 20: Improvement Roadmap E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Shared mocks for basic dashboard rendering
    await mockContextApis(page);
    await mockAuthApis(page);
  });

  const baseStats = { summary: { totalInterviews: 5 } };

  test('Scenario 1 & 7: Improving Status and Improving Skills', async ({ page }) => {
    const roadmap = {
      overallStatus: 'IMPROVING',
      prioritySkills: [],
      improvingSkills: [
        { skill: 'React', reason: 'Consistently higher scores in recent technical interviews.' }
      ],
      categoryFocus: null,
      recommendedAction: { action: 'CONTINUE_PRACTICE', reason: 'Keep it up.' },
      targetedPracticeImpact: []
    };
    await mockDashboardApis(page, { stats: baseStats, roadmap });
    
    await page.goto('/dashboard');
    await expect(page.getByText('Improving', { exact: true })).toBeVisible();
    await expect(page.getByText('React', { exact: true })).toBeVisible();
    await expect(page.getByText('Consistently higher scores in recent technical interviews.')).toBeVisible();
  });

  test('Scenario 2: Declining Status', async ({ page }) => {
    const roadmap = {
      overallStatus: 'DECLINING',
      prioritySkills: [],
      improvingSkills: [],
      categoryFocus: null,
      recommendedAction: { action: 'FOCUS_ON_WEAKNESSES', reason: 'Recent scores have dropped.' },
      targetedPracticeImpact: []
    };
    await mockDashboardApis(page, { stats: baseStats, roadmap });
    
    await page.goto('/dashboard');
    await expect(page.getByText('Needs Focus')).toBeVisible();
  });

  test('Scenario 3: Stable Status', async ({ page }) => {
    const roadmap = {
      overallStatus: 'STABLE',
      prioritySkills: [],
      improvingSkills: [],
      categoryFocus: null,
      recommendedAction: { action: 'TRY_ADVANCED', reason: 'Your scores are stable.' },
      targetedPracticeImpact: []
    };
    await mockDashboardApis(page, { stats: baseStats, roadmap });
    
    await page.goto('/dashboard');
    await expect(page.getByText('Stable', { exact: true })).toBeVisible();
  });

  test('Scenario 4, 5, 6: Priority Skills (Actionable vs Non-Actionable)', async ({ page }) => {
    const roadmap = {
      overallStatus: 'STABLE',
      prioritySkills: [
        { skill: 'System Design', priority: 'HIGH', trend: 'PERSISTENT', actionableSkillKey: 'system-design' },
        { skill: 'CSS', priority: 'MEDIUM', trend: 'NEW', actionableSkillKey: null }
      ],
      improvingSkills: [],
      categoryFocus: null,
      recommendedAction: { action: 'PRACTICE', reason: 'Practice needed.' },
      targetedPracticeImpact: []
    };
    await mockDashboardApis(page, { stats: baseStats, roadmap });
    
    await page.goto('/dashboard');
    
    // Skill names
    await expect(page.getByText('System Design')).toBeVisible();
    await expect(page.getByText('CSS', { exact: true })).toBeVisible();
    
    // Priority / Trend
    await expect(page.getByText('HIGH Priority')).toBeVisible();
    await expect(page.getByText('MEDIUM Priority')).toBeVisible();
    await expect(page.getByText('PERSISTENT')).toBeVisible();
    await expect(page.getByText('NEW')).toBeVisible();
    
    // CTA routing for actionable skill
    const practiceBtns = page.getByRole('button', { name: 'Practice' });
    await expect(practiceBtns).toHaveCount(1); // CSS shouldn't have one
    await practiceBtns.click();
    await expect(page).toHaveURL(/.*\/interviews\?targetSkill=system-design/);
  });

  test('Scenario 8: Category Focus', async ({ page }) => {
    const roadmapWithFocus = {
      overallStatus: 'STABLE',
      prioritySkills: [],
      improvingSkills: [],
      categoryFocus: {
        type: 'BACKEND',
        reason: 'Multiple failures in backend related questions.'
      },
      recommendedAction: { action: 'PRACTICE', reason: 'Practice needed.' },
      targetedPracticeImpact: []
    };
    
    // With focus
    await mockDashboardApis(page, { stats: baseStats, roadmap: roadmapWithFocus });
    await page.goto('/dashboard');
    await expect(page.getByText('Category Focus')).toBeVisible();
    await expect(page.getByText('backend', { exact: true })).toBeVisible();
    await expect(page.getByText('Multiple failures in backend related questions.')).toBeVisible();
    
    // Without focus
    const roadmapWithoutFocus = { ...roadmapWithFocus, categoryFocus: null };
    await mockDashboardApis(page, { stats: baseStats, roadmap: roadmapWithoutFocus });
    await page.reload();
    await expect(page.getByText('Category Focus')).not.toBeVisible();
  });

  test('Scenario 9: Targeted Practice Impact', async ({ page }) => {
    const roadmap = {
      overallStatus: 'STABLE',
      prioritySkills: [],
      improvingSkills: [],
      categoryFocus: null,
      recommendedAction: { action: 'PRACTICE', reason: 'Practice needed.' },
      targetedPracticeImpact: [
        { skill: 'React', message: 'Improved a lot', previousAverage: 50, targetedScore: 80 },
        { skill: 'Node', message: 'Keep going', previousAverage: null, targetedScore: 70 }
      ]
    };
    await mockDashboardApis(page, { stats: baseStats, roadmap });
    await page.goto('/dashboard');
    
    // First skill with baseline
    await expect(page.getByText('React', { exact: true })).toBeVisible();
    await expect(page.getByText(/Prev Avg: 50%/i)).toBeVisible();
    await expect(page.getByText(/Targeted: 80%/i)).toBeVisible();
    await expect(page.getByText('Improved a lot')).toBeVisible();
    
    // Second skill safely handles null baseline
    await expect(page.getByText('Node', { exact: true })).toBeVisible();
    await expect(page.getByText(/Not enough historical data/i)).toBeVisible();
    await expect(page.getByText('Keep going')).toBeVisible();
    await expect(page.locator('text=NaN')).not.toBeVisible();
  });

  test('Scenario 10: Roadmap Error Isolation', async ({ page }) => {
    // We pass roadmapError: true to force the roadmap API to fail
    await mockDashboardApis(page, { stats: baseStats, roadmapError: true });
    
    await page.goto('/dashboard');
    
    // Error state in roadmap
    await expect(page.getByText(/Your improvement roadmap could not be loaded/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
    
    // The rest of the dashboard should still be visible
    await expect(page.getByText("Here's your comprehensive interview progress analytics.")).toBeVisible();
  });

});
