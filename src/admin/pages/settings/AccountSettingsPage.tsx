import { useState, type FormEvent } from 'react';
import { Check, Loader } from 'lucide-react';
import { apiFetch } from '../../../lib/adminFetch';

export default function AccountSettingsPage() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (form.next !== form.confirm) {
      setError('New passwords do not match');
      return;
    }
    if (form.next.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await apiFetch('/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });
      setSuccess(true);
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: 520 }}>
      <div className="panel-head">
        <h2>Change Password</h2>
      </div>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="field">
          <label htmlFor="pw-current">Current Password</label>
          <input
            id="pw-current"
            type="password"
            value={form.current}
            onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))}
            required
            autoComplete="current-password"
          />
        </div>
        <div className="field">
          <label htmlFor="pw-next">New Password</label>
          <input
            id="pw-next"
            type="password"
            value={form.next}
            onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
          />
        </div>
        <div className="field">
          <label htmlFor="pw-confirm">Confirm New Password</label>
          <input
            id="pw-confirm"
            type="password"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            required
            autoComplete="new-password"
          />
        </div>
        {error && <p className="login-error">{error}</p>}
        {success && (
          <p className="pw-success"><Check size={15} /> Password updated successfully</p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><Loader size={16} className="spin" /> Saving…</> : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
