'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Key, Copy, X, AlertTriangle } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApiExt } from '../_lib/pms-api-ext';
import { cn } from '@/lib/utils';

export default function ApiKeysPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await pmsApiExt.listApiKeys();
    setLoading(false);
    if (!res.data) { setError(res.error || 'Failed'); return; }
    setKeys(res.data.keys || []);
  }
  useEffect(() => { load(); }, []);

  async function revoke(id: string) {
    if (!confirm('Revoke this key? OTA partners will lose access.')) return;
    await pmsApiExt.revokeApiKey(id);
    await load();
  }

  if (loading && keys.length === 0) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">OTA API keys</h1>
          <p className="text-sm text-slate-500">Issue API keys to Yatra / MMT / Goibibo / etc. so they can sync inventory and bookings.</p>
        </div>
        <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Issue key
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Public API base: <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded">https://api.naploo.com/api/v1/ota/v1</code></p>
            <p className="mt-1">Endpoints: <code className="text-xs">GET /property</code> · <code className="text-xs">GET /inventory</code> · <code className="text-xs">GET /availability?from=&to=</code> · <code className="text-xs">GET /rates</code> · <code className="text-xs">POST /bookings</code>. Pass key in <code className="text-xs">X-Naploo-Api-Key</code> header.</p>
          </div>
        </div>
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {keys.length === 0 ? (
          <div className="p-10 text-center">
            <Key className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No keys issued yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Prefix</th>
                <th className="px-5 py-3 font-semibold">Scopes</th>
                <th className="px-5 py-3 font-semibold">Last used</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keys.map((k: any) => (
                <tr key={k.id}>
                  <td className="px-5 py-3 font-medium text-slate-800">{k.name}</td>
                  <td className="px-5 py-3 font-mono text-xs">{k.key_prefix}...</td>
                  <td className="px-5 py-3 text-xs">
                    {(Array.isArray(k.scopes) ? k.scopes : []).map((s: string) => (
                      <span key={s} className="text-[10px] uppercase bg-slate-100 px-1.5 py-0.5 rounded mr-1">{s}</span>
                    ))}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{k.last_used_at ? new Date(k.last_used_at).toLocaleString('en-IN') : 'Never'}</td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      'text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded',
                      k.status === 'active' && 'bg-emerald-50 text-emerald-700',
                      k.status === 'revoked' && 'bg-red-50 text-red-700',
                      k.status === 'suspended' && 'bg-amber-50 text-amber-700'
                    )}>{k.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {k.status === 'active' && (
                      <button onClick={() => revoke(k.id)} className="text-xs text-red-600 hover:underline">Revoke</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {show && <IssueKeyModal onClose={() => setShow(false)} onIssued={(key) => { setNewKey(key); setShow(false); load(); }} />}
      {newKey && <ShowKeyModal apiKey={newKey} onClose={() => setNewKey(null)} />}
    </div>
  );
}

function IssueKeyModal({ onClose, onIssued }: { onClose: () => void; onIssued: (key: string) => void }) {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(['read']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!name.trim()) { setError('Name required'); return; }
    setBusy(true);
    const res = await pmsApiExt.createApiKey({ name: name.trim(), scopes });
    setBusy(false);
    if (!res.data?.api_key) { setError(res.error || 'Failed'); return; }
    onIssued(res.data.api_key);
  }

  return (
    <Modal title="Issue API key" onClose={onClose}>
      <Lbl label="Name (e.g. Yatra, MMT, Internal)">
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
      </Lbl>
      <div className="mt-3">
        <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Scopes</span>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={scopes.includes('read')} onChange={(e) => setScopes((s) => e.target.checked ? [...s, 'read'] : s.filter((x) => x !== 'read'))} />
            <span><b>read</b> — view property, inventory, availability, rates</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={scopes.includes('write')} onChange={(e) => setScopes((s) => e.target.checked ? [...s, 'write'] : s.filter((x) => x !== 'write'))} />
            <span><b>write</b> — create bookings</span>
          </label>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <button onClick={save} disabled={busy} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Issue key
      </button>
    </Modal>
  );
}

function ShowKeyModal({ apiKey, onClose }: { apiKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl p-3 mb-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p><b>Save this key now.</b> For security, the full key cannot be shown again. Only the prefix will be visible after closing this modal.</p>
        </div>
        <div className="bg-slate-900 text-emerald-400 font-mono text-sm p-3 rounded-lg break-all select-all">
          {apiKey}
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="w-full mt-3 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold"
        >
          <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
        <button onClick={onClose} className="w-full mt-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold">
          I've saved it — close
        </button>
      </div>
    </div>
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
