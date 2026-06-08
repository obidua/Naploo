'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Calendar, Users, Search, Clock, Hotel as HotelIcon, Bed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSuggestions, type StayMode } from '@/data/search';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  className?: string;
  initial?: Partial<SearchState>;
  onSubmit?: (state: SearchState) => void;
}

export interface SearchState {
  location: string;
  mode: StayMode;
  checkIn: string;
  checkOut: string;
  startTime: string;
  duration: number;
  guests: number;
  rooms: number;
}

function todayIso(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function nowHHmm() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  return `${String(d.getHours()).padStart(2, '0')}:00`;
}

export default function SearchBar({ variant = 'hero', className, initial, onSubmit }: SearchBarProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const [state, setState] = useState<SearchState>({
    location: initial?.location ?? sp?.get('location') ?? '',
    mode: (initial?.mode as StayMode) ?? ((sp?.get('mode') as StayMode) || 'pods'),
    checkIn: initial?.checkIn ?? sp?.get('checkIn') ?? todayIso(),
    checkOut: initial?.checkOut ?? sp?.get('checkOut') ?? todayIso(1),
    startTime: initial?.startTime ?? sp?.get('startTime') ?? nowHHmm(),
    duration: initial?.duration ?? Number(sp?.get('duration') || 3),
    guests: initial?.guests ?? Number(sp?.get('guests') || 1),
    rooms: initial?.rooms ?? Number(sp?.get('rooms') || 1),
  });

  const [openSug, setOpenSug] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);
  const sugRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => getSuggestions(state.location), [state.location]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (sugRef.current && !sugRef.current.contains(e.target as Node)) setOpenSug(false);
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) setOpenGuests(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function update<K extends keyof SearchState>(k: K, v: SearchState[K]) {
    setState((s) => ({ ...s, [k]: v }));
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (onSubmit) return onSubmit(state);
    const q = new URLSearchParams();
    if (state.location) q.set('location', state.location);
    q.set('mode', state.mode);
    q.set('checkIn', state.checkIn);
    if (state.mode === 'rooms') q.set('checkOut', state.checkOut);
    if (state.mode === 'pods') {
      q.set('startTime', state.startTime);
      q.set('duration', String(state.duration));
    }
    q.set('guests', String(state.guests));
    q.set('rooms', String(state.rooms));
    router.push(`/search?${q.toString()}`);
  }

  const ModeToggle = (
    <div className="inline-flex w-full items-center gap-1 p-1 bg-gray-100 rounded-xl">
      <button
        type="button"
        onClick={() => update('mode', 'pods')}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap',
          state.mode === 'pods' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
        )}
        aria-pressed={state.mode === 'pods'}
      >
        <Bed className="w-4 h-4" /> <span>Hourly</span>
      </button>
      <button
        type="button"
        onClick={() => update('mode', 'rooms')}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap',
          state.mode === 'rooms' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
        )}
        aria-pressed={state.mode === 'rooms'}
      >
        <HotelIcon className="w-4 h-4" /> <span>Nightly</span>
      </button>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'w-full',
        variant === 'hero' ? 'bg-white rounded-3xl shadow-2xl p-4 md:p-5 border border-gray-100' : 'bg-white rounded-2xl shadow-md p-3 border border-gray-100',
        className
      )}
    >
      {variant === 'hero' && (
        <div className="hidden sm:flex items-center justify-end mb-2 text-xs text-slate-500">
          {state.mode === 'pods' ? 'Pay only for the hours you stay' : 'Book full-night stays'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 md:divide-x md:divide-gray-200 rounded-2xl md:border md:border-gray-200 md:bg-white overflow-visible items-stretch">
        {/* Stay-mode toggle — inline at the start of the row */}
        <div className="md:col-span-2 flex items-center px-3 md:px-2 py-2">
          {ModeToggle}
        </div>
        {/* Location */}
        <div className="relative md:col-span-3" ref={sugRef}>
          <label className="block px-4 pt-3 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
            Where to?
          </label>
          <div className="flex items-center gap-2 px-4 pb-3">
            <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
            <input
              type="text"
              value={state.location}
              onChange={(e) => {
                update('location', e.target.value);
                setOpenSug(true);
              }}
              onFocus={() => setOpenSug(true)}
              placeholder="City, hotel, or area"
              className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm"
              autoComplete="off"
            />
          </div>
          {openSug && suggestions.length > 0 && (
            <div className="absolute z-30 left-0 right-0 md:left-2 md:right-2 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-80 overflow-auto">
              {suggestions.map((s, i) => (
                <button
                  key={`${s.type}-${s.label}-${i}`}
                  type="button"
                  onClick={() => {
                    update('location', s.label);
                    setOpenSug(false);
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary-50 text-left transition-colors"
                >
                  <MapPin className="w-4 h-4 text-primary-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{s.label}</div>
                    {s.sub && <div className="text-xs text-slate-500 truncate">{s.sub}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dates / Time */}
        {state.mode === 'rooms' ? (
          <>
            <div className="md:col-span-2">
              <label className="block px-4 pt-3 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                Check-in
              </label>
              <div className="flex items-center gap-2 px-4 pb-3">
                <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                <input
                  type="date"
                  min={todayIso()}
                  value={state.checkIn}
                  onChange={(e) => {
                    update('checkIn', e.target.value);
                    if (e.target.value >= state.checkOut) {
                      const d = new Date(e.target.value);
                      d.setDate(d.getDate() + 1);
                      update('checkOut', d.toISOString().slice(0, 10));
                    }
                  }}
                  className="w-full bg-transparent outline-none text-slate-800 text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block px-4 pt-3 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                Check-out
              </label>
              <div className="flex items-center gap-2 px-4 pb-3">
                <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                <input
                  type="date"
                  min={state.checkIn}
                  value={state.checkOut}
                  onChange={(e) => update('checkOut', e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-800 text-sm"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="md:col-span-2">
              <label className="block px-4 pt-3 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                Date
              </label>
              <div className="flex items-center gap-2 px-4 pb-3">
                <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                <input
                  type="date"
                  min={todayIso()}
                  value={state.checkIn}
                  onChange={(e) => update('checkIn', e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-800 text-sm min-w-0"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="block px-4 pt-3 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                Start
              </label>
              <div className="flex items-center gap-2 px-4 pb-3">
                <Clock className="w-4 h-4 text-primary-600 shrink-0" />
                <input
                  type="time"
                  value={state.startTime}
                  onChange={(e) => update('startTime', e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-800 text-sm min-w-0"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="block px-4 pt-3 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                Hours
              </label>
              <div className="flex items-center gap-2 px-4 pb-3">
                <select
                  value={state.duration}
                  onChange={(e) => update('duration', Number(e.target.value))}
                  className="w-full bg-transparent outline-none text-slate-800 text-sm min-w-0"
                >
                  {[1, 2, 3, 4, 6, 8, 12].map((h) => (
                    <option key={h} value={h}>
                      {h} hr
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Guests */}
        <div className="relative md:col-span-2" ref={guestRef}>
          <label className="block px-4 pt-3 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
            Guests {state.mode === 'rooms' ? '& Rooms' : ''}
          </label>
          <button
            type="button"
            onClick={() => setOpenGuests((o) => !o)}
            className="w-full flex items-center gap-2 px-4 pb-3 text-left"
          >
            <Users className="w-4 h-4 text-primary-600 shrink-0" />
            <span className="text-sm text-slate-800">
              {state.guests} guest{state.guests > 1 ? 's' : ''}
              {state.mode === 'rooms' ? `, ${state.rooms} room${state.rooms > 1 ? 's' : ''}` : ''}
            </span>
          </button>
          {openGuests && (
            <div className="absolute z-30 right-0 mt-1 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl p-3">
              <Stepper
                label="Guests"
                value={state.guests}
                min={1}
                max={10}
                onChange={(v) => update('guests', v)}
              />
              {state.mode === 'rooms' && (
                <Stepper
                  label="Rooms"
                  value={state.rooms}
                  min={1}
                  max={5}
                  onChange={(v) => update('rooms', v)}
                />
              )}
              <button
                type="button"
                onClick={() => setOpenGuests(false)}
                className="w-full mt-2 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-lg py-2"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Submit — mobile (full row), and desktop (inline at end) */}
        <div className="md:col-span-1 md:hidden">
          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold shadow-md"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </div>
        <div className="hidden md:flex md:col-span-1 items-center justify-center p-2">
          <button
            type="submit"
            aria-label="Search"
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border border-gray-200 text-slate-700 disabled:opacity-40 hover:bg-gray-50"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-medium">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full border border-gray-200 text-slate-700 disabled:opacity-40 hover:bg-gray-50"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
