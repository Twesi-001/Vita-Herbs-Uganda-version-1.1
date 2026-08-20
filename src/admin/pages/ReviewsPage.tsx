import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, Trash2, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { useAdminUI } from '../components/adminUIContext';
import { useAdminChrome } from '../adminChromeContext';
import { useAdminResource } from '../../hooks/useAdminResource';
import { apiFetch } from '../../lib/adminFetch';
import type { Review } from '../types';

const PAGE_SIZE = 12;

function stars(rating: number | null): string {
  return rating != null ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : '—';
}

export default function ReviewsPage() {
  const { confirm, toast } = useAdminUI();
  const { refreshCounts } = useAdminChrome();
  const { data, loading, error, refetch } = useAdminResource<Review[]>('/admin/reviews');
  const reviews = data ?? [];

  const [page, setPage] = useState(1);
  const [activeReview, setActiveReview] = useState<Review | null>(null);

  useEffect(() => {
    if (!activeReview) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveReview(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeReview]);

  const pages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const paged = reviews.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiFetch(`/admin/reviews/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      refetch();
      refreshCounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update review');
    }
  };

  const handleDelete = async (review: Review) => {
    const ok = await confirm({
      title: `Delete the review from ${review.name}?`,
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiFetch(`/admin/reviews/${review.id}`, { method: 'DELETE' });
      toast.success('Review deleted');
      refetch();
      refreshCounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Approve or reject customer testimonials before they go live."
        onRefresh={refetch}
      />

      {loading ? (
        <div className="panel"><div className="table-status"><p>Loading reviews…</p></div></div>
      ) : error ? (
        <div className="panel">
          <div className="table-status">
            <p className="table-error">{error}</p>
            <button className="btn btn-outline" onClick={refetch}>Try again</button>
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<Star size={40} />}
            title="No reviews yet"
            description="Customer testimonials submitted on the site will appear here for approval."
          />
        </div>
      ) : (
        <>
          <div className="review-grid">
            {paged.map((r) => (
              <div className="review-card" key={r.id}>
                <div className="review-card-head">
                  <div className="review-card-id">
                    <div className="review-card-name">{r.name}</div>
                    <div className="review-card-rating" aria-label={`Rating ${r.rating ?? 0} out of 5`}>
                      {stars(r.rating)}
                    </div>
                  </div>
                  <select
                    className={`status-select status-${r.status ?? 'pending'}`}
                    value={r.status ?? 'pending'}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {r.media_url && r.media_type === 'video' && (
                  <a href={r.media_url} target="_blank" rel="noreferrer" className="review-card-media">
                    <video src={r.media_url} muted playsInline />
                  </a>
                )}

                <button
                  type="button"
                  className={`review-card-body-btn ${r.body ? '' : 'is-empty'}`}
                  disabled={!r.body}
                  onClick={() => setActiveReview(r)}
                  title={r.body ? 'Click to read full review' : 'No review text'}
                >
                  <p className="review-card-body-text">{r.body || 'No review text'}</p>
                  {r.body && <span className="review-preview-action">Read full</span>}
                </button>

                <div className="review-card-foot">
                  <span className="cell-sub">{new Date(r.created_at).toLocaleDateString()}</span>
                  <button className="icon-btn icon-danger" onClick={() => handleDelete(r)} title="Delete review">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={safePage} pages={pages} onChange={setPage} />
        </>
      )}

      {activeReview &&
        createPortal(
          <div className="review-modal-backdrop" onClick={() => setActiveReview(null)} role="presentation">
            <div
              className="review-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="review-modal-head">
                <div>
                  <h3 id="review-modal-title">Review from {activeReview.name}</h3>
                  <p>{new Date(activeReview.created_at).toLocaleDateString()}</p>
                </div>
                <button
                  type="button"
                  className="icon-btn icon-ghost"
                  onClick={() => setActiveReview(null)}
                  aria-label="Close review dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <div
                className="review-modal-rating"
                aria-label={`Rating ${activeReview.rating ?? 0} out of 5`}
              >
                {activeReview.rating != null ? stars(activeReview.rating) : 'No rating'}
              </div>

              <p className="review-modal-body">{activeReview.body}</p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
