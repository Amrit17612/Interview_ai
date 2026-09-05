import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ROUTES } from '../constants/routes';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { SystemLayout } from '../layouts/SystemLayout';
import { Spinner } from '../components/ui/Spinner';
import { InterviewProvider } from '../features/interview/context/InterviewContext';

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
import { Features } from '../features/landing/pages/Features';
import { Pricing } from '../features/landing/pages/Pricing';
import { InterviewDomains } from '../features/landing/pages/InterviewDomains';
import { CompanyPrep } from '../features/landing/pages/CompanyPrep';
import { Roadmap } from '../features/landing/pages/Roadmap';
import { Contact } from '../features/landing/pages/Contact';
import { AboutUs } from '../features/landing/pages/AboutUs';
import { FAQ } from '../features/landing/pages/FAQ';
import { PrivacyPolicy } from '../features/landing/pages/PrivacyPolicy';
import { TermsOfService } from '../features/landing/pages/TermsOfService';
import { RefundPolicy } from '../features/landing/pages/RefundPolicy';
import { CookiePolicy } from '../features/landing/pages/CookiePolicy';
const ExplorePacks = Loadable(lazy(() => import('../features/landing/pages/ExplorePacks').then(m => ({ default: m.ExplorePacks }))));
const ExplorePackDetails = Loadable(lazy(() => import('../features/landing/pages/ExplorePackDetails').then(m => ({ default: m.ExplorePackDetails }))));
import { AdminFeedback } from '../features/admin/pages/AdminFeedback';
import { AdminFeedbackDetail } from '../features/admin/pages/AdminFeedbackDetail';
import { Login } from '../features/auth/pages/Login';
import { Register } from '../features/auth/pages/Register';
import { ForgotPassword } from '../features/auth/pages/ForgotPassword';
import { ResetPassword } from '../features/auth/pages/ResetPassword';
import { ExclusiveWaitingRoom } from '../features/interview/pages/ExclusiveWaitingRoom';
import { VerifyEmail } from '../features/auth/pages/VerifyEmail';
import { DashboardHome } from '../features/dashboard/pages/DashboardHome';
import { InterviewHome } from '../features/interview/pages/InterviewHome';
import { Feedback } from '../features/interview/pages/Feedback';

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
const ExclusiveInterviews = Loadable(lazy(() => import('../features/interview/pages/ExclusiveInterviews').then(m => ({ default: m.ExclusiveInterviews }))));

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
const MyPurchases = Loadable(lazy(() => import('../features/premium/pages/MyPurchases').then(m => ({ default: m.MyPurchases }))));
const BundlePractice = Loadable(lazy(() => import('../features/premium/pages/BundlePractice').then(m => ({ default: m.BundlePractice }))));
const Wallet = Loadable(lazy(() => import('../features/premium/pages/Wallet').then(m => ({ default: m.Wallet }))));

// Analytics & Progress
const ReportsAnalytics = Loadable(lazy(() => import('../features/dashboard/pages/ReportsAnalytics').then(m => ({ default: m.ReportsAnalytics }))));
const LearningRoadmap = Loadable(lazy(() => import('../features/dashboard/pages/LearningRoadmap').then(m => ({ default: m.LearningRoadmap }))));
const Achievements = Loadable(lazy(() => import('../features/dashboard/pages/Achievements').then(m => ({ default: m.Achievements }))));

const UserProfile = Loadable(lazy(() => import('../features/profile/pages/UserProfile').then(m => ({ default: m.UserProfile }))));
import { NotFound } from '../features/system/pages/NotFound';
import { Maintenance } from '../features/system/pages/Maintenance';
import { ComingSoon } from '../features/system/pages/ComingSoon';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { GuestRoute } from './GuestRoute';

