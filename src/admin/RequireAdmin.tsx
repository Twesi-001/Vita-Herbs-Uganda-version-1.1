import type { ReactNode } from 'react';
import { useAdminAuth } from './adminAuthContext';
import LoginPage from './pages/LoginPage';

/**
 * Gates the whole admin subtree. Login isn't a route of its own — it renders
 * *instead of* the shell whenever there's no valid session, so no URL (including
 * a deep link like /admin/reviews) can slip past it. After signing in, the user
 * lands on whatever route they originally asked for.
 */
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { authState } = useAdminAuth();

  if (authState === 'loading') {
    return (
      <div className="admin-splash">
        <div className="splash-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (authState === 'out') return <LoginPage />;

  return <>{children}</>;
}
