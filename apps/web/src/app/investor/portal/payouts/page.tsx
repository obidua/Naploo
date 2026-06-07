'use client';

import InvestorShell from '../_lib/InvestorShell';
import { Wallet, Info } from 'lucide-react';

export default function InvestorPayoutsPage() {
  return (
    <InvestorShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Payouts</h1>
          <p className="text-sm text-slate-500">Bank settlements credited to your registered account.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h2 className="font-semibold text-slate-700">Monthly settlement cycle</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Naploo settles your earnings to your registered bank account on the <b>5th of every month</b>. TDS deduction applies as per current Income Tax rules. You'll receive an SMS + email on every settlement.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-900">
            <b>Need a payout statement?</b> Email <a href="mailto:investors@naploo.com" className="underline">investors@naploo.com</a> with your registered phone for a CA-friendly TDS + settlement statement.
          </div>
        </div>
      </div>
    </InvestorShell>
  );
}
