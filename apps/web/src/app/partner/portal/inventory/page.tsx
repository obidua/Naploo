'use client';

import { useCallback, useEffect, useState } from 'react';
import { Hotel, Bed, Plus, Edit3, Save, X, Loader2 } from 'lucide-react';
import PortalShell, { ErrorBanner } from '../_lib/PortalShell';
import {
  getMyHotel, createRoom, updateRoom, createPodSet, updatePodSet,
  type PartnerHotel, type PartnerRoom, type PartnerPodSet, type PartnerPod,
} from '../_lib/api';

const ROOM_TYPES = ['standard', 'deluxe', 'suite', 'family', 'dormitory'];
const BED_TYPES = ['single', 'double', 'queen', 'king', 'bunk'];
const POD_TYPES: Array<'single' | 'double' | 'king'> = ['single', 'double', 'king'];

export default function InventoryPage() {
  return (
    <PortalShell>
      <InventoryBody />
    </PortalShell>
  );
}

function InventoryBody() {
  const [hotel, setHotel] = useState<PartnerHotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'rooms' | 'pods'>('rooms');
  const [adding, setAdding] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const h = await getMyHotel();
    if (!h) {
      setError('No hotel linked to this account.');
      setLoading(false);
      return;
    }
    setHotel(h);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading && !hotel) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
        <p className="text-sm text-slate-500 mt-2">Loading inventory…</p>
      </div>
    );
  }
  if (error || !hotel) return <ErrorBanner message={error || 'Hotel not found'} />;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h1 className="text-xl font-bold text-slate-900">Inventory & pricing</h1>
        <p className="text-sm text-slate-500 mt-1">Add new rooms or sleeping pods. Edit pricing inline — changes save instantly.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('rooms')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${tab === 'rooms' ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/30' : 'text-slate-500 hover:text-slate-800'}`}
          >
            🛏️ Rooms ({hotel.rooms.length})
          </button>
          <button
            onClick={() => setTab('pods')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${tab === 'pods' ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/30' : 'text-slate-500 hover:text-slate-800'}`}
          >
            💤 Sleeping pods ({hotel.podSets.length} sets + {hotel.standalonePods?.length || 0} single)
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Add {tab === 'rooms' ? 'room' : 'pod'}
            </button>
          </div>

          {tab === 'rooms' ? (
            <>
              {hotel.rooms.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No rooms yet — click "Add room" to get started.</p>
              ) : (
                hotel.rooms.map((r) => <RoomCard key={r.id} room={r} onSaved={reload} />)
              )}
            </>
          ) : (
            <>
              {hotel.podSets.length === 0 && !(hotel.standalonePods?.length) ? (
                <p className="text-sm text-slate-500 text-center py-8">No pods yet — add a stacked set or a standalone pod.</p>
              ) : (
                <>
                  {(hotel.standalonePods || []).map((p) => <StandalonePodCard key={p.id} pod={p} />)}
                  {hotel.podSets.map((s) => <PodSetCard key={s.id} podSet={s} onSaved={reload} />)}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {adding && (
        tab === 'rooms' ? (
          <AddRoomModal hotelId={hotel.id} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); reload(); }} />
        ) : (
          <AddPodSetModal hotelId={hotel.id} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); reload(); }} />
        )
      )}
    </div>
  );
}

