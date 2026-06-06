'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Sparkles, CheckCircle2 } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import { pmsApi, type PartnerConfig } from '../_lib/pms-api';
import { cn } from '@/lib/utils';

const TIER_OPTIONS = [
  { value: 'homestay', label: 'Homestay', desc: 'Family-run, 5-15 rooms' },
  { value: 'hostel', label: 'Hostel', desc: 'Bed-level inventory, dorms' },
  { value: 'budget_1_star', label: '1-star Budget', desc: '15-40 rooms, basic amenities' },
  { value: 'mid_2_star', label: '2-star Mid', desc: '20-50 rooms, breakfast' },
  { value: 'standard_3_star', label: '3-star Standard', desc: '40-80 rooms, restaurant' },
  { value: 'premium_4_star', label: '4-star Premium', desc: '80-200 rooms, multi-outlet' },
  { value: 'luxury_5_star', label: '5-star Luxury', desc: '200+ rooms, full hierarchy' },
  { value: 'service_apartment', label: 'Service Apartment', desc: 'Long-stay units' },
  { value: 'pod_hotel', label: 'Pod Hotel', desc: 'Sleep pod chain' },
];

const MODULES = [
  { key: 'walk_in', label: 'Walk-in booking', desc: 'Front-desk creates bookings', always: true },
  { key: 'folio_billing', label: 'Folio & billing', desc: 'Charges + payments + invoices', always: true },
  { key: 'online_bookings', label: 'Online bookings', desc: 'Customer app + naploo.com', always: true },
  { key: 'housekeeping', label: 'Housekeeping', desc: 'Room status board' },
  { key: 'extra_services', label: 'Extras & services', desc: 'Laundry, taxi, breakfast, etc.' },
  { key: 'fnb_pos', label: 'F&B POS', desc: 'Restaurant orders, charge-to-room' },
  { key: 'multi_outlet', label: 'Multi-outlet', desc: 'Bar, spa, multiple restaurants' },
  { key: 'spa_services', label: 'Spa', desc: 'Spa treatments + folio billing' },
  { key: 'corporate_rates', label: 'Corporate rates', desc: 'Different rate plans per channel' },
  { key: 'advanced_reports', label: 'Advanced reports', desc: 'Occupancy, ARR, tax filing' },
  { key: 'loyalty', label: 'Loyalty', desc: 'Guest reward points' },
  { key: 'concierge', label: 'Concierge', desc: 'Tours, taxi bookings, recommendations' },
  { key: 'channel_manager', label: 'Channel Manager', desc: 'Sync to OTAs (Phase 2)', disabled: true },
];

export default function SettingsPage() {
  return (
    <PortalShell>
      <Body />
    </PortalShell>
  );
}

function Body() {
  const [config, setConfig] = useState<PartnerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  // Local edit state
  const [tier, setTier] = useState('');
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');

  useEffect(() => {
    pmsApi.getConfig().then((res) => {
      if (res.data) {
        setConfig(res.data);
        setTier(res.data.tier);
        setModules(res.data.featuresEnabled?.modules || {});
        setCheckInTime((res.data.checkInTime || '14:00:00').slice(0, 5));
        setCheckOutTime((res.data.checkOutTime || '11:00:00').slice(0, 5));
      }
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);
    setError('');
    setSavedMsg('');
    const newConfig = {
      ...config!.featuresEnabled,
      modules,
      wizard_completed: true,
    };
    const res = await pmsApi.updateConfig({
      tier,
      featuresEnabled: newConfig as any,
      checkInTime,
      checkOutTime,
    } as any);
    setSaving(false);
    if (!res.data?.success) {
      setError(res.error || 'Save failed');
      return;
    }
    setSavedMsg('Settings saved — sidebar will update next time you navigate.');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
      </div>
    );
  }
  if (!config) return <ErrorBanner message="Cannot load partner config" />;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Property tier + which PMS modules to enable.</p>
      </div>

      {error && <ErrorBanner message={error} />}
      {savedMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-3">
          <CheckCircle2 className="w-4 h-4" /> {savedMsg}
        </div>
      )}

      {/* Property tier */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-600" /> Property tier
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {TIER_OPTIONS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTier(t.value)}
              className={cn(
                'text-left p-3 rounded-xl border transition-all',
                tier === t.value ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200 hover:border-primary-200'
              )}
            >
              <div className="font-semibold text-slate-900 text-sm">{t.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Modules</h2>
        <p className="text-xs text-slate-500 mb-4">Toggle which features show in the sidebar. Disabled modules stay hidden.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {MODULES.map((m) => (
            <label
              key={m.key}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border cursor-pointer',
                modules[m.key] && 'border-primary-300 bg-primary-50/30',
                !modules[m.key] && 'border-gray-200',
                m.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                type="checkbox"
                checked={!!modules[m.key]}
                disabled={!!m.disabled || !!m.always}
                onChange={(e) => setModules({ ...modules, [m.key]: e.target.checked })}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  {m.label}
                  {m.always && <span className="text-[10px] uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">always on</span>}
                  {m.disabled && <span className="text-[10px] uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">soon</span>}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Times */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Default times</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Lbl label="Check-in time">
            <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
          <Lbl label="Check-out time">
            <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </Lbl>
        </div>
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold shadow-md disabled:opacity-60"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save settings
      </button>
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
