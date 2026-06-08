'use client';

import { useEffect, useState } from 'react';
import { Loader2, Flower2, Plus, X, Trash2, Calendar } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { pmsQlo2Api, type SpaService, type SpaAppointment } from '../_lib/pms-api-qlo2';
import { cn } from '@/lib/utils';

export default function SpaPage() {
  return <PortalShell><Body /></PortalShell>;
}

function Body() {
  const [tab, setTab] = useState<'services' | 'appointments'>('services');
  const [services, setServices] = useState<SpaService[]>([]);
  const [appts, setAppts] = useState<SpaAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSvc, setShowSvc] = useState(false);
  const [showAppt, setShowAppt] = useState(false);

  async function load() {
    setLoading(true);
    const [sr, ar] = await Promise.all([pmsQlo2Api.listSpaServices(), pmsQlo2Api.listSpaAppointments()]);
    setLoading(false);
    if (sr.data?.services) setServices(sr.data.services);
    if (ar.data?.appointments) setAppts(ar.data.appointments);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Flower2 className="w-5 h-5 text-primary-600" /> Spa</h1>
          <p className="text-sm text-slate-500">Services menu + appointments — bookings charge directly to guest folio.</p>
        </div>
        {tab === 'services' ? (
          <button onClick={() => setShowSvc(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> New service</button>
        ) : (
          <button onClick={() => setShowAppt(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> New appointment</button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-100 text-sm font-medium">
          <button onClick={() => setTab('services')} className={cn('px-5 py-3', tab === 'services' ? 'border-b-2 border-primary-500 text-primary-700' : 'text-slate-500')}>Services ({services.length})</button>
          <button onClick={() => setTab('appointments')} className={cn('px-5 py-3', tab === 'appointments' ? 'border-b-2 border-primary-500 text-primary-700' : 'text-slate-500')}>Appointments ({appts.length})</button>
        </div>

        {loading ? (
          <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
        ) : tab === 'services' ? (
          services.length === 0 ? <Empty msg="No services yet" /> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr className="text-left">
                  <th className="px-4 py-3">Name</th><th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Duration</th><th className="px-4 py-3 text-right">Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{s.name}<div className="text-xs text-slate-500">{s.description}</div></td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{s.category}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{s.duration_mins} min</td>
                    <td className="px-4 py-3 text-right font-bold">₹{Number(s.price).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right"><button onClick={async () => { if (confirm(`Delete ${s.name}?`)) { await pmsQlo2Api.deleteSpaService(s.id); load(); } }} className="text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          appts.length === 0 ? <Empty msg="No appointments yet" /> : (
            <ul className="divide-y divide-gray-100">
              {appts.map((a) => (
                <li key={a.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{a.service_name || '—'} · {a.guest_name || 'Guest'}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5"><Calendar className="w-3 h-3" /> {new Date(a.scheduled_at).toLocaleString()} · {a.duration_mins ?? '—'} min · {a.guest_phone || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">₹{Number(a.price ?? 0).toLocaleString('en-IN')}</div>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{a.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      {showSvc && <SvcModal onClose={() => setShowSvc(false)} onSaved={() => { setShowSvc(false); load(); }} />}
      {showAppt && <ApptModal services={services} onClose={() => setShowAppt(false)} onSaved={() => { setShowAppt(false); load(); }} />}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="p-10 text-center text-sm text-slate-500">{msg}</div>;
}

function SvcModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('massage');
  const [durationMins, setDurationMins] = useState(60);
  const [price, setPrice] = useState(0);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name) return;
    setBusy(true);
    await pmsQlo2Api.createSpaService({ name, category, durationMins, price });
    setBusy(false); onSaved();
  }
  return (
    <Modal title="New spa service" onClose={onClose}>
      <Field label="Name" value={name} onChange={setName} />
      <Field label="Category" value={category} onChange={setCategory} />
      <Field label="Duration (mins)" value={String(durationMins)} onChange={(v) => setDurationMins(Number(v) || 0)} type="number" />
      <Field label="Price (₹)" value={String(price)} onChange={(v) => setPrice(Number(v) || 0)} type="number" />
      <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">{busy ? 'Saving…' : 'Save'}</button>
    </Modal>
  );
}

function ApptModal({ services, onClose, onSaved }: { services: SpaService[]; onClose: () => void; onSaved: () => void }) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!scheduledAt) return;
    setBusy(true);
    const svc = services.find((s) => s.id === serviceId);
    await pmsQlo2Api.createSpaAppointment({
      serviceId, guestName, guestPhone, scheduledAt,
      durationMins: svc?.duration_mins, price: svc ? Number(svc.price) : undefined, notes,
    });
    setBusy(false); onSaved();
  }
  return (
    <Modal title="New spa appointment" onClose={onClose}>
      <label className="block">
        <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Service</span>
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
          {services.map((s) => <option key={s.id} value={s.id}>{s.name} · ₹{Number(s.price).toLocaleString('en-IN')}</option>)}
        </select>
      </label>
      <Field label="Guest name" value={guestName} onChange={setGuestName} />
      <Field label="Guest phone" value={guestPhone} onChange={setGuestPhone} />
      <Field label="Scheduled at" value={scheduledAt} onChange={setScheduledAt} type="datetime-local" />
      <Field label="Notes" value={notes} onChange={setNotes} />
      <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">{busy ? 'Saving…' : 'Book'}</button>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl space-y-3">
        <div className="flex items-center justify-between mb-2"><h3 className="text-lg font-semibold text-slate-900">{title}</h3><button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button></div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    </label>
  );
}
