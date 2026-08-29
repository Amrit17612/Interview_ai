import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ROUTES } from '../constants/routes';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SystemLayout } from '../layouts/SystemLayout';
import { Spinner } from '../components/ui/Spinner';

const Loadable = (Component: React.ComponentType<any>) => (props: any) => (
  <Suspense fallback={
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Spinner className="h-8 w-8 text-primary" />
    </div>
  }>
    <Component {...props} />
  </Suspense>
);

import { Home } from '../features/landing/pages/Home';
import { Pricing } from '../features/landing/pages/Pricing';
import { Contact } from '../features/landing/pages/Contact';
import { About } from '../features/landing/pages/About';
import { FAQ } from '../features/landing/pages/FAQ';
import { PrivacyPolicy } from '../features/landing/pages/PrivacyPolicy';
import { Terms } from '../features/landing/pages/Terms';
import { RefundPolicy } from '../features/landing/pages/RefundPolicy';
import { CookiePolicy } from '../features/landing/pages/CookiePolicy';
import { Login } from '../features/auth/pages/Login';
import { Register } from '../features/auth/pages/Register';
import { ForgotPassword } from '../features/auth/pages/ForgotPassword';
import { ResetPassword } from '../features/auth/pages/ResetPassword';
import { VerifyEmail } from '../features/auth/pages/VerifyEmail';
import { DashboardHome } from '../features/dashboard/pages/DashboardHome';
import { InterviewHome } from '../features/interview/pages/InterviewHome';

// Lazy load onboarding
const Welcome = Loadable(lazy(() => import('../features/onboarding/pages/Welcome').then(m => ({ default: m.Welcome }))));
const ProfileSetup = Loadable(lazy(() => import('../features/onboarding/pages/ProfileSetup').then(m => ({ default: m.ProfileSetup }))));
const CareerGoal = Loadable(lazy(() => import('../features/onboarding/pages/CareerGoal').then(m => ({ default: m.CareerGoal }))));
const SkillSelection = Loadable(lazy(() => import('../features/onboarding/pages/SkillSelection').then(m => ({ default: m.SkillSelection }))));

// Lazy load interview setup
const DeviceCheck = Loadable(lazy(() => import('../features/interview/pages/DeviceCheck').then(m => ({ default: m.DeviceCheck }))));
const ResumeSelection = Loadable(lazy(() => import('../features/interview/pages/ResumeSelection').then(m => ({ default: m.ResumeSelection }))));
const DomainSelection = Loadable(lazy(() => import('../features/interview/pages/DomainSelection').then(m => ({ default: m.DomainSelection }))));
const CompanySelection = Loadable(lazy(() => import('../features/interview/pages/CompanySelection').then(m => ({ default: m.CompanySelection }))));
const DifficultySelection = Loadable(lazy(() => import('../features/interview/pages/DifficultySelection').then(m => ({ default: m.DifficultySelection }))));
const InterviewType = Loadable(lazy(() => import('../features/interview/pages/InterviewType').then(m => ({ default: m.InterviewType }))));
const InterviewInstructions = Loadable(lazy(() => import('../features/interview/pages/InterviewInstructions').then(m => ({ default: m.InterviewInstructions }))));

// Core active interview remains eager because it's critical path and time-sensitive
import { ActiveInterview } from '../features/interview/pages/ActiveInterview';
import { AIProcessing } from '../features/interview/pages/AIProcessing';

// Lazy-loaded heavy/secondary routes
const FinalReport = Loadable(lazy(() => import('../features/interview/pages/FinalReport').then(m => ({ default: m.FinalReport }))));
const ReportDetails = Loadable(lazy(() => import('../features/interview/pages/ReportDetails').then(m => ({ default: m.ReportDetails }))));
const InterviewHistory = Loadable(lazy(() => import('../features/interview/pages/InterviewHistory').then(m => ({ default: m.InterviewHistory }))));
const InterviewComparison = Loadable(lazy(() => import('../features/interview/pages/InterviewComparison').then(m => ({ default: m.InterviewComparison }))));

