const fs = require('fs');
const path = require('path');

const publicPages = [
  { path: 'landing/pages/Home', name: 'Home', route: 'HOME' },
  { path: 'landing/pages/Pricing', name: 'Pricing', route: 'PRICING' },
  { path: 'landing/pages/Contact', name: 'Contact', route: 'CONTACT' },
  { path: 'landing/pages/About', name: 'About', route: 'ABOUT' },
  { path: 'landing/pages/FAQ', name: 'FAQ', route: 'FAQ' },
  { path: 'landing/pages/PrivacyPolicy', name: 'PrivacyPolicy', route: 'PRIVACY_POLICY' },
  { path: 'landing/pages/Terms', name: 'Terms', route: 'TERMS' },
  { path: 'landing/pages/RefundPolicy', name: 'RefundPolicy', route: 'REFUND_POLICY' },
  { path: 'landing/pages/CookiePolicy', name: 'CookiePolicy', route: 'COOKIE_POLICY' }
];

const authPages = [
  { path: 'auth/pages/Login', name: 'Login', route: 'LOGIN' },
  { path: 'auth/pages/Register', name: 'Register', route: 'REGISTER' },
  { path: 'auth/pages/ForgotPassword', name: 'ForgotPassword', route: 'FORGOT_PASSWORD' },
  { path: 'auth/pages/ResetPassword', name: 'ResetPassword', route: 'RESET_PASSWORD' },
  { path: 'auth/pages/VerifyEmail', name: 'VerifyEmail', route: 'VERIFY_EMAIL' },
  { path: 'onboarding/pages/Welcome', name: 'Welcome', route: 'ONBOARDING_WELCOME' },
  { path: 'onboarding/pages/ProfileSetup', name: 'ProfileSetup', route: 'ONBOARDING_PROFILE' },
  { path: 'onboarding/pages/CareerGoal', name: 'CareerGoal', route: 'ONBOARDING_GOAL' },
  { path: 'onboarding/pages/SkillSelection', name: 'SkillSelection', route: 'ONBOARDING_SKILLS' }
];

