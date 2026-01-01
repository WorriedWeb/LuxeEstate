import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { ChatBot } from './ChatBot';
import { LeadPopup } from './LeadPopup';
import { SEO } from './SEO';
import { mockService } from '../services/mockService';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Footer newsletter state

  const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState<string | null>(null);

const handleSubscribe = async () => {
  if (!email) return;

  try {
    setLoading(true);
    const res = await mockService.subscribeNewsletter(email);
    setMessage(res.message || 'Subscribed successfully');
    setEmail('');
  } catch (err: any) {
    setMessage(err.message || 'Subscription failed');
  } finally {
    setLoading(false);
  }
};


  // Helper to determine if the current page has a Hero section (full width image at top)
  const isHeroPage = () => {
    const path = location.pathname;
    if (path === '/' || path === '') return true; // Home
    if (path === '/about') return true; // About
    if (path.startsWith('/properties/') && path !== '/properties') return true; // Property Details (not list)
    if (path.startsWith('/blog/') && path !== '/blog') return true; // Blog Details (not list)
    return false;
  };

  const hasHero = isHeroPage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    
    // Base classes
    const common = "text-sm font-bold tracking-wide transition-all duration-300 relative group";
    
    // If we are on a hero page and haven't scrolled, use white text with shadow
    if (hasHero && !scrolled) {
      return isActive 
        ? `${common} text-white opacity-100 after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-white drop-shadow-md` 
        : `${common} text-white/90 hover:text-white hover:opacity-100 drop-shadow-md hover:after:content-[''] hover:after:absolute hover:after:-bottom-2 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-white/50`;
    }
    
    // Standard/Scrolled state
    return isActive 
      ? `${common} text-blue-600 after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-blue-600` 
      : `${common} text-gray-600 hover:text-blue-600 hover:after:content-[''] hover:after:absolute hover:after:-bottom-2 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-blue-200`;
  };

  const navbarBgClass = scrolled || !hasHero 
    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3' 
    : 'bg-transparent py-5 bg-gradient-to-b from-black/50 to-transparent'; 

  const logoColorClass = scrolled || !hasHero 
    ? 'text-gray-900' 
    : 'text-white drop-shadow-lg';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO title="LuxeEstate" description="Premium real estate listings and luxury homes." />
      {/* Interactive Widgets */}
      <ChatBot />
      <LeadPopup />

      {/* Header */}
      <header className={`fixed w-full z-40 transition-all duration-300 ${navbarBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Logo - Bold and Visible */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className={`text-3xl font-extrabold font-serif tracking-tight flex items-center gap-2 ${logoColorClass}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${scrolled || !hasHero ? 'bg-blue-600' : 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30'}`}>
                    <i className="fas fa-gem text-base"></i>
                </div>
                <span>Luxe<span className={scrolled || !hasHero ? 'text-blue-600' : 'text-blue-300'}>Estate</span></span>
              </Link>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 items-center">
              <Link to="/" className={getNavLinkClass('/')}>Home</Link>
              <Link to="/properties" className={getNavLinkClass('/properties')}>Properties</Link>
              <Link to="/agents" className={getNavLinkClass('/agents')}>Advisors</Link>
              <Link to="/about" className={getNavLinkClass('/about')}>About</Link>
              <Link to="/blog" className={getNavLinkClass('/blog')}>Blog</Link>
              <Link to="/contact" className={getNavLinkClass('/contact')}>Contact</Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {(user.role === 'ADMIN' || user.role === 'AGENT') && (
                    <Link 
                      to="/admin" 
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition ${scrolled || !hasHero ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm shadow-sm'}`}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button onClick={logout} className={`text-sm font-bold ${scrolled || !hasHero ? 'text-red-500' : 'text-red-200 hover:text-red-100 drop-shadow-md'} hover:text-red-600 transition`}>
                    Sign Out
                  </button>
                  <div className="h-9 w-9 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/properties" className={`px-6 py-2.5 rounded-full text-sm font-extrabold transition shadow-lg transform hover:-translate-y-0.5 ${scrolled || !hasHero ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30' : 'bg-white text-blue-900 hover:bg-gray-100'}`}>
                    Find Homes
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className={`text-xl focus:outline-none ${logoColorClass}`}
              >
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50">Home</Link>
              <Link to="/properties" className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50">Properties</Link>
              <Link to="/agents" className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50">Advisors</Link>
              <Link to="/about" className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50">About</Link>
              <Link to="/blog" className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50">Blog</Link>
              <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50">Contact</Link>
              {!user && (
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col space-y-3">
                    <Link to="/login" className="block text-center px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:bg-gray-50 border border-gray-200">Log In (Staff)</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`flex-grow ${hasHero ? '' : 'pt-24'}`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-3xl font-extrabold font-serif tracking-tight">
                 <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
                    <i className="fas fa-gem"></i>
                </div>
                <span>LuxeEstate</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Elevating the real estate experience with premium listings, exceptional advisors, and cutting-edge technology.
              </p>
              <div className="flex space-x-4 pt-2">
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-blue-400 hover:text-white transition"><i className="fab fa-twitter"></i></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-serif font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3 text-gray-400 text-sm font-medium">
                <li><Link to="/properties" className="hover:text-blue-400 transition flex items-center"><i className="fas fa-chevron-right text-xs mr-2"></i> Search Properties</Link></li>
                <li><Link to="/agents" className="hover:text-blue-400 transition flex items-center"><i className="fas fa-chevron-right text-xs mr-2"></i> Our Advisors</Link></li>
                <li><Link to="/blog" className="hover:text-blue-400 transition flex items-center"><i className="fas fa-chevron-right text-xs mr-2"></i> Real Estate News</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition flex items-center"><i className="fas fa-chevron-right text-xs mr-2"></i> About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-serif font-bold mb-6 text-white">Contact</h4>
              <ul className="space-y-4 text-gray-400 text-sm font-medium">
                <li className="flex items-start">
                    <i className="fas fa-map-marker-alt mt-1 mr-3 text-blue-500"></i>
                    <span>123 Luxury Lane, Suite 100<br/>Beverly Hills, CA 90210</span>
                </li>
                <li className="flex items-center">
                    <i className="fas fa-envelope mr-3 text-blue-500"></i>
                    <span>contact@luxeestate.com</span>
                </li>
                <li className="flex items-center">
                    <i className="fas fa-phone mr-3 text-blue-500"></i>
                    <span>+1 (800) 555-0199</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-serif font-bold mb-6 text-white">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">Subscribe to get the latest property updates.</p>
              <div className="flex flex-col space-y-3">
                <input type="email" placeholder="Your email address" value={email}
                onChange={e => setEmail(e.target.value)} className="bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg w-full focus:outline-none focus:border-blue-500 transition" />
                <button onClick={handleSubscribe} disabled={loading} className="bg-blue-600 px-4 py-3 rounded-lg hover:bg-blue-700 transition font-bold w-full text-sm uppercase tracking-wide">{loading ? '...' : 'Subscribe'}</button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm font-medium">
            <p>© 2024 LuxeEstate. All rights reserved.</p>
            <div className="flex flex-wrap gap-6 mt-4 md:mt-0 items-center">
                <Link to="/login" className="hover:text-blue-400 transition flex items-center gap-2">
                    <i className="fas fa-lock text-xs"></i> Admin Panel
                </Link>
                <Link to="/login" className="hover:text-blue-400 transition flex items-center gap-2">
                    <i className="fas fa-user-tie text-xs"></i> Advisor Login
                </Link>
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};