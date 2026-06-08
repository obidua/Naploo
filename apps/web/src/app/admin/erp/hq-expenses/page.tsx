'use client';

// Admin HQ expenses — head-office spending (partner_id IS NULL).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, X, IndianRupee, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

interface Expense {
  id: string; expense_date: string; description: string; amount: string; gst_amount: string; total_amount: string;
  payment_mode: string; vendor_name?: string; invoice_no?: string; category_id?: string; category_name?: string;
  group_name?: string; status: string; notes?: string;
}
interface Category { id: string; name: string; group_name: string; slug: string }

const inr = (n: any) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function HqExpensesPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [list, setList] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<{ group_name: string; total: string }[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    const [r, c] = await Promise.all([
      api.get<{ expenses: Expense[]; summary: any[] }>(`/api/v1/admin/erp/hq-expenses?from=${from}&to=${to}`),
      api.get<{ categories: Category[] }>(`/api/v1/admin/erp/expense-categories`),
    ]);
    setLoading(false);
    if (r.data?.expenses) setList(r.data.expenses);
    if (r.data?.summary) setSummary(r.data.summary);
    if (c.data?.categories) setCats(c.data.categories);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [from, to]);

  const total = list.reduce((s, e) => s + Number(e.total_amount), 0);

  return (
    <main className="min-h-screen bg-slate-50 p-6 pt-24 max-w-7xl mx-auto">
      <Link href="/admin/erp" className="inline-flex items-center gap-1 text-sm text-slate-500 mb-2 hover:text-slate-800"><ArrowLeft className="w-4 h-4" /> ERP rollup</Link>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><IndianRupee className="w-6 h-6 text-emerald-600" /> HQ expenses</h1>
          <p className="text-sm text-slate-500">Head-office spending. Books are kept separate from partner property expenses.</p>
        </div>
        <div className="flex gap-2 items-center text-sm">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5" />
          <span className="text-slate-400">→</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5" />
          <button onClick={() => setShowAdd(true)} className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold">
            <Plus className="w-4 h-4" /> Add expense
          </button>
        </div>
      </div>

      <section className="grid sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="text-xs text-slate-500 uppercase font-semibold">Total</div>
          <div className="text-2xl font-bold text-slate-900">{inr(total)}</div>
          <div className="text-xs text-slate-500">{list.length} entries</div>
        </div>
        {summary.slice(0, 2).map((s) => (
          <div key={s.group_name || 'na'} className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="text-xs text-slate-500 uppercase font-semibold capitalize">{s.group_name || 'other'}</div>
            <div className="text-2xl font-bold text-slate-900">{inr(s.total)}</div>
          </div>
        ))}
      </section>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div> :
          list.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No HQ expenses for this range.</div> :
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-2.5 text-slate-600">{e.expense_date}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{e.description}{e.invoice_no && <div className="text-xs text-slate-500">Inv {e.invoice_no}</div>}</td>
                  <td className="px-4 py-2.5 text-slate-600">{e.category_name || '—'}<div className="text-xs text-slate-400 capitalize">{e.group_name || ''}</div></td>
                  <td className="px-4 py-2.5 text-slate-600">{e.vendor_name || '—'}</td>
                  <td className="px-4 py-2.5"><span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{e.payment_mode}</span></td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{inr(e.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {showAdd && <AddModal cats={cats} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />}
    </main>
  );
}

function AddModal({ cats, onClose, onSaved }: { cats: Category[]; onClose: () => void; onSaved: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<any>({ expenseDate: today, paymentMode: 'bank' });
  const [busy, setBusy] = useState(false);
  function set<K extends string>(k: K, v: any) { setForm((p: any) => ({ ...p, [k]: v })); }
  async function save() {
    if (!form.description || !form.amount) return;
    setBusy(true);
    const r = await api.post('/api/v1/admin/erp/hq-expenses', { ...form, amount: Number(form.amount), gstAmount: Number(form.gstAmount || 0) });
    setBusy(false);
    if ((r.data as any)?.success) onSaved();
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Add HQ expense</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <input type="date" value={form.expenseDate} className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('expenseDate', e.target.value)} />
          <select className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('categoryId', e.target.value || null)}>
            <option value="">Category…</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.group_name})</option>)}
          </select>
          <input placeholder="Description *" className="border border-gray-200 rounded-lg px-3 py-2 sm:col-span-2" onChange={(e) => set('description', e.target.value)} />
          <input type="number" placeholder="Amount *" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('amount', e.target.value)} />
          <input type="number" placeholder="GST" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('gstAmount', e.target.value)} />
          <input placeholder="Vendor" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('vendorName', e.target.value)} />
          <input placeholder="Invoice no" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('invoiceNo', e.target.value)} />
          <select className="border border-gray-200 rounded-lg px-3 py-2" defaultValue="bank" onChange={(e) => set('paymentMode', e.target.value)}>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="cheque">Cheque</option>
            <option value="credit">On credit</option>
          </select>
          <input placeholder="Notes" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('notes', e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">Cancel</button>
          <button onClick={save} disabled={busy} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
            {busy ? 'Saving…' : 'Save expense'}
          </button>
        </div>
      </div>
    </div>
  );
}
