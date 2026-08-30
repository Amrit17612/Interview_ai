import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Accordion } from '../../../components/ui/Accordion';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  BrainCircuit, 
  FileSearch, 
  Building2, 
  TrendingUp, 
  Play, 
  ShieldCheck,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import lpuLogo from '../../../assets/logos/lpu-logo.svg';
import amityLogo from '../../../assets/logos/amity-logo-official.png';
import parulLogo from '../../../assets/logos/parul-logo.svg';

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
  return (
    <div className="flex flex-col min-h-screen">
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
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-white">
                  <Play className="mr-2 h-4 w-4" /> View Demo
                </Button>
              </a>
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
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {/* Authentic university logos */}
            <img 
              src={lpuLogo} 
              alt="Lovely Professional University" 
              className="h-10 md:h-12 w-auto object-contain opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" 
            />
            <img 
              src={amityLogo} 
              alt="Amity University, Noida" 
              className="h-10 md:h-12 w-auto object-contain opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" 
            />
            <img 
              src={parulLogo} 
              alt="Parul University" 
              className="h-10 md:h-12 w-auto object-contain opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" 
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
              className="relative rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden aspect-video flex items-center justify-center"
            >
               {/* UI Mockup Placeholder */}
               <div className="text-gray-400 font-medium">[Platform UI Preview Mockup]</div>
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
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="order-2 lg:order-1">
                <div className="rounded-2xl bg-gray-50 border border-gray-200 aspect-[4/3] flex items-center justify-center p-8">
                   <div className="w-full max-w-sm space-y-4 text-left">
                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                     <div className="h-4 bg-gray-200 rounded w-full"></div>
                     <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                     <div className="mt-8 border-t border-gray-200 pt-4 flex justify-between items-center text-sm font-bold text-brand-600">
                       <span>ATS Match Score</span>
                       <span>[ UI Preview ]</span>
                     </div>
                   </div>
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
                <Button variant="ghost" className="px-0 text-brand-600 hover:text-brand-700">Explore Packs <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                 <div className="rounded-2xl bg-gray-50 border border-gray-200 aspect-[4/3] flex items-center justify-center p-8">
                   <div className="grid grid-cols-2 gap-4 w-full">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-sm font-medium text-gray-400">
                         [Company Prep Card]
                       </div>
                     ))}
                   </div>
                 </div>
              </motion.div>
            </div>

            {/* Roadmap & Feedback */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="order-2 lg:order-1">
                 <div className="rounded-2xl bg-gray-50 border border-gray-200 aspect-[4/3] flex items-center justify-center p-8">
                   <div className="w-full space-y-4">
                     <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                       <CheckCircle2 className="h-5 w-5 text-green-500" />
                       <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                     </div>
                     <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100 opacity-50">
                       <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                       <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                     </div>
                     <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100 opacity-50">
                       <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                       <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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

      {/* 13. Testimonials / Social Proof (Placeholder Safety) */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Student Success</h2>
            <p className="text-lg text-gray-600">Hear from students who landed their roles.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <Card key={i} className="border-gray-100 bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-4 text-brand-600">
                    {[1,2,3,4,5].map(star => <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                  </div>
                  <p className="text-gray-600 italic mb-6">"[Design Preview: Genuine student testimonial will be displayed here detailing their success and platform experience.]"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-medium">U</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">[Student Name]</div>
                      <div className="text-xs text-gray-500">Placed at [Company]</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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