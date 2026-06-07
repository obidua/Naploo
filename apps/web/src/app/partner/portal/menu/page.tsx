'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, UtensilsCrossed, X, Save, Edit3 } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApiExt } from '../_lib/pms-api-ext';
import { formatMoney } from '../_lib/pms-api';
import { cn } from '@/lib/utils';

const OUTLET_KINDS = [
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'bar', label: '🍷 Bar' },
  { value: 'spa', label: '💆 Spa' },
  { value: 'laundry', label: '🧺 Laundry' },
  { value: 'other', label: '🏷️ Other' },
];

export default function MenuPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ categories: any[]; items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOutlet, setShowOutlet] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showItem, setShowItem] = useState(false);

  async function loadOutlets() {
    setLoading(true);
    const res = await pmsApiExt.listOutlets();
    setLoading(false);
    if (!res.data) { setError(res.error || 'Failed to load outlets'); return; }
    setOutlets(res.data.outlets || []);
    if (res.data.outlets?.length && !selectedOutlet) {
      setSelectedOutlet(res.data.outlets[0].id);
    }
  }

  async function loadMenu() {
    if (!selectedOutlet) { setMenu(null); return; }
    const res = await pmsApiExt.getMenu(selectedOutlet);
    if (res.data) setMenu({ categories: res.data.categories, items: res.data.items });
  }

  useEffect(() => { loadOutlets(); }, []);
  useEffect(() => { if (selectedOutlet) loadMenu(); }, [selectedOutlet]);

  if (loading && outlets.length === 0) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Menu & outlets</h1>
          <p className="text-sm text-slate-500">F&B outlets, menu categories, items.</p>
        </div>
        <button onClick={() => setShowOutlet(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New outlet
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {outlets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No outlets yet. Add a restaurant, bar, or spa to start.</p>
        </div>
      ) : (
        <>
          {/* Outlet picker */}
          <div className="bg-white border border-gray-200 rounded-2xl p-3 flex flex-wrap gap-2">
            {outlets.map((o) => (
              <button key={o.id} onClick={() => setSelectedOutlet(o.id)} className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium',
                selectedOutlet === o.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
              )}>
                {OUTLET_KINDS.find((k) => k.value === o.kind)?.label.split(' ')[0]} {o.name}
              </button>
            ))}
          </div>

          {/* Menu */}
          {selectedOutlet && menu && (
            <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Menu</h2>
                <div className="flex gap-2">
                  <button onClick={() => setShowCategory(true)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary-300">
                    <Plus className="w-3 h-3" /> Category
                  </button>
                  <button onClick={() => setShowItem(true)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 text-white">
                    <Plus className="w-3 h-3" /> Menu item
                  </button>
                </div>
              </div>
              {menu.items.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500">No menu items yet.</p>
              ) : (
                <>
                  {menu.categories.length === 0 ? (
                    <ItemGrid items={menu.items} onChange={loadMenu} />
                  ) : (
                    menu.categories.map((cat) => {
                      const items = menu.items.filter((i) => i.categoryId === cat.id);
                      return (
                        <div key={cat.id} className="border-b border-gray-100 last:border-b-0">
                          <h3 className="px-5 py-2 text-xs uppercase tracking-wide font-bold text-slate-700 bg-slate-50">{cat.name}</h3>
                          <ItemGrid items={items} onChange={loadMenu} />
                        </div>
                      );
                    })
                  )}
                  {menu.items.filter((i) => !i.categoryId).length > 0 && (
                    <div className="border-t border-gray-100">
                      <h3 className="px-5 py-2 text-xs uppercase tracking-wide font-bold text-slate-700 bg-slate-50">Uncategorized</h3>
                      <ItemGrid items={menu.items.filter((i) => !i.categoryId)} onChange={loadMenu} />
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </>
      )}

      {showOutlet && <OutletModal onClose={() => setShowOutlet(false)} onSaved={() => { setShowOutlet(false); loadOutlets(); }} />}
      {showCategory && selectedOutlet && (
        <CategoryModal outletId={selectedOutlet} onClose={() => setShowCategory(false)} onSaved={() => { setShowCategory(false); loadMenu(); }} />
      )}
      {showItem && selectedOutlet && (
        <ItemModal outletId={selectedOutlet} categories={menu?.categories || []} onClose={() => setShowItem(false)} onSaved={() => { setShowItem(false); loadMenu(); }} />
      )}
    </div>
  );
}

function ItemGrid({ items, onChange }: { items: any[]; onChange: () => void }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
      {items.map((item) => (
        <article key={item.id} className="border border-gray-200 rounded-xl p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-slate-900 truncate">{item.name}</h4>
              {item.description && <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>}
            </div>
            <span className="text-lg font-bold text-slate-900 whitespace-nowrap">{formatMoney(item.price)}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className={cn('text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded', item.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
              {item.isAvailable ? 'available' : 'unavailable'}
            </span>
            <button onClick={async () => { await pmsApiExt.updateMenuItem(item.id, { isAvailable: !item.isAvailable }); onChange(); }} className="text-xs text-primary-600 hover:underline">
              {item.isAvailable ? 'Hide' : 'Show'}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function OutletModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('restaurant');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!name.trim()) { setError('Name required'); return; }
    setBusy(true);
    const res = await pmsApiExt.createOutlet({ name: name.trim(), kind });
    setBusy(false);
    if (!res.data?.success) { setError(res.error || 'Save failed'); return; }
    onSaved();
  }

  return (
    <Modal title="New outlet" onClose={onClose}>
      <Lbl label="Name *"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="The Imperial Restaurant" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" /></Lbl>
      <div className="mt-3">
        <Lbl label="Type">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2">
            {OUTLET_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </Lbl>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <button onClick={save} disabled={busy} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create outlet
      </button>
    </Modal>
  );
}

function CategoryModal({ outletId, onClose, onSaved }: { outletId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setBusy(true);
    await pmsApiExt.addCategory(outletId, name.trim());
    setBusy(false);
    onSaved();
  }

  return (
    <Modal title="New category" onClose={onClose}>
      <Lbl label="Category name *"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Starters / Mains / Drinks" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" /></Lbl>
      <button onClick={save} disabled={busy || !name.trim()} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
      </button>
    </Modal>
  );
}

function ItemModal({ outletId, categories, onClose, onSaved }: { outletId: string; categories: any[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState<string>('');
  const [taxable, setTaxable] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!name.trim() || price <= 0) { setError('Name and price required'); return; }
    setBusy(true);
    const res = await pmsApiExt.addMenuItem(outletId, {
      name: name.trim(), description: description.trim() || undefined,
      price, taxable, categoryId: categoryId || undefined,
    });
    setBusy(false);
    if (!res.data?.success) { setError(res.error || 'Save failed'); return; }
    onSaved();
  }

  return (
    <Modal title="New menu item" onClose={onClose}>
      <div className="space-y-3">
        <Lbl label="Name *"><input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" /></Lbl>
        <Lbl label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" /></Lbl>
        <div className="grid grid-cols-2 gap-3">
          <Lbl label="Price (₹) *"><input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" /></Lbl>
          <Lbl label="Category"><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"><option value="">Uncategorized</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Lbl>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={taxable} onChange={(e) => setTaxable(e.target.checked)} /> Taxable</label>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <button onClick={save} disabled={busy} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save item
      </button>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Lbl({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      {children}
    </label>
  );
}
