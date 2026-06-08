'use client';

// Admin: departments + employees (Naploo internal team).
// Lives at /admin/team — separate from partner staff.
import { useEffect, useState } from 'react';
import { Loader2, Building, Users, Plus, X, Save } from 'lucide-react';
import { api } from '@/lib/api';

interface Department { id: string; name: string; description?: string; member_count: string; head_first?: string; head_last?: string }
interface Employee { id: string; user_id: string; department_id?: string; department_name?: string; job_title?: string; role_in_dept: string; status: string; first_name?: string; last_name?: string; email?: string; phone?: string; user_role?: string }

export default function AdminTeamPage() {
  const [tab, setTab] = useState<'departments' | 'employees'>('employees');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDept, setShowDept] = useState(false);
  const [showEmp, setShowEmp] = useState(false);

  async function load() {
    setLoading(true);
    const [d, e] = await Promise.all([
      api.get<{ departments: Department[] }>('/api/v1/admin/departments'),
      api.get<{ employees: Employee[] }>('/api/v1/admin/employees'),
    ]);
    setLoading(false);
    if (d.data?.departments) setDepartments(d.data.departments);
    if (e.data?.employees) setEmployees(e.data.employees);
  }
  useEffect(() => { load(); }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 pt-24 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Users className="w-6 h-6 text-violet-600" /> Naploo team</h1>
          <p className="text-sm text-slate-500">Internal staff + department hierarchy. Separate from partner staff.</p>
        </div>
        <button onClick={() => tab === 'departments' ? setShowDept(true) : setShowEmp(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold">
          <Plus className="w-4 h-4" /> {tab === 'departments' ? 'New department' : 'Add employee'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-100 text-sm font-medium">
          <button onClick={() => setTab('employees')} className={`px-5 py-3 ${tab === 'employees' ? 'border-b-2 border-violet-500 text-violet-700' : 'text-slate-500'}`}>Employees ({employees.length})</button>
          <button onClick={() => setTab('departments')} className={`px-5 py-3 ${tab === 'departments' ? 'border-b-2 border-violet-500 text-violet-700' : 'text-slate-500'}`}>Departments ({departments.length})</button>
        </div>

        {loading ? <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-violet-600 mx-auto" /></div> :
         tab === 'employees' ? (
          employees.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No employees yet. Add Naploo team members here.</div> :
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-4 py-3">Employee</th><th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Job title</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{[e.first_name, e.last_name].filter(Boolean).join(' ') || '—'}<div className="text-xs text-slate-500">{e.email || e.phone}</div></td>
                  <td className="px-4 py-3 text-slate-600">{e.department_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{e.job_title || '—'}</td>
                  <td className="px-4 py-3"><span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-700">{e.role_in_dept}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-emerald-700">{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          departments.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No departments yet. Create departments like &quot;Engineering&quot;, &quot;Customer Success&quot;, &quot;Partner Relations&quot;.</div> :
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {departments.map((d) => (
              <div key={d.id} className="border border-gray-200 rounded-xl p-4">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center mb-2"><Building className="w-5 h-5 text-violet-600" /></div>
                <h3 className="font-semibold text-slate-900">{d.name}</h3>
                {d.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description}</p>}
                <div className="text-xs text-slate-500 mt-2">{d.member_count} member{d.member_count === '1' ? '' : 's'}</div>
                {(d.head_first || d.head_last) && <div className="text-xs text-slate-700 mt-1">Head: {[d.head_first, d.head_last].filter(Boolean).join(' ')}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showDept && <DeptModal onClose={() => setShowDept(false)} onSaved={() => { setShowDept(false); load(); }} />}
      {showEmp && <EmpModal departments={departments} onClose={() => setShowEmp(false)} onSaved={() => { setShowEmp(false); load(); }} />}
    </main>
  );
}

function DeptModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!name) return;
    setBusy(true);
    await api.post('/api/v1/admin/departments', { name, description });
    setBusy(false); onSaved();
  }
  return <Modal title="New department" onClose={onClose}>
    <Field label="Name" value={name} onChange={setName} placeholder="Engineering" />
    <Field label="Description" value={description} onChange={setDescription} />
    <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold disabled:opacity-60">{busy ? 'Saving…' : 'Create'}</button>
  </Modal>;
}

function EmpModal({ departments, onClose, onSaved }: { departments: Department[]; onClose: () => void; onSaved: () => void }) {
  const [userId, setUserId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [roleInDept, setRoleInDept] = useState<'head' | 'manager' | 'member'>('member');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    if (!userId) { setError('User ID required'); return; }
    setBusy(true);
    const r = await api.post<{ success: boolean; message?: string }>('/api/v1/admin/employees', { userId, departmentId: departmentId || undefined, jobTitle, roleInDept });
    setBusy(false);
    if (!r.data?.success) { setError(r.data?.message || r.error || 'Failed'); return; }
    onSaved();
  }
  return <Modal title="Add employee" onClose={onClose}>
    <Field label="User ID (UUID)" value={userId} onChange={setUserId} placeholder="UUID from /admin/users" />
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Department</span>
      <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
        <option value="">— none —</option>
        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
    </label>
    <Field label="Job title" value={jobTitle} onChange={setJobTitle} placeholder="Senior engineer" />
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Role in dept</span>
      <select value={roleInDept} onChange={(e) => setRoleInDept(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
        <option value="member">Member</option>
        <option value="manager">Manager</option>
        <option value="head">Head</option>
      </select>
    </label>
    {error && <p className="text-xs text-red-600">{error}</p>}
    <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold disabled:opacity-60">{busy ? 'Adding…' : 'Add'}</button>
  </Modal>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl space-y-3">
        <div className="flex items-center justify-between mb-2"><h3 className="text-lg font-semibold text-slate-900">{title}</h3><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
    </label>
  );
}
