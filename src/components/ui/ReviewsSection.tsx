import { useState, useEffect } from 'react';
import { Star, Loader, CheckCircle, XCircle, Upload, X } from 'lucide-react';
import { API_URL } from '../../lib/api';
import './ReviewsSection.css';

interface Review {
  id: number;
  name: string;
  rating: number | null;
  body: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
}

const MAX_VIDEO_MB = 40;
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="review-stars" role={onChange ? 'radiogroup' : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`star-btn ${n <= value ? 'star-on' : ''}`}
          onClick={onChange ? () => onChange(n) : undefined}
          disabled={!onChange}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star size={onChange ? 22 : 15} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

export function ReviewsBody() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ name: '', rating: 0, body: '' });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<null | { type: 'success' | 'error'; text: string }>(null);

  useEffect(() => {
    fetch(`${API_URL}/reviews`)
      .then(r => r.json())
      .then((d: Review[]) => setReviews(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  function handleVideoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMsg({ type: 'error', text: 'Please upload an mp4, webm, or mov video.' });
      e.target.value = '';
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setMsg({ type: 'error', text: `Video must be under ${MAX_VIDEO_MB}MB.` });
      e.target.value = '';
      return;
    }
    setVideoFile(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || (!form.body.trim() && !videoFile)) {
      setMsg({ type: 'error', text: 'Please add your name and a review (text or video).' });
      return;
    }
    setSubmitting(true);
    try {
      let media_url: string | undefined;
      let media_type: string | undefined;

      if (videoFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', videoFile);
        const upRes = await fetch(`${API_URL}/reviews/upload`, { method: 'POST', body: fd });
        const upData = (await upRes.json()) as { url?: string; message?: string };
        setUploading(false);
        if (!upRes.ok || !upData.url) throw new Error(upData.message ?? 'Video upload failed');
        media_url = upData.url;
        media_type = 'video';
      }

      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          rating: form.rating || undefined,
          body: form.body || undefined,
          media_url,
          media_type,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? 'Could not submit review');

      setMsg({ type: 'success', text: data.message ?? 'Thanks! Your review is pending approval.' });
      setForm({ name: '', rating: 0, body: '' });
      setVideoFile(null);
    } catch (err) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setSubmitting(false);
      setUploading(false);
      setTimeout(() => setMsg(null), 5000);
    }
  }

  return (
    <section className="reviews-section">
      <div className="container">
        <div className="section-heading">
          <h2>What Our Customers Say</h2>
          <p>Real stories from people using KarOrganics every day.</p>
        </div>

        {reviews.length > 0 && (
          <div className="reviews-grid">
            {reviews.map(r => (
              <div className="review-card" key={r.id}>
                {r.media_url && r.media_type === 'video' && (
                  <video className="review-video" src={r.media_url} controls preload="metadata" />
                )}
                {r.rating != null && <Stars value={r.rating} />}
                {r.body && <p className="review-body">&ldquo;{r.body}&rdquo;</p>}
                <div className="review-name">{r.name}</div>
              </div>
            ))}
          </div>
        )}

        <form className="review-form" onSubmit={onSubmit}>
          <h3>Share Your Experience</h3>

          <div className="review-field">
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name *"
              disabled={submitting}
            />
          </div>

          <Stars value={form.rating} onChange={n => setForm(f => ({ ...f, rating: n }))} />

          <div className="review-field">
            <textarea
              rows={4}
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Tell us about your experience (optional if uploading a video)"
              disabled={submitting}
            />
          </div>

          <div className="review-video-input">
            <label htmlFor="review-video">
              {videoFile ? (
                <span className="review-video-picked">
                  {videoFile.name}
                  <button type="button" onClick={() => setVideoFile(null)} aria-label="Remove video">
                    <X size={14} />
                  </button>
                </span>
              ) : (
                <span><Upload size={16} /> Attach a short video (optional, max {MAX_VIDEO_MB}MB)</span>
              )}
            </label>
            <input
              id="review-video"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoPick}
              disabled={submitting}
              style={{ display: 'none' }}
            />
          </div>

          <button type="submit" className="review-submit-btn" disabled={submitting || uploading}>
            {uploading ? (
              <><Loader size={16} className="spin" /> Uploading video…</>
            ) : submitting ? (
              <><Loader size={16} className="spin" /> Submitting…</>
            ) : (
              'Submit Review'
            )}
          </button>

          {msg && (
            <div className={`review-message ${msg.type}`}>
              {msg.type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />}
              {msg.text}
            </div>
          )}

          <p className="review-disclaimer">Reviews are checked before appearing publicly.</p>
        </form>
      </div>
    </section>
  );
}
