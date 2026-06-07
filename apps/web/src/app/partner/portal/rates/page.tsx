'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, X, BarChart3, Edit3 } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApiExt, type RatePlan } from '../_lib/pms-api-ext';
import { cn } from '@/lib/utils';

const PLAN_KINDS = [
  { value: 'standard', label: 'Standard' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'ota', label: 'OTA' },
  { value: 'long_stay', label: 'Long stay' },
  { value: 'group', label: 'Group' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RatesPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [plans, setPlans] = useState<RatePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  async function load() {
    setLoading(true);
    const res = await pmsApiExt.listRatePlans();
    setLoading(false);
    if (!res.data) {
      setError(res.error || 'Failed to load');
      return;
    }
    setPlans(res.data.plans || []);
  }
  useEffect(() => { load(); }, []);

  async function toggleActive(p: RatePlan) {
    await pmsApiExt.updateRatePlan(p.id, { isActive: !p.isActive });
    await load();
  }

  if (loading && plans.length === 0) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Rate plans</h1>
          <p className="text-sm text-slate-500">Standard, corporate, weekend pricing. Multipliers + restrictions.</p>
        </div>
        <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add plan
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {plans.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No rate plans yet. The default daily rate from inventory is used.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map((p) => (
            <article key={p.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 uppercase mt-1">{p.kind.replace('_', ' ')}</p>
                </div>
                <span className={cn(
                  'text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded',
                  p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                )}>{p.isActive ? 'active' : 'inactive'}</span>
              </div>
              <div className="mt-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Multiplier</span><span className="font-mono font-semibold">×{Number(p.baseMultiplier).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Min nights</span><span>{p.minNights ?? 1}</span></div>
                {p.maxNights && <div className="flex justify-between"><span className="text-slate-500">Max nights</span><span>{p.maxNights}</span></div>}
                {p.validFrom && <div className="flex justify-between"><span className="text-slate-500">Valid</span><span className="text-xs">{p.validFrom} → {p.validTo || '∞'}</span></div>}
                {Array.isArray(p.blockCheckInDays) && p.blockCheckInDays.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-slate-500">No check-in on:</span>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {(p.blockCheckInDays as number[]).map((d) => (
                        <span key={d} className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded">{DAYS[d]}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => toggleActive(p)} className="text-xs text-primary-600 hover:underline">
                  {p.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {show && <AddRatePlanModal onClose={() => setShow(false)} onSaved={() => { setShow(false); load(); }} />}
    </div>
  );
}

function AddRatePlanModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('standard');
  const [multiplier, setMultiplier] = useState(1.0);
  const [minNights, setMinNights] = useState(1);
  const [maxNights, setMaxNights] = useState<number | ''>('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [blockedDays, setBlockedDays] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!name.trim()) { setError('Name required'); return; }
    setBusy(true);
    const res = await pmsApiExt.createRatePlan({
      name: name.trim(), kind, baseMultiplier: multiplier,
      minNights, maxNights: maxNights || undefined,
      validFrom: validFrom || undefined,
      validTo: validTo || undefined,
      blockCheckInDays: blockedDays.length > 0 ? blockedDays : undefined,
    });
    setBusy(false);
    if (!res.data?.success) { setError(res.error || 'Save failed'); return; }
    onSaved();
  }

  return (
    <Modal title="Add rate plan" onClose={onClose}>
      <div className="space-y-3">
        <Lbl label="Name *">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Corporate Q4 rate" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
        </Lbl>
        <div className="grid grid-cols-2 gap-3">
          <Lbl label="Type">
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2">
              {PLAN_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </Lbl>
          <Lbl label="Multiplier ×">
            <input type="number" step="0.01" value={multiplier} onChange={(e) => setMultiplier(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Lbl label="Min nights">
            <input type="number" min={1} value={minNights} onChange={(e) => setMinNights(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
          <Lbl label="Max nights (optional)">
            <input type="number" min={1} value={maxNights} onChange={(e) => setMaxNights(e.target.value === '' ? '' : Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Lbl label="Valid from">
            <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
          <Lbl label="Valid to">
            <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
        </div>
        <div>
          <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Block check-in on</span>
          <div className="flex gap-1 flex-wrap">
            {DAYS.map((d, i) => (
              <button key={i} type="button" onClick={() => setBlockedDays((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i])} className={cn(
                'px-3 py-1.5 rounded-lg text-xs border',
                blockedDays.includes(i) ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-slate-600 border-gray-200'
              )}>{d}</button>
            ))}
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <button onClick={save} disabled={busy} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save plan
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
