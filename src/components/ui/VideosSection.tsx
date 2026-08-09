import { useState, useEffect, useRef } from 'react';
import { Building2, Package, Play } from 'lucide-react';
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

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const steps: [number, string][] = [[60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month'], [Infinity, 'year']];
  let value = seconds;
  for (const [size, unit] of steps) {
    value = Math.floor(value / size);
    if (value < size || unit === 'year') return `${value} ${unit}${value !== 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

function formatDuration(totalSeconds: number): string {
  if (!isFinite(totalSeconds)) return '';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`;
  return `${m}:${ss}`;
}

function VideoTile({ video }: { video: VideoItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState('');
  const [started, setStarted] = useState(false);

  return (
    <div className="video-tile">
      <div className="video-tile-media" onClick={started ? undefined : () => videoRef.current?.play()}>
        <video
          ref={videoRef}
          className="video-tile-video"
          src={video.video_url}
          controls={started}
          preload="metadata"
          onLoadedMetadata={e => setDuration(formatDuration(e.currentTarget.duration))}
          onPlay={() => setStarted(true)}
        />
        {!started && (
          <>
            <span className="video-tile-play"><Play size={20} fill="#fff" /></span>
            {duration && <span className="video-tile-duration">{duration}</span>}
          </>
        )}
      </div>
      <div className="video-tile-info">
        <span className={`video-tile-avatar video-tile-avatar--${video.category}`}>
          {video.category === 'company' ? <Building2 size={15} /> : <Package size={15} />}
        </span>
        <div className="video-tile-text">
          <h3>{video.title}</h3>
          <p>{video.category === 'company' ? 'Company' : 'Product'} &middot; {timeAgo(video.created_at)}</p>
        </div>
      </div>
    </div>
  );
}

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
            {shown.map(v => <VideoTile key={v.id} video={v} />)}
          </div>
        )}
      </div>
    </section>
  );
}
