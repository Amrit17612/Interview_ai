import { Container } from '../../../components/ui/Container';

export function CookiePolicy() {
  const currentData = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="pt-24 pb-16 bg-gray-50 border-b border-gray-100">
        <Container className="max-w-3xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Cookie Policy</h1>
          <p className="text-xl text-gray-600">Effective Date: {currentData}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-3xl">
          <div className="prose prose-lg text-gray-600 max-w-none">
            
            <p className="mt-8 mb-8 text-xl text-gray-800 font-medium">
              Interviu AI uses cookies and similar technologies to ensure the basic functionality of the platform. We believe in being transparent about how we store data on your device.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. What are cookies?</h2>
            <p>
              Cookies are small text files that are stored on your browser or device by websites, apps, and online media. They help us remember your preferences and keep your session secure.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. How we use cookies</h2>
            <p>
              Currently, Interviu AI uses cookies strictly for essential functional purposes. We do not use third-party advertising or invasive tracking cookies.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>Authentication (Essential):</strong> We use secure tokens (stored in cookies or local storage) to keep you logged in and ensure that your dashboard and interview data remain private.</li>
              <li><strong>Security (Essential):</strong> We use storage to prevent CSRF attacks and maintain the integrity of your session.</li>
              <li><strong>Preferences (Functional):</strong> We may store basic preferences (such as your progress state in an ongoing interview module) locally to improve your experience.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Third-Party Analytics</h2>
            <p>
              If we introduce anonymous usage analytics in the future to improve the platform, this policy will be updated. Currently, our storage is focused entirely on providing the core preparation service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Managing your cookies</h2>
            <p>
              You can control or delete cookies through your browser settings. However, please note that disabling essential cookies will prevent you from logging in or using the protected features of the Interviu AI platform.
            </p>

          </div>
        </Container>
      </section>
    </div>
  );
}