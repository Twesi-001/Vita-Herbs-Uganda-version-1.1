import { useState, type FormEvent } from 'react';
import { Loader } from 'lucide-react';
import { useAdminAuth } from '../adminAuthContext';

export default function LoginPage() {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const message = await login(username, password);
    if (message) {
      setError(message);
      setSubmitting(false);
    }
    // On success the auth state flips to 'in' and this screen unmounts.
  };

  return (
    <div className="admin-login-page">
      <div className="login-box">
        <div className="login-logo">
          <img src="/assets/logo.jpeg" alt="Kar Organics logo" className="login-logo-img" />
          <p>Admin Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoFocus
            />
          </div>
          <div className="login-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? (
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
