import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Download, Loader, Mail, Paperclip, Send, Trash2, Users, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable, { type Column } from '../components/DataTable';
import { useAdminUI } from '../components/adminUIContext';
import { useAdminChrome } from '../adminChromeContext';
import { useAdminResource } from '../../hooks/useAdminResource';
import { API_URL } from '../../lib/api';
import { getToken } from '../../lib/adminAuth';
import { apiFetch, apiFetchBlob } from '../../lib/adminFetch';
import type { Subscriber } from '../types';

export default function SubscribersPage() {
  const { confirm, toast } = useAdminUI();
  const { refreshCounts } = useAdminChrome();
  const { data, loading, error, refetch } = useAdminResource<Subscriber[]>('/admin/subscribers');
  const subscribers = data ?? [];

  const [showBroadcast, setShowBroadcast] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const closeBroadcast = () => {
    setShowBroadcast(false);
    setForm({ subject: '', message: '' });
    setAttachments([]);
  };

  const addAttachments = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setAttachments((prev) => [...prev, ...files]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const sendBroadcast = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    const ok = await confirm({
      title: `Send to all ${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}?`,
      description: "This sends the email immediately and can't be undone.",
      confirmLabel: 'Send email',
    });
    if (!ok) return;

    setSending(true);
    try {
      const body = new FormData();
      body.append('subject', form.subject);
      body.append('message', form.message);
      attachments.forEach((file) => body.append('attachments', file));
      // Sent with a raw fetch rather than apiFetch so the browser sets the
      // multipart boundary itself.
      const res = await fetch(`${API_URL}/admin/subscribers/broadcast`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body,
      });
      const payload = (await res.json()) as { message?: string };
      if (res.ok) {
        toast.success(payload.message ?? 'Email sent');
        closeBroadcast();
      } else {
        toast.error(payload.message ?? 'Failed to send');
      }
    } catch {
      toast.error('Connection failed');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (subscriber: Subscriber) => {
    const ok = await confirm({
      title: `Remove ${subscriber.email}?`,
      description: 'They will stop receiving your newsletter.',
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiFetch(`/admin/subscribers/${subscriber.id}`, { method: 'DELETE' });
      toast.success('Subscriber removed');
      refetch();
      refreshCounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove subscriber');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiFetchBlob('/admin/export/subscribers');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscribers.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const columns: Column<Subscriber>[] = [
    { key: 'email', header: 'Email', render: (s) => <div className="cell-strong">{s.email}</div> },
    {
      key: 'created_at',
      header: 'Date joined',
      render: (s) => <span className="cell-sub">{new Date(s.created_at).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '1%',
      render: (s) => (
        <button className="icon-btn icon-danger" onClick={() => handleDelete(s)} title="Remove subscriber">
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Subscribers"
        description="People who joined your newsletter list."
        onRefresh={refetch}
        actions={
          <>
            <button className="btn btn-outline" onClick={handleExport}>
              <Download size={16} /> Export
            </button>
            {subscribers.length > 0 && (
              <button className="btn btn-primary" onClick={() => setShowBroadcast((v) => !v)}>
                <Mail size={16} /> Email Subscribers
              </button>
            )}
          </>
        }
      />

      {showBroadcast && (
        <div className="panel form-panel">
          <div className="panel-head">
            <h2>Email All Subscribers</h2>
            <button className="icon-btn icon-ghost" onClick={closeBroadcast}><X size={18} /></button>
          </div>
          <form onSubmit={sendBroadcast} className="product-form">
            <div className="form-grid">
              <div className="field field-full">
                <label>Subject <span>*</span></label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. New herbal products just arrived!"
                />
              </div>
              <div className="field field-full">
                <label>Message <span>*</span></label>
                <textarea
                  required
                  rows={8}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Write your message here…"
                />
              </div>
            </div>

            <div className="field field-full">
              <label>Attachments</label>
              {attachments.length > 0 && (
                <ul className="attachment-list">
                  {attachments.map((file, i) => (
                    <li key={`${file.name}-${i}`}>
                      <span className="attachment-name">{file.name}</span>
                      <span className="attachment-size">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <button
                        type="button"
                        className="icon-btn icon-ghost"
                        onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()}>
                <Paperclip size={15} /> Attach file
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx"
                style={{ display: 'none' }}
                onChange={addAttachments}
              />
            </div>

            <p className="broadcast-hint">
              This will be sent as one email to all {subscribers.length} subscriber
              {subscribers.length === 1 ? '' : 's'}, BCC&apos;d so no one sees the others&apos; addresses.
              Attachments: PDF, image, Word, or Excel, up to 10MB each.
            </p>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? (
                  <><Loader size={16} className="spin" /> Sending…</>
                ) : (
                  <><Send size={16} /> Send to all subscribers</>
                )}
              </button>
              <button type="button" className="btn btn-ghost" onClick={closeBroadcast}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={subscribers}
        rowKey={(s) => s.id}
        loading={loading}
        error={error}
        onRetry={refetch}
        search={{
          placeholder: 'Search subscribers…',
          matches: (s, q) => s.email.toLowerCase().includes(q),
        }}
        empty={{
          icon: <Users size={40} />,
          title: 'No subscribers yet',
          description: 'People who sign up through the newsletter form will appear here.',
        }}
      />
    </>
  );
}
