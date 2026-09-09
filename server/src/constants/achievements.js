const ACHIEVEMENTS = [
  // A. INTERVIEW MILESTONES
  {
    id: 'milestone_1',
    name: 'First Steps',
    description: 'Complete your first practice interview.',
    icon: 'PlayCircle', // Matches lucide-react icon names roughly, frontend will map
    category: 'MILESTONES',
    target: 1,
    condition: (stats) => stats.totalInterviews >= 1
  },
  {
    id: 'milestone_5',
    name: 'Getting Serious',
    description: 'Complete 5 practice interviews.',
    icon: 'Target',
    category: 'MILESTONES',
    target: 5,
    condition: (stats) => stats.totalInterviews >= 5
  },
  {
    id: 'milestone_10',
    name: 'Interview Veteran',
    description: 'Complete 10 practice interviews.',
    icon: 'Award',
    category: 'MILESTONES',
    target: 10,
    condition: (stats) => stats.totalInterviews >= 10
  },
  {
    id: 'milestone_25',
    name: 'Master of Practice',
    description: 'Complete 25 practice interviews.',
    icon: 'Medal',
    category: 'MILESTONES',
    target: 25,
    condition: (stats) => stats.totalInterviews >= 25
  },

  // B. SCORE ACHIEVEMENTS
  {
    id: 'score_70',
    name: 'Solid Performer',
    description: 'Achieve a score of 70 or higher on an interview.',
    icon: 'CheckCircle',
    category: 'SCORES',
    target: 70,
    condition: (stats) => stats.highestScore >= 70
  },
  {
    id: 'score_80',
    name: 'High Achiever',
    description: 'Achieve a score of 80 or higher on an interview.',
    icon: 'Star',
    category: 'SCORES',
    target: 80,
    condition: (stats) => stats.highestScore >= 80
  },
  {
    id: 'score_90',
    name: 'Exceptional',
    description: 'Achieve a score of 90 or higher on an interview.',
    icon: 'Sparkles',
    category: 'SCORES',
    target: 90,
    condition: (stats) => stats.highestScore >= 90
  },
  {
    id: 'score_100',
    name: 'Perfection',
    description: 'Achieve a perfect score of 100 on an interview.',
    icon: 'Trophy',
    category: 'SCORES',
    target: 100,
    condition: (stats) => stats.highestScore >= 100
  },

  // C. PRACTICE / STREAK
  {
    id: 'streak_3',
    name: 'Warming Up',
    description: 'Maintain a 3-day practice streak.',
    icon: 'Flame',
    category: 'STREAKS',
    target: 3,
    condition: (stats) => stats.longestStreak >= 3
  },
  {
    id: 'streak_7',
    name: 'Consistent',
    description: 'Maintain a 7-day practice streak.',
    icon: 'Flame',
    category: 'STREAKS',
    target: 7,
    condition: (stats) => stats.longestStreak >= 7
  },
  {
    id: 'streak_14',
    name: 'Unstoppable',
    description: 'Maintain a 14-day practice streak.',
    icon: 'Zap',
    category: 'STREAKS',
    target: 14,
    condition: (stats) => stats.longestStreak >= 14
  },

  // D. IMPROVEMENT
  {
    id: 'improvement_rising_star',
    name: 'Rising Star',
    description: 'Improve your score by 10 points over your previous baseline.',
    icon: 'TrendingUp',
    category: 'IMPROVEMENT',
    target: null,
    condition: (stats) => stats.hasRisingStar
  }
];

module.exports = { ACHIEVEMENTS };
