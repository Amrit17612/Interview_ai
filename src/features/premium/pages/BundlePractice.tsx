import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';

import { Button } from '../../../components/ui/Button';
import { useAccess } from '../hooks/useAccess';
import { ROUTES } from '../../../constants/routes';
import { interviewService } from '../../../services/interview.service';
import { Building, Code2, Play, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { bundleService } from '../../../services/bundle.service';
import type { BundleData } from '../../../services/bundle.service';

export function BundlePractice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasAccessToBundle } = useAccess();
  
  const [bundle, setBundle] = useState<BundleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    bundleService.getPublicBundles().then(data => {
      const found = data.find(b => b.bundleId === id);
      if (found) {
        setBundle(found);
      } else {
        navigate(ROUTES.COMPANY_PACKS);
      }
      setIsLoading(false);
    }).catch(() => {
      navigate(ROUTES.COMPANY_PACKS);
    });
  }, [id, navigate]);

  useEffect(() => {
    if (!isLoading && bundle) {
      if (!hasAccessToBundle(bundle.bundleId, bundle.type)) {
        navigate(bundle.type === 'COMPANY' ? ROUTES.COMPANY_PACKS : ROUTES.DOMAIN_PACKS);
      }
    }
  }, [bundle, isLoading, hasAccessToBundle, navigate]);

  if (isLoading) {
    return (
      <Container className="py-24 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </Container>
    );
  }

  if (!bundle) return null;

  const handleStartMock = async (module: any) => {
    setIsStarting(true);
    setError(null);
    
    try {
      const payload = {
        templateId: module._id,
        configuration: {
          type: module.category || 'TECHNICAL',
          domain: module.domain || bundle.category || 'Software Engineering',
          difficulty: module.difficulty || 'INTERMEDIATE',
          // Optional fields
          ...(bundle.type === 'COMPANY' ? { company: bundle.name } : {})
        }
      };

      const session = await interviewService.createInterview(payload as any);
      
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (err) {}

      navigate(`${ROUTES.INTERVIEW_DEVICE_CHECK}?id=${session._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start the interview session.');
      setIsStarting(false);
    }
  };

  const getIcon = () => {
    return bundle.type === 'COMPANY' ? (
      <Building className="h-10 w-10 text-brand-600" />
    ) : (
      <Code2 className="h-10 w-10 text-brand-600" />
    );
  };

  return (
    <Container className="py-8 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="h-20 w-20 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0 border border-brand-100">
            {getIcon()}
          </div>
          <div>
            <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-1">
              {bundle.type === 'COMPANY' ? 'Company Preparation' : 'Domain Mastery'}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{bundle.name}</h1>
          </div>
        </div>
        
        <p className="text-lg text-gray-600 mb-8 border-b border-gray-100 pb-8">
          {bundle.description}
        </p>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-8 flex items-start text-red-700">
            <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-6">Available Practice Modules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bundle.modules && bundle.modules.length > 0 ? (
            bundle.modules.map((module: any) => (
              <div key={module._id} className="border border-gray-200 bg-white rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{module.title || 'Practice Module'}</h3>
                <p className="text-sm text-gray-500 mb-6 flex-grow">
                  {module.description || `Focuses on ${module.category || 'technical'} concepts.`}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {module.category || 'TECHNICAL'}
                  </span>
                  <Button 
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                    onClick={() => handleStartMock(module)}
                    disabled={isStarting}
                  >
                    {isStarting ? 'Starting...' : <><Play className="mr-2 h-4 w-4" /> Start</>}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
              No practice modules have been added to this bundle yet.
            </div>
          )}
        </div>
      </motion.div>
    </Container>
  );
}
