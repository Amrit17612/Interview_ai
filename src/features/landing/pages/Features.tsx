import { Container } from '../../../components/ui/Container';
import { Target, MessageSquareText, FileText, CheckCircle2, Star, Sparkles, Building, Code2, LineChart, Lock } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { MOCK_DOMAIN_BUNDLES, MOCK_COMPANY_BUNDLES } from '../../../types/bundle.types';

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
          
          {/* Resume Analysis */}
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
            
            {/* Resume Analysis Preview */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg relative">
              <div className="absolute -top-3 -right-3 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                Sample Analysis
              </div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Frontend_Resume_v2.pdf</h3>
                    <p className="text-xs text-gray-500">Structure: Strong</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">Good</div>
                  <div className="text-xs text-gray-500">Overall Match</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills Detected</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">React</span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">TypeScript</span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">Node.js</span>
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200">+4 more</span>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Actionable Suggestion
                  </h4>
                  <p className="text-sm text-amber-900">
                    Consider adding measurable outcomes (e.g., "improved performance by 20%") to your experience descriptions to improve impact visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Targeted Practice Packs */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            
            {/* Domain Packs Preview */}
            <div className="order-2 md:order-1 relative">
               <div className="absolute -top-3 -left-3 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-20">
                Illustrative Preview
              </div>
              <div className="grid gap-4 relative z-10">
                {[MOCK_DOMAIN_BUNDLES[0], MOCK_COMPANY_BUNDLES[0]].map((bundle, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                      {bundle.type === 'company' ? <Building className="w-6 h-6 text-brand-600" /> : <Code2 className="w-6 h-6 text-brand-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{bundle.category}</span>
                        {bundle.isPopular && (
                          <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold">POPULAR</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">{bundle.name}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{bundle.description}</p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <div className="text-xs font-medium text-gray-900">{bundle.interviewsCount} Modules</div>
                      <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 mt-1">Explore</button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Background decorative element */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-50 to-indigo-50 rounded-3xl -z-10 translate-x-4 translate-y-4"></div>
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

          {/* AI Feedback & Roadmaps */}
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
            
            {/* Feedback & Roadmap Preview */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg relative">
               <div className="absolute -top-3 -right-3 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                Sample Feedback
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Category Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Technical Understanding</span>
                      <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">Strong</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Answer Structure</span>
                      <span className="font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">Improving</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Communication Clarity</span>
                      <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">Focus Area</span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-1.5 rounded-lg shrink-0">
                      <LineChart className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Next Priority Focus</h4>
                      <p className="text-sm text-indigo-800">
                        Work on explaining your problem-solving approach clearly before diving into implementation details.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center"><CheckCircle2 className="w-3 h-3"/></div>
                     <div className="h-0.5 flex-1 bg-green-500"></div>
                     <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-sm ring-2 ring-brand-100"><Star className="w-3 h-3 fill-current"/></div>
                     <div className="h-0.5 flex-1 bg-gray-200"></div>
                     <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center"><Lock className="w-3 h-3"/></div>
                   </div>
                   <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-500 px-1">
                     <span>Fundam.</span>
                     <span className="text-brand-600">System Des.</span>
                     <span>Mocks</span>
                   </div>
                </div>

              </div>
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
