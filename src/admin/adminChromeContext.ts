import { createContext, useContext } from 'react';

export interface ChromeValue {
  /** Re-reads the sidebar badge counts and the pending-review bell. */
  refreshCounts: () => void;
}

export const ChromeContext = createContext<ChromeValue>({ refreshCounts: () => {} });

/** Lets a page refresh the sidebar counts after it creates or deletes something. */
export function useAdminChrome(): ChromeValue {
  return useContext(ChromeContext);
}