// Admin Pages
const AdminDashboard = Loadable(lazy(() => import('../features/admin/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard }))));
const TransactionList = Loadable(lazy(() => import('../features/admin/pages/TransactionList').then(m => ({ default: m.TransactionList }))));
const PromoManagement = Loadable(lazy(() => import('../features/admin/pages/PromoManagement').then(m => ({ default: m.PromoManagement }))));
const UserManagement = Loadable(lazy(() => import('../features/admin/pages/UserManagement').then(m => ({ default: m.UserManagement }))));
const AuditLogs = Loadable(lazy(() => import('../features/admin/pages/AuditLogs').then(m => ({ default: m.AuditLogs }))));
const QuestionLibrary = Loadable(lazy(() => import('../features/admin/pages/QuestionLibrary').then(m => ({ default: m.QuestionLibrary }))));
const QuestionEditor = Loadable(lazy(() => import('../features/admin/pages/QuestionEditor').then(m => ({ default: m.QuestionEditor }))));
const InterviewTemplateLibrary = Loadable(lazy(() => import('../features/admin/pages/InterviewTemplateLibrary').then(m => ({ default: m.InterviewTemplateLibrary }))));
const TemplateBuilder = Loadable(lazy(() => import('../features/admin/pages/TemplateBuilder').then(m => ({ default: m.TemplateBuilder }))));
const AdminSecurityAudit = Loadable(lazy(() => import('../features/admin/pages/AdminSecurityAudit').then(m => ({ default: m.AdminSecurityAudit }))));
const AdminBatchSecurity = Loadable(lazy(() => import('../features/admin/pages/AdminBatchSecurity').then(m => ({ default: m.AdminBatchSecurity }))));
const BatchManagement = Loadable(lazy(() => import('../features/admin/pages/BatchManagement').then(m => ({ default: m.BatchManagement }))));
const BatchDetail = Loadable(lazy(() => import('../features/admin/pages/BatchDetail').then(m => ({ default: m.BatchDetail }))));

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.HOME, element: <Home /> },
      { path: ROUTES.FEATURES, element: <Features /> },
      { path: ROUTES.INTERVIEW_DOMAINS, element: <InterviewDomains /> },
      { path: ROUTES.COMPANY_PREP_PUBLIC, element: <CompanyPrep /> },
      { path: ROUTES.ROADMAP_PUBLIC, element: <Roadmap /> },
      { path: ROUTES.EXPLORE_PACKS, element: <ExplorePacks /> },
      { path: ROUTES.EXPLORE_PACK_DETAILS, element: <ExplorePackDetails /> },
      { path: ROUTES.PRICING, element: <Pricing /> },
      { path: ROUTES.CONTACT, element: <Contact /> },
      { path: ROUTES.ABOUT, element: <AboutUs /> },
      { path: ROUTES.FAQ, element: <FAQ /> },
      { path: ROUTES.PRIVACY_POLICY, element: <PrivacyPolicy /> },
      { path: ROUTES.TERMS, element: <TermsOfService /> },
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
        element: (
          <InterviewProvider>
            <Outlet />
          </InterviewProvider>
        ),
        children: [
          {
            element: <DashboardLayout />,
            children: [
      { path: ROUTES.DASHBOARD, element: <DashboardHome /> },
      { path: ROUTES.INTERVIEW, element: <InterviewHome /> },
      { path: ROUTES.EXCLUSIVE_INTERVIEWS, element: <ExclusiveInterviews /> },
      { path: ROUTES.INTERVIEW_RESUME, element: <ResumeSelection /> },
      { path: ROUTES.INTERVIEW_DOMAIN, element: <DomainSelection /> },
      { path: ROUTES.INTERVIEW_COMPANY, element: <CompanySelection /> },
      { path: ROUTES.INTERVIEW_DIFFICULTY, element: <DifficultySelection /> },
      { path: ROUTES.INTERVIEW_TYPE, element: <InterviewType /> },
      { path: ROUTES.INTERVIEW_INSTRUCTIONS, element: <InterviewInstructions /> },
      { path: ROUTES.INTERVIEW_REPORT, element: <FinalReport /> },
      { path: ROUTES.INTERVIEW_REPORT_DETAILS, element: <ReportDetails /> },
      { path: ROUTES.INTERVIEW_FEEDBACK, element: <Feedback /> },
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
      { path: ROUTES.MY_PURCHASES, element: <MyPurchases /> },
      { path: ROUTES.COMPANY_PACK_DETAILS, element: <BundlePractice /> },
      { path: ROUTES.COMPANY_PACK_READINESS, element: <ComingSoon /> },
      { path: ROUTES.DOMAIN_PACKS, element: <DomainBundles /> },
      { path: ROUTES.DOMAIN_PACK_DETAILS, element: <BundlePractice /> },
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
      { path: ROUTES.CREDITS, element: <Wallet /> },
      { path: ROUTES.CREDITS_REFERRAL, element: <ComingSoon /> },
      { path: ROUTES.INTERVIEW_WAITING, element: <ExclusiveWaitingRoom /> }
        ]
      },
      { path: ROUTES.INTERVIEW_DEVICE_CHECK, element: <DeviceCheck /> },
      { path: ROUTES.INTERVIEW_ACTIVE, element: <ActiveInterview /> },
      { path: ROUTES.INTERVIEW_PROCESSING, element: <AIProcessing /> }
        ]
      }
    ]
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: ROUTES.ADMIN, element: <Navigate to={ROUTES.ADMIN_DASHBOARD} replace /> },
          { path: ROUTES.ADMIN_DASHBOARD, element: <AdminDashboard /> },
          { path: ROUTES.ADMIN_PAYMENTS, element: <TransactionList /> },
          { path: '/admin/promos', element: <PromoManagement /> },
          { path: ROUTES.ADMIN_USERS, element: <UserManagement /> },
          { path: ROUTES.ADMIN_AUDIT_LOGS, element: <AuditLogs /> },
          { path: ROUTES.ADMIN_FEEDBACK, element: <AdminFeedback /> },
          { path: `${ROUTES.ADMIN_FEEDBACK}/:id`, element: <AdminFeedbackDetail /> },
          { path: ROUTES.ADMIN_QUESTIONS, element: <QuestionLibrary /> },
          { path: ROUTES.ADMIN_QUESTIONS_NEW, element: <QuestionEditor /> },
          { path: ROUTES.ADMIN_QUESTIONS_EDIT, element: <QuestionEditor /> },
          { path: ROUTES.ADMIN_TEMPLATES, element: <InterviewTemplateLibrary /> },
          { path: ROUTES.ADMIN_TEMPLATES_NEW, element: <TemplateBuilder /> },
          { path: ROUTES.ADMIN_TEMPLATES_EDIT, element: <TemplateBuilder /> },
          { path: '/admin/security/session/:id', element: <AdminSecurityAudit /> },
          { path: '/admin/security/batch/:id', element: <AdminBatchSecurity /> },
          { path: '/admin/batches', element: <BatchManagement /> },
          { path: '/admin/batches/:id', element: <BatchDetail /> }
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
