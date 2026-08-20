import { API_URL } from './api';
import { clearToken, getToken, notifyUnauthorized } from './adminAuth';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Attaches the bearer token, and JSON content-type unless the body is FormData. */
function buildHeaders(init: RequestInit): Headers {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  // FormData must set its own multipart boundary — never override its content-type.
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return headers;
}

/**
 * A 401 means the 12h JWT expired or was revoked. Clear it and let the auth
 * context swap in the login screen, rather than leaving the page half-broken.
 */
function handleUnauthorized(): never {
  clearToken();
  notifyUnauthorized();
  throw new ApiError(401, 'Your session has expired. Please sign in again.');
}

/**
 * JSON request against the API. `path` is relative to API_URL, e.g. '/admin/products'.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { ...init, headers: buildHeaders(init) });

  if (res.status === 401) handleUnauthorized();

  // 204s and empty bodies are valid; don't try to parse them.
  const text = await res.text();
  let payload: unknown;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      // Non-JSON error pages (proxy timeouts, HTML 500s) shouldn't surface as a parse error.
      if (!res.ok) throw new ApiError(res.status, res.statusText || 'Request failed');
      throw new ApiError(res.status, 'Unexpected response from the server');
    }
  }

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : payload && typeof payload === 'object' && 'error' in payload
          ? String((payload as { error: unknown }).error)
          : res.statusText || 'Request failed';
    throw new ApiError(res.status, message);
  }

  return payload as T;
}

/** Binary download (CSV exports). Returns the Blob rather than parsing JSON. */
export async function apiFetchBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  const res = await fetch(`${API_URL}${path}`, { ...init, headers: buildHeaders(init) });
  if (res.status === 401) handleUnauthorized();
  if (!res.ok) throw new ApiError(res.status, res.statusText || 'Download failed');
  return res.blob();
}

/** Uploads a single file to an endpoint that responds with `{ url }`. */
export async function uploadFile(path: string, file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const data = await apiFetch<{ url?: string }>(path, { method: 'POST', body });
  if (!data?.url) throw new ApiError(500, 'Upload succeeded but no URL was returned');
  return data.url;
}
