import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../lib/adminFetch';

export interface AdminResource<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** Patch the cached value without a round trip (optimistic list updates). */
  setData: (next: T) => void;
}

/**
 * Fetches one admin endpoint. Replaces the old `loadAll()`, which refetched all
 * seven endpoints after every mutation — changing a review's status shouldn't
 * reload products, videos and the whole content map.
 *
 * Pass `null` to skip fetching (e.g. a form page in create mode).
 */
export function useAdminResource<T>(path: string | null): AdminResource<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(path !== null);
  const [error, setError] = useState<string | null>(null);
  // Bumped per request so a slow earlier response can't overwrite a newer one.
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (path === null) {
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(path);
      if (id === requestId.current) setData(result);
    } catch (err) {
      if (id === requestId.current) {
        setError(err instanceof Error ? err.message : 'Request failed');
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    // Fetching on mount is the canonical use of an effect — synchronising with
    // an external system. The lint rule flags it because `load` flips `loading`
    // before awaiting, which is the intended behaviour here, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return { data, loading, error, refetch: load, setData };
}
