import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, BrainCircuit, Mic, 
  MapPin, CheckCircle2, Lock, Sparkles, Building2, Code2
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { MOCK_DOMAIN_BUNDLES, MOCK_COMPANY_BUNDLES } from '../../../types/bundle.types';

interface InteractiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InteractiveDemoModal({ isOpen, onClose }: InteractiveDemoModalProps) {
  const [stage, setStage] = useState(1);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Available options
  const demoBundles = [
    ...MOCK_DOMAIN_BUNDLES.slice(0, 2),
    MOCK_COMPANY_BUNDLES[0]
  ];

  const handleClose = () => {
    // Reset state on close
    setTimeout(() => {
      setStage(1);
      setSelectedBundleId(null);
      setResponse('');
      setIsAnalyzing(false);
    }, 300);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleSubmitResponse = () => {
    if (!response.trim()) return;
    setIsAnalyzing(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsAnalyzing(false);
      setStage(3);
    }, 1500);
  };

  const handleUseSampleResponse = () => {
    setResponse("To prevent unnecessary re-renders in React, I would first ensure state is pushed down as close to where it's used as possible. If a component still re-renders too often, I might wrap it in React.memo for a shallow props comparison. Additionally, for expensive calculations or object references passed as props, I'd use useMemo and useCallback.");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
        >
          {/* Header */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h2 id="demo-modal-title" className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-brand-600" /> Interviu AI Demo
              </h2>
              <p className="text-sm text-gray-500 mt-1">Experience how AI helps you practice and improve.</p>
            </div>
            
            <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto">
              {/* Progress Steps */}
              <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
                <span className={stage >= 1 ? "text-brand-600" : "text-gray-400"}>Setup</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <span className={stage >= 2 ? "text-brand-600" : "text-gray-400"}>Interview</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <span className={stage >= 3 ? "text-brand-600" : "text-gray-400"}>Feedback</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <span className={stage >= 4 ? "text-brand-600" : "text-gray-400"}>Roadmap</span>
              </div>
              
              <button 
                onClick={handleClose}
                className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close demo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              
              {/* STAGE 1: CHOOSE */}
              {stage === 1 && (
                <motion.div 
                  key="stage-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-2xl mx-auto py-4"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose your interview</h3>
                    <p className="text-gray-600">Select a practice scenario to see how Interviu AI guides your preparation.</p>
                  </div>

                  <div className="grid gap-4 mb-8">
                    {demoBundles.map(bundle => {
                      const isSelected = selectedBundleId === bundle.id;
                      const Icon = bundle.type === 'company' ? Building2 : Code2;
                      return (
                        <button
                          key={bundle.id}
                          onClick={() => setSelectedBundleId(bundle.id)}
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            isSelected 
                              ? 'border-brand-500 bg-brand-50/50 shadow-sm' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-brand-100 border-brand-200 text-brand-600' : 'bg-gray-100 border-gray-200 text-gray-500'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-900">{bundle.name}</h4>
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{bundle.description}</p>
                            <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-600">
                              {bundle.category}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-4 font-medium italic">Demo data only — actual preparation experience can be personalized after creating an account.</p>
                    <button
                      disabled={!selectedBundleId}
                      onClick={() => setStage(2)}
                      className="inline-flex items-center justify-center px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Start Interview
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STAGE 2: INTERVIEW */}
              {stage === 2 && (
                <motion.div 
                  key="stage-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Your AI interview begins</h3>
                    <p className="text-gray-500 mt-1">Experience a dynamic question tailored to your selection.</p>
                  </div>

                  <div className="grid md:grid-cols-12 gap-8 max-w-5xl mx-auto w-full">
                    
                    {/* LEFT: AI INTERVIEWER */}
                    <div className="md:col-span-5 flex flex-col">
                      <div className="bg-gray-900 rounded-2xl p-6 flex flex-col items-center justify-center h-64 md:h-[400px] relative overflow-hidden shadow-xl">
                        
                        {/* Pulse rings */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="w-48 h-48 rounded-full bg-brand-500/20 blur-xl"
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
                            className="w-40 h-40 rounded-full bg-blue-500/20 blur-xl absolute"
                          />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-indigo-600 rounded-full p-1 mb-6 shadow-lg shadow-brand-500/20">
                            <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-800">
                              <BrainCircuit className="w-8 h-8 text-brand-400" />
                            </div>
                          </div>
                          
                          <h4 className="text-white font-medium text-lg">AI Interviewer</h4>
                          <div className="flex items-center gap-2 mt-2 bg-gray-800/80 backdrop-blur px-3 py-1.5 rounded-full border border-gray-700">
                            {isAnalyzing ? (
                              <>
                                <div className="flex gap-1">
                                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                                </div>
                                <span className="text-brand-300 text-xs font-medium">Analyzing response...</span>
                              </>
                            ) : (
                              <>
                                <Mic className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-gray-300 text-xs font-medium">Listening for your answer</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: QUESTION & RESPONSE */}
                    <div className="md:col-span-7 flex flex-col">
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full flex flex-col">
                        
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sample Interview Question</span>
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Demo</span>
                        </div>

                        <h4 className="text-lg font-bold text-gray-900 mb-6 leading-relaxed">
                          "Explain how you would prevent unnecessary re-renders in a React application. What approaches or hooks would you consider?"
                        </h4>

                        <div className="flex-1 flex flex-col mt-auto relative">
                           {isAnalyzing && (
                             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                               <div className="flex flex-col items-center">
                                 <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
                                 <p className="text-sm font-semibold text-gray-700">Evaluating signals...</p>
                               </div>
                             </div>
                           )}

                           <div className="flex justify-between items-end mb-2">
                             <label className="text-sm font-semibold text-gray-700">Your Response</label>
                             <button 
                               onClick={handleUseSampleResponse}
                               className="text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors bg-brand-50 px-2 py-1 rounded"
                             >
                               Use sample response
                             </button>
                           </div>
                           
                           <textarea 
                             value={response}
                             onChange={(e) => setResponse(e.target.value)}
                             placeholder="Type a short response here to see how the AI evaluates it..."
                             className="w-full flex-1 min-h-[120px] p-3 text-sm text-gray-700 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow resize-none"
                           />
                           
                           <button
                             disabled={!response.trim() || isAnalyzing}
                             onClick={handleSubmitResponse}
                             className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             Submit Answer
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE 3: FEEDBACK */}
              {stage === 3 && (
                <motion.div 
                  key="stage-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-4xl mx-auto py-4"
                >
                  <div className="text-center mb-10">
                    <span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">Sample AI Feedback</span>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Here's how your interview went</h3>
                    <p className="text-gray-600">The AI provides qualitative, actionable insights rather than just a score.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-gray-900 text-sm">Technical Understanding</h4>
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Strong</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Strong understanding of component rendering. You correctly identified `React.memo`, `useMemo`, and `useCallback` as primary tools for optimization.
                      </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-gray-900 text-sm">Answer Structure</h4>
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Focus Area</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Explain <em>why</em> a specific optimization is appropriate before jumping to the implementation details to show architectural thinking.
                      </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-gray-900 text-sm">Communication</h4>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Improving</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Your explanation is clear, but structuring the answer step-by-step (e.g., Concept → Example → Trade-off) would make it easier to follow.
                      </p>
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center">
                    <button
                      onClick={() => setStage(4)}
                      className="inline-flex items-center justify-center px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
                    >
                      See Improvement Roadmap
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* STAGE 4: ROADMAP */}
              {stage === 4 && (
                <motion.div 
                  key="stage-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-4xl mx-auto py-4"
                >
                  <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Your next steps</h3>
                    <p className="text-gray-600">Feedback becomes a clearer direction for what to practice next.</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-start max-w-3xl mx-auto mb-12">
                    
                    {/* Illustrative Roadmap */}
                    <div className="flex-1 w-full bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-inner">
                      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                        <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><MapPin className="w-4 h-4"/> Illustrative Roadmap</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Demo</span>
                      </div>
                      
                      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-green-500 before:via-brand-500 before:to-gray-200">
                        
                        <div className="relative flex items-center group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white shrink-0 z-10 border-4 border-gray-50">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div className="ml-4 p-3 w-full rounded-xl border border-gray-100 bg-white shadow-sm opacity-60">
                            <h3 className="font-semibold text-gray-900 text-sm">Technical Fundamentals</h3>
                            <p className="text-xs text-gray-500">Completed</p>
                          </div>
                        </div>

                        <div className="relative flex items-center group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-600 text-white shrink-0 z-10 border-4 border-brand-100 ring-4 ring-brand-50">
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          </div>
                          <div className="ml-4 p-3 w-full rounded-xl border-2 border-brand-200 bg-white shadow-md relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                            <h3 className="font-bold text-brand-900 text-sm">Explain technical decisions clearly</h3>
                            <p className="text-xs text-gray-600 font-medium">Current focus</p>
                          </div>
                        </div>

                        <div className="relative flex items-center group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-300 text-gray-400 shrink-0 z-10">
                            <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
                          </div>
                          <div className="ml-4 p-3 w-full rounded-xl border border-gray-200 bg-white">
                            <h3 className="font-semibold text-gray-600 text-sm">Practice deeper follow-up questions</h3>
                            <p className="text-xs text-gray-400">Upcoming</p>
                          </div>
                        </div>

                        <div className="relative flex items-center group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 border-2 border-gray-200 text-gray-400 shrink-0 z-10">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div className="ml-4 p-3 w-full rounded-xl border border-gray-100 bg-white opacity-50">
                            <h3 className="font-semibold text-gray-500 text-sm">Full mock interview</h3>
                            <p className="text-xs text-gray-400">Next milestone</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendation Card */}
                    <div className="flex-1 w-full flex flex-col justify-center">
                       <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 shadow-sm relative">
                          <div className="absolute -top-3 -right-3 bg-brand-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <h4 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-3">AI Recommendation</h4>
                          <p className="text-brand-800 leading-relaxed font-medium">
                            "Practice explaining your technical decisions and trade-offs clearly before moving to a full advanced mock interview. This builds a stronger foundation for system design rounds."
                          </p>
                       </div>
                    </div>
                  </div>

                  {/* Final CTA */}
                  <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800 shadow-xl">
                    <h3 className="text-2xl font-bold text-white mb-3">Ready to practice for your real interview?</h3>
                    <p className="text-gray-400 mb-6">Create your account and start preparing with personalized interview practice.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <NavLink 
                        to={ROUTES.REGISTER}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
                      >
                        Start Preparing Free
                      </NavLink>
                      <NavLink 
                        to={ROUTES.EXPLORE_PACKS}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-transparent text-gray-300 border border-gray-700 rounded-lg font-semibold hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        Explore Practice Packs
                      </NavLink>
                    </div>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
