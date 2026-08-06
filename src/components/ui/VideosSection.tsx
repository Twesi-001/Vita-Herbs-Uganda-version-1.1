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

export function VideosBody() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetch(`${API_URL}/videos`)
      .then(r => r.json())
      .then((d: VideoItem[]) => setVideos(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const shown = filter === 'all' ? videos : videos.filter(v => v.category === filter);

  return (
    <section className="videos-section">
      <div className="container">
        <div className="section-heading">
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
                <video className="video-card-media" src={v.video_url} controls preload="metadata" />
                <div className="video-card-body">
                  <span className={`video-card-tag video-card-tag--${v.category}`}>
                    {v.category === 'company' ? 'Company' : 'Product'}
                  </span>
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
