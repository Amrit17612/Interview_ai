import { Container } from '../../../components/ui/Container';
import { Target, MessageSquareText, FileText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

export function Features() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gray-50 border-b border-gray-100">
        <Container className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Platform Features</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Everything you need to prepare, practice, and perfect your technical and behavioral interviews.
          </p>
        </Container>
      </section>

      {/* Core Features */}
      <section className="py-24">
        <Container>
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-brand-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Resume & ATS Intelligence</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Start by analyzing your resume against industry standards. Identify missing keywords, structural issues, and get actionable suggestions before you even begin practicing.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 h-64 flex items-center justify-center">
              <span className="text-gray-400 font-medium">Resume Analysis Preview</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1 bg-gray-50 rounded-2xl p-8 border border-gray-100 h-64 flex items-center justify-center">
              <span className="text-gray-400 font-medium">Domain Packs Preview</span>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Targeted Practice Packs</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Practice with specific Domain (Frontend, Backend, Data) and Company-focused preparation packs. Don't practice generic questions when you can practice exactly what they test.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <MessageSquareText className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Actionable AI Feedback</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Receive detailed breakdowns of your responses. Understand your technical accuracy, communication clarity, and structural delivery, complete with a personalized roadmap for improvement.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 h-64 flex items-center justify-center">
              <span className="text-gray-400 font-medium">Feedback & Roadmap Preview</span>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <Container className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to start?</h2>
          <p className="text-lg text-gray-600 mb-8">Join and start your targeted preparation journey today.</p>
          <NavLink 
            to={ROUTES.REGISTER}
            className="inline-flex items-center justify-center px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            Create an Account
          </NavLink>
        </Container>
      </section>
    </div>
  );
}
