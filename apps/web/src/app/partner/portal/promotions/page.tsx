'use client';

import { useEffect, useState } from 'react';
import { Loader2, Tag, Plus, X, Pencil, Trash2 } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { pmsQloApi, type Promotion } from '../_lib/pms-api-qlo';
import { cn } from '@/lib/utils';

export default function PromotionsPage() {
  return <PortalShell><Body /></PortalShell>;
}

function Body() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);
    const r = await pmsQloApi.listPromotions();
    setLoading(false);
    if (r.data?.promotions) setPromos(r.data.promotions);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Promotions & coupons</h1>
          <p className="text-sm text-slate-500">Create discount codes that apply at your property only.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New promo
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : promos.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No promotions yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promos.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900">{p.code}</td>
                  <td className="px-4 py-3 text-slate-700">{p.name}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {p.kind === 'percent' ? `${Number(p.value)}%` : `₹${Number(p.value).toLocaleString('en-IN')}`}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.uses ?? 0}{p.max_uses ? ` / ${p.max_uses}` : ''}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-block px-2 py-0.5 text-[10px] uppercase font-semibold rounded',
                      p.status === 'active' && 'bg-emerald-50 text-emerald-700',
                      p.status === 'paused' && 'bg-amber-50 text-amber-700',
                      p.status === 'expired' && 'bg-slate-100 text-slate-500',
                    )}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={async () => {
                      await pmsQloApi.updatePromotion(p.id, { status: p.status === 'active' ? 'paused' : 'active' });
                      load();
                    }} className="text-xs text-slate-500 hover:text-slate-700 mr-3">{p.status === 'active' ? 'Pause' : 'Resume'}</button>
                    <button onClick={async () => {
                      if (confirm(`Delete promo ${p.code}?`)) {
                        await pmsQloApi.deletePromotion(p.id); load();
                      }
                    }} className="text-xs text-red-600 hover:text-red-700"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <PromoModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
    </div>
  );
}

function PromoModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'percent' | 'flat'>('percent');
  const [value, setValue] = useState(10);
  const [minAmount, setMinAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!code || !name) { setError('Code and name required'); return; }
    setBusy(true);
    const r = await pmsQloApi.createPromotion({ code: code.toUpperCase().trim(), name, kind, value, minAmount });
    setBusy(false);
    if (!r.data?.success) { setError(r.error || 'Failed'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">New promotion</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="space-y-3">
          <Input label="Code" value={code} onChange={(v) => setCode(v.toUpperCase())} placeholder="SUMMER25" />
          <Input label="Name" value={name} onChange={setName} placeholder="Summer 25% off" />
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Kind</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setKind('percent')} className={cn('p-2 rounded-lg text-sm border', kind === 'percent' ? 'border-primary-500 bg-primary-50' : 'border-gray-200')}>Percent</button>
              <button onClick={() => setKind('flat')} className={cn('p-2 rounded-lg text-sm border', kind === 'flat' ? 'border-primary-500 bg-primary-50' : 'border-gray-200')}>Flat ₹</button>
            </div>
          </div>
          <Input label={`Value ${kind === 'percent' ? '(%)' : '(₹)'}`} value={String(value)} onChange={(v) => setValue(Number(v) || 0)} type="number" />
          <Input label="Min order amount (₹)" value={String(minAmount)} onChange={(v) => setMinAmount(Number(v) || 0)} type="number" />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
          {busy ? 'Saving…' : 'Create promo'}
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    </label>
  );
}
