'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, XCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { listMyBookings, cancelBooking as apiCancelBooking } from '@/lib/naploo';
import type { Booking } from '@/store/bookings';
import { cn } from '@/lib/utils';

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    listMyBookings(user.id)
      .then((list) => {
        setBookings(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?next=/profile/bookings');
      return;
    }
    load();
  }, [isAuthenticated, router, load]);

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking?')) return;
    const ok = await apiCancelBooking(id);
    if (ok) load();
    else alert('Could not cancel the booking. Please try again.');
  }

  const upcoming = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
  const past = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <main className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My bookings</h1>
            <p className="text-sm text-slate-500">All your room and pod reservations in one place.</p>
          </div>
          <Link
            href="/search"
            className="hidden md:inline-flex px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold"
          >
            Book another stay
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
            <p className="text-sm text-slate-500 mt-2">Loading your bookings…</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <p className="text-slate-700 font-medium">No bookings yet</p>
            <p className="text-sm text-slate-500 mt-1">Book your first sleeping pod or hotel room in seconds.</p>
            <Link
              href="/search"
              className="inline-block mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold"
            >
              Find a stay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <Section title="Upcoming" bookings={upcoming} onCancel={handleCancel} />
            <Section title="Past & cancelled" bookings={past} onCancel={handleCancel} muted />
          </div>
        )}
      </div>
    </main>
  );
}

function Section({
  title,
  bookings,
  onCancel,
  muted,
}: {
  title: string;
  bookings: Booking[];
  onCancel: (id: string) => void;
  muted?: boolean;
}) {
  if (bookings.length === 0) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">{title}</h2>
      <div className="space-y-3">
        {bookings.map((b) => (
          <article
            key={b.id}
            className={cn('bg-white border border-gray-200 rounded-2xl overflow-hidden', muted && 'opacity-90')}
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative md:w-56 aspect-[4/3] md:aspect-auto">
                <Image src={b.itemImage} alt={b.itemName} fill className="object-cover" />
              </div>
              <div className="flex-1 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">{b.propertyName}</div>
                    <h3 className="font-semibold text-slate-900 truncate">{b.itemName}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {b.propertyAddress}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-md text-[11px] font-semibold uppercase',
                      b.status === 'confirmed' && 'bg-emerald-50 text-emerald-700',
                      b.status === 'cancelled' && 'bg-red-50 text-red-700',
                      b.status === 'completed' && 'bg-slate-100 text-slate-600',
                      b.status === 'pending' && 'bg-amber-50 text-amber-700'
                    )}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-slate-700">
                  {b.kind === 'pod' ? (
                    <>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        {b.startTime?.replace('T', ' ').slice(0, 16)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-primary-600" />
                        {b.durationHours} hr
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        {b.checkIn} → {b.checkOut}
                      </span>
                      <span className="flex items-center gap-1">🛏️ {b.nights} night{(b.nights || 0) > 1 ? 's' : ''}</span>
                    </>
                  )}
                  <span>👤 {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mr-2">
                      {b.bookingCode}
                    </span>
                    <span className="text-lg font-bold text-slate-900">₹{b.total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/booking/confirmation/${b.id}`}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm text-slate-700 hover:border-primary-300"
                    >
                      View receipt
                    </Link>
                    {(b.status === 'confirmed' || b.status === 'pending') && (
                      <button
                        onClick={() => onCancel(b.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
