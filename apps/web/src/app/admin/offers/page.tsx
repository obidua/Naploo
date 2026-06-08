'use client';

// Admin: investor offers management.
// Reached from /admin sidebar (will add link). Lives at /admin/offers.
import { useEffect, useState } from 'react';
import { Loader2, Briefcase, Plus, X, Users, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Offer {
  id: string; property_name: string; location?: string;
  total_sets_available: number; sets_reserved: number;
  price_per_set: string; expected_monthly_yield?: string;
  delivery_default: string; description?: string;
  status: string; visible_to: string; expires_at?: string;
  partner_business?: string; response_count?: string;
  created_at: string;
}
interface Response {
  id: string; pod_sets_requested: number; total_amount: string;
  delivery_option: string; status: string; notes?: string;
  first_name?: string; last_name?: string; email?: string; phone?: string;
  created_at: string;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [openOffer, setOpenOffer] = useState<Offer | null>(null);

  async function load() {
    setLoading(true);
    const r = await api.get<{ offers: Offer[] }>('/api/v1/admin/investor-offers');
    setLoading(false);
    if (r.data?.offers) setOffers(r.data.offers);
  }
  useEffect(() => { load(); }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 pt-24 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Briefcase className="w-6 h-6 text-emerald-600" /> Investor offers</h1>
          <p className="text-sm text-slate-500">Premises offers for investors to claim pod sets. Investors see open offers in their portal.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold">
          <Plus className="w-4 h-4" /> Create offer
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></div>
      ) : offers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No offers yet. Create your first offer for investors.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-3">
          {offers.map((o) => {
            const remaining = o.total_sets_available - o.sets_reserved;
            const filled = Math.round((o.sets_reserved / o.total_sets_available) * 100);
            return (
              <article key={o.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{o.property_name}</h3>
                    <div className="text-xs text-slate-500">{o.location || o.partner_business || '—'}</div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${o.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{o.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm mt-3">
                  <div><div className="text-[10px] text-slate-500 uppercase">Sets</div><div className="font-bold">{o.total_sets_available}</div></div>
                  <div><div className="text-[10px] text-slate-500 uppercase">Reserved</div><div className="font-bold text-emerald-700">{o.sets_reserved}</div></div>
                  <div><div className="text-[10px] text-slate-500 uppercase">₹/set</div><div className="font-bold">₹{(Number(o.price_per_set)/100000).toFixed(1)}L</div></div>
                </div>
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${filled}%` }} />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <button onClick={() => setOpenOffer(o)} className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1">
                    <Users className="w-3 h-3" /> {o.response_count ?? 0} response{Number(o.response_count) === 1 ? '' : 's'}
                  </button>
                  <div className="text-[10px] text-slate-500">{new Date(o.created_at).toLocaleDateString()}</div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showNew && <NewOfferModal onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }} />}
      {openOffer && <ResponsesModal offer={openOffer} onClose={() => { setOpenOffer(null); load(); }} />}
    </main>
  );
}

function NewOfferModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [propertyName, setPropertyName] = useState('');
  const [location, setLocation] = useState('');
  const [totalSetsAvailable, setTotalSetsAvailable] = useState(20);
  const [pricePerSet, setPricePerSet] = useState(500000);
  const [expectedYield, setExpectedYield] = useState(18000);
  const [deliveryDefault, setDeliveryDefault] = useState('leaseback');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!propertyName || totalSetsAvailable <= 0 || pricePerSet <= 0) { setError('Fill required fields'); return; }
    setBusy(true);
    const r = await api.post<{ success: boolean }>('/api/v1/admin/investor-offers', {
      propertyName, location, totalSetsAvailable, pricePerSet,
      expectedMonthlyYield: expectedYield, deliveryDefault, description,
    });
    setBusy(false);
    if (!r.data?.success) { setError(r.error || 'Failed'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-slate-900">New investor offer</h3><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div className="space-y-3">
          <Field label="Property name *" value={propertyName} onChange={setPropertyName} placeholder="Naploo Pods @ Hotel Grand Bangalore" />
          <Field label="Location" value={location} onChange={setLocation} placeholder="Indiranagar, Bangalore" />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Pod sets *" value={String(totalSetsAvailable)} onChange={(v) => setTotalSetsAvailable(Number(v) || 0)} type="number" />
            <Field label="₹ per set" value={String(pricePerSet)} onChange={(v) => setPricePerSet(Number(v) || 0)} type="number" />
            <Field label="₹/set/month yield" value={String(expectedYield)} onChange={(v) => setExpectedYield(Number(v) || 0)} type="number" />
          </div>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Delivery default</span>
            <select value={deliveryDefault} onChange={(e) => setDeliveryDefault(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="leaseback">Leaseback (pods stay at partner hotel)</option>
              <option value="doorstep">Doorstep (delivered to investor)</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="High-traffic location, 80%+ avg occupancy, 5-year contract…" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold disabled:opacity-60">{busy ? 'Creating…' : 'Publish offer'}</button>
      </div>
    </div>
  );
}

function ResponsesModal({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await api.get<{ responses: Response[] }>(`/api/v1/admin/investor-offers/${offer.id}/responses`);
    setLoading(false);
    if (r.data?.responses) setResponses(r.data.responses);
  }
  useEffect(() => { load(); }, []);

  async function accept(id: string) {
    const today = new Date().toISOString().slice(0, 10);
    const end = new Date(); end.setFullYear(end.getFullYear() + 3);
    await api.post(`/api/v1/admin/investor-offer-responses/${id}/accept`, {
      contractStartDate: today, contractEndDate: end.toISOString().slice(0, 10),
    });
    load();
  }
  async function decline(id: string) {
    if (!confirm('Decline this response?')) return;
    await api.post(`/api/v1/admin/investor-offer-responses/${id}/decline`, {});
    load();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="text-lg font-semibold text-slate-900">Responses to {offer.property_name}</h3><p className="text-xs text-slate-500">{responses.length} investor{responses.length === 1 ? '' : 's'} responded</p></div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        {loading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /> : responses.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No responses yet.</p>
        ) : (
          <ul className="space-y-2">
            {responses.map((r) => (
              <li key={r.id} className="border border-gray-200 rounded-xl p-3 flex justify-between items-center gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{[r.first_name, r.last_name].filter(Boolean).join(' ') || '—'}</div>
                  <div className="text-xs text-slate-500">{r.email || r.phone}</div>
                  <div className="text-sm mt-1">{r.pod_sets_requested} sets · ₹{(Number(r.total_amount) / 100000).toFixed(2)}L · {r.delivery_option}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${r.status === 'pending' ? 'bg-amber-50 text-amber-700' : r.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{r.status}</span>
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => accept(r.id)} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white font-semibold"><CheckCircle2 className="w-3 h-3 inline" /> Accept</button>
                      <button onClick={() => decline(r.id)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700">Decline</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
    </label>
  );
}
