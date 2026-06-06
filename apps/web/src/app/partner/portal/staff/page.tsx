'use client';

import { useEffect, useState } from 'react';
import { Loader2, UserPlus, Users2, X } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApi } from '../_lib/pms-api';
import { cn } from '@/lib/utils';

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner', desc: 'Full access, can edit settings and invite staff' },
  { value: 'manager', label: 'Manager', desc: 'Inventory + bookings + folio, no payouts or invites' },
  { value: 'front_desk', label: 'Front-desk', desc: 'Walk-in + check-in/out + folio actions only' },
];

export default function StaffPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  async function load() {
    setLoading(true);
    const res = await pmsApi.getStaff();
    setLoading(false);
    if (!res.data) {
      setError(res.error || 'Failed to load staff');
      return;
    }
    setStaff(res.data.staff || []);
  }
  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff</h1>
          <p className="text-sm text-slate-500">Manage who can access this hotel's PMS and what they can do.</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          <UserPlus className="w-4 h-4" /> Invite staff
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {staff.length === 0 ? (
          <div className="p-10 text-center">
            <Users2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No staff yet — invite your team to start.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((s: any) => (
                <StaffRow key={s.id} s={s} onChange={load} />
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSaved={() => { setShowInvite(false); load(); }} />}
    </div>
  );
}

function StaffRow({ s, onChange }: { s: any; onChange: () => void }) {
  const [busy, setBusy] = useState(false);

  async function updateRole(role: string) {
    setBusy(true);
    await pmsApi.updateStaff(s.id, { role });
    setBusy(false);
    onChange();
  }
  async function setStatus(status: string) {
    setBusy(true);
    await pmsApi.updateStaff(s.id, { status });
    setBusy(false);
    onChange();
  }

  const name = [s.firstName, s.lastName].filter(Boolean).join(' ') || '—';
  return (
    <tr>
      <td className="px-5 py-3 font-medium text-slate-800">{name}</td>
      <td className="px-5 py-3 text-slate-600">{s.phone}</td>
      <td className="px-5 py-3">
        <select
          value={s.role}
          disabled={busy || s.role === 'owner'}
          onChange={(e) => updateRole(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 disabled:opacity-50"
        >
          {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </td>
      <td className="px-5 py-3">
        <span className={cn(
          'text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded',
          s.status === 'active' && 'bg-emerald-50 text-emerald-700',
          s.status === 'suspended' && 'bg-amber-50 text-amber-700',
          s.status === 'removed' && 'bg-red-50 text-red-700',
        )}>
          {s.status}
        </span>
      </td>
      <td className="px-5 py-3 text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
      <td className="px-5 py-3 text-right">
        {s.role !== 'owner' && s.status === 'active' && (
          <button onClick={() => setStatus('suspended')} disabled={busy} className="text-xs text-red-600 hover:underline">Suspend</button>
        )}
        {s.role !== 'owner' && s.status === 'suspended' && (
          <button onClick={() => setStatus('active')} disabled={busy} className="text-xs text-emerald-700 hover:underline">Reactivate</button>
        )}
      </td>
    </tr>
  );
}

function InviteModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'manager' | 'front_desk'>('front_desk');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!phone.trim() || !name.trim()) {
      setError('Phone and name are required.');
      return;
    }
    setBusy(true);
    const res = await pmsApi.inviteStaff({ phone: phone.trim(), name: name.trim(), email: email.trim() || undefined, role });
    setBusy(false);
    if (!res.data?.success) {
      setError(res.data?.message || res.error || 'Invite failed');
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Invite staff</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="space-y-3">
          <Lbl label="Phone *">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
          <Lbl label="Full name *">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
          <Lbl label="Email (optional)">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
          <Lbl label="Role">
            <div className="space-y-2">
              {ROLE_OPTIONS.filter((r) => r.value !== 'owner').map((r) => (
                <label key={r.value} className={cn(
                  'flex items-start gap-2 p-3 rounded-xl border cursor-pointer',
                  role === r.value ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200'
                )}>
                  <input type="radio" checked={role === r.value} onChange={() => setRole(r.value as any)} className="mt-1" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{r.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </Lbl>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        <button onClick={save} disabled={busy} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Add staff
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-2">
          Staff will receive OTP login on this phone number.
        </p>
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
