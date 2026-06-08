'use client';

import { useEffect, useState } from 'react';
import { Loader2, Calculator, FileText } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { erpApi, fmtINR, type LedgerEntry } from '../_lib/erp-api';
import { cn } from '@/lib/utils';

export default function AccountingPage() { return <PortalShell><Body /></PortalShell>; }

function Body() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [pnl, setPnl] = useState<{ type: string; net: string }[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await erpApi.getLedger(from, to);
    setLoading(false);
    if (r.data?.entries) setEntries(r.data.entries);
    if (r.data?.pnl) setPnl(r.data.pnl);
  }
  useEffect(() => { load(); }, [from, to]);

  const income = Number(pnl.find(p => p.type === 'income')?.net || 0);
  const expense = -Number(pnl.find(p => p.type === 'expense')?.net || 0);
  const net = income - expense;
  const assets = Number(pnl.find(p => p.type === 'asset')?.net || 0);
  const liabilities = Number(pnl.find(p => p.type === 'liability')?.net || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Calculator className="w-5 h-5 text-primary-600" /> Accounting</h1>
          <p className="text-sm text-slate-500">General ledger + P&L summary</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <span className="text-slate-400">→</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Income" value={fmtINR(income)} color="text-emerald-700" />
        <Kpi label="Expense" value={fmtINR(expense)} color="text-red-700" />
        <Kpi label="Net P&L" value={fmtINR(net)} color={net >= 0 ? 'text-emerald-700' : 'text-red-700'} bold />
        <Kpi label="Assets - Liab" value={fmtINR(assets - liabilities)} color="text-blue-700" />
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : entries.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No ledger entries in this range. Entries are auto-created from bookings, expenses, and salary payments.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-4 py-3">Date</th><th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Description</th><th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Debit</th><th className="px-4 py-3 text-right">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-500">{e.entry_date}</td>
                  <td className="px-4 py-3"><div className="font-medium text-slate-800">{e.code} - {e.account_name}</div><div className="text-[10px] text-slate-500 uppercase">{e.account_type}</div></td>
                  <td className="px-4 py-3 text-slate-700">{e.description || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{e.ref_type || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{Number(e.debit) > 0 ? fmtINR(e.debit) : ''}</td>
                  <td className="px-4 py-3 text-right font-semibold">{Number(e.credit) > 0 ? fmtINR(e.credit) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
      <div className={cn('text-lg font-bold mt-1', color || 'text-slate-900', bold && 'text-xl')}>{value}</div>
    </div>
  );
}
