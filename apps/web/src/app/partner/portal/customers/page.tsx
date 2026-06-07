'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Mail, Phone, Award, TrendingUp } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { pmsQloApi, type CustomerSummary } from '../_lib/pms-api-qlo';
import { formatMoney } from '../_lib/pms-api';

export default function CustomersPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const r = await pmsQloApi.listCustomers();
      setLoading(false);
      if (r.data?.customers) setCustomers(r.data.customers);
    })();
  }, []);

  const filtered = customers.filter((c) => {
    if (!q) return true;
    const blob = `${c.name} ${c.email ?? ''} ${c.phone ?? ''}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  });

  const stats = {
    total: customers.length,
    repeat: customers.filter((c) => c.booking_count > 1).length,
    revenue: customers.reduce((s, c) => s + Number(c.lifetime_spend), 0),
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500">Guests who have booked at your property — sorted by repeat count.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Unique guests" value={stats.total} icon={<Users className="w-5 h-5" />} />
        <Kpi label="Repeat guests" value={stats.repeat} icon={<Award className="w-5 h-5" />} />
        <Kpi label="Lifetime revenue" value={formatMoney(stats.revenue)} icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, email, or phone…"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No customers found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">Bookings</th>
                <th className="px-4 py-3 text-right">Spend</th>
                <th className="px-4 py-3">Last visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.user_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{c.email}</div>}
                    {c.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{c.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={c.booking_count > 1 ? 'inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold' : 'text-slate-600'}>
                      {c.booking_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(c.lifetime_spend)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(c.last_visit).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white mb-2">{icon}</div>
      <div className="text-[11px] uppercase text-slate-500 tracking-wide font-semibold">{label}</div>
      <div className="text-xl font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}
