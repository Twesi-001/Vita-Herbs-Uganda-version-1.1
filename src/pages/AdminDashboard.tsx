import React, { useState, useEffect, useRef } from 'react';
import { Users, MessageSquare, Package, FileEdit, LogOut, Plus, Pencil, Trash2, Upload, Check, Loader } from 'lucide-react';
import { API_URL } from '../lib/api';
import './AdminDashboard.css';

interface Subscriber { id: number; email: string; created_at: string; }
interface Contact { id: number; name: string; email: string | null; phone: string; product: string; quantity: string; message: string | null; created_at: string; }
interface Product { id: number; name: string; description: string; image_url: string | null; price: number | null; active: boolean; created_at: string; }
interface Stats { subscribers: number; contacts: number; products: number; }
type Tab = 'subscribers' | 'contacts' | 'products' | 'content';

const PAGE_TITLES: Record<Tab, string> = { subscribers: 'Subscribers', contacts: 'Customer Inquiries', products: 'Products', content: 'Site Content' };

const CONTENT_SECTIONS = [
  { title: 'Hero Section', fields: [
    { key: 'hero.eyebrow', label: 'Eyebrow label', type: 'input' },
    { key: 'hero.heading', label: 'Main heading', type: 'input' },
    { key: 'hero.subtext', label: 'Subtext paragraph', type: 'textarea' },
  ]},
  { title: 'About Page', fields: [
    { key: 'about.hero.eyebrow', label: 'Hero eyebrow', type: 'input' },
    { key: 'about.hero.heading', label: 'Hero heading', type: 'input' },
    { key: 'about.hero.description', label: 'Hero description', type: 'textarea' },
    { key: 'about.story.eyebrow', label: 'Story eyebrow', type: 'input' },
    { key: 'about.story.heading', label: 'Story heading', type: 'input' },
    { key: 'about.story.body', label: 'Story body text', type: 'textarea' },
    { key: 'about.pillar1.title', label: 'Pillar 1 — Title', type: 'input' },
    { key: 'about.pillar1.body', label: 'Pillar 1 — Body', type: 'input' },
    { key: 'about.pillar2.title', label: 'Pillar 2 — Title', type: 'input' },
    { key: 'about.pillar2.body', label: 'Pillar 2 — Body', type: 'input' },
    { key: 'about.pillar3.title', label: 'Pillar 3 — Title', type: 'input' },
    { key: 'about.pillar3.body', label: 'Pillar 3 — Body', type: 'input' },
  ]},
  { title: 'Why It Matters', fields: [
    { key: 'value.heading', label: 'Section heading', type: 'textarea' },
    { key: 'value.subtext', label: 'Subtext', type: 'textarea' },
    { key: 'value.card1.title', label: 'Card 1 — Title', type: 'input' },
    { key: 'value.card1.text', label: 'Card 1 — Text', type: 'textarea' },
    { key: 'value.card2.title', label: 'Card 2 — Title', type: 'input' },
    { key: 'value.card2.text', label: 'Card 2 — Text', type: 'textarea' },
    { key: 'value.card3.title', label: 'Card 3 — Title', type: 'input' },
    { key: 'value.card3.text', label: 'Card 3 — Text', type: 'textarea' },
    { key: 'value.card4.title', label: 'Card 4 — Title', type: 'input' },
    { key: 'value.card4.text', label: 'Card 4 — Text', type: 'textarea' },
  ]},
  { title: 'Social Links', fields: [
    { key: 'social.whatsapp.url', label: 'WhatsApp URL', type: 'input' },
    { key: 'social.tiktok.url', label: 'TikTok URL', type: 'input' },
    { key: 'social.instagram.url', label: 'Instagram URL', type: 'input' },
    { key: 'social.facebook.url', label: 'Facebook URL', type: 'input' },
    { key: 'social.youtube.url', label: 'YouTube URL', type: 'input' },
  ]},
];

const emptyForm = { name: '', description: '', image_url: '', price: '', active: true };

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) throw new Error('Cloudinary env vars not configured');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message ?? 'Upload failed');
  return data.secure_url as string;
}

