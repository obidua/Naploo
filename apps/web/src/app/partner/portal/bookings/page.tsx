'use client';

import { useEffect, useState } from 'react';
import { Loader2, Calendar, User } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { getMyHotel, getPartnerBookings, type PartnerBooking } from '../_lib/api';

export default function PartnerBookingsPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

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

  const now = Date.now();
  const filtered = bookings.filter((b) => {
    const co = new Date(b.checkOut).getTime();
    if (filter === 'upcoming') return co >= now && b.status !== 'cancelled';
    if (filter === 'past') return co < now || b.status === 'checked_out';
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Bookings</h1>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(['upcoming', 'past', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-sm text-slate-500">No bookings in this filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {filtered.map((b) => (
            <div key={b.id} className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{b.bookingNumber}</span>
                  <StatusBadge status={b.status} />
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span>{b.bookingType === 'pod' ? '💤 Pod' : '🛏️ Room'} {b.unit?.roomNumber || b.unit?.podNumber || '-'}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(b.checkIn).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} → {new Date(b.checkOut).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {b.guestCount} guest{b.guestCount > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">₹{Number(b.total).toLocaleString('en-IN')}</div>
                <div className="text-[11px] text-emerald-700">your share ₹{Number(b.ownerShare).toLocaleString('en-IN')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    checked_in: 'bg-blue-50 text-blue-700',
    checked_out: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-50 text-red-700',
    no_show: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
