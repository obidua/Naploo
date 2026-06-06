'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Lock, ShieldCheck, Tag, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import type { BookingKind } from '@/store/bookings';
import type { Property } from '@/components/pods/PropertyCard';
import type { Room } from '@/data/rooms';
import type { Pod } from '@/components/pods/PodCard';
import { getHotel, getQuote, createBooking, payForBooking, type Quote } from '@/lib/naploo';

export default function CheckoutClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  const kind = (sp.get('kind') as BookingKind) || 'pod';
  const propertyId = sp.get('propertyId') || '';
  const itemId = sp.get('itemId') || '';

  // Pod params
  const startDate = sp.get('startDate') || new Date().toISOString().slice(0, 10);
  const startTime = sp.get('startTime') || '14:00';
  const duration = Number(sp.get('duration') || 3);

  // Room params
  const checkIn = sp.get('checkIn') || new Date().toISOString().slice(0, 10);
  const checkOut = sp.get('checkOut') || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const rooms = Number(sp.get('rooms') || 1);
  const guests = Number(sp.get('guests') || 1);

  const nights = useMemo(() => {
    if (kind !== 'room') return 1;
    return Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  }, [kind, checkIn, checkOut]);

  const checkInISO = useMemo(() => {
    if (kind === 'pod') return new Date(`${startDate}T${startTime}:00`).toISOString();
    return new Date(`${checkIn}T14:00:00`).toISOString();
  }, [kind, startDate, startTime, checkIn]);

  // Resolve property + item from the live API
  const [property, setProperty] = useState<Property | null>(null);
  const [podItem, setPodItem] = useState<Pod | null>(null);
  const [roomItem, setRoomItem] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getHotel(propertyId)
      .then((data) => {
        if (!active) return;
        if (data) {
          setProperty(data.property);
          if (kind === 'pod') setPodItem(data.pods.find((p) => p.id === itemId) || null);
          else setRoomItem(data.rooms.find((r) => r.id === itemId) || null);
        }
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [propertyId, itemId, kind]);

  // Coupon (client-side codes → discount amount; sent to backend for authoritative pricing)
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  // Authoritative price from backend quote
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);

  useEffect(() => {
    const ready = kind === 'pod' ? !!podItem : !!roomItem;
    if (!ready) return;
    let active = true;
    setQuoting(true);
    getQuote({
      kind,
      itemId,
      checkInISO,
      hours: kind === 'pod' ? duration : undefined,
      nights: kind === 'room' ? nights : undefined,
      guestCount: guests,
      couponDiscount: discount,
    })
      .then((q) => {
        if (active) {
          setQuote(q);
          setQuoting(false);
        }
      })
      .catch(() => active && setQuoting(false));
    return () => {
      active = false;
    };
  }, [kind, itemId, checkInISO, duration, nights, guests, discount, podItem, roomItem]);

  const baseSubtotal = useMemo(() => {
    if (kind === 'pod') return (podItem?.price ?? 0) * duration;
    return (roomItem?.pricePerNight ?? 0) * nights;
  }, [kind, podItem, roomItem, duration, nights]);

  function applyCoupon() {
    const c = coupon.trim().toUpperCase();
    if (!c) return;
    const base = quote?.subtotal ?? baseSubtotal;
    if (c === 'WELCOME10') {
      setDiscount(Math.round(base * 0.1));
      setCouponMsg('WELCOME10 applied — 10% off');
    } else if (c === 'NAPLOO50') {
      setDiscount(50);
      setCouponMsg('NAPLOO50 applied — ₹50 off');
    } else {
      setDiscount(0);
      setCouponMsg('Invalid coupon code');
    }
  }

  const subtotal = quote?.subtotal ?? baseSubtotal;
  const taxes = quote?.gst ?? Math.round(Math.max(0, subtotal - discount) * 0.12);
  const total = quote?.total ?? Math.max(0, subtotal - discount + taxes);

  // Guest form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [payMethod, setPayMethod] = useState<'razorpay' | 'upi' | 'cod'>('razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
      setName(full || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (loading) {
    return (
      <main className="min-h-screen pt-32 px-4 text-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary-600 mx-auto" />
        <p className="text-slate-500 mt-3">Preparing your booking…</p>
      </main>
    );
  }

  if (!property || (!podItem && !roomItem)) {
    return (
      <main className="min-h-screen pt-32 px-4 text-center">
        <p className="text-slate-700">Booking session is invalid.</p>
        <Link href="/search" className="text-primary-600 underline mt-2 inline-block">
          Back to search
        </Link>
      </main>
    );
  }

  const itemName = kind === 'pod' ? podItem!.name : roomItem!.name;
  const itemImage = kind === 'pod' ? podItem!.image : roomItem!.image;

  async function handlePay() {
    setError('');
    if (!name.trim() || phone.trim().length < 10) {
      setError('Enter your full name and a valid phone number.');
      return;
    }
    if (!isAuthenticated || !user) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?next=${next}`);
      return;
    }
    setSubmitting(true);

    const created = await createBooking({
      userId: user.id,
      kind,
      itemId,
      checkInISO,
      hours: kind === 'pod' ? duration : undefined,
      nights: kind === 'room' ? nights : undefined,
      guestCount: guests,
      couponDiscount: discount,
    });

    if ('error' in created) {
      setError(created.error);
      setSubmitting(false);
      return;
    }

    // Pay-at-property leaves the booking pending; head to confirmation.
    if (payMethod === 'cod') {
      router.push(`/booking/confirmation/${created.id}`);
      return;
    }

    const pay = await payForBooking(created.id, { name, email, contact: phone });
    if (!pay.paid) {
      setError(pay.error || 'Payment could not be completed. Please try again.');
      setSubmitting(false);
      return;
    }

    router.push(`/booking/confirmation/${created.id}`);
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 mb-3"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">Confirm and pay</h1>
        <p className="text-sm text-slate-500 mb-6">
          You're one step away from your {kind === 'pod' ? 'pod' : 'room'} stay at {property.name}.
        </p>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Guest + payment */}
          <div className="space-y-4">
            <section className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Guest details</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input label="Full name" value={name} onChange={setName} placeholder="As per ID proof" />
                <Input label="Phone" value={phone} onChange={setPhone} placeholder="10-digit mobile" />
                <Input label="Email (optional)" value={email} onChange={setEmail} placeholder="you@example.com" />
                <Input label="Guests" value={String(guests)} onChange={() => {}} disabled />
              </div>
              {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Payment method</h2>
              <div className="space-y-2">
                <PayOption
                  id="razorpay"
                  active={payMethod === 'razorpay'}
                  onSelect={() => setPayMethod('razorpay')}
                  title="Razorpay (Card / NetBanking / Wallet)"
                  subtitle="Secure checkout via Razorpay"
                />
                <PayOption
                  id="upi"
                  active={payMethod === 'upi'}
                  onSelect={() => setPayMethod('upi')}
                  title="UPI"
                  subtitle="Pay using any UPI app"
                />
                <PayOption
                  id="cod"
                  active={payMethod === 'cod'}
                  onSelect={() => setPayMethod('cod')}
                  title="Pay at property"
                  subtitle="Reserve now, pay during check-in"
                />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-3">
                <Lock className="w-3 h-3" /> Payments are encrypted. We never store your card details.
              </p>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-2">Cancellation</h2>
              <p className="text-sm text-slate-600">
                Free cancellation up to 24 hours before check-in. After that, cancellation may incur a fee.
              </p>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex gap-3 p-4 border-b border-gray-200">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                  <Image src={itemImage} alt={itemName} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">{property.name}</div>
                  <div className="font-semibold text-slate-900 truncate">{itemName}</div>
                  <div className="text-xs text-slate-500 truncate">{property.city}</div>
                </div>
              </div>

              <div className="p-4 space-y-2 text-sm">
                {kind === 'pod' ? (
                  <>
                    <Row label="Date" value={startDate} />
                    <Row label="Start time" value={startTime} />
                    <Row label="Duration" value={`${duration} hour${duration > 1 ? 's' : ''}`} />
                  </>
                ) : (
                  <>
                    <Row label="Check-in" value={checkIn} />
                    <Row label="Check-out" value={checkOut} />
                    <Row label="Nights" value={`${nights} night${nights > 1 ? 's' : ''}`} />
                  </>
                )}
                <Row label="Guests" value={String(guests)} />
              </div>

              <div className="px-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                    <Tag className="w-4 h-4 text-primary-600" />
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Coupon (try WELCOME10)"
                      className="bg-transparent outline-none text-sm w-full"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="px-3 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-xs mt-1 ${discount > 0 ? 'text-emerald-700' : 'text-red-600'}`}>{couponMsg}</p>
                )}
              </div>

              <div className="border-t border-gray-200 p-4 space-y-1 text-sm">
                <Row label="Subtotal" value={`₹${subtotal.toLocaleString('en-IN')}`} />
                {discount > 0 && (
                  <Row label="Discount" value={`- ₹${discount.toLocaleString('en-IN')}`} valueClass="text-emerald-700" />
                )}
                <Row label="Taxes & GST" value={`₹${taxes.toLocaleString('en-IN')}`} />
                <div className="border-t border-dashed border-gray-200 my-2" />
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900">
                    {quoting ? '…' : `₹${total.toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <button
                  onClick={handlePay}
                  disabled={submitting || quoting}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                    </>
                  ) : payMethod === 'cod' ? (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Reserve — pay ₹{total.toLocaleString('en-IN')} at property
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Pay ₹{total.toLocaleString('en-IN')}
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  By clicking pay you agree to our Terms & Refund Policy.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-500 mb-1">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50"
      />
    </label>
  );
}

function PayOption({
  id,
  active,
  onSelect,
  title,
  subtitle,
}: {
  id: string;
  active: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 border rounded-xl text-left transition-colors ${
        active ? 'border-primary-500 bg-primary-50/40' : 'border-gray-200 hover:border-primary-200'
      }`}
      aria-pressed={active}
    >
      <span
        className={`w-4 h-4 rounded-full border-2 ${active ? 'border-primary-600' : 'border-gray-300'} flex items-center justify-center`}
      >
        {active && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-slate-800">{title}</span>
        <span className="block text-xs text-slate-500">{subtitle}</span>
      </span>
    </button>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`text-slate-800 ${valueClass || ''}`}>{value}</span>
    </div>
  );
}
