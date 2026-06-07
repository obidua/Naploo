'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, TrendingUp, Package, Wallet, IndianRupee, AlertCircle, CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import InvestorShell, { ErrorBanner } from './_lib/InvestorShell';
import { investorApi, formatMoney, type Investor, type Investment } from './_lib/api';
import { cn } from '@/lib/utils';

export default function InvestorDashboardPage() {
  return (
    <InvestorShell>
      <Body />
    </InvestorShell>
  );
}

function Body() {
  const [data, setData] = useState<{ enrolled: boolean; investor: Investor | null; investments: Investment[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  async function load() {
    setLoading(true);
    const res = await investorApi.me();
    setLoading(false);
    if (!res.data) {
      setError(res.error || 'Failed to load');
      return;
    }
    setData({ enrolled: res.data.enrolled, investor: res.data.investor, investments: res.data.investments || [] });
  }

  useEffect(() => { load(); }, []);

  async function enroll() {
    setEnrolling(true);
    await investorApi.enroll();
    setEnrolling(false);
    await load();
  }

  if (loading && !data) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div>;
  }
  if (error || !data) return <ErrorBanner message={error || 'No data'} />;

  // Not enrolled — show enroll CTA
  if (!data.enrolled || !data.investor) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-8 shadow-lg">
          <TrendingUp className="w-10 h-10 mb-3" />
          <h1 className="text-2xl font-bold">Become a Naploo Investor</h1>
          <p className="text-white/90 mt-2 text-sm">
            Buy sleeping pod sets at partner hotels. Earn 35-60% per booking. Naploo guarantees 3× return in 3 years.
          </p>
          <button
            onClick={enroll}
            disabled={enrolling}
            className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-700 font-semibold shadow disabled:opacity-60"
          >
            {enrolling ? <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling…</> : <>Enroll as investor <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <InfoCard icon="💼" title="₹5L/set" desc="Minimum investment (2 pods per set + GST)" />
          <InfoCard icon="📈" title="3× guaranteed" desc="Naploo guarantees 3× return within 3 years" />
          <InfoCard icon="🏨" title="Leaseback or doorstep" desc="Get pods installed at partner hotels or delivered to you" />
        </div>
      </div>
    );
  }

  const { investor, investments } = data;
  const totalGuarantee = investments.reduce((s, i) => s + Number(i.guaranteeAmount), 0);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Investor Dashboard</h1>
            <p className="text-white/80 text-sm mt-1">
              Status: <span className="font-semibold uppercase">{investor.status.replace('_', ' ')}</span>
              {investor.status === 'pending' && ' — awaiting admin verification'}
              {investor.status === 'kyc_pending' && ' — submit KYC to start investing'}
            </p>
          </div>
          {(investor.status === 'pending' || investor.status === 'kyc_pending') && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md">Action needed</span>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total invested" value={formatMoney(investor.totalInvested)} icon={<IndianRupee className="w-5 h-5" />} color="from-blue-500 to-cyan-500" />
        <Kpi label="Total earned" value={formatMoney(investor.totalEarned)} icon={<TrendingUp className="w-5 h-5" />} color="from-emerald-500 to-teal-500" />
        <Kpi label="Pod sets owned" value={String(investor.totalPodSets || 0)} icon={<Package className="w-5 h-5" />} color="from-violet-500 to-purple-500" />
        <Kpi label="3× guarantee" value={formatMoney(totalGuarantee)} icon={<Wallet className="w-5 h-5" />} color="from-amber-500 to-orange-500" />
      </div>

      {/* Active investments */}
      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Active investments</h2>
          {['approved', 'active'].includes(investor.status) && (
            <Link href="/investor/portal/investments" className="text-xs text-emerald-700 hover:underline">View all →</Link>
          )}
        </div>
        {investments.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-3">No investments yet.</p>
            {investor.status === 'approved' || investor.status === 'active' ? (
              <Link href="/investor/portal/investments" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold">
                <Plus className="w-4 h-4" /> Make first investment
              </Link>
            ) : (
              <p className="text-xs text-slate-400">Once your account is approved, you can claim pod sets here.</p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {investments.slice(0, 5).map((inv) => {
              const earned = Number(inv.earnedSoFar);
              const guarantee = Number(inv.guaranteeAmount);
              const progress = Math.min(100, Math.round((earned / guarantee) * 100));
              return (
                <li key={inv.id} className="px-5 py-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-xs text-slate-500">
                        {inv.podSetCount} pod set{inv.podSetCount > 1 ? 's' : ''} · {inv.deliveryOption}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{formatMoney(inv.totalAmount)}</div>
                      <div className="text-xs text-emerald-700">{formatMoney(earned)} earned</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn('h-full bg-gradient-to-r', inv.guaranteeReached ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-cyan-500')} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] mt-1 text-slate-500">
                      <span>{progress}% of 3× guarantee</span>
                      <span>{formatMoney(guarantee)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-2`}>{icon}</div>
      <div className="text-[11px] uppercase text-slate-500 tracking-wide font-semibold">{label}</div>
      <div className="text-xl font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="text-3xl mb-1">{icon}</div>
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
  );
}
