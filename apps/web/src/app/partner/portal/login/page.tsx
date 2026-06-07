'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Lock, Mail, ArrowRight, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';

export default function PartnerLoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // If already logged in with partner-level access, jump straight to the dashboard.
  // If logged in but as a different role (customer/investor), show a "use different account" UI.
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role || 'customer';
      if (['partner', 'admin', 'super_admin'].includes(role)) {
        router.replace('/partner/portal');
        return;
      }
    }
    setChecked(true);
  }, [isAuthenticated, user, router]);

  if (!checked) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center pt-24">
        <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
      </main>
    );
  }

  // Logged-in as customer/investor/other — offer to switch account
  if (isAuthenticated && user && !['partner', 'admin', 'super_admin'].includes(user.role || 'customer')) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Partner Portal</h1>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>This account ({user.role}) does not have partner access.</span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Sign out and use your partner email/password, or apply to list your property.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => logout()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 text-slate-700 font-medium"
              >
                <LogOut className="w-4 h-4" /> Sign out + use partner account
              </button>
              <Link
                href="/partner"
                className="block w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold"
              >
                Apply to list your property
              </Link>
              <Link href="/" className="block text-center text-sm text-primary-600 hover:underline mt-2">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await authApi.login(email.trim(), password);
    setLoading(false);
    if (res.error || !res.data?.success) {
      setError('Invalid email or password.');
      return;
    }
    const { user, accessToken, refreshToken } = res.data;
    if (!['partner', 'admin', 'super_admin'].includes(user.role)) {
      setError('Your account does not have partner access.');
      return;
    }
    const store = useAuthStore.getState();
    store.setTokens(accessToken, refreshToken);
    store.setUser(user as any);
    router.push('/partner/portal');
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Partner Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your hotel listings, pricing & bookings</p>
        </div>

        <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5 shadow-sm">
          {error && (
            <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="you@hotel.com"
                required
              />
            </div>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Password</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
                required
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold shadow-md disabled:opacity-60"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
          </button>
          <p className="text-center text-xs text-slate-500">
            Not yet a partner? <Link href="/partner" className="text-primary-600 hover:underline">Apply to list your property</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
