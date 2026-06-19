import React, { useState, useEffect, useRef } from 'react';
import {
  Package, MessageSquare, Users, FileEdit, LogOut, Plus, Pencil, Trash2,
  Upload, Check, Loader, Menu, X, Download, Search, TrendingUp,
} from 'lucide-react';
import { API_URL } from '../lib/api';
import './AdminDashboard.css';

interface Subscriber { id: number; email: string; created_at: string; }
interface Contact { id: number; name: string; email: string | null; phone: string; product: string; quantity: string; message: string | null; created_at: string; }
interface Product { id: number; name: string; description: string; image_url: string | null; price: number | null; active: boolean; created_at: string; }
interface Stats { subscribers: number; contacts: number; products: number; }
type Tab = 'products' | 'contacts' | 'subscribers' | 'content';

const PAGE_META: Record<Tab, { title: string; subtitle: string }> = {
  products: { title: 'Products', subtitle: 'Add, edit and manage everything customers see in the shop.' },
  contacts: { title: 'Inquiries', subtitle: 'Orders and questions submitted through the contact form.' },
  subscribers: { title: 'Subscribers', subtitle: 'People who joined your newsletter list.' },
  content: { title: 'Site Content', subtitle: 'Edit the text shown across the public website.' },
};

const CONTENT_SECTIONS = [
  { title: 'Hero Section', desc: 'The first thing visitors see on the home page.', fields: [
    { key: 'hero.eyebrow', label: 'Eyebrow label', type: 'input' },
    { key: 'hero.heading', label: 'Main heading', type: 'input' },
    { key: 'hero.subtext', label: 'Subtext paragraph', type: 'textarea' },
  ]},
  { title: 'About Page', desc: 'Your story, heritage and the three pillars.', fields: [
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
  { title: 'Why It Matters', desc: 'The value cards shown on the home page.', fields: [
    { key: 'value.heading', label: 'Section heading', type: 'textarea' },
    { key: 'value.subtext', label: 'Subtext', type: 'textarea' },
    { key: 'value.card1.title', label: 'Card 1 — Title', type: 'input' },
    { key: 'value.card1.text', label: 'Card 1 — Text', type: 'textarea' },
    { key: 'value.card2.title', label: 'Card 2 — Title', type: 'input' },
    { key: 'value.card2.text', label: 'Card 2 — Text', type: 'textarea' },
    { key: 'value.card4.title', label: 'Card 3 — Title', type: 'input' },
    { key: 'value.card4.text', label: 'Card 3 — Text', type: 'textarea' },
  ]},
  { title: 'Social Links', desc: 'Where your social buttons point to.', fields: [
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
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(CONTENT_SECTIONS[0].title);

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
    setStats(st && typeof st === 'object' ? st : { subscribers: 0, contacts: 0, products: 0 });
    setSubscribers(Array.isArray(su) ? su : []);
    setContacts(Array.isArray(co) ? co : []);
    setProducts(Array.isArray(pr) ? pr : []);
    setContent(ct && typeof ct === 'object' && !Array.isArray(ct) ? ct : {});
  };

  useEffect(() => {
    const tok = token();
    if (!tok) { setAuthState('out'); return; }
    fetch(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.ok ? loadAll(tok).then(() => setAuthState('in')) : Promise.reject())
      .catch(() => { localStorage.removeItem('adminToken'); setAuthState('out'); });
  }, []);

  // reset search when switching tabs
  useEffect(() => { setSearch(''); setSidebarOpen(false); }, [activeTab]);

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
    <div className="admin-splash"><div className="splash-spinner" /></div>
  );

  // ── Login ──────────────────────────────────────────────────────────────────
  if (authState === 'out') return (
    <div className="admin-login-page">
      <div className="login-box">
        <div className="login-logo">
          <span className="login-leaf">🌿</span>
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

  // ── Filtered data ──
  const q = search.trim().toLowerCase();
  const filteredProducts = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) : products;
  const filteredContacts = q ? contacts.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.product.toLowerCase().includes(q)) : contacts;
  const filteredSubs = q ? subscribers.filter(s => s.email.toLowerCase().includes(q)) : subscribers;

  const NAV: { tab: Tab; icon: React.ReactNode; label: string; count?: number }[] = [
    { tab: 'products', icon: <Package size={19} />, label: 'Products', count: products.length },
    { tab: 'contacts', icon: <MessageSquare size={19} />, label: 'Inquiries', count: contacts.length },
    { tab: 'subscribers', icon: <Users size={19} />, label: 'Subscribers', count: subscribers.length },
    { tab: 'content', icon: <FileEdit size={19} />, label: 'Site Content' },
  ];

  const showSearch = activeTab !== 'content';

  return (
    <div className="admin-layout">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-leaf">🌿</span>
          <div>
            <div className="brand-name">VitaHerbs</div>
            <div className="brand-sub">Admin Panel</div>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Manage</div>
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
            <span className="nav-icon"><LogOut size={19} /></span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="topbar-titles">
            <h1 className="page-title">{PAGE_META[activeTab].title}</h1>
            <p className="page-subtitle">{PAGE_META[activeTab].subtitle}</p>
          </div>
          <div className="topbar-right">
            {showSearch && (
              <div className="search-box">
                <Search size={16} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" />
              </div>
            )}
            {activeTab === 'products' && <button className="btn btn-primary" onClick={openAddForm}><Plus size={16} /> Add Product</button>}
            {(activeTab === 'contacts' || activeTab === 'subscribers') && (
              <button className="btn btn-outline" onClick={() => exportCSV(activeTab as 'subscribers' | 'contacts')}><Download size={16} /> Export</button>
            )}
          </div>
        </header>

        <div className="admin-content">
          {/* Stat strip */}
          <div className="stat-strip">
            <button className={`stat-pill ${activeTab === 'products' ? 'pill-on' : ''}`} onClick={() => setActiveTab('products')}>
              <span className="pill-icon pill-green"><Package size={18} /></span>
              <span className="pill-body"><b>{stats.products}</b><small>Products</small></span>
            </button>
            <button className={`stat-pill ${activeTab === 'contacts' ? 'pill-on' : ''}`} onClick={() => setActiveTab('contacts')}>
              <span className="pill-icon pill-blue"><MessageSquare size={18} /></span>
              <span className="pill-body"><b>{stats.contacts}</b><small>Inquiries</small></span>
            </button>
            <button className={`stat-pill ${activeTab === 'subscribers' ? 'pill-on' : ''}`} onClick={() => setActiveTab('subscribers')}>
              <span className="pill-icon pill-amber"><Users size={18} /></span>
              <span className="pill-body"><b>{stats.subscribers}</b><small>Subscribers</small></span>
            </button>
            <div className="stat-pill stat-static">
              <span className="pill-icon pill-purple"><TrendingUp size={18} /></span>
              <span className="pill-body"><b>{products.filter(p => p.active).length}</b><small>Live products</small></span>
            </div>
          </div>

          {/* ── PRODUCTS ── */}
          {activeTab === 'products' && (
            <>
              {showForm && (
                <div className="panel form-panel">
                  <div className="panel-head">
                    <h2>{editId ? 'Edit Product' : 'New Product'}</h2>
                    <button className="icon-btn icon-ghost" onClick={closeForm}><X size={18} /></button>
                  </div>
                  <form onSubmit={saveProduct} className="product-form">
                    <div className="form-grid">
                      <div className="field">
                        <label>Product Name <span>*</span></label>
                        <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Vita Detox Extract" />
                      </div>
                      <div className="field">
                        <label>Price (UGX)</label>
                        <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 25000" />
                      </div>
                      <div className="field field-full">
                        <label>Description</label>
                        <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short product description" />
                      </div>
                      <div className="field field-full">
                        <label>Product Image</label>
                        <div className="image-uploader">
                          {form.image_url
                            ? <div className="uploader-preview"><img src={form.image_url} alt="preview" /><button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))} className="remove-img"><X size={14} /></button></div>
                            : <button type="button" className="uploader-drop" onClick={() => fileRef.current?.click()} disabled={uploading}>
                                {uploading ? <><Loader size={18} className="spin" /> Uploading…</> : <><Upload size={18} /> Click to upload image</>}
                              </button>
                          }
                          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                        </div>
                        <input className="url-input" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="…or paste an image URL" />
                      </div>
                    </div>
                    <label className="toggle-row">
                      <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                      <span>Active — visible on the website</span>
                    </label>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Create Product'}</button>
                      <button type="button" className="btn btn-ghost" onClick={closeForm}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <Package size={40} />
                  <h3>{q ? 'No products match your search' : 'No products yet'}</h3>
                  {!q && <button className="btn btn-primary" onClick={openAddForm}><Plus size={16} /> Add your first product</button>}
                </div>
              ) : (
                <div className="product-grid">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="product-card">
                      <div className="pc-image">
                        {p.image_url ? <img src={p.image_url} alt={p.name} /> : <div className="pc-noimg"><Package size={28} /></div>}
                        <span className={`pc-status ${p.active ? 'on' : 'off'}`}>{p.active ? 'Active' : 'Hidden'}</span>
                      </div>
                      <div className="pc-body">
                        <h3>{p.name}</h3>
                        <p>{p.description || 'No description'}</p>
                        <div className="pc-price">{p.price ? `UGX ${Number(p.price).toLocaleString()}` : 'No price set'}</div>
                      </div>
                      <div className="pc-actions">
                        <button className="btn btn-soft" onClick={() => openEditForm(p)}><Pencil size={14} /> Edit</button>
                        <button className="icon-btn icon-danger" onClick={() => deleteProduct(p.id)}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── INQUIRIES ── */}
          {activeTab === 'contacts' && (
            <div className="panel">
              {filteredContacts.length === 0 ? (
                <div className="empty-state"><MessageSquare size={40} /><h3>{q ? 'No inquiries match your search' : 'No inquiries yet'}</h3></div>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Customer</th><th>Phone</th><th>Product</th><th>Qty</th><th>Message</th><th>Date</th><th></th></tr></thead>
                    <tbody>
                      {filteredContacts.map(c => (
                        <tr key={c.id}>
                          <td><div className="cell-strong">{c.name}</div>{c.email && <div className="cell-sub">{c.email}</div>}</td>
                          <td><a href={`tel:${c.phone}`} className="cell-link">{c.phone}</a></td>
                          <td><span className="tag tag-green">{c.product}</span></td>
                          <td>{c.quantity}</td>
                          <td className="cell-sub cell-msg">{c.message || '—'}</td>
                          <td className="cell-sub">{new Date(c.created_at).toLocaleDateString()}</td>
                          <td><button className="icon-btn icon-danger" onClick={() => deleteRow('contacts', c.id)}><Trash2 size={15} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── SUBSCRIBERS ── */}
          {activeTab === 'subscribers' && (
            <div className="panel">
              {filteredSubs.length === 0 ? (
                <div className="empty-state"><Users size={40} /><h3>{q ? 'No subscribers match your search' : 'No subscribers yet'}</h3></div>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Email</th><th>Date joined</th><th></th></tr></thead>
                    <tbody>
                      {filteredSubs.map(s => (
                        <tr key={s.id}>
                          <td><div className="cell-strong">{s.email}</div></td>
                          <td className="cell-sub">{new Date(s.created_at).toLocaleDateString()}</td>
                          <td><button className="icon-btn icon-danger" onClick={() => deleteRow('subscribers', s.id)}><Trash2 size={15} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── SITE CONTENT ── */}
          {activeTab === 'content' && (
            <div className="content-wrap">
              <div className="content-notice">Changes go live immediately after saving. Reload the website to see them.</div>
              {CONTENT_SECTIONS.map(section => {
                const open = openSection === section.title;
                return (
                  <div key={section.title} className={`accordion ${open ? 'acc-open' : ''}`}>
                    <button className="accordion-head" onClick={() => setOpenSection(open ? null : section.title)}>
                      <div>
                        <h3>{section.title}</h3>
                        <p>{section.desc}</p>
                      </div>
                      <span className="acc-chevron">{open ? '−' : '+'}</span>
                    </button>
                    {open && (
                      <div className="accordion-body">
                        {section.fields.map(field => (
                          <div key={field.key} className="cf-row">
                            <label>{field.label}</label>
                            <div className="cf-input">
                              {field.type === 'textarea'
                                ? <textarea rows={2} value={content[field.key] ?? ''} onChange={e => setContent(c => ({ ...c, [field.key]: e.target.value }))} />
                                : <input value={content[field.key] ?? ''} onChange={e => setContent(c => ({ ...c, [field.key]: e.target.value }))} />
                              }
                              <button className={`save-btn ${savedKey === field.key ? 'saved' : ''}`} onClick={() => saveContentKey(field.key)} disabled={savingKey === field.key}>
                                {savingKey === field.key ? <Loader size={14} className="spin" /> : savedKey === field.key ? <Check size={15} /> : 'Save'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
