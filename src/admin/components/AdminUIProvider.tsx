import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, X } from 'lucide-react';
import { AdminUIContext, type ConfirmOptions } from './adminUIContext';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

/**
 * Replaces the scattered `window.confirm` / `alert` calls with a styled,
 * promise-based confirm and a toast stack. Both render through a portal on
 * document.body so a panel's `overflow: hidden` can never clip them.
 */
export function AdminUIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const nextId = useRef(0);

  const pushToast = useCallback((type: Toast['type'], message: string) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, type, message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4000);
  }, []);

  const toast = useMemo(
    () => ({
      success: (message: string) => pushToast('success', message),
      error: (message: string) => pushToast('error', message),
    }),
    [pushToast],
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    setPending(options);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setPending(null);
  }, []);

  const value = useMemo(() => ({ confirm, toast }), [confirm, toast]);

  return (
    <AdminUIContext.Provider value={value}>
      {children}

      {pending &&
        createPortal(
          <div className="confirm-backdrop" onClick={() => settle(false)} role="presentation">
            <div
              className="confirm-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`confirm-icon ${pending.destructive ? 'is-destructive' : ''}`}>
                <AlertTriangle size={20} />
              </div>
              <h3 id="confirm-title">{pending.title}</h3>
              {pending.description && <p>{pending.description}</p>}
              <div className="confirm-actions">
                <button className="btn btn-ghost" onClick={() => settle(false)}>Cancel</button>
                <button
                  className={`btn ${pending.destructive ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => settle(true)}
                  autoFocus
                >
                  {pending.confirmLabel ?? 'Confirm'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {toasts.length > 0 &&
        createPortal(
          <div className="toast-stack">
            {toasts.map((t) => (
              <div key={t.id} className={`toast toast--${t.type}`}>
                {t.type === 'success' ? <Check size={16} /> : <X size={16} />}
                <span>{t.message}</span>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </AdminUIContext.Provider>
  );
}
