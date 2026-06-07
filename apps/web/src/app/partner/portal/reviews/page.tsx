'use client';

import { useEffect, useState } from 'react';
import { Loader2, Star, MessageSquare, Send } from 'lucide-react';
import PortalShell from '../_lib/PortalShell';
import { pmsQloApi, type Review } from '../_lib/pms-api-qlo';

export default function ReviewsPage() {
  return <PortalShell><Body /></PortalShell>;
}

function Body() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<{ total: string; avg_rating: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  async function load() {
    setLoading(true);
    const r = await pmsQloApi.listReviews();
    setLoading(false);
    if (r.data?.reviews) {
      setReviews(r.data.reviews);
      setSummary(r.data.summary);
    }
  }
  useEffect(() => { load(); }, []);

  async function submitReply(id: string) {
    if (!replyText.trim()) return;
    await pmsQloApi.replyToReview(id, replyText);
    setReplyOpen(null); setReplyText('');
    await load();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Guest reviews</h1>
        <p className="text-sm text-slate-500">Respond to reviews to show prospective guests you care.</p>
      </div>

      {summary && (
        <div className="bg-gradient-to-br from-primary-500 to-violet-600 text-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/80">Average rating</div>
            <div className="text-4xl font-bold flex items-baseline gap-2">
              {Number(summary.avg_rating).toFixed(1)}
              <span className="text-sm font-normal">/ 5</span>
            </div>
            <div className="text-xs text-white/80 mt-1">{summary.total} review{Number(summary.total) === 1 ? '' : 's'}</div>
          </div>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((n) => (
              <Star key={n} className={`w-7 h-7 ${n <= Math.round(Number(summary.avg_rating)) ? 'fill-amber-300 text-amber-300' : 'text-white/30'}`} />
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No reviews yet. They'll appear here when guests rate their stay.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{[r.first_name, r.last_name].filter(Boolean).join(' ') || 'Anonymous'}</div>
                  <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} className={`w-4 h-4 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>
              {r.title && <h3 className="font-semibold mt-2 text-slate-900">{r.title}</h3>}
              {r.body && <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{r.body}</p>}

              {r.partner_reply ? (
                <div className="mt-3 bg-primary-50 border-l-2 border-primary-500 rounded p-3">
                  <div className="text-[10px] uppercase tracking-wide text-primary-700 font-semibold mb-1">Your reply · {r.replied_at && new Date(r.replied_at).toLocaleDateString()}</div>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{r.partner_reply}</p>
                </div>
              ) : replyOpen === r.id ? (
                <div className="mt-3 space-y-2">
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Thank you for your feedback…" rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <div className="flex gap-2">
                    <button onClick={() => submitReply(r.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-semibold"><Send className="w-3.5 h-3.5" /> Send reply</button>
                    <button onClick={() => { setReplyOpen(null); setReplyText(''); }} className="px-3 py-1.5 rounded-lg text-sm text-slate-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setReplyOpen(r.id)} className="mt-3 text-xs text-primary-700 font-semibold hover:underline">Reply →</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
