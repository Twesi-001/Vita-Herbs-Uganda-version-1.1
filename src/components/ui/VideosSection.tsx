import { useState, useEffect } from 'react';
import { Building2, Package } from 'lucide-react';
import { API_URL } from '../../lib/api';
import './VideosSection.css';

interface VideoItem {
  id: number;
  title: string;
  description: string | null;
  category: 'company' | 'product';
  video_url: string;
  created_at: string;
}

type Filter = 'all' | 'company' | 'product';

export function VideosBody({ hideIfEmpty = false }: { hideIfEmpty?: boolean } = {}) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetch(`${API_URL}/videos`)
      .then(r => r.json())
      .then((d: VideoItem[]) => setVideos(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (hideIfEmpty && loaded && videos.length === 0) return null;

  const shown = filter === 'all' ? videos : videos.filter(v => v.category === filter);

  return (
    <section className="videos-section">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Company &amp; Product Videos</span>
          <h2>Watch & Learn</h2>
          <p>Videos from KarOrganics — behind the scenes and how our products work.</p>
        </div>

        <div className="videos-filters">
          <button className={`videos-filter ${filter === 'all' ? 'videos-filter-on' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`videos-filter ${filter === 'company' ? 'videos-filter-on' : ''}`} onClick={() => setFilter('company')}>
            <Building2 size={14} /> Company
          </button>
          <button className={`videos-filter ${filter === 'product' ? 'videos-filter-on' : ''}`} onClick={() => setFilter('product')}>
            <Package size={14} /> Product
          </button>
        </div>

        {shown.length === 0 ? (
          <p className="videos-empty">No videos here yet — check back soon.</p>
        ) : (
          <div className="videos-grid">
            {shown.map(v => (
              <div className="video-card" key={v.id}>
                <div className="video-card-media-wrap">
                  <video className="video-card-media" src={v.video_url} controls preload="metadata" />
                  <span className={`video-card-badge video-card-badge--${v.category}`}>
                    {v.category === 'company' ? <Building2 size={12} /> : <Package size={12} />}
                    {v.category === 'company' ? 'Company' : 'Product'}
                  </span>
                </div>
                <div className="video-card-body">
                  <h3>{v.title}</h3>
                  {v.description && <p>{v.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
