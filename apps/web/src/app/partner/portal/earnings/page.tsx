'use client';

import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, IndianRupee, Calendar } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { getMyHotel, getPartnerBookings, computeEarnings, type PartnerBooking } from '../_lib/api';

function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function EarningsPage() {
  return (
    <PortalShell>
      <Body />
    ../_lib/PortalShell>
  );
}

function Body() {
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const h = await getMyHotel();
      if (!h) {
        setError('No hotel linked to this account.');
        setLoading(false);
        return;
      }
      const b = await getPartnerBookings(h.id);
      if (active) {
        setBookings(b);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
      </div>
    );
  }
  if (error) return <ErrorBanner message={error} />;

  const earnings = computeEarnings(bookings);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h1 className="text-xl font-bold text-slate-900">Earnings</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time view of revenue from confirmed and completed bookings.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total revenue" value={formatINR(earnings.totalRevenue)} icon={<IndianRupee />} color="from-green-500 to-emerald-500" />
        <Stat label="Your share" value={formatINR(earnings.myShare)} icon={<TrendingUp />} color="from-violet-500 to-purple-500" />
        <Stat label="Last 30 days" value={formatINR(earnings.last30Share)} icon={<Calendar />} color="from-blue-500 to-cyan-500" />
        <Stat label="Bookings" value={String(earnings.revenueBookings)} icon={<Calendar />} color="from-amber-500 to-orange-500" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">Revenue split</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Naploo splits revenue between you (the hotel) and Naploo on every confirmed booking. Pods: <b>60% owner / 40% Naploo</b>. Rooms: <b>~82% hotel / 18% Naploo</b>. GST is collected on top of subtotal (12% on pods and rooms ≤ ₹7,500; 18% on rooms above ₹7,500). Payouts are settled monthly to your registered bank account.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-2`}>
        {icon}
      </div>
      <div className="text-xs uppercase text-slate-500 tracking-wide font-semibold">{label}</div>
      <div className="text-xl font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}
