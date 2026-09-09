const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');
const { ACHIEVEMENTS } = require('../constants/achievements');

class AchievementService {
  /**
   * Calculates current and longest streak based on UTC dates.
   * A practice day is a calendar UTC day where the user completed at least 1 scored interview.
   */
  calculateStreak(sessions) {
    if (!sessions || sessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique UTC dates string YYYY-MM-DD
    const uniqueDates = [...new Set(sessions.map(s => {
      const date = new Date(s.createdAt);
      return date.toISOString().split('T')[0];
    }))].sort((a, b) => new Date(b) - new Date(a)); // Descending

    if (uniqueDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = 0;
    
    // Check if the streak is still active
    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
      let expectedDate = new Date(uniqueDates[0]);
      
      for (let i = 0; i < uniqueDates.length; i++) {
        if (uniqueDates[i] === expectedDate.toISOString().split('T')[0]) {
          currentStreak++;
          expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const curr = new Date(uniqueDates[i]);
      const prev = new Date(uniqueDates[i + 1]);
      
      // If difference is 1 day
      const diffTime = Math.abs(curr - prev);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return { currentStreak, longestStreak };
  }

  /**
   * Calculates Rising Star condition
   */
  calculateRisingStar(sessionsAsc) {
    let hasRisingStar = false;
    for (let i = 1; i < sessionsAsc.length; i++) {
      const prevScore = sessionsAsc[i - 1].overallScore;
      const currScore = sessionsAsc[i].overallScore;
      
      if (prevScore <= 80 && currScore >= prevScore + 10) {
        hasRisingStar = true;
        break;
      }
    }
    return hasRisingStar;
  }

  /**
   * Evaluates achievements for a user based on completed and scored interviews.
   */
  async evaluateAchievements(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Fetch all completed, scored interviews sorted chronologically (oldest to newest)
      const sessions = await InterviewSession.find({
        user: userId,
        status: 'COMPLETED',
        overallScore: { $ne: null }
      }).sort({ createdAt: 1 });

      const totalInterviews = sessions.length;
      let highestScore = 0;
      let totalScore = 0;

      sessions.forEach(s => {
        if (s.overallScore > highestScore) highestScore = s.overallScore;
        totalScore += s.overallScore;
      });

      const averageScore = totalInterviews > 0 ? Math.round(totalScore / totalInterviews) : 0;
      
      const { currentStreak, longestStreak } = this.calculateStreak(sessions);
      const hasRisingStar = this.calculateRisingStar(sessions);

      const stats = {
        totalInterviews,
        highestScore,
        averageScore,
        currentStreak,
        longestStreak,
        hasRisingStar
      };

      const unlockedIds = new Set(user.unlockedAchievements.map(a => a.achievementId));
      let newUnlocks = [];

      for (const achievement of ACHIEVEMENTS) {
        if (!unlockedIds.has(achievement.id)) {
          if (achievement.condition(stats)) {
            newUnlocks.push({
              achievementId: achievement.id,
              unlockedAt: new Date()
            });
            unlockedIds.add(achievement.id); // Prevent duplicates in same run
          }
        }
      }

      if (newUnlocks.length > 0) {
        await User.updateOne(
          { _id: userId },
          { $push: { unlockedAchievements: { $each: newUnlocks } } }
        );
      }

      return {
        stats,
        newUnlocks
      };
    } catch (error) {
      console.error('[ACHIEVEMENT SERVICE] Evaluate Achievements Error:', error);
      throw error;
    }
  }

  /**
   * Gets formatted achievements data for the frontend
   */
  async getAchievementsData(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const sessions = await InterviewSession.find({
      user: userId,
      status: 'COMPLETED',
      overallScore: { $ne: null }
    }).sort({ createdAt: 1 });

    const totalInterviews = sessions.length;
    let highestScore = 0;
    let totalScore = 0;

    sessions.forEach(s => {
      if (s.overallScore > highestScore) highestScore = s.overallScore;
      totalScore += s.overallScore;
    });

    const averageScore = totalInterviews > 0 ? Math.round(totalScore / totalInterviews) : 0;
    const { currentStreak, longestStreak } = this.calculateStreak(sessions);
    const hasRisingStar = this.calculateRisingStar(sessions);

    const stats = {
      totalInterviews,
      highestScore,
      averageScore,
      currentStreak,
      longestStreak,
      hasRisingStar,
      unlockedCount: user.unlockedAchievements.length
    };

    const unlockedMap = new Map(
      user.unlockedAchievements.map(a => [a.achievementId, a.unlockedAt])
    );

    const achievementsData = ACHIEVEMENTS.map(def => {
      const isUnlocked = unlockedMap.has(def.id);
      let progress = 0;

      if (!isUnlocked) {
        if (def.category === 'MILESTONES') {
          progress = Math.min(stats.totalInterviews, def.target || 0);
        } else if (def.category === 'SCORES') {
          progress = Math.min(stats.highestScore, def.target || 0);
        } else if (def.category === 'STREAKS') {
          progress = Math.min(stats.longestStreak, def.target || 0);
        } else if (def.category === 'IMPROVEMENT') {
          progress = stats.hasRisingStar ? 1 : 0;
        }
      } else {
        progress = def.target || 1; // 100% progress if unlocked
      }

      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
        unlocked: isUnlocked,
        unlockedAt: unlockedMap.get(def.id) || null,
        progress: progress,
        target: def.target || 1
      };
    });

    return {
      achievements: achievementsData,
      stats
    };
  }
}

module.exports = new AchievementService();
