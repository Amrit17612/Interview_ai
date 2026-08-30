import { Container } from '../../../components/ui/Container';

export function TermsOfService() {
  const currentData = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="pt-24 pb-16 bg-gray-50 border-b border-gray-100">
        <Container className="max-w-3xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Terms of Service</h1>
          <p className="text-xl text-gray-600">Effective Date: {currentData}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-3xl">
          <div className="prose prose-lg text-gray-600 max-w-none">
            
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Acceptance of Terms</h2>
            <p>
              By creating an account or accessing Interviu AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years old, or the age of legal majority in your jurisdiction, to create an account and use the services. 
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and current information when registering.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Acceptable Use</h2>
            <p>
              You agree to use Interviu AI only for your personal interview preparation. You may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Reverse engineer, decompile, or attempt to extract the source code or underlying AI models of the platform.</li>
              <li>Submit malicious code, spam, or abusive content into the interview interfaces.</li>
              <li>Use the platform to generate content for illegal or unauthorized purposes.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. AI-Generated Content Limitations</h2>
            <p>
              Interviu AI utilizes artificial intelligence to provide feedback and roadmaps. While we strive for accuracy, AI-generated feedback is provided for educational purposes only and may occasionally contain inaccuracies. You should independently verify technical concepts.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. No Guarantee of Outcomes</h2>
            <p>
              Interviu AI is a preparation tool. We do not guarantee that using the platform will result in job offers, successful interviews, or employment of any kind.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Intellectual Property</h2>
            <p>
              All platform design, functionality, domain packs, and proprietary text are owned by Interviu AI. You retain ownership of the personal data and resumes you submit.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Interviu AI shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use or inability to use the service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Service Changes and Termination</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the service at any time. We may also terminate or suspend your access immediately if you violate these terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">10. Contact Information</h2>
            <p>
              For questions regarding these terms, contact: <a href="mailto:interviuai.official@gmail.com" className="text-brand-600 hover:underline">interviuai.official@gmail.com</a>
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
