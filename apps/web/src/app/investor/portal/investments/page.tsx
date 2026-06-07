'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, Package, X, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import InvestorShell, { ErrorBanner } from '../_lib/InvestorShell';
import { investorApi, formatMoney, type Investor, type Investment } from '../_lib/api';
import { cn } from '@/lib/utils';

const PRICE_PER_SET = 500000;
const GST_RATE = 0.18;

export default function InvestorInvestmentsPage() {
  return (
    <InvestorShell>
      <Body />
    </InvestorShell>
  );
}

function Body() {
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvest, setShowInvest] = useState(false);

  async function load() {
    setLoading(true);
    const res = await investorApi.me();
    setLoading(false);
    if (!res.data) { setError(res.error || 'Failed'); return; }
    setInvestor(res.data.investor);
    setInvestments(res.data.investments || []);
  }
  useEffect(() => { load(); }, []);

  if (loading && !investor) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div>;
  }
  if (error || !investor) return <ErrorBanner message={error || 'Enroll first'} />;

  const canInvest = ['approved', 'active'].includes(investor.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My investments</h1>
          <p className="text-sm text-slate-500">Pod sets you've purchased + earnings + 3× guarantee progress.</p>
        </div>
        {canInvest && (
          <button onClick={() => setShowInvest(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> New investment
          </button>
        )}
      </div>

      {!canInvest && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            Your account status is <b>{investor.status.replace('_', ' ')}</b>. Submit KYC at <Link href="/investor/portal/profile" className="underline">Profile</Link> and wait for admin approval before claiming pod sets.
          </div>
        </div>
      )}

      {investments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No investments yet.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-3">
          {investments.map((inv) => {
            const earned = Number(inv.earnedSoFar);
            const guarantee = Number(inv.guaranteeAmount);
            const progress = Math.min(100, Math.round((earned / guarantee) * 100));
            return (
              <article key={inv.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-500">Invoice</div>
                    <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                  </div>
                  <span className={cn(
                    'text-[10px] uppercase font-semibold px-2 py-0.5 rounded',
                    inv.status === 'active' && 'bg-emerald-50 text-emerald-700',
                    inv.status === 'pending' && 'bg-amber-50 text-amber-700',
                    inv.status === 'completed' && 'bg-blue-50 text-blue-700',
                  )}>{inv.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                  <Cell label="Pod sets" value={String(inv.podSetCount)} />
                  <Cell label="Delivery" value={inv.deliveryOption} />
                  <Cell label="Total invested" value={formatMoney(inv.totalAmount)} />
                  <Cell label="3× guarantee" value={formatMoney(guarantee)} />
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Progress to guarantee</span>
                    <span className="font-semibold text-emerald-700">{formatMoney(earned)} / {formatMoney(guarantee)}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn(
                      'h-full bg-gradient-to-r transition-all duration-500',
                      inv.guaranteeReached ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-cyan-500'
                    )} style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-[10px] text-right mt-1 text-slate-500">{progress}%</div>
                </div>

                {inv.guaranteeReached && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3× guarantee reached! Pods now belong to Naploo (scrap policy applied).</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {showInvest && <InvestModal onClose={() => setShowInvest(false)} onSaved={() => { setShowInvest(false); load(); }} />}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
      <div className="text-slate-800 font-medium capitalize">{value}</div>
    </div>
  );
}

function InvestModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [count, setCount] = useState(1);
  const [delivery, setDelivery] = useState<'leaseback' | 'doorstep'>('leaseback');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const baseAmount = count * PRICE_PER_SET;
  const gst = Math.round(baseAmount * GST_RATE);
  const total = baseAmount + gst;

  async function save() {
    setBusy(true);
    const res = await investorApi.invest({ podSetCount: count, deliveryOption: delivery });
    setBusy(false);
    if (!res.data?.success) { setError(res.error || 'Failed'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">New investment</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">Number of pod sets</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCount(Math.max(1, count - 1))} className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200">−</button>
              <div className="flex-1 text-center text-2xl font-bold">{count}</div>
              <button onClick={() => setCount(Math.min(20, count + 1))} className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200">+</button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 text-center">Each set = 2 pods stacked. ₹{PRICE_PER_SET.toLocaleString('en-IN')} per set + GST 18%.</p>
          </div>

          <div>
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">Delivery option</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setDelivery('leaseback')} className={cn(
                'p-3 rounded-xl border text-left',
                delivery === 'leaseback' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
              )}>
                <div className="font-semibold text-slate-900 text-sm">🏨 Leaseback</div>
                <div className="text-[11px] text-slate-500 mt-1">Pods installed at Naploo partner hotels. You earn 60% per booking.</div>
              </button>
              <button onClick={() => setDelivery('doorstep')} className={cn(
                'p-3 rounded-xl border text-left',
                delivery === 'doorstep' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
              )}>
                <div className="font-semibold text-slate-900 text-sm">📦 Doorstep</div>
                <div className="text-[11px] text-slate-500 mt-1">Pods delivered to you for home/office installation.</div>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Base ({count} × ₹{PRICE_PER_SET.toLocaleString('en-IN')})</span><span>{formatMoney(baseAmount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">GST 18%</span><span>{formatMoney(gst)}</span></div>
            <div className="flex justify-between font-bold pt-1 border-t border-slate-200"><span>Total</span><span>{formatMoney(total)}</span></div>
            <div className="flex justify-between text-emerald-700 font-semibold pt-1"><span>3× guarantee</span><span>{formatMoney(total * 3)}</span></div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <button onClick={save} disabled={busy} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Reserve {count} pod set{count > 1 ? 's' : ''}
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-2">Admin will contact you for payment + KYC verification.</p>
      </div>
    </div>
  );
}
