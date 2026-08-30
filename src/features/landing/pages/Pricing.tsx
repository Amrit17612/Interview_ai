import { Container } from '../../../components/ui/Container';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { CheckCircle2 } from 'lucide-react';

export function Pricing() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gray-50 border-b border-gray-100">
        <Container className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Simple access. Serious preparation.</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Create an account to unlock personalized roadmaps, detailed interview feedback, and targeted preparation packs. Pricing details will be available as subscription plans are finalized.
          </p>
        </Container>
      </section>

      {/* Access Overview */}
      <section className="py-24">
        <Container className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">What's included in early access?</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">Explore domain and company packs publicly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">Resume intelligence and ATS scoring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">AI-powered technical and behavioral mock interviews</span>
                  </li>
                </ul>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">Personalized improvement roadmaps based on performance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">Granular feedback on communication and structure</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-bold text-gray-900">Start preparing today</h3>
                  <p className="text-sm text-gray-600 mt-1">Create your account to access the dashboard and begin targeted practice.</p>
                </div>
                <NavLink 
                  to={ROUTES.REGISTER}
                  className="shrink-0 inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors w-full sm:w-auto"
                >
                  Create your account
                </NavLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}