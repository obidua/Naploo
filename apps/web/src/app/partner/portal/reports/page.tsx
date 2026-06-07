'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, TrendingUp, Building2, Receipt, ChevronRight, BarChart3 } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApiExt } from '../_lib/pms-api-ext';
import { formatMoney } from '../_lib/pms-api';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [revenue, setRevenue] = useState<any>(null);
  const [occupancy, setOccupancy] = useState<any>(null);
  const [tax, setTax] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      pmsApiExt.revenueReport(days),
      pmsApiExt.occupancyReport(),
      pmsApiExt.taxReport(),
    ]).then(([r, o, t]) => {
      if (!active) return;
      if (r.data) setRevenue(r.data);
      if (o.data) setOccupancy(o.data);
      if (t.data) setTax(t.data);
      setLoading(false);
    }).catch((e) => {
      setError(e?.message || 'Failed to load reports');
      setLoading(false);
    });
    return () => { active = false; };
  }, [days]);

  if (loading && !revenue) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;
  }
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Revenue, occupancy, tax filing helper.</p>
        </div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={180}>Last 180 days</option>
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total revenue" value={formatMoney(revenue?.totalRevenue || 0)} icon={<TrendingUp className="w-5 h-5" />} color="from-emerald-500 to-teal-500" />
        <Kpi label="Your share" value={formatMoney(revenue?.totalShare || 0)} icon={<TrendingUp className="w-5 h-5" />} color="from-violet-500 to-purple-500" />
        <Kpi label="Bookings" value={String(revenue?.totalBookings || 0)} icon={<BarChart3 className="w-5 h-5" />} color="from-blue-500 to-cyan-500" />
        <Kpi label="Avg occupancy 30d" value={`${occupancy?.avgOccupancy30d || 0}%`} icon={<Building2 className="w-5 h-5" />} color="from-amber-500 to-orange-500" />
      </div>

      {/* Revenue bar chart (simple CSS bars) */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Daily revenue (last {days} days)</h2>
        {revenue?.series?.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No revenue data yet.</p>
        ) : (
          <Chart series={revenue?.series || []} valueKey="revenue" color="#7c3aed" />
        )}
      </section>

      {/* Occupancy chart */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Occupancy rate (last 30 days)</h2>
        <Chart series={(occupancy?.series || []).map((s: any) => ({ day: s.day, value: s.rate }))} valueKey="value" color="#10b981" suffix="%" maxValue={100} />
      </section>

      {/* Tax report */}
      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary-600" /> Tax report
          </h2>
          <div className="text-xs text-slate-500">
            Total tax collected: <b className="text-slate-900">{formatMoney(tax?.totalTax || 0)}</b>
          </div>
        </div>
        {tax?.months?.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No invoices issued yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-5 py-2 font-semibold">Month</th>
                <th className="px-5 py-2 font-semibold text-right">Invoices</th>
                <th className="px-5 py-2 font-semibold text-right">Gross</th>
                <th className="px-5 py-2 font-semibold text-right">Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(tax?.months || []).map((m: any) => (
                <tr key={m.month}>
                  <td className="px-5 py-2.5 font-medium text-slate-800">{m.month}</td>
                  <td className="px-5 py-2.5 text-right">{m.count}</td>
                  <td className="px-5 py-2.5 text-right">{formatMoney(m.gross)}</td>
                  <td className="px-5 py-2.5 text-right text-emerald-700">{formatMoney(m.tax)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <Link href="/partner/portal/bookings" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
        View all bookings <ChevronRight className="w-4 h-4" />
      </Link>
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

function Chart({ series, valueKey, color, suffix = '', maxValue }: { series: any[]; valueKey: string; color: string; suffix?: string; maxValue?: number }) {
  if (!series || series.length === 0) return <p className="text-sm text-slate-500">No data.</p>;
  const max = maxValue || Math.max(...series.map((s) => Number(s[valueKey]) || 0), 1);
  return (
    <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
      {series.map((s, i) => {
        const v = Number(s[valueKey]) || 0;
        const heightPct = Math.max(2, Math.round((v / max) * 100));
        return (
          <div key={i} className="flex-1 min-w-[18px] flex flex-col items-center group relative">
            <div className="absolute -top-7 hidden group-hover:block bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
              {s.day}: {v}{suffix}
            </div>
            <div className="w-full rounded-t" style={{ height: `${heightPct}%`, backgroundColor: color }} />
            <div className="text-[9px] text-slate-400 mt-1 truncate w-full text-center">{s.day.slice(5)}</div>
          </div>
        );
      })}
    </div>
  );
}
