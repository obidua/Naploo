'use client';

// Admin HQ employees — Naploo head-office staff (partner_id IS NULL).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, X, Users, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

interface HqEmployee {
  id: string; full_name: string; emp_code?: string; designation?: string; department?: string;
  phone?: string; email?: string; status: string; current_gross?: string;
  joined_at?: string; employment_type?: string;
}

export default function HqEmployeesPage() {
  const [list, setList] = useState<HqEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    const r = await api.get<{ employees: HqEmployee[] }>('/api/v1/admin/erp/hq-employees');
    setLoading(false);
    if (r.data?.employees) setList(r.data.employees);
  }
  useEffect(() => { load(); }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 pt-24 max-w-7xl mx-auto">
      <Link href="/admin/erp" className="inline-flex items-center gap-1 text-sm text-slate-500 mb-2 hover:text-slate-800"><ArrowLeft className="w-4 h-4" /> ERP rollup</Link>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Users className="w-6 h-6 text-violet-600" /> HQ employees</h1>
          <p className="text-sm text-slate-500">Naploo head-office team. Salary, attendance and payroll are managed here separately from partner staff.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold">
          <Plus className="w-4 h-4" /> Add employee
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-violet-600 mx-auto" /></div> :
          list.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No HQ employees yet. Add your first head-office team member.</div> :
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">Gross</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{e.full_name}<div className="text-xs text-slate-500">{e.emp_code || '—'}</div></td>
                  <td className="px-4 py-3 text-slate-600">{e.department || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{e.designation || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{e.phone || ''}<br/>{e.email || ''}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.current_gross ? `₹${Number(e.current_gross).toLocaleString('en-IN')}` : '—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs ${e.status === 'active' ? 'text-emerald-700' : 'text-slate-400'}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />}
    </main>
  );
}

function AddModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({ employmentType: 'full_time' });
  const [busy, setBusy] = useState(false);
  function set<K extends string>(k: K, v: any) { setForm((p: any) => ({ ...p, [k]: v })); }
  async function save() {
    if (!form.fullName) return;
    setBusy(true);
    const r = await api.post('/api/v1/admin/erp/hq-employees', form);
    setBusy(false);
    if ((r.data as any)?.success) onSaved();
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Add HQ employee</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <input placeholder="Full name *" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('fullName', e.target.value)} />
          <input placeholder="Employee code" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('empCode', e.target.value)} />
          <input placeholder="Designation" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('designation', e.target.value)} />
          <input placeholder="Department" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('department', e.target.value)} />
          <input placeholder="Phone" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('phone', e.target.value)} />
          <input placeholder="Email" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('email', e.target.value)} />
          <input type="date" placeholder="Joined" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('joinedAt', e.target.value)} />
          <select className="border border-gray-200 rounded-lg px-3 py-2" defaultValue="full_time" onChange={(e) => set('employmentType', e.target.value)}>
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>
          <input placeholder="PAN" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('pan', e.target.value)} />
          <input placeholder="Bank account" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('bankAccount', e.target.value)} />
          <input placeholder="IFSC" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('bankIfsc', e.target.value)} />
          <input placeholder="UPI" className="border border-gray-200 rounded-lg px-3 py-2" onChange={(e) => set('upi', e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">Cancel</button>
          <button onClick={save} disabled={busy} className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold">
            {busy ? 'Saving…' : 'Add employee'}
          </button>
        </div>
      </div>
    </div>
  );
}
