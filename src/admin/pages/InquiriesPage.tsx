import { Download, MessageSquare, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable, { type Column } from '../components/DataTable';
import { useAdminUI } from '../components/adminUIContext';
import { useAdminChrome } from '../adminChromeContext';
import { useAdminResource } from '../../hooks/useAdminResource';
import { apiFetch, apiFetchBlob } from '../../lib/adminFetch';
import type { Contact } from '../types';

export default function InquiriesPage() {
  const { confirm, toast } = useAdminUI();
  const { refreshCounts } = useAdminChrome();
  const { data, loading, error, refetch } = useAdminResource<Contact[]>('/admin/contacts');
  const contacts = data ?? [];

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiFetch(`/admin/contacts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async (contact: Contact) => {
    const ok = await confirm({
      title: `Delete the inquiry from ${contact.name}?`,
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiFetch(`/admin/contacts/${contact.id}`, { method: 'DELETE' });
      toast.success('Inquiry deleted');
      refetch();
      refreshCounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete inquiry');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiFetchBlob('/admin/export/contacts');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const columns: Column<Contact>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <>
          <div className="cell-strong">{c.name}</div>
          {c.email && <div className="cell-sub">{c.email}</div>}
        </>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (c) => <a href={`tel:${c.phone}`} className="cell-link">{c.phone}</a>,
    },
    { key: 'product', header: 'Product', render: (c) => <span className="tag tag-green">{c.product}</span> },
    { key: 'quantity', header: 'Qty', render: (c) => c.quantity },
    { key: 'message', header: 'Message', render: (c) => <span className="cell-sub cell-msg">{c.message || '—'}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <select
          className={`status-select status-${c.status ?? 'new'}`}
          value={c.status ?? 'new'}
          onChange={(e) => updateStatus(c.id, e.target.value)}
        >
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="responded">Responded</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (c) => <span className="cell-sub">{new Date(c.created_at).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '1%',
      render: (c) => (
        <button className="icon-btn icon-danger" onClick={() => handleDelete(c)} title="Delete inquiry">
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Orders and questions submitted through the contact form."
        onRefresh={refetch}
        actions={
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
        }
      />

      <DataTable
        columns={columns}
        rows={contacts}
        rowKey={(c) => c.id}
        loading={loading}
        error={error}
        onRetry={refetch}
        search={{
          placeholder: 'Search inquiries…',
          matches: (c, q) =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.product.toLowerCase().includes(q),
        }}
        empty={{
          icon: <MessageSquare size={40} />,
          title: 'No inquiries yet',
          description: 'Messages sent through the contact form will show up here.',
        }}
      />
    </>
  );
}