export default function AdminDashboard() {
  const [authState, setAuthState] = useState<'loading' | 'out' | 'in'>('loading');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<Stats>({ subscribers: 0, contacts: 0, products: 0 });
  const [activeTab, setActiveTab] = useState<Tab>('subscribers');

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const token = () => localStorage.getItem('adminToken') ?? '';
  const authHeader = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

  const loadAll = async (tok: string) => {
    const h = { Authorization: `Bearer ${tok}` };
    const [st, su, co, pr, ct] = await Promise.all([
      fetch(`${API_URL}/admin/stats`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/admin/subscribers`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/admin/contacts`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/admin/products`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/content`).then(r => r.json()),
    ]);
    setStats(st); setSubscribers(su); setContacts(co); setProducts(pr); setContent(ct);
  };

  useEffect(() => {
    const tok = token();
    if (!tok) { setAuthState('out'); return; }
    fetch(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.ok ? loadAll(tok).then(() => setAuthState('in')) : Promise.reject())
      .catch(() => { localStorage.removeItem('adminToken'); setAuthState('out'); });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError(''); setLoggingIn(true);
    try {
      const r = await fetch(`${API_URL}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const d = await r.json();
      if (r.ok) { localStorage.setItem('adminToken', d.token); await loadAll(d.token); setAuthState('in'); }
      else setLoginError(d.message || 'Invalid credentials');
    } catch { setLoginError('Connection failed'); }
    finally { setLoggingIn(false); }
  };

  const handleLogout = () => { localStorage.removeItem('adminToken'); setAuthState('out'); setSubscribers([]); setContacts([]); setProducts([]); setContent({}); };

  const deleteRow = async (type: 'subscribers' | 'contacts', id: number) => {
    if (!confirm('Delete this entry?')) return;
    await fetch(`${API_URL}/admin/${type}/${id}`, { method: 'DELETE', headers: authHeader() });
    await loadAll(token());
  };

  const exportCSV = (type: 'subscribers' | 'contacts') => window.open(`${API_URL}/admin/export/${type}?token=${token()}`, '_blank');

  const openAddForm = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEditForm = (p: Product) => { setForm({ name: p.name, description: p.description, image_url: p.image_url ?? '', price: p.price?.toString() ?? '', active: p.active }); setEditId(p.id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) { alert('Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Vercel env vars.'); return; }
    setUploading(true);
    try { const url = await uploadToCloudinary(file); setForm(f => ({ ...f, image_url: url })); }
    catch (err) { alert(`Upload failed: ${err instanceof Error ? err.message : err}`); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { name: form.name, description: form.description, image_url: form.image_url || undefined, price: form.price ? parseFloat(form.price) : undefined, active: form.active };
    await fetch(editId ? `${API_URL}/admin/products/${editId}` : `${API_URL}/admin/products`, { method: editId ? 'PUT' : 'POST', headers: authHeader(), body: JSON.stringify(body) });
    closeForm(); await loadAll(token());
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE', headers: authHeader() });
    await loadAll(token());
  };

  const saveContentKey = async (key: string) => {
    setSavingKey(key);
    try {
      await fetch(`${API_URL}/admin/content/${encodeURIComponent(key)}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ value: content[key] ?? '' }) });
      setSavedKey(key); setTimeout(() => setSavedKey(null), 2000);
    } finally { setSavingKey(null); }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (authState === 'loading') return (
    <div className="admin-splash">
      <div className="splash-spinner" />
    </div>
  );

  // ── Login ──────────────────────────────────────────────────────────────────
  if (authState === 'out') return (
    <div className="admin-login-page">
      <div className="login-box">
        <div className="login-logo">
          <span>🌿</span>
          <h1>VitaHerbs</h1>
          <p>Admin Dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" required autoFocus />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
          </div>
          {loginError && <p className="login-error">{loginError}</p>}
          <button type="submit" className="login-btn" disabled={loggingIn}>
            {loggingIn ? <><Loader size={16} className="spin" /> Signing in…</> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );

  // ── Dashboard ──────────────────────────────────────────────────────────────
  const NAV: { tab: Tab; icon: React.ReactNode; label: string; count?: number }[] = [
    { tab: 'subscribers', icon: <Users size={18} />, label: 'Subscribers', count: subscribers.length },
    { tab: 'contacts', icon: <MessageSquare size={18} />, label: 'Inquiries', count: contacts.length },
    { tab: 'products', icon: <Package size={18} />, label: 'Products', count: products.length },
    { tab: 'content', icon: <FileEdit size={18} />, label: 'Site Content' },
  ];

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-leaf">🌿</span>
          <div>
            <div className="brand-name">VitaHerbs</div>
            <div className="brand-sub">Admin</div>
          </div>
        </div>

        <div className="sidebar-stats">
          <div className="mini-stat"><span>{stats.subscribers}</span><label>Subs</label></div>
          <div className="mini-stat"><span>{stats.contacts}</span><label>Inquiries</label></div>
          <div className="mini-stat"><span>{stats.products}</span><label>Products</label></div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ tab, icon, label, count }) => (
            <button key={tab} className={`nav-item ${activeTab === tab ? 'nav-active' : ''}`} onClick={() => setActiveTab(tab)}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
              {count !== undefined && <span className="nav-badge">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item nav-logout" onClick={handleLogout}>
            <span className="nav-icon"><LogOut size={18} /></span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        <div className="main-topbar">
          <h1 className="page-title">{PAGE_TITLES[activeTab]}</h1>
          <div className="topbar-actions">
            {activeTab === 'products' && (
              <button className="action-btn action-primary" onClick={openAddForm}><Plus size={16} /> Add Product</button>
            )}
            {(activeTab === 'subscribers' || activeTab === 'contacts') && (
              <button className="action-btn action-secondary" onClick={() => exportCSV(activeTab as 'subscribers' | 'contacts')}>Export CSV</button>
            )}
          </div>
        </div>

        {/* ── Subscribers ── */}
        {activeTab === 'subscribers' && (
          <div className="content-card">
            <table className="data-table">
              <thead><tr><th>Email</th><th>Date joined</th><th></th></tr></thead>
              <tbody>
                {subscribers.map(s => (
                  <tr key={s.id}>
                    <td className="td-main">{s.email}</td>
                    <td className="td-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="td-actions"><button className="icon-btn icon-danger" onClick={() => deleteRow('subscribers', s.id)} title="Delete"><Trash2 size={15} /></button></td>
                  </tr>
                ))}
                {subscribers.length === 0 && <tr><td colSpan={3} className="td-empty">No subscribers yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Contacts ── */}
        {activeTab === 'contacts' && (
          <div className="content-card">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Phone</th><th>Product</th><th>Message</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {contacts.map(c => (
                  <tr key={c.id}>
                    <td className="td-main">{c.name}</td>
                    <td className="td-muted">{c.phone}</td>
                    <td><span className="product-tag">{c.product}</span></td>
                    <td className="td-muted">{c.message ? `${c.message.substring(0, 50)}…` : '—'}</td>
                    <td className="td-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="td-actions"><button className="icon-btn icon-danger" onClick={() => deleteRow('contacts', c.id)} title="Delete"><Trash2 size={15} /></button></td>
                  </tr>
                ))}
                {contacts.length === 0 && <tr><td colSpan={6} className="td-empty">No inquiries yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Products ── */}
        {activeTab === 'products' && (
          <>
            {showForm && (
              <div className="content-card form-card">
                <h2 className="form-title">{editId ? 'Edit Product' : 'New Product'}</h2>
                <form onSubmit={saveProduct} className="product-form">
                  <div className="form-row">
                    <div className="form-field">
                      <label>Product Name *</label>
                      <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Vita Detox Extract" />
                    </div>
                    <div className="form-field">
                      <label>Price (UGX)</label>
                      <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 25000" />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Description</label>
                    <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short product description" />
                  </div>
                  <div className="form-field">
                    <label>Product Image</label>
                    <div className="image-row">
                      <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Paste Cloudinary URL or upload below" />
                      <button type="button" className="upload-img-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
                        {uploading ? <><Loader size={14} className="spin" /> Uploading…</> : <><Upload size={14} /> Upload</>}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                    </div>
                    {form.image_url && <img src={form.image_url} alt="preview" className="img-preview" />}
                  </div>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                    <span>Active (visible on website)</span>
                  </label>
                  <div className="form-actions">
                    <button type="submit" className="action-btn action-primary">Save Product</button>
                    <button type="button" className="action-btn action-ghost" onClick={closeForm}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="content-card">
              <table className="data-table">
                <thead><tr><th>Image</th><th>Product</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><div className="product-thumb">{p.image_url ? <img src={p.image_url} alt={p.name} /> : <span>—</span>}</div></td>
                      <td>
                        <div className="td-main">{p.name}</div>
                        <div className="td-muted" style={{ fontSize: '0.8rem', marginTop: 2 }}>{p.description}</div>
                      </td>
                      <td className="td-muted">{p.price ? `UGX ${Number(p.price).toLocaleString()}` : '—'}</td>
                      <td><span className={p.active ? 'status-active' : 'status-hidden'}>{p.active ? 'Active' : 'Hidden'}</span></td>
                      <td className="td-actions">
                        <button className="icon-btn icon-edit" onClick={() => openEditForm(p)} title="Edit"><Pencil size={15} /></button>
                        <button className="icon-btn icon-danger" onClick={() => deleteProduct(p.id)} title="Delete"><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && <tr><td colSpan={5} className="td-empty">No products yet — click Add Product to create one</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Site Content ── */}
        {activeTab === 'content' && (
          <div className="content-sections">
            <div className="content-notice">
              Changes go live on the site immediately after saving. Reload the website to see them.
            </div>
            {CONTENT_SECTIONS.map(section => (
              <div key={section.title} className="content-card content-group">
                <h2 className="group-title">{section.title}</h2>
                {section.fields.map(field => (
                  <div key={field.key} className="cf-row">
                    <label className="cf-label">{field.label}</label>
                    <div className="cf-input-row">
                      {field.type === 'textarea'
                        ? <textarea rows={2} value={content[field.key] ?? ''} onChange={e => setContent(c => ({ ...c, [field.key]: e.target.value }))} />
                        : <input value={content[field.key] ?? ''} onChange={e => setContent(c => ({ ...c, [field.key]: e.target.value }))} />
                      }
                      <button
                        className={`save-key-btn ${savedKey === field.key ? 'saved' : ''}`}
                        onClick={() => saveContentKey(field.key)}
                        disabled={savingKey === field.key}
                      >
                        {savingKey === field.key ? <Loader size={14} className="spin" /> : savedKey === field.key ? <><Check size={14} /> Saved</> : 'Save'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
