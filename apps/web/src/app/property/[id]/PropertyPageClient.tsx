'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MapPin,
  Star,
  Wifi,
  Wind,
  Coffee,
  ParkingCircle,
  Tv,
  ShieldCheck,
  Clock,
  Calendar,
  Users,
  Bed,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHotel } from '@/lib/naploo';
import type { Room } from '@/data/rooms';
import type { Pod } from '@/components/pods/PodCard';
import type { Property } from '@/components/pods/PropertyCard';
import type { StayMode } from '@/data/search';

const POD_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 1.8,
  3: 2.5,
  4: 3.2,
  6: 4.5,
  8: 5.5,
  12: 7,
};

const amenityIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  WiFi: Wifi,
  AC: Wind,
  Restaurant: Coffee,
  Parking: ParkingCircle,
  TV: Tv,
  'Room Service': Coffee,
};

export default function PropertyPageClient({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const mode: StayMode = (sp.get('mode') as StayMode) || 'pods';
  const checkInParam = sp.get('checkIn') || new Date().toISOString().slice(0, 10);
  const checkOutParam =
    sp.get('checkOut') || new Date(new Date().getTime() + 86400000).toISOString().slice(0, 10);
  const startTimeParam = sp.get('startTime') || '14:00';
  const durationParam = Number(sp.get('duration') || 3);
  const guestsParam = Number(sp.get('guests') || 1);
  const roomsParam = Number(sp.get('rooms') || 1);

  const [property, setProperty] = useState<Property | null>(null);
  const [pods, setPods] = useState<Pod[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'rooms' | 'pods'>(mode === 'rooms' ? 'rooms' : 'pods');
  const [activeImage, setActiveImage] = useState(0);
  const [duration, setDuration] = useState<number>(durationParam);
  const [startTime, setStartTime] = useState<string>(startTimeParam);
  const [checkIn, setCheckIn] = useState<string>(checkInParam);
  const [checkOut, setCheckOut] = useState<string>(checkOutParam);
  const [guests, setGuests] = useState<number>(guestsParam);
  const [numRooms, setNumRooms] = useState<number>(roomsParam);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getHotel(propertyId)
      .then((data) => {
        if (!active) return;
        if (data) {
          setProperty(data.property);
          setRooms(data.rooms);
          setPods(data.pods);
          // default tab to whichever inventory exists
          if (mode === 'rooms' && data.rooms.length === 0 && data.pods.length > 0) setActiveTab('pods');
          if (mode === 'pods' && data.pods.length === 0 && data.rooms.length > 0) setActiveTab('rooms');
        }
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [propertyId, mode]);

  const nights = useMemo(() => {
    const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000;
    return Math.max(1, Math.round(diff));
  }, [checkIn, checkOut]);

  function bookPod(pod: Pod) {
    if (!property) return;
    const q = new URLSearchParams({
      kind: 'pod',
      propertyId: property.id,
      itemId: pod.id,
      startDate: checkIn,
      startTime,
      duration: String(duration),
      guests: String(guests),
    });
    router.push(`/booking/checkout?${q.toString()}`);
  }

  function bookRoom(room: Room) {
    if (!property) return;
    const q = new URLSearchParams({
      kind: 'room',
      propertyId: property.id,
      itemId: room.id,
      checkIn,
      checkOut,
      guests: String(guests),
      rooms: String(numRooms),
    });
    router.push(`/booking/checkout?${q.toString()}`);
  }

  const podPriceForDuration = (basePerHour: number) => {
    const m = POD_MULTIPLIERS[duration] ?? duration;
    return Math.round(basePerHour * m);
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-32 px-4 text-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary-600 mx-auto" />
        <p className="text-slate-500 mt-3">Loading property…</p>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen pt-32 px-4 text-center">
        <p className="text-slate-700 font-medium">Property not found.</p>
        <Link href="/search" className="text-primary-600 underline mt-2 inline-block">
          Back to search
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/search" className="hover:text-primary-600">Stays</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 truncate">{property.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{property.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {property.address}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-current" /> {property.rating}
            </div>
            <div className="text-xs text-slate-500 mt-1">{property.reviews} reviews</div>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[280px] md:h-[420px] rounded-2xl overflow-hidden mb-6">
          <div className="col-span-4 row-span-2 md:col-span-2 md:row-span-2 relative">
            <Image
              src={property.images[activeImage] || property.images[0]}
              alt={property.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {property.images.slice(1, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i + 1)}
              className="hidden md:block relative overflow-hidden"
              aria-label={`View image ${i + 2}`}
            >
              <Image src={img} alt={`${property.name} ${i + 2}`} fill className="object-cover hover:scale-105 transition-transform" />
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            {/* About + amenities */}
            <section className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">About this property</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{property.description}</p>

              <h3 className="text-sm font-semibold text-slate-800 mt-5 mb-2">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {property.amenities.map((a) => {
                  const Icon = amenityIcon[a] || ShieldCheck;
                  return (
                    <div key={a} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">
                      <Icon className="w-4 h-4 text-primary-600" />
                      <span>{a}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Tabs */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                {(['rooms', 'pods'] as const).map((t) => {
                  const has = t === 'rooms' ? rooms.length > 0 : pods.length > 0;
                  if (!has) return null;
                  return (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={cn(
                        'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                        activeTab === t
                          ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/30'
                          : 'text-slate-500 hover:text-slate-800'
                      )}
                    >
                      {t === 'rooms' ? `🛏️ Rooms (${rooms.length})` : `💤 Sleeping Pods (${pods.length})`}
                    </button>
                  );
                })}
              </div>

              <div className="p-5 space-y-4">
                {activeTab === 'rooms' && rooms.length > 0 && (
                  <>
                    <p className="text-xs text-slate-500">
                      Showing prices for <strong>{nights} night{nights > 1 ? 's' : ''}</strong>, {guests} guest{guests > 1 ? 's' : ''}, {numRooms} room{numRooms > 1 ? 's' : ''}.
                    </p>
                    {rooms.map((room) => (
                      <article key={room.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative md:w-56 aspect-[4/3] md:aspect-auto">
                            <Image src={room.image} alt={room.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-semibold text-slate-900">{room.name}</h4>
                                <p className="text-xs text-slate-500">
                                  {room.bedConfig} • {room.sizeSqFt} sq ft • Up to {room.capacity.adults + room.capacity.children} guests
                                </p>
                              </div>
                              <div className="text-right">
                                {room.originalPrice && (
                                  <div className="text-xs text-slate-400 line-through">₹{room.originalPrice.toLocaleString('en-IN')}</div>
                                )}
                                <div className="text-xl font-bold text-slate-900">
                                  ₹{room.pricePerNight.toLocaleString('en-IN')}
                                </div>
                                <div className="text-[11px] text-slate-500">per night</div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {room.amenities.map((a) => (
                                <span key={a} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px]">
                                  {a}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="text-[11px] text-emerald-700 flex items-center gap-2">
                                {room.refundable && <span>✓ Free cancellation</span>}
                                {room.breakfast && <span>✓ Breakfast included</span>}
                              </div>
                              <button
                                onClick={() => bookRoom(room)}
                                disabled={room.available === 0}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-50"
                              >
                                {room.available > 0 ? 'Reserve' : 'Sold out'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </>
                )}

                {activeTab === 'pods' && pods.length > 0 && (
                  <>
                    <p className="text-xs text-slate-500">
                      Showing prices for <strong>{duration} hr</strong> starting at <strong>{startTime}</strong>.
                    </p>
                    {pods.map((pod) => {
                      const total = podPriceForDuration(pod.price);
                      return (
                        <article key={pod.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="relative md:w-56 aspect-[4/3] md:aspect-auto">
                              <Image src={pod.image} alt={pod.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="font-semibold text-slate-900">{pod.name}</h4>
                                  <p className="text-xs text-slate-500">{pod.series}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-slate-900">₹{total.toLocaleString('en-IN')}</div>
                                  <div className="text-[11px] text-slate-500">
                                    ₹{pod.price}/hr × {duration} hr
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {pod.amenities.map((a) => (
                                  <span key={a} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px]">
                                    {a}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-current" /> {pod.rating} ({pod.reviews})
                                </div>
                                <button
                                  onClick={() => bookPod(pod)}
                                  disabled={!pod.available}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-50"
                                >
                                  {pod.available ? 'Book Pod' : 'Occupied'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </>
                )}
              </div>
            </section>

            {/* Policies */}
            <section className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Stay policies</h2>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Free cancellation up to 24 hrs before check-in for refundable rooms.</li>
                <li>• Valid government ID is required at check-in.</li>
                <li>• Pod stays use OTP-based smart locks — share OTP only with your group.</li>
                <li>• Smoking and pets are not permitted inside pods.</li>
              </ul>
            </section>
          </div>

          {/* Sticky booking panel */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Customize your stay</h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  {rooms.length > 0 && (
                    <button
                      onClick={() => setActiveTab('rooms')}
                      className={cn(
                        'flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium',
                        activeTab === 'rooms' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'
                      )}
                    >
                      <Bed className="w-4 h-4" /> Rooms
                    </button>
                  )}
                  {pods.length > 0 && (
                    <button
                      onClick={() => setActiveTab('pods')}
                      className={cn(
                        'flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium',
                        activeTab === 'pods' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'
                      )}
                    >
                      <Clock className="w-4 h-4" /> Pods
                    </button>
                  )}
                </div>

                {activeTab === 'rooms' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Check-in" icon={<Calendar className="w-4 h-4 text-primary-600" />}>
                        <input
                          type="date"
                          min={new Date().toISOString().slice(0, 10)}
                          value={checkIn}
                          onChange={(e) => {
                            setCheckIn(e.target.value);
                            if (e.target.value >= checkOut) {
                              const d = new Date(e.target.value);
                              d.setDate(d.getDate() + 1);
                              setCheckOut(d.toISOString().slice(0, 10));
                            }
                          }}
                          className="bg-transparent outline-none text-sm w-full"
                        />
                      </Field>
                      <Field label="Check-out" icon={<Calendar className="w-4 h-4 text-primary-600" />}>
                        <input
                          type="date"
                          min={checkIn}
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="bg-transparent outline-none text-sm w-full"
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Guests" icon={<Users className="w-4 h-4 text-primary-600" />}>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={guests}
                          onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                          className="bg-transparent outline-none text-sm w-full"
                        />
                      </Field>
                      <Field label="Rooms" icon={<Bed className="w-4 h-4 text-primary-600" />}>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={numRooms}
                          onChange={(e) => setNumRooms(Math.max(1, Number(e.target.value)))}
                          className="bg-transparent outline-none text-sm w-full"
                        />
                      </Field>
                    </div>
                    <div className="text-xs text-slate-500">
                      {nights} night{nights > 1 ? 's' : ''} • starts from{' '}
                      <span className="font-semibold text-slate-800">
                        ₹{(rooms[0]?.pricePerNight ?? property.roomStartPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Field label="Date" icon={<Calendar className="w-4 h-4 text-primary-600" />}>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="bg-transparent outline-none text-sm w-full"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Start" icon={<Clock className="w-4 h-4 text-primary-600" />}>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="bg-transparent outline-none text-sm w-full"
                        />
                      </Field>
                      <Field label="Duration" icon={<Clock className="w-4 h-4 text-primary-600" />}>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          className="bg-transparent outline-none text-sm w-full"
                        >
                          {[1, 2, 3, 4, 6, 8, 12].map((h) => (
                            <option key={h} value={h}>
                              {h} hr
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Guests" icon={<Users className="w-4 h-4 text-primary-600" />}>
                      <input
                        type="number"
                        min={1}
                        max={4}
                        value={guests}
                        onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                        className="bg-transparent outline-none text-sm w-full"
                      />
                    </Field>
                    <div className="text-xs text-slate-500">
                      {duration} hr • starts from{' '}
                      <span className="font-semibold text-slate-800">
                        ₹{podPriceForDuration(pods[0]?.price ?? property.podStartPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}

                <div className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 leading-snug">
                  Tip: scroll the list and click <strong>Reserve</strong> / <strong>Book Pod</strong> on the option you want.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
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
