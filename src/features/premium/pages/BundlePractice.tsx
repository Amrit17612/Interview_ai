import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';

import { Button } from '../../../components/ui/Button';
import { useAccess } from '../hooks/useAccess';
import { MOCK_COMPANY_BUNDLES, MOCK_DOMAIN_BUNDLES } from '../../../types/bundle.types';
import type { BundleType } from '../../../types/bundle.types';
import { ROUTES } from '../../../constants/routes';
import { interviewService } from '../../../services/interview.service';
import { Building, Code2, Play, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function BundlePractice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasAccessToBundle } = useAccess();
  
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find bundle and determine its type
  const bundle = useMemo(() => {
    let found = MOCK_COMPANY_BUNDLES.find(b => b.id === id);
    if (found) return { ...found, type: 'company' as BundleType };
    
    found = MOCK_DOMAIN_BUNDLES.find(b => b.id === id);
    if (found) return { ...found, type: 'domain' as BundleType };
    
    return null;
  }, [id]);

  useEffect(() => {
    // If bundle doesn't exist or user doesn't own it, redirect back to catalog
    if (!bundle) {
      navigate(ROUTES.COMPANY_PACKS);
      return;
    }
    if (!hasAccessToBundle(bundle.id, bundle.type)) {
      navigate(bundle.type === 'company' ? ROUTES.COMPANY_PACKS : ROUTES.DOMAIN_PACKS);
    }
  }, [bundle, hasAccessToBundle, navigate]);

  if (!bundle) return null;

  const handleStartMock = async (mockType: 'TECHNICAL' | 'BEHAVIORAL' | 'SYSTEM_DESIGN' | 'GENERAL') => {
    setIsStarting(true);
    setError(null);
    
    try {
      const payload = {
        configuration: {
          type: mockType,
          domain: bundle.interviewConfig.domain,
          difficulty: bundle.interviewConfig.difficulty || 'INTERMEDIATE',
          ...(bundle.interviewConfig.company ? { company: bundle.interviewConfig.company } : {}),
          ...(bundle.interviewConfig.role ? { role: bundle.interviewConfig.role } : {})
        }
      };

      const session = await interviewService.createInterview(payload);
      navigate(`${ROUTES.INTERVIEW_ACTIVE}?id=${session._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start the interview session.');
      setIsStarting(false);
    }
  };

  const getIcon = () => {
    return bundle.type === 'company' ? (
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
              {bundle.type === 'company' ? 'Company Preparation' : 'Domain Mastery'}
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
          {/* Technical Mock */}
          {bundle.interviewConfig.allowedTypes.includes('TECHNICAL') && (
            <div className="border border-gray-200 bg-white rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Technical Round</h3>
              <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                Focuses on coding, algorithms, and technical problem-solving adapted to the {bundle.name} standard.
              </p>
              <Button 
                className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                onClick={() => handleStartMock('TECHNICAL')}
                disabled={isStarting}
              >
                {isStarting ? 'Starting...' : <><Play className="mr-2 h-4 w-4" /> Start Technical Mock</>}
              </Button>
            </div>
          )}

          {/* System Design Mock */}
          {bundle.interviewConfig.allowedTypes.includes('SYSTEM_DESIGN') && (
            <div className="border border-gray-200 bg-white rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-gray-900 mb-2">System Design</h3>
              <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                Architecture, scaling, and high-level system design questions matched to this specific bundle.
              </p>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => handleStartMock('SYSTEM_DESIGN')}
                disabled={isStarting}
              >
                {isStarting ? 'Starting...' : <><Play className="mr-2 h-4 w-4" /> Start Design Mock</>}
              </Button>
            </div>
          )}

          {/* Behavioral Mock */}
          {bundle.interviewConfig.allowedTypes.includes('BEHAVIORAL') && (
            <div className="border border-gray-200 bg-white rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Behavioral / Leadership</h3>
              <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                Soft skills, past experiences, and cultural alignment formatted for {bundle.type === 'company' ? 'the target company' : 'senior roles'}.
              </p>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => handleStartMock('BEHAVIORAL')}
                disabled={isStarting}
              >
                {isStarting ? 'Starting...' : <><Play className="mr-2 h-4 w-4" /> Start Behavioral Mock</>}
              </Button>
            </div>
          )}
          
          {/* General Mock */}
          {bundle.interviewConfig.allowedTypes.includes('GENERAL') && (
            <div className="border border-gray-200 bg-white rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-gray-900 mb-2">General Interview</h3>
              <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                Comprehensive interview covering multiple disciplines and general knowledge.
              </p>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => handleStartMock('GENERAL')}
                disabled={isStarting}
              >
                {isStarting ? 'Starting...' : <><Play className="mr-2 h-4 w-4" /> Start General Mock</>}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </Container>
  );
}
