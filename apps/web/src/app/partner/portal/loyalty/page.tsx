'use client';

import { useEffect, useState } from 'react';
import { Loader2, Gift, Save, Users2 } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { pmsQlo2Api, type LoyaltyProgram, type LoyaltyMember } from '../_lib/pms-api-qlo2';

export default function LoyaltyPage() {
  return <PortalShell><Body /></PortalShell>;
}

function Body() {
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  async function load() {
    setLoading(true);
    const [pr, mr] = await Promise.all([pmsQlo2Api.getProgram(), pmsQlo2Api.listMembers()]);
    setLoading(false);
    if (pr.data?.program) setProgram(pr.data.program);
    if (mr.data?.members) setMembers(mr.data.members);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!program) return;
    setSaving(true);
    await pmsQlo2Api.updateProgram({
      name: program.name,
      earnRate: Number(program.earn_rate),
      redeemValue: Number(program.redeem_value),
      minRedeem: program.min_redeem,
      status: program.status,
    });
    setSaving(false); setSavedMsg('Saved'); setTimeout(() => setSavedMsg(''), 2000);
  }

  if (loading || !program) return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Gift className="w-5 h-5 text-primary-600" /> Loyalty program</h1>
        <p className="text-sm text-slate-500">Reward repeat guests with points they can redeem on future stays.</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Program settings</h2>
          {savedMsg && <span className="text-xs text-emerald-700">{savedMsg}</span>}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Program name" value={program.name} onChange={(v) => setProgram({ ...program, name: v })} />
          <Field label="Status" value={program.status} onChange={(v) => setProgram({ ...program, status: v })} />
          <Field label="Earn rate (points per ₹100)" value={String(program.earn_rate)} onChange={(v) => setProgram({ ...program, earn_rate: v })} type="number" />
          <Field label="Redeem value (₹ per point)" value={String(program.redeem_value)} onChange={(v) => setProgram({ ...program, redeem_value: v })} type="number" />
          <Field label="Min redeem (points)" value={String(program.min_redeem)} onChange={(v) => setProgram({ ...program, min_redeem: Number(v) || 0 })} type="number" />
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Users2 className="w-4 h-4" /> Members ({members.length})</h2>
        </div>
        {members.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">No members yet. Guests join automatically on first booking once the program is active.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">Lifetime earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{[m.first_name, m.last_name].filter(Boolean).join(' ') || '—'}<div className="text-xs text-slate-500">{m.email || m.phone}</div></td>
                  <td className="px-4 py-3"><span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">{m.tier}</span></td>
                  <td className="px-4 py-3 text-right font-bold">{m.points.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{m.lifetime_earned.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    </label>
  );
}
