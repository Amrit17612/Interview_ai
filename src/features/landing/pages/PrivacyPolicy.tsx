import { Container } from '../../../components/ui/Container';

export function PrivacyPolicy() {
  const currentData = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="pt-24 pb-16 bg-gray-50 border-b border-gray-100">
        <Container className="max-w-3xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Privacy Policy</h1>
          <p className="text-xl text-gray-600">Effective Date: {currentData}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-3xl">
          <div className="prose prose-lg text-gray-600 max-w-none">
            
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Information We Collect</h2>
            <p>
              When you use Interviu AI, we collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>Account Information:</strong> Your name, email address, and authentication credentials when you register.</li>
              <li><strong>Interview Inputs:</strong> Text and data you submit during mock interviews or practice sessions.</li>
              <li><strong>Resume Data:</strong> Resumes or professional summaries you upload for ATS scoring and analysis.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. How We Use Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Provide, maintain, and improve the Interviu AI platform.</li>
              <li>Analyze your interview performance to generate AI-powered feedback and personalized roadmaps.</li>
              <li>Process resume data to provide structural feedback.</li>
              <li>Communicate with you regarding your account, updates, and support inquiries.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Sharing and Service Providers</h2>
            <p>
              We do not sell your personal information. We may share information with trusted third-party service providers (such as AI processing APIs and secure hosting platforms) strictly for the purpose of operating the platform and delivering features to you. These providers are bound by confidentiality obligations.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Data Security</h2>
            <p>
              We implement reasonable administrative and technical measures to protect your personal data against unauthorized access or loss. However, no internet transmission is entirely secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Data Retention</h2>
            <p>
              We retain your account information, interview history, and roadmaps as long as your account is active, to provide a continuous learning experience. You may request deletion of your account and associated data by contacting support.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Your Choices</h2>
            <p>
              You can access, update, or correct your account information at any time through your dashboard profile settings.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Policy Updates</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make significant changes, we will notify you through the platform or via email prior to the changes taking effect.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:interviuai.official@gmail.com" className="text-brand-600 hover:underline">interviuai.official@gmail.com</a>
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}