const dashboardPages = [
  { path: 'dashboard/pages/DashboardHome', name: 'DashboardHome', route: 'DASHBOARD' },
  { path: 'interview/pages/InterviewHome', name: 'InterviewHome', route: 'INTERVIEW' },
  { path: 'interview/pages/DeviceCheck', name: 'DeviceCheck', route: 'INTERVIEW_DEVICE_CHECK' },
  { path: 'interview/pages/ResumeSelection', name: 'ResumeSelection', route: 'INTERVIEW_RESUME' },
  { path: 'interview/pages/DomainSelection', name: 'DomainSelection', route: 'INTERVIEW_DOMAIN' },
  { path: 'interview/pages/CompanySelection', name: 'CompanySelection', route: 'INTERVIEW_COMPANY' },
  { path: 'interview/pages/DifficultySelection', name: 'DifficultySelection', route: 'INTERVIEW_DIFFICULTY' },
  { path: 'interview/pages/InterviewType', name: 'InterviewType', route: 'INTERVIEW_TYPE' },
  { path: 'interview/pages/InterviewInstructions', name: 'InterviewInstructions', route: 'INTERVIEW_INSTRUCTIONS' },
  { path: 'interview/pages/ActiveInterview', name: 'ActiveInterview', route: 'INTERVIEW_ACTIVE' },
  { path: 'interview/pages/AIProcessing', name: 'AIProcessing', route: 'INTERVIEW_PROCESSING' },
  { path: 'interview/pages/FinalReport', name: 'FinalReport', route: 'INTERVIEW_REPORT' },
  { path: 'interview/pages/ReportDetails', name: 'ReportDetails', route: 'INTERVIEW_REPORT_DETAILS' },
  { path: 'interview/pages/InterviewHistory', name: 'InterviewHistory', route: 'INTERVIEW_HISTORY' },
  { path: 'resume/pages/ResumeDashboard', name: 'ResumeDashboard', route: 'RESUME' },
  { path: 'resume/pages/UploadResume', name: 'UploadResume', route: 'RESUME_UPLOAD' },
  { path: 'resume/pages/ResumeAnalysis', name: 'ResumeAnalysis', route: 'RESUME_ANALYSIS' },
  { path: 'resume/pages/ResumeScore', name: 'ResumeScore', route: 'RESUME_SCORE' },
  { path: 'resume/pages/ResumeSuggestions', name: 'ResumeSuggestions', route: 'RESUME_SUGGESTIONS' },
  { path: 'resume/pages/ResumeHistory', name: 'ResumeHistory', route: 'RESUME_HISTORY' },
  { path: 'resume/pages/ResumeVersions', name: 'ResumeVersions', route: 'RESUME_VERSIONS' },
  { path: 'ats/pages/ATSDashboard', name: 'ATSDashboard', route: 'ATS' },
  { path: 'ats/pages/ATSScore', name: 'ATSScore', route: 'ATS_SCORE' },
  { path: 'ats/pages/ATSSuggestions', name: 'ATSSuggestions', route: 'ATS_SUGGESTIONS' },
  { path: 'company-packs/pages/CompanyPacksHome', name: 'CompanyPacksHome', route: 'COMPANY_PACKS' },
  { path: 'company-packs/pages/CompanyPackDetails', name: 'CompanyPackDetails', route: 'COMPANY_PACK_DETAILS' },
  { path: 'company-packs/pages/CompanyReadiness', name: 'CompanyReadiness', route: 'COMPANY_PACK_READINESS' },
  { path: 'domain-packs/pages/DomainHome', name: 'DomainHome', route: 'DOMAIN_PACKS' },
  { path: 'domain-packs/pages/DomainDetails', name: 'DomainDetails', route: 'DOMAIN_PACK_DETAILS' },
  { path: 'learning/pages/LearningDashboard', name: 'LearningDashboard', route: 'LEARNING' },
  { path: 'learning/pages/PersonalizedRoadmap', name: 'PersonalizedRoadmap', route: 'LEARNING_ROADMAP' },
  { path: 'learning/pages/SkillProgress', name: 'SkillProgress', route: 'LEARNING_SKILLS' },
  { path: 'progress/pages/OverallProgress', name: 'OverallProgress', route: 'PROGRESS' },
  { path: 'progress/pages/InterviewAnalytics', name: 'InterviewAnalytics', route: 'PROGRESS_ANALYTICS' },
  { path: 'progress/pages/PerformanceHistory', name: 'PerformanceHistory', route: 'PROGRESS_HISTORY' },
  { path: 'achievements/pages/AchievementsHome', name: 'AchievementsHome', route: 'ACHIEVEMENTS' },
  { path: 'achievements/pages/Badges', name: 'Badges', route: 'ACHIEVEMENTS_BADGES' },
  { path: 'profile/pages/UserProfile', name: 'UserProfile', route: 'PROFILE' },
  { path: 'profile/pages/EditProfile', name: 'EditProfile', route: 'PROFILE_EDIT' },
  { path: 'settings/pages/GeneralSettings', name: 'GeneralSettings', route: 'SETTINGS_GENERAL' },
  { path: 'settings/pages/AccountSettings', name: 'AccountSettings', route: 'SETTINGS_ACCOUNT' },
  { path: 'settings/pages/NotificationsSettings', name: 'NotificationsSettings', route: 'SETTINGS_NOTIFICATIONS' },
  { path: 'settings/pages/PreferencesSettings', name: 'PreferencesSettings', route: 'SETTINGS_PREFERENCES' },
  { path: 'privacy/pages/PrivacyCenter', name: 'PrivacyCenter', route: 'PRIVACY_CENTER' },
  { path: 'privacy/pages/SecuritySettings', name: 'SecuritySettings', route: 'SECURITY_SETTINGS' },
  { path: 'support/pages/HelpCenter', name: 'HelpCenter', route: 'HELP_CENTER' },
  { path: 'support/pages/ContactSupport', name: 'ContactSupport', route: 'CONTACT_SUPPORT' },
  { path: 'support/pages/Feedback', name: 'Feedback', route: 'FEEDBACK' },
  { path: 'support/pages/ReportBug', name: 'ReportBug', route: 'REPORT_BUG' },
  { path: 'credits/pages/CreditsHome', name: 'CreditsHome', route: 'CREDITS' },
  { path: 'credits/pages/ReferralProgram', name: 'ReferralProgram', route: 'CREDITS_REFERRAL' }
];

const systemPages = [
  { path: 'system/pages/NotFound', name: 'NotFound', route: 'NOT_FOUND' },
  { path: 'system/pages/Maintenance', name: 'Maintenance', route: 'MAINTENANCE' },
  { path: 'system/pages/ComingSoon', name: 'ComingSoon', route: 'COMING_SOON' }
];

let imports = "import { createBrowserRouter } from 'react-router-dom';\n";
imports += "import { ROUTES } from '../constants/routes';\n";
imports += "import { PublicLayout } from '../layouts/PublicLayout';\n";
imports += "import { AuthLayout } from '../layouts/AuthLayout';\n";
imports += "import { DashboardLayout } from '../layouts/DashboardLayout';\n";
imports += "import { SystemLayout } from '../layouts/SystemLayout';\n\n";

const allPages = [...publicPages, ...authPages, ...dashboardPages, ...systemPages];

allPages.forEach(p => {
  imports += `import { ${p.name} } from '../features/${p.path}';\n`;
});

let routesStr = `
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
${publicPages.map(p => `      { path: ROUTES.${p.route}, element: <${p.name} /> }`).join(',\n')}
    ]
  },
  {
    element: <AuthLayout />,
    children: [
${authPages.map(p => `      { path: ROUTES.${p.route}, element: <${p.name} /> }`).join(',\n')}
    ]
  },
  {
    element: <DashboardLayout />,
    children: [
${dashboardPages.map(p => `      { path: ROUTES.${p.route}, element: <${p.name} /> }`).join(',\n')}
    ]
  },
  {
    element: <SystemLayout />,
    children: [
${systemPages.map(p => `      { path: ROUTES.${p.route}, element: <${p.name} /> }`).join(',\n')}
    ]
  }
]);
`;

fs.writeFileSync(path.join(process.cwd(), 'src/routes/index.tsx'), imports + routesStr);
console.log('Router generated.');
