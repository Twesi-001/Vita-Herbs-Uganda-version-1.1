import { createContext, useContext } from 'react';

export type AuthState = 'loading' | 'out' | 'in';

export interface AdminAuthValue {
  authState: AuthState;
  /** Resolves to an error message, or null on success. */
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
}

/** Kept apart from the provider component so Fast Refresh isn't broken by a
 *  module that exports both a component and non-component values. */
export const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}
