'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, ArrowLeft, Plus, Minus, X, CheckCircle2, Lock, Search,
} from 'lucide-react';
import PortalShell, { ErrorBanner } from '../../../_lib/PortalShell';
import { pmsApiExt } from '../../../_lib/pms-api-ext';
import { pmsApi, formatMoney } from '../../../_lib/pms-api';
import { cn } from '@/lib/utils';

export default function POSOrderPage({ params }: { params: { id: string } }) {
  return (
    <PortalShell>
      <Body orderId={params.id} />
    </PortalShell>
  );
}

function Body({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [menu, setMenu] = useState<{ categories: any[]; items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showClose, setShowClose] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await pmsApiExt.getOrder(orderId);
    setLoading(false);
    if (!res.data) { setError(res.error || 'Order not found'); return; }
    setOrder(res.data.order);
    setItems(res.data.items || []);
    // Load menu for outlet
    if (res.data.order?.outletId) {
      const m = await pmsApiExt.getMenu(res.data.order.outletId);
      if (m.data) setMenu({ categories: m.data.categories, items: m.data.items });
    }
  }
  useEffect(() => { load(); }, [orderId]);

  async function addItem(menuItemId: string) {
    setBusy(menuItemId);
    await pmsApiExt.addOrderItem(orderId, { menuItemId, qty: 1 });
    setBusy(null);
    await load();
  }

  if (loading && !order) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;
  }
  if (error || !order) return <ErrorBanner message={error || 'Order not found'} />;
  if (order.status === 'closed') {
    return (
      <div className="space-y-3">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-slate-500"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <CheckCircle2 className="w-7 h-7 text-emerald-700 mb-2" />
          <h2 className="font-bold text-emerald-900">Order closed</h2>
          <p className="text-sm text-emerald-800 mt-1">Table {order.tableNo} · {formatMoney(order.totalCharges)}</p>
        </div>
      </div>
    );
  }

  const filteredItems = !menu ? [] : menu.items.filter((m) =>
    !search.trim() || m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-slate-500"><ArrowLeft className="w-4 h-4" /> Back</button>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        {/* Menu */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu…" className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2" />
          </div>
          {!menu ? <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto my-6" /> : (
            <div className="grid sm:grid-cols-2 gap-2 max-h-[600px] overflow-y-auto">
              {filteredItems.filter((m) => m.isAvailable).map((m) => (
                <button key={m.id} onClick={() => addItem(m.id)} disabled={busy === m.id} className="text-left p-3 rounded-xl border border-gray-200 hover:border-primary-300 disabled:opacity-50">
                  <div className="font-semibold text-slate-900 text-sm">{m.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{formatMoney(m.price)}</div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-white border border-gray-200 rounded-2xl">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-slate-900">Table {order.tableNo || '—'}</h2>
              <p className="text-xs text-slate-500">{items.length} item{items.length === 1 ? '' : 's'}</p>
            </div>
            {items.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">Tap menu items to add.</p>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {items.map((it) => (
                  <li key={it.id} className="px-5 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{it.menuName}</div>
                      <div className="text-xs text-slate-500">{it.qty} × {formatMoney(it.unitPrice)}</div>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{formatMoney(it.amount)}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="p-5 border-t border-gray-100">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-sm text-slate-500">Total</span>
                <span className="text-2xl font-bold text-slate-900">{formatMoney(order.totalCharges)}</span>
              </div>
              <button onClick={() => setShowClose(true)} disabled={items.length === 0} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
                <Lock className="w-4 h-4" /> Close order
              </button>
            </div>
          </div>
        </aside>
      </div>

      {showClose && <CloseOrderModal orderId={orderId} onClose={() => setShowClose(false)} onClosed={() => router.push('/partner/portal/pos')} />}
    </div>
  );
}

function CloseOrderModal({ orderId, onClose, onClosed }: { orderId: string; onClose: () => void; onClosed: () => void }) {
  const [folioId, setFolioId] = useState('');
  const [busy, setBusy] = useState(false);

  async function settle() {
    setBusy(true);
    await pmsApiExt.closeOrder(orderId, folioId || undefined);
    setBusy(false);
    onClosed();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">Close order</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <p className="text-sm text-slate-600 mb-3">Charge this order to a guest's folio (room booking) or settle directly.</p>
        <label className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Folio ID (optional)</label>
        <input value={folioId} onChange={(e) => setFolioId(e.target.value)} placeholder="Paste folio ID from Today page" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono" />
        <p className="text-[11px] text-slate-500 mt-2">Leave empty for take-away / cash settlement at counter.</p>
        <button onClick={settle} disabled={busy} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Close order
        </button>
      </div>
    </div>
  );
}
