import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Loader, Search } from 'lucide-react';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Enables the search box; the predicate decides what a row matches on. */
  search?: {
    placeholder?: string;
    matches: (row: T, query: string) => boolean;
  };
  /** Extra filter controls, rendered beside the search box. */
  toolbar?: ReactNode;
  empty?: { icon?: ReactNode; title: string; description?: string; action?: ReactNode };
  pageSize?: number;
}

/**
 * The single list-table used across the admin. Replaces four near-identical
 * copies of a table + pagination block, and owns filtering/paging so pages
 * only declare their columns.
 */
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  onRetry,
  search,
  toolbar,
  empty,
  pageSize = 10,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);

  // Searching from page 3 used to leave you on an empty page — the old code
  // never reset pagination when the query changed. Adjusted during render
  // rather than in an effect so there's no flash of the stale page.
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setPage(1);
  }

  useEffect(() => {
    if (!search) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [search]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !search) return rows;
    return rows.filter((row) => search.matches(row, q));
  }, [rows, query, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="panel">
      {(search || toolbar) && (
        <div className="table-toolbar">
          {search && (
            <div className="search-box">
              <Search size={16} />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={search.placeholder ?? 'Search…'}
              />
              <kbd className="search-kbd">Ctrl K</kbd>
            </div>
          )}
          {toolbar}
        </div>
      )}

      {loading ? (
        <div className="table-status">
          <Loader size={22} className="spin" />
          <p>Loading…</p>
        </div>
      ) : error ? (
        <div className="table-status">
          <p className="table-error">{error}</p>
          {onRetry && (
            <button className="btn btn-outline" onClick={onRetry}>Try again</button>
          )}
        </div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              {/* Only the body is swapped for the empty state, so the search box
                  and filters that produced an empty result stay reachable. */}
              {paged.length > 0 && (
                <tbody>
                  {paged.map((row) => (
                    <tr key={rowKey(row)}>
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {paged.length === 0 && (
            <EmptyState
              icon={empty?.icon}
              title={query ? 'No matches for your search' : (empty?.title ?? 'Nothing here yet')}
              description={query ? undefined : empty?.description}
              action={query ? undefined : empty?.action}
            />
          )}

          <Pagination page={safePage} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
