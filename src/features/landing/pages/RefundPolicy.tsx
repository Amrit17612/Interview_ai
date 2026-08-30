import { Container } from '../../../components/ui/Container';

export function RefundPolicy() {
  const currentData = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="pt-24 pb-16 bg-gray-50 border-b border-gray-100">
        <Container className="max-w-3xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Refund Policy</h1>
          <p className="text-xl text-gray-600">Effective Date: {currentData}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-3xl">
          <div className="prose prose-lg text-gray-600 max-w-none">
            
            <p className="mt-8 mb-8 text-xl text-gray-800 font-medium">
              We aim to provide the highest quality interview preparation experience. This policy explains our approach to refunds.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 mb-12">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Current Platform Status</h3>
              <p className="text-gray-600 mb-0">
                Interviu AI is currently in early access. If paid subscription plans or one-time bundle purchases are not actively being billed to your account, this policy does not yet apply to you.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. General Refund Terms</h2>
            <p>
              If and when paid services (such as premium company packs or subscription tiers) are available and purchased, we handle refunds on a case-by-case basis. Because our platform immediately grants access to digital AI resources and compute-intensive processing, we generally do not offer refunds for services that have already been used or consumed.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Technical Issues</h2>
            <p>
              If you experience a critical technical issue that prevents you from accessing the platform or utilizing a purchased preparation pack, and our support team is unable to resolve it, you may be eligible for a refund.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Requesting a Refund</h2>
            <p>
              To request a refund for a paid service, please contact us within 7 days of the transaction. You must include your account email, a description of the purchase, and the reason for the request.
            </p>
            <p>
              Please send requests to: <a href="mailto:interviuai.official@gmail.com" className="text-brand-600 hover:underline">interviuai.official@gmail.com</a>
            </p>

          </div>
        </Container>
      </section>
    </div>
  );
}