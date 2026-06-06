'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Sparkles, X } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApi, formatMoney } from '../_lib/pms-api';
import { cn } from '@/lib/utils';

const SERVICE_KIND = [
  { value: 'extra_bed', label: 'Extra bed' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'spa', label: 'Spa' },
  { value: 'taxi', label: 'Taxi' },
  { value: 'tour', label: 'Tour package' },
  { value: 'minibar', label: 'Mini bar' },
  { value: 'other', label: 'Other' },
];

export default function ServicesPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  async function load() {
    setLoading(true);
    const res = await pmsApi.getServices();
    setLoading(false);
    if (!res.data) {
      setError(res.error || 'Failed to load services');
      return;
    }
    setItems(res.data.services || []);
  }
  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Extras & services</h1>
          <p className="text-sm text-slate-500">Define add-on services that can be charged to a folio.</p>
        </div>
        <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add service
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No extras yet — add laundry, breakfast, etc.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {items.map((s: any) => (
              <article key={s.id} className="border border-gray-200 rounded-2xl p-4 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{s.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">{s.kind.replace('_', ' ')}</p>
                  </div>
                  <span className={cn(
                    'text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded',
                    s.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  )}>
                    {s.isActive ? 'active' : 'inactive'}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-900">{formatMoney(s.price)}</span>
                  <span className="text-xs text-slate-500">
                    {s.isPerNight && 'per night '}
                    {s.isPerPerson && 'per person '}
                    {s.taxable ? '+ tax' : 'tax-free'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {show && <AddServiceModal onClose={() => setShow(false)} onSaved={() => { setShow(false); load(); }} />}
    </div>
  );
}

function AddServiceModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('breakfast');
  const [price, setPrice] = useState(0);
  const [taxable, setTaxable] = useState(true);
  const [isPerNight, setIsPerNight] = useState(false);
  const [isPerPerson, setIsPerPerson] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!name.trim() || price <= 0) { setError('Name and price required'); return; }
    setBusy(true);
    const res = await pmsApi.addService({ name: name.trim(), kind, price, taxable, isPerNight, isPerPerson });
    setBusy(false);
    if (!res.data?.success) { setError(res.error || 'Save failed'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Add service</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="space-y-3">
          <Lbl label="Name *">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Breakfast buffet" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
          <div className="grid grid-cols-2 gap-3">
            <Lbl label="Type">
              <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2">
                {SERVICE_KIND.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </Lbl>
            <Lbl label="Price (₹) *">
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
            </Lbl>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={taxable} onChange={(e) => setTaxable(e.target.checked)} /> Taxable</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPerNight} onChange={(e) => setIsPerNight(e.target.checked)} /> Charge per night</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPerPerson} onChange={(e) => setIsPerPerson(e.target.checked)} /> Charge per person</label>
          </div>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        <button onClick={save} disabled={busy} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add service
        </button>
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