function RoomCard({ room, onSaved }: { room: PartnerRoom; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    dailyRate: room.dailyRate,
    extraGuestCharge: room.extraGuestCharge,
    isActive: room.isActive,
    roomType: room.roomType,
    maxGuests: room.maxGuests,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true);
    setError('');
    const res = await updateRoom(room.id, draft as any);
    setSaving(false);
    if (!res.ok) {
      setError(res.error || 'Save failed');
      return;
    }
    setEditing(false);
    onSaved();
  }

  return (
    <article className="border border-gray-200 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">Room {room.roomNumber}{room.name ? ` — ${room.name}` : ''}</h3>
            <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${room.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {room.isActive ? room.status : 'inactive'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {room.roomType} • {room.bedType} bed × {room.numBeds} • up to {room.maxGuests} guests
          </p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="inline-flex items-center gap-1 text-sm text-primary-700 hover:text-primary-800"
        >
          {editing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit3 className="w-4 h-4" /> Edit</>}
        </button>
      </div>

      {!editing ? (
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-slate-700">
          <span>₹{room.dailyRate.toLocaleString('en-IN')} <span className="text-xs text-slate-500">/night</span></span>
          <span className="text-xs text-slate-500">extra guest ₹{room.extraGuestCharge}</span>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <Field label="Nightly rate (₹)">
            <input
              type="number"
              value={draft.dailyRate}
              onChange={(e) => setDraft({ ...draft, dailyRate: Number(e.target.value) })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            />
          </Field>
          <Field label="Extra guest (₹)">
            <input
              type="number"
              value={draft.extraGuestCharge}
              onChange={(e) => setDraft({ ...draft, extraGuestCharge: Number(e.target.value) })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            />
          </Field>
          <Field label="Room type">
            <select
              value={draft.roomType}
              onChange={(e) => setDraft({ ...draft, roomType: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            >
              {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Max guests">
            <input
              type="number"
              min={1}
              max={10}
              value={draft.maxGuests}
              onChange={(e) => setDraft({ ...draft, maxGuests: Number(e.target.value) })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
            />
            Active (visible to customers)
          </label>
          {error && <p className="text-xs text-red-600 sm:col-span-4">{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
          </button>
        </div>
      )}
    </article>
  );
}

function PodSetCard({ podSet, onSaved }: { podSet: PartnerPodSet; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ hourlyRate: podSet.hourlyRate, section: podSet.section || '', floor: podSet.floor, isActive: podSet.isActive });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true);
    setError('');
    const res = await updatePodSet(podSet.id, draft as any);
    setSaving(false);
    if (!res.ok) {
      setError(res.error || 'Save failed');
      return;
    }
    setEditing(false);
    onSaved();
  }

  return (
    <article className="border border-gray-200 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">Pod set {podSet.setNumber}</h3>
            <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${podSet.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {podSet.isActive ? 'active' : 'inactive'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Floor {podSet.floor}{podSet.section ? ` • ${podSet.section}` : ''} • {podSet.pods.length} pods
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {podSet.pods.map((pod) => (
              <span key={pod.id} className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-600">
                <Bed className="w-3 h-3 text-primary-600" />
                {pod.podNumber}{pod.displayName ? ` — ${pod.displayName}` : ''} · {pod.position} · {pod.podType} · {pod.maxOccupancy} pax
              </span>
            ))}
          </div>
        </div>
        <button onClick={() => setEditing(!editing)} className="inline-flex items-center gap-1 text-sm text-primary-700 hover:text-primary-800">
          {editing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit3 className="w-4 h-4" /> Edit</>}
        </button>
      </div>

      {!editing ? (
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-slate-700">
          <span>₹{podSet.hourlyRate.toLocaleString('en-IN')} <span className="text-xs text-slate-500">/hr</span></span>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <Field label="Hourly rate (₹)">
            <input
              type="number"
              value={draft.hourlyRate}
              onChange={(e) => setDraft({ ...draft, hourlyRate: Number(e.target.value) })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            />
          </Field>
          <Field label="Floor">
            <input
              type="number"
              value={draft.floor}
              onChange={(e) => setDraft({ ...draft, floor: Number(e.target.value) })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            />
          </Field>
          <Field label="Section">
            <input
              type="text"
              value={draft.section}
              onChange={(e) => setDraft({ ...draft, section: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />
            Active
          </label>
          {error && <p className="text-xs text-red-600 sm:col-span-4">{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
          </button>
        </div>
      )}
    </article>
  );
}

function StandalonePodCard({ pod }: { pod: PartnerPod }) {
  return (
    <article className="border border-violet-200 bg-violet-50/30 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">Single pod {pod.podNumber}{pod.displayName ? ` — ${pod.displayName}` : ''}</h3>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-violet-100 text-violet-700">standalone</span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">{pod.status}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {pod.podType} size · up to {pod.maxOccupancy} guest{pod.maxOccupancy > 1 ? 's' : ''}{pod.dimensions ? ` · ${pod.dimensions}` : ''}
          </p>
        </div>
        <div className="text-right text-sm font-semibold text-slate-800">
          ₹{pod.hourlyRate.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/hr</span>
        </div>
      </div>
    </article>
  );
}

function AddRoomModal({ hotelId, onClose, onSaved }: { hotelId: string; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState({
    roomNumber: '', name: '', roomType: 'standard', maxGuests: 2, bedType: 'double',
    numBeds: 1, dailyRate: 1500, extraGuestCharge: 500, description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true);
    setError('');
    const res = await createRoom(hotelId, draft as any);
    setSaving(false);
    if (!res.ok) {
      setError(res.error || 'Failed to add room');
      return;
    }
    onSaved();
  }

  return (
    <Modal title="Add new room" onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Room number *">
          <input value={draft.roomNumber} onChange={(e) => setDraft({ ...draft, roomNumber: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </Field>
        <Field label="Display name">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Ocean View Suite" />
        </Field>
        <Field label="Room type">
          <select value={draft.roomType} onChange={(e) => setDraft({ ...draft, roomType: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Bed type">
          <select value={draft.bedType} onChange={(e) => setDraft({ ...draft, bedType: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {BED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Max guests">
          <input type="number" min={1} max={10} value={draft.maxGuests} onChange={(e) => setDraft({ ...draft, maxGuests: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </Field>
        <Field label="Number of beds">
          <input type="number" min={1} max={5} value={draft.numBeds} onChange={(e) => setDraft({ ...draft, numBeds: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </Field>
        <Field label="Nightly rate (₹) *">
          <input type="number" value={draft.dailyRate} onChange={(e) => setDraft({ ...draft, dailyRate: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </Field>
        <Field label="Extra guest charge (₹)">
          <input type="number" value={draft.extraGuestCharge} onChange={(e) => setDraft({ ...draft, extraGuestCharge: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </Field>
        <label className="block sm:col-span-2">
          <span className="block text-xs text-slate-500 mb-1">Description</span>
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={2}
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      <button
        onClick={save}
        disabled={saving || !draft.roomNumber || !draft.dailyRate}
        className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Add room
      </button>
    </Modal>
  );
}

function AddPodSetModal({ hotelId, onClose, onSaved }: { hotelId: string; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState({
    mode: 'set' as 'set' | 'single',
    setNumber: '', podNumber: '', podName: '',
    upperPodNumber: '', upperPodName: '', lowerPodNumber: '', lowerPodName: '',
    podType: 'single' as 'single' | 'double' | 'king', maxOccupancy: 1, dimensions: '',
    hourlyRate: 150, floor: 1, section: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true);
    setError('');
    const res = await createPodSet(hotelId, draft as any);
    setSaving(false);
    if (!res.ok) {
      setError(res.error || 'Failed to add pod');
      return;
    }
    onSaved();
  }

  return (
    <Modal title={draft.mode === 'set' ? 'Add pod set (upper + lower)' : 'Add single standalone pod'} onClose={onClose}>
      <div className="grid grid-cols-2 gap-2 mb-4 rounded-xl bg-slate-100 p-1">
        <button type="button" onClick={() => setDraft({ ...draft, mode: 'set' })} className={`rounded-lg px-3 py-2 text-sm font-semibold ${draft.mode === 'set' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}>Stacked set</button>
        <button type="button" onClick={() => setDraft({ ...draft, mode: 'single' })} className={`rounded-lg px-3 py-2 text-sm font-semibold ${draft.mode === 'single' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}>Single pod</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label={draft.mode === 'set' ? 'Set number *' : 'Pod group / code *'}>
          <input
            value={draft.setNumber}
            onChange={(e) => setDraft({ ...draft, setNumber: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder={draft.mode === 'set' ? 'SET-001' : 'POD-001'}
          />
        </Field>
        <Field label="Hourly rate (₹) *">
          <input
            type="number"
            value={draft.hourlyRate}
            onChange={(e) => setDraft({ ...draft, hourlyRate: Number(e.target.value) })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </Field>
        {draft.mode === 'single' ? (
          <>
            <Field label="Pod number *">
              <input value={draft.podNumber} onChange={(e) => setDraft({ ...draft, podNumber: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="POD-001-S" />
            </Field>
            <Field label="Pod display name">
              <input value={draft.podName} onChange={(e) => setDraft({ ...draft, podName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Solo king pod" />
            </Field>
          </>
        ) : (
          <>
            <Field label="Upper pod number">
              <input value={draft.upperPodNumber} onChange={(e) => setDraft({ ...draft, upperPodNumber: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder={`${draft.setNumber || 'SET-001'}-U`} />
            </Field>
            <Field label="Upper pod name">
              <input value={draft.upperPodName} onChange={(e) => setDraft({ ...draft, upperPodName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Upper capsule" />
            </Field>
            <Field label="Lower pod number">
              <input value={draft.lowerPodNumber} onChange={(e) => setDraft({ ...draft, lowerPodNumber: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder={`${draft.setNumber || 'SET-001'}-L`} />
            </Field>
            <Field label="Lower pod name">
              <input value={draft.lowerPodName} onChange={(e) => setDraft({ ...draft, lowerPodName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Lower capsule" />
            </Field>
          </>
        )}
        <Field label="Pod size">
          <select value={draft.podType} onChange={(e) => setDraft({ ...draft, podType: e.target.value as any, maxOccupancy: e.target.value === 'king' ? 3 : e.target.value === 'double' ? 2 : 1 })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {POD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Max occupancy">
          <input type="number" min={1} max={4} value={draft.maxOccupancy} onChange={(e) => setDraft({ ...draft, maxOccupancy: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </Field>
        <Field label="Dimensions">
          <input value={draft.dimensions} onChange={(e) => setDraft({ ...draft, dimensions: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="2060 x 1140 x 2400 mm" />
        </Field>
        <Field label="Floor">
          <input
            type="number"
            value={draft.floor}
            onChange={(e) => setDraft({ ...draft, floor: Number(e.target.value) })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Section">
          <input
            value={draft.section}
            onChange={(e) => setDraft({ ...draft, section: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Lobby"
          />
        </Field>
      </div>
      <p className="text-xs text-slate-500 mt-3">
        {draft.mode === 'set' ? 'Each set creates 2 pods. Numbers can be manual or auto-assigned as -U and -L.' : 'Use single pod when layout has space for one standalone capsule only.'}
      </p>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <button
        onClick={save}
        disabled={saving || !draft.setNumber || !draft.hourlyRate || (draft.mode === 'single' && !draft.podNumber)}
        className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Add {draft.mode === 'set' ? 'pod set' : 'single pod'}
      </button>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-xl shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</span>
      {children}
    </label>
  );
}
