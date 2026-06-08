'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users2, Plus, X, Pencil, Search } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { erpApi, fmtINR, type Employee } from '../_lib/erp-api';
import { cn } from '@/lib/utils';

const DEPARTMENTS = ['front_office', 'housekeeping', 'kitchen', 'fnb', 'security', 'accounts', 'maintenance', 'management', 'other'];

export default function EmployeesPage() { return <PortalShell><Body /></PortalShell>; }

function Body() {
  const [emps, setEmps] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [edit, setEdit] = useState<Employee | null>(null);

  async function load() {
    setLoading(true);
    const r = await erpApi.listEmployees();
    setLoading(false);
    if (r.data?.employees) setEmps(r.data.employees);
  }
  useEffect(() => { load(); }, []);

  const filtered = emps.filter((e) => {
    if (!q) return true;
    const b = `${e.full_name} ${e.emp_code || ''} ${e.designation || ''} ${e.department || ''} ${e.phone || ''}`.toLowerCase();
    return b.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Users2 className="w-5 h-5 text-primary-600" /> Employees</h1>
          <p className="text-sm text-slate-500">{emps.length} total · {emps.filter(e => e.status === 'active').length} active</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add employee
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, code, designation…" className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Users2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No employees yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-4 py-3">Employee</th><th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Department</th><th className="px-4 py-3 text-right">Gross/month</th>
                <th className="px-4 py-3 text-right">Present</th><th className="px-4 py-3">Status</th><th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{e.full_name}</div>
                    <div className="text-xs text-slate-500">{e.emp_code ? `${e.emp_code} · ` : ''}{e.phone || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.designation || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{(e.department || '—').replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-right font-semibold">{e.current_gross ? fmtINR(e.current_gross) : '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{e.days_present_this_month ?? 0}</td>
                  <td className="px-4 py-3"><span className={cn('text-[10px] uppercase font-bold px-2 py-0.5 rounded', e.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>{e.status}</span></td>
                  <td className="px-4 py-3 text-right"><button onClick={() => setEdit(e)} className="text-slate-400 hover:text-primary-600"><Pencil className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showNew || edit) && <EmpModal initial={edit} onClose={() => { setShowNew(false); setEdit(null); }} onSaved={() => { setShowNew(false); setEdit(null); load(); }} />}
    </div>
  );
}

function EmpModal({ initial, onClose, onSaved }: { initial: Employee | null; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState(initial?.full_name || '');
  const [empCode, setEmpCode] = useState(initial?.emp_code || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [designation, setDesignation] = useState(initial?.designation || '');
  const [department, setDepartment] = useState(initial?.department || 'front_office');
  const [joinedAt, setJoinedAt] = useState(initial?.joined_at || new Date().toISOString().slice(0, 10));
  const [employmentType, setEmploymentType] = useState(initial?.employment_type || 'full_time');
  const [status, setStatus] = useState(initial?.status || 'active');
  const [bankAccount, setBankAccount] = useState(initial?.bank_account || '');
  const [bankIfsc, setBankIfsc] = useState(initial?.bank_ifsc || '');
  const [upi, setUpi] = useState(initial?.upi || '');
  const [emergencyName, setEmergencyName] = useState(initial?.emergency_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(initial?.emergency_phone || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!fullName) { setError('Name required'); return; }
    setBusy(true);
    const payload = { fullName, empCode, phone, email, designation, department, joinedAt, employmentType, status, bankAccount, bankIfsc, upi, emergencyName, emergencyPhone };
    const r = initial ? await erpApi.updateEmployee(initial.id, payload) : await erpApi.createEmployee(payload);
    setBusy(false);
    if (!(r.data as any)) { setError(r.error || 'Failed'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">{initial ? 'Edit employee' : 'New employee'}</h3><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Full name *" value={fullName} onChange={setFullName} />
          <Field label="Employee code" value={empCode} onChange={setEmpCode} placeholder="EMP-001" />
          <Field label="Phone" value={phone} onChange={setPhone} />
          <Field label="Email" value={email} onChange={setEmail} />
          <Field label="Designation" value={designation} onChange={setDesignation} placeholder="Receptionist" />
          <SelField label="Department" value={department} onChange={setDepartment} options={DEPARTMENTS.map(d => ({ value: d, label: d.replace('_', ' ') }))} />
          <Field label="Joined at" value={joinedAt} onChange={setJoinedAt} type="date" />
          <SelField label="Employment type" value={employmentType} onChange={setEmploymentType} options={[
            { value: 'full_time', label: 'Full time' },
            { value: 'part_time', label: 'Part time' },
            { value: 'contract', label: 'Contract' },
            { value: 'intern', label: 'Intern' },
          ]} />
          {initial && <SelField label="Status" value={status} onChange={setStatus} options={[
            { value: 'active', label: 'Active' },
            { value: 'on_leave', label: 'On leave' },
            { value: 'terminated', label: 'Terminated' },
          ]} />}
          <Field label="Bank account" value={bankAccount} onChange={setBankAccount} />
          <Field label="Bank IFSC" value={bankIfsc} onChange={setBankIfsc} />
          <Field label="UPI" value={upi} onChange={setUpi} />
          <Field label="Emergency name" value={emergencyName} onChange={setEmergencyName} />
          <Field label="Emergency phone" value={emergencyPhone} onChange={setEmergencyPhone} />
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">{busy ? 'Saving…' : 'Save'}</button>
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
function SelField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm capitalize">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
