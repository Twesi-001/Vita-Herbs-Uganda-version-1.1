import { useNavigate } from 'react-router-dom';
import { Download, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable, { type Column } from '../../components/DataTable';
import { useAdminUI } from '../../components/adminUIContext';
import { useAdminChrome } from '../../adminChromeContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { apiFetch, apiFetchBlob } from '../../../lib/adminFetch';
import type { Product } from '../../types';

export default function ProductsListPage() {
  const navigate = useNavigate();
  const { confirm, toast } = useAdminUI();
  const { refreshCounts } = useAdminChrome();
  const { data, loading, error, refetch } = useAdminResource<Product[]>('/admin/products');
  const products = data ?? [];

  const handleDelete = async (product: Product) => {
    const ok = await confirm({
      title: `Delete “${product.name}”?`,
      description: 'This removes the product from the shop immediately. It cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiFetch(`/admin/products/${product.id}`, { method: 'DELETE' });
      toast.success(`“${product.name}” deleted`);
      refetch();
      refreshCounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiFetchBlob('/admin/export/products');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <div className="table-product-cell">
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="table-product-thumb" />
          ) : (
            <div className="table-product-thumb table-product-thumb--empty">
              <Package size={16} />
            </div>
          )}
          <div>
            <div className="cell-strong">{p.name}</div>
            <div className="cell-sub cell-msg">{p.description || 'No description'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) =>
        p.category ? <span className="tag tag-green">{p.category}</span> : <span className="cell-sub">—</span>,
    },
    {
      key: 'price',
      header: 'Price',
      render: (p) => (
        <span className="cell-strong">
          {p.price ? `UGX ${Number(p.price).toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (p) => (
        <span className={`pc-status ${p.active ? 'on' : 'off'}`}>{p.active ? 'Active' : 'Hidden'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '1%',
      render: (p) => (
        <div className="table-row-actions">
          <button className="btn btn-soft" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
            <Pencil size={14} /> Edit
          </button>
          <button className="icon-btn icon-danger" onClick={() => handleDelete(p)} title="Delete product">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description="Add, edit and manage everything customers see in the shop."
        onRefresh={refetch}
        actions={
          <>
            <button className="btn btn-outline" onClick={handleExport}>
              <Download size={16} /> Export
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')}>
              <Plus size={16} /> Add Product
            </button>
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={products}
        rowKey={(p) => p.id}
        loading={loading}
        error={error}
        onRetry={refetch}
        search={{
          placeholder: 'Search products…',
          matches: (p, q) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.category ?? '').toLowerCase().includes(q),
        }}
        empty={{
          icon: <Package size={40} />,
          title: 'No products yet',
          description: 'Add your first product and it will appear in the shop right away.',
          action: (
            <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')}>
              <Plus size={16} /> Add your first product
            </button>
          ),
        }}
      />
    </>
  );
}
