import { Container } from '../../../components/ui/Container';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { MOCK_DOMAIN_BUNDLES } from '../../../types/bundle.types';
import { Code2, ChevronRight, Star } from 'lucide-react';

export function InterviewDomains() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30">
      <section className="pt-24 pb-16 bg-white border-b border-gray-100">
        <Container className="max-w-3xl">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
            <Code2 className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Interview Domains</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Targeted preparation for specific technical and behavioral domains. Practice with the specialized concepts they actually test for.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_DOMAIN_BUNDLES.map(bundle => (
              <div key={bundle.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col group relative overflow-hidden">
                {bundle.isPopular && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold text-white bg-brand-600 px-2 py-1 uppercase tracking-wider rounded-md">
                    <Star className="w-3 h-3 fill-current" /> Popular
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Code2 className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
                <p className="text-sm text-gray-500 mb-6 flex-grow">{bundle.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{bundle.interviewsCount} Modules</span>
                  <NavLink 
                    to={ROUTES.EXPLORE_PACK_DETAILS.replace(':id', bundle.id)} 
                    className="text-gray-400 group-hover:text-brand-600 transition-colors flex items-center text-sm font-semibold gap-1"
                  >
                    Explore <ChevronRight className="w-4 h-4" />
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
