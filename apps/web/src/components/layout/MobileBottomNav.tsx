'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const baseNavLinks = [
  { name: 'Home', icon: '🏠', href: '/' },
  { name: 'Explore', icon: '🔍', href: '/pods' },
  { name: 'Book', icon: '📅', href: '/pods' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('naploo_user');
        if (userData) {
          const user = JSON.parse(userData);
          setIsLoggedIn(user.isLoggedIn === true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    
    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener('storage', checkAuth);
    
    // Custom event for same-tab login/logout
    window.addEventListener('authChange', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  // Dynamic profile link based on auth state
  const profileLink = {
    name: 'Profile',
    icon: '👤',
    href: isLoggedIn ? '/profile' : '/login',
  };

  const bottomNavLinks = [...baseNavLinks, profileLink];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Clean white background */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" />
      
      {/* Nav content */}
      <div className="relative flex items-center justify-around h-16 px-2 max-w-md mx-auto pb-safe">
        {bottomNavLinks.map((link) => {
          const isActive = pathname === link.href || 
            (link.href !== '/' && pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 rounded-xl transition-all duration-200 active:scale-95',
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-gray-50'
              )}
            >
              <span className={cn(
                'text-xl transition-transform duration-200',
                isActive && 'scale-110'
              )}>
                {link.icon}
              </span>
              <span className={cn(
                'text-[10px] font-medium transition-all',
                isActive ? 'text-primary-600' : 'text-slate-400'
              )}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
