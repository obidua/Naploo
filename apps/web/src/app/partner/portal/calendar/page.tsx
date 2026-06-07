'use client';

import { useEffect, useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApiExt } from '../_lib/pms-api-ext';
import { cn } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-emerald-200 text-emerald-900 border-emerald-400',
  checked_in: 'bg-blue-200 text-blue-900 border-blue-400',
  checked_out: 'bg-slate-200 text-slate-700 border-slate-400',
  pending: 'bg-amber-200 text-amber-900 border-amber-400',
};

export default function CalendarPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(14);

  async function load() {
    setLoading(true);
    const res = await pmsApiExt.calendar(startDate, days);
    setLoading(false);
    if (!res.data) { setError(res.error || 'Failed to load calendar'); return; }
    setData(res.data);
  }
  useEffect(() => { load(); }, [startDate, days]);

  if (loading && !data) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;
  }
  if (error || !data) return <ErrorBanner message={error || 'No data'} />;

  function shiftStart(deltaDays: number) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + deltaDays);
    setStartDate(d.toISOString().slice(0, 10));
  }

  // Build bookings per room map
  const bookingsByRoom: Record<string, any[]> = {};
  for (const b of data.bookings) {
    if (b.roomId) {
      if (!bookingsByRoom[b.roomId]) bookingsByRoom[b.roomId] = [];
      bookingsByRoom[b.roomId].push(b);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reservation calendar</h1>
          <p className="text-sm text-slate-500">Rooms × dates timeline. Hover a bar to see details.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftStart(-days)} className="p-2 rounded-xl border border-gray-200 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2" />
          <button onClick={() => shiftStart(days)} className="p-2 rounded-xl border border-gray-200 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white">
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
          </select>
        </div>
      </div>

      {/* Calendar grid */}
      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-collapse min-w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="sticky left-0 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-3 py-2 border-b border-r border-gray-200 z-10 min-w-[140px]">Room</th>
                {data.dayKeys.map((day: string) => {
                  const d = new Date(day);
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <th key={day} className={cn(
                      'text-center text-[10px] font-semibold py-2 border-b border-gray-200 min-w-[44px]',
                      isWeekend ? 'bg-primary-50 text-primary-700' : 'text-slate-600'
                    )}>
                      <div>{d.getDate()}</div>
                      <div className="text-[9px] font-normal opacity-70">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.rooms.length === 0 && (
                <tr><td colSpan={data.days + 1} className="px-5 py-8 text-center text-sm text-slate-500">No rooms.</td></tr>
              )}
              {data.rooms.map((r: any) => {
                const myBookings = bookingsByRoom[r.id] || [];
                return (
                  <tr key={r.id}>
                    <td className="sticky left-0 bg-white px-3 py-2 border-b border-r border-gray-200 z-10">
                      <div className="font-semibold text-slate-800">Room {r.number}</div>
                      <div className="text-[10px] text-slate-500">{r.type} · ₹{r.dailyRate}</div>
                    </td>
                    {data.dayKeys.map((day: string) => {
                      const d = new Date(day);
                      const booking = myBookings.find((b: any) => {
                        const inD = new Date(b.checkIn);
                        const outD = new Date(b.checkOut);
                        return inD.toISOString().slice(0, 10) <= day && day < outD.toISOString().slice(0, 10);
                      });
                      const isCheckIn = booking && new Date(booking.checkIn).toISOString().slice(0, 10) === day;
                      const isCheckOut = booking && new Date(booking.checkOut).toISOString().slice(0, 10) === day;
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      return (
                        <td key={day} className={cn(
                          'h-10 border-b border-gray-100 relative p-0',
                          isWeekend && !booking && 'bg-primary-50/30'
                        )}>
                          {booking ? (
                            <div className={cn(
                              'absolute inset-x-0 inset-y-1 mx-0.5 rounded text-[10px] flex items-center justify-center cursor-pointer group border-2',
                              STATUS_COLOR[booking.status] || 'bg-slate-200 text-slate-800',
                              isCheckIn && 'ml-1',
                              isCheckOut && 'mr-1'
                            )}>
                              <span className="truncate px-1">{booking.number?.slice(-4) || ''}</span>
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                                {booking.number} · ₹{booking.total}
                              </div>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Legend */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3 flex flex-wrap gap-3 text-xs text-slate-600">
        <CalIcon className="w-4 h-4 text-primary-600" />
        {Object.entries(STATUS_COLOR).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1">
            <span className={cn('w-3 h-3 rounded border-2', c)} /> {k.replace('_', ' ')}
          </span>
        ))}
        <span className="ml-auto text-slate-500">Total bookings shown: <b>{data.bookings.length}</b></span>
      </div>
    </div>
  );
}
