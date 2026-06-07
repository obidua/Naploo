'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Tag, Star, Image as ImageIcon, UserCircle2, Hotel, Calendar, IndianRupee, Building2, LogOut, Loader2, AlertCircle,
  Sparkles, ClipboardList, Wrench, UtensilsCrossed, Settings, Users2,
  Receipt, BarChart3, Plus, FileText, Key, BookOpen,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { pmsApi, isModuleEnabled, type PartnerConfig } from './pms-api';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  module?: string;            // optional: only show if module enabled
  ownerOnly?: boolean;
  exact?: boolean;
  highlight?: boolean;        // primary action style
}

const ALL_NAV: NavItem[] = [
  { href: '/partner/portal', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/partner/portal/today', label: 'Today', icon: ClipboardList },
  { href: '/partner/portal/walk-in', label: 'Walk-in booking', icon: Plus, highlight: true, module: 'walk_in' },
  { href: '/partner/portal/bookings', label: 'Bookings', icon: Calendar },
  { href: '/partner/portal/inventory', label: 'Rooms & pods', icon: Hotel },
  { href: '/partner/portal/calendar', label: 'Calendar', icon: Calendar },
  { href: '/partner/portal/housekeeping', label: 'Housekeeping', icon: Wrench, module: 'housekeeping' },
  { href: '/partner/portal/pos', label: 'F&B POS', icon: UtensilsCrossed, module: 'fnb_pos' },
  { href: '/partner/portal/menu', label: 'Menu & outlets', icon: BookOpen, module: 'fnb_pos' },
  { href: '/partner/portal/services', label: 'Extras & services', icon: Sparkles, module: 'extra_services' },
  { href: '/partner/portal/rates', label: 'Rate plans', icon: BarChart3, module: 'corporate_rates' },
  { href: '/partner/portal/api-keys', label: 'OTA API keys', icon: Key, ownerOnly: true },
  { href: '/partner/portal/earnings', label: 'Earnings', icon: IndianRupee, ownerOnly: true },
  { href: '/partner/portal/reports', label: 'Reports', icon: FileText, module: 'advanced_reports', ownerOnly: true },
  { href: '/partner/portal/staff', label: 'Staff', icon: Users2, ownerOnly: true },
  { href: '/partner/portal/taxes', label: 'Taxes', icon: Receipt, ownerOnly: true },
  { href: '/partner/portal/settings', label: 'Settings', icon: Settings, ownerOnly: true },
];

const TIER_LABEL: Record<string, string> = {
  homestay: 'Homestay',
  hostel: 'Hostel',
  budget_1_star: '1-star Budget',
  mid_2_star: '2-star Mid',
  standard_3_star: '3-star Standard',
  premium_4_star: '4-star Premium',
  luxury_5_star: '5-star Luxury',
  service_apartment: 'Service Apartment',
  pod_hotel: 'Pod Hotel',
};

export default function PortalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [config, setConfig] = useState<PartnerConfig | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/partner/portal/login');
      return;
    }
    if (!['partner', 'admin', 'super_admin'].includes(user.role || '')) {
      router.replace('/partner/portal/login');
      return;
    }
    setChecking(false);
    // Load PMS config (tier + featuresEnabled)
    pmsApi.getConfig().then((res) => {
      if (res.data) setConfig(res.data);
    });
  }, [isAuthenticated, user, router]);

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
      </main>
    );
  }

  const isOwner = config?.staffRole === 'owner';
  const visibleNav = ALL_NAV.filter((item) => {
    if (item.ownerOnly && !isOwner) return false;
    if (item.module && config && !isModuleEnabled(config, item.module)) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[250px_1fr] gap-6 py-6">
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-3">
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Partner'}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {config ? `${TIER_LABEL[config.tier] || config.tier} • ${config.staffRole.replace('_', ' ')}` : (user?.email || user?.phone)}
                </div>
              </div>
            </div>
            <nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto">
              {visibleNav.map((item) => {
                const Icon = item.icon;
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                      active && 'bg-primary-50 text-primary-700',
                      !active && item.highlight && 'bg-gradient-to-r from-primary-50 to-violet-50 text-primary-700 hover:from-primary-100 hover:to-violet-100',
                      !active && !item.highlight && 'text-slate-600 hover:bg-slate-50'
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
                  router.push('/partner/portal/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </nav>
          </div>
          <div className="hidden lg:block text-[11px] text-slate-400 text-center">
            Naploo Partner PMS
          </div>
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
