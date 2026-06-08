'use client';

import { useEffect, useState } from 'react';
import { Loader2, Wrench, CheckCircle, Sparkles, RefreshCw } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApi } from '../_lib/pms-api';
import { cn } from '@/lib/utils';

const STATUSES = [
  { value: 'vacant_clean', label: 'Vacant clean', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'vacant_dirty', label: 'Dirty', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'occupied', label: 'Occupied', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'inspected', label: 'Inspected', color: 'bg-violet-100 text-violet-800 border-violet-300' },
  { value: 'out_of_order', label: 'Out of order', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-slate-200 text-slate-700 border-slate-400' },
];

const statusColor = (s: string) => STATUSES.find((x) => x.value === s)?.color || 'bg-slate-50 text-slate-600 border-slate-200';
const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label || s;

export default function HousekeepingPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [podSets, setPodSets] = useState<any[]>([]);
  const [standalonePods, setStandalonePods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await pmsApi.housekeepingBoard();
    setLoading(false);
    if (!res.data) {
      setError(res.error || 'Failed to load board');
      return;
    }
    setRooms(res.data.rooms || []);
    setPodSets(res.data.podSets || []);
    setStandalonePods(res.data.standalonePods || []);
  }
  useEffect(() => { load(); }, []);

  async function changeStatus(target: 'room' | 'pod', id: string, status: string) {
    await pmsApi.setHousekeepingStatus(target === 'room' ? { roomId: id, status } : { podId: id, status });
    await load();
  }

  // Summary counts
  const counts: Record<string, number> = {};
  for (const r of rooms) counts[r.status] = (counts[r.status] || 0) + 1;

  if (loading && rooms.length === 0 && podSets.length === 0 && standalonePods.length === 0) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Housekeeping board</h1>
          <p className="text-sm text-slate-500">Click a room/pod to change its cleaning status.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-slate-700">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Status summary */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {STATUSES.map((s) => (
          <div key={s.value} className={cn('rounded-xl p-3 border text-center', s.color)}>
            <div className="text-2xl font-bold">{counts[s.value] || 0}</div>
            <div className="text-[11px] uppercase font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rooms grid */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-600" /> Rooms ({rooms.length})
        </h2>
        {rooms.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No rooms.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {rooms.map((r: any) => (
              <RoomCell key={r.id} target="room" id={r.id} label={r.number} status={r.status} onChange={changeStatus} />
            ))}
          </div>
        )}
      </section>

      {/* Pod sets */}
      {podSets.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Pod sets ({podSets.length})</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {podSets.map((p: any) => (
              <RoomCell key={p.id} target="pod" id={p.id} label={p.setNumber} status={p.status} onChange={changeStatus} />
            ))}
          </div>
        </section>
      )}

      {/* Standalone pods */}
      {standalonePods.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Single pods ({standalonePods.length})</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {standalonePods.map((p: any) => (
              <RoomCell key={p.id} target="pod" id={p.id} label={p.podNumber} status={p.status} onChange={changeStatus} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RoomCell({
  target, id, label, status, onChange,
}: {
  target: 'room' | 'pod'; id: string; label: string; status: string;
  onChange: (target: 'room' | 'pod', id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn('w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-sm font-semibold transition-all hover:scale-105', statusColor(status))}
      >
        {label}
        <span className="text-[10px] mt-1 opacity-70 uppercase truncate w-full px-1 text-center">{statusLabel(status)}</span>
      </button>
      {open && (
        <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-1 min-w-[140px]">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                onChange(target, id, s.value);
                setOpen(false);
              }}
              className={cn(
                'w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-slate-50',
                status === s.value && 'bg-primary-50 text-primary-700 font-semibold'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