const ResumeDashboard = Loadable(lazy(() => import('../features/resume/pages/ResumeDashboard').then(m => ({ default: m.ResumeDashboard }))));
const UploadResume = Loadable(lazy(() => import('../features/resume/pages/UploadResume').then(m => ({ default: m.UploadResume }))));
const ResumeAnalysis = Loadable(lazy(() => import('../features/resume/pages/ResumeAnalysis').then(m => ({ default: m.ResumeAnalysis }))));
const ResumeScore = Loadable(lazy(() => import('../features/resume/pages/ResumeScore').then(m => ({ default: m.ResumeScore }))));
const ResumeSuggestions = Loadable(lazy(() => import('../features/resume/pages/ResumeSuggestions').then(m => ({ default: m.ResumeSuggestions }))));
const ResumeHistory = Loadable(lazy(() => import('../features/resume/pages/ResumeHistory').then(m => ({ default: m.ResumeHistory }))));
const ResumeVersions = Loadable(lazy(() => import('../features/resume/pages/ResumeVersions').then(m => ({ default: m.ResumeVersions }))));

const ATSDashboard = Loadable(lazy(() => import('../features/ats/pages/ATSDashboard').then(m => ({ default: m.ATSDashboard }))));
const JobReadiness = Loadable(lazy(() => import('../features/ats/pages/JobReadiness').then(m => ({ default: m.JobReadiness }))));

// Premium Bundles
const CompanyBundles = Loadable(lazy(() => import('../features/premium/pages/CompanyBundles').then(m => ({ default: m.CompanyBundles }))));
const DomainBundles = Loadable(lazy(() => import('../features/premium/pages/DomainBundles').then(m => ({ default: m.DomainBundles }))));

// Analytics & Progress
const ReportsAnalytics = Loadable(lazy(() => import('../features/dashboard/pages/ReportsAnalytics').then(m => ({ default: m.ReportsAnalytics }))));
const LearningRoadmap = Loadable(lazy(() => import('../features/dashboard/pages/LearningRoadmap').then(m => ({ default: m.LearningRoadmap }))));
const Achievements = Loadable(lazy(() => import('../features/dashboard/pages/Achievements').then(m => ({ default: m.Achievements }))));

