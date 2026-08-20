import { useRef, useState, type ChangeEvent } from 'react';
import { ImageIcon, Loader, Upload, X } from 'lucide-react';
import { uploadFile } from '../../lib/adminFetch';
import { useToast } from './adminUIContext';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  /** Endpoint that accepts a `file` field and responds with `{ url }`. */
  endpoint?: string;
  label?: string;
  hint?: string;
}

/** Cloudinary-backed image picker: click to upload, or paste a URL. */
export default function ImageUploadField({
  value,
  onChange,
  endpoint = '/admin/upload',
  label = 'Image',
  hint = 'JPG or PNG, up to 10MB.',
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadFile(endpoint, file));
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="field">
      <label>{label}</label>
      <div className="image-upload-row">
        <button
          type="button"
          className="image-dropzone"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {value ? (
            <img src={value} alt="Preview" />
          ) : uploading ? (
            <Loader size={20} className="spin" />
          ) : (
            <>
              <Upload size={18} />
              <span>Upload</span>
            </>
          )}
        </button>

        <div className="image-upload-meta">
          <input
            className="url-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
          />
          <p className="field-hint">
            <ImageIcon size={13} /> {hint}
          </p>
          {value && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>
              <X size={14} /> Remove image
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        disabled={uploading}
        onChange={handleFile}
      />
    </div>
  );
}
