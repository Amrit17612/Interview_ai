const fs = require('fs');
const path = require('path');

const pages = [
  // Public
  { path: 'src/features/landing/pages/Home.tsx', name: 'Home' },
  { path: 'src/features/landing/pages/Pricing.tsx', name: 'Pricing' },
  { path: 'src/features/landing/pages/Contact.tsx', name: 'Contact' },
  { path: 'src/features/landing/pages/About.tsx', name: 'About' },
  { path: 'src/features/landing/pages/FAQ.tsx', name: 'FAQ' },
  { path: 'src/features/landing/pages/PrivacyPolicy.tsx', name: 'PrivacyPolicy' },
  { path: 'src/features/landing/pages/Terms.tsx', name: 'Terms' },
  { path: 'src/features/landing/pages/RefundPolicy.tsx', name: 'RefundPolicy' },
  { path: 'src/features/landing/pages/CookiePolicy.tsx', name: 'CookiePolicy' },
  
  // Auth
  { path: 'src/features/auth/pages/Login.tsx', name: 'Login' },
  { path: 'src/features/auth/pages/Register.tsx', name: 'Register' },
  { path: 'src/features/auth/pages/ForgotPassword.tsx', name: 'ForgotPassword' },
  { path: 'src/features/auth/pages/ResetPassword.tsx', name: 'ResetPassword' },
  { path: 'src/features/auth/pages/VerifyEmail.tsx', name: 'VerifyEmail' },
  
  // Onboarding
  { path: 'src/features/onboarding/pages/Welcome.tsx', name: 'Welcome' },
  { path: 'src/features/onboarding/pages/ProfileSetup.tsx', name: 'ProfileSetup' },
  { path: 'src/features/onboarding/pages/CareerGoal.tsx', name: 'CareerGoal' },
  { path: 'src/features/onboarding/pages/SkillSelection.tsx', name: 'SkillSelection' },

  // Dashboard
  { path: 'src/features/dashboard/pages/DashboardHome.tsx', name: 'DashboardHome' },

  // Interview
  { path: 'src/features/interview/pages/InterviewHome.tsx', name: 'InterviewHome' },
  { path: 'src/features/interview/pages/DeviceCheck.tsx', name: 'DeviceCheck' },
  { path: 'src/features/interview/pages/ResumeSelection.tsx', name: 'ResumeSelection' },
  { path: 'src/features/interview/pages/DomainSelection.tsx', name: 'DomainSelection' },
  { path: 'src/features/interview/pages/CompanySelection.tsx', name: 'CompanySelection' },
  { path: 'src/features/interview/pages/DifficultySelection.tsx', name: 'DifficultySelection' },
  { path: 'src/features/interview/pages/InterviewType.tsx', name: 'InterviewType' },
  { path: 'src/features/interview/pages/InterviewInstructions.tsx', name: 'InterviewInstructions' },
  { path: 'src/features/interview/pages/ActiveInterview.tsx', name: 'ActiveInterview' },
  { path: 'src/features/interview/pages/AIProcessing.tsx', name: 'AIProcessing' },
  { path: 'src/features/interview/pages/FinalReport.tsx', name: 'FinalReport' },
  { path: 'src/features/interview/pages/ReportDetails.tsx', name: 'ReportDetails' },
  { path: 'src/features/interview/pages/InterviewHistory.tsx', name: 'InterviewHistory' },

  // Resume
  { path: 'src/features/resume/pages/ResumeDashboard.tsx', name: 'ResumeDashboard' },
  { path: 'src/features/resume/pages/UploadResume.tsx', name: 'UploadResume' },
  { path: 'src/features/resume/pages/ResumeAnalysis.tsx', name: 'ResumeAnalysis' },
  { path: 'src/features/resume/pages/ResumeScore.tsx', name: 'ResumeScore' },
  { path: 'src/features/resume/pages/ResumeSuggestions.tsx', name: 'ResumeSuggestions' },
  { path: 'src/features/resume/pages/ResumeHistory.tsx', name: 'ResumeHistory' },
  { path: 'src/features/resume/pages/ResumeVersions.tsx', name: 'ResumeVersions' },

  // ATS
  { path: 'src/features/ats/pages/ATSDashboard.tsx', name: 'ATSDashboard' },
  { path: 'src/features/ats/pages/ATSScore.tsx', name: 'ATSScore' },
  { path: 'src/features/ats/pages/ATSSuggestions.tsx', name: 'ATSSuggestions' },

  // Company Packs
  { path: 'src/features/company-packs/pages/CompanyPacksHome.tsx', name: 'CompanyPacksHome' },
  { path: 'src/features/company-packs/pages/CompanyPackDetails.tsx', name: 'CompanyPackDetails' },
  { path: 'src/features/company-packs/pages/CompanyReadiness.tsx', name: 'CompanyReadiness' },

  // Domain Packs
  { path: 'src/features/domain-packs/pages/DomainHome.tsx', name: 'DomainHome' },
  { path: 'src/features/domain-packs/pages/DomainDetails.tsx', name: 'DomainDetails' },

  // Learning
  { path: 'src/features/learning/pages/LearningDashboard.tsx', name: 'LearningDashboard' },
  { path: 'src/features/learning/pages/PersonalizedRoadmap.tsx', name: 'PersonalizedRoadmap' },
  { path: 'src/features/learning/pages/SkillProgress.tsx', name: 'SkillProgress' },

  // Progress
  { path: 'src/features/progress/pages/OverallProgress.tsx', name: 'OverallProgress' },
  { path: 'src/features/progress/pages/InterviewAnalytics.tsx', name: 'InterviewAnalytics' },
  { path: 'src/features/progress/pages/PerformanceHistory.tsx', name: 'PerformanceHistory' },

  // Achievements
  { path: 'src/features/achievements/pages/AchievementsHome.tsx', name: 'AchievementsHome' },
  { path: 'src/features/achievements/pages/Badges.tsx', name: 'Badges' },

  // Profile
  { path: 'src/features/profile/pages/UserProfile.tsx', name: 'UserProfile' },
  { path: 'src/features/profile/pages/EditProfile.tsx', name: 'EditProfile' },

  // Settings
  { path: 'src/features/settings/pages/GeneralSettings.tsx', name: 'GeneralSettings' },
  { path: 'src/features/settings/pages/AccountSettings.tsx', name: 'AccountSettings' },
  { path: 'src/features/settings/pages/NotificationsSettings.tsx', name: 'NotificationsSettings' },
  { path: 'src/features/settings/pages/PreferencesSettings.tsx', name: 'PreferencesSettings' },

  // Privacy
  { path: 'src/features/privacy/pages/PrivacyCenter.tsx', name: 'PrivacyCenter' },
  { path: 'src/features/privacy/pages/SecuritySettings.tsx', name: 'SecuritySettings' },

  // Support
  { path: 'src/features/support/pages/HelpCenter.tsx', name: 'HelpCenter' },
  { path: 'src/features/support/pages/ContactSupport.tsx', name: 'ContactSupport' },
  { path: 'src/features/support/pages/Feedback.tsx', name: 'Feedback' },
  { path: 'src/features/support/pages/ReportBug.tsx', name: 'ReportBug' },

  // Credits
  { path: 'src/features/credits/pages/CreditsHome.tsx', name: 'CreditsHome' },
  { path: 'src/features/credits/pages/ReferralProgram.tsx', name: 'ReferralProgram' },

  // System
  { path: 'src/features/system/pages/NotFound.tsx', name: 'NotFound' },
  { path: 'src/features/system/pages/Maintenance.tsx', name: 'Maintenance' },
  { path: 'src/features/system/pages/ComingSoon.tsx', name: 'ComingSoon' }
];

function generateContent(name) {
  // calculate depth to resolve components
  // Most pages are in src/features/[feature]/pages/[name].tsx
  // So depth is 4 levels deep to src (../..) -> src/components -> ../../../components
  return `
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

export function ${name}() {
  return (
    <Container className="py-8">
      <PageHeader 
        title="${name.replace(/([A-Z])/g, ' $1').trim()}" 
        description="Architecture module for ${name}" 
      />
      <EmptyState 
        title="Pending Implementation" 
        description="This feature will be implemented in a future sprint." 
      />
    </Container>
  );
}
`.trim();
}

pages.forEach(page => {
  const fullPath = path.join(process.cwd(), page.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, generateContent(page.name));
  console.log(`Created ${page.path}`);
});
