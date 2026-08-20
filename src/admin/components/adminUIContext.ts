import { createContext, useContext } from 'react';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export interface AdminUIValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
  };
}

/** Separate from the provider component to keep Fast Refresh working. */
export const AdminUIContext = createContext<AdminUIValue | null>(null);

export function useAdminUI(): AdminUIValue {
  const ctx = useContext(AdminUIContext);
  if (!ctx) throw new Error('useAdminUI must be used within an AdminUIProvider');
  return ctx;
}

export function useToast() {
  return useAdminUI().toast;
}

export function useConfirm() {
  return useAdminUI().confirm;
}
