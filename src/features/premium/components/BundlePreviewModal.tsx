import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Building, Code2, Check, Target, Star, PlayCircle, FileText, Lock, X, Briefcase, Zap, Layers } from 'lucide-react';

interface BundlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: any;
  onUnlock: (bundleId: string) => void;
  isProcessing?: boolean;
}

export function BundlePreviewModal({ isOpen, onClose, bundle, onUnlock, isProcessing }: BundlePreviewModalProps) {
  if (!bundle) return null;

  const isCompany = bundle.type?.toLowerCase() === 'company';
  const Icon = isCompany ? Building : Code2;

  const features: string[] = bundle.features || [];
  const modules: any[] = bundle.modules || [];
  const name = bundle.name || 'Bundle';
  const description = bundle.description || '';
  const price = bundle.price || 0;
  const originalPrice = bundle.originalPrice;
  const category = bundle.category || (isCompany ? 'Company' : 'Domain');
  const difficulty = bundle.difficulty || bundle.interviewConfig?.difficulty;
  const role = bundle.interviewConfig?.role || bundle.role;
  const companyOrDomain = bundle.interviewConfig?.company || bundle.interviewConfig?.domain || (isCompany ? 'Company' : 'Domain');

  const interviewsCount = bundle.interviewsCount || modules.length;
  const mockRounds = bundle.interviewConfig?.allowedTypes || [];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-5xl p-0 overflow-hidden bg-gray-50/50">
      <div className="relative flex flex-col max-h-[90vh]">
        
        {/* Floating Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          
          {/* PREMIUM HERO SECTION */}
          <div className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-900 px-6 md:px-8 pt-12 pb-24 text-white overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl" />
            
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg overflow-hidden">
                  {/* @ts-ignore - optional property */}
                  {bundle.logo ? <img src={bundle.logo} alt="Logo" className="w-full h-full object-cover" /> : <Icon className="h-7 w-7 text-brand-100" />}
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/30 text-brand-50 border border-brand-400/30">
                    {category}
                  </span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
                {name}
              </h1>
              
              {description && (
                <p className="text-brand-100 text-lg max-w-2xl leading-relaxed mb-6">
                  {description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-brand-200">
                {companyOrDomain && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 opacity-70" />
                    {companyOrDomain}
                  </div>
                )}
                {role && role !== 'Any' && (
                  <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4 opacity-70" />
                    {role}
                  </div>
                )}
                {difficulty && (
                  <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded text-white">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    {difficulty}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8 pb-12 -mt-12 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* QUICK STATS */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-wrap md:flex-nowrap divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  {interviewsCount > 0 && (
                    <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-extrabold text-brand-600 mb-1">{interviewsCount}</span>
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                        <Target className="h-3.5 w-3.5" /> Mock Interviews
                      </span>
                    </div>
                  )}
                  {features.length > 0 && (
                    <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-extrabold text-gray-900 mb-1">{features.length}</span>
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                        <Star className="h-3.5 w-3.5" /> Key Features
                      </span>
                    </div>
                  )}
                  {modules.length > 0 && (
                    <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-extrabold text-gray-900 mb-1">{modules.length}</span>
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                        <Layers className="h-3.5 w-3.5" /> Modules
                      </span>
                    </div>
                  )}
                  {modules.length === 0 && mockRounds.length > 0 && (
                    <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-extrabold text-gray-900 mb-1">{mockRounds.length}</span>
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                        <PlayCircle className="h-3.5 w-3.5" /> Rounds
                      </span>
                    </div>
                  )}
                </div>

                {/* About Section */}
                {description && (
                  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-brand-500" /> About This Bundle
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-base">
                      {description}
                    </p>
                  </div>
                )}

                {/* What You'll Practice (Features) */}
                {features.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Target className="h-5 w-5 text-brand-500" /> What You'll Practice
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {features.map((feature, idx) => feature && (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="mt-0.5 rounded-full bg-green-100 p-1 shrink-0">
                            <Check className="h-4 w-4 text-green-700" />
                          </div>
                          <span className="text-gray-700 font-medium leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Included Interview Modules (Custom bundles) */}
                {modules.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-brand-500" /> Included Interview Modules
                    </h3>
                    <div className="space-y-4">
                      {modules.map((module, idx) => (
                        <div key={module._id || idx} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start gap-4 group hover:border-brand-300 hover:shadow-md transition-all">
                          <div className="shrink-0 h-10 w-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm border border-brand-100">
                            {idx + 1}
                          </div>
                          <div className="flex-1 pt-1">
                            <h4 className="font-bold text-gray-900 text-base mb-1">{module.title || `Module ${idx + 1}`}</h4>
                            <div className="flex flex-wrap gap-2">
                              {module.category && (
                                <span className="text-[10px] uppercase font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                  {module.category}
                                </span>
                              )}
                              {module.difficulty && (
                                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                                  {module.difficulty}
                                </span>
                              )}
                            </div>
                          </div>
                          <PlayCircle className="h-6 w-6 text-gray-300 group-hover:text-brand-500 transition-colors mt-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mock Rounds (TRUSTED_CATALOG / Legacy bundles) */}
                {modules.length === 0 && mockRounds.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-brand-500" /> Interview Rounds
                    </h3>
                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[1.4rem] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                      {mockRounds.map((round: string, idx: number) => (
                        <div key={idx} className="relative flex items-center gap-6 py-4">
                          <div className="flex items-center justify-center w-11 h-11 rounded-full border-4 border-white bg-brand-50 text-brand-600 shadow-sm shrink-0 font-bold text-sm z-10">
                            {idx + 1}
                          </div>
                          <div className="flex-1 p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between group hover:border-brand-200 transition-colors">
                            <h4 className="font-bold text-gray-900 capitalize">{round.replace(/_/g, ' ')} Round</h4>
                            <PlayCircle className="h-5 w-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Final CTA Area */}
                <div className="bg-brand-50 p-8 rounded-2xl border border-brand-100 text-center mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to start practicing?</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">Get access to the complete interview preparation bundle and start advancing your career.</p>
                  <Button 
                    className="h-12 px-8 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all text-base"
                    onClick={() => onUnlock(bundle.id || bundle.bundleId)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Unlock Bundle →'}
                  </Button>
                </div>

              </div>

              {/* Sidebar Column */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Pricing & CTA Card */}
                <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-100 sticky top-6">
                  <div className="mb-6 text-center">
                    <div className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                      Lifetime Access
                    </div>
                    <div className="flex items-end justify-center gap-2">
                      <span className="text-5xl font-extrabold text-gray-900 tracking-tight">₹{price}</span>
                      {originalPrice && (
                        <span className="text-xl text-gray-400 line-through mb-1.5 font-medium">₹{originalPrice}</span>
                      )}
                    </div>
                    {originalPrice && originalPrice > price && (
                      <p className="text-green-600 text-sm font-bold mt-2">
                        You save {Math.round(((originalPrice - price) / originalPrice) * 100)}%
                      </p>
                    )}
                    <p className="text-gray-500 text-xs font-medium mt-2 uppercase tracking-wider">One-time payment</p>
                  </div>

                  <Button 
                    className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    onClick={() => onUnlock(bundle.id || bundle.bundleId)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : (
                      <><Lock className="h-5 w-5" /> Unlock Now</>
                    )}
                  </Button>
                </div>

                {/* Details Sidebar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" /> Bundle Details
                  </h3>
                  <div className="space-y-4 divide-y divide-gray-50">
                    <DetailRow label={isCompany ? "Company" : "Domain"} value={companyOrDomain} />
                    <DetailRow label="Category" value={category} />
                    <DetailRow label="Format" value="Online Mocks & Modules" />
                    <DetailRow label="Language" value="English" />
                    {difficulty && <DetailRow label="Difficulty" value={difficulty} />}
                    {role && role !== 'Any' && <DetailRow label="Target Role" value={role} />}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2.5 first:pt-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm text-gray-900 font-bold text-right max-w-[60%]">{value}</span>
    </div>
  );
}
