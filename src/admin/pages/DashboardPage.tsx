import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CalendarDays, Mail, MessageSquare, Package, Plus, Star, TrendingUp,
  Users, Video as VideoIcon,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAdminResource } from '../../hooks/useAdminResource';
import type { Contact, Product, Review, Stats } from '../types';

const EMPTY_STATS: Stats = { subscribers: 0, contacts: 0, products: 0, reviews: 0, videos: 0 };

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats } = useAdminResource<Stats>('/admin/stats');
  const { data: contactsData } = useAdminResource<Contact[]>('/admin/contacts');
  const { data: reviewsData } = useAdminResource<Review[]>('/admin/reviews');
  const { data: productsData } = useAdminResource<Product[]>('/admin/products');

  const counts = stats ?? EMPTY_STATS;
  const contacts = contactsData ?? [];
  const reviews = reviewsData ?? [];
  const products = productsData ?? [];
  const pendingReviews = reviews.filter((r) => (r.status ?? 'pending') === 'pending');

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your store, at a glance."
        actions={
          <>
            <button className="btn btn-outline" onClick={() => navigate('/admin/videos')}>
              <Plus size={16} /> Add Video
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/admin/subscribers')}>
              <Mail size={16} /> Email Subscribers
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')}>
              <Plus size={16} /> Add Product
            </button>
          </>
        }
      />

      <div className="dash-welcome">
        <div>
          <h2>Welcome back</h2>
          <p>Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div className="dash-date-pill">
          <CalendarDays size={15} />
          <span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="stat-card-row">
        <Link to="/admin/products" className="stat-card stat-card--green">
          <span className="stat-card-icon"><Package size={22} /></span>
          <div className="stat-card-body"><p>Products</p><h4>{counts.products}</h4></div>
        </Link>
        <Link to="/admin/inquiries" className="stat-card stat-card--navy">
          <span className="stat-card-icon"><MessageSquare size={22} /></span>
          <div className="stat-card-body"><p>Inquiries</p><h4>{counts.contacts}</h4></div>
        </Link>
        <Link to="/admin/reviews" className="stat-card stat-card--purple">
          <span className="stat-card-icon"><Star size={22} /></span>
          <div className="stat-card-body"><p>Reviews</p><h4>{counts.reviews}</h4></div>
        </Link>
        <Link to="/admin/subscribers" className="stat-card stat-card--amber">
          <span className="stat-card-icon"><Users size={22} /></span>
          <div className="stat-card-body"><p>Subscribers</p><h4>{counts.subscribers}</h4></div>
        </Link>
      </div>

      <div className="metric-card-row">
        <div className="metric-card">
          <div className="metric-card-top">
            <div><h4>{counts.videos}</h4><p>Videos</p></div>
            <span className="metric-icon metric-icon--blue"><VideoIcon size={17} /></span>
          </div>
          <div className="metric-card-footer">
            <span>Company &amp; product videos</span>
            <button onClick={() => navigate('/admin/videos')}>View all</button>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-top">
            <div><h4>{products.filter((p) => p.active).length}</h4><p>Live Products</p></div>
            <span className="metric-icon metric-icon--green"><TrendingUp size={17} /></span>
          </div>
          <div className="metric-card-footer">
            <span>Visible on the website</span>
            <button onClick={() => navigate('/admin/products')}>View all</button>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-top">
            <div><h4>{pendingReviews.length}</h4><p>Pending Reviews</p></div>
            <span className="metric-icon metric-icon--purple"><Star size={17} /></span>
          </div>
          <div className="metric-card-footer">
            <span>Awaiting approval</span>
            <button onClick={() => navigate('/admin/reviews')}>View all</button>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel dashboard-panel">
          <div className="panel-head">
            <h2>Recent Inquiries</h2>
            <button className="btn btn-soft" onClick={() => navigate('/admin/inquiries')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {contacts.length === 0 ? (
            <div className="empty-state"><MessageSquare size={32} /><h3>No inquiries yet</h3></div>
          ) : (
            <ul className="dashboard-list">
              {contacts.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <span className="dash-avatar dash-avatar--blue">{c.name.charAt(0).toUpperCase()}</span>
                  <div className="dash-list-main">
                    <div className="cell-strong">{c.name}</div>
                    <div className="cell-sub">{c.product}</div>
                  </div>
                  <span className="cell-sub">{new Date(c.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel dashboard-panel">
          <div className="panel-head">
            <h2>Pending Reviews</h2>
            <button className="btn btn-soft" onClick={() => navigate('/admin/reviews')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {pendingReviews.length === 0 ? (
            <div className="empty-state"><Star size={32} /><h3>Nothing pending</h3></div>
          ) : (
            <ul className="dashboard-list">
              {pendingReviews.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <span className="dash-avatar dash-avatar--purple">{r.name.charAt(0).toUpperCase()}</span>
                  <div className="dash-list-main">
                    <div className="cell-strong">{r.name}</div>
                    <div className="cell-sub">{r.rating != null ? '★'.repeat(r.rating) : 'No rating'}</div>
                  </div>
                  <span className="cell-sub">{new Date(r.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
