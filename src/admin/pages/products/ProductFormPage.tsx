import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Info, Loader, Tag } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import FormSection from '../../components/FormSection';
import ImageUploadField from '../../components/ImageUploadField';
import { useAdminUI } from '../../components/adminUIContext';
import { useAdminChrome } from '../../adminChromeContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { apiFetch } from '../../../lib/adminFetch';
import { RichTextEditor } from '../../../components/ui/RichTextEditor';
import type { Product } from '../../types';

interface FormValues {
  name: string;
  description: string;
  image_url: string;
  price: string;
  category: string;
  active: boolean;
}

const EMPTY: FormValues = {
  name: '', description: '', image_url: '', price: '', category: '', active: true,
};

type Errors = Partial<Record<keyof FormValues, string>>;

/** Mirrors the backend's `productInput` schema (backend/src/routes/admin.ts). */
function validate(values: FormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Name is required';
  if (values.price.trim()) {
    const price = Number(values.price);
    if (Number.isNaN(price)) errors.price = 'Price must be a number';
    else if (price < 0) errors.price = 'Price cannot be negative';
  }
  return errors;
}

/**
 * Serves both /admin/products/new and /admin/products/:id/edit — the two only
 * differ by whether an existing record seeds the fields.
 */
export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useAdminUI();
  const { refreshCounts } = useAdminChrome();

  const { data: product, loading, error } = useAdminResource<Product>(
    isEdit ? `/admin/products/${id}` : null,
  );

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  // Seed the form exactly once per product. Without this guard a background
  // refetch would overwrite whatever the user had already typed.
  const initializedForId = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!isEdit || !product || initializedForId.current === product.id) return;
    initializedForId.current = product.id;
    setValues({
      name: product.name ?? '',
      description: product.description ?? '',
      image_url: product.image_url ?? '',
      price: product.price?.toString() ?? '',
      category: product.category ?? '',
      active: product.active ?? true,
    });
  }, [isEdit, product]);

  const patch = (next: Partial<FormValues>) => setValues((v) => ({ ...v, ...next }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await apiFetch(isEdit ? `/admin/products/${id}` : '/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify({
          name: values.name.trim(),
          description: values.description,
          image_url: values.image_url || undefined,
          price: values.price.trim() ? Number(values.price) : undefined,
          category: values.category.trim() || undefined,
          active: values.active,
        }),
      });
      toast.success(isEdit ? `“${values.name}” updated` : `“${values.name}” created`);
      refreshCounts();
      navigate('/admin/products');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const backButton = (
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/products')}>
      <ArrowLeft size={15} /> Back to Products
    </button>
  );

  if (isEdit && loading) {
    return (
      <div className="form-page">
        <PageHeader title="Edit Product" breadcrumb={backButton} />
        <div className="table-status">
          <Loader size={22} className="spin" />
          <p>Loading product…</p>
        </div>
      </div>
    );
  }

  if (isEdit && (error || !product)) {
    return (
      <div className="form-page">
        <PageHeader title="Product not found" breadcrumb={backButton} />
        <div className="table-status">
          <p className="table-error">{error ?? 'That product no longer exists.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/products')}>
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <PageHeader
        title={isEdit ? 'Edit Product' : 'Create Product'}
        description={
          isEdit
            ? "Update this product's details."
            : 'Add a new product to your catalog.'
        }
        breadcrumb={backButton}
      />

      <form onSubmit={handleSubmit}>
        <FormSection
          icon={<Info size={16} />}
          title="Product Information"
          description="The details customers see in the shop."
        >
          <ImageUploadField
            value={values.image_url}
            onChange={(url) => patch({ image_url: url })}
            label="Product Image"
          />

          <div className="field">
            <label htmlFor="product-name">Name <span>*</span></label>
            <input
              id="product-name"
              value={values.name}
              onChange={(e) => patch({ name: e.target.value })}
              className={errors.name ? 'has-error' : ''}
              placeholder="e.g. Moringa Powder"
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="field">
            <label htmlFor="product-category">Category</label>
            <input
              id="product-category"
              value={values.category}
              onChange={(e) => patch({ category: e.target.value })}
              placeholder="e.g. Herbal Powders"
            />
          </div>

          <label className="toggle-row" htmlFor="product-active">
            <input
              id="product-active"
              type="checkbox"
              checked={values.active}
              onChange={(e) => patch({ active: e.target.checked })}
            />
            <span>Active — visible on the public website</span>
          </label>
        </FormSection>

        <FormSection icon={<Tag size={16} />} title="Pricing">
          <div className="field">
            <label htmlFor="product-price">Price (UGX)</label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="any"
              value={values.price}
              onChange={(e) => patch({ price: e.target.value })}
              className={errors.price ? 'has-error' : ''}
              placeholder="Leave blank to hide the price"
            />
            {errors.price && <p className="field-error">{errors.price}</p>}
          </div>
        </FormSection>

        <FormSection icon={<FileText size={16} />} title="Description">
          <div className="field">
            <RichTextEditor
              value={values.description}
              onChange={(html) => patch({ description: html })}
              placeholder="Describe the product, its benefits and how to use it…"
            />
          </div>
        </FormSection>

        <div className="form-footer">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <><Loader size={15} className="spin" /> Saving…</>
            ) : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
