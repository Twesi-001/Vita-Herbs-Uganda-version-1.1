import React, { useState, useEffect, useRef } from 'react';
import {
  Package, MessageSquare, Users, FileEdit, LogOut, Plus, Pencil, Trash2,
  Upload, Check, Loader, Menu, X, Download, Search, TrendingUp, KeyRound,
  Home, Sparkles, Heart, ListChecks, Share2, ImageIcon, Star, Mail, Send,
  Video as VideoIcon, LayoutDashboard, ArrowRight, Paperclip,
  ChevronsLeft, Maximize, Minimize, Bell, Settings as SettingsIcon, ChevronDown,
  CalendarDays, ArrowLeft,
} from 'lucide-react';
import { API_URL } from '../lib/api';
import './AdminDashboard.css';

interface Subscriber { id: number; email: string; created_at: string; }
interface Contact { id: number; name: string; email: string | null; phone: string; product: string; quantity: string; message: string | null; status: string; created_at: string; }
interface Product { id: number; name: string; description: string; image_url: string | null; price: number | null; category: string | null; active: boolean; created_at: string; }
interface Review { id: number; name: string; rating: number | null; body: string | null; media_url: string | null; media_type: string | null; status: string; created_at: string; }
interface Video { id: number; title: string; description: string | null; category: 'company' | 'product'; video_url: string; active: boolean; created_at: string; }
interface Stats { subscribers: number; contacts: number; products: number; reviews: number; videos: number; }
type Tab = 'dashboard' | 'products' | 'contacts' | 'reviews' | 'videos' | 'subscribers' | 'content' | 'settings';

const PAGE_META: Record<Tab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'An overview of your store, at a glance.' },
  products: { title: 'Products', subtitle: 'Add, edit and manage everything customers see in the shop.' },
  contacts: { title: 'Inquiries', subtitle: 'Orders and questions submitted through the contact form.' },
  reviews: { title: 'Reviews', subtitle: 'Approve or reject customer testimonials before they go live.' },
  videos: { title: 'Videos', subtitle: 'Upload company and product videos shown on the website.' },
  subscribers: { title: 'Subscribers', subtitle: 'People who joined your newsletter list.' },
  content: { title: 'Site Content', subtitle: 'Edit the text shown across the public website.' },
  settings: { title: 'Settings', subtitle: 'Manage your admin account and password.' },
};

type ContentFieldType = 'input' | 'textarea' | 'image';
interface ContentField { key: string; label: string; type: ContentFieldType; group?: string; }
interface ContentSection { title: string; desc: string; icon: React.ReactNode; fields: ContentField[]; }

const CONTENT_SECTIONS: ContentSection[] = [
  { title: 'Hero Section', desc: 'The first thing visitors see on the home page.', icon: <Home size={18} />, fields: [
    { key: 'hero.eyebrow', label: 'Eyebrow label', type: 'input' },
    { key: 'hero.heading', label: 'Main heading', type: 'input' },
    { key: 'hero.subtext', label: 'Subtext paragraph', type: 'textarea' },
  ]},
  { title: 'About Page', desc: 'Your story, heritage and the three pillars.', icon: <Sparkles size={18} />, fields: [
    { key: 'about.hero.eyebrow', label: 'Eyebrow', type: 'input', group: 'Page Header' },
    { key: 'about.hero.heading', label: 'Heading', type: 'input', group: 'Page Header' },
    { key: 'about.hero.description', label: 'Description', type: 'textarea', group: 'Page Header' },
    { key: 'about.story.eyebrow', label: 'Eyebrow', type: 'input', group: 'Heritage Story' },
    { key: 'about.story.heading', label: 'Heading', type: 'input', group: 'Heritage Story' },
    { key: 'about.story.body', label: 'Body text', type: 'textarea', group: 'Heritage Story' },
    { key: 'about.story.image', label: 'Heritage image (first)', type: 'image', group: 'Heritage Story' },
    { key: 'about.story.image2', label: 'Heritage image (second)', type: 'image', group: 'Heritage Story' },
    { key: 'about.pillar1.title', label: 'Title', type: 'input', group: 'Pillar 1' },
    { key: 'about.pillar1.body', label: 'Body', type: 'input', group: 'Pillar 1' },
    { key: 'about.pillar2.title', label: 'Title', type: 'input', group: 'Pillar 2' },
    { key: 'about.pillar2.body', label: 'Body', type: 'input', group: 'Pillar 2' },
    { key: 'about.pillar3.title', label: 'Title', type: 'input', group: 'Pillar 3' },
    { key: 'about.pillar3.body', label: 'Body', type: 'input', group: 'Pillar 3' },
  ]},
  { title: 'Why KarOrganics Section', desc: 'The "Trusted Herbal Products" block near the bottom of the About page.', icon: <Heart size={18} />, fields: [
    { key: 'about.why.eyebrow', label: 'Eyebrow', type: 'input', group: 'Section Intro' },
    { key: 'about.why.heading', label: 'Heading', type: 'input', group: 'Section Intro' },
    { key: 'about.why.body', label: 'Body text', type: 'textarea', group: 'Section Intro' },
    { key: 'about.why.item1', label: 'Item 1', type: 'input', group: 'Checklist' },
    { key: 'about.why.item2', label: 'Item 2', type: 'input', group: 'Checklist' },
    { key: 'about.why.item3', label: 'Item 3', type: 'input', group: 'Checklist' },
    { key: 'about.why.item4', label: 'Item 4', type: 'input', group: 'Checklist' },
    { key: 'about.why.item5', label: 'Item 5', type: 'input', group: 'Checklist' },
    { key: 'about.why.cta', label: 'Button label', type: 'input' },
    { key: 'about.why.image', label: 'Section image', type: 'image' },
  ]},
  { title: 'Why It Matters', desc: 'The value cards shown on the home page.', icon: <ListChecks size={18} />, fields: [
    { key: 'value.heading', label: 'Section heading', type: 'textarea', group: 'Section Intro' },
    { key: 'value.subtext', label: 'Subtext', type: 'textarea', group: 'Section Intro' },
    { key: 'value.card1.title', label: 'Title', type: 'input', group: 'Card 1' },
    { key: 'value.card1.text', label: 'Text', type: 'textarea', group: 'Card 1' },
    { key: 'value.card2.title', label: 'Title', type: 'input', group: 'Card 2' },
    { key: 'value.card2.text', label: 'Text', type: 'textarea', group: 'Card 2' },
    { key: 'value.card4.title', label: 'Title', type: 'input', group: 'Card 3' },
    { key: 'value.card4.text', label: 'Text', type: 'textarea', group: 'Card 3' },
  ]},
  { title: 'Social Links', desc: 'Where your social buttons point to.', icon: <Share2 size={18} />, fields: [
    { key: 'social.whatsapp.url', label: 'WhatsApp URL', type: 'input' },
    { key: 'social.tiktok.url', label: 'TikTok URL', type: 'input' },
    { key: 'social.instagram.url', label: 'Instagram URL', type: 'input' },
    { key: 'social.facebook.url', label: 'Facebook URL', type: 'input' },
    { key: 'social.youtube.url', label: 'YouTube URL', type: 'input' },
  ]},
];

