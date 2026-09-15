const PAGE_SIZES = [10, 25, 50];

// Client-side pagination for admin tables that need to stay usable once
// the catalog is in the thousands, not just the handful of seed rows.
export default function Pagination({ page, pageCount, pageSize, total, onPageChange, onPageSizeChange }) {
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }} className="text-muted">
        <span>Rows per page</span>
        <select className="input" style={{ minHeight: 30, padding: '2px 8px', width: 70 }} value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="text-muted" style={{ fontSize: 12.5 }}>{start}–{end} of {total}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-icon btn-secondary" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
          </button>
          <button className="btn btn-icon btn-secondary" aria-label="Next page" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
