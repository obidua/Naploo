'use client';

import { useEffect, useState } from 'react';
import { Loader2, ImageIcon, Plus, X, Star, Trash2 } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { pmsQloApi, type HotelImage } from '../_lib/pms-api-qlo';
import { cn } from '@/lib/utils';

const CATEGORIES = ['room', 'exterior', 'restaurant', 'amenity', 'other'] as const;

export default function GalleryPage() {
  return <PortalShell><Body /></PortalShell>;
}

function Body() {
  const [images, setImages] = useState<HotelImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState<string>('all');

  async function load() {
    setLoading(true);
    const r = await pmsQloApi.listGallery();
    setLoading(false);
    if (r.data?.images) setImages(r.data.images);
  }
  useEffect(() => { load(); }, []);

  const filtered = filterCat === 'all' ? images : images.filter((i) => i.category === filterCat);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Image gallery</h1>
          <p className="text-sm text-slate-500">Photos shown on your property page. Star one as the cover image.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add image
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat('all')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', filterCat === 'all' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-slate-600')}>All ({images.length})</button>
        {CATEGORIES.map((c) => {
          const count = images.filter((i) => i.category === c).length;
          return (
            <button key={c} onClick={() => setFilterCat(c)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize', filterCat === c ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-slate-600')}>
              {c} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No images yet. Add your first photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((img) => (
            <div key={img.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group relative">
              <div className="aspect-video bg-slate-100 overflow-hidden">
                <img src={img.url} alt={img.alt_text || img.caption || 'Hotel image'} className="w-full h-full object-cover" />
              </div>
              {img.is_cover && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-400 text-white text-[10px] uppercase font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-white" />Cover</span>
              )}
              <div className="p-3">
                <div className="text-xs font-semibold text-slate-900 truncate">{img.caption || '—'}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500 mt-0.5 capitalize">{img.category || 'other'}</div>
                <div className="flex gap-2 mt-2">
                  {!img.is_cover && (
                    <button onClick={async () => { await pmsQloApi.setCover(img.id); load(); }} className="text-xs text-amber-600 hover:underline">Set cover</button>
                  )}
                  <button onClick={async () => { if (confirm('Delete this image?')) { await pmsQloApi.deleteImage(img.id); load(); } }} className="text-xs text-red-600 hover:underline ml-auto"><Trash2 className="w-3 h-3 inline" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <UploadModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
    </div>
  );
}

function UploadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('room');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!url) { setError('Image URL is required'); return; }
    setBusy(true);
    const r = await pmsQloApi.uploadImage({ url, caption, category });
    setBusy(false);
    if (!r.data?.success) { setError(r.error || 'Failed'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Add image</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Image URL</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <p className="text-[10px] text-slate-500 mt-1">Paste a public image URL (S3, Cloudinary, etc.). File upload coming soon.</p>
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Caption (optional)</span>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Deluxe room view" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </label>
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Category</span>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={cn('p-2 rounded-lg text-xs border capitalize', category === c ? 'border-primary-500 bg-primary-50' : 'border-gray-200')}>{c}</button>
              ))}
            </div>
          </div>
          {url && (
            <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
              <img src={url} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <button onClick={save} disabled={busy} className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold disabled:opacity-60">
          {busy ? 'Adding…' : 'Add image'}
        </button>
      </div>
    </div>
  );
}