// Bundle consecutive fields that share a `group` label into one visual block,
// so e.g. a pillar's title+body render together instead of as two anonymous rows.
type ContentBlock = { kind: 'single'; field: ContentField } | { kind: 'group'; name: string; fields: ContentField[] };
function groupContentFields(fields: ContentField[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const field of fields) {
    const last = blocks[blocks.length - 1];
    if (field.group && last?.kind === 'group' && last.name === field.group) {
      last.fields.push(field);
    } else if (field.group) {
      blocks.push({ kind: 'group', name: field.group, fields: [field] });
    } else {
      blocks.push({ kind: 'single', field });
    }
  }
  return blocks;
}

const emptyForm = { name: '', description: '', image_url: '', price: '', category: '', active: true };
const emptyVideoForm = { title: '', description: '', category: 'company' as 'company' | 'product', video_url: '', active: true };

async function uploadToCloudinary(file: File, token: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_URL}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await res.json() as { url?: string; message?: string };
  if (!res.ok || !data.url) throw new Error(data.message ?? 'Upload failed');
  return data.url;
}

async function uploadVideoToCloudinary(file: File, token: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_URL}/admin/upload-video`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await res.json() as { url?: string; message?: string };
  if (!res.ok || !data.url) throw new Error(data.message ?? 'Upload failed');
  return data.url;
}

export default function AdminDashboard() {
  // Start with 'loading' state
  const [authState, setAuthState] = useState<'loading' | 'out' | 'in'>('loading');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<Stats>({ subscribers: 0, contacts: 0, products: 0, reviews: 0, videos: 0 });
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);

  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editVideoId, setEditVideoId] = useState<number | null>(null);
  const [videoForm, setVideoForm] = useState(emptyVideoForm);
  const [videoUploading, setVideoUploading] = useState(false);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const videoFormPanelRef = useRef<HTMLDivElement>(null);

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [uploadingContentKey, setUploadingContentKey] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(CONTENT_SECTIONS[0].title);
  // Last-persisted values, so we can flag fields with unsaved edits.
  const [baseline, setBaseline] = useState<Record<string, string>>({});
  const [contactPage, setContactPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [productPage, setProductPage] = useState(1);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ subject: '', message: '' });
  const [broadcastAttachments, setBroadcastAttachments] = useState<File[]>([]);
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const broadcastFileRef = useRef<HTMLInputElement>(null);

  const token = () => localStorage.getItem('adminToken') ?? '';
  const authHeader = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

  const loadAll = async (tok: string) => {
    const h = { Authorization: `Bearer ${tok}` };
    const [st, su, co, pr, rv, vd, ct] = await Promise.all([
      fetch(`${API_URL}/admin/stats`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/admin/subscribers`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/admin/contacts`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/admin/products`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/admin/reviews`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/admin/videos`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/content`).then(r => r.json()),
    ]);
    setStats(st && typeof st === 'object' ? st : { subscribers: 0, contacts: 0, products: 0, reviews: 0, videos: 0 });
    setSubscribers(Array.isArray(su) ? su : []);
    setContacts(Array.isArray(co) ? co : []);
    setProducts(Array.isArray(pr) ? pr : []);
    setReviews(Array.isArray(rv) ? rv : []);
    setVideos(Array.isArray(vd) ? vd : []);
    const contentMap = ct && typeof ct === 'object' && !Array.isArray(ct) ? ct : {};
    setContent(contentMap);
    setBaseline(contentMap);
  };

  // Authentication check - runs once on mount
  useEffect(() => {
    const checkAuth = async () => {
      const tok = token();
      if (!tok) {
        setAuthState('out');
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${tok}` }
        });
        
        if (response.ok) {
          await loadAll(tok);
          setAuthState('in');
        } else {
          localStorage.removeItem('adminToken');
          setAuthState('out');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminToken');
        setAuthState('out');
      }
    };
    
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reset search when switching tabs
  useEffect(() => { setSearch(''); setSidebarOpen(false); setShowNotifications(false); setShowProfileMenu(false); }, [activeTab]);

  // Ctrl/Cmd+K focuses the search box, matching the on-screen hint.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // Close the notifications/profile dropdowns when clicking outside them.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    
    try {
      const r = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const d = await r.json();
      
      if (r.ok) {
        localStorage.setItem('adminToken', d.token);
        await loadAll(d.token);
        setAuthState('in');
      } else {
        setLoginError(d.message || 'Invalid credentials');
      }
    } catch {
      setLoginError('Connection failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAuthState('out');
    setSubscribers([]);
    setContacts([]);
    setProducts([]);
    setReviews([]);
    setVideos([]);
    setContent({});
    setBaseline({});
  };

  const deleteRow = async (type: 'subscribers' | 'contacts' | 'reviews' | 'videos', id: number) => {
    if (!confirm('Delete this entry?')) return;
    await fetch(`${API_URL}/admin/${type}/${id}`, { method: 'DELETE', headers: authHeader() });
    await loadAll(token());
  };

  const updateInquiryStatus = async (id: number, status: string) => {
    await fetch(`${API_URL}/admin/contacts/${id}/status`, {
      method: 'PATCH',
      headers: authHeader(),
      body: JSON.stringify({ status }),
    });
    await loadAll(token());
  };

  const updateReviewStatus = async (id: number, status: string) => {
    await fetch(`${API_URL}/admin/reviews/${id}/status`, {
      method: 'PATCH',
      headers: authHeader(),
      body: JSON.stringify({ status }),
    });
    await loadAll(token());
  };

  const exportCSV = async (type: 'subscribers' | 'contacts' | 'products') => {
    const res = await fetch(`${API_URL}/admin/export/${type}`, { headers: authHeader() });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${type}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const addBroadcastAttachments = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setBroadcastAttachments(prev => [...prev, ...files]);
    if (broadcastFileRef.current) broadcastFileRef.current.value = '';
  };
  const removeBroadcastAttachment = (index: number) => {
    setBroadcastAttachments(prev => prev.filter((_, i) => i !== index));
  };
  const closeBroadcastForm = () => {
    setShowBroadcast(false);
    setBroadcastForm({ subject: '', message: '' });
    setBroadcastAttachments([]);
  };

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.subject.trim() || !broadcastForm.message.trim()) return;
    if (!confirm(`Send this email to all ${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}? This can't be undone.`)) return;
    setBroadcastSending(true);
    setBroadcastMsg(null);
    try {
      const fd = new FormData();
      fd.append('subject', broadcastForm.subject);
      fd.append('message', broadcastForm.message);
      broadcastAttachments.forEach(file => fd.append('attachments', file));
      const r = await fetch(`${API_URL}/admin/subscribers/broadcast`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const d = await r.json() as { message?: string };
      if (r.ok) {
        setBroadcastMsg({ type: 'success', text: d.message ?? 'Email sent' });
        setBroadcastForm({ subject: '', message: '' });
        setBroadcastAttachments([]);
        setShowBroadcast(false);
      } else {
        setBroadcastMsg({ type: 'error', text: d.message ?? 'Failed to send' });
      }
    } catch {
      setBroadcastMsg({ type: 'error', text: 'Connection failed' });
    } finally {
      setBroadcastSending(false);
    }
  };

  const scrollToForm = () => setTimeout(() => formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  const openAddForm = () => { setForm(emptyForm); setEditId(null); setShowForm(true); scrollToForm(); };
  const openEditForm = (p: Product) => { setForm({ name: p.name, description: p.description, image_url: p.image_url ?? '', price: p.price?.toString() ?? '', category: p.category ?? '', active: p.active }); setEditId(p.id); setShowForm(true); scrollToForm(); };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadToCloudinary(file, token()); setForm(f => ({ ...f, image_url: url })); }
    catch (err) { alert(`Upload failed: ${err instanceof Error ? err.message : err}`); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { name: form.name, description: form.description, image_url: form.image_url || undefined, price: form.price ? parseFloat(form.price) : undefined, category: form.category || undefined, active: form.active };
    await fetch(editId ? `${API_URL}/admin/products/${editId}` : `${API_URL}/admin/products`, { method: editId ? 'PUT' : 'POST', headers: authHeader(), body: JSON.stringify(body) });
    closeForm(); await loadAll(token());
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE', headers: authHeader() });
    await loadAll(token());
  };

  const scrollToVideoForm = () => setTimeout(() => videoFormPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  const openAddVideoForm = () => { setVideoForm(emptyVideoForm); setEditVideoId(null); setShowVideoForm(true); scrollToVideoForm(); };
  const openEditVideoForm = (v: Video) => { setVideoForm({ title: v.title, description: v.description ?? '', category: v.category, video_url: v.video_url, active: v.active }); setEditVideoId(v.id); setShowVideoForm(true); scrollToVideoForm(); };
  const closeVideoForm = () => { setShowVideoForm(false); setEditVideoId(null); setVideoForm(emptyVideoForm); };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setVideoUploading(true);
    try { const url = await uploadVideoToCloudinary(file, token()); setVideoForm(f => ({ ...f, video_url: url })); }
    catch (err) { alert(`Upload failed: ${err instanceof Error ? err.message : err}`); }
    finally { setVideoUploading(false); if (videoFileRef.current) videoFileRef.current.value = ''; }
  };

  const saveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.video_url) { alert('Please upload a video first'); return; }
    const body = { title: videoForm.title, description: videoForm.description || undefined, category: videoForm.category, video_url: videoForm.video_url, active: videoForm.active };
    await fetch(editVideoId ? `${API_URL}/admin/videos/${editVideoId}` : `${API_URL}/admin/videos`, { method: editVideoId ? 'PUT' : 'POST', headers: authHeader(), body: JSON.stringify(body) });
    closeVideoForm(); await loadAll(token());
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);
    if (pwForm.next !== pwForm.confirm) { setPwError('New passwords do not match'); return; }
    if (pwForm.next.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    setPwSaving(true);
    try {
      const r = await fetch(`${API_URL}/admin/change-password`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const d = await r.json() as { message?: string };
      if (r.ok) { setPwSuccess(true); setPwForm({ current: '', next: '', confirm: '' }); }
      else { setPwError(d.message ?? 'Failed to update password'); }
    } catch { setPwError('Connection failed'); }
    finally { setPwSaving(false); }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingContentKey(key);
    try { const url = await uploadToCloudinary(file, token()); setContent(c => ({ ...c, [key]: url })); }
    catch (err) { alert(`Upload failed: ${err instanceof Error ? err.message : err}`); }
    finally { setUploadingContentKey(null); e.target.value = ''; }
  };

  const saveContentKey = async (key: string) => {
    setSavingKey(key);
    const value = content[key] ?? '';
    try {
      await fetch(`${API_URL}/admin/content/${encodeURIComponent(key)}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ value }) });
      setBaseline(b => ({ ...b, [key]: value }));
      setSavedKey(key); setTimeout(() => setSavedKey(null), 2000);
    } finally { setSavingKey(null); }
  };

  const isFieldDirty = (key: string) => (content[key] ?? '') !== (baseline[key] ?? '');
  const isSectionDirty = (s: ContentSection) => s.fields.some(f => isFieldDirty(f.key));

  const renderSaveButton = (key: string) => {
    const dirty = isFieldDirty(key);
    return (
      <button
        className={`save-btn ${savedKey === key ? 'saved' : ''} ${dirty ? '' : 'save-btn--clean'}`}
        onClick={() => saveContentKey(key)}
        disabled={savingKey === key || (!dirty && savedKey !== key)}
        title={dirty ? 'Save changes' : 'No changes to save'}
      >
        {savingKey === key ? (
          <Loader size={14} className="spin" />
        ) : savedKey === key ? (
          <><Check size={15} /> Saved</>
        ) : (
          'Save'
        )}
      </button>
    );
  };

  const renderContentField = (field: ContentField) => (
    <div key={field.key} className={`cf-row ${isFieldDirty(field.key) ? 'cf-row--dirty' : ''}`}>
      <label>
        {field.label}
        {isFieldDirty(field.key) && <span className="cf-unsaved">Unsaved</span>}
      </label>
      {field.type === 'image' ? (
        <div className="cf-image-row">
          <div className="cf-image-preview-wrap">
            {content[field.key] ? (
              <div className="uploader-preview">
                <img src={content[field.key]} alt="preview" />
                <button type="button" onClick={() => setContent(c => ({ ...c, [field.key]: '' }))} className="remove-img">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label htmlFor={`cimg-${field.key}`} className="uploader-drop-compact">
                {uploadingContentKey === field.key ? (
                  <Loader size={18} className="spin" />
                ) : (
                  <ImageIcon size={18} />
                )}
                <span>{uploadingContentKey === field.key ? 'Uploading…' : 'Upload'}</span>
              </label>
            )}
            <input
              id={`cimg-${field.key}`}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              disabled={uploadingContentKey === field.key}
              onChange={e => handleContentImageUpload(e, field.key)}
            />
          </div>
          <div className="cf-image-meta">
            <input
              className="url-input"
              value={content[field.key] ?? ''}
              onChange={e => setContent(c => ({ ...c, [field.key]: e.target.value }))}
              placeholder="…or paste an image URL"
            />
            {renderSaveButton(field.key)}
          </div>
        </div>
      ) : (
        <div className="cf-input">
          {field.type === 'textarea' ? (
            <textarea
              rows={3}
              value={content[field.key] ?? ''}
              onChange={e => setContent(c => ({ ...c, [field.key]: e.target.value }))}
            />
          ) : (
            <input
              value={content[field.key] ?? ''}
              onChange={e => setContent(c => ({ ...c, [field.key]: e.target.value }))}
            />
          )}
          {renderSaveButton(field.key)}
        </div>
      )}
    </div>
  );

  // ── Loading State ──
  if (authState === 'loading') {
    return (
      <div className="admin-splash">
        <div className="splash-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // ── Login Screen ──
  if (authState === 'out') {
    return (
      <div className="admin-login-page">
        <div className="login-box">
          <div className="login-logo">
            <img src="/assets/logo.jpeg" alt="Kar Organics logo" className="login-logo-img" />
            <p>Admin Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            {loginError && <p className="login-error">{loginError}</p>}
            <button type="submit" className="login-btn" disabled={loggingIn}>
              {loggingIn ? (
                <>
                  <Loader size={16} className="spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard (only shown when authState === 'in') ──
  const q = search.trim().toLowerCase();
  const filteredProducts = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) : products;
  const filteredContacts = q ? contacts.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.product.toLowerCase().includes(q)) : contacts;
  const filteredSubs = q ? subscribers.filter(s => s.email.toLowerCase().includes(q)) : subscribers;
  const filteredReviews = q ? reviews.filter(r => r.name.toLowerCase().includes(q) || (r.body ?? '').toLowerCase().includes(q)) : reviews;
  const filteredVideos = q ? videos.filter(v => v.title.toLowerCase().includes(q) || (v.description ?? '').toLowerCase().includes(q)) : videos;

  const PAGE_SIZE = 10;
  const pagedContacts = filteredContacts.slice((contactPage - 1) * PAGE_SIZE, contactPage * PAGE_SIZE);
  const pagedSubs = filteredSubs.slice((subPage - 1) * PAGE_SIZE, subPage * PAGE_SIZE);
  const pagedReviews = filteredReviews.slice((reviewPage - 1) * PAGE_SIZE, reviewPage * PAGE_SIZE);
  const pagedProducts = filteredProducts.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);
  const contactPages = Math.ceil(filteredContacts.length / PAGE_SIZE);
  const subPages = Math.ceil(filteredSubs.length / PAGE_SIZE);
  const reviewPages = Math.ceil(filteredReviews.length / PAGE_SIZE);
  const productPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

  type NavItem = { tab: Tab; icon: React.ReactNode; label: string; count?: number; onSelect?: () => void; isActive?: boolean };
  const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
    { label: 'Overview', items: [
      { tab: 'dashboard', icon: <LayoutDashboard size={19} />, label: 'Dashboard' },
    ]},
    { label: 'Catalog', items: [
      { tab: 'products', icon: <Package size={19} />, label: 'Products', count: products.length, onSelect: closeForm, isActive: activeTab === 'products' && !showForm },
      { tab: 'products', icon: <Plus size={19} />, label: 'Create Product', onSelect: openAddForm, isActive: activeTab === 'products' && showForm },
      { tab: 'videos', icon: <VideoIcon size={19} />, label: 'Videos', count: videos.length },
    ]},
    { label: 'Customers', items: [
      { tab: 'contacts', icon: <MessageSquare size={19} />, label: 'Inquiries', count: contacts.length },
      { tab: 'reviews', icon: <Star size={19} />, label: 'Reviews', count: reviews.length },
      { tab: 'subscribers', icon: <Users size={19} />, label: 'Subscribers', count: subscribers.length },
    ]},
    { label: 'Settings', items: [
      { tab: 'content', icon: <FileEdit size={19} />, label: 'Site Content' },
      { tab: 'settings', icon: <KeyRound size={19} />, label: 'Account' },
    ]},
  ];

  const pendingReviews = reviews.filter(r => (r.status ?? 'pending') === 'pending');
  const showSearch = activeTab !== 'dashboard' && activeTab !== 'content' && activeTab !== 'settings';
  const activeSection = CONTENT_SECTIONS.find(s => s.title === openSection) ?? CONTENT_SECTIONS[0];

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'layout-collapsed' : ''}`}>
      {/* ── Mobile overlay ── */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/assets/logo.jpeg" alt="Kar Organics" className="brand-logo-img" />
          <div className="brand-text">
            <div className="brand-name">Kar Organics</div>
            <div className="brand-sub">Admin Panel</div>
          </div>
          <button className="sidebar-collapse-btn" onClick={() => setSidebarCollapsed(v => !v)} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <ChevronsLeft size={16} />
          </button>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="nav-section">
              <div className="nav-section-label">{group.label}</div>
              {group.items.map(({ tab, icon, label, count, onSelect, isActive }) => (
                <div key={label} className="nav-group">
                  <button
                    className={`nav-item ${(isActive ?? activeTab === tab) ? 'nav-active' : ''}`}
                    onClick={() => { setActiveTab(tab); onSelect?.(); }}
                    title={sidebarCollapsed ? label : undefined}
                  >
                    <span className="nav-icon">{icon}</span>
                    <span className="nav-label">{label}</span>
                    {count !== undefined && <span className="nav-badge">{count}</span>}
                  </button>
                  {tab === 'content' && activeTab === 'content' && (
                    <div className="nav-submenu">
                      {CONTENT_SECTIONS.map(section => (
                        <button
                          key={section.title}
                          className={`nav-subitem ${openSection === section.title ? 'nav-subitem-active' : ''}`}
                          onClick={() => setOpenSection(section.title)}
                        >
                          <span className="nav-subicon">{section.icon}</span>
                          <span className="nav-sublabel">{section.title}</span>
                          {isSectionDirty(section) && <span className="rail-dot" title="Unsaved changes" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item nav-logout" onClick={handleLogout}>
            <span className="nav-icon"><LogOut size={19} /></span>
            <span className="nav-label">Log out</span>
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
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search…"
                />
                <kbd className="search-kbd">Ctrl K</kbd>
              </div>
            )}
            {(activeTab === 'dashboard' || activeTab === 'products') && (
              <button className="btn btn-primary" onClick={() => { setActiveTab('products'); openAddForm(); }}>
                <Plus size={16} /> Add Product
              </button>
            )}
            {(activeTab === 'dashboard' || activeTab === 'videos') && (
              <button className="btn btn-outline" onClick={() => { setActiveTab('videos'); openAddVideoForm(); }}>
                <Plus size={16} /> Add Video
              </button>
            )}
            {activeTab === 'dashboard' && (
              <button className="btn btn-primary" onClick={() => { setActiveTab('subscribers'); setShowBroadcast(true); }}>
                <Mail size={16} /> Email Subscribers
              </button>
            )}
            {(activeTab === 'contacts' || activeTab === 'subscribers' || activeTab === 'products') && (
              <button className="btn btn-outline" onClick={() => exportCSV(activeTab as 'subscribers' | 'contacts' | 'products')}>
                <Download size={16} /> Export
              </button>
            )}
            {activeTab === 'subscribers' && subscribers.length > 0 && (
              <button className="btn btn-primary" onClick={() => setShowBroadcast(v => !v)}>
                <Mail size={16} /> Email Subscribers
              </button>
            )}

            <div className="topbar-icons">
              <button className="icon-chip" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
              </button>

              <div className="topbar-dropdown" ref={notifRef}>
                <button
                  className="icon-chip"
                  onClick={() => { setShowNotifications(v => !v); setShowProfileMenu(false); }}
                  title="Notifications"
                >
                  <Bell size={17} />
                  {pendingReviews.length > 0 && <span className="icon-chip-badge">{pendingReviews.length}</span>}
                </button>
                {showNotifications && (
                  <div className="topbar-menu topbar-menu--wide">
                    <div className="topbar-menu-head">Notifications</div>
                    {pendingReviews.length === 0 ? (
                      <p className="topbar-menu-empty">You're all caught up.</p>
                    ) : (
                      <ul className="topbar-menu-list">
                        {pendingReviews.slice(0, 5).map(r => (
                          <li key={r.id}>
                            <span className="dash-avatar dash-avatar--purple">{r.name.charAt(0).toUpperCase()}</span>
                            <div className="dash-list-main">
                              <div className="cell-strong">{r.name}</div>
                              <div className="cell-sub">left a review awaiting approval</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="topbar-menu-footer" onClick={() => { setActiveTab('reviews'); setShowNotifications(false); }}>
                      View all reviews
                    </button>
                  </div>
                )}
              </div>

              <button className="icon-chip" onClick={() => setActiveTab('settings')} title="Settings">
                <SettingsIcon size={17} />
              </button>

              <div className="topbar-dropdown" ref={profileRef}>
                <button
                  className="profile-chip"
                  onClick={() => { setShowProfileMenu(v => !v); setShowNotifications(false); }}
                >
                  <span className="profile-avatar">A</span>
                  <ChevronDown size={14} />
                </button>
                {showProfileMenu && (
                  <div className="topbar-menu">
                    <div className="topbar-menu-head">Admin</div>
                    <button className="topbar-menu-item" onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}>
                      <KeyRound size={15} /> Account settings
                    </button>
                    <button className="topbar-menu-item topbar-menu-item--danger" onClick={handleLogout}>
                      <LogOut size={15} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <>
              <div className="dash-welcome">
                <div>
                  <h2>Welcome back</h2>
                  <p>Here's what's happening with your store.</p>
                </div>
                <div className="dash-date-pill">
                  <CalendarDays size={15} />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="stat-card-row">
                <button className="stat-card stat-card--green" onClick={() => setActiveTab('products')}>
                  <span className="stat-card-icon"><Package size={22} /></span>
                  <div className="stat-card-body">
                    <p>Products</p>
                    <h4>{stats.products}</h4>
                  </div>
                </button>
                <button className="stat-card stat-card--navy" onClick={() => setActiveTab('contacts')}>
                  <span className="stat-card-icon"><MessageSquare size={22} /></span>
                  <div className="stat-card-body">
                    <p>Inquiries</p>
                    <h4>{stats.contacts}</h4>
                  </div>
                </button>
                <button className="stat-card stat-card--purple" onClick={() => setActiveTab('reviews')}>
                  <span className="stat-card-icon"><Star size={22} /></span>
                  <div className="stat-card-body">
                    <p>Reviews</p>
                    <h4>{stats.reviews}</h4>
                  </div>
                </button>
                <button className="stat-card stat-card--amber" onClick={() => setActiveTab('subscribers')}>
                  <span className="stat-card-icon"><Users size={22} /></span>
                  <div className="stat-card-body">
                    <p>Subscribers</p>
                    <h4>{stats.subscribers}</h4>
                  </div>
                </button>
              </div>

              <div className="metric-card-row">
                <div className="metric-card">
                  <div className="metric-card-top">
                    <div><h4>{stats.videos}</h4><p>Videos</p></div>
                    <span className="metric-icon metric-icon--blue"><VideoIcon size={17} /></span>
                  </div>
                  <div className="metric-card-footer">
                    <span>Company &amp; product videos</span>
                    <button onClick={() => setActiveTab('videos')}>View all</button>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-card-top">
                    <div><h4>{products.filter(p => p.active).length}</h4><p>Live Products</p></div>
                    <span className="metric-icon metric-icon--green"><TrendingUp size={17} /></span>
                  </div>
                  <div className="metric-card-footer">
                    <span>Visible on the website</span>
                    <button onClick={() => setActiveTab('products')}>View all</button>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-card-top">
                    <div><h4>{pendingReviews.length}</h4><p>Pending Reviews</p></div>
                    <span className="metric-icon metric-icon--purple"><Star size={17} /></span>
                  </div>
                  <div className="metric-card-footer">
                    <span>Awaiting approval</span>
                    <button onClick={() => setActiveTab('reviews')}>View all</button>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="panel dashboard-panel">
                  <div className="panel-head">
                    <h2>Recent Inquiries</h2>
                    <button className="btn btn-soft" onClick={() => setActiveTab('contacts')}>View all <ArrowRight size={14} /></button>
                  </div>
                  {contacts.length === 0 ? (
                    <div className="empty-state"><MessageSquare size={32} /><h3>No inquiries yet</h3></div>
                  ) : (
                    <ul className="dashboard-list">
                      {contacts.slice(0, 5).map(c => (
                        <li key={c.id}>
                          <span className="dash-avatar dash-avatar--blue">{c.name.charAt(0).toUpperCase()}</span>
                          <div className="dash-list-main"><div className="cell-strong">{c.name}</div><div className="cell-sub">{c.product}</div></div>
                          <span className="cell-sub">{new Date(c.created_at).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="panel dashboard-panel">
                  <div className="panel-head">
                    <h2>Pending Reviews</h2>
                    <button className="btn btn-soft" onClick={() => setActiveTab('reviews')}>View all <ArrowRight size={14} /></button>
                  </div>
                  {pendingReviews.length === 0 ? (
                    <div className="empty-state"><Star size={32} /><h3>Nothing pending</h3></div>
                  ) : (
                    <ul className="dashboard-list">
                      {pendingReviews.slice(0, 5).map(r => (
                        <li key={r.id}>
                          <span className="dash-avatar dash-avatar--purple">{r.name.charAt(0).toUpperCase()}</span>
                          <div className="dash-list-main"><div className="cell-strong">{r.name}</div><div className="cell-sub">{r.rating != null ? '★'.repeat(r.rating) : 'No rating'}</div></div>
                          <span className="cell-sub">{new Date(r.created_at).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── PRODUCTS ── */}
          {activeTab === 'products' && (showForm ? (
            <div className="product-page" ref={formPanelRef}>
              <div className="product-page-header">
                <button type="button" className="icon-btn icon-ghost" onClick={closeForm} title="Back to products">
                  <ArrowLeft size={19} />
                </button>
                <div>
                  <h1>{editId ? 'Edit Product' : 'New Product'}</h1>
                  <p>{editId ? "Update this product's details." : 'Add a new product to your catalog.'}</p>
                </div>
              </div>

              <div className="panel">
                <div className="product-form-section-head">
                  <h2>Basic Information</h2>
                  <p>Add the details customers will see in the shop.</p>
                </div>
                <form onSubmit={saveProduct} className="product-form">
                  <div className="field">
                    <label>Product Image</label>
                    <div className="image-upload-row">
                      <button
                        type="button"
                        className="image-dropzone"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                      >
                        {form.image_url ? (
                          <img src={form.image_url} alt="preview" />
                        ) : uploading ? (
                          <Loader size={20} className="spin" />
                        ) : (
                          <>
                            <Plus size={22} />
                            <span>Add Image</span>
                          </>
                        )}
                      </button>
                      <div className="image-upload-side">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                        >
                          <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload Image'}
                        </button>
                        <p className="field-hint">JPG or PNG, up to 10MB.</p>
                        {form.image_url && (
                          <button type="button" className="link-btn" onClick={() => setForm(f => ({ ...f, image_url: '' }))}>
                            Remove image
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Product Name <span>*</span></label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Kar Detox Extract"
                    />
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label>Category</label>
                      <input
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        placeholder="e.g. Teas, Oils, Capsules"
                      />
                    </div>
                    <div className="field">
                      <label>Price (UGX)</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="e.g. 25000"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Short product description"
                    />
                    <p className="field-hint">A brief description shown alongside the product on the shop page.</p>
                  </div>

                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                    />
                    <span>Active — visible on the website</span>
                  </label>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      {editId ? 'Save Changes' : 'Create Product'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={closeForm}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
              <div className="panel">
                {filteredProducts.length === 0 ? (
                  <div className="empty-state">
                    <Package size={40} />
                    <h3>{q ? 'No products match your search' : 'No products yet'}</h3>
                    {!q && (
                      <button className="btn btn-primary" onClick={openAddForm}>
                        <Plus size={16} /> Add your first product
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {pagedProducts.map(p => (
                          <tr key={p.id}>
                            <td>
                              <div className="table-product-cell">
                                {p.image_url ? <img src={p.image_url} alt={p.name} className="table-product-thumb" /> : <div className="table-product-thumb table-product-thumb--empty"><Package size={16} /></div>}
                                <div>
                                  <div className="cell-strong">{p.name}</div>
                                  <div className="cell-sub cell-msg">{p.description || 'No description'}</div>
                                </div>
                              </div>
                            </td>
                            <td>{p.category ? <span className="tag tag-green">{p.category}</span> : <span className="cell-sub">—</span>}</td>
                            <td className="cell-strong">{p.price ? `UGX ${Number(p.price).toLocaleString()}` : '—'}</td>
                            <td><span className={`pc-status ${p.active ? 'on' : 'off'}`}>{p.active ? 'Active' : 'Hidden'}</span></td>
                            <td>
                              <div className="table-row-actions">
                                <button className="btn btn-soft" onClick={() => openEditForm(p)}><Pencil size={14} /> Edit</button>
                                <button className="icon-btn icon-danger" onClick={() => deleteProduct(p.id)}><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {productPages > 1 && (
                  <div className="pagination">
                    <button disabled={productPage === 1} onClick={() => setProductPage(p => p - 1)} className="page-btn">‹ Prev</button>
                    <span className="page-info">{productPage} / {productPages}</span>
                    <button disabled={productPage === productPages} onClick={() => setProductPage(p => p + 1)} className="page-btn">Next ›</button>
                  </div>
                )}
              </div>
          ))}

          {/* ── INQUIRIES ── */}
          {activeTab === 'contacts' && (
            <div className="panel">
              {filteredContacts.length === 0 ? (
                <div className="empty-state"><MessageSquare size={40} /><h3>{q ? 'No inquiries match your search' : 'No inquiries yet'}</h3></div>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Customer</th><th>Phone</th><th>Product</th><th>Qty</th><th>Message</th><th>Status</th><th>Date</th><th></th></tr></thead>
                    <tbody>
                      {pagedContacts.map(c => (
                        <tr key={c.id}>
                          <td><div className="cell-strong">{c.name}</div>{c.email && <div className="cell-sub">{c.email}</div>}</td>
                          <td><a href={`tel:${c.phone}`} className="cell-link">{c.phone}</a></td>
                          <td><span className="tag tag-green">{c.product}</span></td>
                          <td>{c.quantity}</td>
                          <td className="cell-sub cell-msg">{c.message || '—'}</td>
                          <td>
                            <select
                              className={`status-select status-${c.status ?? 'new'}`}
                              value={c.status ?? 'new'}
                              onChange={e => updateInquiryStatus(c.id, e.target.value)}
                            >
                              <option value="new">New</option>
                              <option value="read">Read</option>
                              <option value="responded">Responded</option>
                              <option value="fulfilled">Fulfilled</option>
                            </select>
                          </td>
                          <td className="cell-sub">{new Date(c.created_at).toLocaleDateString()}</td>
                          <td><button className="icon-btn icon-danger" onClick={() => deleteRow('contacts', c.id)}><Trash2 size={15} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {contactPages > 1 && (
                <div className="pagination">
                  <button disabled={contactPage === 1} onClick={() => setContactPage(p => p - 1)} className="page-btn">‹ Prev</button>
                  <span className="page-info">{contactPage} / {contactPages}</span>
                  <button disabled={contactPage === contactPages} onClick={() => setContactPage(p => p + 1)} className="page-btn">Next ›</button>
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS ── */}
          {activeTab === 'reviews' && (
            <div className="panel">
              {filteredReviews.length === 0 ? (
                <div className="empty-state"><Star size={40} /><h3>{q ? 'No reviews match your search' : 'No reviews yet'}</h3></div>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Reviewer</th><th>Rating</th><th>Review</th><th>Media</th><th>Status</th><th>Date</th><th></th></tr></thead>
                    <tbody>
                      {pagedReviews.map(r => (
                        <tr key={r.id}>
                          <td><div className="cell-strong">{r.name}</div></td>
                          <td>{r.rating != null ? '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating) : '—'}</td>
                          <td className="cell-sub cell-msg">{r.body || '—'}</td>
                          <td>
                            {r.media_url && r.media_type === 'video' ? (
                              <a href={r.media_url} target="_blank" rel="noreferrer">
                                <video src={r.media_url} muted playsInline style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                              </a>
                            ) : '—'}
                          </td>
                          <td>
                            <select
                              className={`status-select status-${r.status ?? 'pending'}`}
                              value={r.status ?? 'pending'}
                              onChange={e => updateReviewStatus(r.id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="cell-sub">{new Date(r.created_at).toLocaleDateString()}</td>
                          <td><button className="icon-btn icon-danger" onClick={() => deleteRow('reviews', r.id)}><Trash2 size={15} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {reviewPages > 1 && (
                <div className="pagination">
                  <button disabled={reviewPage === 1} onClick={() => setReviewPage(p => p - 1)} className="page-btn">‹ Prev</button>
                  <span className="page-info">{reviewPage} / {reviewPages}</span>
                  <button disabled={reviewPage === reviewPages} onClick={() => setReviewPage(p => p + 1)} className="page-btn">Next ›</button>
                </div>
              )}
            </div>
          )}

          {/* ── VIDEOS ── */}
          {activeTab === 'videos' && (
            <>
              {showVideoForm && (
                <div className="panel form-panel" ref={videoFormPanelRef}>
                  <div className="panel-head">
                    <h2>{editVideoId ? 'Edit Video' : 'New Video'}</h2>
                    <button className="icon-btn icon-ghost" onClick={closeVideoForm}><X size={18} /></button>
                  </div>
                  <form onSubmit={saveVideo} className="product-form">
                    <div className="form-grid">
                      <div className="field">
                        <label>Title <span>*</span></label>
                        <input
                          required
                          value={videoForm.title}
                          onChange={e => setVideoForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="e.g. Meet the KarOrganics Team"
                        />
                      </div>
                      <div className="field">
                        <label>Category <span>*</span></label>
                        <select
                          value={videoForm.category}
                          onChange={e => setVideoForm(f => ({ ...f, category: e.target.value as 'company' | 'product' }))}
                        >
                          <option value="company">Company</option>
                          <option value="product">Product</option>
                        </select>
                      </div>
                      <div className="field field-full">
                        <label>Description</label>
                        <textarea
                          rows={2}
                          value={videoForm.description}
                          onChange={e => setVideoForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Short description shown under the video (optional)"
                        />
                      </div>
                      <div className="field field-full">
                        <label>Video File <span>*</span></label>
                        <div className="image-uploader">
                          {videoForm.video_url ? (
                            <div className="uploader-preview">
                              <video src={videoForm.video_url} controls style={{ width: '100%', maxHeight: 220 }} />
                              <button type="button" onClick={() => setVideoForm(f => ({ ...f, video_url: '' }))} className="remove-img">
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="uploader-drop"
                              onClick={() => videoFileRef.current?.click()}
                              disabled={videoUploading}
                            >
                              {videoUploading ? (
                                <><Loader size={18} className="spin" /> Uploading… this can take a while for larger files</>
                              ) : (
                                <><Upload size={18} /> Click to upload video (mp4, webm, mov — up to 150MB)</>
                              )}
                            </button>
                          )}
                          <input
                            ref={videoFileRef}
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            style={{ display: 'none' }}
                            onChange={handleVideoFileUpload}
                          />
                        </div>
                      </div>
                    </div>
                    <label className="toggle-row">
                      <input
                        type="checkbox"
                        checked={videoForm.active}
                        onChange={e => setVideoForm(f => ({ ...f, active: e.target.checked }))}
                      />
                      <span>Active — visible on the website</span>
                    </label>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={videoUploading}>
                        {editVideoId ? 'Save Changes' : 'Add Video'}
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={closeVideoForm}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {filteredVideos.length === 0 ? (
                <div className="empty-state">
                  <VideoIcon size={40} />
                  <h3>{q ? 'No videos match your search' : 'No videos yet'}</h3>
                  {!q && (
                    <button className="btn btn-primary" onClick={openAddVideoForm}>
                      <Plus size={16} /> Upload your first video
                    </button>
                  )}
                </div>
              ) : (
                <div className="product-grid">
                  {filteredVideos.map(v => (
                    <div key={v.id} className="product-card">
                      <div className="pc-image">
                        <video src={v.video_url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span className={`pc-status ${v.active ? 'on' : 'off'}`}>{v.active ? 'Active' : 'Hidden'}</span>
                      </div>
                      <div className="pc-body">
                        <h3>{v.title}</h3>
                        <p>{v.description || 'No description'}</p>
                        <div className="pc-price"><span className={`tag ${v.category === 'company' ? 'tag-blue' : 'tag-green'}`}>{v.category === 'company' ? 'Company' : 'Product'}</span></div>
                      </div>
                      <div className="pc-actions">
                        <button className="btn btn-soft" onClick={() => openEditVideoForm(v)}><Pencil size={14} /> Edit</button>
                        <button className="icon-btn icon-danger" onClick={() => deleteRow('videos', v.id)}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── SUBSCRIBERS ── */}
          {activeTab === 'subscribers' && (
            <>
              {broadcastMsg && (
                <div className={`broadcast-banner broadcast-banner--${broadcastMsg.type}`}>
                  {broadcastMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
                  {broadcastMsg.text}
                </div>
              )}

              {showBroadcast && (
                <div className="panel form-panel">
                  <div className="panel-head">
                    <h2>Email All Subscribers</h2>
                    <button className="icon-btn icon-ghost" onClick={closeBroadcastForm}><X size={18} /></button>
                  </div>
                  <form onSubmit={sendBroadcast} className="product-form">
                    <div className="form-grid">
                      <div className="field field-full">
                        <label>Subject <span>*</span></label>
                        <input
                          required
                          value={broadcastForm.subject}
                          onChange={e => setBroadcastForm(f => ({ ...f, subject: e.target.value }))}
                          placeholder="e.g. New herbal products just arrived!"
                        />
                      </div>
                      <div className="field field-full">
                        <label>Message <span>*</span></label>
                        <textarea
                          required
                          rows={8}
                          value={broadcastForm.message}
                          onChange={e => setBroadcastForm(f => ({ ...f, message: e.target.value }))}
                          placeholder="Write your message here…"
                        />
                      </div>
                    </div>

                    <div className="field field-full">
                      <label>Attachments</label>
                      {broadcastAttachments.length > 0 && (
                        <ul className="attachment-list">
                          {broadcastAttachments.map((file, i) => (
                            <li key={`${file.name}-${i}`}>
                              <span className="attachment-name">{file.name}</span>
                              <span className="attachment-size">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                              <button type="button" className="icon-btn icon-ghost" onClick={() => removeBroadcastAttachment(i)}><X size={14} /></button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <button type="button" className="btn btn-outline" onClick={() => broadcastFileRef.current?.click()}>
                        <Paperclip size={15} /> Attach file
                      </button>
                      <input
                        ref={broadcastFileRef}
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx"
                        style={{ display: 'none' }}
                        onChange={addBroadcastAttachments}
                      />
                    </div>

                    <p className="broadcast-hint">
                      This will be sent as one email to all {subscribers.length} subscriber{subscribers.length === 1 ? '' : 's'}, BCC'd so no one sees the others' addresses. Attachments: PDF, image, Word, or Excel, up to 10MB each.
                    </p>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={broadcastSending}>
                        {broadcastSending ? <><Loader size={16} className="spin" /> Sending…</> : <><Send size={16} /> Send to all subscribers</>}
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={closeBroadcastForm}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="panel">
              {filteredSubs.length === 0 ? (
                <div className="empty-state"><Users size={40} /><h3>{q ? 'No subscribers match your search' : 'No subscribers yet'}</h3></div>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Email</th><th>Date joined</th><th></th></tr></thead>
                    <tbody>
                      {pagedSubs.map(s => (
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
              {subPages > 1 && (
                <div className="pagination">
                  <button disabled={subPage === 1} onClick={() => setSubPage(p => p - 1)} className="page-btn">‹ Prev</button>
                  <span className="page-info">{subPage} / {subPages}</span>
                  <button disabled={subPage === subPages} onClick={() => setSubPage(p => p + 1)} className="page-btn">Next ›</button>
                </div>
              )}
              </div>
            </>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <div className="panel" style={{ maxWidth: 480 }}>
              <div className="panel-head">
                <h2>Change Password</h2>
              </div>
              <form onSubmit={handleChangePassword} className="product-form">
                <div className="field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={pwForm.current}
                    onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div className="field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={pwForm.next}
                    onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                  />
                </div>
                <div className="field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                    required
                    autoComplete="new-password"
                  />
                </div>
                {pwError && <p className="login-error">{pwError}</p>}
                {pwSuccess && <p className="pw-success"><Check size={15} /> Password updated successfully</p>}
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                    {pwSaving ? <><Loader size={16} className="spin" /> Saving…</> : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── SITE CONTENT ── */}
          {activeTab === 'content' && (
            <div className="content-layout">
              {/* Fields for the selected section (choose a section from the sidebar) */}
              <div className="content-detail">
                <div className="detail-head">
                  <span className="detail-icon">{activeSection.icon}</span>
                  <div>
                    <h2>{activeSection.title}</h2>
                    <p>{activeSection.desc}</p>
                  </div>
                </div>

                <div className="content-notice">
                  Each field saves on its own. Changes go live immediately — reload the website to see them.
                </div>

                {groupContentFields(activeSection.fields).map(block =>
                  block.kind === 'single' ? (
                    <div key={block.field.key} className="cf-card">
                      {renderContentField(block.field)}
                    </div>
                  ) : (
                    <div key={block.name} className="cf-card">
                      <div className="cf-card-label">{block.name}</div>
                      <div className={`cf-card-body ${block.fields.length === 2 && block.fields.every(f => f.type === 'input') ? 'cf-card-body--pair' : ''}`}>
                        {block.fields.map(renderContentField)}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}