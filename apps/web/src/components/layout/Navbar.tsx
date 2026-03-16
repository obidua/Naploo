'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Explore Stays', href: '/pods' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Partner With Us', href: '/partner' },
  { name: 'Buy Pods', href: '/investor' },
  { name: 'Download App', href: '/download' },
  { name: 'About', href: '/about' },
];

interface User {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  isLoggedIn: boolean;
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isHeroSection, setIsHeroSection] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Pages that have a dark hero section
  const hasDarkHero = pathname === '/';
  const useWhiteText = hasDarkHero && isHeroSection && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setIsHeroSection(window.scrollY < window.innerHeight * 0.6);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for logged in user
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('naploo_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.isLoggedIn) {
            setUser(parsed);
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    };
    checkUser();
    // Listen for storage changes
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('naploo_user');
    setUser(null);
    setShowProfileMenu(false);
    router.push('/');
  };

  const getInitials = (name?: string, phone?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return phone?.slice(-2) || 'U';
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100 py-3'
            : hasDarkHero
              ? 'bg-transparent py-5'
              : 'bg-white py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <span className={cn(
                "text-2xl font-display font-bold transition-colors duration-300",
                useWhiteText ? 'text-white' : 'text-slate-800'
              )}>
                Naploo
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                    pathname === link.href
                      ? useWhiteText
                        ? 'text-white bg-white/15'
                        : 'text-primary-600 bg-primary-50'
                      : useWhiteText
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-gray-50'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                // Logged in - Show Profile
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl border transition-all",
                      useWhiteText
                        ? "bg-white/10 hover:bg-white/20 border-white/20"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(user.name, user.phone)}
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className={cn("text-sm font-medium", useWhiteText ? "text-white" : "text-slate-800")}>{user.name || 'User'}</p>
                      <p className={cn("text-xs", useWhiteText ? "text-white/60" : "text-slate-500")}>{user.phone}</p>
                    </div>
                    <svg className={cn("w-4 h-4 transition-transform", useWhiteText ? "text-white/60" : "text-slate-400", showProfileMenu && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                            {getInitials(user.name, user.phone)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{user.name || 'User'}</p>
                            <p className="text-sm text-slate-500">{user.email || user.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link href="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          My Profile
                        </Link>
                        <Link href="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          My Bookings
                        </Link>
                        <Link href="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                          Wallet
                        </Link>
                        <Link href="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Settings
                        </Link>
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Not logged in - Show Login/Signup
                <>
                  <Link href="/login" className={cn("px-5 py-2.5 text-sm font-medium transition-colors", useWhiteText ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900")}>
                    Login
                  </Link>
                  <Link href="/signup" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-violet-600 rounded-xl hover:from-primary-600 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn("lg:hidden p-2", useWhiteText ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900")}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-all duration-300',
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="absolute inset-0 bg-white/98 backdrop-blur-xl" />
        <div className="relative flex flex-col items-center justify-center h-full gap-6 p-8">
          {user && (
            <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-primary-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-semibold">
                {getInitials(user.name, user.phone)}
              </div>
              <div>
                <p className="font-medium text-slate-800">{user.name || 'User'}</p>
                <p className="text-sm text-slate-500">{user.phone}</p>
              </div>
            </div>
          )}
          
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-display font-semibold text-slate-700 hover:text-primary-600 transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex flex-col gap-4 mt-8 w-full max-w-xs">
            {user ? (
              <>
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 text-center text-white bg-gradient-to-r from-primary-500 to-violet-600 rounded-xl font-semibold">
                  My Profile
                </Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full py-3 text-center text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 text-center text-slate-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                  Login
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 text-center text-white bg-gradient-to-r from-primary-500 to-violet-600 rounded-xl font-semibold">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
