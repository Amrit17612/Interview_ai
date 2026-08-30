import { useMemo } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { ArrowLeft, CheckCircle2, Building2, Code2, Star, Play, Settings } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import { MOCK_COMPANY_BUNDLES, MOCK_DOMAIN_BUNDLES } from '../../../types/bundle.types';

export function ExplorePackDetails() {
  const { id } = useParams<{ id: string }>();

  const bundle = useMemo(() => {
    return [...MOCK_COMPANY_BUNDLES, ...MOCK_DOMAIN_BUNDLES].find(b => b.id === id);
  }, [id]);

  if (!bundle) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50/30">
        <Container className="py-24 text-center">
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🤔</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pack not found</h2>
            <p className="text-gray-600 mb-8">The preparation pack you're looking for doesn't exist or has been removed.</p>
            <NavLink
              to={ROUTES.EXPLORE_PACKS}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Explore
            </NavLink>
          </div>
        </Container>
      </div>
    );
  }

  const isFrontend = bundle.id.includes('frontend');
  const isBackend = bundle.id.includes('backend');
  const isData = bundle.id.includes('data');
  
  let accentColor = 'bg-gray-50 text-gray-600 border-gray-200';
  let Icon = Building2;
  
  if (bundle.type === 'domain') {
    Icon = Code2;
    if (isFrontend) accentColor = 'bg-blue-50 text-blue-600 border-blue-200';
    else if (isBackend) accentColor = 'bg-indigo-50 text-indigo-600 border-indigo-200';
    else if (isData) accentColor = 'bg-orange-50 text-orange-600 border-orange-200';
    else accentColor = 'bg-brand-50 text-brand-600 border-brand-200';
  } else {
    accentColor = 'bg-blue-50 text-blue-600 border-blue-200';
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30">
      <Container className="py-8 md:py-12">
        <NavLink 
          to={ROUTES.EXPLORE_PACKS}
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Explore Packs
        </NavLink>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main Content (Left) */}
          <div className="flex-1 space-y-10">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-brand-600 font-bold tracking-wider text-xs uppercase px-2.5 py-1 bg-brand-50 rounded-md">
                  {bundle.category}
                </span>
                {bundle.isPopular && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-brand-600 px-2.5 py-1 uppercase tracking-wider rounded-full shadow-sm">
                    <Star className="w-3 h-3 fill-current" /> Popular
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
                {bundle.name}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {bundle.description}
              </p>
            </div>

            {/* About / Features */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-brand-600" /> What you'll practice
              </h2>
              <ul className="space-y-4">
                {bundle.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                    <span className="text-lg text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Details */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pack overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Modules</p>
                  <p className="text-lg font-medium text-gray-900">{bundle.interviewsCount} preparation modules</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Role</p>
                  <p className="text-lg font-medium text-gray-900">{bundle.interviewConfig.role}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Difficulty</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">{bundle.interviewConfig.difficulty?.toLowerCase() || 'Intermediate'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Module Types</p>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {bundle.interviewConfig.allowedTypes.map(type => (
                      <span key={type} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md capitalize">
                        {type.replace('_', ' ').toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Sticky Action (Right) */}
          <div className="lg:w-[380px] shrink-0">
            <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${accentColor}`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
              <p className="text-gray-500 mb-6 font-medium">Includes {bundle.interviewsCount} preparation modules.</p>
              
              <NavLink 
                to={ROUTES.REGISTER}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors shadow-sm"
              >
                Sign in to start preparing <Play className="w-5 h-5 fill-current" />
              </NavLink>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                Access is managed via the secure dashboard.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
