import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../lib/api';
import './AdminDashboard.css';

interface Subscriber { id: number; email: string; created_at: string; }
interface Contact { id: number; name: string; email: string | null; phone: string; product: string; quantity: string; message: string | null; created_at: string; }
interface Product { id: number; name: string; description: string; image_url: string | null; price: number | null; active: boolean; created_at: string; }
interface Stats { subscribers: number; contacts: number; products: number; }

type Tab = 'subscribers' | 'contacts' | 'products' | 'content';

const CONTENT_SECTIONS = [
  {
    title: 'Hero Section',
    fields: [
      { key: 'hero.eyebrow', label: 'Eyebrow label', type: 'input' },
      { key: 'hero.heading', label: 'Main heading', type: 'input' },
      { key: 'hero.subtext', label: 'Subtext', type: 'textarea' },
    ],
  },
  {
    title: 'About Page',
    fields: [
      { key: 'about.hero.eyebrow', label: 'Hero eyebrow', type: 'input' },
      { key: 'about.hero.heading', label: 'Hero heading', type: 'input' },
      { key: 'about.hero.description', label: 'Hero description', type: 'textarea' },
      { key: 'about.story.eyebrow', label: 'Story eyebrow', type: 'input' },
      { key: 'about.story.heading', label: 'Story heading', type: 'input' },
      { key: 'about.story.body', label: 'Story body', type: 'textarea' },
      { key: 'about.pillar1.title', label: 'Pillar 1 title', type: 'input' },
      { key: 'about.pillar1.body', label: 'Pillar 1 body', type: 'input' },
      { key: 'about.pillar2.title', label: 'Pillar 2 title', type: 'input' },
      { key: 'about.pillar2.body', label: 'Pillar 2 body', type: 'input' },
      { key: 'about.pillar3.title', label: 'Pillar 3 title', type: 'input' },
      { key: 'about.pillar3.body', label: 'Pillar 3 body', type: 'input' },
    ],
  },
  {
    title: 'Why It Matters',
    fields: [
      { key: 'value.heading', label: 'Section heading', type: 'textarea' },
      { key: 'value.subtext', label: 'Subtext', type: 'textarea' },
      { key: 'value.card1.title', label: 'Card 1 title', type: 'input' },
      { key: 'value.card1.text', label: 'Card 1 text', type: 'textarea' },
      { key: 'value.card2.title', label: 'Card 2 title', type: 'input' },
      { key: 'value.card2.text', label: 'Card 2 text', type: 'textarea' },
      { key: 'value.card3.title', label: 'Card 3 title', type: 'input' },
      { key: 'value.card3.text', label: 'Card 3 text', type: 'textarea' },
      { key: 'value.card4.title', label: 'Card 4 title', type: 'input' },
      { key: 'value.card4.text', label: 'Card 4 text', type: 'textarea' },
    ],
  },
  {
    title: 'Social Links',
    fields: [
      { key: 'social.whatsapp.url', label: 'WhatsApp URL', type: 'input' },
      { key: 'social.tiktok.url', label: 'TikTok URL', type: 'input' },
      { key: 'social.instagram.url', label: 'Instagram URL', type: 'input' },
      { key: 'social.facebook.url', label: 'Facebook URL', type: 'input' },
      { key: 'social.youtube.url', label: 'YouTube URL', type: 'input' },
    ],
  },
];

const emptyProductForm = { name: '', description: '', image_url: '', price: '', active: true };

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary env vars not set');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', uploadPreset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message ?? 'Upload failed');
  return data.secure_url as string;
}