const UserProfile = Loadable(lazy(() => import('../features/profile/pages/UserProfile').then(m => ({ default: m.UserProfile }))));
import { NotFound } from '../features/system/pages/NotFound';
import { Maintenance } from '../features/system/pages/Maintenance';
import { ComingSoon } from '../features/system/pages/ComingSoon';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.HOME, element: <Home /> },
      { path: ROUTES.PRICING, element: <Pricing /> },
      { path: ROUTES.CONTACT, element: <Contact /> },
      { path: ROUTES.ABOUT, element: <About /> },
      { path: ROUTES.FAQ, element: <FAQ /> },
      { path: ROUTES.PRIVACY_POLICY, element: <PrivacyPolicy /> },
      { path: ROUTES.TERMS, element: <Terms /> },
      { path: ROUTES.REFUND_POLICY, element: <RefundPolicy /> },
      { path: ROUTES.COOKIE_POLICY, element: <CookiePolicy /> }
    ]
  },
  {
    element: <AuthLayout />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          { path: ROUTES.LOGIN, element: <Login /> },
          { path: ROUTES.REGISTER, element: <Register /> },
          { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPassword /> },
        ]
      },
      // Verify and Reset are accessible whether logged in or not to handle tokens
      { path: ROUTES.RESET_PASSWORD, element: <ResetPassword /> },
      { path: ROUTES.VERIFY_EMAIL, element: <VerifyEmail /> },
      {
        element: <ProtectedRoute requireOnboarding={false} />,
        children: [
          { path: ROUTES.ONBOARDING_WELCOME, element: <Welcome /> },
          { path: ROUTES.ONBOARDING_PROFILE, element: <ProfileSetup /> },
          { path: ROUTES.ONBOARDING_GOAL, element: <CareerGoal /> },
          { path: ROUTES.ONBOARDING_SKILLS, element: <SkillSelection /> }
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute requireOnboarding={true} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
      { path: ROUTES.DASHBOARD, element: <DashboardHome /> },
      { path: ROUTES.INTERVIEW, element: <InterviewHome /> },
      { path: ROUTES.INTERVIEW_DEVICE_CHECK, element: <DeviceCheck /> },
      { path: ROUTES.INTERVIEW_RESUME, element: <ResumeSelection /> },
      { path: ROUTES.INTERVIEW_DOMAIN, element: <DomainSelection /> },
      { path: ROUTES.INTERVIEW_COMPANY, element: <CompanySelection /> },
      { path: ROUTES.INTERVIEW_DIFFICULTY, element: <DifficultySelection /> },
      { path: ROUTES.INTERVIEW_TYPE, element: <InterviewType /> },
      { path: ROUTES.INTERVIEW_INSTRUCTIONS, element: <InterviewInstructions /> },
      { path: ROUTES.INTERVIEW_ACTIVE, element: <ActiveInterview /> },
      { path: ROUTES.INTERVIEW_PROCESSING, element: <AIProcessing /> },
      { path: ROUTES.INTERVIEW_REPORT, element: <FinalReport /> },
      { path: ROUTES.INTERVIEW_REPORT_DETAILS, element: <ReportDetails /> },
      { path: ROUTES.INTERVIEW_HISTORY, element: <InterviewHistory /> },
      { path: ROUTES.INTERVIEW_COMPARE, element: <InterviewComparison /> },
      { path: ROUTES.RESUME, element: <ResumeDashboard /> },
      { path: ROUTES.RESUME_UPLOAD, element: <UploadResume /> },
      { path: ROUTES.RESUME_ANALYSIS, element: <ResumeAnalysis /> },
      { path: ROUTES.RESUME_SCORE, element: <ResumeScore /> },
      { path: ROUTES.RESUME_SUGGESTIONS, element: <ResumeSuggestions /> },
      { path: ROUTES.RESUME_HISTORY, element: <ResumeHistory /> },
      { path: ROUTES.RESUME_VERSIONS, element: <ResumeVersions /> },
      { path: ROUTES.ATS, element: <ATSDashboard /> },
      { path: ROUTES.ATS_DETAILS, element: <JobReadiness /> },
      { path: ROUTES.COMPANY_PACKS, element: <CompanyBundles /> },
      { path: ROUTES.COMPANY_PACK_DETAILS, element: <ComingSoon /> },
      { path: ROUTES.COMPANY_PACK_READINESS, element: <ComingSoon /> },
      { path: ROUTES.DOMAIN_PACKS, element: <DomainBundles /> },
      { path: ROUTES.DOMAIN_PACK_DETAILS, element: <ComingSoon /> },
      { path: ROUTES.LEARNING, element: <ComingSoon /> },
      { path: ROUTES.LEARNING_ROADMAP, element: <LearningRoadmap /> },
      { path: ROUTES.LEARNING_SKILLS, element: <ComingSoon /> },
      { path: ROUTES.PROGRESS, element: <ComingSoon /> },
      { path: ROUTES.PROGRESS_ANALYTICS, element: <ReportsAnalytics /> },
      { path: ROUTES.PROGRESS_HISTORY, element: <ComingSoon /> },
      { path: ROUTES.ACHIEVEMENTS, element: <Achievements /> },
      { path: ROUTES.ACHIEVEMENTS_BADGES, element: <ComingSoon /> },
      { path: ROUTES.PROFILE, element: <UserProfile /> },
      { path: ROUTES.PROFILE_EDIT, element: <ComingSoon /> },
      { path: ROUTES.SETTINGS_GENERAL, element: <ComingSoon /> },
      { path: ROUTES.SETTINGS_ACCOUNT, element: <ComingSoon /> },
      { path: ROUTES.SETTINGS_NOTIFICATIONS, element: <ComingSoon /> },
      { path: ROUTES.SETTINGS_PREFERENCES, element: <ComingSoon /> },
      { path: ROUTES.PRIVACY_CENTER, element: <ComingSoon /> },
      { path: ROUTES.SECURITY_SETTINGS, element: <ComingSoon /> },
      { path: ROUTES.HELP_CENTER, element: <ComingSoon /> },
      { path: ROUTES.CONTACT_SUPPORT, element: <ComingSoon /> },
      { path: ROUTES.FEEDBACK, element: <ComingSoon /> },
      { path: ROUTES.REPORT_BUG, element: <ComingSoon /> },
      { path: ROUTES.CREDITS, element: <ComingSoon /> },
      { path: ROUTES.CREDITS_REFERRAL, element: <ComingSoon /> }
        ]
      }
    ]
  },
  {
    element: <SystemLayout />,
    children: [
      { path: ROUTES.NOT_FOUND, element: <NotFound /> },
      { path: ROUTES.MAINTENANCE, element: <Maintenance /> },
      { path: ROUTES.COMING_SOON, element: <ComingSoon /> }
    ]
  }
]);
