'use client';

// Multi-outlet page reuses /pms/outlets — manages multiple F&B/bar/spa outlets per property.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Store, Plus, X, ArrowRight, Utensils } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { pmsApi } from '../_lib/pms-api';

interface Outlet {
  id: string;
  name: string;
  kind?: string;
  active?: boolean;
}

export default function OutletsPage() {
  return <PortalShell><Body /></PortalShell>;
}

function Body() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  async function load() {
    setLoading(true);
    // pmsApi.listOutlets() already exists in qlo-parity
    try {
      const r = await fetch('/api/v1/pms/outlets', { credentials: 'include' });
      const j = await r.json();
      if (Array.isArray(j?.outlets)) setOutlets(j.outlets);
    } catch (e) {}
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Store className="w-5 h-5 text-primary-600" /> Multi-outlet</h1>
          <p className="text-sm text-slate-500">Multiple F&B / bar / spa points-of-sale at this property. Each has its own menu and charges to guest folio.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New outlet
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : outlets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 mb-3">No outlets yet.</p>
          <p className="text-xs text-slate-400">Create outlets like &quot;Main restaurant&quot;, &quot;Pool bar&quot;, &quot;Lobby cafe&quot; — each gets its own menu, POS, and folio-charge flow.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {outlets.map((o) => (
            <Link key={o.id} href={`/partner/portal/menu?outlet=${o.id}`} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-sm transition">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                <Utensils className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-slate-900">{o.name}</h3>
              <div className="text-xs text-slate-500 mt-1 capitalize">{o.kind || 'restaurant'}</div>
              <div className="mt-3 text-xs text-primary-700 font-semibold inline-flex items-center gap-1">Manage menu <ArrowRight className="w-3 h-3" /></div>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-900">
        Tip: Use F&B POS to take orders at each outlet — they all charge automatically to the right folio.
      </div>

      {showNew && <NewOutletModal onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }} />}
    </div>
  );
}

function NewOutletModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('restaurant');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name) return;
    setBusy(true);
    try {
      await fetch('/api/v1/pms/outlets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, kind }),
      });
    } catch (e) {}
    setBusy(false); onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-slate-900">New outlet</h3><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div className="space-y-3">
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Main restaurant" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Kind</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="restaurant">Restaurant</option>
              <option value="bar">Bar</option>
              <option value="cafe">Cafe / Lobby cafe</option>
              <option value="poolside">Pool / poolside</option>
              <option value="room_service">Room service</option>
            </select>
          </label>
        </div>
        <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">{busy ? 'Creating…' : 'Create'}</button>
      </div>
    </div>
  );
}
