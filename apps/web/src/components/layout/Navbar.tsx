'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Explore Stays', href: '/pods' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Partner With Us', href: '/partner' },
  { name: 'Investor', href: '/investor' },
  { name: 'About', href: '/about' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-naploo-dark-DEFAULT/80 backdrop-blur-xl border-b border-white/10 py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              </div>
              <span className="text-2xl font-display font-bold text-white">
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
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-violet-600 rounded-xl hover:from-primary-600 hover:to-violet-700 transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white"
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
        <div className="absolute inset-0 bg-naploo-dark-DEFAULT/95 backdrop-blur-xl" />
        <div className="relative flex flex-col items-center justify-center h-full gap-6 p-8">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-display font-semibold text-white/80 hover:text-white transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-4 mt-8 w-full max-w-xs">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 text-center text-white/80 border border-white/20 rounded-xl hover:bg-white/5 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 text-center text-white bg-gradient-to-r from-primary-500 to-violet-600 rounded-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
