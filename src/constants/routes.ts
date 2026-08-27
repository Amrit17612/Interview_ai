export const ROUTES = {
  // Public
  HOME: '/',
  PRICING: '/pricing',
  CONTACT: '/contact',
  ABOUT: '/about',
  FAQ: '/faq',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS: '/terms',
  REFUND_POLICY: '/refund-policy',
  COOKIE_POLICY: '/cookie-policy',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // Onboarding
  ONBOARDING_WELCOME: '/onboarding/welcome',
  ONBOARDING_PROFILE: '/onboarding/profile-setup',
  ONBOARDING_GOAL: '/onboarding/career-goal',
  ONBOARDING_SKILLS: '/onboarding/skill-selection',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Interview
  INTERVIEW: '/interviews',
  INTERVIEW_DEVICE_CHECK: '/interviews/device-check',
  INTERVIEW_RESUME: '/interviews/resume-selection',
  INTERVIEW_DOMAIN: '/interviews/domain-selection',
  INTERVIEW_COMPANY: '/interviews/company-selection',
  INTERVIEW_DIFFICULTY: '/interviews/difficulty-selection',
  INTERVIEW_TYPE: '/interviews/type',
  INTERVIEW_INSTRUCTIONS: '/interviews/instructions',
  INTERVIEW_ACTIVE: '/interviews/active',
  INTERVIEW_PROCESSING: '/interviews/processing',
  INTERVIEW_REPORT: '/interviews/report',
  INTERVIEW_REPORT_DETAILS: '/interviews/report-details',
  INTERVIEW_HISTORY: '/interviews/history',
  INTERVIEW_COMPARE: '/interviews/compare',

  // Resumes
  RESUME: '/resumes',
  RESUME_UPLOAD: '/resumes/upload',
  RESUME_ANALYSIS: '/resumes/analysis',
  RESUME_SCORE: '/resumes/score',
  RESUME_SUGGESTIONS: '/resumes/suggestions',
  RESUME_HISTORY: '/resumes/history',
  RESUME_VERSIONS: '/resumes/versions',

  // ATS
  ATS: '/ats',
  ATS_DETAILS: '/ats/jobs/:id',

  // Company Packs
  COMPANY_PACKS: '/company-packs',
  COMPANY_PACK_DETAILS: '/company-packs/:id',
  COMPANY_PACK_READINESS: '/company-packs/:id/readiness',

  // Domain Packs
  DOMAIN_PACKS: '/domain-packs',
  DOMAIN_PACK_DETAILS: '/domain-packs/:id',

  // Learning
  LEARNING: '/learning',
  LEARNING_ROADMAP: '/learning/roadmap',
  LEARNING_SKILLS: '/learning/skills',

  // Progress
  PROGRESS: '/progress',
  PROGRESS_ANALYTICS: '/progress/interview-analytics',
  PROGRESS_HISTORY: '/progress/history',

  // Achievements
  ACHIEVEMENTS: '/achievements',
  ACHIEVEMENTS_BADGES: '/achievements/badges',

  // Profile
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',

  // Settings
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_ACCOUNT: '/settings/account',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_PREFERENCES: '/settings/preferences',

  // Privacy & Security
  PRIVACY_CENTER: '/privacy/center',
  SECURITY_SETTINGS: '/privacy/security-settings',

  // Support
  HELP_CENTER: '/support/help-center',
  CONTACT_SUPPORT: '/support/contact',
  FEEDBACK: '/support/feedback',
  REPORT_BUG: '/support/report-bug',

  // Credits
  CREDITS: '/credits',
  CREDITS_REFERRAL: '/credits/referral',

  // System
  COMING_SOON: '/coming-soon',
  MAINTENANCE: '/maintenance',
  NOT_FOUND: '*'
};
