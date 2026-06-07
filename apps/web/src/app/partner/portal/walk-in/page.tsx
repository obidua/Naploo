'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Phone, Mail, Calendar, Clock, Users, Bed, Hotel, Loader2, CheckCircle2,
  IndianRupee, Wallet, CreditCard, Banknote, Smartphone, ArrowRight, AlertCircle,
} from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { getMyHotel, type PartnerHotel } from '../_lib/api';
import { pmsApi, formatMoney, type PartnerConfig, type WalkInInput } from '../_lib/pms-api';
import { cn } from '@/lib/utils';

type Tab = 'room' | 'pod';

export default function WalkInPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const router = useRouter();
  const [hotel, setHotel] = useState<PartnerHotel | null>(null);
  const [config, setConfig] = useState<PartnerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [tab, setTab] = useState<Tab>('room');
  const [unitId, setUnitId] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [nights, setNights] = useState(1);
  const [hours, setHours] = useState(3);
  const [guestCount, setGuestCount] = useState(1);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [checkInNow, setCheckInNow] = useState(true);

  const [payMethod, setPayMethod] = useState<NonNullable<WalkInInput['payment']>['method']>('cash');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payReference, setPayReference] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<any | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [hRes, cRes] = await Promise.all([getMyHotel(), pmsApi.getConfig()]);
      if (!active) return;
      if (!hRes) {
        setError('No hotel linked to this account.');
        setLoading(false);
        return;
      }
      setHotel(hRes);
      if (cRes.data) setConfig(cRes.data);
      // Default to time from config
      if (cRes.data?.checkInTime) setCheckInTime(cRes.data.checkInTime.slice(0, 5));
      // Auto-select first available room
      if (hRes.rooms.length > 0) {
        setUnitId(hRes.rooms[0].id);
      } else if (hRes.podSets.length > 0) {
        setTab('pod');
        setUnitId(hRes.podSets[0].id);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Live price preview
  const preview = useMemo(() => {
    if (!hotel || !unitId) return null;
    if (tab === 'room') {
      const room = hotel.rooms.find((r) => r.id === unitId);
      if (!room) return null;
      const base = room.dailyRate * nights;
      const taxable = Math.max(0, base - discount);
      const gst = Math.round(taxable * 0.12);
      return {
        unit: `Room ${room.roomNumber}${room.name ? ` — ${room.name}` : ''}`,
        baseRate: room.dailyRate,
        units: nights,
        unitsLabel: `${nights} night${nights > 1 ? 's' : ''}`,
        subtotal: base,
        discount,
        gst,
        total: taxable + gst,
      };
    } else {
      const set = hotel.podSets.find((s) => s.id === unitId);
      if (!set) return null;
      const base = set.hourlyRate * hours;
      const taxable = Math.max(0, base - discount);
      const gst = Math.round(taxable * 0.12);
      return {
        unit: `Pod set ${set.setNumber}`,
        baseRate: set.hourlyRate,
        units: hours,
        unitsLabel: `${hours} hr`,
        subtotal: base,
        discount,
        gst,
        total: taxable + gst,
      };
    }
  }, [hotel, unitId, tab, nights, hours, discount]);

  async function submit() {
    if (!preview || !hotel) return;
    setError('');
    if (!name.trim() || phone.trim().length < 10) {
      setError('Guest name and a valid 10-digit phone are required.');
      return;
    }
    const checkInISO = new Date(`${checkInDate}T${checkInTime}:00`).toISOString();
    const input: WalkInInput = {
      kind: tab,
      unitId,
      checkIn: checkInISO,
      ...(tab === 'room' ? { nights } : { hours }),
      guestCount,
      guestName: name.trim(),
      guestPhone: phone.trim(),
      guestEmail: email.trim() || undefined,
      discount: discount || 0,
      notes: notes || undefined,
      checkInNow,
      ...(payMethod !== 'pay_later'
        ? {
            payment: {
              method: payMethod,
              amount: typeof payAmount === 'number' ? payAmount : preview.total,
              reference: payReference || undefined,
            },
          }
        : { payment: { method: 'pay_later' } }),
    };
    setSubmitting(true);
    const res = await pmsApi.walkIn(input);
    setSubmitting(false);
    if (!res.data?.success) {
      setError(res.data?.message || res.error || 'Walk-in failed');
      return;
    }
    setDone(res.data.summary);
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
        <p className="text-sm text-slate-500 mt-2">Loading hotel inventory…</p>
      </div>
    );
  }
  if (!hotel) return <ErrorBanner message={error || 'Hotel not found'} />;

  if (done) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-7 h-7" />
            <h1 className="text-xl font-bold">Walk-in confirmed!</h1>
          </div>
          <p className="text-white/90 text-sm">Booking <b>{done.bookingNumber}</b> created. Guest is in-house.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-200 grid sm:grid-cols-2 gap-4 text-sm">
            <Row label="Booking #" value={done.bookingNumber} bold />
            <Row label="Unit" value={done.unit} />
            <Row label="Stay charge" value={formatMoney(done.stayCharge)} />
            {done.discount > 0 && <Row label="Discount" value={`- ${formatMoney(done.discount)}`} />}
            <Row label="Tax" value={formatMoney(done.tax)} />
            <Row label="Total" value={formatMoney(done.total)} bold />
            <Row label="Paid?" value={done.paid ? 'Yes — fully paid' : `Balance ${formatMoney(done.balance)}`} />
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/partner/portal/folio/${done.folioId}`)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold"
            >
              Open folio
            </button>
            <button
              onClick={() => router.push('/partner/portal/today')}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold"
            >
              Back to today
            </button>
            <button
              onClick={() => {
                setDone(null);
                setName('');
                setPhone('');
                setEmail('');
                setPayAmount('');
                setPayReference('');
              }}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold"
            >
              + Another walk-in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h1 className="text-xl font-bold text-slate-900">Walk-in booking</h1>
        <p className="text-sm text-slate-500 mt-1">Front-desk: create a booking + folio in one go.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4">
          {/* Unit type toggle */}
          <section className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">1. Pick a room or pod</h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-3">
              <button
                onClick={() => {
                  setTab('room');
                  if (hotel.rooms.length > 0) setUnitId(hotel.rooms[0].id);
                }}
                disabled={hotel.rooms.length === 0}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium',
                  tab === 'room' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500',
                  hotel.rooms.length === 0 && 'opacity-40'
                )}
              >
                <Hotel className="w-4 h-4" /> Room ({hotel.rooms.length})
              </button>
              <button
                onClick={() => {
                  setTab('pod');
                  if (hotel.podSets.length > 0) setUnitId(hotel.podSets[0].id);
                }}
                disabled={hotel.podSets.length === 0}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium',
                  tab === 'pod' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500',
                  hotel.podSets.length === 0 && 'opacity-40'
                )}
              >
                <Bed className="w-4 h-4" /> Pod ({hotel.podSets.length} sets)
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {tab === 'room'
                ? hotel.rooms.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setUnitId(r.id)}
                      className={cn(
                        'text-left p-3 rounded-xl border transition-all',
                        unitId === r.id
                          ? 'border-primary-500 bg-primary-50/50'
                          : 'border-gray-200 hover:border-primary-200'
                      )}
                    >
                      <div className="font-semibold text-slate-900 text-sm">Room {r.roomNumber}</div>
                      <div className="text-xs text-slate-500">
                        {r.roomType} • {r.bedType} • {formatMoney(r.dailyRate)}/night
                      </div>
                    </button>
                  ))
                : hotel.podSets.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setUnitId(s.id)}
                      className={cn(
                        'text-left p-3 rounded-xl border transition-all',
                        unitId === s.id
                          ? 'border-primary-500 bg-primary-50/50'
                          : 'border-gray-200 hover:border-primary-200'
                      )}
                    >
                      <div className="font-semibold text-slate-900 text-sm">Pod set {s.setNumber}</div>
                      <div className="text-xs text-slate-500">
                        Floor {s.floor} • {s.pods.length} pods • {formatMoney(s.hourlyRate)}/hr
                      </div>
                    </button>
                  ))}
            </div>
          </section>

          {/* Date/time */}
          <section className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">2. Stay details</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Check-in date" icon={<Calendar className="w-4 h-4 text-primary-600" />}>
                <input
                  type="date"
                  value={checkInDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
              <Field label="Check-in time" icon={<Clock className="w-4 h-4 text-primary-600" />}>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
              {tab === 'room' ? (
                <Field label="Nights">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={nights}
                    onChange={(e) => setNights(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </Field>
              ) : (
                <Field label="Hours">
                  <select
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full bg-transparent outline-none text-sm"
                  >
                    {[1, 2, 3, 4, 6, 8, 12, 24].map((h) => (
                      <option key={h} value={h}>
                        {h} hr
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
            <div className="mt-3">
              <Field label="Guests" icon={<Users className="w-4 h-4 text-primary-600" />}>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
            </div>
          </section>

          {/* Guest details */}
          <section className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">3. Guest details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Full name *" icon={<User className="w-4 h-4 text-primary-600" />}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="As per ID proof"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
              <Field label="Phone *" icon={<Phone className="w-4 h-4 text-primary-600" />}>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
              <Field label="Email (optional)" icon={<Mail className="w-4 h-4 text-primary-600" />}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
              <Field label="Discount (₹)">
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
            </div>
            <label className="block mt-3 text-xs text-slate-600">
              Special requests / notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Late check-in, extra pillow, airport pickup…"
              />
            </label>
          </section>

          {/* Payment */}
          <section className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">4. Payment</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <PayChip active={payMethod === 'cash'} onClick={() => setPayMethod('cash')} icon={<Banknote className="w-4 h-4" />} label="Cash" />
              <PayChip active={payMethod === 'upi'} onClick={() => setPayMethod('upi')} icon={<Smartphone className="w-4 h-4" />} label="UPI" />
              <PayChip active={payMethod === 'card'} onClick={() => setPayMethod('card')} icon={<CreditCard className="w-4 h-4" />} label="Card" />
              <PayChip active={payMethod === 'cashfree'} onClick={() => setPayMethod('cashfree')} icon={<Smartphone className="w-4 h-4" />} label="Cashfree" />
              <PayChip active={payMethod === 'razorpay'} onClick={() => setPayMethod('razorpay')} icon={<Smartphone className="w-4 h-4" />} label="Razorpay" />
              <PayChip active={payMethod === 'wallet'} onClick={() => setPayMethod('wallet')} icon={<Wallet className="w-4 h-4" />} label="Wallet" />
              <PayChip active={payMethod === 'bank_transfer'} onClick={() => setPayMethod('bank_transfer')} icon={<IndianRupee className="w-4 h-4" />} label="Bank" />
              <PayChip active={payMethod === 'pay_later'} onClick={() => setPayMethod('pay_later')} icon={<Clock className="w-4 h-4" />} label="Pay later" />
            </div>
            {payMethod !== 'pay_later' && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Amount (leave blank = full)">
                  <input
                    type="number"
                    min={0}
                    value={payAmount}
                    placeholder={preview ? String(preview.total) : ''}
                    onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </Field>
                <Field label="Reference">
                  <input
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    placeholder="Last 4 of card / UPI ID / receipt #"
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </Field>
              </div>
            )}
            <label className="flex items-center gap-2 mt-3 text-sm text-slate-700">
              <input type="checkbox" checked={checkInNow} onChange={(e) => setCheckInNow(e.target.checked)} />
              Mark as checked-in immediately
            </label>
          </section>
        </div>

        {/* Summary rail */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Bill preview</h3>
            {preview ? (
              <>
                <div className="space-y-1.5 text-sm">
                  <Row label="Unit" value={preview.unit} />
                  <Row label="Rate" value={`${formatMoney(preview.baseRate)} × ${preview.unitsLabel}`} />
                  <Row label="Subtotal" value={formatMoney(preview.subtotal)} />
                  {preview.discount > 0 && (
                    <Row label="Discount" value={`- ${formatMoney(preview.discount)}`} valueClass="text-emerald-700" />
                  )}
                  <Row label="GST 12%" value={formatMoney(preview.gst)} />
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-slate-900">{formatMoney(preview.total)}</span>
                </div>
                <button
                  onClick={submit}
                  disabled={submitting || !name || !phone}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold shadow-md disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating…
                    </>
                  ) : (
                    <>
                      Confirm walk-in <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Folio opens automatically. You can add F&B / services later.
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">Select a room or pod to see pricing.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block border border-gray-200 rounded-xl px-3 py-2">
      <span className="block text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</span>
      <span className="flex items-center gap-2 mt-0.5">
        {icon}
        {children}
      </span>
    </label>
  );
}

function PayChip({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-colors',
        active ? 'bg-primary-50 text-primary-700 border-primary-300' : 'bg-white text-slate-600 border-gray-200 hover:border-primary-200'
      )}
    >
      {icon} {label}
    </button>
  );
}

function Row({ label, value, valueClass, bold }: { label: string; value: string; valueClass?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={cn(bold && 'font-semibold text-slate-900', !bold && 'text-slate-800', valueClass)}>{value}</span>
    </div>
  );
}
