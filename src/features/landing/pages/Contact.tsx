import { Container } from '../../../components/ui/Container';
import { Mail, MessageSquare, AlertCircle } from 'lucide-react';

export function Contact() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gray-50 border-b border-gray-100">
        <Container className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Contact Us</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Have a question, feedback, or need support? We're here to help.
          </p>
        </Container>
      </section>

      {/* Support Categories */}
      <section className="py-24">
        <Container className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Product Questions</h3>
              <p className="text-sm text-gray-600">Curious about how Interviu AI can help you prepare?</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Technical Support</h3>
              <p className="text-sm text-gray-600">Need help with your account or experiencing an issue?</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Feedback</h3>
              <p className="text-sm text-gray-600">Have suggestions to improve the platform?</p>
            </div>

          </div>

          <div className="bg-gray-50 rounded-3xl p-10 border border-gray-200 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in touch</h2>
            <p className="text-gray-600 mb-8">
              For all inquiries, please reach out to our official support email. We aim to respond to all messages as quickly as possible.
            </p>
            <a 
              href="mailto:interviuai.official@gmail.com"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors text-lg"
            >
              <Mail className="w-5 h-5 mr-3" /> interviuai.official@gmail.com
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
}