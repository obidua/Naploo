'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Calculator, FileText, Plus, Trash2, X, Scale, Receipt } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { erpApi, fmtINR, type LedgerEntry } from '../_lib/erp-api';
import { cn } from '@/lib/utils';

export default function AccountingPage() { return <PortalShell><Body /></PortalShell>; }

type Account = { id: string; code: string; name: string; type: string };
type TbRow = { id: string; code: string; name: string; type: string; debit: string; credit: string; balance: string };

function Body() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [tab, setTab] = useState<'ledger' | 'trial' | 'gst'>('ledger');
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [pnl, setPnl] = useState<{ type: string; net: string }[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [tb, setTb] = useState<TbRow[]>([]);
  const [tbTotals, setTbTotals] = useState<{ debit: number; credit: number }>({ debit: 0, credit: 0 });
  const [gst, setGst] = useState<{ inputGst: number; outputGst: number; netPayable: number; carryForward: number; totalExpenses: number; totalCollected: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJv, setShowJv] = useState(false);

  async function load() {
    setLoading(true);
    const [le, ac, tbR, gs] = await Promise.all([
      erpApi.getLedger(from, to, accountFilter || undefined),
      accounts.length === 0 ? erpApi.listAccounts() : Promise.resolve({ data: { accounts } } as any),
      erpApi.getTrialBalance(from, to),
      erpApi.getGstSummary(from, to),
    ]);
    setLoading(false);
    if (le.data?.entries) setEntries(le.data.entries);
    if (le.data?.pnl) setPnl(le.data.pnl);
    if (ac.data?.accounts) setAccounts(ac.data.accounts);
    if (tbR.data?.accounts) { setTb(tbR.data.accounts); setTbTotals(tbR.data.totals); }
    if (gs.data) setGst(gs.data);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [from, to, accountFilter]);

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
          <p className="text-sm text-slate-500">Ledger, trial balance, GST and manual journal vouchers.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <span className="text-slate-400">→</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <button onClick={() => setShowJv(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> Journal voucher</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Income" value={fmtINR(income)} color="text-emerald-700" />
        <Kpi label="Expense" value={fmtINR(expense)} color="text-red-700" />
        <Kpi label="Net P&L" value={fmtINR(net)} color={net >= 0 ? 'text-emerald-700' : 'text-red-700'} bold />
        <Kpi label="Assets - Liab" value={fmtINR(assets - liabilities)} color="text-blue-700" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-100 text-sm font-medium">
          <Tab active={tab === 'ledger'} onClick={() => setTab('ledger')} label="Ledger" icon={<FileText className="w-4 h-4" />} />
          <Tab active={tab === 'trial'} onClick={() => setTab('trial')} label="Trial balance" icon={<Scale className="w-4 h-4" />} />
          <Tab active={tab === 'gst'} onClick={() => setTab('gst')} label="GST" icon={<Receipt className="w-4 h-4" />} />
        </div>

        {loading ? <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div> :
         tab === 'ledger' ? (
          <div>
            <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 text-sm">
              <span className="text-slate-500">Account:</span>
              <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-sm">
                <option value="">All accounts</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
              </select>
              <span className="text-xs text-slate-400 ml-auto">{entries.length} entries</span>
            </div>
            {entries.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No ledger entries in this range.</div> :
            <div className="overflow-x-auto">
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
                    <td className="px-4 py-2.5 text-xs text-slate-500">{e.entry_date}</td>
                    <td className="px-4 py-2.5"><div className="font-medium text-slate-800">{e.code} - {e.account_name}</div><div className="text-[10px] text-slate-500 uppercase">{e.account_type}</div></td>
                    <td className="px-4 py-2.5 text-slate-700">{e.description || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{e.ref_type || '—'}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{Number(e.debit) > 0 ? fmtINR(e.debit) : ''}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{Number(e.credit) > 0 ? fmtINR(e.credit) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>}
          </div>
        ) : tab === 'trial' ? (
          tb.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No activity in this range.</div> :
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-4 py-3">Code</th><th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tb.map((a) => {
                const bal = Number(a.balance);
                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono text-xs">{a.code}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{a.name}</td>
                    <td className="px-4 py-2.5 text-xs uppercase text-slate-500">{a.type}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{Number(a.debit) > 0 ? fmtINR(a.debit) : ''}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{Number(a.credit) > 0 ? fmtINR(a.credit) : ''}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums font-semibold ${bal >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>{fmtINR(Math.abs(bal))} {bal >= 0 ? 'Dr' : 'Cr'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr className="font-bold">
                <td colSpan={3} className="px-4 py-3 text-right">Totals</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtINR(tbTotals.debit)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtINR(tbTotals.credit)}</td>
                <td className={`px-4 py-3 text-right ${Math.abs(tbTotals.debit - tbTotals.credit) < 0.01 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {Math.abs(tbTotals.debit - tbTotals.credit) < 0.01 ? '✓ balanced' : 'unbalanced'}
                </td>
              </tr>
            </tfoot>
          </table>
          </div>
        ) : (
          <div className="p-6 grid sm:grid-cols-2 gap-4">
            {gst ? <>
              <GstCard label="Output GST (collected)" value={fmtINR(gst.outputGst)} note={`From ${fmtINR(gst.totalCollected)} collected`} accent="emerald" />
              <GstCard label="Input GST (paid)" value={fmtINR(gst.inputGst)} note={`From ${fmtINR(gst.totalExpenses)} expenses`} accent="violet" />
              <GstCard label="Net payable to govt" value={fmtINR(gst.netPayable)} note="Output - Input" accent="rose" big />
              <GstCard label="Carry-forward credit" value={fmtINR(gst.carryForward)} note="Input - Output" accent="amber" big />
            </> : <div className="col-span-2 text-center text-sm text-slate-500">No GST data.</div>}
          </div>
        )}
      </div>

      {showJv && <JvModal accounts={accounts} onClose={() => setShowJv(false)} onSaved={() => { setShowJv(false); load(); }} />}
    </div>
  );
}

function Tab({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn('px-5 py-3 inline-flex items-center gap-1.5', active ? 'border-b-2 border-violet-500 text-violet-700' : 'text-slate-500')}>
      {icon}{label}
    </button>
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

function GstCard({ label, value, note, accent, big }: { label: string; value: string; note?: string; accent: 'emerald' | 'violet' | 'rose' | 'amber'; big?: boolean }) {
  const ring = { emerald: 'border-emerald-200 bg-emerald-50', violet: 'border-violet-200 bg-violet-50', rose: 'border-rose-200 bg-rose-50', amber: 'border-amber-200 bg-amber-50' }[accent];
  const text = { emerald: 'text-emerald-800', violet: 'text-violet-800', rose: 'text-rose-700', amber: 'text-amber-800' }[accent];
  return (
    <div className={`border ${ring} rounded-2xl p-4`}>
      <div className={`text-xs uppercase font-semibold ${text}`}>{label}</div>
      <div className={`${big ? 'text-3xl' : 'text-2xl'} font-bold mt-1 ${text}`}>{value}</div>
      {note && <div className="text-xs text-slate-500 mt-1">{note}</div>}
    </div>
  );
}

function JvModal({ accounts, onClose, onSaved }: { accounts: Account[]; onClose: () => void; onSaved: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<{ accountId: string; debit: string; credit: string }[]>([
    { accountId: '', debit: '', credit: '' },
    { accountId: '', debit: '', credit: '' },
  ]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function update(idx: number, key: 'accountId' | 'debit' | 'credit', val: string) {
    setLines((p) => p.map((l, i) => i === idx ? { ...l, [key]: val } : l));
  }
  function addLine() { setLines((p) => [...p, { accountId: '', debit: '', credit: '' }]); }
  function removeLine(idx: number) { setLines((p) => p.filter((_, i) => i !== idx)); }

  const totDr = useMemo(() => lines.reduce((s, l) => s + Number(l.debit || 0), 0), [lines]);
  const totCr = useMemo(() => lines.reduce((s, l) => s + Number(l.credit || 0), 0), [lines]);
  const balanced = Math.abs(totDr - totCr) < 0.01 && totDr > 0;

  async function save() {
    setErr('');
    if (!balanced) { setErr('Debit and credit totals must match and be > 0'); return; }
    const payload = {
      date, description,
      lines: lines.filter((l) => l.accountId).map((l) => ({ accountId: l.accountId, debit: Number(l.debit || 0), credit: Number(l.credit || 0) })),
    };
    if (payload.lines.length < 2) { setErr('At least 2 lines required'); return; }
    setBusy(true);
    const r = await erpApi.postJournal(payload);
    setBusy(false);
    if (r.data?.success) onSaved();
    else setErr((r as any).error || 'Failed to post');
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Manual journal voucher</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2" />
          <input placeholder="Narration (description)" value={description} onChange={(e) => setDescription(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2" />
        </div>
        <div className="space-y-1 text-sm">
          <div className="grid grid-cols-[1fr_120px_120px_30px] gap-2 text-[11px] uppercase font-semibold text-slate-500 px-1">
            <div>Account</div><div className="text-right">Debit</div><div className="text-right">Credit</div><div></div>
          </div>
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_120px_30px] gap-2">
              <select value={l.accountId} onChange={(e) => update(i, 'accountId', e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5">
                <option value="">Select account…</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name} ({a.type})</option>)}
              </select>
              <input type="number" placeholder="0" value={l.debit} onChange={(e) => update(i, 'debit', e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-right tabular-nums" />
              <input type="number" placeholder="0" value={l.credit} onChange={(e) => update(i, 'credit', e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-right tabular-nums" />
              <button onClick={() => removeLine(i)} className="text-slate-400 hover:text-rose-600" disabled={lines.length <= 2}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={addLine} className="text-xs font-semibold text-violet-700 mt-1">+ Add line</button>
          <div className="grid grid-cols-[1fr_120px_120px_30px] gap-2 mt-2 pt-2 border-t border-gray-100 font-bold">
            <div className="text-right text-slate-500 text-xs uppercase">Totals</div>
            <div className="text-right tabular-nums">{fmtINR(totDr)}</div>
            <div className="text-right tabular-nums">{fmtINR(totCr)}</div>
            <div></div>
          </div>
          <div className={cn('text-xs text-right pt-1', balanced ? 'text-emerald-700' : 'text-rose-600')}>
            {balanced ? '✓ Balanced' : `Difference ${fmtINR(Math.abs(totDr - totCr))}`}
          </div>
        </div>
        {err && <div className="text-sm text-rose-600 mt-2">{err}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">Cancel</button>
          <button onClick={save} disabled={busy || !balanced} className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold disabled:opacity-50">
            {busy ? 'Posting…' : 'Post voucher'}
          </button>
        </div>
      </div>
    </div>
  );
}
