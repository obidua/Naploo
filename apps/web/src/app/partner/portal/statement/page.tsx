'use client';

import { useEffect, useState } from 'react';
import { Loader2, BookOpen, Lock, Calendar as CalIcon, IndianRupee, Banknote, BookCheck, ArrowUpRight, ArrowDownRight, Printer } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { erpApi, fmtINR, type DailyStatement } from '../_lib/erp-api';
import { cn } from '@/lib/utils';

export default function StatementPage() { return <PortalShell><Body /></PortalShell>; }

function Body() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [stmt, setStmt] = useState<DailyStatement | null>(null);
  const [closed, setClosed] = useState(false);
  const [history, setHistory] = useState<DailyStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState('');

  async function load() {
    setLoading(true);
    const [sr, hr] = await Promise.all([erpApi.getDailyStatement(date), erpApi.getStatementHistory(14)]);
    if (sr.data?.statement) { setStmt(sr.data.statement); setClosed(!!sr.data.closed); }
    if (hr.data?.history) setHistory(hr.data.history);
    setLoading(false);
  }
  useEffect(() => { load(); }, [date]);

  async function closeDay() {
    if (!stmt) return;
    if (!confirm(`Close ${date}'s books? This locks the totals.`)) return;
    setBusy(true);
    await erpApi.closeDailyStatement(stmt, notes);
    setBusy(false);
    load();
  }

  if (loading || !stmt) return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><BookCheck className="w-5 h-5 text-primary-600" /> Daily statement</h1>
          <p className="text-sm text-slate-500">{closed ? '🔒 Closed (locked)' : 'Live numbers'} · {date}</p>
        </div>
        <div className="flex items-center gap-2">
          <CalIcon className="w-4 h-4 text-slate-500" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={today} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          {!closed && (
            <button onClick={closeDay} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold disabled:opacity-60">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Close day
            </button>
          )}
          <button onClick={() => window.print()} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-slate-600"><Printer className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <Kpi label="Total revenue" value={fmtINR(stmt.total_revenue)} color="from-blue-500 to-cyan-500" icon={<ArrowUpRight className="w-5 h-5" />} />
        <Kpi label="Total collected" value={fmtINR(stmt.total_collected)} color="from-emerald-500 to-teal-500" icon={<Banknote className="w-5 h-5" />} />
        <Kpi label="Total expenses" value={fmtINR(stmt.total_expenses)} color="from-amber-500 to-orange-500" icon={<ArrowDownRight className="w-5 h-5" />} />
        <Kpi label="Net profit" value={fmtINR(stmt.net_profit)} color={stmt.net_profit >= 0 ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-pink-500'} icon={<IndianRupee className="w-5 h-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Revenue breakdown">
          <Row label="Rooms" value={fmtINR(stmt.room_revenue)} />
          <Row label="Pods" value={fmtINR(stmt.pod_revenue)} />
          <Row label="F&B" value={fmtINR(stmt.fnb_revenue)} />
          <Row label="Services" value={fmtINR(stmt.services_revenue)} />
          <Row label="Other" value={fmtINR(stmt.other_revenue)} />
          <Row label="Total" value={fmtINR(stmt.total_revenue)} bold />
        </Card>

        <Card title="Collections (by mode)">
          <Row label="Cash" value={fmtINR(stmt.cash_collected)} />
          <Row label="Card" value={fmtINR(stmt.card_collected)} />
          <Row label="UPI" value={fmtINR(stmt.upi_collected)} />
          <Row label="Bank transfer" value={fmtINR(stmt.bank_collected)} />
          <Row label="Total collected" value={fmtINR(stmt.total_collected)} bold />
        </Card>

        <Card title="Bookings & occupancy">
          <Row label="Bookings today" value={String(stmt.bookings_total)} />
          <Row label="Arrivals" value={String(stmt.arrivals)} />
          <Row label="Departures" value={String(stmt.departures)} />
          <Row label="Cancellations" value={String(stmt.cancellations)} />
          <Row label="Rooms inventory" value={String(stmt.rooms_total)} />
          <Row label="Pods inventory" value={String(stmt.pods_total)} />
        </Card>

        <Card title="Cash flow">
          <Row label="Cash collected" value={fmtINR(stmt.cash_collected)} positive />
          <Row label="Cash paid (expenses)" value={`- ${fmtINR(stmt.cash_paid)}`} negative />
          <Row label="Cash in hand (estimate)" value={fmtINR(stmt.cash_collected - stmt.cash_paid)} bold />
        </Card>
      </div>

      {!closed && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Day notes (optional)</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anything unusual today?" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100"><h3 className="text-sm font-semibold text-slate-900">Last 14 days</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left"><th className="px-4 py-2">Date</th><th className="px-4 py-2 text-right">Revenue</th><th className="px-4 py-2 text-right">Expenses</th><th className="px-4 py-2 text-right">Net</th><th className="px-4 py-2">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((h) => (
                <tr key={h.statement_date} onClick={() => setDate(h.statement_date)} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-2 text-slate-700">{h.statement_date}</td>
                  <td className="px-4 py-2 text-right">{fmtINR(h.total_revenue)}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{fmtINR(h.total_expenses)}</td>
                  <td className={cn('px-4 py-2 text-right font-semibold', Number(h.net_profit) >= 0 ? 'text-emerald-700' : 'text-red-700')}>{fmtINR(h.net_profit)}</td>
                  <td className="px-4 py-2"><span className={cn('text-[10px] uppercase font-bold px-2 py-0.5 rounded', h.closed_at ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{h.closed_at ? 'Closed' : 'Open'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-2`}>{icon}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
      <div className="text-xl font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100"><h3 className="text-sm font-semibold text-slate-900">{title}</h3></div>
      <div className="p-5 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, bold, positive, negative }: { label: string; value: string; bold?: boolean; positive?: boolean; negative?: boolean }) {
  return (
    <div className={cn('flex justify-between items-center', bold && 'pt-2 border-t border-gray-100 font-bold')}>
      <span className="text-slate-600">{label}</span>
      <span className={cn(positive && 'text-emerald-700', negative && 'text-red-700', bold && 'text-slate-900 text-base')}>{value}</span>
    </div>
  );
}
