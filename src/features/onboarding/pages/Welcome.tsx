import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../auth/hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { motion, AnimatePresence } from 'framer-motion';
import type { OnboardingData } from '../../../services/auth.service';

const ROLES = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'Other'];
const EXPERIENCE_LEVELS = ['Fresher', '0–2 Years', '2–5 Years', '5+ Years'];
const INTERVIEW_GOALS = ['Technical Interview', 'HR Interview', 'DSA / Coding', 'System Design', 'Full Interview Preparation'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const TECHNOLOGIES = ['Java', 'JavaScript', 'Python', 'C++', 'React', 'Node.js', 'Other'];
const COMPANY_TYPES = ['Product Based', 'Service Based', 'Startup', 'FAANG / Big Tech', 'Open to All'];

export function Welcome() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardingData>({
    currentRole: '',
    experienceLevel: '',
    interviewGoals: [],
    difficulty: '',
    primaryTechnology: '',
    targetCompanyType: ''
  });

  const [customRole, setCustomRole] = useState('');
  const [customTech, setCustomTech] = useState('');

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      interviewGoals: prev.interviewGoals.includes(goal)
        ? prev.interviewGoals.filter(g => g !== goal)
        : [...prev.interviewGoals, goal]
    }));
  };

  const isStep1Valid = () => {
    const roleValid = formData.currentRole === 'Other' ? customRole.trim().length > 0 : formData.currentRole.length > 0;
    return roleValid && formData.experienceLevel.length > 0;
  };

  const isStep2Valid = () => {
    return formData.interviewGoals.length > 0 && formData.difficulty.length > 0;
  };

  const isStep3Valid = () => {
    const techValid = formData.primaryTechnology === 'Other' ? customTech.trim().length > 0 : formData.primaryTechnology.length > 0;
    return techValid && formData.targetCompanyType.length > 0;
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const finalData: OnboardingData = {
        ...formData,
        currentRole: formData.currentRole === 'Other' ? customRole.trim() : formData.currentRole,
        primaryTechnology: formData.primaryTechnology === 'Other' ? customTech.trim() : formData.primaryTechnology
      };
      await completeOnboarding(finalData);
      navigate(ROUTES.DASHBOARD, { replace: true, state: { message: "You're all set! Let's start preparing." } });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete onboarding. Please try again.');
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const firstName = user?.firstName || 'there';

  return (
    <Container className="py-12 flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-2xl bg-white shadow-premium rounded-2xl p-6 md:p-10 border border-gray-100 relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome, {firstName} 👋</h1>
          <p className="text-gray-500 mt-2">Let's personalize your interview preparation.</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center space-x-3 mb-8">
          <span className="text-sm font-medium text-gray-500 mr-2">Step {step} of 3</span>
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-brand-600' : i < step ? 'w-2 bg-brand-600 opacity-50' : 'w-2 bg-gray-200'}`} 
            />
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="min-h-[320px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Tell us about yourself</h2>
                  <label className="block text-sm font-medium text-gray-700 mb-3">What is your current or target role?</label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map(role => (
                      <button
                        key={role}
                        onClick={() => setFormData({ ...formData, currentRole: role })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${formData.currentRole === role ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  {formData.currentRole === 'Other' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                      <Input 
                        placeholder="e.g. Product Manager" 
                        value={customRole} 
                        onChange={(e) => setCustomRole(e.target.value)} 
                        autoFocus
                      />
                    </motion.div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Years of experience</label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setFormData({ ...formData, experienceLevel: level })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${formData.experienceLevel === level ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">What are you preparing for?</h2>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Interview Goals (Select multiple)</label>
                  <div className="flex flex-wrap gap-2">
                    {INTERVIEW_GOALS.map(goal => {
                      const isSelected = formData.interviewGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          onClick={() => toggleGoal(goal)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${isSelected ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50'}`}
                        >
                          {isSelected && <span className="mr-1">✓</span>} {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Preferred difficulty level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {DIFFICULTIES.map(diff => (
                      <button
                        key={diff}
                        onClick={() => setFormData({ ...formData, difficulty: diff })}
                        className={`p-3 rounded-xl text-center text-sm font-medium transition-colors border ${formData.difficulty === diff ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50'}`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Almost there</h2>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Primary Technology / Language</label>
                  <div className="flex flex-wrap gap-2">
                    {TECHNOLOGIES.map(tech => (
                      <button
                        key={tech}
                        onClick={() => setFormData({ ...formData, primaryTechnology: tech })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${formData.primaryTechnology === tech ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50'}`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                  {formData.primaryTechnology === 'Other' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                      <Input 
                        placeholder="e.g. Go, Ruby, Swift" 
                        value={customTech} 
                        onChange={(e) => setCustomTech(e.target.value)} 
                        autoFocus
                      />
                    </motion.div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Target Company Type</label>
                  <div className="flex flex-wrap gap-2">
                    {COMPANY_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, targetCompanyType: type })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${formData.targetCompanyType === type ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          ) : (
            <div></div> /* Spacer */
          )}
          
          {step < 3 ? (
            <Button 
              onClick={handleNext} 
              disabled={(step === 1 && !isStep1Valid()) || (step === 2 && !isStep2Valid())}
              className="px-8 shadow-sm"
            >
              Continue
            </Button>
          ) : (
            <Button 
              onClick={handleComplete} 
              disabled={!isStep3Valid() || isSubmitting}
              className="px-8 shadow-sm bg-brand-600 hover:bg-brand-700 text-white"
            >
              {isSubmitting ? 'Saving...' : 'Finish Setup'}
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
}