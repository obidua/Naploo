'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api, authApi } from '@/lib/api';
import { POD_CATALOGUE, type PodCatalogueModel } from '@/lib/podCatalogue';
import type { AdminPage } from './types';
import * as D from './data';
import { useAdminData } from './data';
import {
  LayoutDashboard, Users, Building2, Calendar, Ticket, FileText,
  CreditCard, MapPin, Settings, Bell, LogOut, ChevronRight,
  IndianRupee, Search, Menu, X, BarChart3,
  Star, ArrowUpRight, ArrowRight,
  ArrowDownRight, MoreHorizontal, Filter, Download, RefreshCw,
  UserPlus, Layers, Megaphone, BookOpen,
  Lock, Shield, Wallet, BedDouble, Hotel,
  Percent, Tag, Gift, Network, Hash,
  Ban, Edit, Trash2, Plus, Minus, ChevronLeft, Copy, Eye,
  CircleCheck, CircleDot, AlertCircle, Clock, CheckCircle,
  MessageSquare, Calculator, TrendingUp, TrendingDown
} from 'lucide-react';

// ============================
// ADMIN AUTH LOGIN PAGE
// ============================
function AdminLogin({ onLogin }: { onLogin: (email: string, pass: string) => Promise<boolean> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await onLogin(email, password);
    if (!ok) {
      setError('Invalid credentials or insufficient privileges.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Naploo Admin</h1>
          <p className="text-sm text-white/40 mt-1">Secure Dashboard Access</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-white/50 block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-white/20"
              placeholder="admin@naploo.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-white/20"
              placeholder="••••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
          <p className="text-[10px] text-white/20 text-center">Protected area. Unauthorized access is prohibited.</p>
        </form>
      </div>
    </div>
  );
}

// ============================
// SIDEBAR CONFIGURATION
// ============================
const sidebarSections: { title: string; items: { id: AdminPage; label: string; icon: React.ElementType; badge?: number; href?: string }[] }[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'notifications', label: 'Notifications', icon: Bell, badge: 5 },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'User Management',
    items: [
      { id: 'users', label: 'All Users', icon: Users, badge: 12 },
      { id: 'partners', label: 'Partners', icon: Hotel },
      { id: 'investors', label: 'Investors', icon: Wallet },
      { id: 'associates', label: 'Associates (MLM)', icon: Network },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { id: 'pods', label: 'Pod Sets & Pods', icon: Building2 },
      { id: 'rooms', label: 'Rooms', icon: BedDouble },
      { id: 'locations', label: 'Locations', icon: MapPin },
    ],
  },
  {
    title: 'Bookings & Revenue',
    items: [
      { id: 'bookings', label: 'Bookings', icon: Calendar, badge: 8 },
      { id: 'payments', label: 'Payments', icon: CreditCard },
      { id: 'payouts', label: 'Payouts', icon: IndianRupee },
      { id: 'coupons', label: 'Coupons & Deals', icon: Tag },
      { id: 'investor-offers', label: 'Investor Offers', icon: Tag, href: '/admin/offers' },
    ],
  },
  {
    title: 'Support & Applications',
    items: [
      { id: 'tickets', label: 'Support Tickets', icon: Ticket, badge: 23 },
      { id: 'applications', label: 'Applications', icon: FileText },
      { id: 'reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'commissions', label: 'Commission Config', icon: Percent },
      { id: 'deal-calculator', label: 'Deal Calculator', icon: Calculator },
      { id: 'staff', label: 'Staff', icon: Shield },
      { id: 'naploo-team', label: 'Naploo team', icon: Shield, href: '/admin/team' },
      { id: 'marketing', label: 'Marketing', icon: Megaphone },
      { id: 'content', label: 'Content', icon: BookOpen },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

// ============================
// REUSABLE COMPONENTS
// ============================
function StatCard({ label, value, change, trend, icon: Icon, color }: { label: string; value: string; change?: string; trend?: 'up' | 'down'; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status, map }: { status: string; map: Record<string, string> }) {
  const cls = map[status] || 'bg-slate-50 text-slate-500';
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>{status.replace(/_/g, ' ').replace(/-/g, ' ')}</span>;
}

function PageHeader({ count, children }: { count?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        {count && <p className="text-sm text-slate-400">Total <span className="font-semibold text-slate-700">{count}</span></p>}
      </div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input value={value} onChange={e => onChange(e.target.value)} className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 w-56" placeholder={placeholder || 'Search...'} />
    </div>
  );
}

function DataTable({ headers, children }: { headers: { label: string; align?: string }[]; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {headers.map(h => (
                <th key={h.label} className={`text-xs font-medium text-slate-400 px-5 py-3 ${h.align === 'center' ? 'text-center' : h.align === 'right' ? 'text-right' : 'text-left'}`}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const s = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  return <div className={`${s} rounded-full bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center text-primary-600 font-bold`}>{initials}</div>;
}

function FilterBtn() {
  return <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-slate-600 hover:border-gray-300"><Filter className="w-4 h-4" /> Filter</button>;
}

function ExportBtn() {
  return <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-slate-600 hover:border-gray-300"><Download className="w-4 h-4" /> Export</button>;
}

function AddBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-violet-600 rounded-xl hover:opacity-90 transition"><Plus className="w-4 h-4" /> {label}</button>;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-50 text-green-600', confirmed: 'bg-blue-50 text-blue-600', checked_in: 'bg-green-50 text-green-600',
  checked_out: 'bg-slate-50 text-slate-500', completed: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-500',
  pending: 'bg-amber-50 text-amber-600', 'no_show': 'bg-red-50 text-red-600', suspended: 'bg-red-50 text-red-600',
  banned: 'bg-red-100 text-red-700', inactive: 'bg-slate-50 text-slate-500', terminated: 'bg-red-100 text-red-700',
  approved: 'bg-green-50 text-green-600', rejected: 'bg-red-50 text-red-600', 'under-review': 'bg-amber-50 text-amber-600',
  submitted: 'bg-blue-50 text-blue-600', open: 'bg-blue-50 text-blue-600', 'in-progress': 'bg-amber-50 text-amber-600',
  resolved: 'bg-green-50 text-green-600', closed: 'bg-slate-50 text-slate-500',
  processing: 'bg-amber-50 text-amber-600', failed: 'bg-red-50 text-red-600', refunded: 'bg-violet-50 text-violet-600',
  available: 'bg-green-50 text-green-600', occupied: 'bg-blue-50 text-blue-600', maintenance: 'bg-amber-50 text-amber-600',
  blocked: 'bg-red-50 text-red-600', offline: 'bg-slate-50 text-slate-500', setup: 'bg-cyan-50 text-cyan-600',
  'kyc_pending': 'bg-amber-50 text-amber-600', verified: 'bg-green-50 text-green-600', 'not_started': 'bg-slate-50 text-slate-500',
  published: 'bg-green-50 text-green-600', flagged: 'bg-red-50 text-red-600', hidden: 'bg-slate-50 text-slate-500',
  expired: 'bg-slate-50 text-slate-500', 'on-leave': 'bg-amber-50 text-amber-600',
  partially_refunded: 'bg-orange-50 text-orange-600',
};


// ============================
// ADMIN DASHBOARD (MAIN)
// ============================
export default function AdminDashboard() {
  const [adminAuth, setAdminAuth] = useState(false);
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Check admin session — also auto-login if the user is already authenticated
  // via the shared auth store with admin/super_admin role.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = sessionStorage.getItem('naploo-admin-session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.authenticated && parsed.expires > Date.now()) {
            setAdminAuth(true);
            return;
          }
        } catch { /* invalid session */ }
      }
      // Fallback: if user already logged in as admin in main auth store,
      // unlock the dashboard without asking for password again.
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated && authState.user && ['admin', 'super_admin'].includes(authState.user.role || '')) {
        sessionStorage.setItem('naploo-admin-session', JSON.stringify({
          authenticated: true,
          expires: Date.now() + 8 * 60 * 60 * 1000,
        }));
        setAdminAuth(true);
      }
    }
  }, []);

  // Load live admin data once authenticated
  useEffect(() => {
    if (adminAuth) {
      useAdminData.getState().loadAll();
    }
  }, [adminAuth]);

  // Cross-view navigation (Applications -> Deal Calculator with seed)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (detail.page) setActivePage(detail.page as AdminPage);
      if (detail.seed && typeof window !== 'undefined') {
        sessionStorage.setItem('naploo-deal-seed', JSON.stringify(detail.seed));
      }
    };
    window.addEventListener('naploo-admin-nav', handler);
    return () => window.removeEventListener('naploo-admin-nav', handler);
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    // Real authentication against the backend (JWT) with admin role gate
    const res = await authApi.login(email, password);
    if (res.error || !res.data?.success) return false;
    const { user, accessToken, refreshToken } = res.data;
    if (!['admin', 'super_admin'].includes(user.role)) return false;
    // Persist into the shared auth store so admin API calls carry the JWT
    const store = useAuthStore.getState();
    store.setTokens(accessToken, refreshToken);
    store.setUser(user as any);
    sessionStorage.setItem('naploo-admin-session', JSON.stringify({
      authenticated: true,
      email: user.email,
      role: user.role,
      loginAt: Date.now(),
      expires: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    }));
    setAdminAuth(true);
    return true;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('naploo-admin-session');
    useAuthStore.getState().logout();
    setAdminAuth(false);
  };

  if (!adminAuth) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-slate-900`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-sm">Naploo Admin</h2>
                <p className="text-[10px] text-white/40">admin.naploo.com</p>
              </div>
            </div>
          )}
          <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileMenuOpen(false); }} className="text-white/50 hover:text-white transition p-1">
            {sidebarOpen ? <X className="w-5 h-5 lg:hidden" /> : null}
            <Menu className="w-5 h-5 hidden lg:block" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
          {sidebarSections.map(sec => (
            <div key={sec.title}>
              {sidebarOpen && <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider px-3 mb-2">{sec.title}</p>}
              <div className="space-y-1">
                {sec.items.map(item => {
                  const isActive = activePage === item.id;
                  return (
                    <button key={item.id} onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }} title={!sidebarOpen ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-gradient-to-r from-primary-500/20 to-violet-600/20 text-white border border-primary-500/30' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.badge !== undefined && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'}`}>{item.badge}</span>}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        {sidebarOpen && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">AD</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin</p>
                <p className="text-[10px] text-white/40">Super Admin</p>
              </div>
              <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition" title="Logout"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-slate-500"><Menu className="w-5 h-5" /></button>
              <div>
                <h1 className="text-xl font-bold text-slate-800 capitalize">{activePage.replace(/-/g, ' ')}</h1>
                <p className="text-xs text-slate-400">admin.naploo.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-64 focus:outline-none focus:border-primary-500 transition" placeholder="Search anything..." />
              </div>
              <button className="relative p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition"><Bell className="w-5 h-5 text-slate-500" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /></button>
            </div>
          </div>
        </header>
        <div className="p-6">
          {activePage === 'dashboard' && <DashboardView />}
          {activePage === 'users' && <UsersView />}
          {activePage === 'partners' && <PartnersView />}
          {activePage === 'investors' && <InvestorsView />}
          {activePage === 'associates' && <AssociatesView />}
          {activePage === 'pods' && <PodsView />}
          {activePage === 'rooms' && <RoomsView />}
          {activePage === 'locations' && <LocationsView />}
          {activePage === 'bookings' && <BookingsView />}
          {activePage === 'payments' && <PaymentsView />}
          {activePage === 'payouts' && <PayoutsView />}
          {activePage === 'coupons' && <CouponsView />}
          {activePage === 'tickets' && <TicketsView />}
          {activePage === 'applications' && <ApplicationsView />}
          {activePage === 'reviews' && <ReviewsView />}
          {activePage === 'commissions' && <CommissionsView />}
          {activePage === 'deal-calculator' && <DealCalculatorView />}
          {activePage === 'staff' && <StaffView />}
          {activePage === 'analytics' && <AnalyticsView />}
          {activePage === 'marketing' && <MarketingView />}
          {activePage === 'content' && <ContentView />}
          {activePage === 'notifications' && <NotificationsView />}
          {activePage === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

// ============================
// DASHBOARD VIEW
// ============================
function DashboardView() {
  const D = useAdminData();
  const stats = D.getDashboardStats();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} change="+12.5%" trend="up" icon={Users} color="from-blue-500 to-cyan-500" />
        <StatCard label="Active Bookings" value={stats.activeBookings} change="+8.2%" trend="up" icon={Calendar} color="from-violet-500 to-purple-500" />
        <StatCard label="Revenue (MTD)" value={stats.monthRevenue} change="+23.1%" trend="up" icon={IndianRupee} color="from-green-500 to-emerald-500" />
        <StatCard label="Open Tickets" value={stats.openTickets} change="-5.3%" trend="down" icon={Ticket} color="from-amber-500 to-orange-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Partners" value={stats.totalPartners} icon={Hotel} color="from-indigo-500 to-blue-500" />
        <StatCard label="Active Investors" value={stats.activeInvestors} icon={Wallet} color="from-emerald-500 to-teal-500" />
        <StatCard label="Total Pods" value={stats.totalPods} icon={Building2} color="from-pink-500 to-rose-500" />
        <StatCard label="Avg Occupancy" value={stats.avgOccupancy} icon={BarChart3} color="from-cyan-500 to-blue-500" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-slate-800">Recent Bookings</h3>
            <span className="text-xs text-primary-600 font-medium cursor-pointer">View All →</span>
          </div>
          <div className="divide-y divide-gray-50">
            {D.mockBookings.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition">
                <div className="flex items-center gap-3">
                  <Avatar name={b.userName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{b.userName}</p>
                    <p className="text-[10px] text-slate-400">{b.bookingNumber} · {b.propertyName} · {b.bookingType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">₹{b.totalAmount.toLocaleString()}</p>
                  <StatusBadge status={b.status} map={statusColors} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-slate-800">Open Tickets</h3>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{stats.openTickets} open</span>
            </div>
            <div className="divide-y divide-gray-50">
              {D.mockTickets.filter(t => t.status === 'open' || t.status === 'in-progress').slice(0, 3).map(t => (
                <div key={t.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-400">{t.ticketNumber}</span>
                    <StatusBadge status={t.priority} map={{ urgent: 'bg-red-50 text-red-600', high: 'bg-amber-50 text-amber-600', medium: 'bg-blue-50 text-blue-600', low: 'bg-slate-50 text-slate-500' }} />
                  </div>
                  <p className="text-sm text-slate-700 truncate">{t.subject}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{t.userName} · {t.assignee || 'Unassigned'}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-slate-800">Pending Apps</h3>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{stats.pendingApps} pending</span>
            </div>
            <div className="divide-y divide-gray-50">
              {D.mockApplications.filter(a => a.status === 'submitted' || a.status === 'under-review').map(a => (
                <div key={a.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{a.businessName}</p>
                      <p className="text-[10px] text-slate-400">{a.type} · {a.city}</p>
                    </div>
                    <StatusBadge status={a.status} map={statusColors} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">Top Locations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100"><th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Location</th><th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Pods</th><th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Rooms</th><th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Occupancy</th><th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Revenue</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {D.mockLocations.filter(l => l.status === 'active').map(loc => (
                <tr key={loc.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3"><p className="text-sm font-medium text-slate-700">{loc.name}</p><p className="text-[10px] text-slate-400">{loc.city} · {loc.partnerName}</p></td>
                  <td className="text-center text-sm text-slate-600">{loc.totalPods}</td>
                  <td className="text-center text-sm text-slate-600">{loc.totalRooms}</td>
                  <td className="px-5 py-3 text-center"><div className="flex items-center justify-center gap-2"><div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${loc.occupancyRate > 80 ? 'bg-green-500' : loc.occupancyRate > 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${loc.occupancyRate}%` }} /></div><span className="text-xs text-slate-500">{loc.occupancyRate}%</span></div></td>
                  <td className="text-right text-sm font-semibold text-slate-700 px-5">₹{(loc.monthlyRevenue / 100000).toFixed(1)}L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ============================
// USERS VIEW
// ============================
function UsersView() {
  const D = useAdminData();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const filtered = useMemo(() => {
    let list = D.mockUsers;
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q) || u.phone.includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
    }
    return list;
  }, [search, roleFilter]);

  return (
    <div className="space-y-6">
      <PageHeader count="12,847">
        <SearchInput value={search} onChange={setSearch} placeholder="Search users..." />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-slate-600">
          <option value="all">All Roles</option>
          {['customer', 'partner', 'investor', 'associate', 'admin', 'super_admin'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <ExportBtn />
      </PageHeader>
      <DataTable headers={[{ label: 'User' }, { label: 'Contact' }, { label: 'Role', align: 'center' }, { label: 'KYC', align: 'center' }, { label: 'Bookings', align: 'center' }, { label: 'Status', align: 'center' }, { label: 'Actions', align: 'right' }]}>
        {filtered.map(u => (
          <tr key={u.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={`${u.firstName} ${u.lastName}`} /><div><p className="text-sm font-medium text-slate-700">{u.firstName} {u.lastName}</p><p className="text-[10px] text-slate-400">{u.id} · Joined {u.createdAt}</p></div></div></td>
            <td className="px-5 py-4"><p className="text-sm text-slate-600">{u.phone}</p><p className="text-[10px] text-slate-400">{u.email}</p></td>
            <td className="text-center"><StatusBadge status={u.role} map={{ customer: 'bg-blue-50 text-blue-600', partner: 'bg-violet-50 text-violet-600', investor: 'bg-emerald-50 text-emerald-600', associate: 'bg-orange-50 text-orange-600', admin: 'bg-slate-100 text-slate-700', super_admin: 'bg-red-50 text-red-600' }} /></td>
            <td className="text-center"><StatusBadge status={u.kycStatus} map={statusColors} /></td>
            <td className="text-center text-sm font-medium text-slate-700">{u.totalBookings}</td>
            <td className="text-center"><StatusBadge status={u.status} map={statusColors} /></td>
            <td className="text-right px-5"><div className="flex items-center justify-end gap-1"><button className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="View"><Eye className="w-4 h-4 text-slate-400" /></button><button className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="Edit"><Edit className="w-4 h-4 text-slate-400" /></button><button className="p-1.5 hover:bg-red-50 rounded-lg transition" title="Ban"><Ban className="w-4 h-4 text-slate-400" /></button></div></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}


// ============================
// PARTNERS VIEW
// ============================
function PartnersView() {
  const D = useAdminData();
  const [search, setSearch] = useState('');
  const filtered = D.mockPartners.filter(p => !search || p.businessName.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Active Partners" value={String(D.mockPartners.filter(p => p.status === 'active').length)} icon={Hotel} color="from-violet-500 to-purple-500" />
        <StatCard label="Pending Onboarding" value={String(D.mockPartners.filter(p => p.status === 'pending').length)} icon={Clock} color="from-amber-500 to-orange-500" />
        <StatCard label="Total Revenue Share" value={`₹${(D.mockPartners.reduce((s, p) => s + p.monthlyRevenue, 0) / 100000).toFixed(1)}L`} icon={IndianRupee} color="from-green-500 to-emerald-500" />
        <StatCard label="Avg Commission" value={`${(D.mockPartners.filter(p => p.status === 'active').reduce((s, p) => s + p.commissionPercent, 0) / D.mockPartners.filter(p => p.status === 'active').length).toFixed(0)}%`} icon={Percent} color="from-blue-500 to-cyan-500" />
      </div>
      <PageHeader><SearchInput value={search} onChange={setSearch} placeholder="Search partners..." /><FilterBtn /><ExportBtn /></PageHeader>
      <DataTable headers={[{ label: 'Partner' }, { label: 'Type', align: 'center' }, { label: 'Model', align: 'center' }, { label: 'Pods/Rooms', align: 'center' }, { label: 'Commission', align: 'center' }, { label: 'Revenue', align: 'right' }, { label: 'Rating', align: 'center' }, { label: 'Status', align: 'center' }, { label: 'Actions', align: 'right' }]}>
        {filtered.map(p => (
          <tr key={p.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-4"><p className="text-sm font-medium text-slate-700">{p.businessName}</p><p className="text-[10px] text-slate-400">{p.city}, {p.state} · {p.contactPerson}</p></td>
            <td className="text-center"><StatusBadge status={p.businessType} map={{ hotel: 'bg-blue-50 text-blue-600', homestay: 'bg-green-50 text-green-600' }} /></td>
            <td className="text-center text-xs text-slate-500">{p.partnershipModel.replace(/_/g, ' ')}</td>
            <td className="text-center text-sm text-slate-600">{p.totalPods}/{p.totalRooms}</td>
            <td className="text-center text-sm font-medium text-primary-600">{p.commissionPercent}%</td>
            <td className="text-right text-sm font-semibold text-slate-700 px-5">₹{(p.monthlyRevenue / 1000).toFixed(0)}K</td>
            <td className="text-center"><span className="text-sm text-amber-500 font-medium">{p.rating > 0 ? `${p.rating}★` : '—'}</span></td>
            <td className="text-center"><StatusBadge status={p.status} map={statusColors} /></td>
            <td className="text-right px-5"><div className="flex items-center justify-end gap-1"><button className="px-2.5 py-1 text-[10px] font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">View</button>{p.status === 'pending' && <button className="px-2.5 py-1 text-[10px] font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">Approve</button>}</div></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}


// ============================
// INVESTORS VIEW
// ============================
function InvestorsView() {
  const D = useAdminData();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Active Investors" value={String(D.mockInvestors.filter(i => i.status === 'active').length)} icon={Wallet} color="from-emerald-500 to-teal-500" />
        <StatCard label="Total Invested" value={`₹${(D.mockInvestors.reduce((s, i) => s + i.totalInvested, 0) / 100000).toFixed(1)}L`} icon={IndianRupee} color="from-green-500 to-emerald-500" />
        <StatCard label="Total Earned (Investors)" value={`₹${(D.mockInvestors.reduce((s, i) => s + i.totalEarned, 0) / 100000).toFixed(1)}L`} icon={CreditCard} color="from-blue-500 to-cyan-500" />
        <StatCard label="KYC Pending" value={String(D.mockInvestors.filter(i => i.status === 'kyc_pending').length)} icon={Shield} color="from-amber-500 to-orange-500" />
      </div>
      <DataTable headers={[{ label: 'Investor' }, { label: 'Contact' }, { label: 'Invested' }, { label: 'Earned' }, { label: 'Pod Sets', align: 'center' }, { label: 'KYC', align: 'center' }, { label: 'Status', align: 'center' }, { label: 'Actions', align: 'right' }]}>
        {D.mockInvestors.map(inv => (
          <tr key={inv.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={inv.userName} /><div><p className="text-sm font-medium text-slate-700">{inv.userName}</p><p className="text-[10px] text-slate-400">{inv.id} · Since {inv.createdAt}</p></div></div></td>
            <td className="px-5 py-4"><p className="text-sm text-slate-600">{inv.userPhone}</p><p className="text-[10px] text-slate-400">{inv.userEmail}</p></td>
            <td className="px-5 py-4 text-sm font-semibold text-slate-700">₹{(inv.totalInvested / 100000).toFixed(1)}L</td>
            <td className="px-5 py-4 text-sm font-semibold text-green-600">₹{(inv.totalEarned / 1000).toFixed(0)}K</td>
            <td className="text-center text-sm text-slate-600">{inv.totalPodSets}</td>
            <td className="text-center"><StatusBadge status={inv.kycStatus} map={statusColors} /></td>
            <td className="text-center"><StatusBadge status={inv.status} map={statusColors} /></td>
            <td className="text-right px-5"><div className="flex items-center justify-end gap-1"><button className="px-2.5 py-1 text-[10px] font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">View</button>{inv.status === 'kyc_pending' && <button className="px-2.5 py-1 text-[10px] font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">Verify KYC</button>}</div></td>
          </tr>
        ))}
      </DataTable>
      {/* Investment details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100"><h3 className="font-semibold text-slate-800">Investments &amp; 3x Guarantee Tracking</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Invoice</th><th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Investor</th><th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Amount</th><th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Delivery</th><th className="text-center text-xs font-medium text-slate-400 px-5 py-3">3x Progress</th><th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Monthly</th><th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Contract</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {D.mockInvestors.flatMap(inv => inv.investments.map(i => (
                <tr key={i.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3 text-sm font-mono text-primary-600">{i.invoiceNumber}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{inv.userName}</td>
                  <td className="text-center text-sm font-semibold text-slate-700">₹{(i.totalAmount / 100000).toFixed(1)}L</td>
                  <td className="text-center"><StatusBadge status={i.deliveryOption} map={{ doorstep: 'bg-blue-50 text-blue-600', leaseback: 'bg-violet-50 text-violet-600' }} /></td>
                  <td className="px-5 py-3 text-center"><div className="flex items-center justify-center gap-2"><div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-violet-600" style={{ width: `${i.guaranteeProgress}%` }} /></div><span className="text-[10px] text-slate-500">{i.guaranteeProgress}%</span></div></td>
                  <td className="text-center text-sm text-green-600 font-medium">₹{(i.monthlyEarnings / 1000).toFixed(1)}K</td>
                  <td className="text-center text-[10px] text-slate-400">{i.contractStart} — {i.contractEnd}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ============================
// ASSOCIATES VIEW (MLM Referral Network)
// ============================
function AssociatesView() {
  const D = useAdminData();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Associates" value={String(D.mockAssociates.length)} icon={Network} color="from-orange-500 to-red-500" />
        <StatCard label="Total Referrals" value={String(D.mockAssociates.reduce((s, a) => s + a.totalReferrals, 0))} icon={Users} color="from-blue-500 to-cyan-500" />
        <StatCard label="Total Earned" value={`₹${(D.mockAssociates.reduce((s, a) => s + a.totalEarnings, 0) / 1000).toFixed(0)}K`} icon={IndianRupee} color="from-green-500 to-emerald-500" />
        <StatCard label="Pending Payouts" value={`₹${(D.mockAssociates.reduce((s, a) => s + a.pendingPayout, 0) / 1000).toFixed(1)}K`} icon={Wallet} color="from-amber-500 to-orange-500" />
      </div>
      <DataTable headers={[{ label: 'Associate' }, { label: 'Contact' }, { label: 'Parent / Level' }, { label: 'Direct', align: 'center' }, { label: 'Total Referrals', align: 'center' }, { label: 'Earnings', align: 'right' }, { label: 'Pending', align: 'right' }, { label: 'Status', align: 'center' }]}>
        {D.mockAssociates.map(a => (
          <tr key={a.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={a.userName} /><div><p className="text-sm font-medium text-slate-700">{a.userName}</p><p className="text-[10px] text-slate-400">{a.id} · Since {a.createdAt}</p></div></div></td>
            <td className="px-5 py-4 text-sm text-slate-600">{a.userPhone}</td>
            <td className="px-5 py-4"><p className="text-sm text-slate-600">{a.parentName || 'Root'}</p><p className="text-[10px] text-slate-400">Level {a.level}</p></td>
            <td className="text-center text-sm font-medium text-slate-700">{a.directReferrals}</td>
            <td className="text-center text-sm text-slate-600">{a.totalReferrals}</td>
            <td className="text-right px-5 text-sm font-semibold text-green-600">₹{a.totalEarnings.toLocaleString()}</td>
            <td className="text-right px-5 text-sm font-medium text-amber-600">₹{a.pendingPayout.toLocaleString()}</td>
            <td className="text-center"><StatusBadge status={a.status} map={statusColors} /></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}


// ============================
// PODS VIEW
// ============================
function PodsView() {
  const D = useAdminData();
  const [models, setModels] = useState<PodCatalogueModel[]>(POD_CATALOGUE);
  const [addingModel, setAddingModel] = useState(false);
  const [modelError, setModelError] = useState('');

  useEffect(() => {
    api.get<{ success: boolean; models: PodCatalogueModel[] }>('/api/v1/admin/pod-catalogue').then((r) => {
      if (r.data?.models?.length) setModels(r.data.models);
      if (r.error) setModelError(r.error);
    });
  }, []);

  const createModel = async (model: PodCatalogueModel) => {
    setModelError('');
    const res = await api.post<{ success: boolean; model?: PodCatalogueModel; message?: string }>('/api/v1/admin/pod-catalogue', model);
    if (res.error || !res.data?.success || !res.data.model) {
      setModelError(res.error || res.data?.message || 'Failed to save pod model');
      return;
    }
    setModels((current) => [res.data!.model!, ...current.filter((m) => m.id !== res.data!.model!.id && m.key !== res.data!.model!.key)]);
    setAddingModel(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Pod Sets" value={String(D.mockPodSets.length)} icon={Layers} color="from-violet-500 to-purple-500" />
        <StatCard label="Total Pods" value={String(D.mockPodSets.reduce((s, ps) => s + ps.totalPods, 0))} icon={Building2} color="from-blue-500 to-cyan-500" />
        <StatCard label="Available Now" value={String(D.mockPodSets.reduce((s, ps) => s + ps.availablePods, 0))} icon={CheckCircle} color="from-green-500 to-emerald-500" />
        <StatCard label="Avg Hourly Rate" value={`₹${Math.round(D.mockPodSets.reduce((s, ps) => s + ps.hourlyRate, 0) / D.mockPodSets.length)}`} icon={IndianRupee} color="from-amber-500 to-orange-500" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-800">BIDUA pod model catalogue</h3>
            <p className="text-xs text-slate-400 mt-1">Admin can maintain model code, layout, material, dimensions and base pricing before partners use inventory presets.</p>
          </div>
          <AddBtn label={addingModel ? 'Close Model Form' : 'Add Pod Model'} onClick={() => setAddingModel(v => !v)} />
        </div>
        {modelError && <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{modelError}</div>}
        {addingModel && <AdminPodModelForm onCancel={() => setAddingModel(false)} onSave={createModel} />}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead><tr className="border-b border-gray-100 bg-gray-50/50"><th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Model</th><th className="text-center text-xs font-medium text-slate-400 px-4 py-3">Type</th><th className="text-center text-xs font-medium text-slate-400 px-4 py-3">Layout</th><th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Dimensions</th><th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Material</th><th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Base</th><th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Set</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {models.map(model => (
                <tr key={model.key} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3"><p className="text-sm font-medium text-slate-700">{model.name}</p><p className="text-[10px] text-slate-400">{model.code} · {model.series}</p></td>
                  <td className="text-center"><StatusBadge status={model.podType} map={{ single: 'bg-blue-50 text-blue-600', double: 'bg-violet-50 text-violet-600', king: 'bg-amber-50 text-amber-600' }} /></td>
                  <td className="text-center"><StatusBadge status={model.layout} map={{ horizontal: 'bg-emerald-50 text-emerald-600', vertical: 'bg-cyan-50 text-cyan-600' }} /></td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-[210px]">{model.dimensions}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-[240px]">{model.material}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">₹{model.basePrice.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">₹{model.setPrice.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PageHeader><FilterBtn /><ExportBtn /><AddBtn label="Add Pod Set" /></PageHeader>
      <DataTable headers={[{ label: 'Pod Set' }, { label: 'Location' }, { label: 'Ownership', align: 'center' }, { label: 'Series', align: 'center' }, { label: 'Pods', align: 'center' }, { label: 'Available', align: 'center' }, { label: 'Rate/Hr', align: 'right' }, { label: 'Actions', align: 'right' }]}>
        {D.mockPodSets.map(ps => (
          <tr key={ps.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-4"><p className="text-sm font-medium text-slate-700">Set #{ps.setNumber} · Floor {ps.floor} · Sec {ps.section}</p><p className="text-[10px] text-slate-400">{ps.id} · {ps.partnerName}</p></td>
            <td className="px-5 py-4 text-sm text-slate-600">{ps.location}</td>
            <td className="text-center"><StatusBadge status={ps.ownership} map={{ naploo: 'bg-primary-50 text-primary-600', investor: 'bg-emerald-50 text-emerald-600', partner: 'bg-violet-50 text-violet-600' }} /><br /><span className="text-[10px] text-slate-400">{ps.ownerName || '—'}</span></td>
            <td className="text-center text-sm font-medium text-slate-700">{ps.series}</td>
            <td className="text-center text-sm text-slate-600">{ps.totalPods}</td>
            <td className="text-center text-sm font-medium text-green-600">{ps.availablePods}</td>
            <td className="text-right text-sm font-semibold text-slate-700 px-5">₹{ps.hourlyRate}</td>
            <td className="text-right px-5"><button className="px-2.5 py-1 text-[10px] font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">Manage</button></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}

function AdminPodModelForm({ onCancel, onSave }: { onCancel: () => void; onSave: (model: PodCatalogueModel) => void }) {
  const [presetKey, setPresetKey] = useState(POD_CATALOGUE[0].key);
  const [draft, setDraft] = useState<PodCatalogueModel>({ ...POD_CATALOGUE[0] });

  return (
    <div className="rounded-xl border border-primary-100 bg-primary-50/30 p-4">
      <div className="grid md:grid-cols-3 gap-3">
        <AdminField label="Load PDF model">
          <select
            value={presetKey}
            onChange={(e) => {
              const next = POD_CATALOGUE.find(m => m.key === e.target.value) || POD_CATALOGUE[0];
              setPresetKey(next.key);
              setDraft({ ...next });
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {POD_CATALOGUE.map(model => <option key={model.key} value={model.key}>{model.name}</option>)}
          </select>
        </AdminField>
        <AdminField label="Model code">
          <input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </AdminField>
        <AdminField label="Series">
          <input value={draft.series} onChange={(e) => setDraft({ ...draft, series: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </AdminField>
        <AdminField label="Model name">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </AdminField>
        <AdminField label="Pod type">
          <select value={draft.podType} onChange={(e) => setDraft({ ...draft, podType: e.target.value as PodCatalogueModel['podType'], occupancy: e.target.value === 'king' ? 3 : e.target.value === 'double' ? 2 : 1 })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="single">single</option><option value="double">double</option><option value="king">king</option>
          </select>
        </AdminField>
        <AdminField label="Layout">
          <select value={draft.layout} onChange={(e) => setDraft({ ...draft, layout: e.target.value as PodCatalogueModel['layout'] })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="horizontal">horizontal</option><option value="vertical">vertical</option>
          </select>
        </AdminField>
        <AdminField label="Occupancy">
          <input type="number" min={1} max={4} value={draft.occupancy} onChange={(e) => setDraft({ ...draft, occupancy: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </AdminField>
        <AdminField label="Base price">
          <input type="number" value={draft.basePrice} onChange={(e) => setDraft({ ...draft, basePrice: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </AdminField>
        <AdminField label="Set price">
          <input type="number" value={draft.setPrice} onChange={(e) => setDraft({ ...draft, setPrice: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </AdminField>
        <AdminField label="Dimensions">
          <input value={draft.dimensions} onChange={(e) => setDraft({ ...draft, dimensions: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </AdminField>
        <AdminField label="Material">
          <input value={draft.material} onChange={(e) => setDraft({ ...draft, material: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </AdminField>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-600 hover:bg-white">Cancel</button>
        <button type="button" onClick={() => onSave(draft)} className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">Save model</button>
      </div>
    </div>
  );
}

function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-slate-500 mb-1">{label}</span>{children}</label>;
}


// ============================
// ROOMS VIEW
// ============================
function RoomsView() {
  const D = useAdminData();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Rooms" value={String(D.mockRooms.length)} icon={BedDouble} color="from-indigo-500 to-blue-500" />
        <StatCard label="Available" value={String(D.mockRooms.filter(r => r.status === 'available').length)} icon={CheckCircle} color="from-green-500 to-emerald-500" />
        <StatCard label="Occupied" value={String(D.mockRooms.filter(r => r.status === 'occupied').length)} icon={Calendar} color="from-blue-500 to-cyan-500" />
        <StatCard label="Maintenance" value={String(D.mockRooms.filter(r => r.status === 'maintenance').length)} icon={AlertCircle} color="from-amber-500 to-orange-500" />
      </div>
      <PageHeader><FilterBtn /><ExportBtn /><AddBtn label="Add Room" /></PageHeader>
      <DataTable headers={[{ label: 'Room' }, { label: 'Partner / Location' }, { label: 'Type', align: 'center' }, { label: 'Bed', align: 'center' }, { label: 'Guests', align: 'center' }, { label: 'Rate/Night', align: 'right' }, { label: 'Status', align: 'center' }, { label: 'Actions', align: 'right' }]}>
        {D.mockRooms.map(r => (
          <tr key={r.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-4"><p className="text-sm font-medium text-slate-700">{r.name}</p><p className="text-[10px] text-slate-400">#{r.roomNumber} · Floor {r.floor} · {r.areaSqFt} sqft</p></td>
            <td className="px-5 py-4"><p className="text-sm text-slate-600">{r.partnerName}</p><p className="text-[10px] text-slate-400">{r.location}</p></td>
            <td className="text-center"><StatusBadge status={r.roomType} map={{ standard: 'bg-slate-50 text-slate-600', deluxe: 'bg-blue-50 text-blue-600', suite: 'bg-violet-50 text-violet-600', family: 'bg-green-50 text-green-600', dormitory: 'bg-amber-50 text-amber-600' }} /></td>
            <td className="text-center text-sm text-slate-500 capitalize">{r.bedType} × {r.numBeds}</td>
            <td className="text-center text-sm text-slate-600">{r.maxGuests}</td>
            <td className="text-right text-sm font-semibold text-slate-700 px-5">₹{r.dailyRate.toLocaleString()}</td>
            <td className="text-center"><StatusBadge status={r.status} map={statusColors} /></td>
            <td className="text-right px-5"><button className="px-2.5 py-1 text-[10px] font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">Edit</button></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}


// ============================
// BOOKINGS VIEW
// ============================
function BookingsView() {
  const D = useAdminData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    let list = D.mockBookings;
    if (statusFilter !== 'all') list = list.filter(b => b.status === statusFilter);
    if (search) { const q = search.toLowerCase(); list = list.filter(b => b.bookingNumber.toLowerCase().includes(q) || b.userName.toLowerCase().includes(q)); }
    return list;
  }, [statusFilter, search]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Today's Bookings" value={String(D.mockBookings.filter(b => b.createdAt.startsWith('2026-03-18')).length)} icon={Calendar} color="from-blue-500 to-cyan-500" />
        <StatCard label="Checked In" value={String(D.mockBookings.filter(b => b.status === 'checked_in').length)} icon={CheckCircle} color="from-green-500 to-emerald-500" />
        <StatCard label="Revenue Today" value={`₹${D.mockBookings.filter(b => b.createdAt.startsWith('2026-03-18') && b.status !== 'cancelled').reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}`} icon={IndianRupee} color="from-emerald-500 to-green-500" />
        <StatCard label="Cancellations" value={String(D.mockBookings.filter(b => b.status === 'cancelled').length)} icon={Ban} color="from-red-500 to-pink-500" />
      </div>
      <PageHeader>
        <SearchInput value={search} onChange={setSearch} placeholder="Search bookings..." />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-slate-600">
          <option value="all">All Status</option>
          {['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <ExportBtn />
      </PageHeader>
      <DataTable headers={[{ label: 'Booking' }, { label: 'Guest' }, { label: 'Property' }, { label: 'Type', align: 'center' }, { label: 'Time' }, { label: 'Amount', align: 'right' }, { label: 'Revenue Split', align: 'right' }, { label: 'Status', align: 'center' }, { label: 'Actions', align: 'right' }]}>
        {filtered.map(b => (
          <tr key={b.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-3"><p className="text-sm font-mono text-primary-600">{b.bookingNumber}</p><p className="text-[10px] text-slate-400">{b.createdAt.split(' ')[0]}</p></td>
            <td className="px-5 py-3"><div className="flex items-center gap-2"><Avatar name={b.userName} size="sm" /><div><p className="text-sm text-slate-700">{b.userName}</p><p className="text-[10px] text-slate-400">{b.userPhone}</p></div></div></td>
            <td className="px-5 py-3"><p className="text-sm text-slate-600">{b.propertyName}</p><p className="text-[10px] text-slate-400">{b.location}</p></td>
            <td className="text-center"><StatusBadge status={b.bookingType} map={{ pod: 'bg-violet-50 text-violet-600', room: 'bg-blue-50 text-blue-600' }} /></td>
            <td className="px-5 py-3 text-[10px] text-slate-500">{b.checkIn.split(' ')[1]} — {b.checkOut.split(' ')[1]}<br/>{b.hours ? `${b.hours}h` : `${b.nights}N`}</td>
            <td className="text-right px-5"><p className="text-sm font-semibold text-slate-700">₹{b.totalAmount.toLocaleString()}</p>{b.couponCode && <p className="text-[10px] text-violet-500">{b.couponCode} (-₹{b.discount})</p>}</td>
            <td className="text-right px-5 text-[10px]"><p className="text-green-600">Owner: ₹{b.ownerShare}</p><p className="text-primary-600">Naploo: ₹{b.naplooShare}</p><p className="text-slate-400">Comm: ₹{b.partnerCommission}</p></td>
            <td className="text-center"><StatusBadge status={b.status} map={statusColors} /></td>
            <td className="text-right px-5"><button className="px-2.5 py-1 text-[10px] font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">View</button></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}


// ============================
// PAYMENTS VIEW
// ============================
function PaymentsView() {
  const D = useAdminData();
  async function initiateRefund(paymentId: string, maxAmount: number) {
    const amountText = window.prompt('Refund amount', String(maxAmount));
    if (!amountText) return;
    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount <= 0) { alert('Enter a valid refund amount'); return; }
    const reason = window.prompt('Refund reason', 'Admin initiated refund') || 'Admin initiated refund';
    const res = await api.post<{ success: boolean; message?: string }>(`/api/v1/admin/payments/${paymentId}/refund`, { amount, reason, source: 'admin_manual' });
    if (res.error || res.data?.success === false) { alert(res.error || res.data?.message || 'Refund failed'); return; }
    await useAdminData.getState().loadAll();
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Collected" value={`₹${(D.mockPayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0) / 1000).toFixed(0)}K`} icon={CreditCard} color="from-green-500 to-emerald-500" />
        <StatCard label="Refunded" value={`₹${(D.mockPayments.filter(p => p.status === 'refunded').reduce((s, p) => s + (p.refundAmount || 0), 0))}`} icon={ArrowDownRight} color="from-red-500 to-pink-500" />
        <StatCard label="UPI Payments" value={String(D.mockPayments.filter(p => p.paymentMethod === 'upi').length)} icon={IndianRupee} color="from-blue-500 to-cyan-500" />
        <StatCard label="Card Payments" value={String(D.mockPayments.filter(p => p.paymentMethod === 'card').length)} icon={CreditCard} color="from-violet-500 to-purple-500" />
      </div>
      <DataTable headers={[{ label: 'Transaction' }, { label: 'User' }, { label: 'Booking' }, { label: 'Method', align: 'center' }, { label: 'Gateway ID', align: 'center' }, { label: 'Amount', align: 'right' }, { label: 'Status', align: 'center' }, { label: 'Actions', align: 'right' }]}>
        {D.mockPayments.map(p => (
          <tr key={p.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-3"><p className="text-sm font-mono text-slate-600">{p.id}</p><p className="text-[10px] text-slate-400">{p.createdAt}</p></td>
            <td className="px-5 py-3 text-sm text-slate-600">{p.userName}</td>
            <td className="px-5 py-3 text-sm font-mono text-primary-600">{p.bookingNumber}</td>
            <td className="text-center"><StatusBadge status={p.paymentMethod} map={{ cashfree: 'bg-emerald-50 text-emerald-600', razorpay: 'bg-blue-50 text-blue-600', upi: 'bg-green-50 text-green-600', card: 'bg-blue-50 text-blue-600', wallet: 'bg-violet-50 text-violet-600', netbanking: 'bg-amber-50 text-amber-600', cash: 'bg-slate-50 text-slate-600' }} /></td>
            <td className="text-center text-[10px] text-slate-400 font-mono">{p.razorpayPaymentId || '—'}</td>
            <td className={`text-right px-5 text-sm font-semibold ${p.status === 'refunded' ? 'text-red-600' : 'text-green-600'}`}>{p.status === 'refunded' ? '-' : '+'}₹{p.amount.toLocaleString()}</td>
            <td className="text-center"><StatusBadge status={p.status} map={statusColors} /></td>
            <td className="text-right px-5">
              {(p.status === 'completed' || p.status === 'partially_refunded') && (
                <button onClick={() => initiateRefund(p.id, Math.max(0, p.amount - (p.refundAmount || 0)))} className="px-2.5 py-1 text-[10px] font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Refund</button>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}


// ============================
// PAYOUTS VIEW
// ============================
function PayoutsView() {
  const D = useAdminData();
  async function generatePartnerSettlements() {
    const res = await api.post<{ success: boolean; created: number; skipped: number; message?: string }>('/api/v1/admin/payouts/generate-partner-settlements', {});
    if (res.error || res.data?.success === false) { alert(res.error || res.data?.message || 'Settlement generation failed'); return; }
    alert(`Created ${res.data?.created || 0} settlement payout(s). Skipped ${res.data?.skipped || 0}.`);
    await useAdminData.getState().loadAll();
  }
  async function processPayout(id: string, status: 'processing' | 'completed') {
    const transferId = status === 'completed' ? (window.prompt('Bank transfer/reference ID', '') || undefined) : undefined;
    const res = await api.post<{ success: boolean; message?: string }>(`/api/v1/admin/payouts/${id}/process`, { status, transferId, transferMode: 'manual_bank_transfer' });
    if (res.error || res.data?.success === false) { alert(res.error || res.data?.message || 'Payout update failed'); return; }
    await useAdminData.getState().loadAll();
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Payouts" value={`₹${(D.mockPayouts.reduce((s, p) => s + p.netAmount, 0) / 100000).toFixed(1)}L`} icon={IndianRupee} color="from-green-500 to-emerald-500" />
        <StatCard label="TDS Deducted" value={`₹${(D.mockPayouts.reduce((s, p) => s + p.tdsAmount, 0) / 1000).toFixed(0)}K`} icon={Percent} color="from-amber-500 to-orange-500" />
        <StatCard label="Pending" value={String(D.mockPayouts.filter(p => p.status === 'pending').length)} icon={Clock} color="from-blue-500 to-cyan-500" />
        <StatCard label="Processing" value={String(D.mockPayouts.filter(p => p.status === 'processing').length)} icon={RefreshCw} color="from-violet-500 to-purple-500" />
      </div>
      <PageHeader><AddBtn label="Generate partner settlements" onClick={generatePartnerSettlements} /><FilterBtn /><ExportBtn /></PageHeader>
      <DataTable headers={[{ label: 'Payout' }, { label: 'Recipient' }, { label: 'Type', align: 'center' }, { label: 'Amount' }, { label: 'TDS' }, { label: 'Net Amount' }, { label: 'Bank' }, { label: 'Period' }, { label: 'Status', align: 'center' }, { label: 'Actions', align: 'right' }]}>
        {D.mockPayouts.map(p => (
          <tr key={p.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-3"><p className="text-sm font-mono text-slate-600">{p.id}</p><p className="text-[10px] text-slate-400">{p.createdAt}</p></td>
            <td className="px-5 py-3 text-sm text-slate-700">{p.userName}</td>
            <td className="text-center"><StatusBadge status={p.payoutType} map={{ partner: 'bg-violet-50 text-violet-600', investor: 'bg-emerald-50 text-emerald-600', associate: 'bg-orange-50 text-orange-600' }} /></td>
            <td className="px-5 py-3 text-sm text-slate-700">₹{p.amount.toLocaleString()}</td>
            <td className="px-5 py-3 text-sm text-red-500">-₹{p.tdsAmount.toLocaleString()}</td>
            <td className="px-5 py-3 text-sm font-semibold text-green-600">₹{p.netAmount.toLocaleString()}</td>
            <td className="px-5 py-3"><p className="text-[10px] text-slate-600">{p.bankName}</p><p className="text-[10px] text-slate-400">{p.bankAccount} · {p.bankIfsc}</p></td>
            <td className="px-5 py-3 text-[10px] text-slate-400">{p.periodStart} —<br/>{p.periodEnd}</td>
            <td className="text-center"><StatusBadge status={p.status} map={statusColors} /></td>
            <td className="text-right px-5">
              {p.status === 'pending' && <button onClick={() => processPayout(p.id, 'processing')} className="px-2.5 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">Process</button>}
              {p.status === 'processing' && <button onClick={() => processPayout(p.id, 'completed')} className="px-2.5 py-1 text-[10px] font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">Mark paid</button>}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}


// ============================
// COUPONS VIEW
// ============================
function CouponsView() {
  const D = useAdminData();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Active Coupons" value={String(D.mockCoupons.filter(c => c.status === 'active').length)} icon={Tag} color="from-violet-500 to-purple-500" />
        <StatCard label="Total Redemptions" value={D.mockCoupons.reduce((s, c) => s + c.usedCount, 0).toLocaleString()} icon={Gift} color="from-green-500 to-emerald-500" />
        <StatCard label="Expired" value={String(D.mockCoupons.filter(c => c.status === 'expired').length)} icon={Clock} color="from-slate-500 to-gray-500" />
        <StatCard label="Est. Discount Given" value="₹4.2L" icon={IndianRupee} color="from-amber-500 to-orange-500" />
      </div>
      <PageHeader><AddBtn label="Create Coupon" /></PageHeader>
      <DataTable headers={[{ label: 'Code' }, { label: 'Description' }, { label: 'Discount' }, { label: 'Min/Max' }, { label: 'Usage', align: 'center' }, { label: 'Valid' }, { label: 'Types', align: 'center' }, { label: 'Status', align: 'center' }, { label: 'Actions', align: 'right' }]}>
        {D.mockCoupons.map(c => (
          <tr key={c.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-3"><p className="text-sm font-mono font-bold text-primary-600">{c.code}</p></td>
            <td className="px-5 py-3 text-sm text-slate-600 max-w-xs">{c.description}</td>
            <td className="px-5 py-3 text-sm font-semibold text-slate-700">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
            <td className="px-5 py-3 text-[10px] text-slate-400">Min ₹{c.minBookingAmount}<br/>Max ₹{c.maxDiscount}</td>
            <td className="text-center"><p className="text-sm text-slate-700">{c.usedCount.toLocaleString()}</p><p className="text-[10px] text-slate-400">{c.usageLimit}/user</p></td>
            <td className="px-5 py-3 text-[10px] text-slate-400">{c.validFrom}<br/>{c.validTo}</td>
            <td className="text-center">{c.applicableTypes.map(t => <StatusBadge key={t} status={t} map={{ pod: 'bg-violet-50 text-violet-600', room: 'bg-blue-50 text-blue-600' }} />)}</td>
            <td className="text-center"><StatusBadge status={c.status} map={statusColors} /></td>
            <td className="text-right px-5"><div className="flex items-center justify-end gap-1"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-slate-400" /></button><button className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-slate-400" /></button></div></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}


// ============================
// TICKETS VIEW
// ============================
function TicketsView() {
  const D = useAdminData();
  const [statusFilter, setStatusFilter] = useState('all');
  const filtered = statusFilter === 'all' ? D.mockTickets : D.mockTickets.filter(t => t.status === statusFilter);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Open" value={String(D.mockTickets.filter(t => t.status === 'open').length)} icon={AlertCircle} color="from-blue-500 to-cyan-500" />
        <StatCard label="In Progress" value={String(D.mockTickets.filter(t => t.status === 'in-progress').length)} icon={Clock} color="from-amber-500 to-orange-500" />
        <StatCard label="Urgent" value={String(D.mockTickets.filter(t => t.priority === 'urgent').length)} icon={AlertCircle} color="from-red-500 to-pink-500" />
        <StatCard label="Avg Resolution" value="4.2h" icon={CheckCircle} color="from-green-500 to-emerald-500" />
      </div>
      <PageHeader>
        <SearchInput value="" onChange={() => {}} placeholder="Search tickets..." />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-slate-600">
          <option value="all">All Status</option>
          {['open', 'in-progress', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </PageHeader>
      <DataTable headers={[{ label: 'Ticket' }, { label: 'Subject' }, { label: 'Category', align: 'center' }, { label: 'Priority', align: 'center' }, { label: 'Status', align: 'center' }, { label: 'Assignee' }, { label: 'Messages', align: 'center' }, { label: 'Actions', align: 'right' }]}>
        {filtered.map(t => (
          <tr key={t.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-3"><p className="text-sm font-mono text-primary-600">{t.ticketNumber}</p><p className="text-[10px] text-slate-400">{t.userName} · {t.createdAt.split(' ')[0]}</p></td>
            <td className="px-5 py-3 text-sm text-slate-700 max-w-xs truncate">{t.subject}</td>
            <td className="text-center"><StatusBadge status={t.category} map={{ booking: 'bg-blue-50 text-blue-600', pod: 'bg-violet-50 text-violet-600', account: 'bg-slate-50 text-slate-600', safety: 'bg-red-50 text-red-600', general: 'bg-gray-50 text-gray-600', technical: 'bg-amber-50 text-amber-600' }} /></td>
            <td className="text-center"><StatusBadge status={t.priority} map={{ urgent: 'bg-red-50 text-red-600', high: 'bg-amber-50 text-amber-600', medium: 'bg-blue-50 text-blue-600', low: 'bg-slate-50 text-slate-500' }} /></td>
            <td className="text-center"><StatusBadge status={t.status} map={statusColors} /></td>
            <td className="px-5 py-3 text-sm text-slate-500">{t.assignee || <span className="text-amber-500 font-medium">Unassigned</span>}</td>
            <td className="text-center text-sm text-slate-600">{t.messages}</td>
            <td className="text-right px-5"><div className="flex items-center justify-end gap-1"><button className="px-2.5 py-1 text-[10px] font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">View</button>{!t.assignee && <button className="px-2.5 py-1 text-[10px] font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100">Assign</button>}</div></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}


// ============================
// APPLICATIONS VIEW
// ============================
interface PartnerApplicationRow {
  id: string;
  applicationNumber: string;
  status: 'submitted' | 'under-review' | 'approved' | 'rejected';
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  propertyName: string;
  propertyType: string;
  ownershipStatus: string;
  yearEstablished?: string;
  totalRooms?: string;
  starRating?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  googleMapsUrl?: string;
  availableSpaceSqft: string;
  spaceLocation: string;
  estimatedPods?: string;
  powerBackup?: string;
  hasWifi?: boolean;
  hasAc?: boolean;
  hasWashroom?: boolean;
  hasParking?: boolean;
  has24x7Access?: boolean;
  hasSecurity?: boolean;
  monthlyFootfall?: string;
  primaryGuestType?: string;
  peakSeason?: string;
  nearbyTransit?: string;
  preferredModel?: string;
  expectedRevenueShare?: string;
  gstNumber?: string;
  panNumber?: string;
  message?: string;
  howDidYouHear?: string;
  ip?: string;
  userAgent?: string;
  offerDetails?: {
    pods: number;
    occupancyHours: number;
    hourlyRate: number;
    investorSharePct: number;
    naplooGrossSharePct: number;
    operatingCostPct: number;
    offerMode: 'percentage' | 'fixed' | 'hybrid';
    propertyPct?: number;
    fixedRent?: number;
    hybridBase?: number;
    hybridPct?: number;
    monthlyGrossRevenue: number;
    monthlyInvestorPayout: number;
    monthlyNaplooGross: number;
    monthlyOperatingCost: number;
    monthlyPropertyPayout: number;
    monthlyNaplooNet: number;
    naplooMarginPct: number;
    yearlyNaplooNet: number;
    verdict: 'profitable' | 'tight' | 'loss';
    notes?: string;
    savedBy?: string;
    savedAt: string;
  };
}

function ApplicationsView() {
  const [adminKey, setAdminKey] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('naploo-admin-api-key') || '';
  });
  const [keyInput, setKeyInput] = useState(adminKey);
  const [apps, setApps] = useState<PartnerApplicationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PartnerApplicationRow | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const load = React.useCallback(async (key: string) => {
    if (!key) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/partner-applications', {
        headers: { 'x-admin-key': key },
        cache: 'no-store',
      });
      if (res.status === 401) {
        setError('Invalid admin key.');
        setApps([]);
      } else if (!res.ok) {
        setError('Failed to load applications.');
      } else {
        const data = await res.json();
        setApps(Array.isArray(data.applications) ? data.applications : []);
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminKey) load(adminKey);
  }, [adminKey, load]);

  const updateStatus = async (id: string, status: PartnerApplicationRow['status'], reviewNotes?: string) => {
    if (!adminKey) return;
    try {
      const res = await fetch('/api/partner-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ id, status, reviewNotes }),
      });
      if (res.ok) {
        await load(adminKey);
        if (selected?.id === id) {
          const data = await res.json();
          setSelected(data.application || null);
        }
      }
    } catch {
      /* noop */
    }
  };

  const removeApp = async (id: string) => {
    if (!adminKey) return;
    if (!window.confirm('Delete this application permanently?')) return;
    try {
      const res = await fetch(`/api/partner-applications?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      if (res.ok) {
        setSelected(null);
        await load(adminKey);
      }
    } catch {
      /* noop */
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.applicationNumber.toLowerCase().includes(q) ||
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        a.propertyName.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.state.toLowerCase().includes(q)
      );
    });
  }, [apps, query, statusFilter]);

  const thisMonthPrefix = new Date().toISOString().slice(0, 7);

  if (!adminKey) {
    return (
      <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Unlock Applications</h3>
        <p className="text-sm text-slate-500 mb-4">Enter the admin API key to view partner property submissions.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const k = keyInput.trim();
            if (!k) return;
            window.localStorage.setItem('naploo-admin-api-key', k);
            setAdminKey(k);
          }}
          className="space-y-3"
        >
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Admin API key"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-violet-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
          >
            Unlock
          </button>
          <p className="text-[10px] text-slate-400">Configured via <code>ADMIN_API_KEY</code> server env.</p>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={String(apps.length)} icon={FileText} color="from-slate-500 to-gray-600" />
        <StatCard label="Pending Review" value={String(apps.filter(a => a.status === 'submitted' || a.status === 'under-review').length)} icon={Clock} color="from-amber-500 to-orange-500" />
        <StatCard label="Approved" value={String(apps.filter(a => a.status === 'approved').length)} icon={CheckCircle} color="from-green-500 to-emerald-500" />
        <StatCard label="This Month" value={String(apps.filter(a => a.createdAt.startsWith(thisMonthPrefix)).length)} icon={Calendar} color="from-primary-500 to-violet-500" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, phone, property, city…"
          className="flex-1 min-w-[240px] px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under-review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={() => load(adminKey)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
        <button
          onClick={() => {
            window.localStorage.removeItem('naploo-admin-api-key');
            setAdminKey('');
            setKeyInput('');
            setApps([]);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 text-slate-500"
        >
          <Lock className="w-3.5 h-3.5" /> Lock
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <DataTable headers={[{ label: 'Application' }, { label: 'Owner' }, { label: 'Property' }, { label: 'Location' }, { label: 'Space' }, { label: 'Status', align: 'center' }, { label: 'Actions', align: 'right' }]}>
        {filtered.length === 0 && !loading && (
          <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">No applications match the current filters.</td></tr>
        )}
        {filtered.map(a => (
          <tr key={a.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-3">
              <p className="text-sm font-mono text-primary-600">{a.applicationNumber}</p>
              <p className="text-[10px] text-slate-400">{new Date(a.createdAt).toLocaleString()}</p>
            </td>
            <td className="px-5 py-3">
              <p className="text-sm font-medium text-slate-700">{a.fullName}</p>
              <p className="text-[10px] text-slate-400">{a.email}</p>
              <p className="text-[10px] text-slate-400">{a.phone}</p>
            </td>
            <td className="px-5 py-3">
              <p className="text-sm font-medium text-slate-700">{a.propertyName}</p>
              <p className="text-[10px] text-slate-400 capitalize">{a.propertyType.replace(/-/g, ' ')} · {a.ownershipStatus}</p>
            </td>
            <td className="px-5 py-3 text-sm text-slate-600">
              {a.city}, {a.state}
              <p className="text-[10px] text-slate-400">{a.pincode}</p>
              <a
                href={a.googleMapsUrl?.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([a.propertyName, a.addressLine1, a.city, a.state, a.pincode].filter(Boolean).join(', '))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-700 hover:underline mt-0.5"
                title={a.googleMapsUrl ? 'Open submitted Google Maps link' : 'Search this address on Google Maps'}
              >
                <MapPin className="w-3 h-3" /> {a.googleMapsUrl ? 'Map' : 'Map (search)'}
              </a>
            </td>
            <td className="px-5 py-3 text-sm text-slate-600">{a.availableSpaceSqft} sqft<p className="text-[10px] text-slate-400 capitalize">{a.spaceLocation}{a.estimatedPods ? ` · ~${a.estimatedPods}` : ''}</p></td>
            <td className="text-center">
              <StatusBadge status={a.status} map={{
                'submitted': 'bg-blue-50 text-blue-600',
                'under-review': 'bg-amber-50 text-amber-600',
                'approved': 'bg-green-50 text-green-600',
                'rejected': 'bg-red-50 text-red-600',
              }} />
            </td>
            <td className="text-right px-5">
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => setSelected(a)} className="px-2.5 py-1 text-[10px] font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">View</button>
                {(a.status === 'submitted' || a.status === 'under-review') && (
                  <>
                    {a.status === 'submitted' && (
                      <button onClick={() => updateStatus(a.id, 'under-review')} className="px-2.5 py-1 text-[10px] font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100">Review</button>
                    )}
                    <button onClick={() => updateStatus(a.id, 'approved')} className="px-2.5 py-1 text-[10px] font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">Approve</button>
                    <button onClick={() => updateStatus(a.id, 'rejected')} className="px-2.5 py-1 text-[10px] font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Reject</button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <p className="text-xs text-slate-400">Application</p>
                <p className="text-sm font-mono font-semibold text-primary-600">{selected.applicationNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} map={{
                  'submitted': 'bg-blue-50 text-blue-600',
                  'under-review': 'bg-amber-50 text-amber-600',
                  'approved': 'bg-green-50 text-green-600',
                  'rejected': 'bg-red-50 text-red-600',
                }} />
                <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
            <div className="p-6 space-y-6 text-sm">
              <DetailGroup title="Owner / Contact" items={[
                ['Full Name', selected.fullName],
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['WhatsApp', selected.whatsapp || '—'],
              ]} />
              <DetailGroup title="Property" items={[
                ['Property Name', selected.propertyName],
                ['Type', selected.propertyType],
                ['Ownership', selected.ownershipStatus],
                ['Year Established', selected.yearEstablished || '—'],
                ['Existing Rooms/Units', selected.totalRooms || '—'],
                ['Star Rating', selected.starRating || '—'],
              ]} />
              <DetailGroup title="Location" items={[
                ['Address', [selected.addressLine1, selected.addressLine2].filter(Boolean).join(', ')],
                ['City / State', `${selected.city}, ${selected.state} — ${selected.pincode}`],
                ['Landmark', selected.landmark || '—'],
                [
                  'Google Maps',
                  (() => {
                    const direct = selected.googleMapsUrl?.trim();
                    const fallback = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([selected.propertyName, selected.addressLine1, selected.addressLine2, selected.landmark, selected.city, selected.state, selected.pincode].filter(Boolean).join(', '))}`;
                    const href = direct || fallback;
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 hover:underline">
                        <MapPin className="w-3.5 h-3.5" />
                        {direct ? 'Open submitted link' : 'Open in Google Maps (address search)'}
                      </a>
                    );
                  })(),
                ],
              ]} />
              <DetailGroup title="Space & Amenities" items={[
                ['Available Space', `${selected.availableSpaceSqft} sqft`],
                ['Space Location', selected.spaceLocation],
                ['Estimated Pods', selected.estimatedPods || '—'],
                ['Power Backup', selected.powerBackup || '—'],
                ['Wi-Fi', selected.hasWifi ? 'Yes' : 'No'],
                ['AC', selected.hasAc ? 'Yes' : 'No'],
                ['Washroom', selected.hasWashroom ? 'Yes' : 'No'],
                ['Parking', selected.hasParking ? 'Yes' : 'No'],
                ['24×7 Access', selected.has24x7Access ? 'Yes' : 'No'],
                ['Security/CCTV', selected.hasSecurity ? 'Yes' : 'No'],
              ]} />
              <DetailGroup title="Footfall & Operations" items={[
                ['Monthly Footfall', selected.monthlyFootfall || '—'],
                ['Primary Guests', selected.primaryGuestType || '—'],
                ['Peak Season', selected.peakSeason || '—'],
                ['Nearby Transit', selected.nearbyTransit || '—'],
              ]} />
              <DetailGroup title="Commercial" items={[
                ['Preferred Model', selected.preferredModel || '—'],
                ['Expected Revenue Share', selected.expectedRevenueShare || '—'],
                ['GST', selected.gstNumber || '—'],
                ['PAN', selected.panNumber || '—'],
              ]} />
              {selected.message && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Message</p>
                  <p className="text-sm text-slate-700 bg-gray-50 border border-gray-100 rounded-lg p-3 whitespace-pre-wrap">{selected.message}</p>
                </div>
              )}
              <DetailGroup title="Meta" items={[
                ['Source', selected.howDidYouHear || '—'],
                ['Submitted', new Date(selected.createdAt).toLocaleString()],
                ['Last Updated', new Date(selected.updatedAt).toLocaleString()],
                ['IP', selected.ip || '—'],
              ]} />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3 sticky bottom-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeApp(selected.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button
                  onClick={() => {
                    // Estimate pods from sqft if not provided: ~60 sqft per pod set (2 pods) → 1 pod per ~30 sqft
                    const sqft = parseFloat(selected.availableSpaceSqft) || 0;
                    const seededPods =
                      parseInt(selected.estimatedPods || '0') ||
                      Math.max(2, Math.floor(sqft / 30));
                    window.dispatchEvent(
                      new CustomEvent('naploo-admin-nav', {
                        detail: {
                          page: 'deal-calculator',
                          seed: {
                            applicationId: selected.id,
                            applicationNumber: selected.applicationNumber,
                            propertyName: selected.propertyName,
                            city: selected.city,
                            state: selected.state,
                            propertyType: selected.propertyType,
                            pods: seededPods,
                            sqft,
                            existing: selected.offerDetails || null,
                          },
                        },
                      })
                    );
                    setSelected(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg"
                >
                  <Calculator className="w-3.5 h-3.5" /> Calculate Offer
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateStatus(selected.id, 'under-review')} className="px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg">Mark Under Review</button>
                <button onClick={() => updateStatus(selected.id, 'approved')} className="px-3 py-2 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg">Approve</button>
                <button onClick={() => updateStatus(selected.id, 'rejected')} className="px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg">Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailGroup({ title, items }: { title: string; items: Array<[string, React.ReactNode]> }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {items.map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <dt className="text-[10px] text-slate-400 uppercase tracking-wide">{k}</dt>
            <dd className="text-sm text-slate-700 break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}


// ============================
// REVIEWS VIEW
// ============================
function ReviewsView() {
  const D = useAdminData();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Avg Rating" value="4.6★" icon={Star} color="from-amber-500 to-orange-500" />
        <StatCard label="Total Reviews" value={String(D.mockReviews.length)} icon={MessageSquare} color="from-blue-500 to-cyan-500" />
        <StatCard label="Flagged" value={String(D.mockReviews.filter(r => r.status === 'flagged').length)} icon={AlertCircle} color="from-red-500 to-pink-500" />
        <StatCard label="Published" value={String(D.mockReviews.filter(r => r.status === 'published').length)} icon={CheckCircle} color="from-green-500 to-emerald-500" />
      </div>
      <div className="space-y-3">
        {D.mockReviews.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-amber-400">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? 'fill-current' : 'text-gray-200'}`} />)}</div>
                  <StatusBadge status={r.status} map={statusColors} />
                </div>
                <p className="text-sm text-slate-700 mb-2">{r.comment}</p>
                <p className="text-[10px] text-slate-400">{r.userName} · {r.propertyName} · {r.location} · {r.createdAt}</p>
              </div>
              <div className="flex gap-1">
                {r.status === 'flagged' && <button className="px-2.5 py-1 text-[10px] font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">Publish</button>}
                {r.status === 'published' && <button className="px-2.5 py-1 text-[10px] font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Hide</button>}
                <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Trash2 className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ============================
// LOCATIONS VIEW
// ============================
function LocationsView() {
  const D = useAdminData();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Active Locations" value={String(D.mockLocations.filter(l => l.status === 'active').length)} icon={MapPin} color="from-blue-500 to-cyan-500" />
        <StatCard label="Cities Covered" value={String(new Set(D.mockLocations.map(l => l.city)).size)} icon={MapPin} color="from-violet-500 to-purple-500" />
        <StatCard label="Setting Up" value={String(D.mockLocations.filter(l => l.status === 'setup').length)} icon={Clock} color="from-amber-500 to-orange-500" />
        <StatCard label="Avg Occupancy" value={`${Math.round(D.mockLocations.filter(l => l.status === 'active').reduce((s, l) => s + l.occupancyRate, 0) / D.mockLocations.filter(l => l.status === 'active').length)}%`} icon={BarChart3} color="from-green-500 to-emerald-500" />
      </div>
      <PageHeader><FilterBtn /><AddBtn label="Add Location" /></PageHeader>
      <DataTable headers={[{ label: 'Location' }, { label: 'Type', align: 'center' }, { label: 'Partner' }, { label: 'Pods', align: 'center' }, { label: 'Rooms', align: 'center' }, { label: 'Occupancy', align: 'center' }, { label: 'Revenue', align: 'right' }, { label: 'Status', align: 'center' }]}>
        {D.mockLocations.map(l => (
          <tr key={l.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-3"><p className="text-sm font-medium text-slate-700">{l.name}</p><p className="text-[10px] text-slate-400">{l.city}, {l.state}</p></td>
            <td className="text-center"><StatusBadge status={l.type} map={{ airport: 'bg-blue-50 text-blue-600', railway: 'bg-amber-50 text-amber-600', mall: 'bg-violet-50 text-violet-600', bus_stand: 'bg-green-50 text-green-600', hospital: 'bg-red-50 text-red-600', tourist: 'bg-cyan-50 text-cyan-600', it_park: 'bg-slate-50 text-slate-600', highway: 'bg-orange-50 text-orange-600' }} /></td>
            <td className="px-5 py-3 text-sm text-slate-600">{l.partnerName}</td>
            <td className="text-center text-sm text-slate-600">{l.totalPods}</td>
            <td className="text-center text-sm text-slate-600">{l.totalRooms}</td>
            <td className="px-5 py-3 text-center"><div className="flex items-center justify-center gap-2"><div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${l.occupancyRate > 80 ? 'bg-green-500' : l.occupancyRate > 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${l.occupancyRate}%` }} /></div><span className="text-xs text-slate-500">{l.occupancyRate}%</span></div></td>
            <td className="text-right text-sm font-semibold text-slate-700 px-5">{l.monthlyRevenue > 0 ? `₹${(l.monthlyRevenue / 100000).toFixed(1)}L` : '—'}</td>
            <td className="text-center"><StatusBadge status={l.status} map={statusColors} /></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}


// ============================
// COMMISSIONS VIEW (MLM Config)
// ============================
function CommissionsView() {
  const D = useAdminData();
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 mb-2">5-Level Referral Commission Structure</h3>
        <p className="text-sm text-slate-400 mb-6">Configure commission percentages for each referral type across all 5 MLM levels. Changes affect new transactions only.</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-200"><th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Referral Type</th><th className="text-center text-xs font-medium text-slate-400 px-4 py-3">Level 1</th><th className="text-center text-xs font-medium text-slate-400 px-4 py-3">Level 2</th><th className="text-center text-xs font-medium text-slate-400 px-4 py-3">Level 3</th><th className="text-center text-xs font-medium text-slate-400 px-4 py-3">Level 4</th><th className="text-center text-xs font-medium text-slate-400 px-4 py-3">Level 5</th><th className="text-center text-xs font-medium text-slate-400 px-4 py-3">One-Time Bonus</th><th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {D.mockCommissions.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3"><span className="text-sm font-medium text-slate-700 capitalize">{c.referralType}</span></td>
                  <td className="text-center"><span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium">{c.level1Percent}%</span></td>
                  <td className="text-center"><span className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-sm font-medium">{c.level2Percent}%</span></td>
                  <td className="text-center"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">{c.level3Percent}%</span></td>
                  <td className="text-center"><span className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-lg text-sm font-medium">{c.level4Percent}%</span></td>
                  <td className="text-center"><span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium">{c.level5Percent}%</span></td>
                  <td className="text-center text-sm font-semibold text-green-600">₹{c.oneTimeBonus.toLocaleString()}</td>
                  <td className="text-right px-4"><button className="px-2.5 py-1 text-[10px] font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ============================
// STAFF VIEW
// ============================
function StaffView() {
  const D = useAdminData();
  return (
    <div className="space-y-6">
      <PageHeader count={String(D.mockStaff.length)}><AddBtn label="Add Staff" /></PageHeader>
      <DataTable headers={[{ label: 'Staff Member' }, { label: 'Role' }, { label: 'Location', align: 'center' }, { label: 'Status', align: 'center' }, { label: 'Joined' }, { label: 'Actions', align: 'right' }]}>
        {D.mockStaff.map(s => (
          <tr key={s.id} className="hover:bg-gray-50/50 transition">
            <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={s.name} /><div><p className="text-sm font-medium text-slate-700">{s.name}</p><p className="text-[10px] text-slate-400">{s.email} · {s.phone}</p></div></div></td>
            <td className="px-5 py-4 text-sm text-slate-600 capitalize">{s.role.replace(/_/g, ' ')}</td>
            <td className="text-center text-sm text-slate-500">{s.location}</td>
            <td className="text-center"><StatusBadge status={s.status} map={statusColors} /></td>
            <td className="px-5 py-4 text-sm text-slate-400">{s.joinedAt}</td>
            <td className="text-right px-5"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreHorizontal className="w-4 h-4 text-slate-400" /></button></td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}


// ============================
// ANALYTICS VIEW
// ============================
function AnalyticsView() {
  const D = useAdminData();
  const stats = D.getDashboardStats();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Revenue Report', desc: 'Monthly breakdown, trends & forecasts', icon: IndianRupee, color: 'from-green-500 to-emerald-500', value: stats.monthRevenue },
          { title: 'Occupancy Report', desc: 'Pod & room utilization across locations', icon: Building2, color: 'from-blue-500 to-cyan-500', value: stats.avgOccupancy },
          { title: 'User Growth', desc: 'Registrations, retention & activity', icon: Users, color: 'from-violet-500 to-purple-500', value: stats.totalUsers },
          { title: 'Booking Analytics', desc: 'Trends, peak hours & cancellations', icon: Calendar, color: 'from-amber-500 to-orange-500', value: stats.activeBookings },
          { title: 'Support Metrics', desc: 'Resolution times & satisfaction', icon: Ticket, color: 'from-pink-500 to-rose-500', value: '4.2h avg' },
          { title: 'Partner Performance', desc: 'Revenue, ratings & compliance', icon: Hotel, color: 'from-teal-500 to-cyan-500', value: stats.totalPartners },
        ].map(r => (
          <div key={r.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition cursor-pointer group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <r.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{r.title}</h3>
            <p className="text-sm text-slate-400 mb-2">{r.desc}</p>
            <p className="text-xl font-bold text-slate-800">{r.value}</p>
            <button className="mt-3 text-xs text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700">Generate Report <ArrowRight className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Revenue Trend (Last 6 Months)</h3>
        <div className="h-48 bg-gradient-to-r from-primary-50 to-violet-50 rounded-xl flex items-end justify-around px-8 py-4">
          {[45, 62, 78, 85, 120, 184].map((v, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-slate-500">₹{v / 10}L</span>
              <div className="w-12 bg-gradient-to-t from-primary-500 to-violet-500 rounded-t-lg" style={{ height: `${(v / 184) * 120}px` }} />
              <span className="text-[10px] text-slate-400">{['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ============================
// MARKETING VIEW
// ============================
function MarketingView() {
  const D = useAdminData();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Active Campaigns" value="3" icon={Megaphone} color="from-violet-500 to-purple-500" />
        <StatCard label="Total Reach" value="45.2K" icon={Users} color="from-blue-500 to-cyan-500" />
        <StatCard label="Conversion Rate" value="3.8%" icon={ArrowUpRight} color="from-green-500 to-emerald-500" />
        <StatCard label="Ad Spend (MTD)" value="₹1.2L" icon={IndianRupee} color="from-amber-500 to-orange-500" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { title: 'Summer Pod Sale', status: 'active', reach: '18.5K', conversions: 342, budget: '₹45K' },
          { title: 'Partner Referral Program', status: 'active', reach: '12.3K', conversions: 89, budget: '₹30K' },
          { title: 'App Install Campaign', status: 'active', reach: '14.4K', conversions: 567, budget: '₹45K' },
          { title: 'Diwali Offer', status: 'scheduled', reach: '—', conversions: 0, budget: '₹80K' },
        ].map(c => (
          <div key={c.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-slate-800">{c.title}</h3><StatusBadge status={c.status} map={statusColors} /></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-lg font-bold text-slate-700">{c.reach}</p><p className="text-[10px] text-slate-400">Reach</p></div>
              <div><p className="text-lg font-bold text-slate-700">{c.conversions}</p><p className="text-[10px] text-slate-400">Conversions</p></div>
              <div><p className="text-lg font-bold text-slate-700">{c.budget}</p><p className="text-[10px] text-slate-400">Budget</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ============================
// CONTENT VIEW
// ============================
function ContentView() {
  const D = useAdminData();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Blog Posts', count: 12, icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
          { title: 'FAQs', count: 24, icon: MessageSquare, color: 'from-violet-500 to-purple-500' },
          { title: 'Website Pages', count: 29, icon: MapPin, color: 'from-green-500 to-emerald-500' },
        ].map(c => (
          <div key={c.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition cursor-pointer group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><c.icon className="w-6 h-6 text-white" /></div>
            <h3 className="font-semibold text-slate-800 mb-1">{c.title}</h3>
            <p className="text-sm text-slate-400">{c.count} items</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-slate-800">Recent Blog Posts</h3><AddBtn label="New Post" /></div>
        <div className="space-y-3">
          {[
            { title: 'Why Sleep Pods Are the Future of Transit Stays', status: 'published', date: 'Mar 15, 2026', views: '2.4K' },
            { title: '5 Best Airport Pods for Business Travelers', status: 'published', date: 'Mar 10, 2026', views: '1.8K' },
            { title: 'Naploo Partner Success Stories', status: 'draft', date: 'Mar 18, 2026', views: '—' },
          ].map(post => (
            <div key={post.title} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
              <div><p className="text-sm font-medium text-slate-700">{post.title}</p><p className="text-[10px] text-slate-400">{post.date} · {post.views} views</p></div>
              <StatusBadge status={post.status} map={{ published: 'bg-green-50 text-green-600', draft: 'bg-amber-50 text-amber-600' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ============================
// NOTIFICATIONS VIEW
// ============================
function NotificationsView() {
  const D = useAdminData();
  const notifications = [
    { type: 'ticket', title: 'New urgent ticket: AC not working in Pod #12', time: '30m ago', read: false },
    { type: 'booking', title: 'Booking BK-4521 confirmed by Rahul Sharma', time: '2h ago', read: false },
    { type: 'application', title: 'New partner application from Horizon Hotels', time: '3h ago', read: false },
    { type: 'review', title: 'New 2-star review flagged for moderation', time: '5h ago', read: false },
    { type: 'payout', title: 'Payout PO003 pending approval for Vikram Kumar', time: '8h ago', read: false },
    { type: 'system', title: 'Pod maintenance scheduled at Delhi Station', time: '1d ago', read: true },
    { type: 'revenue', title: 'Monthly payout of ₹6.2L processed successfully', time: '1d ago', read: true },
    { type: 'investor', title: 'New investor KYC submitted — Meera Patel', time: '2d ago', read: true },
  ];
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between"><p className="text-sm text-slate-400"><span className="font-semibold text-slate-700">5</span> unread</p><button className="text-xs text-primary-600 font-medium hover:text-primary-700">Mark all read</button></div>
      {notifications.map((n, i) => (
        <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition ${n.read ? 'bg-white border-gray-100' : 'bg-primary-50/50 border-primary-100'}`}>
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary-500'}`} />
          <div className="flex-1"><p className={`text-sm ${n.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>{n.title}</p><p className="text-[10px] text-slate-400 mt-1">{n.time}</p></div>
        </div>
      ))}
    </div>
  );
}


// ============================
// SETTINGS VIEW
// ============================
function SettingsView() {
  const D = useAdminData();
  return (
    <div className="max-w-3xl space-y-6">
      {[
        { title: 'General Settings', items: ['Site Name', 'Contact Email', 'Support Phone', 'Business Hours', 'Timezone', 'Currency'] },
        { title: 'Booking Configuration', items: ['Min Pod Booking (hrs)', 'Max Pod Booking (hrs)', 'Room Check-in Time', 'Room Check-out Time', 'Cancellation Policy', 'Grace Period (mins)', 'Auto-Checkout', 'GST Rate (%)'] },
        { title: 'Revenue Split', items: ['Default Owner Share (%)', 'Default Naploo Share (%)', 'Partner Commission (%)', 'Investor Share (%)', 'TDS Rate (%)'] },
        { title: 'Payment Configuration', items: ['Razorpay Key', 'Razorpay Secret', 'Payment Gateway Mode', 'Auto Refund', 'Wallet Limits', 'Min Payout Amount'] },
        { title: 'Notification Preferences', items: ['New Booking Alerts', 'Ticket Alerts', 'Application Alerts', 'Revenue Reports', 'SMS Gateway (Twilio/MSG91)', 'Push Notification Config'] },
        { title: 'Security', items: ['Admin Password Policy', 'Session Timeout', 'IP Whitelist', '2FA Requirement', 'Audit Log Retention'] },
      ].map(section => (
        <div key={section.title} className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100"><h3 className="font-semibold text-slate-800">{section.title}</h3></div>
          <div className="divide-y divide-gray-50">
            {section.items.map(item => (
              <div key={item} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition cursor-pointer">
                <span className="text-sm text-slate-600">{item}</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================
// DEAL CALCULATOR VIEW
// Helps admin model how much of Naploo's 40% share can be offered
// to a property owner (hotel / coworking / bus stand / etc.) as
// percentage, fixed rent, or hybrid \u2014 with profitability check.
// ============================
type DealSeed = {
  applicationId?: string;
  applicationNumber?: string;
  propertyName?: string;
  city?: string;
  state?: string;
  propertyType?: string;
  pods?: number;
  sqft?: number;
  existing?: PartnerApplicationRow['offerDetails'] | null;
};

type OfferMode = 'percentage' | 'fixed' | 'hybrid';

function fmtINR(n: number): string {
  if (!Number.isFinite(n)) return '\u20b90';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}\u20b9${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}\u20b9${(abs / 100000).toFixed(2)} L`;
  return `${sign}\u20b9${Math.round(abs).toLocaleString('en-IN')}`;
}

function computeScenario(opts: {
  monthlyGross: number;
  monthlyNaplooGross: number;
  monthlyOpsCost: number;
  monthlyPropertyPayout: number;
}) {
  const { monthlyGross, monthlyNaplooGross, monthlyOpsCost, monthlyPropertyPayout } = opts;
  const monthlyNaplooNet = monthlyNaplooGross - monthlyOpsCost - monthlyPropertyPayout;
  const naplooMarginPct = monthlyGross > 0 ? (monthlyNaplooNet / monthlyGross) * 100 : 0;
  const yearlyNaplooNet = monthlyNaplooNet * 12;
  let verdict: 'profitable' | 'tight' | 'loss';
  if (monthlyNaplooNet <= 0) verdict = 'loss';
  else if (naplooMarginPct < 8) verdict = 'tight';
  else verdict = 'profitable';
  return { monthlyNaplooNet, naplooMarginPct, yearlyNaplooNet, verdict };
}

function DealCalculatorView() {
  // Seed (if launched from Applications detail modal)
  const [seed, setSeed] = useState<DealSeed | null>(null);

  // Revenue inputs
  const [pods, setPods] = useState(4);
  const [occupancyHours, setOccupancyHours] = useState(16);
  const [hourlyRate, setHourlyRate] = useState(150);

  // Split inputs
  const [investorSharePct, setInvestorSharePct] = useState(60);
  const [operatingCostPct, setOperatingCostPct] = useState(10);

  // Offer mode + per-mode params
  const [offerMode, setOfferMode] = useState<OfferMode>('percentage');
  const [propertyPct, setPropertyPct] = useState(10);
  const [fixedRent, setFixedRent] = useState(15000);
  const [hybridBase, setHybridBase] = useState(5000);
  const [hybridPct, setHybridPct] = useState(5);

  // Notes + save state
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Hydrate seed from sessionStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem('naploo-deal-seed');
    if (!raw) return;
    try {
      const s = JSON.parse(raw) as DealSeed;
      setSeed(s);
      if (s.pods && s.pods > 0) setPods(s.pods);
      if (s.existing) {
        const e = s.existing;
        setPods(e.pods || s.pods || 4);
        setOccupancyHours(e.occupancyHours || 16);
        setHourlyRate(e.hourlyRate || 150);
        setInvestorSharePct(e.investorSharePct || 60);
        setOperatingCostPct(e.operatingCostPct || 10);
        setOfferMode(e.offerMode || 'percentage');
        if (e.propertyPct != null) setPropertyPct(e.propertyPct);
        if (e.fixedRent != null) setFixedRent(e.fixedRent);
        if (e.hybridBase != null) setHybridBase(e.hybridBase);
        if (e.hybridPct != null) setHybridPct(e.hybridPct);
        if (e.notes) setNotes(e.notes);
      }
      sessionStorage.removeItem('naploo-deal-seed');
    } catch { /* noop */ }
  }, []);

  const naplooGrossSharePct = Math.max(0, Math.min(100, 100 - investorSharePct));

  // Core calc
  const calc = useMemo(() => {
    const dailyGross = pods * occupancyHours * hourlyRate;
    const monthlyGross = dailyGross * 30;
    const yearlyGross = dailyGross * 365;
    const monthlyInvestor = monthlyGross * (investorSharePct / 100);
    const monthlyNaplooGross = monthlyGross * (naplooGrossSharePct / 100);
    const monthlyOpsCost = monthlyGross * (operatingCostPct / 100);

    const scenarios = {
      percentage: (() => {
        const payout = monthlyGross * (propertyPct / 100);
        const r = computeScenario({ monthlyGross, monthlyNaplooGross, monthlyOpsCost, monthlyPropertyPayout: payout });
        return { ...r, monthlyPropertyPayout: payout, label: `${propertyPct}% of Gross` };
      })(),
      fixed: (() => {
        const payout = fixedRent;
        const r = computeScenario({ monthlyGross, monthlyNaplooGross, monthlyOpsCost, monthlyPropertyPayout: payout });
        return { ...r, monthlyPropertyPayout: payout, label: `${fmtINR(fixedRent)}/mo Rent` };
      })(),
      hybrid: (() => {
        const payout = hybridBase + monthlyGross * (hybridPct / 100);
        const r = computeScenario({ monthlyGross, monthlyNaplooGross, monthlyOpsCost, monthlyPropertyPayout: payout });
        return { ...r, monthlyPropertyPayout: payout, label: `${fmtINR(hybridBase)} + ${hybridPct}%` };
      })(),
    } as const;

    const active = scenarios[offerMode];
    // Best scenario by Naploo net (highest)
    const bestKey = (Object.keys(scenarios) as OfferMode[]).reduce((best, k) =>
      scenarios[k].monthlyNaplooNet > scenarios[best].monthlyNaplooNet ? k : best, 'percentage' as OfferMode);

    return {
      dailyGross,
      monthlyGross,
      yearlyGross,
      monthlyInvestor,
      monthlyNaplooGross,
      monthlyOpsCost,
      scenarios,
      active,
      bestKey,
    };
  }, [pods, occupancyHours, hourlyRate, investorSharePct, naplooGrossSharePct, operatingCostPct, offerMode, propertyPct, fixedRent, hybridBase, hybridPct]);

  const saveOffer = async () => {
    if (!seed?.applicationId) return;
    const adminKey = typeof window !== 'undefined' ? localStorage.getItem('naploo-admin-api-key') : '';
    if (!adminKey) {
      setSaveMsg('Admin key missing. Open Applications and unlock first.');
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const body = {
        id: seed.applicationId,
        offerDetails: {
          pods,
          occupancyHours,
          hourlyRate,
          investorSharePct,
          naplooGrossSharePct,
          operatingCostPct,
          offerMode,
          propertyPct: offerMode === 'percentage' ? propertyPct : undefined,
          fixedRent: offerMode === 'fixed' ? fixedRent : undefined,
          hybridBase: offerMode === 'hybrid' ? hybridBase : undefined,
          hybridPct: offerMode === 'hybrid' ? hybridPct : undefined,
          monthlyGrossRevenue: calc.monthlyGross,
          monthlyInvestorPayout: calc.monthlyInvestor,
          monthlyNaplooGross: calc.monthlyNaplooGross,
          monthlyOperatingCost: calc.monthlyOpsCost,
          monthlyPropertyPayout: calc.active.monthlyPropertyPayout,
          monthlyNaplooNet: calc.active.monthlyNaplooNet,
          naplooMarginPct: calc.active.naplooMarginPct,
          yearlyNaplooNet: calc.active.yearlyNaplooNet,
          verdict: calc.active.verdict,
          notes,
        },
      };
      const res = await fetch('/api/partner-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaveMsg('Offer saved to application.');
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveMsg(err.error || 'Failed to save offer.');
      }
    } catch {
      setSaveMsg('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const verdictBadge = (v: 'profitable' | 'tight' | 'loss') => {
    if (v === 'profitable') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700"><TrendingUp className="w-3 h-3" /> Profitable</span>;
    if (v === 'tight') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700"><AlertCircle className="w-3 h-3" /> Tight</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700"><TrendingDown className="w-3 h-3" /> Loss</span>;
  };

  const reset = () => {
    setSeed(null);
    setPods(4);
    setOccupancyHours(16);
    setHourlyRate(150);
    setInvestorSharePct(60);
    setOperatingCostPct(10);
    setOfferMode('percentage');
    setPropertyPct(10);
    setFixedRent(15000);
    setHybridBase(5000);
    setHybridPct(5);
    setNotes('');
    setSaveMsg(null);
  };

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-50 via-white to-primary-50 border border-primary-100 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Property Owner Deal Calculator</h2>
              <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
                Model what offer to give a property owner from Naploo&apos;s {naplooGrossSharePct}% share (after paying investor {investorSharePct}%). Compare percentage, fixed rent, and hybrid scenarios side-by-side.
              </p>
            </div>
          </div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {seed && (
          <div className="mt-4 flex items-center gap-3 bg-white border border-primary-200 rounded-xl px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">Calculating for application</p>
              <p className="text-sm font-semibold text-slate-800 truncate">
                <span className="font-mono text-primary-600">{seed.applicationNumber}</span>
                <span className="mx-2 text-slate-300">|</span>
                {seed.propertyName}
                {seed.city && <span className="text-slate-500 font-normal"> &middot; {seed.city}, {seed.state}</span>}
              </p>
            </div>
            <button onClick={() => setSeed(null)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Unlink application">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}
      </div>

      {/* Top stats: gross revenue snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Daily Gross Revenue" value={fmtINR(calc.dailyGross)} icon={IndianRupee} color="from-blue-500 to-indigo-600" />
        <StatCard label="Monthly Gross Revenue" value={fmtINR(calc.monthlyGross)} icon={IndianRupee} color="from-violet-500 to-purple-600" />
        <StatCard label={`Investor Payout (${investorSharePct}%)`} value={fmtINR(calc.monthlyInvestor)} icon={Wallet} color="from-amber-500 to-orange-600" />
        <StatCard label={`Naploo Gross (${naplooGrossSharePct}%)`} value={fmtINR(calc.monthlyNaplooGross)} icon={TrendingUp} color="from-emerald-500 to-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Inputs */}
        <div className="lg:col-span-1 space-y-4">
          {/* Revenue Assumptions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Revenue Assumptions</h3>
            <p className="text-[11px] text-slate-400 mb-4">Pods, occupancy, and rate per hour drive total gross revenue.</p>

            <NumberSlider label="Number of Pods" value={pods} min={1} max={50} step={1} onChange={setPods} suffix=" pods" />
            <NumberSlider label="Daily Occupancy Hours" value={occupancyHours} min={4} max={24} step={1} onChange={setOccupancyHours} suffix=" hrs" />
            <NumberSlider label="Hourly Rate per Pod" value={hourlyRate} min={50} max={500} step={10} onChange={setHourlyRate} prefix="\u20b9" />
          </div>

          {/* Revenue Split */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Revenue Split & Costs</h3>
            <p className="text-[11px] text-slate-400 mb-4">Investor gets {investorSharePct}% (per lease policy). Naploo keeps {naplooGrossSharePct}% which covers ops + property owner payout.</p>

            <NumberSlider label="Investor Share %" value={investorSharePct} min={35} max={75} step={1} onChange={setInvestorSharePct} suffix="%" />
            <NumberSlider label="Operating Cost %" value={operatingCostPct} min={3} max={25} step={1} onChange={setOperatingCostPct} suffix="% of gross" hint="Housekeeping, electricity, internet, support" />
          </div>

          {/* Offer Mode */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Offer to Property Owner</h3>
            <div className="grid grid-cols-3 gap-1.5 bg-gray-50 p-1 rounded-xl mb-4">
              {(['percentage', 'fixed', 'hybrid'] as OfferMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setOfferMode(m)}
                  className={`px-2 py-2 text-[11px] font-semibold rounded-lg transition capitalize ${offerMode === m ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {m === 'percentage' ? '% Share' : m === 'fixed' ? 'Fixed Rent' : 'Hybrid'}
                </button>
              ))}
            </div>

            {offerMode === 'percentage' && (
              <NumberSlider label="Property Owner %" value={propertyPct} min={1} max={30} step={1} onChange={setPropertyPct} suffix="% of gross" hint="Paid out of Naploo's share" />
            )}
            {offerMode === 'fixed' && (
              <NumberSlider label="Monthly Rent" value={fixedRent} min={0} max={200000} step={1000} onChange={setFixedRent} prefix="\u20b9" hint="Flat amount regardless of revenue" />
            )}
            {offerMode === 'hybrid' && (
              <>
                <NumberSlider label="Base Monthly Rent" value={hybridBase} min={0} max={100000} step={500} onChange={setHybridBase} prefix="\u20b9" />
                <NumberSlider label="+ Revenue Share %" value={hybridPct} min={0} max={20} step={1} onChange={setHybridPct} suffix="% of gross" />
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Scenarios + Recommendation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['percentage', 'fixed', 'hybrid'] as OfferMode[]).map(mode => {
              const sc = calc.scenarios[mode];
              const isActive = offerMode === mode;
              const isBest = calc.bestKey === mode;
              return (
                <div
                  key={mode}
                  className={`relative rounded-2xl border-2 p-5 transition cursor-pointer ${
                    isActive ? 'border-primary-500 bg-primary-50/30 shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                  onClick={() => setOfferMode(mode)}
                >
                  {isBest && (
                    <span className="absolute -top-2 left-4 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-violet-500 to-primary-600 text-white shadow">
                      Best Net
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{mode === 'percentage' ? 'Percentage' : mode === 'fixed' ? 'Fixed Rent' : 'Hybrid'}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{sc.label}</p>
                    </div>
                    {verdictBadge(sc.verdict)}
                  </div>
                  <div className="mt-3 space-y-1.5 text-[11px]">
                    <ScRow label="Property gets" value={fmtINR(sc.monthlyPropertyPayout) + ' /mo'} />
                    <ScRow label="Naploo gross" value={fmtINR(calc.monthlyNaplooGross) + ' /mo'} />
                    <ScRow label="- Ops cost" value={'-' + fmtINR(calc.monthlyOpsCost)} muted />
                    <ScRow label="- Property" value={'-' + fmtINR(sc.monthlyPropertyPayout)} muted />
                    <div className="border-t border-dashed border-gray-200 my-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Naploo Net /mo</span>
                      <span className={`text-base font-bold ${sc.monthlyNaplooNet > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {fmtINR(sc.monthlyNaplooNet)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Margin of gross</span>
                      <span className={sc.naplooMarginPct >= 8 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                        {sc.naplooMarginPct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Yearly net</span>
                      <span className="font-semibold text-slate-700">{fmtINR(sc.yearlyNaplooNet)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Recommendation
            </h3>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 text-sm">
              <p className="text-slate-700">
                Based on inputs, <span className="font-bold text-emerald-700 capitalize">{calc.bestKey === 'fixed' ? 'Fixed Rent' : calc.bestKey === 'hybrid' ? 'Hybrid' : 'Percentage'}</span> gives the highest Naploo net at{' '}
                <span className="font-bold">{fmtINR(calc.scenarios[calc.bestKey].monthlyNaplooNet)}/month</span>{' '}
                ({calc.scenarios[calc.bestKey].naplooMarginPct.toFixed(1)}% margin).
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                <strong>Tip:</strong> When monthly gross revenue is volatile, prefer a lower percentage share so property payout scales with revenue. Use fixed rent only when occupancy is predictable.
              </p>
            </div>
          </div>

          {/* Notes + Save */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Notes & Save</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes for this offer (negotiation points, contingencies, etc.)"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 resize-none"
            />
            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <p className="text-[11px] text-slate-400">
                {seed?.applicationId
                  ? <>Saving will attach this offer snapshot to <span className="font-mono text-primary-600">{seed.applicationNumber}</span>.</>
                  : 'Open an application from the Applications tab and click "Calculate Offer" to save against it.'}
              </p>
              {saveMsg && (
                <p className={`text-xs font-semibold ${saveMsg.includes('saved') ? 'text-emerald-600' : 'text-red-600'}`}>{saveMsg}</p>
              )}
              <button
                onClick={saveOffer}
                disabled={!seed?.applicationId || saving}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-500 to-primary-600 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {saving ? 'Saving...' : 'Save Offer to Application'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberSlider({
  label, value, min, max, step, onChange, prefix = '', suffix = '', hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onChange(Math.max(min, value - step))} className="w-6 h-6 rounded-md bg-gray-50 hover:bg-gray-100 text-slate-500 inline-flex items-center justify-center"><Minus className="w-3 h-3" /></button>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={e => {
              const v = parseFloat(e.target.value);
              if (Number.isFinite(v)) onChange(Math.max(min, Math.min(max, v)));
            }}
            className="w-20 px-2 py-1 text-xs font-semibold text-center bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-primary-500"
          />
          <button onClick={() => onChange(Math.min(max, value + step))} className="w-6 h-6 rounded-md bg-gray-50 hover:bg-gray-100 text-slate-500 inline-flex items-center justify-center"><Plus className="w-3 h-3" /></button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-primary-500"
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-slate-400">{prefix}{min}{suffix}</span>
        <span className="text-[10px] text-slate-400">{prefix}{max}{suffix}</span>
      </div>
      {hint && <p className="text-[10px] text-slate-400 mt-1 italic">{hint}</p>}
    </div>
  );
}

function ScRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-slate-400' : 'text-slate-500'}>{label}</span>
      <span className={muted ? 'text-slate-400' : 'text-slate-700 font-medium'}>{value}</span>
    </div>
  );
}

// NOTE: Calculator import lives at the top of the file with the other lucide imports.

// Import Calculator from lucide-react (added to the icons import at the top of this file).
