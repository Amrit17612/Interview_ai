import { test, expect } from '@playwright/test';
import { mockAuthApis } from './helpers/mockAuthApis';
import { mockContextApis } from './helpers/mockContextApis';
import { mockDashboardApis } from './helpers/mockDashboardApis';

test.describe('Dashboard Analytics E2E', () => {

  test('Test Group 1: Empty Dashboard State', async ({ page }) => {
    await mockDashboardApis(page);
    await mockContextApis(page);
    await mockAuthApis(page);

    await page.goto('/dashboard');
    
    // Verify empty state
    await expect(page.getByText('No interview data yet')).toBeVisible();
    await expect(page.getByText('Complete your first interview to start tracking your progress')).toBeVisible();
    await expect(page.locator('text=Start Interview').first()).toBeVisible();
    
    // Verify NaN doesn't exist
    const textContent = await page.content();
    expect(textContent).not.toContain('NaN');
    expect(textContent).not.toContain('undefined');
  });

  test('Test Group 2: Single Interview State', async ({ page }) => {
    const singleStats = {
      summary: {
        totalInterviews: 1,
        completedInterviews: 1,
        inProgressInterviews: 0,
        abandonedInterviews: 0,
        averageScore: 85,
        highestScore: 85,
        lowestScore: 85
      },
      domainStats: [ { domain: 'React', interviewCount: 1, completedCount: 1, averageScore: 85 } ],
      difficultyStats: [ { difficulty: 'INTERMEDIATE', interviewCount: 1, completedCount: 1, averageScore: 85 } ],
      typeStats: [ { type: 'TECHNICAL', interviewCount: 1, completedCount: 1, averageScore: 85 } ],
      skillAnalysis: { 
        strengths: [ { skill: 'Hooks', count: 1 } ], 
        weaknesses: [ { skill: 'Testing', count: 1 } ] 
      },
      recentPerformance: [
        { id: '1', date: new Date().toISOString(), domain: 'React', difficulty: 'INTERMEDIATE', type: 'TECHNICAL', overallScore: 85 }
      ],
      improvementData: { available: false, percentage: null, trend: 'FLAT', message: 'Insufficient data for improvement calculation.' },
      recommendations: [ 'Great start! Keep practicing.' ]
    };

    await mockDashboardApis(page, { stats: singleStats });
    await mockContextApis(page);
    await mockAuthApis(page);

    await page.goto('/dashboard');
    
    // Verify single data displays
    await expect(page.getByText('85%', { exact: true }).first()).toBeVisible(); // Average score
    await expect(page.getByText('Insufficient Data')).toBeVisible();
    await expect(page.getByText('Great start! Keep practicing.')).toBeVisible();
    await expect(page.getByText('Hooks', { exact: true })).toBeVisible();
  });

  test('Test Group 4: Large Dataset Analytics & Improvement', async ({ page }) => {
    const largeStats = {
      summary: {
        totalInterviews: 12,
        completedInterviews: 12,
        inProgressInterviews: 0,
        abandonedInterviews: 0,
        averageScore: 90,
        highestScore: 98,
        lowestScore: 75
      },
      domainStats: [],
      difficultyStats: [],
      typeStats: [],
      skillAnalysis: { strengths: [], weaknesses: [] },
      recentPerformance: [],
      improvementData: { available: true, percentage: 15.5, trend: 'UP', message: 'Compared to your previous 5 interviews, your recent score is up by 15.5%.' },
      recommendations: []
    };

    await mockDashboardApis(page, { stats: largeStats });
    await mockContextApis(page);
    await mockAuthApis(page);

    await page.goto('/dashboard');
    
    await expect(page.getByText('+15.5%')).toBeVisible();
    await expect(page.getByText('98%')).toBeVisible();
  });

});
