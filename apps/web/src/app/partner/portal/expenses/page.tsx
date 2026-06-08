'use client';

import { useEffect, useState } from 'react';
import { Loader2, Receipt, Plus, X, Trash2, Check } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { erpApi, fmtINR, type Expense, type ExpenseCategory } from '../_lib/erp-api';
import { cn } from '@/lib/utils';

const MODES = ['cash', 'bank', 'upi', 'card', 'cheque'];

export default function ExpensesPage() { return <PortalShell><Body /></PortalShell>; }

function Body() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<{ group_name: string; total: string }[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  async function load() {
    setLoading(true);
    const [er, cr] = await Promise.all([erpApi.listExpenses(from, to), erpApi.listExpenseCategories()]);
    if (er.data?.expenses) { setExpenses(er.data.expenses); setSummary(er.data.summary || []); }
    if (cr.data?.categories) setCategories(cr.data.categories);
    setLoading(false);
  }
  useEffect(() => { load(); }, [from, to]);

  const total = expenses.reduce((s, e) => s + Number(e.total_amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Receipt className="w-5 h-5 text-primary-600" /> Expenses</h1>
          <p className="text-sm text-slate-500">{expenses.length} entries · {fmtINR(total)} total</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <span className="text-slate-400">→</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add expense
          </button>
        </div>
      </div>

      {summary.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {['cogs', 'opex', 'capex', 'finance'].map((g) => {
            const row = summary.find((s) => s.group_name === g);
            return (
              <div key={g} className="bg-white border border-gray-200 rounded-2xl p-3">
                <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{g}</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{fmtINR(row?.total || 0)}</div>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : expenses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No expenses in this date range.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-4 py-3">Date</th><th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th><th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Mode</th><th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th><th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600 text-xs">{e.expense_date}</td>
                  <td className="px-4 py-3 text-slate-900">{e.description}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{e.category_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{e.vendor_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs capitalize">{e.payment_mode}</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmtINR(e.total_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[10px] uppercase font-bold px-2 py-0.5 rounded',
                      e.status === 'approved' && 'bg-emerald-50 text-emerald-700',
                      e.status === 'recorded' && 'bg-amber-50 text-amber-700',
                    )}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.status === 'recorded' && <button onClick={async () => { await erpApi.approveExpense(e.id); load(); }} className="text-emerald-700 mr-2"><Check className="w-4 h-4 inline" /></button>}
                    <button onClick={async () => { if (confirm('Delete?')) { await erpApi.deleteExpense(e.id); load(); } }} className="text-red-600"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && <NewExpenseModal categories={categories} onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }} />}
    </div>
  );
}

function NewExpenseModal({ categories, onClose, onSaved }: { categories: ExpenseCategory[]; onClose: () => void; onSaved: () => void }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [vendorName, setVendorName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!description || !amount) { setError('Description + amount required'); return; }
    setBusy(true);
    const r = await erpApi.createExpense({ description, amount, gstAmount, categoryId, paymentMode, vendorName, invoiceNo, expenseDate });
    setBusy(false);
    if (!(r.data as any)?.expense) { setError(r.error || 'Failed'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">New expense</h3><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Description *" value={description} onChange={setDescription} placeholder="LPG cylinder refill" className="col-span-2" />
          <Field label="Amount (₹)" value={String(amount)} onChange={(v) => setAmount(Number(v) || 0)} type="number" />
          <Field label="GST (₹)" value={String(gstAmount)} onChange={(v) => setGstAmount(Number(v) || 0)} type="number" />
          <SelField label="Category" value={categoryId} onChange={setCategoryId} options={categories.map(c => ({ value: c.id, label: c.name }))} />
          <SelField label="Payment mode" value={paymentMode} onChange={setPaymentMode} options={MODES.map(m => ({ value: m, label: m }))} />
          <Field label="Vendor" value={vendorName} onChange={setVendorName} />
          <Field label="Invoice no." value={invoiceNo} onChange={setInvoiceNo} />
          <Field label="Date" value={expenseDate} onChange={setExpenseDate} type="date" />
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">{busy ? 'Saving…' : 'Add expense'}</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', className }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    </label>
  );
}
function SelField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      <select value={value} onChange={(e: any) => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm capitalize">
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
