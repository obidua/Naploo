'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Receipt, X } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApi } from '../_lib/pms-api';
import { cn } from '@/lib/utils';

const TAX_KIND = [
  { value: 'gst', label: 'GST' },
  { value: 'service', label: 'Service charge' },
  { value: 'cess', label: 'Cess' },
  { value: 'tcs', label: 'TCS' },
];

const APPLIES_TO = [
  { value: 'all', label: 'All charges' },
  { value: 'room', label: 'Room/pod only' },
  { value: 'fnb', label: 'F&B only' },
  { value: 'service', label: 'Services only' },
];

export default function TaxesPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [taxes, setTaxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  async function load() {
    setLoading(true);
    const res = await pmsApi.getTaxes();
    setLoading(false);
    if (!res.data) {
      setError(res.error || 'Failed to load taxes');
      return;
    }
    setTaxes(res.data.taxes || []);
  }
  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Taxes</h1>
          <p className="text-sm text-slate-500">Configure GST, service charge, cess for your property.</p>
        </div>
        <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add tax
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {taxes.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No tax rates configured yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold text-right">Rate</th>
                <th className="px-5 py-3 font-semibold">Applies to</th>
                <th className="px-5 py-3 font-semibold">HSN</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {taxes.map((t: any) => (
                <tr key={t.id}>
                  <td className="px-5 py-3 font-medium text-slate-800">{t.name}</td>
                  <td className="px-5 py-3 uppercase text-slate-600">{t.kind}</td>
                  <td className="px-5 py-3 text-right font-mono">{Number(t.percent).toFixed(2)}%</td>
                  <td className="px-5 py-3 capitalize text-slate-600">{t.appliesTo}</td>
                  <td className="px-5 py-3 text-slate-500 font-mono">{t.hsnCode || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      'text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded',
                      t.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    )}>
                      {t.isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {show && <AddTaxModal onClose={() => setShow(false)} onSaved={() => { setShow(false); load(); }} />}
    </div>
  );
}

function AddTaxModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('gst');
  const [percent, setPercent] = useState(12);
  const [appliesTo, setAppliesTo] = useState('all');
  const [hsnCode, setHsnCode] = useState('');
  const [isInclusive, setIsInclusive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!name.trim()) { setError('Name required'); return; }
    setBusy(true);
    const res = await pmsApi.addTax({ name: name.trim(), kind, percent, appliesTo, hsnCode: hsnCode || undefined, isInclusive });
    setBusy(false);
    if (!res.data?.success) { setError(res.error || 'Save failed'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Add tax</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="space-y-3">
          <Lbl label="Name *">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="GST Rooms 18%" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
          <div className="grid grid-cols-2 gap-3">
            <Lbl label="Type">
              <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2">
                {TAX_KIND.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </Lbl>
            <Lbl label="Rate (%)">
              <input type="number" step="0.01" value={percent} onChange={(e) => setPercent(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
            </Lbl>
          </div>
          <Lbl label="Applies to">
            <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2">
              {APPLIES_TO.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </Lbl>
          <Lbl label="HSN/SAC code (optional)">
            <input value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} placeholder="996311" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono" />
          </Lbl>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isInclusive} onChange={(e) => setIsInclusive(e.target.checked)} /> Rate is inclusive (price already includes tax)
          </label>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        <button onClick={save} disabled={busy} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add tax
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
