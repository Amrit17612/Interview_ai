import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Globe, Mail, Link as LinkIcon } from 'lucide-react';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1">
            <NavLink to={ROUTES.HOME} className="flex items-center mb-4">
              <span className="text-xl font-bold text-brand-600 tracking-tight">Interviu AI</span>
            </NavLink>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Premium AI-powered interview preparation platform focused on helping students succeed in technical and behavioral interviews.
            </p>
            <div className="flex space-x-4 text-gray-400">
              <a href="https://interview-ai-two-gamma.vercel.app" target="_blank" rel="noopener noreferrer" aria-label="Website" className="hover:text-gray-900 transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="mailto:interviuai.official@gmail.com" aria-label="Contact" className="hover:text-gray-900 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="https://github.com/Amrit17612/Interview_ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository" className="hover:text-gray-900 transition-colors">
                <LinkIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider uppercase">Platform</h3>
            <ul className="space-y-3">
              <li><NavLink to={ROUTES.FEATURES} className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Features</NavLink></li>
              <li><NavLink to={ROUTES.PRICING} className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Pricing</NavLink></li>
              <li><NavLink to={ROUTES.INTERVIEW_DOMAINS} className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Interview Domains</NavLink></li>
              <li><NavLink to={ROUTES.COMPANY_PREP_PUBLIC} className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Company Prep</NavLink></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider uppercase">Company</h3>
            <ul className="space-y-3">
              <li><NavLink to={ROUTES.ABOUT} className="text-sm text-gray-600 hover:text-brand-600 transition-colors">About Us</NavLink></li>
              <li><NavLink to={ROUTES.CONTACT} className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Contact</NavLink></li>
              <li><NavLink to={ROUTES.FAQ} className="text-sm text-gray-600 hover:text-brand-600 transition-colors">FAQ</NavLink></li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider uppercase">Legal</h3>
            <ul className="space-y-3">
              <li><NavLink to={ROUTES.PRIVACY_POLICY} className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Privacy Policy</NavLink></li>
              <li><NavLink to={ROUTES.TERMS} className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Terms of Service</NavLink></li>
              <li><NavLink to={ROUTES.COOKIE_POLICY} className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Cookie Policy</NavLink></li>
              <li><NavLink to={ROUTES.REFUND_POLICY} className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Refund Policy</NavLink></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Interviu AI. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Designed for students</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
