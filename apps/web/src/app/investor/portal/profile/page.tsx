'use client';

import { useEffect, useState } from 'react';
import { Loader2, User, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import InvestorShell, { ErrorBanner } from '../_lib/InvestorShell';
import { investorApi, type Investor } from '../_lib/api';
import { useAuthStore } from '@/store/auth';

export default function InvestorProfilePage() {
  return (
    <InvestorShell>
      <Body />
    </InvestorShell>
  );
}

function Body() {
  const { user } = useAuthStore();
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await investorApi.me();
      setLoading(false);
      if (!res.data) { setError(res.error || 'Failed'); return; }
      setInvestor(res.data.investor);
    })();
  }, []);

  if (loading) return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div>;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Profile & KYC</h1>
        <p className="text-sm text-slate-500">Your account info + KYC submission status.</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Account</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <Field label="Name" value={[user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—'} />
          <Field label="Phone" value={user?.phone || '—'} />
          <Field label="Email" value={user?.email || '—'} />
          <Field label="Role" value={user?.role || '—'} />
        </dl>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> KYC status</h2>
        {!investor ? (
          <div className="text-sm text-slate-500">Enroll as an investor from the Dashboard to begin KYC.</div>
        ) : (
          <KycStatus status={investor.status} />
        )}
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          KYC verification (PAN + Aadhaar + bank account) is currently handled manually by our investor relations team. Please email <a href="mailto:investors@naploo.com" className="underline">investors@naploo.com</a> with your documents OR call <a href="tel:+918448445554" className="underline">+91 84484 45554</a>.
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</dt>
      <dd className="text-slate-900 font-medium mt-0.5">{value}</dd>
    </div>
  );
}

function KycStatus({ status }: { status: Investor['status'] }) {
  const map = {
    pending: { icon: AlertCircle, color: 'amber', text: 'Enrollment received. Awaiting team contact for KYC.' },
    kyc_pending: { icon: AlertCircle, color: 'amber', text: 'Submit your KYC documents to begin investing.' },
    approved: { icon: CheckCircle2, color: 'emerald', text: 'KYC approved. You can claim pod sets anytime.' },
    active: { icon: CheckCircle2, color: 'emerald', text: 'Active investor with one or more pod sets.' },
    suspended: { icon: AlertCircle, color: 'red', text: 'Account temporarily suspended. Contact support.' },
    blocked: { icon: AlertCircle, color: 'red', text: 'Account blocked. Contact support.' },
  } as const;
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl bg-${cfg.color}-50 border border-${cfg.color}-200`}>
      <Icon className={`w-5 h-5 text-${cfg.color}-700 flex-shrink-0`} />
      <div>
        <div className="font-semibold text-slate-900 uppercase text-xs tracking-wide">{status.replace('_', ' ')}</div>
        <div className="text-sm text-slate-700">{cfg.text}</div>
      </div>
    </div>
  );
}