function AdminDashboard() {
  const [authState, setAuthState] = useState<'loading' | 'loggedout' | 'loggedin'>('loading');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<Stats>({ subscribers: 0, contacts: 0, products: 0 });
  const [activeTab, setActiveTab] = useState<Tab>('subscribers');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Products form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content state
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, 'Content-Type': 'application/json' });

  const loadDashboardData = async (token: string) => {
    try {
      const [statsRes, subsRes, contactsRes, productsRes, contentRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/subscribers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/contacts`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/content`),
      ]);
      setStats(await statsRes.json());
      setSubscribers(await subsRes.json());
      setContacts(await contactsRes.json());
      setProducts(await productsRes.json());
      setContent(await contentRes.json());
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { setAuthState('loggedout'); return; }
    fetch(`${API_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((r) => r.ok ? loadDashboardData(token).then(() => setAuthState('loggedin')) : Promise.reject())
      .catch(() => { localStorage.removeItem('adminToken'); setAuthState('loggedout'); });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (res.ok) { localStorage.setItem('adminToken', data.token); await loadDashboardData(data.token); setAuthState('loggedin'); }
      else setError(data.message || 'Login failed');
    } catch { setError('Connection failed'); }
    finally { setIsLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('adminToken'); setAuthState('loggedout'); setSubscribers([]); setContacts([]); setProducts([]); setContent({}); setStats({ subscribers: 0, contacts: 0, products: 0 }); };

  const deleteItem = async (type: 'subscribers' | 'contacts', id: number) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`${API_URL}/admin/${type}/${id}`, { method: 'DELETE', headers: authHeader() });
    await loadDashboardData(localStorage.getItem('adminToken')!);
  };

  const exportCSV = (type: 'subscribers' | 'contacts') => { window.open(`${API_URL}/admin/export/${type}?token=${localStorage.getItem('adminToken')}`, '_blank'); };

  // Products
  const startEditProduct = (p: Product) => { setProductForm({ name: p.name, description: p.description, image_url: p.image_url ?? '', price: p.price?.toString() ?? '', active: p.active }); setEditingProductId(p.id); setShowProductForm(true); };
  const cancelProductForm = () => { setShowProductForm(false); setEditingProductId(null); setProductForm(emptyProductForm); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) { alert('Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Vercel env vars first.'); return; }
    setUploadingImage(true);
    try { const url = await uploadToCloudinary(file); setProductForm((f) => ({ ...f, image_url: url })); }
    catch (err) { alert(`Upload failed: ${err instanceof Error ? err.message : err}`); }
    finally { setUploadingImage(false); }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { name: productForm.name, description: productForm.description, image_url: productForm.image_url || undefined, price: productForm.price ? parseFloat(productForm.price) : undefined, active: productForm.active };
    const url = editingProductId ? `${API_URL}/admin/products/${editingProductId}` : `${API_URL}/admin/products`;
    await fetch(url, { method: editingProductId ? 'PUT' : 'POST', headers: authHeader(), body: JSON.stringify(body) });
    cancelProductForm();
    await loadDashboardData(localStorage.getItem('adminToken')!);
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE', headers: authHeader() });
    await loadDashboardData(localStorage.getItem('adminToken')!);
  };

  // Content
  const saveContentKey = async (key: string) => {
    setSavingKey(key);
    try {
      await fetch(`${API_URL}/admin/content/${encodeURIComponent(key)}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ value: content[key] ?? '' }) });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } finally { setSavingKey(null); }
  };

  if (authState === 'loading') return <div className="admin-loading"><div className="spinner"></div><p>Loading...</p></div>;

  if (authState === 'loggedout') {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1>VitaHerbs Admin</h1>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>📊 VitaHerbs Marketing Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="stats-cards">
        <div className="stat-card"><span className="stat-icon">📧</span><div><h3>{stats.subscribers}</h3><p>Subscribers</p></div></div>
        <div className="stat-card"><span className="stat-icon">💬</span><div><h3>{stats.contacts}</h3><p>Contact Inquiries</p></div></div>
        <div className="stat-card"><span className="stat-icon">📦</span><div><h3>{stats.products}</h3><p>Products</p></div></div>
      </div>

      <div className="dashboard-tabs">
        {(['subscribers', 'contacts', 'products', 'content'] as Tab[]).map((t) => (
          <button key={t} className={activeTab === t ? 'active' : ''} onClick={() => setActiveTab(t)}>
            {t === 'subscribers' ? `Subscribers (${subscribers.length})` : t === 'contacts' ? `Inquiries (${contacts.length})` : t === 'products' ? `Products (${products.length})` : 'Site Content'}
          </button>
        ))}
      </div>

      {/* ── Subscribers ── */}
      {activeTab === 'subscribers' && (
        <div className="data-table-container">
          <div className="table-header"><h2>Newsletter Subscribers</h2><button onClick={() => exportCSV('subscribers')} className="export-btn">📥 Export CSV</button></div>
          <table className="data-table">
            <thead><tr><th>Email</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {subscribers.map((s) => (<tr key={s.id}><td>{s.email}</td><td>{new Date(s.created_at).toLocaleDateString()}</td><td><button onClick={() => deleteItem('subscribers', s.id)} className="delete-btn">Delete</button></td></tr>))}
              {subscribers.length === 0 && <tr><td colSpan={3}>No subscribers yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Contacts ── */}
      {activeTab === 'contacts' && (
        <div className="data-table-container">
          <div className="table-header"><h2>Customer Inquiries</h2><button onClick={() => exportCSV('contacts')} className="export-btn">📥 Export CSV</button></div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Product</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {contacts.map((c) => (<tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td>{c.product}</td><td>{c.message ? `${c.message.substring(0, 60)}…` : '—'}</td><td>{new Date(c.created_at).toLocaleDateString()}</td><td><button onClick={() => deleteItem('contacts', c.id)} className="delete-btn">Delete</button></td></tr>))}
              {contacts.length === 0 && <tr><td colSpan={6}>No inquiries yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Products ── */}
      {activeTab === 'products' && (
        <div className="data-table-container">
          <div className="table-header">
            <h2>Products</h2>
            <button className="export-btn" onClick={() => { cancelProductForm(); setShowProductForm(true); }}>+ Add Product</button>
          </div>

          {showProductForm && (
            <form className="product-form" onSubmit={saveProduct}>
              <h3>{editingProductId ? 'Edit Product' : 'New Product'}</h3>
              <div className="product-form-grid">
                <div className="pf-field">
                  <label>Name *</label>
                  <input required value={productForm.name} onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))} placeholder="Vita Detox Extract" />
                </div>
                <div className="pf-field">
                  <label>Price (UGX)</label>
                  <input type="number" value={productForm.price} onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))} placeholder="e.g. 25000" />
                </div>
                <div className="pf-field pf-full">
                  <label>Description</label>
                  <textarea rows={2} value={productForm.description} onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short product description" />
                </div>
                <div className="pf-field pf-full">
                  <label>Product Image</label>
                  <div className="image-upload-row">
                    <input value={productForm.image_url} onChange={(e) => setProductForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://res.cloudinary.com/..." />
                    <button type="button" className="upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                      {uploadingImage ? 'Uploading…' : '📤 Upload'}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                  </div>
                  {productForm.image_url && <img src={productForm.image_url} alt="preview" className="img-preview" />}
                </div>
                <div className="pf-field">
                  <label>
                    <input type="checkbox" checked={productForm.active} onChange={(e) => setProductForm((f) => ({ ...f, active: e.target.checked }))} />
                    {' '}Active (visible on site)
                  </label>
                </div>
              </div>
              <div className="pf-actions">
                <button type="submit" className="export-btn">Save Product</button>
                <button type="button" className="delete-btn" onClick={cancelProductForm}>Cancel</button>
              </div>
            </form>
          )}

          <table className="data-table">
            <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} /> : '—'}</td>
                  <td><strong>{p.name}</strong><br /><small style={{ color: '#6b7280' }}>{p.description}</small></td>
                  <td>{p.price ? `UGX ${Number(p.price).toLocaleString()}` : '—'}</td>
                  <td><span className={p.active ? 'badge-active' : 'badge-inactive'}>{p.active ? 'Active' : 'Hidden'}</span></td>
                  <td>
                    <button className="export-btn" style={{ marginRight: 6 }} onClick={() => startEditProduct(p)}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteProduct(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={5}>No products yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Site Content ── */}
      {activeTab === 'content' && (
        <div className="content-editor">
          <p className="content-hint">Changes go live on the website immediately after saving. Reload the site to see them.</p>
          {CONTENT_SECTIONS.map((section) => (
            <div key={section.title} className="content-section">
              <h3 className="content-section-title">{section.title}</h3>
              {section.fields.map((field) => (
                <div key={field.key} className="content-field">
                  <label>{field.label}</label>
                  <div className="content-field-row">
                    {field.type === 'textarea' ? (
                      <textarea rows={3} value={content[field.key] ?? ''} onChange={(e) => setContent((c) => ({ ...c, [field.key]: e.target.value }))} />
                    ) : (
                      <input value={content[field.key] ?? ''} onChange={(e) => setContent((c) => ({ ...c, [field.key]: e.target.value }))} />
                    )}
                    <button className={savedKey === field.key ? 'save-btn saved' : 'save-btn'} onClick={() => saveContentKey(field.key)} disabled={savingKey === field.key}>
                      {savingKey === field.key ? '…' : savedKey === field.key ? '✓ Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
