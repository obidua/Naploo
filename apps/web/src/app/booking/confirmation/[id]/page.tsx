'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, MapPin, Calendar, Clock, Copy, Download, Loader2 } from 'lucide-react';
import { getBooking } from '@/lib/naploo';
import type { Booking } from '@/store/bookings';

export default function ConfirmationPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    getBooking(params.id)
      .then((b) => {
        if (active) {
          setBooking(b);
          setLoading(false);
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen pt-32 px-4 text-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary-600 mx-auto" />
        <p className="text-slate-500 mt-3">Loading your booking…</p>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="min-h-screen pt-32 px-4 text-center">
        <p className="text-slate-700">Booking not found.</p>
        <Link href="/profile/bookings" className="text-primary-600 underline mt-2 inline-block">
          See my bookings
        </Link>
      </main>
    );
  }

  const isPending = booking.status === 'pending';

  return (
    <main className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-white rounded-2xl p-6 flex items-center gap-4 shadow-lg ${
            isPending ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold">
              {isPending ? 'Booking reserved!' : 'Booking confirmed!'}
            </h1>
            <p className="text-white/90 text-sm">
              {isPending
                ? 'Your stay is reserved. Pay at the property to confirm.'
                : 'A confirmation has been sent to your registered contact.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 mt-5 overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Booking code</p>
              <p className="text-2xl font-mono font-bold text-slate-900 tracking-wider">{booking.bookingCode}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(booking.bookingCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
            >
              <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="p-5 flex gap-4 border-b border-gray-200">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
              <Image src={booking.itemImage} alt={booking.itemName} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-500">{booking.propertyName}</div>
              <div className="font-semibold text-slate-900">{booking.itemName}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {booking.propertyAddress}
              </div>
            </div>
          </div>

          <div className="p-5 grid sm:grid-cols-2 gap-4 text-sm border-b border-gray-200">
            {booking.kind === 'pod' ? (
              <>
                <Field icon={<Calendar className="w-4 h-4 text-primary-600" />} label="Date & time">
                  {booking.startTime?.replace('T', ' ').slice(0, 16)}
                </Field>
                <Field icon={<Clock className="w-4 h-4 text-primary-600" />} label="Duration">
                  {booking.durationHours} hour{(booking.durationHours || 0) > 1 ? 's' : ''}
                </Field>
              </>
            ) : (
              <>
                <Field icon={<Calendar className="w-4 h-4 text-primary-600" />} label="Check-in">
                  {booking.checkIn}
                </Field>
                <Field icon={<Calendar className="w-4 h-4 text-primary-600" />} label="Check-out">
                  {booking.checkOut}
                </Field>
                <Field icon={<Calendar className="w-4 h-4 text-primary-600" />} label="Nights">
                  {booking.nights}
                </Field>
              </>
            )}
            <Field icon={<Calendar className="w-4 h-4 text-primary-600" />} label="Guests">
              {booking.guests}
            </Field>
          </div>

          <div className="p-5 space-y-1 text-sm">
            <Row label="Subtotal" value={`₹${booking.subtotal.toLocaleString('en-IN')}`} />
            <Row label="Taxes & GST" value={`₹${booking.taxes.toLocaleString('en-IN')}`} />
            <div className="flex items-center justify-between text-base pt-2 border-t border-dashed border-gray-200">
              <span className="font-semibold text-slate-900">{isPending ? 'Amount due' : 'Total paid'}</span>
              <span className="font-bold text-slate-900">₹{booking.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <Link
            href="/profile/bookings"
            className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold"
          >
            View my bookings
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 text-slate-800 font-medium hover:border-primary-300"
          >
            <Download className="w-4 h-4" /> Save receipt
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-5 text-sm text-amber-900">
          {booking.kind === 'pod' ? (
            <p>
              💡 You'll receive a unique <strong>OTP unlock code</strong> 30 minutes before your slot. Please carry a
              valid government ID.
            </p>
          ) : (
            <p>💡 Check-in counter opens at 12:00 PM. Please carry a valid government ID at check-in.</p>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5">{icon}</span>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
        <div className="text-sm text-slate-800">{children}</div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}
