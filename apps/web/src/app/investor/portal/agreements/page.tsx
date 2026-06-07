'use client';

import InvestorShell from '../_lib/InvestorShell';
import { FileText, Download, ShieldCheck } from 'lucide-react';

export default function InvestorAgreementsPage() {
  const docs = [
    { name: 'Investor enrollment agreement', size: '~14 KB', kind: 'pdf' },
    { name: '3× return guarantee letter', size: '~9 KB', kind: 'pdf' },
    { name: 'Leaseback terms (if applicable)', size: '~22 KB', kind: 'pdf' },
    { name: 'Scrap & end-of-contract policy', size: '~7 KB', kind: 'pdf' },
  ];

  return (
    <InvestorShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Agreements & documents</h1>
          <p className="text-sm text-slate-500">Signed contracts + Naploo's investor policy documents.</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-900">
            All agreements are digitally signed via Aadhaar e-Sign / DigiLocker. You receive a copy on email at the time of signing.
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          {docs.map((d) => (
            <div key={d.name} className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 truncate">{d.name}</div>
                  <div className="text-xs text-slate-500">{d.kind.toUpperCase()} · {d.size}</div>
                </div>
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-slate-600 hover:bg-slate-50">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 text-center">Lost an agreement? Email <a href="mailto:legal@naploo.com" className="underline text-emerald-700">legal@naploo.com</a></p>
      </div>
    </InvestorShell>
  );
}
