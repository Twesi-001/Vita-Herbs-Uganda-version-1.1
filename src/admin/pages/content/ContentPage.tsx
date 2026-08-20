import { useState, type ChangeEvent } from 'react';
import { Check, ImageIcon, Loader, X } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { useAdminUI } from '../../components/adminUIContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { apiFetch, uploadFile } from '../../../lib/adminFetch';
import { RichTextEditor } from '../../../components/ui/RichTextEditor';
import { CONTENT_DEFAULTS, CONTENT_SECTIONS, groupContentFields, type ContentField, type ContentSection } from './contentSchema';

type ContentMap = Record<string, string>;

export default function ContentPage() {
  const { toast } = useAdminUI();
  const { data, loading, error, refetch } = useAdminResource<ContentMap>('/content');

  const [content, setContent] = useState<ContentMap>({});
  // Last-persisted values, so unsaved fields can be flagged.
  const [baseline, setBaseline] = useState<ContentMap>({});
  const [openSection, setOpenSection] = useState(CONTENT_SECTIONS[0].title);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // Seed the editable copy once per fetched payload. Done during render (not in
  // an effect) so a background refetch can't briefly show stale field values.
  const [seededFrom, setSeededFrom] = useState<ContentMap | null>(null);
  if (data && seededFrom !== data) {
    // Keys that have never been saved fall back to the value the website
    // itself renders, so the editor opens showing what is actually live
    // instead of a blank box. Baseline matches, so nothing reads as unsaved
    // until it is genuinely edited.
    const seeded = { ...CONTENT_DEFAULTS, ...data };
    setSeededFrom(data);
    setContent(seeded);
    setBaseline(seeded);
  }

  const activeSection: ContentSection =
    CONTENT_SECTIONS.find((s) => s.title === openSection) ?? CONTENT_SECTIONS[0];

  const isFieldDirty = (key: string) => (content[key] ?? '') !== (baseline[key] ?? '');
  const isSectionDirty = (s: ContentSection) => s.fields.some((f) => isFieldDirty(f.key));

  const saveKey = async (key: string) => {
    setSavingKey(key);
    const value = content[key] ?? '';
    try {
      await apiFetch(`/admin/content/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
      setBaseline((b) => ({ ...b, [key]: value }));
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSavingKey(null);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKey(key);
    try {
      const url = await uploadFile('/admin/upload', file);
      setContent((c) => ({ ...c, [key]: url }));
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      setUploadingKey(null);
      e.target.value = '';
    }
  };

  const renderSaveButton = (key: string) => {
    const dirty = isFieldDirty(key);
    return (
      <button
        className={`save-btn ${savedKey === key ? 'saved' : ''} ${dirty ? '' : 'save-btn--clean'}`}
        onClick={() => saveKey(key)}
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

  const renderField = (field: ContentField) => (
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
                <button
                  type="button"
                  onClick={() => setContent((c) => ({ ...c, [field.key]: '' }))}
                  className="remove-img"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label htmlFor={`cimg-${field.key}`} className="uploader-drop-compact">
                {uploadingKey === field.key ? <Loader size={18} className="spin" /> : <ImageIcon size={18} />}
                <span>{uploadingKey === field.key ? 'Uploading…' : 'Upload'}</span>
              </label>
            )}
            <input
              id={`cimg-${field.key}`}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              disabled={uploadingKey === field.key}
              onChange={(e) => handleImageUpload(e, field.key)}
            />
          </div>
          <div className="cf-image-meta">
            <input
              className="url-input"
              value={content[field.key] ?? ''}
              onChange={(e) => setContent((c) => ({ ...c, [field.key]: e.target.value }))}
              placeholder="…or paste an image URL"
            />
            {renderSaveButton(field.key)}
          </div>
        </div>
      ) : (
        <div className="cf-input">
          {field.type === 'richtext' ? (
            <RichTextEditor
              value={content[field.key] ?? ''}
              onChange={(html) => setContent((c) => ({ ...c, [field.key]: html }))}
            />
          ) : field.type === 'textarea' ? (
            <textarea
              rows={3}
              value={content[field.key] ?? ''}
              onChange={(e) => setContent((c) => ({ ...c, [field.key]: e.target.value }))}
            />
          ) : (
            <input
              value={content[field.key] ?? ''}
              onChange={(e) => setContent((c) => ({ ...c, [field.key]: e.target.value }))}
            />
          )}
          {renderSaveButton(field.key)}
        </div>
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Site Content"
        description="Edit the text shown across the public website."
        onRefresh={refetch}
      />

      {loading ? (
        <div className="panel"><div className="table-status"><p>Loading content…</p></div></div>
      ) : error ? (
        <div className="panel">
          <div className="table-status">
            <p className="table-error">{error}</p>
            <button className="btn btn-outline" onClick={refetch}>Try again</button>
          </div>
        </div>
      ) : (
        <div className="settings-layout">
          {/* Section picker — used to live in the app sidebar, which made it
              invisible from every other page. It belongs with its content. */}
          <nav className="settings-nav">
            {CONTENT_SECTIONS.map((section) => (
              <button
                key={section.title}
                className={`settings-nav-item ${openSection === section.title ? 'is-active' : ''}`}
                onClick={() => setOpenSection(section.title)}
              >
                <span className="settings-nav-icon">{section.icon}</span>
                <span>{section.title}</span>
                {isSectionDirty(section) && <span className="rail-dot" title="Unsaved changes" />}
              </button>
            ))}
          </nav>

          <div className="settings-body">
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

              {groupContentFields(activeSection.fields).map((block) =>
                block.kind === 'single' ? (
                  <div key={block.field.key} className="cf-card">{renderField(block.field)}</div>
                ) : (
                  <div key={block.name} className="cf-card">
                    <div className="cf-card-label">{block.name}</div>
                    <div
                      className={`cf-card-body ${
                        block.fields.length === 2 && block.fields.every((f) => f.type === 'input')
                          ? 'cf-card-body--pair'
                          : ''
                      }`}
                    >
                      {block.fields.map(renderField)}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
