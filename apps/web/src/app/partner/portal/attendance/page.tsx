'use client';

import { useEffect, useState } from 'react';
import { Loader2, ClipboardCheck, Calendar as CalIcon, Check, X as XIcon } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { erpApi, type Employee, type AttendanceLog } from '../_lib/erp-api';
import { cn } from '@/lib/utils';

const STATUSES = ['present', 'absent', 'half_day', 'paid_leave', 'unpaid_leave', 'holiday', 'week_off'];

export default function AttendancePage() { return <PortalShell><Body /></PortalShell>; }

function Body() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<Record<string, AttendanceLog>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [er, ar] = await Promise.all([erpApi.listEmployees('active'), erpApi.getAttendance(date)]);
    if (er.data?.employees) setEmployees(er.data.employees);
    const map: Record<string, AttendanceLog> = {};
    if (ar.data?.attendance) for (const l of ar.data.attendance) map[l.employee_id] = l;
    setLogs(map);
    setLoading(false);
  }
  useEffect(() => { load(); }, [date]);

  async function mark(employeeId: string, status: string) {
    const existing = logs[employeeId];
    await erpApi.recordAttendance({
      employeeId, date, status,
      checkInAt: status === 'present' || status === 'half_day' ? (existing?.check_in_at || new Date().toISOString()) : undefined,
    });
    load();
  }

  const counts = { present: 0, absent: 0, half_day: 0, on_leave: 0 };
  for (const e of employees) {
    const l = logs[e.id];
    if (!l) { counts.absent++; continue; }
    if (l.status === 'present') counts.present++;
    else if (l.status === 'half_day') counts.half_day++;
    else if (l.status.includes('leave')) counts.on_leave++;
    else if (l.status === 'absent') counts.absent++;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-primary-600" /> Attendance</h1>
          <p className="text-sm text-slate-500">Daily attendance for active employees.</p>
        </div>
        <div className="flex items-center gap-2">
          <CalIcon className="w-4 h-4 text-slate-500" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Kpi label="Present" value={counts.present} color="emerald" />
        <Kpi label="Half day" value={counts.half_day} color="amber" />
        <Kpi label="On leave" value={counts.on_leave} color="blue" />
        <Kpi label="Absent" value={counts.absent} color="red" />
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left"><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Designation</th><th className="px-4 py-3 text-center">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((e) => {
                const l = logs[e.id];
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{e.full_name}</div>
                      <div className="text-xs text-slate-500">{e.emp_code}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{e.designation || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center flex-wrap gap-1">
                        {STATUSES.map((s) => (
                          <button key={s} onClick={() => mark(e.id, s)} className={cn(
                            'px-2 py-1 rounded text-[10px] uppercase font-bold border transition',
                            l?.status === s
                              ? s === 'present' || s === 'half_day' ? 'bg-emerald-600 border-emerald-600 text-white'
                                : s === 'absent' ? 'bg-red-600 border-red-600 text-white'
                                : 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-200 text-slate-500 hover:border-slate-300'
                          )}>{s.replace('_', ' ')}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-3`}>
      <div className={`text-[10px] uppercase tracking-wide text-${color}-700 font-semibold`}>{label}</div>
      <div className={`text-2xl font-bold text-${color}-900 mt-1`}>{value}</div>
    </div>
  );
}
