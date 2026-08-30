import { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { Search, Code2, Building2, Star, ChevronRight, FilterX } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import { MOCK_COMPANY_BUNDLES, MOCK_DOMAIN_BUNDLES } from '../../../types/bundle.types';

type FilterType = 'ALL' | 'COMPANY' | 'DOMAIN' | 'POPULAR';

export function ExplorePacks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const allBundles = useMemo(() => {
    return [...MOCK_COMPANY_BUNDLES, ...MOCK_DOMAIN_BUNDLES];
  }, []);

  const stats = useMemo(() => {
    return {
      total: allBundles.length,
      company: MOCK_COMPANY_BUNDLES.length,
      domain: MOCK_DOMAIN_BUNDLES.length,
      popular: allBundles.filter(b => b.isPopular).length
    };
  }, [allBundles]);

  const filteredBundles = useMemo(() => {
    return allBundles.filter(bundle => {
      // 1. Filter by search query
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        bundle.name.toLowerCase().includes(query) ||
        bundle.description.toLowerCase().includes(query) ||
        bundle.category.toLowerCase().includes(query) ||
        (bundle.interviewConfig.company?.toLowerCase() || '').includes(query) ||
        bundle.interviewConfig.domain.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // 2. Filter by tab
      switch (activeFilter) {
        case 'COMPANY': return bundle.type === 'company';
        case 'DOMAIN': return bundle.type === 'domain';
        case 'POPULAR': return bundle.isPopular === true;
        case 'ALL':
        default:
          return true;
      }
    });
  }, [allBundles, searchQuery, activeFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveFilter('ALL');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30">
      <Container className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-brand-600 font-semibold tracking-wider text-sm uppercase mb-3 block">Targeted Preparation</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Find the right pack for your next interview.
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Explore domain-specific and company-focused preparation packs built around the skills and patterns that matter in real interviews.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-gray-900 mb-1">{stats.total}+</p>
            <p className="text-sm font-medium text-gray-500">Available Packs</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-gray-900 mb-1">{stats.company}</p>
            <p className="text-sm font-medium text-gray-500">Company Packs</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-gray-900 mb-1">{stats.domain}</p>
            <p className="text-sm font-medium text-gray-500">Domain Packs</p>
          </div>
          <div className="bg-brand-50 rounded-xl p-5 border border-brand-100 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-brand-700 mb-1">{stats.popular}</p>
            <p className="text-sm font-medium text-brand-600">Popular Picks</p>
          </div>
        </div>

        {/* Controls: Search & Filters */}
        <div className="max-w-6xl mx-auto mb-10 space-y-6">
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search packs, companies or domains..."
              className="block w-full pl-11 pr-4 py-3.5 border-gray-200 rounded-xl shadow-sm focus:ring-brand-500 focus:border-brand-500 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeFilter === 'ALL' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              All Packs ({stats.total})
            </button>
            <button
              onClick={() => setActiveFilter('COMPANY')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeFilter === 'COMPANY' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Company Prep ({stats.company})
            </button>
            <button
              onClick={() => setActiveFilter('DOMAIN')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeFilter === 'DOMAIN' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Domain Practice ({stats.domain})
            </button>
            <button
              onClick={() => setActiveFilter('POPULAR')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeFilter === 'POPULAR' ? 'bg-brand-600 text-white shadow-md border border-brand-600' : 'bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100'}`}
            >
              <Star className={`w-3.5 h-3.5 ${activeFilter === 'POPULAR' ? 'fill-current' : ''}`} /> Popular ({stats.popular})
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          {filteredBundles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBundles.map((bundle) => {
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
                  <NavLink 
                    key={bundle.id}
                    to={ROUTES.EXPLORE_PACK_DETAILS.replace(':id', bundle.id)}
                    className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full transition-all hover:shadow-lg hover:-translate-y-1 group block"
                  >
                    {bundle.isPopular && (
                      <div className="absolute -top-3 -right-2 bg-brand-600 text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider rounded-full shadow-md flex items-center gap-1 z-10">
                        <Star className="w-3.5 h-3.5 fill-current" /> Popular
                      </div>
                    )}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${accentColor}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">{bundle.category}</p>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-brand-600 transition-colors">{bundle.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed flex-grow">
                      {bundle.description}
                    </p>
                    
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md">{bundle.interviewsCount} Modules</span>
                      <span className="text-sm font-bold text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">Explore <ChevronRight className="w-4 h-4" /></span>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <FilterX className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No packs found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search terms or exploring a different category.</p>
              <button 
                onClick={resetFilters}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
