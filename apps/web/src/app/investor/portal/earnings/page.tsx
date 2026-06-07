'use client';

import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, Calendar } from 'lucide-react';
import InvestorShell, { ErrorBanner } from '../_lib/InvestorShell';
import { investorApi, formatMoney, type Investment } from '../_lib/api';

interface Earning {
  id: string;
  bookingId: string;
  grossAmount: string;
  investorShare: string;
  partnerShare: string;
  naplooShare: string;
  earnedAt: string;
}

export default function InvestorEarningsPage() {
  return (
    <InvestorShell>
      <Body />
    </InvestorShell>
  );
}

function Body() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [earnings, setEarnings] = useState<Record<string, Earning[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const me = await investorApi.me();
      if (!me.data) { setError(me.error || 'Failed'); setLoading(false); return; }
      const invs = me.data.investments || [];
      setInvestments(invs);
      const map: Record<string, Earning[]> = {};
      for (const inv of invs) {
        const r = await investorApi.earningsFor(inv.id);
        if (r.data?.earnings) map[inv.id] = r.data.earnings as Earning[];
      }
      setEarnings(map);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div>;
  if (error) return <ErrorBanner message={error} />;

  const all = investments.flatMap((inv) => (earnings[inv.id] || []).map((e) => ({ ...e, inv })));
  all.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
  const totalEarned = all.reduce((s, e) => s + Number(e.investorShare), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Earnings history</h1>
        <p className="text-sm text-slate-500">Every booking that paid you a share. Updated in real-time as bookings complete.</p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5">
        <div className="text-xs uppercase tracking-wide text-white/80">Lifetime earnings</div>
        <div className="text-3xl font-bold mt-1">{formatMoney(totalEarned)}</div>
        <div className="text-xs text-white/80 mt-1">{all.length} payouts across {investments.length} investment{investments.length === 1 ? '' : 's'}</div>
      </div>

      {all.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No earnings yet. You'll see them here once bookings start paying out.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Investment</th>
                <th className="px-4 py-3 text-right">Gross</th>
                <th className="px-4 py-3 text-right">Your share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {all.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-slate-400" />{new Date(e.earnedAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{e.inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatMoney(e.grossAmount)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">+{formatMoney(e.investorShare)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
