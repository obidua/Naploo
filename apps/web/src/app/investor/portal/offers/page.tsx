'use client';

// Investor: browse open premises offers + respond.
import { useEffect, useState } from 'react';
import { Loader2, Briefcase, MapPin, TrendingUp, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import InvestorShell from '../_lib/InvestorShell';
import { api } from '@/lib/api';
import { formatMoney } from '../_lib/api';
import { cn } from '@/lib/utils';

interface Offer {
  id: string; property_name: string; location?: string;
  total_sets_available: number; sets_reserved: number; sets_remaining: number;
  price_per_set: string; expected_monthly_yield?: string;
  delivery_default: string; description?: string;
  partner_business?: string; my_response_status?: string;
  expires_at?: string;
}

export default function InvestorOffersPage() {
  return <InvestorShell><Body /></InvestorShell>;
}

function Body() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [openOffer, setOpenOffer] = useState<Offer | null>(null);

  async function load() {
    setLoading(true);
    const r = await api.get<{ offers: Offer[] }>('/api/v1/investors/offers');
    setLoading(false);
    if (r.data?.offers) setOffers(r.data.offers);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-600" /> Premises offers</h1>
        <p className="text-sm text-slate-500">New properties looking for pod-set investors. Pick the count of sets you want — Naploo handles installation + revenue tracking.</p>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div>
      ) : offers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No open offers right now. Check back soon.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-3">
          {offers.map((o) => {
            const yieldPercent = o.expected_monthly_yield ? Math.round((Number(o.expected_monthly_yield) * 12 / Number(o.price_per_set)) * 100) : null;
            return (
              <article key={o.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{o.property_name}</h3>
                    {o.location && <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {o.location}</div>}
                  </div>
                  {o.my_response_status && (
                    <span className={cn(
                      'text-[10px] uppercase font-bold px-2 py-0.5 rounded',
                      o.my_response_status === 'accepted' && 'bg-emerald-50 text-emerald-700',
                      o.my_response_status === 'pending' && 'bg-amber-50 text-amber-700',
                      o.my_response_status === 'declined' && 'bg-red-50 text-red-700',
                    )}>{o.my_response_status}</span>
                  )}
                </div>

                {o.description && <p className="text-sm text-slate-600 mt-2 line-clamp-3">{o.description}</p>}

                <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                  <Cell label="₹/set" value={formatMoney(o.price_per_set)} />
                  <Cell label="Available" value={`${o.sets_remaining}/${o.total_sets_available}`} />
                  {yieldPercent !== null && <Cell label="Yield" value={`${yieldPercent}% pa`} className="text-emerald-700" />}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Default: {o.delivery_default}</div>
                  {!o.my_response_status ? (
                    <button onClick={() => setOpenOffer(o)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold">
                      Respond <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">You responded</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {openOffer && <RespondModal offer={openOffer} onClose={() => setOpenOffer(null)} onSaved={() => { setOpenOffer(null); load(); }} />}
    </div>
  );
}

function Cell({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
      <div className={cn('font-bold', className || 'text-slate-900')}>{value}</div>
    </div>
  );
}

function RespondModal({ offer, onClose, onSaved }: { offer: Offer; onClose: () => void; onSaved: () => void }) {
  const [count, setCount] = useState(1);
  const [delivery, setDelivery] = useState(offer.delivery_default);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const baseAmount = count * Number(offer.price_per_set);
  const gst = Math.round(baseAmount * 0.18);
  const total = baseAmount + gst;
  const max = offer.sets_remaining;

  async function save() {
    if (count < 1 || count > max) { setError(`Must be 1-${max}`); return; }
    setBusy(true);
    const r = await api.post<{ success: boolean; message?: string }>(`/api/v1/investors/offers/${offer.id}/respond`, {
      podSetsRequested: count, deliveryOption: delivery, notes: notes || undefined,
    });
    setBusy(false);
    if (!r.data?.success) { setError(r.data?.message || r.error || 'Failed'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Respond to {offer.property_name}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">Number of pod sets</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCount(Math.max(1, count - 1))} className="w-10 h-10 rounded-lg bg-slate-100">−</button>
              <div className="flex-1 text-center text-2xl font-bold">{count}</div>
              <button onClick={() => setCount(Math.min(max, count + 1))} className="w-10 h-10 rounded-lg bg-slate-100">+</button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 text-center">{max} sets remaining · {formatMoney(offer.price_per_set)} per set + 18% GST</p>
          </div>

          <div>
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">Delivery</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setDelivery('leaseback')} className={cn('p-3 rounded-xl border text-left text-sm', delivery === 'leaseback' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200')}>
                <div className="font-semibold">🏨 Leaseback</div><div className="text-[11px] text-slate-500">Pods stay at partner hotel</div>
              </button>
              <button onClick={() => setDelivery('doorstep')} className={cn('p-3 rounded-xl border text-left text-sm', delivery === 'doorstep' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200')}>
                <div className="font-semibold">📦 Doorstep</div><div className="text-[11px] text-slate-500">Pods delivered to you</div>
              </button>
            </div>
          </div>

          <label className="block">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Notes for admin (optional)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </label>

          <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-slate-500">Base ({count} × {formatMoney(offer.price_per_set)})</span><span>{formatMoney(baseAmount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">GST 18%</span><span>{formatMoney(gst)}</span></div>
            <div className="flex justify-between font-bold border-t pt-1"><span>Total</span><span>{formatMoney(total)}</span></div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <CheckCircle2 className="w-4 h-4 inline" />} Submit response
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-2">Admin reviews + contacts you for payment + agreement signing.</p>
      </div>
    </div>
  );
}
