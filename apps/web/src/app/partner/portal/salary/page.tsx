'use client';

import { useEffect, useState } from 'react';
import { Loader2, IndianRupee, Plus, Check, FileText } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { erpApi, fmtINR, type SalaryPayment } from '../_lib/erp-api';
import { cn } from '@/lib/utils';

export default function SalaryPage() { return <PortalShell><Body /></PortalShell>; }

function thisMonth() {
  return new Date().toISOString().slice(0, 7);
}

function Body() {
  const [period, setPeriod] = useState(thisMonth());
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    const r = await erpApi.listSalaryPayments(period);
    setLoading(false);
    if (r.data?.payments) setPayments(r.data.payments);
  }
  useEffect(() => { load(); }, [period]);

  async function generate() {
    setBusy(true);
    const r = await erpApi.generateSalary(period);
    setBusy(false);
    if (r.data?.generated !== undefined) { setMsg(`Generated ${r.data.generated} pay records`); setTimeout(() => setMsg(''), 3000); load(); }
  }

  async function markPaid(p: SalaryPayment) {
    const mode = prompt('Payment mode (bank/upi/cash/cheque)?', 'bank') || 'bank';
    const ref = prompt('Payment reference / transaction id?', '') || '';
    await erpApi.markSalaryPaid(p.id, mode, ref);
    load();
  }

  async function openPayslip(p: SalaryPayment) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//api.${window.location.hostname}`;
    let token: string | null = null;
    try {
      const stored = localStorage.getItem('naploo-auth');
      if (stored) token = JSON.parse(stored)?.state?.token || null;
    } catch {}
    const res = await fetch(`${apiUrl}/api/v1/pms/employees/${(p as any).employee_id}/payslip/${p.pay_period}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) { alert('Could not open payslip'); return; }
    const html = await res.text();
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  }

  const totals = payments.reduce((acc, p) => ({
    gross: acc.gross + Number(p.gross),
    net: acc.net + Number(p.net_pay),
    pf: acc.pf + Number(p.pf_deducted),
    esi: acc.esi + Number(p.esi_deducted),
    paidCount: acc.paidCount + (p.status === 'paid' ? 1 : 0),
  }), { gross: 0, net: 0, pf: 0, esi: 0, paidCount: 0 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-primary-600" /> Salary & Payroll</h1>
          <p className="text-sm text-slate-500">{payments.length} payslips · {totals.paidCount} paid</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <button onClick={generate} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Generate for {period}
          </button>
        </div>
      </div>

      {msg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-2 text-center">{msg}</div>}

      <div className="grid grid-cols-4 gap-3">
        <Kpi label="Total gross" value={fmtINR(totals.gross)} />
        <Kpi label="Net paid" value={fmtINR(totals.net)} />
        <Kpi label="PF deducted" value={fmtINR(totals.pf)} />
        <Kpi label="ESI deducted" value={fmtINR(totals.esi)} />
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : payments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 mb-3">No payslips for {period}. Click &quot;Generate&quot; to compute pay based on attendance + salary structures.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-4 py-3">Employee</th><th className="px-4 py-3 text-right">Days</th>
                <th className="px-4 py-3 text-right">Gross</th><th className="px-4 py-3 text-right">PF</th>
                <th className="px-4 py-3 text-right">ESI</th><th className="px-4 py-3 text-right">Net</th>
                <th className="px-4 py-3">Status</th><th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><div className="font-medium text-slate-900">{p.full_name}</div><div className="text-xs text-slate-500">{p.emp_code}</div></td>
                  <td className="px-4 py-3 text-right">{p.days_paid}</td>
                  <td className="px-4 py-3 text-right">{fmtINR(p.gross)}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{fmtINR(p.pf_deducted)}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{fmtINR(p.esi_deducted)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">{fmtINR(p.net_pay)}</td>
                  <td className="px-4 py-3"><span className={cn('text-[10px] uppercase font-bold px-2 py-0.5 rounded',
                    p.status === 'paid' && 'bg-emerald-50 text-emerald-700',
                    p.status === 'draft' && 'bg-amber-50 text-amber-700',
                    p.status === 'approved' && 'bg-blue-50 text-blue-700',
                  )}>{p.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openPayslip(p)} className="text-xs font-semibold text-violet-700 hover:underline mr-3">Payslip</button>
                    {p.status !== 'paid' && <button onClick={() => markPaid(p)} className="text-xs font-semibold text-emerald-700 hover:underline"><Check className="w-3 h-3 inline" /> Mark paid</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
      <div className="text-lg font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}
