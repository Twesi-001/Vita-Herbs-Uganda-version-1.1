import { useState, useEffect } from 'react';
import { API_URL } from '../lib/api';

type ContentMap = Record<string, string>;

let _cache: ContentMap | null = null;
let _promise: Promise<ContentMap> | null = null;

function getContent(): Promise<ContentMap> {
  if (_cache) return Promise.resolve(_cache);
  if (!_promise) {
    _promise = fetch(`${API_URL}/content`)
      .then((r) => r.json())
      .then((data) => { _cache = data; return data as ContentMap; })
      .catch(() => ({} as ContentMap));
  }
  return _promise;
}

export function useSiteContent() {
  const [map, setMap] = useState<ContentMap>(_cache ?? {});

  useEffect(() => {
    getContent().then(setMap);
  }, []);

  return (key: string, fallback = '') => map[key] ?? fallback;
}
