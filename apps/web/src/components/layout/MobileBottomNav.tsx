'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const bottomNavLinks = [
  { name: 'Home', icon: '🏠', href: '/' },
  { name: 'Explore', icon: '🔍', href: '/pods' },
  { name: 'Booking', icon: '📅', href: '/pods' },
  { name: 'Account', icon: '👤', href: '/login' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-naploo-dark-DEFAULT/95 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-around h-20">
        {bottomNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs font-medium transition-all',
              pathname === link.href
                ? 'text-primary-400'
                : 'text-white/50 hover:text-white'
            )}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-[10px]">{link.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
