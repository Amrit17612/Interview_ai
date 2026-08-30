import { Container } from '../../../components/ui/Container';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { Target, Map, Brain, CheckCircle2, Lock, Sparkles, TrendingUp } from 'lucide-react';


export function Roadmap() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gray-50 border-b border-gray-100">
        <Container className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-full mb-6">
            <Map className="w-4 h-4" />
            <span className="text-sm font-medium">Personalized Improvement</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Turn interview feedback into a clear next step.
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Interviu AI doesn't just tell you what you did wrong. It builds a structured path to help you master your weak areas before your real interview.
          </p>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-24">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Preparation Journey</h2>
            <p className="text-lg text-gray-600">How we guide you from practice to readiness.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Targeted Practice</h3>
              <p className="text-gray-600">
                Complete mock interviews focused on specific domains or companies to generate baseline performance data.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. AI Analysis</h3>
              <p className="text-gray-600">
                Our engine identifies patterns in your communication, technical accuracy, and structural delivery.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative">
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Focused Growth</h3>
              <p className="text-gray-600">
                Follow a dynamically generated roadmap that prioritizes exactly what you need to improve next.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Roadmap Demo Preview */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <Container className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Dynamic Learning Paths</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                As you practice, the platform unlocks progressive milestones. Focus on one specific improvement area at a time to avoid feeling overwhelmed.
              </p>
              
              <div className="bg-white p-6 rounded-xl border border-brand-100 shadow-sm mt-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-50 p-2 rounded-lg">
                    <Sparkles className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1 block">AI Insight</span>
                    <h4 className="font-medium text-gray-900 mb-1">Your next focus: Structure</h4>
                    <p className="text-sm text-gray-600">
                      Based on your last 3 interviews, try using the STAR method (Situation, Task, Action, Result) to organize your behavioral answers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Illustrative Roadmap</span>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Sample</span>
              </div>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                
                {/* Completed */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-green-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 text-sm">Fundamentals</h3>
                    <p className="text-xs text-gray-500 mt-1">Core concepts verified.</p>
                  </div>
                </div>

                {/* Current */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-500 bg-white text-brand-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    <div className="w-3 h-3 bg-brand-500 rounded-full animate-pulse" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border-2 border-brand-200 bg-white shadow-sm">
                    <h3 className="font-bold text-brand-900 text-sm">Problem Solving</h3>
                    <p className="text-xs text-gray-600 mt-1">Currently focusing on system design patterns.</p>
                  </div>
                </div>

                {/* Upcoming */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-gray-100 text-gray-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white opacity-60">
                    <h3 className="font-semibold text-gray-500 text-sm">Communication</h3>
                    <p className="text-xs text-gray-400 mt-1">Unlocks after consistent technical mastery.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <Container className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Stop guessing what to practice next.</h2>
          <p className="text-lg text-gray-600 mb-8">Join Interviu AI and let data drive your interview preparation.</p>
          <NavLink 
            to={ROUTES.REGISTER}
            className="inline-flex items-center justify-center px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            Create your account and start preparing
          </NavLink>
        </Container>
      </section>
    </div>
  );
}
