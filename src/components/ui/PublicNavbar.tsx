import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Button } from './Button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';

export function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink to={ROUTES.HOME} className="flex items-center">
            <span className="text-xl font-bold text-brand-600 tracking-tight">Interviu AI</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Features</a>
            <a href="#domains" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Domains</a>
            <a href="#roadmap" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Roadmap</a>
            <NavLink to={ROUTES.PRICING} className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Pricing</NavLink>
            <NavLink to={ROUTES.ABOUT} className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">About</NavLink>
          </nav>

          {/* Desktop Auth CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm">Sign In</Button>
            </NavLink>
            <NavLink to={ROUTES.REGISTER}>
              <Button size="sm">Get Started</Button>
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 transition-all duration-300 ease-in-out shadow-lg overflow-hidden",
        isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 pt-2 pb-6 space-y-1">
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-900 rounded-md hover:bg-gray-50">Features</a>
          <a href="#domains" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-900 rounded-md hover:bg-gray-50">Domains</a>
          <a href="#roadmap" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-900 rounded-md hover:bg-gray-50">Roadmap</a>
          <NavLink to={ROUTES.PRICING} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-900 rounded-md hover:bg-gray-50">Pricing</NavLink>
          <NavLink to={ROUTES.ABOUT} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-900 rounded-md hover:bg-gray-50">About</NavLink>
          <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col space-y-2">
            <NavLink to={ROUTES.LOGIN} onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">Sign In</Button>
            </NavLink>
            <NavLink to={ROUTES.REGISTER} onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full justify-center">Get Started</Button>
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}
