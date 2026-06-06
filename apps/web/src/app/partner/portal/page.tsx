'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Hotel, Bed, MapPin, Star, Calendar, IndianRupee, TrendingUp, Loader2, ArrowRight,
} from 'lucide-react';
import PortalShell, { ErrorBanner } from './_lib/PortalShell';
import { getMyHotel, getPartnerBookings, computeEarnings, type PartnerHotel, type PartnerBooking } from './_lib/api';

function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function PartnerDashboardPage() {
  return (
    <PortalShell>
      <DashboardBody />
    </PortalShell>
  );
}

function DashboardBody() {
  const [hotel, setHotel] = useState<PartnerHotel | null>(null);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const h = await getMyHotel();
        if (!active) return;
        if (!h) {
          setError('No hotel is linked to this partner account yet. Please contact Naploo support.');
          setLoading(false);
          return;
        }
        setHotel(h);
        const bs = await getPartnerBookings(h.id);
        if (!active) return;
        setBookings(bs);
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load dashboard');
      } finally {
        if (active) setLoading(false);
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
        <p className="text-sm text-slate-500 mt-2">Loading your dashboard…</p>
      </div>
    );
  }

  if (error) return <ErrorBanner message={error} />;
  if (!hotel) return null;

  const earnings = computeEarnings(bookings);
  const activeBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'checked_in');
  const totalUnits = hotel.rooms.length + hotel.podSets.reduce((s, ps) => s + ps.pods.length, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{hotel.businessName}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" /> {hotel.address}, {hotel.city}, {hotel.state} {hotel.pincode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-sm">
              <Star className="w-4 h-4 fill-current" /> {hotel.rating || 0} ({hotel.totalReviews || 0})
            </span>
            <span className="text-xs font-semibold uppercase bg-slate-100 text-slate-700 px-2 py-1 rounded">
              {hotel.status}
            </span>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Rooms" value={String(hotel.rooms.length)} icon={<Hotel className="w-5 h-5" />} color="from-blue-500 to-cyan-500" />
        <KpiCard label="Pods" value={String(totalUnits - hotel.rooms.length)} icon={<Bed className="w-5 h-5" />} color="from-violet-500 to-purple-500" />
        <KpiCard label="Active bookings" value={String(activeBookings.length)} icon={<Calendar className="w-5 h-5" />} color="from-amber-500 to-orange-500" />
        <KpiCard label="Total earnings" value={formatINR(earnings.myShare)} icon={<IndianRupee className="w-5 h-5" />} color="from-green-500 to-emerald-500" />
      </div>

      {/* Recent bookings */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent bookings</h2>
          <Link href="/partner/portal/bookings" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No bookings yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {bookings.slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 text-sm truncate">{b.bookingNumber}</div>
                  <div className="text-xs text-slate-500">
                    {b.bookingType === 'room' ? `🛏️ Room` : `💤 Pod`} • {b.unit?.roomNumber || b.unit?.podNumber || '-'} • {b.guestCount} guest{b.guestCount > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">₹{Number(b.total).toLocaleString('en-IN')}</div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500">{b.status}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <ActionCard
          href="/partner/portal/inventory"
          icon={<Hotel className="w-5 h-5 text-primary-600" />}
          title="Manage inventory & pricing"
          subtitle="Add or update rooms and sleeping pods"
        />
        <ActionCard
          href="/partner/portal/earnings"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          title="Earnings & payouts"
          subtitle={`${formatINR(earnings.last30Share)} earned in last 30 days`}
        />
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
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

function ActionCard({ href, icon, title, subtitle }: { href: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Link href={href} className="block bg-white border border-gray-200 hover:border-primary-200 hover:shadow-sm rounded-2xl p-5 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </div>
    </Link>
  );
}
