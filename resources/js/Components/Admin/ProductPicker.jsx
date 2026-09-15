import { useMemo, useState } from 'react';
import ImageSlot from '@/Components/ImageSlot';
import { publishedProducts } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

// A type-to-filter picker instead of a plain <select> — a <select> with a
// few thousand products in it is unusable (no search, slow to scroll,
// nothing to visually confirm you picked the right one). This scales to
// however large the catalog gets.
export default function ProductPicker({ value, onSelect }) {
  const { products } = useStore();
  const catalog = useMemo(() => publishedProducts(products), [products]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? catalog.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) : catalog;
    return pool.slice(0, 8);
  }, [query, catalog]);

  function pick(p) {
    onSelect(p);
    setQuery('');
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--color-divider)', padding: '6px 10px' }}>
          <div style={{ width: 30, height: 36, flex: 'none', position: 'relative', overflow: 'hidden', background: 'var(--color-surface)' }}>
            <ImageSlot src={value.images?.card || value.images?.main} placeholder="" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value.name}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>{value.sku}</div>
          </div>
          <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: 0, flex: 'none' }} onClick={() => onSelect(null)}>Change</button>
        </div>
      ) : (
        <>
          <input
            className="input"
            placeholder="Search products by name or SKU…"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          />
          {open && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)}></div>
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 11, background: 'var(--color-bg)', border: '1px solid var(--color-divider)', boxShadow: 'var(--shadow-md)', maxHeight: 260, overflowY: 'auto' }}>
                {matches.length === 0 && <div className="text-muted" style={{ padding: 10, fontSize: 13 }}>No products match "{query}".</div>}
                {matches.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => pick(p)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'none', border: 'none', borderBottom: '1px solid var(--color-divider)', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ width: 28, height: 34, flex: 'none', position: 'relative', overflow: 'hidden', background: 'var(--color-surface)' }}>
                      <ImageSlot src={p.images?.card || p.images?.main} placeholder="" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{p.sku} · {p.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
