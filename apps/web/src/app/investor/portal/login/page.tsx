'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Phone, ArrowRight, AlertCircle, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';

export default function InvestorLoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace('/investor/portal');
      return;
    }
    setChecked(true);
  }, [isAuthenticated, user, router]);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (phone.trim().length < 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    const res = await authApi.sendOtp(phone.trim());
    setLoading(false);
    if (res.error || !res.data?.success) {
      setError('Could not send OTP. Try again.');
      return;
    }
    setStep('otp');
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (otp.trim().length < 4) { setError('Enter the OTP.'); return; }
    setLoading(true);
    const res = await authApi.verifyOtp(phone.trim(), otp.trim());
    setLoading(false);
    if (res.error || !res.data?.success) {
      setError('Invalid OTP. Try again.');
      return;
    }
    const { user, accessToken, refreshToken } = res.data;
    const store = useAuthStore.getState();
    store.setTokens(accessToken, refreshToken);
    store.setUser(user as any);
    router.push('/investor/portal');
  }

  if (!checked) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center pt-24">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Investor Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Track your pod investments + earnings + payouts</p>
        </div>

        {step === 'phone' && (
          <form onSubmit={sendOtp} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5 shadow-sm">
            {error && (
              <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <label className="block">
              <span className="block text-xs font-medium text-slate-600 mb-1.5">Mobile number</span>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="98765 43210"
                  required
                />
              </div>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md disabled:opacity-60"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-center text-xs text-slate-500">
              New here? <Link href="/investor" className="text-emerald-700 hover:underline">Learn about pod investments</Link>
            </p>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verifyOtp} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5 shadow-sm">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-3 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>OTP sent to <b>+91 {phone}</b>. Enter the 6-digit code.</span>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <label className="block">
              <span className="block text-xs font-medium text-slate-600 mb-1.5">OTP</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••"
                required
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md disabled:opacity-60"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : <>Verify & sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              className="w-full text-sm text-slate-500 hover:text-slate-700"
            >
              Change phone number
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
