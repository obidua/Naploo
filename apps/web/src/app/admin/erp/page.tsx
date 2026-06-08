'use client';

// Admin ERP rollup — cross-partner P&L overview.
// Lives at /admin/erp
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, TrendingUp, IndianRupee, Building2, Users, Wallet, FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';

type Totals = {
  revenue?: string | number;
  collected?: string | number;
  expenses?: string | number;
  payroll?: string | number;
  active_employees?: string | number;
  hq_employees?: string | number;
  active_partners?: string | number;
};
type PartnerRow = {
  partner_id: string; business_name: string; city?: string; partner_status: string;
  revenue: string; collected: string; expenses: string; payroll: string; employees: string; net: string;
};
type GroupRow = { group_name: string; total: string };

const inr = (n: any) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function AdminErpPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [totals, setTotals] = useState<Totals>({});
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await api.get<{ totals: Totals; partners: PartnerRow[]; expensesByGroup: GroupRow[] }>(
      `/api/v1/admin/erp/rollup?from=${from}&to=${to}`,
    );
    setLoading(false);
    if (r.data) {
      setTotals(r.data.totals || {});
      setPartners(r.data.partners || []);
      setGroups(r.data.expensesByGroup || []);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [from, to]);

  const net = useMemo(() => Number(totals.revenue || 0) - Number(totals.expenses || 0) - Number(totals.payroll || 0), [totals]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 pt-24 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" /> ERP rollup
          </h1>
          <p className="text-sm text-slate-500">Cross-partner P&amp;L. Revenue, expenses, payroll and net per property.</p>
        </div>
        <div className="flex gap-2 items-center text-sm">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5" />
          <span className="text-slate-400">→</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5" />
          <Link href="/admin/erp/hq-employees" className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-sm">
            HQ employees <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/admin/erp/hq-expenses" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm">
            HQ expenses <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi label="Revenue" value={inr(totals.revenue)} sub={`Collected ${inr(totals.collected)}`} icon={<TrendingUp className="w-4 h-4 text-emerald-600" />} />
        <Kpi label="Expenses" value={inr(totals.expenses)} sub="All partners + HQ" icon={<IndianRupee className="w-4 h-4 text-rose-500" />} />
        <Kpi label="Payroll paid" value={inr(totals.payroll)} sub={`${totals.active_employees ?? 0} active staff`} icon={<Wallet className="w-4 h-4 text-violet-600" />} />
        <Kpi label="Net P&L" value={inr(net)} sub={net >= 0 ? 'Profit' : 'Loss'} accent={net >= 0 ? 'emerald' : 'rose'} icon={<Building2 className="w-4 h-4 text-slate-600" />} />
      </section>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Per-partner P&amp;L</h2>
            <span className="text-xs text-slate-500">{partners.length} partners</span>
          </div>
          {loading ? <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div> :
           partners.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No data for this range.</div> :
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr className="text-left">
                  <th className="px-4 py-2.5">Property</th>
                  <th className="px-3 py-2.5 text-right">Revenue</th>
                  <th className="px-3 py-2.5 text-right">Collected</th>
                  <th className="px-3 py-2.5 text-right">Expenses</th>
                  <th className="px-3 py-2.5 text-right">Payroll</th>
                  <th className="px-3 py-2.5 text-right">Staff</th>
                  <th className="px-3 py-2.5 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {partners.map((p) => {
                  const n = Number(p.net || 0);
                  return (
                    <tr key={p.partner_id}>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-slate-900">{p.business_name || '—'}</div>
                        <div className="text-xs text-slate-500">{p.city || '—'} · {p.partner_status}</div>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{inr(p.revenue)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{inr(p.collected)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{inr(p.expenses)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{inr(p.payroll)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{p.employees || 0}</td>
                      <td className={`px-3 py-2.5 text-right tabular-nums font-semibold ${n >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{inr(n)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          }
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-slate-800">Expenses by group</h2>
            <p className="text-xs text-slate-500">Cost-centre breakdown (CoGS / OpEx / CapEx / finance)</p>
          </div>
          {groups.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No expenses.</div> :
            <ul className="divide-y divide-gray-100">
              {groups.map((g) => {
                const total = groups.reduce((s, x) => s + Number(x.total), 0);
                const pct = total > 0 ? Math.round(Number(g.total) / total * 100) : 0;
                return (
                  <li key={g.group_name} className="px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 capitalize">{g.group_name}</span>
                      <span className="tabular-nums text-slate-900">{inr(g.total)}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          }
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 text-sm flex items-center justify-between text-slate-600">
        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {totals.active_employees ?? 0} total active employees · {totals.hq_employees ?? 0} at HQ · {totals.active_partners ?? 0} active partners</div>
        <Link href="/admin/erp/hq-employees" className="text-emerald-700 font-semibold">Manage HQ team →</Link>
      </div>
    </main>
  );
}

function Kpi({ label, value, sub, icon, accent }: { label: string; value: string; sub?: string; icon?: React.ReactNode; accent?: 'emerald' | 'rose' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-semibold">{icon}{label}</div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${accent === 'rose' ? 'text-rose-600' : accent === 'emerald' ? 'text-emerald-700' : 'text-slate-900'}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}
