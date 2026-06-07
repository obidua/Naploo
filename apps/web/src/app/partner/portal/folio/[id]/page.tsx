'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, ArrowLeft, Plus, Banknote, Smartphone, CreditCard, Wallet,
  IndianRupee, Receipt, Lock, AlertCircle, CheckCircle2, X,
} from 'lucide-react';
import PortalShell, { ErrorBanner } from '../../_lib/PortalShell';
import { pmsApi, formatMoney, type FolioDetail } from '../../_lib/pms-api';
import { cn } from '@/lib/utils';

const CHARGE_KINDS = [
  { value: 'service', label: 'Service' },
  { value: 'fnb', label: 'F&B / Restaurant' },
  { value: 'extra_guest', label: 'Extra guest' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'discount', label: 'Discount' },
];

const PAY_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'cashfree', label: 'Cashfree', icon: Smartphone },
  { value: 'razorpay', label: 'Razorpay', icon: Smartphone },
  { value: 'wallet', label: 'Wallet', icon: Wallet },
  { value: 'bank_transfer', label: 'Bank transfer', icon: IndianRupee },
];

export default function FolioPage({ params }: { params: { id: string } }) {
  return (
    <PortalShell>
      <Body folioId={params.id} />
    </PortalShell>
  );
}

function Body({ folioId }: { folioId: string }) {
  const router = useRouter();
  const [data, setData] = useState<FolioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCharge, setShowCharge] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  async function load() {
    setLoading(true);
    const res = await pmsApi.getFolio(folioId);
    setLoading(false);
    if (!res.data) {
      setError(res.error || 'Folio not found');
      return;
    }
    setData(res.data);
  }

  useEffect(() => {
    load();
  }, [folioId]);

  if (loading && !data) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
      </div>
    );
  }
  if (error || !data) return <ErrorBanner message={error || 'Folio not found'} />;

  const { folio, booking, charges, payments } = data;
  const isClosed = folio.status === 'closed';
  const balance = Number(folio.balance);

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Folio header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Folio</h1>
              <span
                className={cn(
                  'text-[11px] uppercase font-semibold px-2 py-0.5 rounded',
                  folio.status === 'open' && 'bg-emerald-50 text-emerald-700',
                  folio.status === 'closed' && 'bg-slate-100 text-slate-600',
                  folio.status === 'void' && 'bg-red-50 text-red-700'
                )}
              >
                {folio.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Booking {booking?.bookingNumber} • Opened{' '}
              {new Date(folio.openedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Balance due</div>
            <div className={cn('text-2xl font-bold', balance > 0 ? 'text-red-600' : 'text-emerald-700')}>
              {formatMoney(balance)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
          <Cell label="Total charges" value={formatMoney(folio.totalCharges)} />
          <Cell label="Total paid" value={formatMoney(folio.totalPayments)} />
          <Cell label="Check-in" value={booking?.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-IN') : '—'} />
          <Cell label="Check-out" value={booking?.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-IN') : '—'} />
        </div>

        {!isClosed && (
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setShowCharge(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:border-primary-300"
            >
              <Plus className="w-4 h-4" /> Add charge
            </button>
            <button
              onClick={() => setShowPayment(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:border-primary-300"
            >
              <IndianRupee className="w-4 h-4" /> Take payment
            </button>
            <button
              onClick={() => setShowCheckout(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold"
            >
              <Lock className="w-4 h-4" /> Checkout & invoice
            </button>
          </div>
        )}
      </div>

      {/* Charges */}
      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Charges</h2>
          <span className="text-xs text-slate-500">{charges.length} item{charges.length === 1 ? '' : 's'}</span>
        </div>
        {charges.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-slate-500">No charges yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-5 py-2 font-semibold">Description</th>
                <th className="px-5 py-2 font-semibold">Kind</th>
                <th className="px-5 py-2 font-semibold text-right">Qty × Rate</th>
                <th className="px-5 py-2 font-semibold text-right">Amount</th>
                <th className="px-5 py-2 font-semibold text-right">At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {charges.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-2.5 text-slate-800">{c.description}</td>
                  <td className="px-5 py-2.5">
                    <span className="text-[10px] uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {c.kind}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right text-slate-500">
                    {c.qty} × {formatMoney(c.unitPrice)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-semibold text-slate-900">{formatMoney(c.amount)}</td>
                  <td className="px-5 py-2.5 text-right text-xs text-slate-500">
                    {new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Payments */}
      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Payments</h2>
          <span className="text-xs text-slate-500">{payments.length}</span>
        </div>
        {payments.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-slate-500">No payments taken yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {payments.map((p) => (
              <li key={p.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800 capitalize">{p.method.replace('_', ' ')}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(p.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    {p.reference && ` • ${p.reference}`}
                  </div>
                </div>
                <div className="text-emerald-700 font-bold">{formatMoney(p.amount)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showCharge && (
        <ChargeModal folioId={folio.id} onClose={() => setShowCharge(false)} onSaved={() => { setShowCharge(false); load(); }} />
      )}
      {showPayment && (
        <PaymentModal folioId={folio.id} suggestedAmount={balance} onClose={() => setShowPayment(false)} onSaved={() => { setShowPayment(false); load(); }} />
      )}
      {showCheckout && (
        <CheckoutModal folioId={folio.id} balance={balance} onClose={() => setShowCheckout(false)} onClosed={() => { setShowCheckout(false); load(); }} />
      )}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
      <div className="text-slate-800 font-medium">{value}</div>
    </div>
  );
}

function ChargeModal({ folioId, onClose, onSaved }: { folioId: string; onClose: () => void; onSaved: () => void }) {
  const [kind, setKind] = useState('service');
  const [description, setDescription] = useState('');
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [taxable, setTaxable] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!description.trim() || unitPrice === 0) {
      setError('Description and unit price are required.');
      return;
    }
    setBusy(true);
    const res = await pmsApi.addCharge(folioId, { kind, description: description.trim(), qty, unitPrice, taxable });
    setBusy(false);
    if (!res.data?.success) {
      setError(res.data?.message || res.error || 'Add charge failed');
      return;
    }
    onSaved();
  }

  return (
    <Modal title="Add charge" onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Lbl label="Type">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2">
            {CHARGE_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </Lbl>
        <Lbl label="Description *">
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Breakfast x 2" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
        </Lbl>
        <Lbl label="Qty">
          <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
        </Lbl>
        <Lbl label="Unit price (₹) *">
          <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
        </Lbl>
      </div>
      <label className="flex items-center gap-2 mt-3 text-sm">
        <input type="checkbox" checked={taxable} onChange={(e) => setTaxable(e.target.checked)} /> Taxable (GST applies)
      </label>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <div className="text-xs text-slate-500 mt-3">Total: <b>{formatMoney(qty * unitPrice)}</b></div>
      <button onClick={save} disabled={busy} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add charge
      </button>
    </Modal>
  );
}

function PaymentModal({ folioId, suggestedAmount, onClose, onSaved }: { folioId: string; suggestedAmount: number; onClose: () => void; onSaved: () => void }) {
  const [method, setMethod] = useState('cash');
  const [amount, setAmount] = useState(Math.max(0, suggestedAmount));
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    setBusy(true);
    const res = await pmsApi.takePayment(folioId, { method, amount, reference: reference || undefined });
    setBusy(false);
    if (!res.data?.success) {
      setError(res.data?.message || res.error || 'Payment failed');
      return;
    }
    onSaved();
  }

  return (
    <Modal title="Take payment" onClose={onClose}>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {PAY_METHODS.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.value}
              onClick={() => setMethod(m.value)}
              className={cn(
                'flex flex-col items-center gap-1 py-3 rounded-xl border text-xs',
                method === m.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-slate-600 hover:border-primary-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {m.label}
            </button>
          );
        })}
      </div>
      <Lbl label="Amount (₹) *">
        <input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
      </Lbl>
      <div className="mt-3">
        <Lbl label="Reference (optional)">
          <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Last 4 of card / UPI ID / receipt #" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
        </Lbl>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <button onClick={save} disabled={busy} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Receive {formatMoney(amount)}
      </button>
    </Modal>
  );
}

function CheckoutModal({ folioId, balance, onClose, onClosed }: { folioId: string; balance: number; onClose: () => void; onClosed: () => void }) {
  const [gst, setGst] = useState('');
  const [allowDues, setAllowDues] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [invoice, setInvoice] = useState<any | null>(null);

  async function save() {
    setBusy(true);
    setError('');
    const res = await pmsApi.checkout(folioId, { customerGstNumber: gst || undefined, allowDues });
    setBusy(false);
    if (!res.data?.success) {
      setError(res.data?.message || res.error || 'Checkout failed');
      return;
    }
    setInvoice(res.data.invoice);
  }

  if (invoice) {
    return (
      <Modal title="Invoice generated" onClose={onClosed}>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-4 mb-3">
          <Receipt className="w-7 h-7 mb-2" />
          <div className="text-xs uppercase opacity-80">Invoice #</div>
          <div className="text-xl font-bold font-mono tracking-wider">{invoice.invoiceNumber}</div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Gross</span><span>{formatMoney(invoice.grossAmount)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{formatMoney(invoice.taxAmount)}</span></div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t mt-2"><span>Net</span><span>{formatMoney(invoice.netAmount)}</span></div>
        </div>
        <button onClick={onClosed} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold">
          Done
        </button>
      </Modal>
    );
  }

  return (
    <Modal title="Checkout & invoice" onClose={onClose}>
      {balance > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-3 mb-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p>Outstanding balance: <b>{formatMoney(balance)}</b></p>
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={allowDues} onChange={(e) => setAllowDues(e.target.checked)} />
              Close folio anyway (mark as dues)
            </label>
          </div>
        </div>
      )}
      <Lbl label="Customer GST number (optional)">
        <input value={gst} onChange={(e) => setGst(e.target.value)} placeholder="09AAAAA0000A1Z5" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 uppercase" />
      </Lbl>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <button onClick={save} disabled={busy || (balance > 0 && !allowDues)} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
        Generate invoice
      </button>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Lbl({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      {children}
    </label>
  );
}
