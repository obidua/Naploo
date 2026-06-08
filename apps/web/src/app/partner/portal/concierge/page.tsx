'use client';

import { useEffect, useState } from 'react';
import { Loader2, ConciergeBell, Plus, X, Clock, Check } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { pmsQlo2Api, type ConciergeRequest } from '../_lib/pms-api-qlo2';
import { cn } from '@/lib/utils';

const KINDS = [
  { key: 'airport_pickup', label: 'Airport pickup' },
  { key: 'taxi', label: 'Taxi / car rental' },
  { key: 'tour', label: 'City tour' },
  { key: 'restaurant_reservation', label: 'Restaurant reservation' },
  { key: 'spa_booking', label: 'Spa booking' },
  { key: 'wakeup_call', label: 'Wake-up call' },
  { key: 'other', label: 'Other' },
];

export default function ConciergePage() {
  return <PortalShell><Body /></PortalShell>;
}

function Body() {
  const [requests, setRequests] = useState<ConciergeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  async function load() {
    setLoading(true);
    const r = await pmsQlo2Api.listConcierge();
    setLoading(false);
    if (r.data?.requests) setRequests(r.data.requests);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    await pmsQlo2Api.updateConcierge(id, { status });
    load();
  }

  const byStatus = {
    pending: requests.filter((r) => r.status === 'pending'),
    in_progress: requests.filter((r) => r.status === 'in_progress'),
    completed: requests.filter((r) => r.status === 'completed' || r.status === 'cancelled'),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><ConciergeBell className="w-5 h-5 text-primary-600" /> Concierge</h1>
          <p className="text-sm text-slate-500">Guest requests: pickups, tours, reservations.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New request
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-3">
          <Column title="Pending" items={byStatus.pending} color="amber" onAdvance={(id) => setStatus(id, 'in_progress')} advanceLabel="Start" />
          <Column title="In progress" items={byStatus.in_progress} color="blue" onAdvance={(id) => setStatus(id, 'completed')} advanceLabel="Mark done" />
          <Column title="Completed" items={byStatus.completed} color="emerald" />
        </div>
      )}

      {showNew && <NewModal onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }} />}
    </div>
  );
}

function Column({ title, items, color, onAdvance, advanceLabel }: { title: string; items: ConciergeRequest[]; color: string; onAdvance?: (id: string) => void; advanceLabel?: string }) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className={`px-4 py-2 text-xs uppercase tracking-wide font-semibold bg-${color}-50 text-${color}-700 border-b border-gray-100`}>
        {title} ({items.length})
      </div>
      <ul className="divide-y divide-gray-100">
        {items.length === 0 ? (
          <li className="p-8 text-center text-xs text-slate-400">No requests</li>
        ) : items.map((r) => (
          <li key={r.id} className="p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{KINDS.find(k => k.key === r.kind)?.label || r.kind}</div>
            <div className="font-semibold text-slate-900 text-sm mt-0.5">{r.title}</div>
            {r.details && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{r.details}</p>}
            {r.scheduled_at && <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(r.scheduled_at).toLocaleString()}</div>}
            {([r.first_name, r.last_name].filter(Boolean).join(' ') || r.phone) && <div className="text-xs text-slate-500 mt-0.5">Guest: {[r.first_name, r.last_name].filter(Boolean).join(' ') || r.phone}</div>}
            {Number(r.price) > 0 && <div className="text-xs font-bold text-emerald-700 mt-1">₹{Number(r.price).toLocaleString('en-IN')}</div>}
            {onAdvance && <button onClick={() => onAdvance(r.id)} className="text-xs font-semibold text-primary-700 hover:underline mt-2"><Check className="w-3 h-3 inline" /> {advanceLabel}</button>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function NewModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [kind, setKind] = useState(KINDS[0].key);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [price, setPrice] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!title) { setError('Title required'); return; }
    setBusy(true);
    const r = await pmsQlo2Api.createConcierge({ kind, title, details, scheduledAt: scheduledAt || undefined, price });
    setBusy(false);
    if (!r.data?.success) { setError(r.error || 'Failed'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">New concierge request</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Kind</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
            </select>
          </label>
          <Field label="Title" value={title} onChange={setTitle} placeholder="Pick up from BLR airport" />
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Details (optional)</span>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </label>
          <Field label="Scheduled at (optional)" value={scheduledAt} onChange={setScheduledAt} type="datetime-local" />
          <Field label="Price (₹, optional)" value={String(price)} onChange={(v) => setPrice(Number(v) || 0)} type="number" />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
          {busy ? 'Creating…' : 'Create request'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    </label>
  );
}
