interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)} className="page-btn">
        ‹ Prev
      </button>
      <span className="page-info">{page} / {pages}</span>
      <button disabled={page === pages} onClick={() => onChange(page + 1)} className="page-btn">
        Next ›
      </button>
    </div>
  );
}
