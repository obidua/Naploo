'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2, LogIn, LogOut, Bed, IndianRupee, AlertCircle, Plus,
  Clock, User, ArrowRight, RefreshCw,
} from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApi, formatMoney, type TodaySummary } from '../_lib/pms-api';
import { cn } from '@/lib/utils';

export default function TodayPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [data, setData] = useState<{
    summary: TodaySummary;
    arrivalsToday: any[];
    departuresToday: any[];
    inHouse: any[];
    openFolios: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await pmsApi.today();
    setLoading(false);
    if (!res.data) {
      setError(res.error || 'Failed to load today');
      return;
    }
    setData({
      summary: res.data.summary,
      arrivalsToday: res.data.arrivalsToday || [],
      departuresToday: res.data.departuresToday || [],
      inHouse: res.data.inHouse || [],
      openFolios: res.data.openFolios || [],
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function quickCheckIn(bookingId: string) {
    setBusy(bookingId);
    await pmsApi.checkIn(bookingId);
    setBusy(null);
    await load();
  }
  async function quickCheckOut(bookingId: string) {
    setBusy(bookingId);
    await pmsApi.checkOut(bookingId);
    setBusy(null);
    await load();
  }

  if (loading && !data) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
      </div>
    );
  }
  if (error || !data) return <ErrorBanner message={error || 'No data'} />;

  const { summary, arrivalsToday, departuresToday, inHouse, openFolios } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Today</h1>
          <p className="text-sm text-slate-500">Front-desk hub for arrivals, departures, in-house guests, and dues.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/partner/portal/walk-in"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Walk-in
          </Link>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi label="Arrivals today" value={String(summary.arrivalsToday)} icon={<LogIn className="w-5 h-5" />} color="from-blue-500 to-cyan-500" />
        <Kpi label="Departures today" value={String(summary.departuresToday)} icon={<LogOut className="w-5 h-5" />} color="from-amber-500 to-orange-500" />
        <Kpi label="In-house" value={String(summary.inHouse)} icon={<Bed className="w-5 h-5" />} color="from-emerald-500 to-teal-500" />
        <Kpi label="Open folios" value={String(summary.openFolios)} icon={<AlertCircle className="w-5 h-5" />} color="from-violet-500 to-purple-500" />
        <Kpi label="Outstanding dues" value={formatMoney(summary.totalDues)} icon={<IndianRupee className="w-5 h-5" />} color="from-red-500 to-pink-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <BookingsList
          title="Arrivals today"
          empty="No arrivals scheduled for today."
          bookings={arrivalsToday}
          actionLabel="Check in"
          action={(b) => quickCheckIn(b.id)}
          actionDisabled={(b) => b.status === 'checked_in' || b.status === 'checked_out'}
          busy={busy}
        />
        <BookingsList
          title="Departures today"
          empty="No departures scheduled for today."
          bookings={departuresToday}
          actionLabel="Check out"
          action={(b) => quickCheckOut(b.id)}
          actionDisabled={(b) => b.status === 'checked_out'}
          busy={busy}
        />
      </div>

      <BookingsList
        title="In-house guests"
        empty="No guests currently checked-in."
        bookings={inHouse}
        actionLabel="Check out"
        action={(b) => quickCheckOut(b.id)}
        actionDisabled={(b) => b.status === 'checked_out'}
        busy={busy}
      />

      {/* Open folios */}
      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Open folios with balance</h2>
          <span className="text-xs text-slate-500">{openFolios.length} open</span>
        </div>
        {openFolios.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">All folios closed — nothing pending.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {openFolios.map((f: any) => (
              <li key={f.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-mono text-slate-800">Folio {f.id.slice(0, 8)}…</div>
                  <div className="text-xs text-slate-500">
                    Opened {new Date(f.openedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    Balance <span className={cn('font-bold', Number(f.balance) > 0 ? 'text-red-600' : 'text-emerald-700')}>
                      {formatMoney(f.balance)}
                    </span>
                  </div>
                  <Link
                    href={`/partner/portal/folio/${f.id}`}
                    className="text-xs text-primary-600 inline-flex items-center gap-1 hover:underline"
                  >
                    Open folio <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-2`}>
        {icon}
      </div>
      <div className="text-[11px] uppercase text-slate-500 tracking-wide font-semibold">{label}</div>
      <div className="text-xl font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}

function BookingsList({
  title,
  empty,
  bookings,
  actionLabel,
  action,
  actionDisabled,
  busy,
}: {
  title: string;
  empty: string;
  bookings: any[];
  actionLabel: string;
  action: (b: any) => void;
  actionDisabled: (b: any) => boolean;
  busy: string | null;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-500">{bookings.length}</span>
      </div>
      {bookings.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {bookings.map((b: any) => (
            <li key={b.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">{b.bookingNumber}</div>
                <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(b.checkIn).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {b.guestCount}
                  </span>
                  <StatusBadge status={b.status} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">{formatMoney(b.total)}</div>
                <button
                  onClick={() => action(b)}
                  disabled={actionDisabled(b) || busy === b.id}
                  className="mt-1 text-xs text-primary-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {busy === b.id ? 'Working…' : actionLabel} →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
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
    <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
