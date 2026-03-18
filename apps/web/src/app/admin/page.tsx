'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, Calendar, Ticket, FileText,
  CreditCard, MapPin, Settings, Bell, LogOut, ChevronRight,
  TrendingUp, TrendingDown, IndianRupee, Eye, Clock, CheckCircle,
  AlertCircle, Search, Menu, X, ChevronDown, BarChart3, Package,
  MessageSquare, Shield, Globe, Headphones, Star, ArrowUpRight, ArrowRight,
  ArrowDownRight, MoreHorizontal, Filter, Download, RefreshCw,
  UserPlus, Activity, Zap, PieChart, Layers, Megaphone, BookOpen
} from 'lucide-react';

// === TYPES ===
type AdminPage = 'dashboard' | 'users' | 'pods' | 'bookings' | 'tickets' | 'applications' |
  'revenue' | 'locations' | 'partners' | 'settings' | 'notifications' | 'reports' |
  'reviews' | 'staff' | 'marketing' | 'content';

interface SidebarItem {
  id: AdminPage;
  label: string;
  icon: React.ElementType;
  badge?: number;
  section?: string;
}

// === SIDEBAR CONFIG ===
const sidebarSections: { title: string; items: SidebarItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'notifications', label: 'Notifications', icon: Bell, badge: 5 },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'users', label: 'Users', icon: Users, badge: 12 },
      { id: 'pods', label: 'Pods & Properties', icon: Building2 },
      { id: 'bookings', label: 'Bookings', icon: Calendar, badge: 8 },
      { id: 'locations', label: 'Locations', icon: MapPin },
    ],
  },
  {
    title: 'Support & Applications',
    items: [
      { id: 'tickets', label: 'Support Tickets', icon: Ticket, badge: 23 },
      { id: 'applications', label: 'Applications', icon: FileText, badge: 7 },
      { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
    ],
  },
  {
    title: 'Business',
    items: [
      { id: 'revenue', label: 'Revenue & Payments', icon: CreditCard },
      { id: 'partners', label: 'Partners', icon: Layers },
      { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'staff', label: 'Staff Management', icon: Shield },
      { id: 'marketing', label: 'Marketing', icon: Megaphone },
      { id: 'content', label: 'Content Manager', icon: BookOpen },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

// === SAMPLE DATA ===
const dashboardStats = [
  { label: 'Total Users', value: '12,847', change: '+12.5%', trend: 'up', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { label: 'Active Bookings', value: '342', change: '+8.2%', trend: 'up', icon: Calendar, color: 'from-violet-500 to-purple-500' },
  { label: 'Revenue (MTD)', value: '₹18.4L', change: '+23.1%', trend: 'up', icon: IndianRupee, color: 'from-green-500 to-emerald-500' },
  { label: 'Open Tickets', value: '23', change: '-5.3%', trend: 'down', icon: Ticket, color: 'from-amber-500 to-orange-500' },
];

const recentBookings = [
  { id: 'BK-4521', user: 'Rahul Sharma', pod: 'Galaxy Series', location: 'Mumbai T2', amount: 800, status: 'confirmed', time: '2h ago' },
  { id: 'BK-4520', user: 'Priya Singh', pod: 'Space Pod', location: 'Delhi Station', amount: 450, status: 'checked-in', time: '3h ago' },
  { id: 'BK-4519', user: 'Amit Patel', pod: 'Comfort Plus', location: 'BLR Airport', amount: 600, status: 'completed', time: '5h ago' },
  { id: 'BK-4518', user: 'Sneha Reddy', pod: 'Galaxy Series', location: 'Hyderabad Hub', amount: 900, status: 'confirmed', time: '6h ago' },
  { id: 'BK-4517', user: 'Karthik M', pod: 'Space Pod', location: 'Chennai Central', amount: 350, status: 'cancelled', time: '8h ago' },
];

const recentTickets = [
  { id: 'TK-1087', subject: 'AC not working in Pod #12', priority: 'urgent', status: 'open', user: 'Vikram K', time: '30m ago' },
  { id: 'TK-1086', subject: 'Refund delay for BK-4490', priority: 'high', status: 'in-progress', user: 'Nisha G', time: '2h ago' },
  { id: 'TK-1085', subject: 'App crashing on booking', priority: 'medium', status: 'open', user: 'Arjun S', time: '4h ago' },
  { id: 'TK-1084', subject: 'Wrong pod assigned', priority: 'high', status: 'resolved', user: 'Meera P', time: '6h ago' },
];

const pendingApplications = [
  { id: 'APP-3015', business: 'Horizon Hotels', type: 'partner', city: 'Pune', date: '2d ago' },
  { id: 'APP-3014', business: 'RedBrick Infra', type: 'investor', city: 'Delhi', date: '3d ago' },
  { id: 'APP-3013', business: 'TravelHub Co.', type: 'franchise', city: 'Bangalore', date: '5d ago' },
];

const topLocations = [
  { name: 'Mumbai Airport T2', pods: 45, occupancy: 87, revenue: '₹4.2L' },
  { name: 'Delhi Railway Station', pods: 32, occupancy: 72, revenue: '₹3.1L' },
  { name: 'BLR Airport', pods: 28, occupancy: 91, revenue: '₹3.8L' },
  { name: 'Chennai Central', pods: 20, occupancy: 65, revenue: '₹1.9L' },
];

// === ADMIN DASHBOARD COMPONENT ===
export default function AdminDashboard() {
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* === SIDEBAR === */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-300 flex flex-col ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-slate-900`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-sm">Naploo</h2>
                <p className="text-[10px] text-white/40">Admin Dashboard</p>
              </div>
            </div>
          )}
          <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileMenuOpen(false); }} className="text-white/50 hover:text-white transition p-1">
            {sidebarOpen ? <X className="w-5 h-5 lg:hidden" /> : null}
            <Menu className="w-5 h-5 hidden lg:block" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
          {sidebarSections.map(section => (
            <div key={section.title}>
              {sidebarOpen && (
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider px-3 mb-2">{section.title}</p>
              )}
              <div className="space-y-1">
                {section.items.map(item => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500/20 to-violet-600/20 text-white border border-primary-500/30'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin profile */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">AD</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-[10px] text-white/40">Super Admin</p>
              </div>
              <button onClick={() => router.push('/')} className="text-white/40 hover:text-red-400 transition" title="Exit Admin">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* === MAIN CONTENT === */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-slate-500">
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800 capitalize">{activePage === 'dashboard' ? 'Dashboard' : activePage.replace('-', ' & ')}</h1>
                <p className="text-xs text-slate-400">Welcome back, Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-64 focus:outline-none focus:border-primary-500 transition" placeholder="Search anything..." />
              </div>
              <button className="relative p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <Bell className="w-5 h-5 text-slate-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <RefreshCw className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {activePage === 'dashboard' && <DashboardView />}
          {activePage === 'users' && <UsersView />}
          {activePage === 'pods' && <PodsView />}
          {activePage === 'bookings' && <BookingsView />}
          {activePage === 'tickets' && <TicketsView />}
          {activePage === 'applications' && <ApplicationsView />}
          {activePage === 'revenue' && <RevenueView />}
          {activePage === 'locations' && <LocationsView />}
          {activePage === 'partners' && <PartnersView />}
          {activePage === 'reports' && <ReportsView />}
          {activePage === 'reviews' && <ReviewsView />}
          {activePage === 'staff' && <StaffView />}
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
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-slate-800">Recent Bookings</h3>
            <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">View All →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 text-xs font-bold">{b.user.split(' ').map(n=>n[0]).join('')}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{b.user}</p>
                    <p className="text-[11px] text-slate-400">{b.pod} · {b.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">₹{b.amount}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    b.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                    b.status === 'checked-in' ? 'bg-green-50 text-green-600' :
                    b.status === 'completed' ? 'bg-slate-50 text-slate-500' :
                    'bg-red-50 text-red-500'
                  }`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Open Tickets */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-slate-800">Open Tickets</h3>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">23 open</span>
            </div>
            <div className="divide-y divide-gray-50">
              {recentTickets.slice(0, 3).map(t => (
                <div key={t.id} className="px-5 py-3 hover:bg-gray-50/50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-400">{t.id}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      t.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                      t.priority === 'high' ? 'bg-amber-50 text-amber-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>{t.priority}</span>
                  </div>
                  <p className="text-sm text-slate-700 truncate">{t.subject}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{t.user} · {t.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Applications */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-slate-800">Pending Apps</h3>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">7 pending</span>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingApplications.map(a => (
                <div key={a.id} className="px-5 py-3 hover:bg-gray-50/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{a.business}</p>
                      <p className="text-[10px] text-slate-400">{a.type} · {a.city}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">{a.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Locations */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">Top Performing Locations</h3>
          <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Location</th>
                <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Pods</th>
                <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Occupancy</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topLocations.map(loc => (
                <tr key={loc.name} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3 text-sm font-medium text-slate-700">{loc.name}</td>
                  <td className="px-5 py-3 text-sm text-center text-slate-500">{loc.pods}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${loc.occupancy > 80 ? 'bg-green-500' : loc.occupancy > 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${loc.occupancy}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{loc.occupancy}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-right font-semibold text-slate-700">{loc.revenue}</td>
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
  const users = [
    { id: 'U001', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', bookings: 12, status: 'active', joined: 'Jan 2026' },
    { id: 'U002', name: 'Priya Singh', phone: '+91 87654 32109', email: 'priya@email.com', bookings: 8, status: 'active', joined: 'Feb 2026' },
    { id: 'U003', name: 'Amit Patel', phone: '+91 76543 21098', email: 'amit@email.com', bookings: 5, status: 'active', joined: 'Feb 2026' },
    { id: 'U004', name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha@email.com', bookings: 3, status: 'suspended', joined: 'Mar 2026' },
    { id: 'U005', name: 'Vikram Kumar', phone: '+91 54321 09876', email: 'vikram@email.com', bookings: 15, status: 'active', joined: 'Dec 2025' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Total <span className="font-semibold text-slate-700">12,847</span> registered users</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="Search users..." />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-slate-600 hover:border-gray-300"><Filter className="w-4 h-4" /> Filter</button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-slate-600 hover:border-gray-300"><Download className="w-4 h-4" /> Export</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">User</th>
              <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Contact</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Bookings</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Status</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Joined</th>
              <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center text-primary-600 text-xs font-bold">{u.name.split(' ').map(n=>n[0]).join('')}</div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-slate-600">{u.phone}</p>
                  <p className="text-[10px] text-slate-400">{u.email}</p>
                </td>
                <td className="px-5 py-4 text-center text-sm font-medium text-slate-700">{u.bookings}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${u.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{u.status}</span>
                </td>
                <td className="px-5 py-4 text-center text-sm text-slate-400">{u.joined}</td>
                <td className="px-5 py-4 text-right">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition"><MoreHorizontal className="w-4 h-4 text-slate-400" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ============================
// PODS VIEW
// ============================
function PodsView() {
  const pods = [
    { id: 'POD-001', name: 'Galaxy Series', location: 'Mumbai T2', totalPods: 12, available: 8, occupied: 4, revenue: '₹1.2L', status: 'active' },
    { id: 'POD-002', name: 'Space Series', location: 'Delhi Station', totalPods: 8, available: 3, occupied: 5, revenue: '₹89K', status: 'active' },
    { id: 'POD-003', name: 'Comfort Plus', location: 'BLR Airport', totalPods: 15, available: 12, occupied: 3, revenue: '₹1.8L', status: 'active' },
    { id: 'POD-004', name: 'Galaxy Series', location: 'Hyderabad Hub', totalPods: 6, available: 1, occupied: 5, revenue: '₹72K', status: 'maintenance' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Total Pods</p>
          <p className="text-2xl font-bold text-slate-800">156</p>
          <p className="text-[10px] text-green-600 mt-1">+8 this month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Available Now</p>
          <p className="text-2xl font-bold text-green-600">98</p>
          <p className="text-[10px] text-slate-400 mt-1">62.8% available</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Under Maintenance</p>
          <p className="text-2xl font-bold text-amber-600">4</p>
          <p className="text-[10px] text-slate-400 mt-1">Expected back: 2 days</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">Pod Properties</h3>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-violet-600 rounded-xl hover:opacity-90 transition">+ Add Property</button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Property</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Total</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Available</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Occupied</th>
              <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Revenue</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pods.map(pod => (
              <tr key={pod.id} className="hover:bg-gray-50/50 transition">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">{pod.name}</p>
                  <p className="text-[10px] text-slate-400">{pod.location}</p>
                </td>
                <td className="text-center text-sm text-slate-600">{pod.totalPods}</td>
                <td className="text-center text-sm text-green-600 font-medium">{pod.available}</td>
                <td className="text-center text-sm text-amber-600 font-medium">{pod.occupied}</td>
                <td className="text-right text-sm font-semibold text-slate-700">{pod.revenue}</td>
                <td className="text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${pod.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{pod.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ============================
// BOOKINGS VIEW
// ============================
function BookingsView() {
  const allBookings = [
    { id: 'BK-4521', user: 'Rahul Sharma', pod: 'Galaxy Series', location: 'Mumbai T2', checkin: '14:00', checkout: '18:00', amount: 800, status: 'confirmed', date: '2026-03-18' },
    { id: 'BK-4520', user: 'Priya Singh', pod: 'Space Pod', location: 'Delhi Station', checkin: '10:00', checkout: '14:00', amount: 450, status: 'checked-in', date: '2026-03-18' },
    { id: 'BK-4519', user: 'Amit Patel', pod: 'Comfort Plus', location: 'BLR Airport', checkin: '08:00', checkout: '12:00', amount: 600, status: 'completed', date: '2026-03-17' },
    { id: 'BK-4518', user: 'Sneha Reddy', pod: 'Galaxy Series', location: 'Hyderabad Hub', checkin: '16:00', checkout: '20:00', amount: 900, status: 'confirmed', date: '2026-03-18' },
    { id: 'BK-4517', user: 'Karthik M', pod: 'Space Pod', location: 'Chennai Central', checkin: '06:00', checkout: '10:00', amount: 350, status: 'cancelled', date: '2026-03-17' },
    { id: 'BK-4516', user: 'Neha Gupta', pod: 'Galaxy Series', location: 'Mumbai T2', checkin: '20:00', checkout: '00:00', amount: 700, status: 'confirmed', date: '2026-03-18' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Today\'s Bookings', value: '48', color: 'from-blue-500 to-cyan-500' },
          { label: 'Checked In', value: '22', color: 'from-green-500 to-emerald-500' },
          { label: 'Pending', value: '18', color: 'from-amber-500 to-orange-500' },
          { label: 'Cancelled', value: '3', color: 'from-red-500 to-pink-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">All Bookings</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-gray-50 rounded-lg text-slate-600 hover:bg-gray-100"><Filter className="w-3 h-3" /> Filter</button>
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-gray-50 rounded-lg text-slate-600 hover:bg-gray-100"><Download className="w-3 h-3" /> Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Booking</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Guest</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Pod / Location</th>
                <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Time</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Amount</th>
                <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allBookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-700">{b.id}</p>
                    <p className="text-[10px] text-slate-400">{b.date}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{b.user}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-slate-600">{b.pod}</p>
                    <p className="text-[10px] text-slate-400">{b.location}</p>
                  </td>
                  <td className="px-5 py-3 text-center text-sm text-slate-500">{b.checkin} - {b.checkout}</td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-slate-700">₹{b.amount}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                      b.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                      b.status === 'checked-in' ? 'bg-green-50 text-green-600' :
                      b.status === 'completed' ? 'bg-slate-50 text-slate-500' :
                      'bg-red-50 text-red-500'
                    }`}>{b.status}</span>
                  </td>
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
// TICKETS VIEW (Admin)
// ============================
function TicketsView() {
  const tickets = [
    { id: 'TK-1087', subject: 'AC not working in Pod #12', category: 'pod', priority: 'urgent', status: 'open', user: 'Vikram K', assignee: 'Support Team A', time: '30m ago' },
    { id: 'TK-1086', subject: 'Refund delay for BK-4490', category: 'payment', priority: 'high', status: 'in-progress', user: 'Nisha G', assignee: 'Finance', time: '2h ago' },
    { id: 'TK-1085', subject: 'App crashing on booking page', category: 'technical', priority: 'medium', status: 'open', user: 'Arjun S', assignee: 'Unassigned', time: '4h ago' },
    { id: 'TK-1084', subject: 'Wrong pod assigned for BK-4478', category: 'booking', priority: 'high', status: 'in-progress', user: 'Meera P', assignee: 'Ops Team', time: '6h ago' },
    { id: 'TK-1083', subject: 'WiFi connectivity issue', category: 'pod', priority: 'medium', status: 'resolved', user: 'Rohit D', assignee: 'Tech Team', time: '1d ago' },
    { id: 'TK-1082', subject: 'Account login issue', category: 'account', priority: 'low', status: 'closed', user: 'Anjali T', assignee: 'Support Team B', time: '2d ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: '12', color: 'text-blue-600 bg-blue-50' },
          { label: 'In Progress', value: '8', color: 'text-amber-600 bg-amber-50' },
          { label: 'Urgent', value: '3', color: 'text-red-600 bg-red-50' },
          { label: 'Avg Resolution', value: '4.2h', color: 'text-green-600 bg-green-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">All Support Tickets</h3>
          <div className="flex gap-2">
            {['All', 'Open', 'In Progress', 'Urgent'].map(f => (
              <button key={f} className="px-3 py-1.5 text-[10px] font-medium bg-gray-50 rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition">{f}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Ticket</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Subject</th>
                <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Priority</th>
                <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Assignee</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition cursor-pointer">
                  <td className="px-5 py-3">
                    <p className="text-sm font-mono text-primary-600">{t.id}</p>
                    <p className="text-[10px] text-slate-400">{t.user}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700 max-w-xs truncate">{t.subject}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      t.priority === 'urgent' ? 'bg-red-50 text-red-600' : t.priority === 'high' ? 'bg-amber-50 text-amber-600' : t.priority === 'medium' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
                    }`}>{t.priority}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      t.status === 'open' ? 'bg-blue-50 text-blue-600' : t.status === 'in-progress' ? 'bg-amber-50 text-amber-600' : t.status === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">{t.assignee}</td>
                  <td className="px-5 py-3 text-right text-xs text-slate-400">{t.time}</td>
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
// APPLICATIONS VIEW (Admin)
// ============================
function ApplicationsView() {
  const applications = [
    { id: 'APP-3015', business: 'Horizon Hotels Pvt Ltd', type: 'partner', contact: 'Rajesh Agarwal', city: 'Pune', pods: '10-25', status: 'under-review', date: '2026-03-16' },
    { id: 'APP-3014', business: 'RedBrick Infrastructure', type: 'investor', contact: 'Sunita Jain', city: 'Delhi NCR', pods: '25-50', status: 'under-review', date: '2026-03-15' },
    { id: 'APP-3013', business: 'TravelHub Co.', type: 'franchise', contact: 'Deepak Menon', city: 'Bangalore', pods: '50+', status: 'submitted', date: '2026-03-13' },
    { id: 'APP-3012', business: 'Sunrise Hotels', type: 'partner', contact: 'Kavita Shah', city: 'Mumbai', pods: '5-10', status: 'approved', date: '2026-03-10' },
    { id: 'APP-3011', business: 'Metro Spaces', type: 'partner', contact: 'Anil Kumar', city: 'Chennai', pods: '5-10', status: 'rejected', date: '2026-03-08' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: '47', color: 'text-slate-800' },
          { label: 'Pending Review', value: '7', color: 'text-amber-600' },
          { label: 'Approved', value: '32', color: 'text-green-600' },
          { label: 'This Month', value: '12', color: 'text-primary-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">All Applications</h3>
          <div className="flex gap-2">
            {['All', 'Partner', 'Investor', 'Franchise'].map(f => (
              <button key={f} className="px-3 py-1.5 text-[10px] font-medium bg-gray-50 rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition">{f}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Application</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Business</th>
                <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Type</th>
                <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">City</th>
                <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Pods</th>
                <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Status</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3">
                    <p className="text-sm font-mono text-primary-600">{a.id}</p>
                    <p className="text-[10px] text-slate-400">{a.date}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-700">{a.business}</p>
                    <p className="text-[10px] text-slate-400">{a.contact}</p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      a.type === 'partner' ? 'bg-violet-50 text-violet-600' : a.type === 'investor' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}>{a.type}</span>
                  </td>
                  <td className="px-5 py-3 text-center text-sm text-slate-500">{a.city}</td>
                  <td className="px-5 py-3 text-center text-sm text-slate-500">{a.pods}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      a.status === 'submitted' ? 'bg-blue-50 text-blue-600' : a.status === 'under-review' ? 'bg-amber-50 text-amber-600' : a.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="px-2.5 py-1 text-[10px] font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition">View</button>
                      {(a.status === 'submitted' || a.status === 'under-review') && (
                        <button className="px-2.5 py-1 text-[10px] font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition">Approve</button>
                      )}
                    </div>
                  </td>
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
// REVENUE VIEW
// ============================
function RevenueView() {
  const transactions = [
    { id: 'TXN-8901', booking: 'BK-4521', user: 'Rahul Sharma', amount: 800, type: 'credit', method: 'UPI', date: '2026-03-18', status: 'completed' },
    { id: 'TXN-8900', booking: 'BK-4520', user: 'Priya Singh', amount: 450, type: 'credit', method: 'Card', date: '2026-03-18', status: 'completed' },
    { id: 'TXN-8899', booking: 'BK-4517', user: 'Karthik M', amount: 350, type: 'refund', method: 'UPI', date: '2026-03-17', status: 'processing' },
    { id: 'TXN-8898', booking: 'BK-4519', user: 'Amit Patel', amount: 600, type: 'credit', method: 'Wallet', date: '2026-03-17', status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '₹18.4L', sub: 'This month', color: 'from-green-500 to-emerald-500' },
          { label: 'Average Booking', value: '₹542', sub: 'Per booking', color: 'from-blue-500 to-cyan-500' },
          { label: 'Pending Refunds', value: '₹12.5K', sub: '8 pending', color: 'from-amber-500 to-orange-500' },
          { label: 'Partner Payouts', value: '₹6.2L', sub: 'Processed', color: 'from-violet-500 to-purple-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Revenue Trend</h3>
        <div className="h-48 bg-gradient-to-r from-primary-50 to-violet-50 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-primary-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Revenue chart visualization</p>
            <p className="text-xs text-slate-300">Integrate with analytics API</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-gray-50 rounded-lg text-slate-600 hover:bg-gray-100"><Download className="w-3 h-3" /> Export</button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Transaction</th>
              <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">User</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Method</th>
              <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Amount</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-gray-50/50 transition">
                <td className="px-5 py-3">
                  <p className="text-sm font-mono text-slate-600">{t.id}</p>
                  <p className="text-[10px] text-slate-400">{t.booking} · {t.date}</p>
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">{t.user}</td>
                <td className="px-5 py-3 text-center text-sm text-slate-500">{t.method}</td>
                <td className={`px-5 py-3 text-right text-sm font-semibold ${t.type === 'refund' ? 'text-red-600' : 'text-green-600'}`}>
                  {t.type === 'refund' ? '-' : '+'}₹{t.amount}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${t.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ============================
// LOCATIONS VIEW
// ============================
function LocationsView() {
  const locations = [
    { id: 'LOC-01', name: 'Mumbai Airport T2', city: 'Mumbai', pods: 45, occupancy: 87, partner: 'MIAL', status: 'active' },
    { id: 'LOC-02', name: 'Delhi Railway Station', city: 'New Delhi', pods: 32, occupancy: 72, partner: 'Indian Railways', status: 'active' },
    { id: 'LOC-03', name: 'Kempegowda Intl Airport', city: 'Bangalore', pods: 28, occupancy: 91, partner: 'BIAL', status: 'active' },
    { id: 'LOC-04', name: 'Chennai Central Station', city: 'Chennai', pods: 20, occupancy: 65, partner: 'Southern Railways', status: 'active' },
    { id: 'LOC-05', name: 'Rajiv Gandhi Intl Airport', city: 'Hyderabad', pods: 15, occupancy: 78, partner: 'GHIAL', status: 'active' },
    { id: 'LOC-06', name: 'Phoenix MarketCity', city: 'Pune', pods: 8, occupancy: 55, partner: 'Phoenix Mills', status: 'setup' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Active Locations</p>
          <p className="text-2xl font-bold text-slate-800">25</p>
          <p className="text-[10px] text-green-600 mt-1">Across 12 cities</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Avg Occupancy</p>
          <p className="text-2xl font-bold text-primary-600">76%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Setting Up</p>
          <p className="text-2xl font-bold text-amber-600">3</p>
          <p className="text-[10px] text-slate-400 mt-1">Expected live: 2 weeks</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">All Locations</h3>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-violet-600 rounded-xl hover:opacity-90 transition">+ Add Location</button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Location</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Pods</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Occupancy</th>
              <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Partner</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {locations.map(l => (
              <tr key={l.id} className="hover:bg-gray-50/50 transition">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-slate-700">{l.name}</p>
                  <p className="text-[10px] text-slate-400">{l.city}</p>
                </td>
                <td className="text-center text-sm text-slate-600">{l.pods}</td>
                <td className="px-5 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${l.occupancy > 80 ? 'bg-green-500' : l.occupancy > 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${l.occupancy}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{l.occupancy}%</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-500">{l.partner}</td>
                <td className="text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${l.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ============================
// PARTNERS VIEW
// ============================
function PartnersView() {
  const partners = [
    { name: 'Mumbai International Airport Ltd', type: 'Venue Partner', locations: 2, pods: 57, revenue: '₹5.4L', since: 'Oct 2025' },
    { name: 'Indian Railways', type: 'Venue Partner', locations: 5, pods: 85, revenue: '₹7.1L', since: 'Nov 2025' },
    { name: 'BIAL Airports', type: 'Venue Partner', locations: 1, pods: 28, revenue: '₹3.8L', since: 'Dec 2025' },
    { name: 'Phoenix Mills Ltd', type: 'Venue Partner', locations: 3, pods: 24, revenue: '₹1.9L', since: 'Feb 2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Active Partners</p>
          <p className="text-2xl font-bold text-slate-800">18</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Total Revenue Share</p>
          <p className="text-2xl font-bold text-green-600">₹6.2L</p>
          <p className="text-[10px] text-slate-400 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Avg Partner Rating</p>
          <p className="text-2xl font-bold text-amber-500">4.6★</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">Partner Directory</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Partner</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Locations</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Pods</th>
              <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Revenue</th>
              <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {partners.map(p => (
              <tr key={p.name} className="hover:bg-gray-50/50 transition">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-slate-700">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.type}</p>
                </td>
                <td className="text-center text-sm text-slate-600">{p.locations}</td>
                <td className="text-center text-sm text-slate-600">{p.pods}</td>
                <td className="text-right text-sm font-semibold text-green-600">{p.revenue}</td>
                <td className="text-right text-sm text-slate-400">{p.since}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ============================
// SMALLER SUB-PAGES
// ============================

function ReportsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Revenue Report', desc: 'Monthly revenue breakdown & trends', icon: IndianRupee, color: 'from-green-500 to-emerald-500' },
          { title: 'Occupancy Report', desc: 'Pod utilization across locations', icon: Building2, color: 'from-blue-500 to-cyan-500' },
          { title: 'User Growth', desc: 'Registrations, retention & activity', icon: Users, color: 'from-violet-500 to-purple-500' },
          { title: 'Bookings Analysis', desc: 'Trends, peak hours & cancellations', icon: Calendar, color: 'from-amber-500 to-orange-500' },
          { title: 'Support Metrics', desc: 'Ticket resolution times & satisfaction', icon: Headphones, color: 'from-pink-500 to-rose-500' },
          { title: 'Partner Performance', desc: 'Partner-wise revenue & ratings', icon: Layers, color: 'from-teal-500 to-cyan-500' },
        ].map(r => (
          <div key={r.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition cursor-pointer group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <r.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{r.title}</h3>
            <p className="text-sm text-slate-400">{r.desc}</p>
            <button className="mt-3 text-xs text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700">
              Generate Report <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsView() {
  const reviews = [
    { user: 'Rahul S.', pod: 'Galaxy Series', location: 'Mumbai T2', rating: 5, comment: 'Amazing experience! Super clean and comfortable pod.', date: '2d ago', status: 'published' },
    { user: 'Priya M.', pod: 'Space Pod', location: 'Delhi Station', rating: 4, comment: 'Good experience, WiFi could be better.', date: '3d ago', status: 'published' },
    { user: 'Vikram K.', pod: 'Comfort Plus', location: 'BLR Airport', rating: 2, comment: 'AC was not working properly. Very disappointing.', date: '4d ago', status: 'flagged' },
    { user: 'Anjali T.', pod: 'Galaxy Series', location: 'Hyderabad Hub', rating: 5, comment: 'Best transit experience ever! Will definitely book again.', date: '5d ago', status: 'published' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg Rating', value: '4.6', sub: '★', color: 'text-amber-500' },
          { label: 'Total Reviews', value: '2,847', sub: '', color: 'text-slate-800' },
          { label: 'This Month', value: '186', sub: '', color: 'text-primary-600' },
          { label: 'Flagged', value: '5', sub: '', color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-amber-400">
                    {Array.from({length: 5}).map((_, j) => (
                      <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${r.status === 'flagged' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{r.status}</span>
                </div>
                <p className="text-sm text-slate-700 mb-2">{r.comment}</p>
                <p className="text-[10px] text-slate-400">{r.user} · {r.pod} · {r.location} · {r.date}</p>
              </div>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition"><MoreHorizontal className="w-4 h-4 text-slate-400" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffView() {
  const staff = [
    { name: 'Arun Mehta', role: 'Operations Manager', location: 'Mumbai', status: 'active', email: 'arun@naploo.com' },
    { name: 'Divya Sharma', role: 'Support Lead', location: 'Delhi', status: 'active', email: 'divya@naploo.com' },
    { name: 'Prasad K', role: 'Maintenance Head', location: 'Bangalore', status: 'active', email: 'prasad@naploo.com' },
    { name: 'Neha Gupta', role: 'Partner Relations', location: 'Pune', status: 'on-leave', email: 'neha@naploo.com' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Total <span className="font-semibold text-slate-700">24</span> staff members</p>
        <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-violet-600 rounded-xl hover:opacity-90 transition flex items-center gap-2"><UserPlus className="w-4 h-4" /> Add Staff</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Staff Member</th>
              <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Role</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Location</th>
              <th className="text-center text-xs font-medium text-slate-400 px-5 py-3">Status</th>
              <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {staff.map(s => (
              <tr key={s.email} className="hover:bg-gray-50/50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center text-primary-600 text-xs font-bold">{s.name.split(' ').map(n=>n[0]).join('')}</div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{s.name}</p>
                      <p className="text-[10px] text-slate-400">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{s.role}</td>
                <td className="text-center text-sm text-slate-500">{s.location}</td>
                <td className="text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${s.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{s.status}</span>
                </td>
                <td className="text-right px-5">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition"><MoreHorizontal className="w-4 h-4 text-slate-400" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarketingView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Campaigns', value: '3', color: 'text-primary-600' },
          { label: 'Total Reach', value: '45.2K', color: 'text-slate-800' },
          { label: 'Conversion Rate', value: '3.8%', color: 'text-green-600' },
          { label: 'Ad Spend (MTD)', value: '₹1.2L', color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { title: 'Summer Pod Sale', status: 'active', reach: '18.5K', conversions: 342, budget: '₹45K' },
          { title: 'Partner Referral Program', status: 'active', reach: '12.3K', conversions: 89, budget: '₹30K' },
          { title: 'App Install Campaign', status: 'active', reach: '14.4K', conversions: 567, budget: '₹45K' },
          { title: 'Diwali Offer', status: 'scheduled', reach: '—', conversions: 0, budget: '₹80K' },
        ].map(c => (
          <div key={c.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">{c.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{c.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-slate-700">{c.reach}</p>
                <p className="text-[10px] text-slate-400">Reach</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700">{c.conversions}</p>
                <p className="text-[10px] text-slate-400">Conversions</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700">{c.budget}</p>
                <p className="text-[10px] text-slate-400">Budget</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Blog Posts', count: 12, icon: BookOpen, desc: 'Published articles', color: 'from-blue-500 to-cyan-500' },
          { title: 'FAQs', count: 24, icon: MessageSquare, desc: 'Help center articles', color: 'from-violet-500 to-purple-500' },
          { title: 'Pages', count: 23, icon: Globe, desc: 'Website pages', color: 'from-green-500 to-emerald-500' },
        ].map(c => (
          <div key={c.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition cursor-pointer group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <c.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{c.title}</h3>
            <p className="text-sm text-slate-400">{c.count} {c.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Blog Posts</h3>
        <div className="space-y-3">
          {[
            { title: 'Why Sleep Pods Are the Future of Transit Stays', status: 'published', date: 'Mar 15, 2026', views: '2.4K' },
            { title: '5 Best Airport Pods for Business Travelers', status: 'published', date: 'Mar 10, 2026', views: '1.8K' },
            { title: 'Naploo Partner Success Stories', status: 'draft', date: 'Mar 18, 2026', views: '—' },
          ].map(post => (
            <div key={post.title} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-700">{post.title}</p>
                <p className="text-[10px] text-slate-400">{post.date} · {post.views} views</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{post.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsView() {
  const notifications = [
    { type: 'ticket', title: 'New urgent ticket: AC not working in Pod #12', time: '30m ago', read: false },
    { type: 'booking', title: 'Booking BK-4521 confirmed by Rahul Sharma', time: '2h ago', read: false },
    { type: 'application', title: 'New partner application from Horizon Hotels', time: '3h ago', read: false },
    { type: 'review', title: 'New 2-star review flagged for moderation', time: '5h ago', read: false },
    { type: 'system', title: 'Pod maintenance scheduled at Delhi Station', time: '1d ago', read: true },
    { type: 'revenue', title: 'Monthly payout of ₹6.2L processed successfully', time: '1d ago', read: true },
    { type: 'system', title: 'Server backup completed successfully', time: '2d ago', read: true },
  ];

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400"><span className="font-semibold text-slate-700">5</span> unread notifications</p>
        <button className="text-xs text-primary-600 font-medium hover:text-primary-700">Mark all as read</button>
      </div>

      {notifications.map((n, i) => (
        <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition ${
          n.read ? 'bg-white border-gray-100' : 'bg-primary-50/50 border-primary-100'
        }`}>
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary-500'}`} />
          <div className="flex-1">
            <p className={`text-sm ${n.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>{n.title}</p>
            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsView() {
  return (
    <div className="max-w-3xl space-y-6">
      {[
        { title: 'General Settings', items: ['Sitename', 'Contact Email', 'Support Phone', 'Business Hours', 'Timezone'] },
        { title: 'Booking Configuration', items: ['Min Booking Duration', 'Max Booking Duration', 'Cancellation Policy', 'Grace Period', 'Auto Checkout'] },
        { title: 'Payment Settings', items: ['Currency', 'Tax Rate (GST)', 'Payment Gateway', 'Auto Refund', 'Wallet Limits'] },
        { title: 'Notification Preferences', items: ['Email Alerts', 'SMS Alerts', 'Push Notifications', 'Ticket Alerts', 'Revenue Reports'] },
      ].map(section => (
        <div key={section.title} className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-slate-800">{section.title}</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {section.items.map(item => (
              <div key={item} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition">
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
