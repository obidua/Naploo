'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, UtensilsCrossed, ArrowRight } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApiExt } from '../_lib/pms-api-ext';
import { formatMoney } from '../_lib/pms-api';
import { cn } from '@/lib/utils';

const KIND_EMOJI: Record<string, string> = {
  restaurant: '🍽️', bar: '🍷', spa: '💆', laundry: '🧺', other: '🏷️',
};

export default function POSPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const router = useRouter();
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [tableNo, setTableNo] = useState('');

  async function loadOutlets() {
    setLoading(true);
    const res = await pmsApiExt.listOutlets();
    setLoading(false);
    if (!res.data) { setError(res.error || 'Failed'); return; }
    setOutlets(res.data.outlets || []);
    if (res.data.outlets?.length && !selectedOutlet) setSelectedOutlet(res.data.outlets[0].id);
  }

  async function loadOrders() {
    if (!selectedOutlet) return;
    const res = await pmsApiExt.listOrders(selectedOutlet, 'open');
    if (res.data) setOrders(res.data.orders || []);
  }

  useEffect(() => { loadOutlets(); }, []);
  useEffect(() => { loadOrders(); }, [selectedOutlet]);

  async function createOrder() {
    if (!selectedOutlet || !tableNo.trim()) return;
    setCreating(true);
    const res = await pmsApiExt.createOrder(selectedOutlet, { tableNo: tableNo.trim() });
    setCreating(false);
    if (res.data?.success) {
      router.push(`/partner/portal/pos/order/${res.data.order.id}`);
    }
  }

  if (loading && outlets.length === 0) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;
  }
  if (error) return <ErrorBanner message={error} />;
  if (outlets.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500 mb-3">No outlets configured. Go to Menu page to add one.</p>
        <button onClick={() => router.push('/partner/portal/menu')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          Set up menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">F&B POS</h1>
        <p className="text-sm text-slate-500">Open orders by table, charge to room or settle directly.</p>
      </div>

      {/* Outlet picker */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3 flex flex-wrap gap-2">
        {outlets.map((o) => (
          <button key={o.id} onClick={() => setSelectedOutlet(o.id)} className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium',
            selectedOutlet === o.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
          )}>
            {KIND_EMOJI[o.kind] || '🏷️'} {o.name}
          </button>
        ))}
      </div>

      {/* New order */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Open new order</h2>
        <div className="flex gap-2">
          <input value={tableNo} onChange={(e) => setTableNo(e.target.value)} placeholder="Table number (e.g. T-12, Take-away)" className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2" />
          <button onClick={createOrder} disabled={creating || !tableNo.trim()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold disabled:opacity-60">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Open
          </button>
        </div>
      </section>

      {/* Open orders list */}
      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Open orders</h2>
          <span className="text-xs text-slate-500">{orders.length}</span>
        </div>
        {orders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">No open orders.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {orders.map((o) => (
              <li key={o.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Table {o.tableNo || '—'}</div>
                  <div className="text-xs text-slate-500">
                    Opened {new Date(o.openedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    {o.folioId && ` · linked to folio`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{formatMoney(o.totalCharges)}</div>
                  </div>
                  <button onClick={() => router.push(`/partner/portal/pos/order/${o.id}`)} className="text-xs text-primary-600 hover:underline inline-flex items-center gap-1">
                    Open <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
