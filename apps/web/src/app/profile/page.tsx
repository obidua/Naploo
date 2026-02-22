'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  User, Calendar, CreditCard, Settings, LogOut, 
  MapPin, ChevronRight, Edit2, Phone, Mail,
  Wallet, Gift, Bell, Shield, HelpCircle
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

// Sample booking data
const recentBookings = [
  {
    id: 'BK001',
    podName: 'Space Series Pod',
    location: 'Mumbai Airport T2',
    date: '2026-01-24',
    time: '14:00 - 18:00',
    hours: 4,
    amount: 600,
    status: 'completed',
  },
  {
    id: 'BK002',
    podName: 'Galaxy Series Pod',
    location: 'Delhi Railway Station',
    date: '2026-01-20',
    time: '10:00 - 14:00',
    hours: 4,
    amount: 800,
    status: 'completed',
  },
];

// Quick actions
const quickActions = [
  { icon: Calendar, label: 'Bookings', href: '/profile', color: 'from-blue-500 to-cyan-500' },
  { icon: Wallet, label: 'Wallet', href: '/profile', color: 'from-green-500 to-emerald-500' },
  { icon: Gift, label: 'Rewards', href: '/profile', color: 'from-amber-500 to-orange-500' },
  { icon: Bell, label: 'Alerts', href: '/profile', color: 'from-purple-500 to-pink-500' },
];

// Menu items
const menuItems = [
  { icon: User, label: 'Personal Information', href: '/profile' },
  { icon: Shield, label: 'Security & Privacy', href: '/profile' },
  { icon: CreditCard, label: 'Payment Methods', href: '/profile' },
  { icon: MapPin, label: 'Saved Addresses', href: '/profile' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help' },
  { icon: Settings, label: 'App Settings', href: '/profile' },
];

export default function ProfilePage() {
  const { user, token, refreshToken, logout, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      setLoading(false);
      return;
    }
    // Fetch fresh profile from API
    authApi.getMe().then(res => {
      if (res.data?.user) {
        const u = res.data.user;
        setUser({
          id: u.id,
          phone: u.phone,
          firstName: u.firstName || undefined,
          lastName: u.lastName || undefined,
          email: u.email || undefined,
          avatar: u.avatar || undefined,
          role: u.role,
          status: u.status,
          city: u.city || undefined,
          state: u.state || undefined,
          phoneVerified: u.phoneVerified,
          emailVerified: u.emailVerified,
          createdAt: u.createdAt,
        });
      }
    }).catch(() => {
      // Token might be expired, try to stay on page with cached data
    }).finally(() => setLoading(false));
  }, [router, user, token, setUser]);

  const handleLogout = async () => {
    try {
      await authApi.logout(refreshToken || undefined);
    } catch {
      // ignore
    }
    logout();
    router.push('/');
  };

  const getInitials = (firstName?: string, lastName?: string, phone?: string) => {
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) {
      return firstName.slice(0, 2).toUpperCase();
    }
    return phone?.slice(-2) || 'U';
  };

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User' : 'User';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20 pb-24 sm:pb-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6">
        {/* Profile Header */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-glow">
                {getInitials(user?.firstName, user?.lastName, user?.phone)}
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-800">{displayName}</h1>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1 text-slate-500">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{user?.phone}</span>
                </div>
                {user?.email && (
                  <div className="flex items-center gap-2 mt-0.5 sm:mt-1 text-slate-500">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-full">{user.email}</span>
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/profile"
              className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg sm:rounded-xl transition-colors"
            >
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold gradient-text">2</p>
              <p className="text-[10px] sm:text-xs text-slate-400">Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold gradient-text">8</p>
              <p className="text-[10px] sm:text-xs text-slate-400">Hours</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold gradient-text">₹0</p>
              <p className="text-[10px] sm:text-xs text-slate-400">Wallet</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center hover:border-gray-300 transition-all group shadow-sm"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-lg sm:rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600">{action.label}</p>
            </Link>
          ))}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-lg font-semibold text-slate-800">Recent Bookings</h2>
            <Link href="/profile" className="text-xs sm:text-sm text-primary-600 hover:text-primary-500">
              View All
            </Link>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden relative flex-shrink-0 bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-slate-800 truncate">{booking.podName}</p>
                  <p className="text-xs sm:text-sm text-slate-400 truncate">{booking.location}</p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
                    <span className="text-[10px] sm:text-xs text-slate-400">{booking.date}</span>
                    <span className="text-[10px] sm:text-xs text-slate-400">{booking.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm sm:text-base font-semibold text-slate-800">₹{booking.amount}</p>
                  <span className="inline-block px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] bg-emerald-50 text-emerald-600 rounded-full">
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 shadow-sm">
          {menuItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <span className="flex-1 text-sm sm:text-base text-slate-700">{item.label}</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-red-50 border border-red-200 rounded-xl text-red-600 hover:bg-red-100 transition-colors text-sm sm:text-base"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Logout</span>
        </button>

        {/* App Version */}
        <p className="text-center text-slate-400 text-[10px] sm:text-xs mt-4 sm:mt-6">
          Naploo v1.0.0 • Made with ❤️ in India
        </p>
      </div>
    </div>
  );
}
