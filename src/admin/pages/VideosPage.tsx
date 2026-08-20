import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Loader, Pencil, Plus, Trash2, Upload, Video as VideoIcon, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { useAdminUI } from '../components/adminUIContext';
import { useAdminChrome } from '../adminChromeContext';
import { useAdminResource } from '../../hooks/useAdminResource';
import { apiFetch, uploadFile } from '../../lib/adminFetch';
import type { Video } from '../types';

interface VideoForm {
  title: string;
  description: string;
  category: 'company' | 'product';
  video_url: string;
  active: boolean;
}

const EMPTY: VideoForm = {
  title: '', description: '', category: 'company', video_url: '', active: true,
};

export default function VideosPage() {
  const { confirm, toast } = useAdminUI();
  const { refreshCounts } = useAdminChrome();
  const { data, loading, error, refetch } = useAdminResource<Video[]>('/admin/videos');
  const videos = data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<VideoForm>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () =>
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); scrollToForm(); };
  const openEdit = (v: Video) => {
    setForm({
      title: v.title,
      description: v.description ?? '',
      category: v.category,
      video_url: v.video_url,
      active: v.active,
    });
    setEditId(v.id);
    setShowForm(true);
    scrollToForm();
  };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile('/admin/upload-video', file);
      setForm((f) => ({ ...f, video_url: url }));
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.video_url) {
      toast.error('Please upload a video first');
      return;
    }
    try {
      await apiFetch(editId ? `/admin/videos/${editId}` : '/admin/videos', {
        method: editId ? 'PUT' : 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          category: form.category,
          video_url: form.video_url,
          active: form.active,
        }),
      });
      toast.success(editId ? 'Video updated' : 'Video added');
      closeForm();
      refetch();
      refreshCounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save video');
    }
  };

  const handleDelete = async (video: Video) => {
    const ok = await confirm({
      title: `Delete “${video.title}”?`,
      description: 'The video will be removed from the website immediately.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiFetch(`/admin/videos/${video.id}`, { method: 'DELETE' });
      toast.success('Video deleted');
      refetch();
      refreshCounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete video');
    }
  };

  return (
    <>
      <PageHeader
        title="Videos"
        description="Upload company and product videos shown on the website."
        onRefresh={refetch}
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Video
          </button>
        }
      />

      {showForm && (
        <div className="panel form-panel" ref={formRef}>
          <div className="panel-head">
            <h2>{editId ? 'Edit Video' : 'New Video'}</h2>
            <button className="icon-btn icon-ghost" onClick={closeForm}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-grid">
              <div className="field">
                <label>Title <span>*</span></label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Meet the KarOrganics Team"
                />
              </div>
              <div className="field">
                <label>Category <span>*</span></label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as 'company' | 'product' }))}
                >
                  <option value="company">Company</option>
                  <option value="product">Product</option>
                </select>
              </div>
              <div className="field field-full">
                <label>Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description shown under the video (optional)"
                />
              </div>
              <div className="field field-full">
                <label>Video File <span>*</span></label>
                <div className="image-uploader">
                  {form.video_url ? (
                    <div className="uploader-preview">
                      <video src={form.video_url} controls style={{ width: '100%', maxHeight: 220 }} />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, video_url: '' }))}
                        className="remove-img"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="uploader-drop"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <><Loader size={18} className="spin" /> Uploading… this can take a while for larger files</>
                      ) : (
                        <><Upload size={18} /> Click to upload video (mp4, webm, mov — up to 150MB)</>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    style={{ display: 'none' }}
                    onChange={handleUpload}
                  />
                </div>
              </div>
            </div>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              />
              <span>Active — visible on the website</span>
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {editId ? 'Save Changes' : 'Add Video'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={closeForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="panel"><div className="table-status"><p>Loading videos…</p></div></div>
      ) : error ? (
        <div className="panel">
          <div className="table-status">
            <p className="table-error">{error}</p>
            <button className="btn btn-outline" onClick={refetch}>Try again</button>
          </div>
        </div>
      ) : videos.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<VideoIcon size={40} />}
            title="No videos yet"
            description="Upload a company or product video to feature it on the website."
            action={
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={16} /> Upload your first video
              </button>
            }
          />
        </div>
      ) : (
        <div className="product-grid">
          {videos.map((v) => (
            <div key={v.id} className="product-card">
              <div className="pc-image">
                <video src={v.video_url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span className={`pc-status ${v.active ? 'on' : 'off'}`}>{v.active ? 'Active' : 'Hidden'}</span>
              </div>
              <div className="pc-body">
                <h3>{v.title}</h3>
                <p>{v.description || 'No description'}</p>
                <div className="pc-price">
                  <span className={`tag ${v.category === 'company' ? 'tag-blue' : 'tag-green'}`}>
                    {v.category === 'company' ? 'Company' : 'Product'}
                  </span>
                </div>
              </div>
              <div className="pc-actions">
                <button className="btn btn-soft" onClick={() => openEdit(v)}>
                  <Pencil size={14} /> Edit
                </button>
                <button className="icon-btn icon-danger" onClick={() => handleDelete(v)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
