import { Page } from '@playwright/test';

interface MockDashboardOptions {
  stats?: any;
  roadmap?: any;
  roadmapError?: boolean;
}

export async function mockDashboardApis(page: Page, options: MockDashboardOptions = {}) {
  const { stats, roadmap, roadmapError } = options;

  await page.route('**/api/interviews/stats', async route => {
    const defaultStats = {
      summary: {
        totalInterviews: 0,
        completedInterviews: 0,
        inProgressInterviews: 0,
        abandonedInterviews: 0,
        averageScore: null,
        highestScore: null,
        lowestScore: null
      },
      domainStats: [],
      difficultyStats: [],
      typeStats: [],
      skillAnalysis: { strengths: [], weaknesses: [] },
      recentPerformance: [],
      improvementData: { available: false, percentage: null, trend: 'FLAT', message: 'Insufficient data' },
      recommendations: []
    };

    await route.fulfill({
      status: 200,
      json: {
        success: true,
        data: { ...defaultStats, ...stats, summary: { ...defaultStats.summary, ...(stats?.summary || {}) } }
      }
    });
  });

  await page.route('**/api/interviews/roadmap', async route => {
    if (roadmapError) {
      await route.fulfill({
        status: 500,
        json: { success: false, message: 'Internal Server Error' }
      });
      return;
    }

    const defaultRoadmap = {
      overallStatus: 'INSUFFICIENT_DATA',
      prioritySkills: [],
      improvingSkills: [],
      categoryFocus: null,
      recommendedAction: {
        action: 'COMPLETE_MORE_INTERVIEWS',
        reason: 'Complete more interviews to generate personalized insights.'
      },
      targetedPracticeImpact: []
    };

    await route.fulfill({
      status: 200,
      json: {
        success: true,
        data: roadmap || defaultRoadmap
      }
    });
  });
}
