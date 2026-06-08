'use client';

// First-login wizard. Shown when partners.features_enabled.wizard_completed is false.
// 5-step flow: welcome -> tier -> modules -> amenities -> check-in/out times.
import { useEffect, useState } from 'react';
import { X, ArrowRight, Check, Sparkles, Building2, Wrench, ImageIcon, Clock, Loader2 } from 'lucide-react';
import { pmsApi } from './pms-api';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TierDef { slug: string; name: string; rank: number; allowed_modules: string[]; required_amenities: string[]; description?: string }
interface Amenity { id: string; slug: string; name: string; category: string; scope: string; min_tier?: string; sort_order: number }

const MODULE_LABELS: Record<string, string> = {
  walk_in: 'Walk-in booking', folio_billing: 'Folio & billing', online_bookings: 'Online bookings',
  housekeeping: 'Housekeeping', extra_services: 'Extras & services', fnb_pos: 'F&B POS',
  multi_outlet: 'Multi-outlet', spa_services: 'Spa', corporate_rates: 'Corporate rates',
  advanced_reports: 'Advanced reports', loyalty: 'Loyalty', concierge: 'Concierge',
  channel_manager: 'Channel Manager',
};

export default function OnboardingWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [tiers, setTiers] = useState<TierDef[]>([]);
  const [amenityCatalog, setAmenityCatalog] = useState<Amenity[]>([]);
  const [tier, setTier] = useState('');
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [amenitySlugs, setAmenitySlugs] = useState<Set<string>>(new Set());
  const [checkIn, setCheckIn] = useState('14:00');
  const [checkOut, setCheckOut] = useState('11:00');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [tr, ar] = await Promise.all([
        api.get<{ tiers: TierDef[] }>('/api/v1/pms/tiers'),
        api.get<{ amenities: Amenity[] }>('/api/v1/pms/amenities-catalog'),
      ]);
      if (tr.data?.tiers) setTiers(tr.data.tiers);
      if (ar.data?.amenities) setAmenityCatalog(ar.data.amenities);
    })();
  }, []);

  // Pre-select tier defaults when tier picked
  useEffect(() => {
    if (!tier || tiers.length === 0) return;
    const td = tiers.find((t) => t.slug === tier);
    if (!td) return;
    const m: Record<string, boolean> = {};
    for (const k of td.allowed_modules) m[k] = true;
    setModules(m);
    setAmenitySlugs(new Set(td.required_amenities));
  }, [tier, tiers]);

  async function finish() {
    setBusy(true);
    // 1. Save config
    await pmsApi.updateConfig({
      tier,
      featuresEnabled: { modules, wizard_completed: true } as any,
      checkInTime: checkIn,
      checkOutTime: checkOut,
    } as any);
    // 2. Save amenities
    await api.put('/api/v1/pms/property-amenities', { slugs: Array.from(amenitySlugs) });
    setBusy(false);
    onDone();
  }

  function next() { setStep(step + 1); }
  function prev() { setStep(Math.max(0, step - 1)); }

  const steps = [
    { icon: Sparkles, label: 'Welcome' },
    { icon: Building2, label: 'Property tier' },
    { icon: Wrench, label: 'Modules' },
    { icon: ImageIcon, label: 'Amenities' },
    { icon: Clock, label: 'Times' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header with stepper */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-violet-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Welcome to Naploo PMS</h2>
            <span className="text-xs text-slate-500">Step {step + 1} of {steps.length}</span>
          </div>
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={i} className={cn('flex-1 h-1.5 rounded-full', i <= step ? 'bg-gradient-to-r from-primary-500 to-violet-500' : 'bg-slate-200')} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
            {(() => { const S = steps[step].icon; return <S className="w-3.5 h-3.5" />; })()}
            <span className="font-semibold">{steps[step].label}</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && <Welcome />}
          {step === 1 && <TierPicker tiers={tiers} value={tier} onChange={setTier} />}
          {step === 2 && <ModulesPicker tiers={tiers} tier={tier} modules={modules} setModules={setModules} />}
          {step === 3 && <AmenitiesPicker catalog={amenityCatalog} selected={amenitySlugs} setSelected={setAmenitySlugs} />}
          {step === 4 && <TimesPicker checkIn={checkIn} checkOut={checkOut} setCheckIn={setCheckIn} setCheckOut={setCheckOut} />}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
          <button onClick={prev} disabled={step === 0 || busy} className="text-sm text-slate-500 disabled:opacity-30">← Back</button>
          {step < steps.length - 1 ? (
            <button onClick={next} disabled={(step === 1 && !tier) || busy} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-50">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={finish} disabled={busy} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Finish setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Welcome() {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 mx-auto mb-4 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">Let's set up your property in 4 quick steps.</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Pick your tier, enable the PMS modules you need, select your amenities, and confirm check-in/out times. Takes about 2 minutes.</p>
      <div className="grid grid-cols-2 gap-3 mt-6 max-w-md mx-auto text-left text-sm">
        <div className="bg-slate-50 rounded-xl p-3"><div className="font-semibold">⚡ Smart defaults</div><div className="text-xs text-slate-500">Your tier auto-selects the right modules + amenities</div></div>
        <div className="bg-slate-50 rounded-xl p-3"><div className="font-semibold">🔄 Editable later</div><div className="text-xs text-slate-500">Change everything anytime from Settings</div></div>
      </div>
    </div>
  );
}

function TierPicker({ tiers, value, onChange }: { tiers: TierDef[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900 mb-1">What's your property tier?</h3>
      <p className="text-xs text-slate-500 mb-4">This decides which modules + amenities are recommended.</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {tiers.map((t) => (
          <button key={t.slug} onClick={() => onChange(t.slug)} className={cn('p-3 rounded-xl border text-left', value === t.slug ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300')}>
            <div className="font-semibold text-slate-900">{t.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{t.description}</div>
            <div className="text-[10px] text-slate-400 mt-1">{t.allowed_modules.length} modules · {t.required_amenities.length} amenities suggested</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ModulesPicker({ tiers, tier, modules, setModules }: { tiers: TierDef[]; tier: string; modules: Record<string, boolean>; setModules: (m: Record<string, boolean>) => void }) {
  const td = tiers.find((t) => t.slug === tier);
  const allowed = td?.allowed_modules || [];
  return (
    <div>
      <h3 className="font-semibold text-slate-900 mb-1">Which PMS modules to enable?</h3>
      <p className="text-xs text-slate-500 mb-4">We've pre-checked the modules typical for {td?.name}. Adjust if you want.</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {allowed.map((k) => (
          <label key={k} className={cn('flex items-center gap-3 p-3 rounded-xl border cursor-pointer', modules[k] ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200')}>
            <input type="checkbox" checked={!!modules[k]} onChange={(e) => setModules({ ...modules, [k]: e.target.checked })} />
            <span className="text-sm font-medium text-slate-800">{MODULE_LABELS[k] || k}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function AmenitiesPicker({ catalog, selected, setSelected }: { catalog: Amenity[]; selected: Set<string>; setSelected: (s: Set<string>) => void }) {
  const grouped: Record<string, Amenity[]> = {};
  for (const a of catalog) if (a.scope !== 'room') (grouped[a.category] ||= []).push(a);

  function toggle(slug: string) {
    const next = new Set(selected);
    next.has(slug) ? next.delete(slug) : next.add(slug);
    setSelected(next);
  }
  return (
    <div>
      <h3 className="font-semibold text-slate-900 mb-1">Property amenities</h3>
      <p className="text-xs text-slate-500 mb-4">Pre-selected based on your tier. Add or remove as needed.</p>
      <div className="space-y-3">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1.5 capitalize">{cat}</div>
            <div className="flex flex-wrap gap-1.5">
              {items.sort((a, b) => a.sort_order - b.sort_order).map((a) => (
                <button key={a.id} onClick={() => toggle(a.slug)} className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border', selected.has(a.slug) ? 'border-primary-500 bg-primary-100 text-primary-800' : 'border-gray-200 text-slate-600')}>
                  {selected.has(a.slug) ? '✓ ' : ''}{a.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimesPicker({ checkIn, checkOut, setCheckIn, setCheckOut }: { checkIn: string; checkOut: string; setCheckIn: (v: string) => void; setCheckOut: (v: string) => void }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900 mb-1">Check-in / check-out times</h3>
      <p className="text-xs text-slate-500 mb-4">Default times for new bookings. Guests see this on confirmation.</p>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Check-in</span>
          <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Check-out</span>
          <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </label>
      </div>
    </div>
  );
}
