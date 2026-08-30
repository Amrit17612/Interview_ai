import { Container } from '../../../components/ui/Container';
import { Target, MessageSquareText, TrendingUp } from 'lucide-react';

export function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gray-50 border-b border-gray-100">
        <Container className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">About Interviu AI</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Making interview preparation more structured, actionable, and accessible for students and early-career candidates.
          </p>
        </Container>
      </section>

      {/* Story */}
      <section className="py-24">
        <Container className="max-w-4xl mx-auto">
          <div className="space-y-16">
            
            {/* The Problem */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">The Problem</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Generic interview preparation often lacks structure and actionable feedback. Candidates spend hours practicing generic questions without knowing if their answers meet the structural, technical, or communication standards expected by top companies. 
              </p>
            </div>

            {/* The Approach */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Our Approach</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Interviu AI connects practice, targeted preparation, feedback, and improvement roadmaps into one focused experience.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <Target className="w-6 h-6 text-brand-600 mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Structured Preparation</h3>
                  <p className="text-sm text-gray-600">Targeted practice over random questions.</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <MessageSquareText className="w-6 h-6 text-brand-600 mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Honest Feedback</h3>
                  <p className="text-sm text-gray-600">Actionable critique over generic encouragement.</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <TrendingUp className="w-6 h-6 text-brand-600 mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Real Improvement</h3>
                  <p className="text-sm text-gray-600">Personalized roadmaps over empty metrics.</p>
                </div>
              </div>
            </div>

            {/* Founder */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">The Creator</h2>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-brand-700">AR</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Amrit Raj</h3>
                  <p className="text-gray-600">Creator & Founder, Interviu AI</p>
                </div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mt-6">
                Interviu AI was created by Amrit Raj with the goal of bringing clarity and direction to the technical interview process.
              </p>
            </div>

          </div>
        </Container>
      </section>
    </div>
  );
}
