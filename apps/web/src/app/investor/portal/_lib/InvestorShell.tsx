'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Wallet, Package, TrendingUp, FileText, Briefcase,
  LogOut, Loader2, AlertCircle, User,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/investor/portal', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/investor/portal/offers', label: 'Open offers', icon: Briefcase },
  { href: '/investor/portal/investments', label: 'My investments', icon: Package },
  { href: '/investor/portal/earnings', label: 'Earnings', icon: TrendingUp },
  { href: '/investor/portal/payouts', label: 'Payouts', icon: Wallet },
  { href: '/investor/portal/agreements', label: 'Agreements', icon: FileText },
  { href: '/investor/portal/profile', label: 'Profile & KYC', icon: User },
];

export default function InvestorShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/investor/portal/login');
      return;
    }
    // Investors can be customer/investor/admin role — for simplicity, any auth user can access
    setChecking(false);
  }, [isAuthenticated, user, router]);

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[240px_1fr] gap-6 py-6">
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-3">
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Investor'}
                </div>
                <div className="text-xs text-slate-500 truncate">{user?.email || user?.phone}</div>
              </div>
            </div>
            <nav className="space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                      active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  router.push('/investor/portal/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </nav>
          </div>
          <div className="hidden lg:block text-[11px] text-slate-400 text-center">Naploo Investor Portal</div>
        </aside>

        <section>{children}</section>
      </div>
    </main>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {message}
    </div>
  );
}
