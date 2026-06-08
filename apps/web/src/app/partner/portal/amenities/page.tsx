'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, CheckCircle2, Sparkles } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Amenity {
  id: string; slug: string; name: string;
  category: string; icon?: string;
  scope: 'property' | 'room' | 'both';
  min_tier?: string;
  sort_order: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  room: 'In-room',
  connectivity: 'Connectivity',
  food: 'Food & beverage',
  business: 'Business',
  wellness: 'Wellness',
  safety: 'Safety & security',
  family: 'Family / accessibility',
  outdoor: 'Outdoor / transport',
  accessibility: 'Accessibility',
};

export default function AmenitiesPage() {
  return <PortalShell><Body /></PortalShell>;
}

function Body() {
  const [catalog, setCatalog] = useState<Amenity[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  async function load() {
    setLoading(true);
    const [cr, mr] = await Promise.all([
      api.get<{ amenities: Amenity[] }>('/api/v1/pms/amenities-catalog'),
      api.get<{ amenities: Amenity[] }>('/api/v1/pms/property-amenities'),
    ]);
    setLoading(false);
    if (cr.data?.amenities) setCatalog(cr.data.amenities);
    if (mr.data?.amenities) setSelected(new Set(mr.data.amenities.map((a) => a.slug)));
  }
  useEffect(() => { load(); }, []);

  function toggle(slug: string) {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelected(next);
  }

  async function save() {
    setSaving(true);
    const r = await api.put<{ success: boolean; count: number }>('/api/v1/pms/property-amenities', { slugs: Array.from(selected) });
    setSaving(false);
    if (r.data?.success) {
      setSavedMsg(`Saved ${r.data.count} amenities`);
      setTimeout(() => setSavedMsg(''), 2500);
    }
  }

  // Group by category, filter to property + both scope
  const grouped: Record<string, Amenity[]> = {};
  for (const a of catalog) {
    if (a.scope === 'room') continue;
    (grouped[a.category] ||= []).push(a);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between sticky top-20 bg-slate-50 z-10 py-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary-600" /> Property amenities</h1>
          <p className="text-sm text-slate-500">Pick amenities your property offers. They show on your listing + room search filters.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && <span className="text-xs text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{savedMsg}</span>}
          <span className="text-xs text-slate-500">{selected.size} selected</span>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat} className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">{CATEGORY_LABEL[cat] || cat}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {items.sort((a, b) => a.sort_order - b.sort_order).map((a) => {
                  const isSelected = selected.has(a.slug);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggle(a.slug)}
                      className={cn(
                        'flex items-center gap-2 p-2.5 rounded-xl border text-left text-sm transition',
                        isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className={cn('w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center', isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300')}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-slate-800">{a.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
