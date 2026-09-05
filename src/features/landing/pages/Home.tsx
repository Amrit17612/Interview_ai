import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Accordion } from '../../../components/ui/Accordion';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle2,
  BrainCircuit,
  FileSearch,
  Building2,
  TrendingUp,
  ArrowRight,
  Briefcase,
  User,
  Sparkles,
  FileText,
  ChevronRight,
  BarChart2,
  ShieldCheck,
  ScanLine,
  AlertCircle,
  Target,
  Code2,
  Star,
  MapPin,
  Lock,
  MessageSquareText
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import lpuLogo from '../../../assets/logos/lpu-logo.svg';
import { useState, useEffect } from 'react';
import { InteractiveDemoModal } from '../components/InteractiveDemoModal';
import { bundleService } from '../../../services/bundle.service';

// Motion variants
const fadeInUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function Home() {
  const [previewBundles, setPreviewBundles] = useState<any[]>([]);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    bundleService.getPublicBundles().then(data => {
      // Get a mix of bundles, limit to 4
      setPreviewBundles(data.map(b => ({ ...b, id: b.bundleId })).slice(0, 4));
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <InteractiveDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
      {/* 1. Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-white">
        <Container className="text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-3xl mx-auto space-y-8">
            <Badge variant="default" className="mb-4 bg-brand-50 text-brand-700">Designed exclusively for students</Badge>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Master your interview with <span className="text-brand-600">AI precision</span>.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Premium, targeted preparation for technical and behavioral interviews. Analyze your resume, practice with company-specific frameworks, and land your dream offer.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <NavLink to={ROUTES.REGISTER}>
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-premium">
                  Start Preparing Now
                </Button>
              </NavLink>
              <Button onClick={() => setIsDemoModalOpen(true)} variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-white">
                <Play className="mr-2 h-4 w-4" /> View Demo
              </Button>
            </div>
            <p className="text-sm text-gray-400 font-medium">No credit card required. Free tier available.</p>
          </motion.div>
        </Container>
      </section>

      {/* 2. Trust / Credibility (Placeholder) */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <Container>
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
            Trusted by students from top institutions
          </p>
          <div className="flex justify-center items-center">
            {/* Authentic university logos */}
            <img 
              src={lpuLogo} 
              alt="Lovely Professional University" 
              className="h-12 md:h-16 w-auto object-contain" 
            />
          </div>
        </Container>
      </section>

      {/* 3. Who Is It For */}
      <section className="py-24 bg-white" id="who-is-it-for">
        <Container>
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Built for your career stage</h2>
            <p className="text-lg text-gray-600">Interviu AI provides tailored preparation whether you're looking for your first internship or a new graduate role.</p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-brand-600" />
                </div>
                <CardTitle>College Placement</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">Prepare for on-campus drives with domain-specific question banks and aptitude rounds.</CardDescription>
              </CardContent>
            </Card>
            <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Off-Campus Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">Target specific product or service companies with tailored frameworks and ATS optimization.</CardDescription>
              </CardContent>
            </Card>
            <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                  <BrainCircuit className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Internships</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">Build confidence for your first professional interviews with core technical foundational practice.</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* 4. Why Interviu AI */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Not just another AI wrapper. A complete ecosystem.</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Generic chatbots don't understand the pressure of a technical interview. Interviu AI is designed exclusively for the student recruitment lifecycle, providing structured feedback, actionable roadmaps, and targeted practice.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  'Structured, domain-specific evaluation frameworks',
                  'Actionable feedback, not just generic encouragement',
                  'Resume parsing tailored to actual ATS standards'
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-brand-600 shrink-0 mr-3" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
              className="relative w-full h-[380px] sm:h-[420px] lg:h-[450px] flex items-center justify-center bg-transparent mt-8 lg:mt-0"
            >
               {/* Main Dashboard Preview */}
               <div className="w-[90%] sm:w-[80%] max-w-[340px] bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 flex flex-col overflow-hidden relative z-10">
                 {/* Top Bar */}
                 <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50/80">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                       </div>
                       <span className="text-[13px] font-semibold text-gray-800">Career Dashboard</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                       <User className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                 </div>
                 {/* Content */}
                 <div className="p-4 space-y-4">
                    {/* Readiness Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100 flex items-center justify-between shadow-sm">
                       <div>
                         <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider mb-0.5">Interview Readiness</p>
                         <p className="text-xs text-green-700 font-medium">Great progress this week</p>
                       </div>
                       <div className="w-12 h-12 rounded-full border-[3px] border-green-200 border-t-green-600 flex items-center justify-center bg-white">
                         <span className="text-xs font-bold text-green-700">82%</span>
                       </div>
                    </div>
                    
                    {/* Progress Overview */}
                    <div className="space-y-3 px-1">
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-medium text-gray-500">
                             <span>Technical Skills</span>
                             <span className="text-gray-700 font-semibold">75%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full w-3/4"></div></div>
                       </div>
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-medium text-gray-500">
                             <span>Communication</span>
                             <span className="text-gray-700 font-semibold">90%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full w-[90%]"></div></div>
                       </div>
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-medium text-gray-500">
                             <span>Problem Solving</span>
                             <span className="text-gray-700 font-semibold">85%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-orange-400 h-1.5 rounded-full w-[85%]"></div></div>
                       </div>
                    </div>
                    
                    {/* AI Feedback Preview */}
                    <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/60">
                       <div className="flex items-center gap-1.5 mb-1.5">
                         <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                         <span className="text-[11px] font-bold text-purple-900">AI Feedback</span>
                       </div>
                       <p className="text-[11px] text-gray-700 leading-snug font-medium">Strong technical structure. Work on explaining tradeoffs more clearly.</p>
                    </div>

                    {/* Next Action */}
                    <div className="flex items-center justify-between bg-brand-50 rounded-xl p-2.5 border border-brand-100 shadow-sm transition-colors hover:bg-brand-100/50">
                       <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center border border-brand-100">
                             <BarChart2 className="w-3.5 h-3.5 text-brand-600" />
                          </div>
                          <span className="text-[12px] font-bold text-brand-900">Next: DSA Roadmap</span>
                       </div>
                       <ChevronRight className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                 </div>
               </div>

               {/* Floating Ecosystem Cards */}
               {/* Card 1: AI Interview */}
               <motion.div 
                 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }}
                 className="absolute -top-2 left-0 sm:-left-4 md:-left-6 lg:-left-8 bg-white rounded-xl shadow-lg shadow-gray-200/60 border border-gray-100 p-2.5 flex items-center gap-2.5 z-20"
               >
                 <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                    <BrainCircuit className="w-4 h-4 text-purple-600" />
                 </div>
                 <div className="pr-3">
                    <p className="text-[11px] font-bold text-gray-800 leading-tight">AI Interview</p>
                    <p className="text-[10px] text-green-600 font-semibold mt-0.5">Ready</p>
                 </div>
               </motion.div>

               {/* Card 2: ATS Resume */}
               <motion.div 
                 initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }}
                 className="absolute top-24 -right-2 sm:-right-4 md:-right-6 lg:-right-8 bg-white rounded-xl shadow-lg shadow-gray-200/60 border border-gray-100 p-2.5 flex items-center gap-2.5 z-20"
               >
                 <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                    <FileText className="w-4 h-4 text-blue-600" />
                 </div>
                 <div className="pr-3">
                    <p className="text-[11px] font-bold text-gray-800 leading-tight">ATS Resume</p>
                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Score: <span className="text-green-600 font-bold">92</span></p>
                 </div>
               </motion.div>

               {/* Card 3: Live Feedback */}
               <motion.div 
                 initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} viewport={{ once: true }}
                 className="absolute -bottom-4 right-4 sm:right-8 md:right-10 lg:right-4 bg-white rounded-xl shadow-lg shadow-gray-200/60 border border-gray-100 p-2.5 flex items-center gap-2.5 z-20"
               >
                 <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                 </div>
                 <div className="pr-3">
                    <p className="text-[11px] font-bold text-gray-800 leading-tight">Feedback</p>
                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Generated</p>
                 </div>
               </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 5. Features */}
      <section className="py-24 bg-white" id="features">
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Everything you need to succeed</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BrainCircuit, title: 'AI Mock Interviews', desc: 'Real-time conversational practice with targeted feedback.' },
              { icon: FileSearch, title: 'Resume Analysis', desc: 'Detailed scoring against industry expectations.' },
              { icon: Building2, title: 'Company Packs', desc: 'Preparation specific to top tech companies.' },
              { icon: TrendingUp, title: 'Learning Roadmap', desc: 'Personalized curriculum based on performance.' }
            ].map((f, i) => (
              <Card key={i} className="border-gray-100">
                <CardHeader className="pb-2">
                  <f.icon className="h-8 w-8 text-gray-700 mb-2" />
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{f.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. How It Works */}
      <section className="py-24 bg-gray-50 border-y border-gray-100" id="how-it-works">
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">How it works</h2>
            <p className="text-lg text-gray-600">A simple, effective preparation cycle.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 text-center relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gray-200 z-0"></div>
            
            {[
              { step: '1', title: 'Upload Profile', desc: 'Submit your resume for instant ATS analysis and baseline scoring.' },
              { step: '2', title: 'Practice', desc: 'Engage in domain-specific AI mock interviews.' },
              { step: '3', title: 'Improve', desc: 'Follow personalized roadmaps to fix weaknesses before the real thing.' }
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md border-4 border-gray-50">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 7. Interview Domains, 8. Company Prep, 9. Resume Intelligence, 10. ATS, 11. Learning Roadmap, 12. Interview Feedback Preview */}
      <section className="py-24 bg-white" id="capabilities">
        <Container>
          <div className="space-y-32">
            
            {/* Resume & ATS */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="order-2 lg:order-1 relative">
                <div className="relative w-full h-[550px] sm:h-[600px] lg:h-[650px] rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 flex flex-col overflow-hidden">
                  
                  {/* Upper-Left ATS Resume Analyzer */}
                  <motion.div 
                    initial={{ opacity: 0, x: -15, y: -15 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="absolute top-4 left-4 sm:top-8 sm:left-8 w-[88%] sm:w-[340px] bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 z-10"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between p-3.5 border-b border-gray-50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-[13px] font-bold text-gray-800">Resume Analysis</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-green-50 border border-green-100/50 text-green-700 text-[10px] font-bold tracking-wider uppercase">Analyzed</span>
                    </div>
                    
                    {/* Score Area */}
                    <div className="p-4 flex items-center gap-5 border-b border-gray-50">
                      <div className="relative w-[72px] h-[72px] flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-gray-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-brand-500" strokeDasharray="82, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-[22px] font-extrabold text-gray-900 leading-none">82</span>
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">ATS Score</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[14px] font-bold text-gray-900">Good match</h4>
                        <p className="text-[11px] text-gray-600 leading-snug">Your resume is optimized for this role.</p>
                      </div>
                    </div>

                    {/* ATS Match Breakdown */}
                    <div className="p-4 space-y-3.5 border-b border-gray-50">
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-medium text-gray-600">
                             <span>Keyword Match</span>
                             <span className="text-gray-900 font-bold">88%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full w-[88%] shadow-sm shadow-blue-500/20"></div></div>
                       </div>
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-medium text-gray-600">
                             <span>Formatting</span>
                             <span className="text-gray-900 font-bold">94%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full w-[94%] shadow-sm shadow-green-500/20"></div></div>
                       </div>
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-medium text-gray-600">
                             <span>Experience Relevance</span>
                             <span className="text-gray-900 font-bold">76%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-orange-400 h-1.5 rounded-full w-[76%] shadow-sm shadow-orange-400/20"></div></div>
                       </div>
                    </div>

                    {/* Keywords Section */}
                    <div className="p-4 space-y-3">
                      <h5 className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">Matched Skills</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {['React', 'TypeScript', 'Node.js', 'Problem Solving'].map(skill => (
                          <span key={skill} className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-700 text-[10px] font-semibold rounded-md">{skill}</span>
                        ))}
                      </div>
                      <div className="flex items-start gap-2 mt-3 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-100/50">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="font-medium leading-snug">3 important keywords missing</span>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="p-2 border-t border-gray-50 bg-gray-50/80 rounded-b-2xl">
                      <div className="flex items-center justify-between px-3 py-2 text-brand-600 hover:text-brand-700 transition-colors cursor-default rounded-lg hover:bg-brand-50/50">
                        <span className="text-[12px] font-bold">View Full Resume Report</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Lower-Right AI Suggestions */}
                  <motion.div 
                    initial={{ opacity: 0, x: 15, y: 15 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-[88%] sm:w-[310px] bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 z-20"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between p-3.5 border-b border-gray-50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100/50">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-[13px] font-bold text-gray-800">AI Suggestions</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100/50 text-brand-700 text-[10px] font-bold tracking-wider uppercase">3 improvements</span>
                    </div>

                    {/* Suggestions */}
                    <div className="p-3.5 space-y-4">
                      <div className="flex gap-3">
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                          <Target className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-gray-900">Add measurable impact</p>
                          <p className="text-[11px] text-gray-500 leading-snug mt-0.5">Include metrics to strengthen your project experience.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                          <ScanLine className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-gray-900">Improve keyword coverage</p>
                          <p className="text-[11px] text-gray-500 leading-snug mt-0.5">Add missing skills relevant to your target role.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-gray-900">Strengthen summary</p>
                          <p className="text-[11px] text-gray-500 leading-snug mt-0.5">Make your professional summary more role-specific.</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="p-2 border-t border-gray-50 bg-brand-50/40 rounded-b-2xl">
                      <div className="flex items-center justify-between px-3 py-2 text-brand-700 hover:text-brand-800 transition-colors cursor-default rounded-lg hover:bg-brand-100/50">
                        <span className="text-[12px] font-bold">Optimize Resume</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Ecosystem Detail */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="hidden sm:flex absolute top-6 right-6 lg:top-12 lg:right-10 bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 p-2.5 items-center gap-2.5 z-30"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border border-green-100/50">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="pr-3">
                      <p className="text-[11px] font-bold text-gray-800 leading-tight mb-0.5">ATS Check</p>
                      <p className="text-[10px] text-gray-500 font-semibold leading-none">82 Score</p>
                    </div>
                  </motion.div>

                </div>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="order-1 lg:order-2 space-y-6">
                <Badge variant="default" className="bg-white border border-gray-200 text-gray-700">Resume Intelligence & ATS</Badge>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Beat the screeners.</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Before you even get the interview, your resume needs to pass the Applicant Tracking System. Our intelligent parser analyzes your resume against target roles and provides actionable improvement suggestions.
                </p>
              </motion.div>
            </div>

            {/* Domains & Companies */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6">
                <Badge variant="default" className="bg-white border border-gray-200 text-gray-700">Targeted Practice</Badge>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Domain & Company Packs.</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Stop practicing generic questions. Access targeted preparation packs for specific domains (Frontend, Backend, Data Science) and top companies, ensuring you practice the patterns they actually test for.
                </p>
                <NavLink to={ROUTES.EXPLORE_PACKS}>
                  <Button variant="ghost" className="px-0 text-brand-600 hover:text-brand-700">Explore Packs <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </NavLink>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                 <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
                   {previewBundles.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                       {previewBundles.map((bundle) => {
                         const isPopular = bundle.isPopular;
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
                           <div key={bundle.id} className="relative bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full transition-all hover:shadow-md cursor-default group">
                             {isPopular && (
                               <div className="absolute -top-3 -right-2 bg-brand-600 text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1 z-10">
                                 <Star className="w-3 h-3 fill-current" /> Popular
                               </div>
                             )}
                             <div className="flex items-start gap-3 mb-3">
                               <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${accentColor}`}>
                                 <Icon className="w-5 h-5" />
                               </div>
                               <div>
                                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{bundle.category}</p>
                                 <h3 className="text-[14px] font-bold text-gray-900 leading-tight group-hover:text-brand-600 transition-colors">{bundle.name}</h3>
                               </div>
                             </div>
                             <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">{bundle.description}</p>
                             
                             <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold">
                               <span className="text-brand-600">{bundle.interviewsCount} Modules</span>
                               <NavLink to={ROUTES.EXPLORE_PACK_DETAILS.replace(':id', bundle.id)} className="text-gray-400 group-hover:text-brand-600 transition-colors flex items-center gap-0.5">Explore <ChevronRight className="w-3.5 h-3.5" /></NavLink>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   ) : (
                     <div className="text-center space-y-3">
                       <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                         <Building2 className="w-5 h-5 text-gray-400" />
                       </div>
                       <p className="text-sm font-medium text-gray-500">No practice packs available at the moment.</p>
                     </div>
                   )}
                 </div>
              </motion.div>
            </div>

            {/* Roadmap & Feedback */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="order-2 lg:order-1">
                 <div className="rounded-2xl bg-white border border-gray-200 shadow-xl shadow-gray-200/40 overflow-hidden flex flex-col max-h-[500px]">
                   {/* Header */}
                   <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-brand-600" />
                       <span className="font-semibold text-gray-900 text-sm">Your Improvement Roadmap</span>
                     </div>
                     <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                       Personalized
                     </span>
                   </div>
                   
                   {/* Summary Area */}
                   <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between">
                     <div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Interview Readiness</p>
                       <p className="text-xs text-gray-500 font-medium">Based on latest feedback</p>
                     </div>
                     <div className="w-12 h-12 rounded-full border-[3px] border-gray-100 border-t-brand-600 border-r-brand-600 flex items-center justify-center rotate-45">
                       <span className="text-sm font-bold text-gray-900 -rotate-45">68%</span>
                     </div>
                   </div>

                   {/* Roadmap List */}
                   <div className="p-6 bg-gray-50/50 flex-grow overflow-y-auto">
                     <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                       
                       {/* Stage 1 */}
                       <div className="relative pl-6">
                         <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm flex items-center justify-center">
                           <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                         </div>
                         <h4 className="text-sm font-bold text-gray-900">Technical Fundamentals</h4>
                         <p className="text-xs text-gray-500 mt-1">Completed &middot; Core concepts improved</p>
                       </div>

                       {/* Stage 2 */}
                       <div className="relative pl-6">
                         <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-brand-600 border-2 border-white shadow-sm ring-4 ring-brand-50"></div>
                         <h4 className="text-sm font-bold text-brand-700">DSA & Problem Solving</h4>
                         <p className="text-xs text-gray-500 mt-1">Current focus &middot; 3 tasks remaining</p>
                         <div className="mt-3 bg-white border border-brand-100 rounded-md p-3 shadow-sm flex items-start gap-2 relative overflow-hidden">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>
                           <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                           <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">AI Focus</p>
                             <p className="text-xs text-gray-600 font-medium leading-tight">Improve problem-solving explanations before mock interviews.</p>
                           </div>
                         </div>
                       </div>

                       {/* Stage 3 */}
                       <div className="relative pl-6">
                         <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
                         <h4 className="text-sm font-semibold text-gray-600">Communication Skills</h4>
                         <p className="text-xs text-gray-400 mt-1">Practice structured explanations</p>
                       </div>

                       {/* Stage 4 */}
                       <div className="relative pl-6">
                         <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                           <Lock className="w-2.5 h-2.5 text-gray-400" />
                         </div>
                         <h4 className="text-sm font-medium text-gray-400">Mock Interview</h4>
                         <p className="text-xs text-gray-400 mt-1">Unlock after current focus</p>
                       </div>

                     </div>
                   </div>
                 </div>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="order-1 lg:order-2 space-y-6">
                <Badge variant="default" className="bg-white border border-gray-200 text-gray-700">Learning & Growth</Badge>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Personalized Roadmaps.</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  After every interview, receive granular feedback on your communication, technical accuracy, and structural delivery. The platform automatically generates a learning roadmap to target your specific weaknesses.
                </p>
              </motion.div>
            </div>

          </div>
        </Container>
      </section>

      {/* 13. Value Proposition (Replaces Testimonials) */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-4 bg-white border border-gray-200 text-gray-700">Built for Better Preparation</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-6">Built for real interview preparation.</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Everything you practice should move you closer to being interview-ready. Interviu AI connects targeted practice, detailed feedback, and personalized improvement into one focused preparation journey.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-6 shrink-0 border border-brand-100">
                <Target className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Practice with structure</h3>
              <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                Prepare for the roles, domains, and companies you actually want to target.
              </p>
              <div className="pt-4 border-t border-gray-50 mt-auto">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Targeted Practice</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 shrink-0 border border-blue-100">
                <MessageSquareText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get actionable feedback</h3>
              <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                Understand what went well, where you struggled, and what to improve next.
              </p>
              <div className="pt-4 border-t border-gray-50 mt-auto">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">AI-Powered Feedback</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 shrink-0 border border-indigo-100">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track real progress</h3>
              <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                Turn interview feedback into a clear roadmap and improve step by step.
              </p>
              <div className="pt-4 border-t border-gray-50 mt-auto">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Personalized Growth</span>
              </div>
            </div>

          </div>

          <div className="text-center max-w-2xl mx-auto bg-white p-10 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to start preparing?</h3>
            <p className="text-gray-600 mb-8">
              Explore targeted practice, AI feedback, and personalized roadmaps in one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NavLink to={ROUTES.REGISTER}>
                <Button className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-sm">
                  Get Started
                </Button>
              </NavLink>
              <NavLink to={ROUTES.EXPLORE_PACKS} className="text-brand-600 font-semibold hover:text-brand-700 transition-colors px-4 py-2">
                Explore Practice Packs
              </NavLink>
            </div>
          </div>
        </Container>
      </section>

      {/* 14. FAQ */}
      <section className="py-24 bg-white" id="faq">
        <Container className="max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Frequently Asked Questions</h2>
          </div>
          <Accordion 
            items={[
              { title: "Is Interviu AI free to use?", content: "We offer a free tier that includes basic resume analysis and limited interview practice to help you get started." },
              { title: "How does the AI interview work?", content: "You will engage in a simulated voice or text conversation with an AI agent programmed to act as a hiring manager for your specific domain." },
              { title: "Does this guarantee a job?", content: "While no platform can guarantee a job, our focused preparation methods significantly improve your interview readiness and confidence." },
              { title: "Are company packs accurate?", content: "Company packs are built around historically known interview structures and common principles for those organizations, designed to simulate their difficulty and style." }
            ]}
          />
        </Container>
      </section>

      {/* 15. Pricing Preview (Placeholder Safety) */}
      <section className="py-24 bg-gray-50 border-y border-gray-100" id="pricing">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-600">Invest in your career.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="border-gray-200 shadow-md">
              <CardContent className="p-12 text-center">
                <ShieldCheck className="h-12 w-12 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pricing Information Coming Soon</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We are currently finalizing our subscription tiers to ensure the best value for students. Sign up now to access the free tier and receive early updates.
                </p>
                <NavLink to={ROUTES.REGISTER}>
                  <Button size="lg">Create Free Account</Button>
                </NavLink>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* 16. Final CTA */}
      <section className="py-24 bg-white text-center">
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-6">Ready to ace your next interview?</h2>
            <p className="text-xl text-gray-600 mb-10">Join other students actively preparing with Interviu AI.</p>
            <NavLink to={ROUTES.REGISTER}>
              <Button size="lg" className="h-14 px-10 text-lg shadow-premium">
                Get Started for Free
              </Button>
            </NavLink>
          </motion.div>
        </Container>
      </section>

    </div>
  );
}