import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Building, Code2, Check, Target, Star, PlayCircle, FileText, Lock, X } from 'lucide-react';

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

  // Normalize properties since Mock bundles and Custom bundles have slightly different structures
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
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-4xl p-0 overflow-hidden bg-gray-50">
      <div className="relative flex flex-col max-h-[90vh]">
        
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Icon className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{name}</h2>
              <p className="text-xs text-gray-500 font-medium">{category}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Hero / About */}
              {description && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">About This Bundle</h3>
                  <p className="text-gray-600 leading-relaxed">{description}</p>
                </div>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interviewsCount > 0 && (
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-2">
                      <Target className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{interviewsCount}</span>
                    <span className="text-xs text-gray-500 font-medium">Interviews</span>
                  </div>
                )}
                {features.length > 0 && (
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                      <Star className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{features.length}</span>
                    <span className="text-xs text-gray-500 font-medium">Key Features</span>
                  </div>
                )}
                {modules.length > 0 && (
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{modules.length}</span>
                    <span className="text-xs text-gray-500 font-medium">Modules</span>
                  </div>
                )}
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">What You'll Practice</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((feature, idx) => feature && (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-green-50 p-1 shrink-0">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Included Modules (Custom bundles) */}
              {modules.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Included Modules ({modules.length})</h3>
                  <div className="space-y-3">
                    {modules.map((module, idx) => (
                      <div key={module._id || idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between group hover:border-brand-200 transition-colors">
                        <div>
                          <h4 className="font-semibold text-gray-900">{module.title || `Module ${idx + 1}`}</h4>
                          <div className="flex gap-2 mt-1">
                            {module.category && (
                              <span className="text-[10px] uppercase font-bold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                                {module.category}
                              </span>
                            )}
                            {module.difficulty && (
                              <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                                {module.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                        <PlayCircle className="h-5 w-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mock Rounds (TRUSTED_CATALOG / Legacy bundles) */}
              {modules.length === 0 && mockRounds.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Interview Rounds</h3>
                  <div className="space-y-4">
                    {mockRounds.map((round: string, idx: number) => (
                      <div key={idx} className="flex gap-4 items-start relative">
                        {idx !== mockRounds.length - 1 && (
                          <div className="absolute top-8 left-3.5 w-0.5 h-full -ml-px bg-gray-100" />
                        )}
                        <div className="relative z-10 shrink-0 h-7 w-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs border-2 border-white ring-1 ring-gray-100 shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="pt-1 pb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {round.replace(/_/g, ' ')} Round
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Pricing & CTA Card */}
              <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-100 sticky top-6">
                <div className="mb-6 text-center">
                  <p className="text-gray-500 text-sm font-medium mb-1">One-time payment</p>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-4xl font-extrabold text-gray-900">${price}</span>
                    {originalPrice && (
                      <span className="text-lg text-gray-400 line-through mb-1">${originalPrice}</span>
                    )}
                  </div>
                  {originalPrice && originalPrice > price && (
                    <div className="mt-2 inline-block bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                      Save {Math.round(((originalPrice - price) / originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium text-lg rounded-xl shadow-sm transition-all hover:shadow-md"
                  onClick={() => onUnlock(bundle.id || bundle.bundleId)}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : (
                    <><Lock className="h-4 w-4 mr-2" /> Unlock Now</>
                  )}
                </Button>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                  Lifetime access to all {name} materials.
                </p>
              </div>

              {/* Details Sidebar */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Bundle Details</h3>
                <div className="space-y-4">
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
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm text-gray-900 font-semibold">{value}</span>
    </div>
  );
}
