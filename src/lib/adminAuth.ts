/**
 * Admin auth primitives.
 *
 * These used to live inside the AdminDashboard component, which meant nothing
 * else could read the token. They're module-level now so every admin page and
 * the shared fetch wrapper can use them.
 */

const TOKEN_KEY = 'adminToken';

/** Fired when any admin request comes back 401, so the auth context can sign out. */
export const UNAUTHORIZED_EVENT = 'admin:unauthorized';

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setToken(value: string): void {
  localStorage.setItem(TOKEN_KEY, value);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function notifyUnauthorized(): void {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}
