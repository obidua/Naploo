'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-24 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
